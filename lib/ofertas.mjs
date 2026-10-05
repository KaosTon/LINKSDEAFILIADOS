// Funções puras da esteira de ofertas. Elas vão para os nós Code do n8n
// (copiadas no SDK) e são testadas aqui, offline, antes de subir.
//
// Nada aqui chama rede: separar o que decide (texto, link, plataforma,
// assinatura) do que faz chamada deixa a parte que erra calada testável.
import crypto from 'node:crypto';

const URL_RE = /https?:\/\/[^\s<>"']+/gi;

/** Todos os links do texto, sem a pontuação que gruda no fim ("...link)." ). */
export function extrairLinks(texto) {
  return (String(texto || '').match(URL_RE) || []).map(u => u.replace(/[).,;!?]+$/, ''));
}

/** De qual loja é o link. Encurtadores contam: meli.la, amzn.to, s.shopee. */
export function plataformaDe(url) {
  let h;
  try { h = new URL(url).hostname.toLowerCase(); } catch { return null; }
  if (/(^|\.)shopee\.com\.br$|(^|\.)shope\.ee$/.test(h)) return 'shopee';
  if (/(^|\.)mercadolivre\.com\.br$|(^|\.)mercadolibre\.com$|(^|\.)meli\.la$/.test(h)) return 'mercadolivre';
  if (/(^|\.)amazon\.com\.br$|(^|\.)amzn\.to$|(^|\.)a\.co$/.test(h)) return 'amazon';
  return 'outra';
}

/** Link encurtado precisa ser aberto (seguir o redirecionamento) antes de virar link de afiliado. */
export function eEncurtado(url) {
  try { return /^(amzn\.to|a\.co|meli\.la|s\.shopee\.com\.br|shope\.ee)$/.test(new URL(url).hostname.toLowerCase()); }
  catch { return false; }
}

/**
 * Amazon: o link de afiliado é o link do produto com ?tag=SUA-TAG.
 * Troca a tag de quem postou a oferta pela sua e tira os rastreios de afiliado
 * dele. Link encurtado (amzn.to) volta null: abra antes.
 */
export function amazonComTag(url, tag) {
  if (!tag) throw new Error('falta a tag da Amazon');
  let u;
  try { u = new URL(url); } catch { return null; }
  if (!/(^|\.)amazon\.com\.br$/.test(u.hostname.toLowerCase())) return null;
  for (const p of ['tag', 'linkCode', 'linkId', 'ascsubtag', 'ref_', 'creative', 'creativeASIN', 'camp'])
    u.searchParams.delete(p);
  u.searchParams.set('tag', tag);
  return u.toString();
}

/**
 * Shopee (API oficial de afiliados, GraphQL): o corpo do pedido de link curto.
 * Endpoint Brasil: https://open-api.affiliate.shopee.com.br/graphql
 */
export function shopeeCorpo(originUrl, subIds = []) {
  const ids = subIds.slice(0, 5).map(s => JSON.stringify(String(s)));
  const q = `mutation{generateShortLink(input:{originUrl:${JSON.stringify(originUrl)},subIds:[${ids.join(',')}]}){shortLink}}`;
  return JSON.stringify({ query: q });
}

/**
 * Shopee: o cabeçalho Authorization. A assinatura é o SHA256 de
 * AppId + Timestamp + Payload + Secret, com o MESMO texto do corpo que vai na
 * requisição (qualquer espaço diferente invalida). Conferir com a
 * documentação do painel de afiliados no primeiro teste real.
 */
export function shopeeAutorizacao(appId, secret, payload, timestamp = Math.floor(Date.now() / 1000)) {
  if (!appId || !secret) throw new Error('falta AppId ou Secret da Shopee');
  const assinatura = crypto.createHash('sha256').update(`${appId}${timestamp}${payload}${secret}`).digest('hex');
  return `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${assinatura}`;
}

/** Preço em reais no formato brasileiro: 1234.5 -> "1.234,50". */
export function reais(v) {
  const n = typeof v === 'number' ? v : Number(String(v).replace(/\./g, '').replace(',', '.'));
  if (!isFinite(n)) return null;
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** A legenda da foto no grupo. Sem preço confiável, sai sem preço (nunca inventa). */
export function legenda({ nome, preco, precoAntes, link, loja }) {
  if (!nome || !link) throw new Error('legenda precisa de nome e link');
  const linhas = ['\u{1F525} *OFERTA* \u{1F525}', '', `*${String(nome).trim()}*`];
  const p = preco != null ? reais(preco) : null;
  const a = precoAntes != null ? reais(precoAntes) : null;
  if (p && a && a !== p) linhas.push('', `De ~R$ ${a}~ por *R$ ${p}*`);
  else if (p) linhas.push('', `Por *R$ ${p}*`);
  if (loja) linhas.push(`\u{1F6D2} ${loja}`);
  linhas.push('', `\u{1F449} ${link}`, '', '_Link de afiliado. Preço sujeito a alteração._');
  return linhas.join('\n');
}
