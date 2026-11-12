// Feed do Instagram (12/11/2026): a oferta do dia (o mesmo card do status das 12h, no formato 4:5)
// vira um post no feed, uma vez por dia, com INSTAGRAM_FEED=sim. Entra no nó "Anota" do fluxo 03,
// que é pequeno; o card já exclui produto da Amazon (dadosDoStatus, lib/ofertas.mjs).

/** O card do status no formato do feed (1080x1350). Imagem que não é card (foto do produto) não vai. */
export function cardDoFeed(imagem) {
  const u = String(imagem || '');
  return /^https:\/\/\S+\/card\?d=/.test(u) ? `${u}&f=feed` : '';
}

/** Legenda do post: o nome do produto vem da 3ª linha da legenda do grupo. Sem link (no feed não clica). */
export function legendaDoFeed(oferta) {
  const nome = (String((oferta && oferta.texto) || '').split('\n')[2] || '').replace(/[*_~]/g, '').trim();
  if (!nome) return '';
  return [`\u{1F525} Oferta do dia: ${nome}`, '',
    'Preço visto hoje na loja. Pode mudar a qualquer momento.', '',
    '\u{1F449} O link do grupo grátis de ofertas no WhatsApp está na bio.', '',
    '#publi #ofertas #promocao #cupom #descontos'].join('\n');
}

/** Publica a imagem no feed pela Graph API: cria o contêiner, espera a Meta baixar e publica. */
export async function publicarNoFeed(http, env, imagem, legenda) {
  if (!env.META_IG_USER_ID || !env.META_ACCESS_TOKEN || !imagem || !legenda) return null;
  const raiz = `https://graph.facebook.com/v21.0/${encodeURIComponent(env.META_IG_USER_ID)}`;
  const c = await http.httpRequest({ method: 'POST', url: `${raiz}/media`, json: true, timeout: 60000,
    body: { image_url: imagem, caption: legenda, access_token: env.META_ACCESS_TOKEN } });
  if (!c || !c.id) return null;
  for (let i = 0; i < 6; i++) {
    const st = await http.httpRequest({ method: 'GET', json: true, timeout: 15000,
      url: `https://graph.facebook.com/v21.0/${c.id}?fields=status_code&access_token=${encodeURIComponent(env.META_ACCESS_TOKEN)}` });
    if (!st || st.status_code === 'FINISHED') break;
    if (st.status_code === 'ERROR') return null;
    if (typeof setTimeout === 'function') await new Promise(r => setTimeout(r, 5000));
  }
  const r = await http.httpRequest({ method: 'POST', url: `${raiz}/media_publish`, json: true, timeout: 60000,
    body: { creation_id: c.id, access_token: env.META_ACCESS_TOKEN } });
  return (r && r.id) || null;
}
