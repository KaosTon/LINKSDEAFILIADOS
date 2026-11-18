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

/**
 * Aviso de entrada ou saída que o WhatsApp manda pela Z-API na hora (18/11). Em 17/11 uma pessoa entrou às
 * 22h15 e saiu às 22h17, e a lista de participantes ainda mostrava ela mais de uma hora depois: o relatório
 * disse que ela continuava. Devolve { tipo, ids, quando } só com o resumo de quem entrou ou saiu, ou null
 * quando o aviso é de outro grupo ou não é de movimento.
 * Entrou: pelo link (GROUP_PARTICIPANT_INVITE) ou adicionado (GROUP_PARTICIPANT_ADD).
 * Saiu: por conta própria (GROUP_PARTICIPANT_LEAVE) ou removido (GROUP_PARTICIPANT_REMOVE).
 */
const MOVIMENTO = { GROUP_PARTICIPANT_INVITE: 'entrou', GROUP_PARTICIPANT_ADD: 'entrou', GROUP_PARTICIPANT_LEAVE: 'saiu', GROUP_PARTICIPANT_REMOVE: 'saiu' };
export function movimentoDoAviso(body, grupo, agoraMs = Date.now()) {
  const b = body || {};
  const tipo = Object.prototype.hasOwnProperty.call(MOVIMENTO, String(b.notification || '')) ? MOVIMENTO[String(b.notification)] : null;
  if (!tipo || !grupo || String(b.phone || '').trim() !== String(grupo).trim()) return null;
  // Quem entrou ou saiu vem em notificationParameters. Em adicionar e remover, participantPhone é o admin
  // que fez a ação, por isso só vale quando a lista vem vazia.
  const lista = Array.isArray(b.notificationParameters) && b.notificationParameters.length ? b.notificationParameters : [b.participantPhone];
  // O mesmo formato da lista de participantes (só dígitos), para o resumo bater com o das fichas.
  const tels = lista.map(x => String(x == null ? '' : x).replace(/\D/g, '')).filter(x => /^\d{10,15}$/.test(x));
  // Só resumo sai daqui: se o crypto faltar, idDoMembro devolve um pedaço do número, e esse não passa.
  const ids = [...new Set(tels.map(idDoMembro))].filter(x => /^[a-f0-9]{12}$/.test(x));
  if (!ids.length) return null;
  const t = Number(b.momment);
  return { tipo, ids, quando: new Date(Number.isFinite(t) && t > 1e12 && t < agoraMs + 5 * 60e3 ? t : agoraMs).toISOString() };
}

const horaSP = (agora) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }).format(agora));
/** Das 7h às 23h. Fora disso nem lê a lista, então quem entrou de madrugada vira aviso às 7h. */
export const horaDoAvisoDeEntrada = (agora) => horaSP(agora) >= 7 && horaSP(agora) < 23;

export function textoEntrada(n, total) {
  return [`\u{1F44B} *${n === 1 ? 'Entrou 1 pessoa' : `Entraram ${n} pessoas`} na comunidade* (agora ${total})`, '',
    'Quem entra vê o grupo vazio. Abra o grupo de Avisos e envie o histórico de mensagens para quem chegou.'].join('\n');
}

/**
 * Marco de membros (15/11): aos 100 na comunidade, uma vez só, o aviso de entrada lembra de ligar a
 * foto em cena em todos os posts (combinado com o Wellington: até lá, só nos 5 destaques do dia).
 */
export function avisoDoMarco(mem, total, marco = 100) {
  if (!(total >= marco) || (mem.marcos || []).includes(marco)) return null;
  mem.marcos = [...(mem.marcos || []), marco];
  return [`\u{1F389} *Chegamos a ${marco} membros!*`, '',
    'Combinado de 15/11: hora de ligar a foto em cena em todos os posts.',
    'No Railway: GARIMPO_CENA_POR_DIA=80 e GARIMPO_CENA_INTERVALO=0 (custa uns R$ 0,19 por foto).'].join('\n');
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

/**
 * De onde veio quem entrou (14/11, pedido do Wellington: "avisar quando converter"). O encurtador guarda a
 * hora de cada clique no convite e a origem (?de=). O clique mais recente nos 20 minutos antes do aviso é a
 * origem provável. Três ou mais cliques no mesmo segundo são robô (prévia de link abrindo todos os botões).
 */
const ORIGENS = [
  [/^anuncio:(.+)$/, (m) => `anúncio ${m[1]} (Meta)`], [/^anuncio$/, () => 'anúncio (Meta)'],
  [/^home(:.*)?$/, () => 'site, página inicial'], [/^post:(.+)$/, (m) => `blog, post "${m[1]}"`],
  [/^guia:(.+)$/, (m) => `site, guia "${m[1]}"`], [/^links$/, () => 'link da bio do Instagram'],
  [/^indicacao$/, () => 'indicação (alguém compartilhou o convite)'], [/^status$/, () => 'status do WhatsApp'],
  [/^facebook$/, () => 'Facebook'], [/^direto$/, () => 'link direto do convite'],
];
export function nomeDaOrigem(de) {
  const d = String(de || '');
  for (const [re, f] of ORIGENS) { const m = d.match(re); if (m) return f(m); }
  return `site (${d || 'sem nome'})`;
}

export function provavelOrigem(recentes, agora, janelaMin = 20) {
  const fim = agora.getTime(), ini = fim - janelaMin * 60e3;
  const lista = (Array.isArray(recentes) ? recentes : []).map(x => ({ t: Date.parse(x && x.quando), de: x && x.de }))
    .filter(x => x.t >= ini && x.t <= fim);
  const humanos = lista.filter(x => lista.filter(y => Math.abs(y.t - x.t) < 1000).length < 3);
  if (!humanos.length) return null;
  const u = humanos.sort((a, b) => b.t - a.t)[0];
  return { de: u.de, nome: nomeDaOrigem(u.de), minutos: Math.max(0, Math.round((fim - u.t) / 60e3)) };
}

export function linhaDaOrigem(o) {
  return o ? `\u{1F4CD} Origem provável: *${o.nome}* (clicou no convite ${o.minutos <= 1 ? 'agora há pouco' : `${o.minutos} min antes`})`
    : '\u{1F4CD} Origem: não deu para saber (ninguém clicou no convite pelo site nos 20 min antes; pode ter vindo de link compartilhado)';
}
