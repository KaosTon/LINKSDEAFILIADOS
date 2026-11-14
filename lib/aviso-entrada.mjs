// Aviso de entrada na comunidade (10/11/2026).
//
// Em comunidade do WhatsApp, quem entra vê o grupo de Avisos vazio até um admin enviar o
// histórico. O fluxo 05 olha a lista de participantes a cada 5 minutos e avisa no rascunho
// quando entra gente, para o dono enviar o histórico. Só o resumo (hash) do telefone fica
// guardado, nunca o número.
import crypto from 'node:crypto';

export function idDoMembro(telefone) {
  const t = String(telefone || '');
  return crypto ? crypto.createHash('sha256').update('membro:' + t).digest('hex').slice(0, 12) : t.slice(-6);
}

/**
 * Compara a lista de agora com a guardada e devolve quantos entraram. A primeira leitura só guarda.
 * Conta no máximo o que o total cresceu: se a Z-API trocar o jeito de identificar alguém, não vira aviso.
 */
export function novosNoGrupo(mem, participantes) {
  if (!Array.isArray(participantes) || !participantes.length) return 0;
  const ids = [...new Set(participantes.map(idDoMembro))];
  const antes = Array.isArray(mem.entradaIds) ? mem.entradaIds : null;
  mem.entradaIds = ids;
  if (!antes) return 0;
  const a = new Set(antes);
  return Math.max(0, Math.min(ids.filter(x => !a.has(x)).length, ids.length - antes.length));
}

/** Qual grupo vigiar: AVISO_ENTRADA_GRUPO, ou o último de GRUPO_OFERTAS quando há mais de um (a comunidade); 0 desliga. */
export function grupoDoAvisoDeEntrada(env) {
  const v = String((env && env.AVISO_ENTRADA_GRUPO) || '').trim();
  if (v === '0') return '';
  if (v) return v;
  const g = [...new Set(String((env && env.GRUPO_OFERTAS) || '').split(/[\s,;]+/).map(x => x.trim()).filter(Boolean))];
  return g.length > 1 ? g[g.length - 1] : '';
}

const horaSP = (agora) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }).format(agora));
/** Das 7h às 23h. Fora disso nem lê a lista, então quem entrou de madrugada vira aviso às 7h. */
export const horaDoAvisoDeEntrada = (agora) => horaSP(agora) >= 7 && horaSP(agora) < 23;

export function textoEntrada(n, total) {
  return [`\u{1F44B} *${n === 1 ? 'Entrou 1 pessoa' : `Entraram ${n} pessoas`} na comunidade* (agora ${total})`, '',
    'Quem entra vê o grupo vazio. Abra o grupo de Avisos e envie o histórico de mensagens para quem chegou.'].join('\n');
}

/** Participantes do grupo pela Z-API (light-group-metadata, só leitura). */
export async function participantesDoGrupo(http, env, grupo) {
  if (!env.ZAPI_BASE_URL || !env.ZAPI_INSTANCE_ID || !env.ZAPI_INSTANCE_TOKEN) return null;
  const raiz = `${String(env.ZAPI_BASE_URL).replace(/\/+$/, '')}/instances/${env.ZAPI_INSTANCE_ID}/token/${env.ZAPI_INSTANCE_TOKEN}`;
  const r = await http.httpRequest({ method: 'GET', url: `${raiz}/light-group-metadata/${encodeURIComponent(grupo)}`, json: true, timeout: 15000,
    headers: env.ZAPI_CLIENT_TOKEN ? { 'client-token': env.ZAPI_CLIENT_TOKEN } : {} });
  return r && Array.isArray(r.participants) ? r.participants.map(x => (x && (x.phone || x.lid)) || JSON.stringify(x)) : null;
}

/**
 * Boas-vindas (14/11, pedido do Wellington): nos dias em que entrou gente, a mensagem das 19h (o convite
 * para compartilhar) ganha uma linha de boas-vindas no topo. Sem mensagem extra no grupo e sem privado.
 * Quem chegou = está na comunidade agora e não estava na última lista guardada pelo resumo (22h de ontem).
 */
export function chegaramDesde(idsAntes, participantesAgora) {
  if (!Array.isArray(idsAntes) || !idsAntes.length || !Array.isArray(participantesAgora)) return 0;
  const antes = new Set(idsAntes);
  return [...new Set(participantesAgora.map(idDoMembro))].filter(x => !antes.has(x)).length;
}

export function boasVindas(texto, novos) {
  if (!novos) return texto;
  return ['\u{1F44B} *Boas-vindas a quem chegou hoje!*',
    'As ofertas saem das 8h às 22h. Se preferir, silencie o grupo e confira quando quiser.', '', texto].join('\n');
}
