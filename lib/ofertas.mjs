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
  if (!crypto) throw new Error('crypto bloqueado no n8n: falta NODE_FUNCTION_ALLOW_BUILTIN=crypto');
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

// ------------------------------------------------------------ a entrada (Z-API)

/** O que importa do webhook "Ao receber" da Z-API. */
export function lerMensagemZapi(b) {
  b = b || {};
  const img = b.image || null;
  return {
    instancia: b.instanceId || null,
    chat: String(b.phone || ''),                        // grupo: 120363...-group
    grupo: b.isGroup === true,
    autor: String(b.participantPhone || (b.isGroup ? '' : b.phone) || '').replace(/\D/g, ''),
    deMim: b.fromMe === true,
    daApi: b.fromApi === true,
    texto: String((b.text && b.text.message) || (img && img.caption) || '').trim(),
    imagem: img ? (img.imageUrl || img.url || null) : null,
    messageId: b.messageId || null,
  };
}

const ultimos8 = (t) => String(t || '').replace(/\D/g, '').slice(-8);

/**
 * Só vale mensagem do rascunho, de quem pode postar. Ignora o que o próprio
 * robô mandou (fromApi), senão ele posta a própria confirmação.
 */
export function aceitarDoRascunho(m, cfg) {
  if (!cfg || !cfg.rascunho) return { ok: false, motivo: 'rascunho_nao_configurado' };
  if (cfg.instancia && m.instancia && m.instancia !== cfg.instancia) return { ok: false, motivo: 'outra_instancia' };
  if (m.daApi) return { ok: false, motivo: 'enviada_pelo_robo' };
  if (m.chat !== cfg.rascunho) return { ok: false, motivo: 'fora_do_rascunho' };
  // Quem pode postar: o autor (pelo telefone, DDD + 8 dígitos tolera o nono
  // dígito) ou o próprio número do robô digitado no celular (fromMe).
  const doAutor = !!cfg.autor && !!m.autor && ultimos8(m.autor) === ultimos8(cfg.autor);
  if (!doAutor && !m.deMim) return { ok: false, motivo: 'autor_nao_autorizado' };
  if (!m.texto && !m.imagem) return { ok: false, motivo: 'vazia' };
  return { ok: true };
}

/** Troca cada link original pelo convertido, no texto que o autor escreveu. */
export function trocarLinks(texto, mapa) {
  let t = String(texto || '');
  // O mais longo primeiro: um link que é começo de outro não estraga o maior.
  const pares = Object.entries(mapa).sort((a, b) => b[0].length - a[0].length);
  for (const [de, para] of pares) t = t.split(de).join(para);
  return t;
}

/** Garante o aviso de afiliado no fim, sem duplicar. */
export function comAviso(texto) {
  const t = String(texto || '').trim();
  return /afiliad/i.test(t) ? t : `${t}\n\n_Link de afiliado. Preço sujeito a alteração._`;
}

/**
 * A conversão que não precisa de rede. Amazon recebe o link já aberto (sem
 * amzn.to). Shopee volta { rede: 'shopee' }: quem chama a API é o nó.
 * Mercado Livre só passa link meli.la (o que sai do painel de afiliados);
 * link comum do ML não rende comissão e é recusado com o motivo.
 */
export function converterSemRede(url, cfg) {
  const loja = plataformaDe(url);
  if (loja === 'amazon') {
    if (eEncurtado(url)) return { ok: false, loja, motivo: 'amazon_encurtado' };
    if (!cfg.amazonTag) return { ok: false, loja, motivo: 'falta_AMAZON_TAG' };
    return { ok: true, loja, url: amazonComTag(url, cfg.amazonTag) };
  }
  if (loja === 'shopee') return { ok: false, loja, rede: 'shopee' };
  if (loja === 'mercadolivre') {
    return /(^|\.)meli\.la$/i.test(new URL(url).hostname)
      ? { ok: true, loja, url }
      : { ok: false, loja, motivo: 'ml_precisa_link_do_painel' };
  }
  if (/(^|\.)magazinevoce\.com\.br$/i.test(new URL(url).hostname)) return { ok: true, loja: 'magalu', url: magaluNaMinhaLoja(url, cfg.magaluLoja) };
  if (/(^|\.)magazineluiza\.com\.br$/i.test(new URL(url).hostname)) return { ok: false, loja: 'magalu', motivo: 'magalu_precisa_link_da_sua_loja' };
  return { ok: false, loja, motivo: 'loja_desconhecida' };
}

/**
 * Magalu: o link de outra loja do Parceiro Magalu (magazinevoce.com.br/LOJA/...)
 * vira link da sua loja trocando o primeiro pedaço do caminho. Sem MAGALU_LOJA
 * configurada, passa como veio.
 */
export function magaluNaMinhaLoja(url, loja) {
  if (!loja) return url;
  const u = new URL(url);
  const partes = u.pathname.split('/');
  if (partes.length > 2 && partes[1]) partes[1] = loja;
  u.pathname = partes.join('/');
  return u.toString();
}

/** Shopee: tira o que vem depois do "?" (rastreio de quem divulgou antes). */
export function limparShopee(url) {
  const u = new URL(url);
  u.search = ''; u.hash = '';
  return u.toString();
}

/** O motivo em português, para a resposta no rascunho. */
export const MOTIVOS = {
  amazon_encurtado: 'não consegui abrir o link curto da Amazon',
  falta_AMAZON_TAG: 'falta configurar a sua tag da Amazon (AMAZON_TAG)',
  ml_precisa_link_do_painel: 'Mercado Livre: mande o link meli.la gerado no seu painel de afiliados',
  magalu_precisa_link_da_sua_loja: 'Magalu: mande o link da sua loja (magazinevoce.com.br)',
  loja_desconhecida: 'não sei converter links desta loja',
  falta_shopee: 'falta configurar a Shopee (SHOPEE_APP_ID e SHOPEE_SECRET)',
  shopee_recusou: 'a Shopee não gerou o link',
  sem_link: 'não achei link na mensagem',
  nao_abriu: 'não consegui abrir um link curto',
  falta_GRUPO_OFERTAS: 'falta configurar o grupo de ofertas (GRUPO_OFERTAS)',
};

// ------------------------------------------------------------ a esteira (fluxo 01)

/**
 * Da mensagem do rascunho até a oferta pronta para o grupo. A rede vem de fora
 * (rede.abrir segue link curto, rede.shopee gera o link curto da Shopee), para
 * o teste trocar por falsos.
 *
 * Volta { acao: 'ignorar' } (não responde nada), { acao: 'recusar', resposta }
 * (responde no rascunho e não posta) ou { acao: 'postar', grupo, texto, imagem }.
 * Se um link não converteu, não posta nada: postar com o link de outra pessoa
 * é pior do que não postar.
 */
export async function prepararOferta(body, cfg, rede, vistos = []) {
  const m = lerMensagemZapi(body);
  const a = aceitarDoRascunho(m, cfg);
  if (!a.ok) return { acao: 'ignorar', motivo: a.motivo };
  if (m.messageId) {
    if (vistos.includes(m.messageId)) return { acao: 'ignorar', motivo: 'repetida' };
    vistos.push(m.messageId);
    if (vistos.length > 200) vistos.splice(0, vistos.length - 200);
  }
  const recusa = (motivos) => ({ acao: 'recusar', postar: false,
    resposta: ['\u274C Não postei.', ...[...new Set(motivos)].map(k => `\u2022 ${MOTIVOS[k] || k}`)].join('\n') });
  if (!cfg.grupo) return recusa(['falta_GRUPO_OFERTAS']);
  const links = [...new Set(extrairLinks(m.texto))];
  if (!links.length) return recusa(['sem_link']);

  const mapa = {}, problemas = [];
  for (const de of links) {
    let url = de;
    if (eEncurtado(url) && plataformaDe(url) !== 'mercadolivre') {
      try { url = await rede.abrir(url); } catch (e) { problemas.push('nao_abriu'); continue; }
    }
    let c = converterSemRede(url, cfg);
    if (c.rede === 'shopee') {
      if (!cfg.shopee) { problemas.push('falta_shopee'); continue; }
      let curto = null;
      try { curto = await rede.shopee(limparShopee(url)); } catch (e) { curto = null; }
      c = curto ? { ok: true, url: curto } : { ok: false, motivo: 'shopee_recusou' };
    }
    if (c.ok) mapa[de] = c.url; else problemas.push(c.motivo);
  }
  if (problemas.length) return recusa(problemas);
  return { acao: 'postar', postar: true, grupo: cfg.grupo,
    texto: comAviso(trocarLinks(m.texto, mapa)), imagem: m.imagem || '' };
}

/** Segue o redirecionamento de um link curto até sair do encurtador (no máximo 5 saltos). */
export async function abrirLink(url, pedir) {
  let atual = url;
  for (let i = 0; i < 5 && eEncurtado(atual); i++) {
    const r = await pedir(atual);
    const h = (r && r.headers) || {};
    const destino = h.location || h.Location;
    if (!destino) break;
    atual = new URL(destino, atual).toString();
  }
  if (eEncurtado(atual)) throw new Error('link curto não abriu');
  return atual;
}

// ------------------------------------------------------------ a saída (Z-API)

/** O pedido de envio: imagem com legenda, ou só texto. */
export function pedidoZapi({ phone, message, image }, cfg) {
  if (!cfg.base || !cfg.instancia || !cfg.token) throw new Error('falta ZAPI_BASE_URL, ZAPI_INSTANCE_ID ou ZAPI_INSTANCE_TOKEN');
  const raiz = `${String(cfg.base).replace(/\/+$/, '')}/instances/${cfg.instancia}/token/${cfg.token}`;
  return image
    ? { url: `${raiz}/send-image`, body: { phone, image, caption: message || '' } }
    : { url: `${raiz}/send-text`, body: { phone, message } };
}

/** Saiu de verdade só se a Z-API devolveu o id. 200 com erro no corpo não conta. */
export function idDoEnvio(r) {
  return (r && (r.zaapId || r.messageId || r.id)) ? String(r.zaapId || r.messageId || r.id) : null;
}
