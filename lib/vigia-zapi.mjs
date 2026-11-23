// Vigia da Z-API (22/11/2026). Em 21/11, às 18h, o WhatsApp do robô desconectou da Z-API e ninguém
// soube até o dia seguinte: o grupo ficou sem ofertas, o rascunho não respondia e os avisos de entrada
// pararam. O fluxo 08 pergunta o estado da conexão a cada 10 minutos e avisa no celular do Wellington
// por push (ntfy), porque o próprio WhatsApp do robô não serve para avisar que ele caiu.
//
// Regras:
// - Caiu: avisa na 2a conferência seguida (20 min), para não gritar por uma piscada da conexão.
// - Continua fora: repete o aviso a cada AVISO_REPETIR_MIN (180) minutos.
// - Madrugada (23h às 7h): não toca; se ainda estiver fora às 7h, avisa.
// - Voltou: avisa por push e no rascunho, com quanto tempo ficou fora.
// - Z-API não responde (erro na consulta): avisa na 3a seguida, também com repetição.
// - Plano da Z-API vencendo em até 3 dias: avisa uma vez por dia.

const horaSPv = (ms) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }).format(new Date(ms)));
const hhmm = (ms) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
const ddmm = (ms) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' }).format(new Date(ms));
const diaV = (ms) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(ms));

export function duracao(ms) {
  const min = Math.max(0, Math.round(ms / 60e3));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** O estado que a Z-API devolveu em /status: true (conectado), false (desconectado) ou null (não deu para saber). */
export function lerStatusZapi(r) {
  if (!r || typeof r !== 'object' || r.erro) return null;
  if (r.connected === true) return true;
  if (r.connected === false) return false;
  return null;
}

/**
 * Decide o que fazer nesta conferência. Muda `mem` e devolve
 * { push: { titulo, texto, prioridade } | null, rascunho: texto | null }.
 */
export function decidirVigia(mem, conectado, agoraMs, cfg = {}) {
  const repetir = (Number(cfg.repetirMin) > 0 ? Number(cfg.repetirMin) : 180) * 60e3;
  const acordado = horaSPv(agoraMs) >= 7 && horaSPv(agoraMs) < 23;
  const saida = { push: null, rascunho: null };
  const podeRepetir = () => acordado && (!mem.avisadoEm || agoraMs - mem.avisadoEm >= repetir);

  if (conectado === true) {
    if (mem.avisadoEm && mem.caiuEm) {
      const fora = duracao(agoraMs - mem.caiuEm);
      const texto = `O WhatsApp do robô voltou às ${hhmm(agoraMs)}. Ficou fora ${fora} (desde ${hhmm(mem.caiuEm)} de ${ddmm(mem.caiuEm)}).`;
      saida.push = { titulo: 'Robô de ofertas voltou', texto, prioridade: 3 };
      saida.rascunho = `✅ ${texto} As ofertas voltam a sair sozinhas. Oferta mandada aqui enquanto ele estava fora não chegou: mande de novo.`;
    }
    mem.caiuEm = null; mem.quedas = 0; mem.erros = 0; mem.avisadoEm = null;
    return saida;
  }

  if (conectado === false) {
    mem.erros = 0;
    mem.caiuEm = mem.caiuEm || agoraMs;
    mem.quedas = (mem.quedas || 0) + 1;
    if (mem.quedas >= 2 && podeRepetir()) {
      mem.avisadoEm = agoraMs;
      saida.push = { titulo: 'Robô de ofertas desconectado', prioridade: 5,
        texto: `O WhatsApp do robô caiu às ${hhmm(mem.caiuEm)} de ${ddmm(mem.caiuEm)} (fora há ${duracao(agoraMs - mem.caiuEm)}). `
          + 'O grupo está sem ofertas e o rascunho não responde. Para voltar: painel da Z-API, Instâncias, QR code; '
          + 'no celular do robô, WhatsApp, Aparelhos conectados, Conectar um aparelho.' };
    }
    return saida;
  }

  // Não deu para saber (Z-API fora do ar, rede, chave errada).
  mem.erros = (mem.erros || 0) + 1;
  mem.caiuEm = mem.caiuEm || agoraMs;
  if (mem.erros >= 3 && podeRepetir()) {
    mem.avisadoEm = agoraMs;
    saida.push = { titulo: 'Robô de ofertas: Z-API não responde', prioridade: 4,
      texto: `Há ${duracao(agoraMs - mem.caiuEm)} o robô não consegue falar com a Z-API. Pode ser a Z-API fora do ar. `
        + 'Se o grupo estiver sem ofertas, confira a instância no painel da Z-API.' };
  }
  return saida;
}

/** Plano da Z-API vencendo em até 3 dias: um aviso por dia. `vence` em milissegundos. */
export function avisoDoVencimento(mem, vence, pago, agoraMs) {
  const v = Number(vence);
  if (!Number.isFinite(v) || v <= 0) return null;
  const falta = v - agoraMs;
  if (falta > 3 * 864e5 || mem.vencimentoDia === diaV(agoraMs) || horaSPv(agoraMs) < 9) return null;
  mem.vencimentoDia = diaV(agoraMs);
  const quando = falta <= 0 ? `venceu em ${ddmm(v)}` : `vence em ${ddmm(v)}`;
  return { titulo: 'Plano da Z-API vencendo', prioridade: 4,
    texto: `O plano da Z-API do robô ${quando}${pago && pago !== 'PAID' ? ` (situação: ${String(pago).slice(0, 20)})` : ''}. Sem ele, o robô para de postar.` };
}

/** O pedido para o ntfy (push no celular). Tópico só com letras, números, - e _. */
export function pedidoNtfy(topico, aviso) {
  const t = String(topico || '').trim();
  if (!aviso || !/^[A-Za-z0-9_-]{8,64}$/.test(t)) return null;
  return { method: 'POST', url: 'https://ntfy.sh/', json: true, timeout: 15000,
    body: { topic: t, title: aviso.titulo, message: aviso.texto, priority: aviso.prioridade || 3, tags: [aviso.prioridade >= 5 ? 'rotating_light' : 'white_check_mark'] } };
}
