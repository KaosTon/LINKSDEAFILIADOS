import crypto from 'node:crypto';

/**
 * Conversão do site para a Meta (16/11). Os anúncios otimizavam por "visualização da página": a Meta
 * achava quem clica fácil (R$ 0,16 o clique) e quase ninguém entrava no grupo (3 de 53 no dia 15/11).
 * O pixel do site só roda com "Aceitar" nos cookies (1 em 8 visitas), e a Meta viu 4 cliques em
 * "Entrar" em 3 dias: pouco para aprender. Agora quem veio de anúncio e clica em "Entrar no grupo"
 * vira um evento Lead na API de Conversões, mandado pelo servidor, sem cookie.
 *
 * Caminho: o site gera um id do clique (o mesmo do pixel, para a Meta não contar duas vezes) e manda
 * junto o código do clique no anúncio (fbc, que vem do fbclid do link) para o encurtador
 * (temdescontos.com.br/grupo). O encurtador assina e repassa para o fluxo 07 do n8n, que confere a
 * assinatura e manda para a Meta com o token (só o n8n tem o token). Quem escolheu "Apenas essenciais"
 * no aviso de cookies não manda nada (o site não põe o id no link).
 *
 * A assinatura é feita em encurtador/conversao.mjs com o mesmo texto (textoAssinado): a bateria
 * confere que os dois lados batem.
 */
// Pixel "Tem Descontos - site" (o mesmo de site/src/lib/medicao.ts; nunca o da Virtus), escrito dentro do endereço.
export const URL_EVENTOS = 'https://graph.facebook.com/v21.0/1724280369336369/events';
export const PIXEL_TD = URL_EVENTOS.split('/')[4];
export const SITE_TD = 'https://www.temdescontos.com.br';
const RE = {
  ev: /^[a-z0-9]{8,40}$/,
  de: /^[a-z0-9:-]{1,60}$/,
  fbc: /^fb\.1\.\d{10,13}\.[A-Za-z0-9_-]{10,500}$/,
  fbp: /^fb\.1\.\d{10,13}\.\d{5,25}$/,
  ip: /^[0-9a-fA-F:.]{3,45}$/,
};

export function textoAssinado(c) {
  return ['conversao', c.ev, c.t, c.de, c.fbc || '', c.fbp || '', c.ip || '', c.ua || ''].join('|');
}

export function assinarConversao(c, segredo) {
  return crypto.createHmac('sha256', String(segredo)).update(textoAssinado(c)).digest('hex');
}

/** Confere o pedido do encurtador: campos no formato, assinatura certa e feito há no máximo 10 minutos. */
export function conferirConversao(c, assinatura, segredo, agoraMs = Date.now()) {
  if (!crypto || !segredo) return { ok: false, motivo: 'sem_segredo' };
  if (!c || typeof c !== 'object') return { ok: false, motivo: 'sem_corpo' };
  if (!RE.ev.test(String(c.ev || '')) || !RE.de.test(String(c.de || ''))) return { ok: false, motivo: 'campos' };
  if (!Number.isFinite(c.t) || Math.abs(agoraMs - c.t) > 10 * 60 * 1000) return { ok: false, motivo: 'fora_do_prazo' };
  if (c.fbc && !RE.fbc.test(c.fbc)) return { ok: false, motivo: 'fbc' };
  if (c.fbp && !RE.fbp.test(c.fbp)) return { ok: false, motivo: 'fbp' };
  if (c.ip && !RE.ip.test(c.ip)) return { ok: false, motivo: 'ip' };
  const certa = assinarConversao(c, segredo), veio = String(assinatura || '');
  if (veio.length !== certa.length || !crypto.timingSafeEqual(Buffer.from(veio), Buffer.from(certa))) return { ok: false, motivo: 'assinatura' };
  return { ok: true };
}

/** O mesmo clique não vai duas vezes (o encurtador pode repetir; o WhatsApp às vezes abre o link duas vezes). */
export function jaEnviado(mem, ev, agoraMs = Date.now()) {
  const lista = (mem.conversoes || []).filter(x => agoraMs - x.t < 2 * 864e5);
  const repetido = lista.some(x => x.ev === ev);
  if (!repetido) lista.push({ ev, t: agoraMs });
  mem.conversoes = lista.slice(-500);
  return repetido;
}

/** O evento Lead no formato da API de Conversões (site). fbc, fbp, IP e navegador vão sem hash, como a Meta pede. */
export function eventoLead(c) {
  const codigo = String(c.de).startsWith('anuncio:') ? String(c.de).slice(8) : '';
  const user_data = { client_ip_address: c.ip || undefined, client_user_agent: c.ua || undefined, fbc: c.fbc || undefined, fbp: c.fbp || undefined };
  for (const k of Object.keys(user_data)) if (!user_data[k]) delete user_data[k];
  return {
    event_name: 'Lead', event_time: Math.floor(c.t / 1000), event_id: c.ev, action_source: 'website',
    event_source_url: `${SITE_TD}/entrar${codigo ? '?c=' + codigo : ''}`,
    user_data, custom_data: { content_name: c.de },
  };
}

/** O pedido para a Graph API. test_event_code (opcional) faz o evento aparecer em "Testar eventos" sem contar. */
export function pedidoEventos(eventos, token, testeCodigo = '') {
  const body = { data: JSON.stringify(eventos), access_token: token };
  if (testeCodigo) body.test_event_code = testeCodigo;
  return { method: 'POST', url: URL_EVENTOS, body, json: true, timeout: 20000, ignoreHttpStatusErrors: true };
}
