// Posts de conteúdo do Instagram (12/11/2026): dicas e datas que não vendem nada, para o perfil não ser
// só oferta. A agenda (data, imagem, legenda) é gerada por marketing/instagram/gerar.mjs e publicada com o
// site em /instagram/agenda.json; o fluxo 06 lê e posta o item do dia às 18h. Nada é escrito por IA na hora.

const horaSP = (agora) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }).format(agora));
const diaSP = (agora) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora);

/** Das 18h às 22h (horário de Brasília): se a Meta falhar às 18h, as rodadas seguintes tentam de novo. */
export const horaDoConteudo = (agora) => horaSP(agora) >= 18 && horaSP(agora) < 22;

/** O item de hoje que ainda não saiu e não estourou as 3 tentativas. Item malformado é ignorado. */
export function postDeHoje(agenda, agora, mem) {
  const dia = diaSP(agora);
  const feitos = new Set(mem.feitos || []);
  const tent = mem.tentativas && mem.tentativas.dia === dia ? mem.tentativas : { dia, n: {} };
  mem.tentativas = tent;
  return (Array.isArray(agenda) ? agenda : []).find(p => p && p.data === dia && /^[a-z0-9-]+$/.test(String(p.id || ''))
    && (/^\/instagram\/[a-z0-9-]+\.jpg$/.test(String(p.imagem || '')) || /^\/instagram\/[a-z0-9-]+\.mp4$/.test(String(p.video || '')) || ehCarrossel(p)) && String(p.legenda || '').trim()
    && !feitos.has(p.id) && (tent.n[p.id] || 0) < 3) || null;
}

/** Carrossel (15/11): de 2 a 10 telas jpg em /instagram/. */
export const ehCarrossel = (p) => Array.isArray(p && p.imagens) && p.imagens.length >= 2 && p.imagens.length <= 10
  && p.imagens.every(i => /^\/instagram\/[a-z0-9-]+\.jpg$/.test(String(i)));

/**
 * Publica um carrossel pela Graph API: um contêiner por tela (is_carousel_item), espera a Meta baixar,
 * cria o contêiner CAROUSEL com a legenda e publica. Qualquer falha devolve null (as rodadas seguintes
 * tentam de novo, até 3 vezes no dia).
 */
export async function publicarCarrossel(http, env, imagens, legenda) {
  if (!env.META_IG_USER_ID || !env.META_ACCESS_TOKEN || !Array.isArray(imagens) || imagens.length < 2 || !legenda) return null;
  const raiz = `https://graph.facebook.com/v21.0/${encodeURIComponent(env.META_IG_USER_ID)}`;
  const status = async (id) => { const st = await http.httpRequest({ method: 'GET', json: true, timeout: 15000,
    url: `https://graph.facebook.com/v21.0/${id}?fields=status_code&access_token=${encodeURIComponent(env.META_ACCESS_TOKEN)}` }); return st && st.status_code; };
  const espera = async (id, vezes) => {
    for (let i = 0; i < vezes; i++) {
      const s = await status(id);
      if (s === 'FINISHED' || !s) return true;
      if (s === 'ERROR' || s === 'EXPIRED') return false;
      if (typeof setTimeout === 'function') await new Promise(r => setTimeout(r, 4000));
    }
    return false;
  };
  const filhos = [];
  for (const u of imagens) {
    const c = await http.httpRequest({ method: 'POST', url: `${raiz}/media`, json: true, timeout: 60000,
      body: { image_url: u, is_carousel_item: true, access_token: env.META_ACCESS_TOKEN } });
    if (!c || !c.id) return null;
    filhos.push(c.id);
  }
  for (const f of filhos) if (!(await espera(f, 8))) return null;
  const c = await http.httpRequest({ method: 'POST', url: `${raiz}/media`, json: true, timeout: 60000,
    body: { media_type: 'CAROUSEL', children: filhos.join(','), caption: legenda, access_token: env.META_ACCESS_TOKEN } });
  if (!c || !c.id || !(await espera(c.id, 10))) return null;
  const r = await http.httpRequest({ method: 'POST', url: `${raiz}/media_publish`, json: true, timeout: 60000,
    body: { creation_id: c.id, access_token: env.META_ACCESS_TOKEN } });
  return (r && r.id) || null;
}

export function anotarTentativa(mem, id, publicado) {
  if (publicado) mem.feitos = [...(mem.feitos || []).filter(x => x !== id), id].slice(-120);
  else mem.tentativas.n[id] = (mem.tentativas.n[id] || 0) + 1;
}

/** Reel (12/11): o item da agenda com "video". Só sai com INSTAGRAM_REEL=sim; o resto do feed não depende dele. */
export const reelLigado = (env) => String((env && env.INSTAGRAM_REEL) || '').trim().toLowerCase() === 'sim';

/** Publica um Reel pela Graph API. Vídeo demora mais que imagem para a Meta processar: espera até ~2 minutos. */
export async function publicarReel(http, env, video, legenda) {
  if (!env.META_IG_USER_ID || !env.META_ACCESS_TOKEN || !video || !legenda) return null;
  const raiz = `https://graph.facebook.com/v21.0/${encodeURIComponent(env.META_IG_USER_ID)}`;
  const c = await http.httpRequest({ method: 'POST', url: `${raiz}/media`, json: true, timeout: 60000,
    body: { media_type: 'REELS', video_url: video, caption: legenda, share_to_feed: true, access_token: env.META_ACCESS_TOKEN } });
  if (!c || !c.id) return null;
  let pronto = false;
  for (let i = 0; i < 24 && !pronto; i++) {
    const st = await http.httpRequest({ method: 'GET', json: true, timeout: 15000,
      url: `https://graph.facebook.com/v21.0/${c.id}?fields=status_code&access_token=${encodeURIComponent(env.META_ACCESS_TOKEN)}` });
    if (st && st.status_code === 'ERROR') return null;
    pronto = !st || st.status_code === 'FINISHED';
    if (!pronto && typeof setTimeout === 'function') await new Promise(r => setTimeout(r, 5000));
  }
  if (!pronto) return null;
  const r = await http.httpRequest({ method: 'POST', url: `${raiz}/media_publish`, json: true, timeout: 60000,
    body: { creation_id: c.id, access_token: env.META_ACCESS_TOKEN } });
  return (r && r.id) || null;
}

/**
 * Aviso de falha (13/11, pedido do Wellington): na 3ª tentativa sem sucesso o post não sai mais hoje,
 * então vai um aviso para o rascunho. Antes da 3ª, null (as rodadas seguintes ainda tentam).
 */
export function avisoDeFalha(p, tentativas) {
  if (!p || tentativas !== 3) return null;
  return ['⚠️ *Instagram: o post de hoje não saiu*', '',
    `${p.video ? 'O Reel' : p.imagens ? 'O carrossel' : 'O post'} "${p.id}" falhou nas 3 tentativas (18h às 22h) e não sai mais hoje.`,
    'Para remarcar, mude a data dele na agenda (marketing/instagram/posts.json).'].join('\n');
}
