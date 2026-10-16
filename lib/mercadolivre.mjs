// Acesso à API do Mercado Livre (OAuth) para conferir preço, foto e estoque.
//
// O dono autoriza uma vez pelo link do fluxo 04 (ml-autorizar). O ML devolve
// um código no ml-retorno, que vira token (6 horas) e refresh token. O próprio
// fluxo 04 renova de hora em hora e entrega o token aos outros fluxos pelo
// ml-token, que só responde a quem sabe a chave derivada do ML_SECRET.
//
// Só a conta que autorizou primeiro fica: alguém que ache o link e autorize
// a própria conta não troca o acesso do robô.
import crypto from 'node:crypto';
import nodeUrl from 'node:url';

// No nó Code do n8n não existe URL global: vem do módulo 'url' (ver lib/ofertas.mjs).
const URLM = typeof URL !== 'undefined' ? URL : nodeUrl.URL;
const PARAMS = typeof URLSearchParams !== 'undefined' ? URLSearchParams : nodeUrl.URLSearchParams;

export const ML_AUTH = 'https://auth.mercadolivre.com.br/authorization';
export const ML_API = 'https://api.mercadolibre.com';
const VALIDADE_ESTADO = 15 * 60 * 1000;
const RENOVA_ANTES = 2 * 60 * 60 * 1000;

export function linkAutorizacao(appId, retorno, estado) {
  const u = new URLM(ML_AUTH);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('client_id', String(appId));
  u.searchParams.set('redirect_uri', retorno);
  u.searchParams.set('state', estado);
  return u.toString();
}

export function novoEstado(mem, agora, sorteio = () => crypto.randomBytes(16).toString('hex')) {
  mem.estados = (mem.estados || []).filter(e => agora - e.t < VALIDADE_ESTADO).slice(-9);
  const s = sorteio();
  mem.estados.push({ s, t: agora });
  return s;
}

// Cada estado vale uma vez só, por 15 minutos.
export function usarEstado(mem, s, agora) {
  const antes = mem.estados || [];
  const achou = antes.find(e => e.s === String(s || '') && agora - e.t < VALIDADE_ESTADO);
  mem.estados = antes.filter(e => e !== achou && agora - e.t < VALIDADE_ESTADO);
  return !!achou;
}

export function chaveInterna(segredo) {
  return crypto.createHash('sha256').update('ml-token:' + String(segredo || '')).digest('hex');
}

export function guardarToken(mem, tok, agora) {
  if (!tok || !tok.access_token || !tok.refresh_token) return { ok: false, motivo: 'resposta_sem_token' };
  const usuario = String(tok.user_id || '');
  if (mem.ml && mem.ml.usuario && usuario && mem.ml.usuario !== usuario) return { ok: false, motivo: 'outra_conta' };
  mem.ml = { usuario: usuario || (mem.ml && mem.ml.usuario) || '', token: tok.access_token, refresh: tok.refresh_token,
    expira: agora + (Number(tok.expires_in) || 21600) * 1000, escopo: tok.scope || '', renovado: agora };
  return { ok: true, usuario: mem.ml.usuario };
}

export const precisaRenovar = (mem, agora) => !!(mem.ml && mem.ml.refresh) && mem.ml.expira - agora < RENOVA_ANTES;
export const tokenValido = (mem, agora) => (mem.ml && mem.ml.token && mem.ml.expira - agora > 60000 ? mem.ml.token : null);

// pedir({ method, url, form }) devolve { status, corpo } sem estourar em erro HTTP.
export function redeML(http) {
  return async ({ method, url, form, token }) => {
    const headers = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    let body;
    if (form) { headers['Content-Type'] = 'application/x-www-form-urlencoded'; body = new PARAMS(form).toString(); }
    const r = await http.httpRequest({ method, url, headers, body, json: false, returnFullResponse: true,
      ignoreHttpStatusErrors: true, timeout: 15000 });
    let corpo = r.body;
    if (typeof corpo === 'string') { try { corpo = JSON.parse(corpo); } catch (e) { /* texto */ } }
    return { status: r.statusCode, corpo };
  };
}

export async function trocarCodigo(pedir, { appId, segredo, retorno, codigo }) {
  const r = await pedir({ method: 'POST', url: ML_API + '/oauth/token', form: {
    grant_type: 'authorization_code', client_id: appId, client_secret: segredo, code: codigo, redirect_uri: retorno } });
  return r.status === 200 ? r.corpo : null;
}

export async function renovar(pedir, mem, { appId, segredo }, agora) {
  if (!mem.ml || !mem.ml.refresh) return { ok: false, motivo: 'sem_autorizacao' };
  const r = await pedir({ method: 'POST', url: ML_API + '/oauth/token', form: {
    grant_type: 'refresh_token', client_id: appId, client_secret: segredo, refresh_token: mem.ml.refresh } });
  if (r.status !== 200) {
    mem.ml.erro = { status: r.status, quando: agora, msg: String((r.corpo && (r.corpo.error || r.corpo.message)) || '').slice(0, 80) };
    return { ok: false, motivo: 'ml_recusou', status: r.status };
  }
  return guardarToken(mem, r.corpo, agora);
}

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function pagina(titulo, texto, botao) {
  const b = botao ? `<p><a href="${esc(botao.url)}" style="display:inline-block;background:#3483fa;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:600">${esc(botao.texto)}</a></p>` : '';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titulo)}</title></head>`
    + `<body style="font-family:system-ui,sans-serif;max-width:480px;margin:48px auto;padding:0 16px;color:#222;background:#fff"><h1 style="font-size:22px">${esc(titulo)}</h1><p>${esc(texto)}</p>${b}</body></html>`;
}
