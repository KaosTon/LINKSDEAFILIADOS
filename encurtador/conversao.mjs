// Conversão do site para a Meta (16/11): quem veio de anúncio e clicou em "Entrar no grupo" vira um
// evento Lead, mandado pelo servidor (o pixel só roda com "Aceitar" nos cookies). O encurtador não tem
// o token da Meta: ele assina o clique e repassa para o fluxo 07 do n8n, que confere e manda.
// Nada disso fica guardado aqui: IP e navegador vão só no pedido, como a Meta pede para casar o clique.
// O texto assinado é o mesmo de lib/conversao-meta.mjs (a bateria confere).
import crypto from 'node:crypto';

export const URL_CONVERSAO = 'https://n8n-production-4226.up.railway.app/webhook/conversao-meta';
const RE = {
  ev: /^[a-z0-9]{8,40}$/,
  de: /^[a-z0-9:-]{1,60}$/,
  fbc: /^fb\.1\.\d{10,13}\.[A-Za-z0-9_-]{10,500}$/,
  fbp: /^fb\.1\.\d{10,13}\.\d{5,25}$/,
  ip: /^[0-9a-fA-F:.]{3,45}$/,
};

/**
 * Os campos do clique, ou null quando não é para mandar. Só manda com o id do clique (ev), que o site
 * só põe no link para quem veio de anúncio (fbc) ou clicou na página do anúncio, e nunca para quem
 * escolheu "Apenas essenciais".
 */
export function camposDoClique(u, headers, agoraMs = Date.now()) {
  const q = u.searchParams;
  const ev = q.get('ev') || '', de = q.get('de') || '';
  if (!RE.ev.test(ev) || !RE.de.test(de)) return null;
  const fbc = RE.fbc.test(q.get('fbc') || '') ? q.get('fbc') : '';
  const fbp = RE.fbp.test(q.get('fbp') || '') ? q.get('fbp') : '';
  if (!fbc && !de.startsWith('anuncio')) return null;
  const ipBruto = String((headers && headers['x-forwarded-for']) || '').split(',')[0].trim();
  const ip = RE.ip.test(ipBruto) ? ipBruto : '';
  const ua = String((headers && headers['user-agent']) || '').slice(0, 400);
  return { ev, t: agoraMs, de, fbc, fbp, ip, ua };
}

export function textoAssinado(c) {
  return ['conversao', c.ev, c.t, c.de, c.fbc || '', c.fbp || '', c.ip || '', c.ua || ''].join('|');
}

export function assinar(c, segredo) {
  return crypto.createHmac('sha256', String(segredo)).update(textoAssinado(c)).digest('hex');
}

/** Manda sem segurar o redirecionamento: falhou, a pessoa entra no grupo do mesmo jeito. */
export async function enviarConversao(c, segredo, url = URL_CONVERSAO, buscar = globalThis.fetch) {
  if (!c || !segredo || !buscar) return false;
  try {
    const r = await buscar(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-assinatura': assinar(c, segredo) },
      body: JSON.stringify(c), signal: AbortSignal.timeout(8000) });
    return !!(r && r.ok);
  } catch (e) { return false; }
}
