// Funções puras da esteira de ofertas. Elas vão para os nós Code do n8n
// (copiadas no SDK) e são testadas aqui, offline, antes de subir.
//
// Nada aqui chama rede: separar o que decide (texto, link, plataforma,
// assinatura) do que faz chamada deixa a parte que erra calada testável.
import crypto from 'node:crypto';
import nodeUrl from 'node:url';

// No nó Code do n8n (task runner) NÃO existe URL global (ensaio 98, 06/10):
// vem do módulo 'url', que precisa estar liberado em
// NODE_FUNCTION_ALLOW_BUILTIN=crypto,url. Toda a lib usa novaURL.
const URLC = typeof URL !== 'undefined' ? URL : ((nodeUrl && nodeUrl.URL) || null);
export const urlDisponivel = () => !!URLC;
function novaURL(u, base) {
  if (!URLC) throw new Error('URL bloqueado no n8n: falta NODE_FUNCTION_ALLOW_BUILTIN=crypto,url');
  return base === undefined ? new URLC(u) : new URLC(u, base);
}

const URL_RE = /https?:\/\/[^\s<>"']+/gi;


/** Todos os links do texto, sem a pontuação que gruda no fim ("...link)." ). */
export function extrairLinks(texto) {
  return (String(texto || '').match(URL_RE) || []).map(u => u.replace(/[).,;!?]+$/, ''));
}

/** De qual loja é o link. Encurtadores contam: meli.la, amzn.to, s.shopee. */
export function plataformaDe(url) {
  let h;
  try { h = novaURL(url).hostname.toLowerCase(); } catch { return null; }
  if (/(^|\.)shopee\.com\.br$|(^|\.)shope\.ee$/.test(h)) return 'shopee';
  if (/(^|\.)mercadolivre\.com\.br$|(^|\.)mercadolibre\.com$|(^|\.)meli\.la$/.test(h)) return 'mercadolivre';
  if (/(^|\.)amazon\.com\.br$|(^|\.)amzn\.to$|(^|\.)a\.co$/.test(h)) return 'amazon';
  return 'outra';
}

/** Link encurtado precisa ser aberto (seguir o redirecionamento) antes de virar link de afiliado. */
export function eEncurtado(url) {
  try { return /^(amzn\.to|a\.co|meli\.la|s\.shopee\.com\.br|shope\.ee)$/.test(novaURL(url).hostname.toLowerCase()); }
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
  try { u = novaURL(url); } catch { return null; }
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
    if (/(^|\.)meli\.la$/i.test(novaURL(url).hostname)) return { ok: true, loja, url };
    const meu = mlAfiliado(url, cfg);
    return meu ? { ok: true, loja, url: meu } : { ok: false, loja, motivo: 'ml_precisa_link_do_painel' };
  }
  if (/(^|\.)magazinevoce\.com\.br$/i.test(novaURL(url).hostname)) return { ok: true, loja: 'magalu', url: magaluNaMinhaLoja(url, cfg.magaluLoja) };
  if (/(^|\.)magazineluiza\.com\.br$/i.test(novaURL(url).hostname)) {
    return cfg.magaluLoja && /\/p\//.test(novaURL(url).pathname)
      ? { ok: true, loja: 'magalu', url: magaluNaMinhaLoja(url, cfg.magaluLoja) }
      : { ok: false, loja: 'magalu', motivo: 'magalu_precisa_link_da_sua_loja' };
  }
  return { ok: false, loja, motivo: 'loja_desconhecida' };
}

/**
 * Magalu (Influenciador Magalu): o link da loja é
 * magazinevoce.com.br/magazineSUALOJA/produto/p/ID/cat/sub/. O link de outra
 * loja vira da sua trocando o primeiro pedaço do caminho; o link do site
 * (magazineluiza.com.br/produto/p/ID/...) vira da sua loja ganhando esse
 * pedaço na frente. MAGALU_LOJA vale com ou sem o "magazine" na frente.
 */
export function lojaMagalu(loja) {
  const l = String(loja || '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!l) return '';
  return l.startsWith('magazine') ? l : `magazine${l}`;
}

export function magaluNaMinhaLoja(url, loja) {
  const minha = lojaMagalu(loja);
  if (!minha) return url;
  const u = novaURL(url);
  const partes = u.pathname.split('/');
  if (/(^|\.)magazineluiza\.com\.br$/i.test(u.hostname)) {
    u.hostname = 'www.magazinevoce.com.br';
    u.pathname = `/${minha}${u.pathname}`;
    return u.toString();
  }
  if (partes.length > 2 && partes[1]) partes[1] = minha;
  u.pathname = partes.join('/');
  return u.toString();
}

/**
 * Mercado Livre: link de produto + ?matt_word=ETIQUETA&matt_tool=ID dele.
 * Testado em 06/10: o clique nesse link contou nas Métricas dele. Só página de
 * produto (/p/MLB..., /up/MLBU..., produto.mercadolivre.com.br/MLB-...);
 * perfil social, lista e busca voltam null.
 */
export function mlAfiliado(url, cfg) {
  if (!cfg || !cfg.mlEtiqueta || !cfg.mlTool) return null;
  let u; try { u = novaURL(url); } catch { return null; }
  if (!/(^|\.)mercadolivre\.com\.br$/i.test(u.hostname)) return null;
  if (!/\/(p|up)\/MLBU?\d+|\/MLB-\d+/i.test(u.pathname)) return null;
  u.search = ''; u.hash = '';
  u.searchParams.set('matt_word', String(cfg.mlEtiqueta).trim());
  u.searchParams.set('matt_tool', String(cfg.mlTool).trim());
  return u.toString();
}

const semAcento = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const PALAVRAS_VAZIAS = new Set(['com', 'para', 'pra', 'de', 'do', 'da', 'dos', 'das', 'em', 'cor', 'kit', 'e', 'o', 'a', 'and', 'the']);
const palavras = (t) => semAcento(t).split(/[^a-z0-9]+/).filter(w => w.length >= 3 && !PALAVRAS_VAZIAS.has(w));

/**
 * Na página do perfil de outro afiliado (onde o meli.la dele cai), acha o
 * produto da oferta comparando o nome do post com o endereço de cada produto.
 * Só aceita se pelo menos 60% das palavras do nome estão no endereço; na
 * dúvida volta null (melhor descartar que postar produto errado).
 */
export function escolherProdutoML(html, nome) {
  const b = String(html || '').replace(/\\u002F/gi, '/').replace(/\\\//g, '/').replace(/&amp;/g, '&');
  if (/abuse-captcha/.test(b.slice(0, 2000))) return null;
  // No JSON da página o endereço vem sem "https://" (www.mercadolivre.com.br/...).
  const achados = [...b.matchAll(/(?:https?:\/\/)?(?:www\.|produto\.)mercadolivre\.com\.br\/[^"'\s<>]*?(?:\/p\/MLB\d+|\/up\/MLBU\d+|\/MLB-\d+[^"'\s<>?#]*)/g)]
    .map(m => (/^https?:/.test(m[0]) ? m[0] : `https://${m[0]}`));
  const alvo = palavras(nome);
  if (alvo.length < 2) return null;
  let melhor = null, nota = 0;
  const vistos = new Set();
  for (const url of achados) {
    const id = (url.match(/MLBU?-?\d+/i) || [''])[0].replace('-', '');
    if (vistos.has(id)) continue;
    vistos.add(id);
    const doLink = new Set(palavras(url.split('mercadolivre.com.br/')[1]));
    const n = alvo.filter(w => doLink.has(w)).length / alvo.length;
    if (n > nota) { nota = n; melhor = url; }
  }
  return nota >= 0.6 ? melhor : null;
}

/** Shopee: tira o que vem depois do "?" (rastreio de quem divulgou antes). */
export function limparShopee(url) {
  const u = novaURL(url);
  u.search = ''; u.hash = '';
  return u.toString();
}

/** O motivo em português, para a resposta no rascunho. */
export const MOTIVOS = {
  amazon_encurtado: 'não consegui abrir o link curto da Amazon',
  falta_AMAZON_TAG: 'falta configurar a sua tag da Amazon (AMAZON_TAG)',
  ml_precisa_link_do_painel: 'Mercado Livre: mande o link do produto (ou o meli.la do seu painel); falta ML_ETIQUETA e ML_MATT_TOOL',
  magalu_precisa_link_da_sua_loja: 'Magalu: mande o link da sua loja (magazinevoce.com.br) ou configure MAGALU_LOJA',
  loja_desconhecida: 'não sei converter links desta loja',
  falta_shopee: 'falta configurar a Shopee (SHOPEE_APP_ID e SHOPEE_SECRET)',
  shopee_recusou: 'a Shopee não gerou o link',
  sem_link: 'não achei link na mensagem (para cupom sem link, comece com CUPOM)',
  nao_abriu: 'não consegui abrir um link curto',
  falta_GRUPO_OFERTAS: 'falta configurar o grupo de ofertas (GRUPO_OFERTAS)',
  ml_terceiro: 'Mercado Livre: não achei o produto para montar o seu link',
  ml_de_outra_pessoa: 'Mercado Livre: esse meli.la não é da sua etiqueta; gere o link no seu painel',
  sem_url: 'o n8n está sem o módulo url (NODE_FUNCTION_ALLOW_BUILTIN=crypto,url)',
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
  if (!urlDisponivel()) return recusa(['sem_url']);
  if (!cfg.grupo) return recusa(['falta_GRUPO_OFERTAS']);
  const links = [...new Set(extrairLinks(m.texto))];
  // CUPOM: mensagem que começa com "CUPOM" vai para o grupo mesmo sem link.
  // Se tiver link, ele é convertido como numa oferta.
  const cupom = eCupom(m.texto);
  if (!links.length && cupom) return { acao: 'postar', postar: true, grupo: cfg.grupo, texto: m.texto, imagem: m.imagem || '' };
  if (!links.length) return recusa(['sem_link']);

  const mapa = {}, problemas = [];
  for (const de of links) {
    const c = await converterLink(de, cfg, rede, false);
    if (c.ok) mapa[de] = c.url; else problemas.push(c.motivo);
  }
  if (problemas.length) return recusa(problemas);
  return { acao: 'postar', postar: true, grupo: cfg.grupo,
    texto: comAviso(trocarLinks(m.texto, mapa)), imagem: m.imagem || '' };
}

/** Mensagem de cupom: começa com CUPOM (com ou sem negrito ou emoji na frente). */
export function eCupom(texto) {
  return /^[\s*_~\p{Extended_Pictographic}\uFE0F]*cupo(m|ns)\b/iu.test(String(texto || ''));
}

/** Endereço que já é da loja (não precisa abrir). meli.la não conta: abrir mostra a etiqueta. */
export function lojaFinal(url) {
  let h;
  try { h = novaURL(url).hostname.toLowerCase(); } catch { return false; }
  return /(^|\.)amazon\.com\.br$|^(www\.)?shopee\.com\.br$|(^|\.)mercadolivre\.com\.br$|(^|\.)magazinevoce\.com\.br$|(^|\.)magazineluiza\.com\.br$/.test(h);
}

/**
 * Segue o redirecionamento de qualquer link curto (amzn.to, link.amazon,
 * meli.la, pechin.co, cupom.cc, divulgador.magalu.com...) até chegar na loja.
 * No máximo 6 saltos; não abre a página da loja em si.
 */
export async function abrirLink(url, pedir) {
  let atual = url;
  for (let i = 0; i < 6 && !lojaFinal(atual); i++) {
    const r = await pedir(atual);
    const h = (r && r.headers) || {};
    const destino = h.location || h.Location;
    if (!destino) break;
    atual = novaURL(destino, atual).toString();
  }
  if (!lojaFinal(atual)) throw new Error('link curto não abriu');
  return atual;
}

/** A chave do produto, para não repetir: amazon:ASIN, magalu:ID, shopee:ID, ou o endereço. */
export function chaveProduto(url) {
  let u; try { u = novaURL(url); } catch { return String(url); }
  const h = u.hostname.toLowerCase(), p = u.pathname;
  let m;
  if (/amazon\.com\.br$/.test(h) && (m = p.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i))) return `amazon:${m[1].toUpperCase()}`;
  if (/magazine(voce|luiza)\.com\.br$/.test(h) && (m = p.match(/\/p\/([a-z0-9]+)\//i))) return `magalu:${m[1].toLowerCase()}`;
  if (/shopee\.com\.br$/.test(h) && (m = p.match(/i\.(\d+)\.(\d+)/) || p.match(/product\/(\d+)\/(\d+)/))) return `shopee:${m[1]}.${m[2]}`;
  if (/mercadolivre\.com\.br$/.test(h) && (m = p.match(/MLBU?-?(\d{6,})/i))) return `ml:${m[1]}`;
  return `${h}${p}`;
}

/**
 * ML de canal de outra pessoa: o link cai no perfil social dela. Abre a
 * página, acha o produto pelo nome do post e monta o SEU link.
 */
async function mlDeTerceiro(url, cfg, rede, nome) {
  if (!cfg.mlEtiqueta || !cfg.mlTool || !nome || !rede.pagina) return { ok: false, motivo: 'ml_terceiro' };
  let destino = url;
  if (!lojaFinal(url)) {
    try { destino = await rede.abrir(url); } catch (e) { return { ok: false, motivo: 'nao_abriu' }; }
  }
  const direto = mlAfiliado(destino, cfg);
  if (direto) return { ok: true, loja: 'mercadolivre', url: direto, chave: chaveProduto(destino) };
  let html = '';
  try { html = await rede.pagina(destino); } catch (e) { html = ''; }
  const produto = escolherProdutoML(html, nome);
  if (!produto) return { ok: false, motivo: 'ml_terceiro' };
  return { ok: true, loja: 'mercadolivre', url: mlAfiliado(produto, cfg), chave: chaveProduto(produto) };
}

/** Amazon de outra pessoa: link curto e limpo, só com a sua tag. */
export function amazonCanonico(url, tag) {
  const k = chaveProduto(url);
  if (k.startsWith('amazon:')) return `https://www.amazon.com.br/dp/${k.slice(7)}?tag=${encodeURIComponent(tag)}`;
  return amazonComTag(url, tag);
}

/**
 * Converte UM link. `terceiro` = veio de canal de outra pessoa (garimpo):
 * aí Mercado Livre nunca passa (o link do ML só sai do seu painel) e o link
 * da Amazon sai no formato curto. Volta { ok, url, chave } ou { ok:false, motivo }.
 */
export async function converterLink(de, cfg, rede, terceiro, nome) {
  let url = de;
  // Mercado Livre: o meli.la abre com matt_word=ETIQUETA de quem gerou.
  if (plataformaDe(url) === 'mercadolivre' && eEncurtado(url)) {
    if (terceiro) return mlDeTerceiro(de, cfg, rede, nome);
    if (!cfg.mlEtiqueta) return { ok: true, url: de, chave: de };
    let destino;
    try { destino = await rede.abrir(url); } catch (e) { return { ok: false, motivo: 'nao_abriu' }; }
    const dono = novaURL(destino).searchParams.get('matt_word') || '';
    if (dono.toLowerCase() !== String(cfg.mlEtiqueta).trim().toLowerCase()) return { ok: false, motivo: 'ml_de_outra_pessoa' };
    return { ok: true, url: de, chave: de };
  }
  if (!lojaFinal(url)) {
    try { url = await rede.abrir(url); }
    catch (e) { return { ok: false, motivo: plataformaDe(de) === 'outra' ? 'loja_desconhecida' : 'nao_abriu' }; }
  }
  if (terceiro && plataformaDe(url) === 'mercadolivre' && !mlAfiliado(url, cfg)) return mlDeTerceiro(url, cfg, rede, nome);
  let c = converterSemRede(url, cfg);
  if (c.rede === 'shopee') {
    if (!cfg.shopee) return { ok: false, motivo: 'falta_shopee' };
    let curto = null;
    try { curto = await rede.shopee(limparShopee(url)); } catch (e) { curto = null; }
    c = curto ? { ok: true, loja: 'shopee', url: curto } : { ok: false, motivo: 'shopee_recusou' };
  }
  if (!c.ok) return c;
  if (terceiro && c.loja === 'amazon') c.url = amazonCanonico(url, cfg.amazonTag);
  return { ...c, chave: chaveProduto(url) };
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

// ------------------------------------------------------------ o garimpo (fluxo 03)

const desfazHtml = (h) => String(h || '')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
  .replace(/&#036;/g, '$').replace(/&#33;/g, '!').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

/**
 * Os posts da página pública de um canal (t.me/s/CANAL), do mais velho para o
 * mais novo: { id, quando, foto, texto, links }.
 */
export function lerCanalTelegram(html) {
  return String(html || '').split('tgme_widget_message_wrap').slice(1).map(x => {
    const id = (x.match(/data-post="([^"]+)"/) || [])[1] || null;
    const quando = (x.match(/<time datetime="([^"]+)"/) || [])[1] || null;
    const foto = (x.match(/tgme_widget_message_photo_wrap[^>]*background-image:url\('([^']+)'\)/) || [])[1] || null;
    const th = (x.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '';
    const texto = desfazHtml(th).trim();
    const hrefs = [...th.matchAll(/href="(https?:[^"]+)"/g), ...x.matchAll(/tgme_widget_message_inline_button[^>]*href="(https?:[^"]+)"/g)]
      .map(m => m[1].replace(/&amp;/g, '&'));
    const links = [...new Set([...hrefs, ...extrairLinks(texto)])].filter(l => !/^https?:\/\/(t\.me|telegram\.me)\//i.test(l));
    return { id, quando, foto, texto, links };
  }).filter(p => p.id);
}

const PRECO_RE = /R\$\s*([\d.]+(?:,\d{1,2})?)/;
const numero = (t) => { const n = Number(String(t).replace(/\./g, '').replace(',', '.')); return isFinite(n) && n > 0 ? n : null; };

/**
 * A linha de preço: "De R$456 por R$266 pix" -> { precoAntes: 456, preco: 266,
 * pagamento: 'no Pix' }. Só "Por: R$ 458 no Pix" -> { preco: 458 }.
 */
export function lerPreco(linha) {
  const l = String(linha || '');
  const de = l.match(/\bde\s*R\$\s*([\d.]+(?:,\d{1,2})?).*?\bpor\b.*?R\$\s*([\d.]+(?:,\d{1,2})?)/i);
  const m = l.match(PRECO_RE);
  const preco = de ? numero(de[2]) : (m ? numero(m[1]) : null);
  const precoAntes = de ? numero(de[1]) : null;
  const resto = l.slice(l.lastIndexOf('R$'));
  let pagamento = null;
  if (/pix/i.test(resto)) pagamento = 'no Pix';
  else if (/[àa] vista/i.test(resto)) pagamento = 'à vista';
  else if (/(at[ée]\s*)?(\d{1,2})x\s*sem juros/i.test(resto)) pagamento = `em até ${resto.match(/(\d{1,2})x\s*sem juros/i)[1]}x sem juros`;
  else if (/parcelad/i.test(resto)) pagamento = 'parcelado';
  return { preco, precoAntes: precoAntes && preco && precoAntes > preco ? precoAntes : null, pagamento, aPartir: /a partir de/i.test(l) };
}

/**
 * O que importa num post de canal: tipo (produto ou cupom), nome, preço,
 * cupons e as linhas dos cupons. Nome: a linha com "-" ou "•" na frente, ou a
 * primeira linha que não é chamada ("PRECINHO", "BAIXOU"...).
 */
export function lerPost(texto) {
  const linhas = String(texto || '').split('\n').map(l => l.replace(/[\u2060\u200D]/g, '').trim()).filter(Boolean);
  const semEmoji = (l) => l.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').trim();
  const precoLinha = linhas.find(l => /\bpor\b|🔥|✅|💵|💰/iu.test(l) && PRECO_RE.test(l));
  const { preco, precoAntes, pagamento, aPartir } = lerPreco(precoLinha);
  // Código de cupom: SÓ MAIÚSCULAS e números, depois de "cupom:", de ":" ou de " - " no fim da linha.
  const cupons = [...String(texto || '').matchAll(/(?:[Cc]upom|[Cc][oó]digo)\s*:?\s*([A-Z0-9]{4,24})\b|(?::|\s-)\s*([A-Z][A-Z0-9]{3,23})\s*$/gm)]
    .map(m => m[1] || m[2]).filter(c => c && /[A-Z]/.test(c) && !/^(OFF|PIX|FULL|APP)$/.test(c));
  // "Use o cupom MELIX + OUTRO": o segundo código vem depois do "+".
  linhas.forEach((l, k) => {
    if (!/cupo/i.test(l) && !(/^\+/.test(l) && /cupo/i.test(linhas[k - 1] || ''))) return;
    for (const m of l.matchAll(/\+\s*([A-Z][A-Z0-9]{3,23})\b/g)) if (!/^(OFF|PIX|FULL|APP)$/.test(m[1])) cupons.push(m[1]);
  });
  const bullet = linhas.find(l => /^[-•▪\uFE0E·]\s*\S/.test(l) && !/OFF|R\$/i.test(l));
  const chamada = (l) => { const t = semEmoji(l); return !t || /^(no precinho|precinho|baixou+|preç[aã]o|muito barat|corre|urgente|novo cupom|cupo(m|ns))/i.test(t) || t === t.toUpperCase(); };
  let nome = bullet ? bullet.replace(/^[-•▪\uFE0E·]\s*/, '') : (linhas.find(l => !chamada(l) && !PRECO_RE.test(l) && !/^https?:/i.test(l) && !/link|loja:|frete/i.test(l)) || '');
  nome = semEmoji(nome).replace(/\s+/g, ' ').trim();
  const eCupomPost = !preco && (eCupom(semEmoji(linhas[0] || '')) || /novos? cupo|cupons? /i.test(linhas[0] || '') || linhas.some(l => /🎟/.test(l)));
  const linhasCupom = linhas.filter(l => /OFF|🎟|▪\uFE0F/i.test(l) && !/^https?:/i.test(l)).map(l => semEmoji(l).replace(/^[▪\uFE0E•-]\s*/, ''));
  // O link da oferta: o da linha "Link:"/"🛒"/"PEGAR OFERTA" (ou a de baixo); senão o último.
  let link = null;
  for (let k = 0; k < linhas.length && !link; k++) {
    const u = extrairLinks(linhas[k]).find(x => !/t\.me\//i.test(x));
    if (u && (/link|🛒|oferta|compr/i.test(linhas[k]) || /link|🛒|oferta|compr/i.test(linhas[k - 1] || ''))) link = u;
  }
  if (!link) link = extrairLinks(texto).filter(x => !/t\.me\//i.test(x)).pop() || null;
  return { tipo: eCupomPost ? 'cupom' : (preco && nome ? 'produto' : 'outro'), nome, preco, precoAntes, pagamento, aPartir, cupons: [...new Set(cupons)], linhasCupom, link };
}

/** O que não vai para o grupo. Dá para trocar a lista com GARIMPO_PROIBIDO (palavras separadas por vírgula). */
export const PROIBIDO_PADRAO = ['whisky', 'whiskey', 'vodka', 'cerveja', 'vinho', ' gin ', 'licor', 'cachaça', 'tequila', 'espumante',
  'champagne', 'rum ', 'sex shop', 'vibrador', 'erótic', 'erotic', 'aposta', 'cassino', ' bet ', 'vape', 'pod descartável',
  'cigarro eletr', 'narguil', 'arma de fogo', 'munição', 'pistola', 'revólver'];
export function proibido(texto, lista = PROIBIDO_PADRAO) {
  const t = ` ${String(texto || '').toLowerCase()} `;
  return lista.some(p => p && t.includes(String(p).toLowerCase()));
}

/** Preço curto, como nos grupos: 456 -> "456", 67.6 -> "67,60", 2667 -> "2.667". */
export function reaisCurto(v) {
  const n = typeof v === 'number' ? v : numero(v);
  if (n == null) return null;
  return Number.isInteger(n) ? n.toLocaleString('pt-BR') : reais(n);
}

const GANCHOS = ['PREÇO DE QUEIMA', 'BAIXOU DEMAIS', 'CORRE QUE ACABA', 'ACHADO DO DIA', 'MENOR PREÇO QUE EU VI',
  'TÁ QUASE DE GRAÇA', 'OFERTA RELÂMPAGO', 'APROVEITA ENQUANTO DURA', 'PREÇÃO PRA LEVAR HOJE', 'ESSE VALE A PENA'];

export const descontoDe = (preco, antes) => (antes && preco && antes > preco ? Math.round((1 - preco / antes) * 100) : 0);

/** A chamada em maiúscula: com desconto grande, o desconto; senão uma da lista (a mesma para o mesmo produto). */
export function gancho(chave, desconto) {
  if (desconto >= 25) return `${desconto}% OFF, CORRE`;
  let h = 0;
  for (const ch of String(chave || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return GANCHOS[h % GANCHOS.length];
}

// ------------------------------------------------------------ a chamada criativa (IA)

export const MODELO_CHAMADA = 'google/gemini-3.1-flash-lite';

/** O pedido ao OpenRouter: uma frase em maiúscula, sem inventar fato nenhum. */
export function pedidoChamada(nome, modelo) {
  const sistema = [
    'Você escreve a CHAMADA de uma oferta para um grupo de promoções no WhatsApp.',
    'Regras: uma frase só, em português do Brasil, de 3 a 8 palavras, criativa e bem-humorada,',
    'falando do uso ou do benefício do produto, como gente falando com gente.',
    'Exemplos de estilo: air fryer -> VOU APOSENTAR O ÓLEO DA SUA CASA; moto elétrica infantil -> MOTINHA ELÉTRICA PRA CRIANÇADA;',
    'regata feminina -> REGATA DA INSIDER PRA ELAS.',
    'Proibido: preço, número, porcentagem, frete, "menor preço", "último dia", "grátis", urgência falsa,',
    'qualquer fato que não esteja no nome do produto, emoji, aspas, hashtag.',
    'Responda só a frase.',
  ].join(' ');
  return { model: modelo || MODELO_CHAMADA, max_tokens: 40, temperature: 0.9,
    messages: [{ role: 'system', content: sistema }, { role: 'user', content: `Produto: ${String(nome).slice(0, 200)}` }] };
}

/**
 * Confere a frase da IA. Volta a chamada em MAIÚSCULA ou null (aí entra a da
 * lista). Barra número que não está no nome, R$, %, promessa e frase grande.
 */
export function limparChamada(texto, nome) {
  let t = String(texto || '').split('\n').map(x => x.trim()).find(Boolean) || '';
  t = t.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').replace(/["'“”‘’*_#`]/g, '').replace(/^chamada\s*:\s*/i, '')
    .replace(/\s+/g, ' ').trim().replace(/[.!]+$/, '').trim().toUpperCase();
  if (t.length < 8 || t.length > 60 || t.split(' ').length > 10) return null;
  if (/R\$|%|FRETE|GR[AÁ]TIS|MENOR PRE[CÇ]O|[UÚ]LTIM[OA]|S[OÓ] HOJE|ACABA HOJE/.test(t)) return null;
  const numsNome = new Set(String(nome || '').match(/\d+/g) || []);
  if ((t.match(/\d+/g) || []).some(n => !numsNome.has(n))) return null;
  return t;
}

/**
 * A legenda de um achado, no padrão dos grupos de oferta:
 *   CHAMADA / Nome / 💵 De R$X por R$Y pix / 🛒 link / 🏷️ Use o cupom A + B
 * Nada do texto de quem postou antes vai junto (a chamada é nossa).
 */
export function legendaAchado({ nome, preco, precoAntes, pagamento, aPartir, link, cupons, chave, prime, chamada }) {
  const p = reaisCurto(preco), a = precoAntes && precoAntes > preco ? reaisCurto(precoAntes) : null;
  const linhas = [chamada || gancho(chave || nome, descontoDe(preco, precoAntes)), '', String(nome).trim().slice(0, 110), ''];
  const forma = [pagamento, prime ? '(oferta Prime)' : ''].filter(Boolean).join(' ');
  if (p) linhas.push(`\u{1F4B5} ${a ? `De R$${a} por ` : 'Por '}${aPartir ? 'a partir de ' : ''}R$${p}${forma ? ' ' + forma : ''}`);
  linhas.push(`\u{1F6D2} ${link}`);
  const c = (cupons || []).slice(0, 2);
  if (c.length) linhas.push('', `\u{1F3F7}\uFE0F Use o cupom ${c.join(' + ')}`);
  linhas.push('', '_Link de afiliado. Preço sujeito a alteração._');
  return linhas.join('\n');
}

/** A legenda de um post de cupom. */
export function legendaCupom({ loja, linhasCupom, cupons, link }) {
  const linhas = [`\u{1F39F} *CUPOM${loja ? ' ' + loja.toUpperCase() : ''}*`, ''];
  const corpo = (linhasCupom || []).slice(0, 6);
  if (corpo.length) linhas.push(...corpo); else for (const c of cupons || []) linhas.push(`Cupom: *${c}*`);
  if (link) linhas.push('', `\u{1F449} ${link}`, '', '_Link de afiliado._');
  return linhas.join('\n');
}

const NOME_LOJA = { amazon: 'Amazon', magalu: 'Magalu', shopee: 'Shopee', mercadolivre: 'Mercado Livre' };

/** Ofertas da página da Amazon (/deals): o JSON productSearchResponse. */
export function lerAmazonDeals(html) {
  const b = String(html || '');
  const i = b.indexOf('"productSearchResponse":');
  if (i < 0) return [];
  const ini = b.indexOf('[', b.indexOf('"products":', i));
  if (ini < 0) return [];
  let prof = 0, fim = -1, emTexto = false;
  for (let k = ini; k < b.length; k++) {
    const ch = b[k];
    if (emTexto) { if (ch === '\\') k++; else if (ch === '"') emTexto = false; continue; }
    if (ch === '"') emTexto = true;
    else if (ch === '[' || ch === '{') prof++;
    else if (ch === ']' || ch === '}') { prof--; if (prof === 0) { fim = k; break; } }
  }
  if (fim < 0) return [];
  let produtos;
  try { produtos = JSON.parse(b.slice(ini, fim + 1)); } catch (e) { return []; }
  return produtos.map(p => {
    const preco = Number(p.price && p.price.priceToPay && p.price.priceToPay.price);
    const antes = Number(p.price && p.price.basisPrice && p.price.basisPrice.price);
    const img = p.image && (p.image.hiRes || p.image.lowRes);
    const prime = /prime/i.test(JSON.stringify((p.dealBadge && p.dealBadge.messaging) || ''));
    return {
      asin: p.asin, nome: p.title, preco: isFinite(preco) && preco > 0 ? preco : null,
      precoAntes: isFinite(antes) && antes > 0 ? antes : null,
      desconto: isFinite(preco) && isFinite(antes) && antes > preco ? Math.round((1 - preco / antes) * 100) : 0,
      foto: img ? `${img.baseUrl}.${img.extension || 'jpg'}` : null,
      disponivel: !p.dealDetails || p.dealDetails.state === 'AVAILABLE', prime,
    };
  }).filter(p => p.asin && p.nome && p.preco && p.disponivel);
}

const diaSP = (agora) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora);
const horaSP = (agora) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }).format(agora));

/** Arruma a memória do fluxo: zera a conta no dia novo e esquece o velho. */
export function arrumarMemoria(mem, agora) {
  const dia = diaSP(agora), t = agora.getTime();
  if (mem.dia !== dia) { mem.dia = dia; mem.postados = 0; mem.cupons = 0; }
  mem.vistos = mem.vistos || {}; mem.produtos = mem.produtos || {};
  for (const [k, v] of Object.entries(mem.vistos)) if (t - v > 3 * 864e5) delete mem.vistos[k];
  for (const [k, v] of Object.entries(mem.produtos)) if (t - v > 7 * 864e5) delete mem.produtos[k];
  return mem;
}

/** Pode postar agora? Janela de horário (SP) e limite do dia. */
export function podeAgora(mem, agora, cfg) {
  const h = horaSP(agora);
  if (h < cfg.inicio || h >= cfg.fim) return { ok: false, motivo: 'fora_do_horario' };
  if ((mem.postados || 0) >= cfg.porDia) return { ok: false, motivo: 'limite_do_dia' };
  return { ok: true };
}

/**
 * Escolhe e prepara UMA oferta. Ordem: produto de canal (mais novo primeiro),
 * depois produto da Amazon (maior desconto), depois cupom (até cfg.cuponsPorDia).
 * Todo post de canal tentado fica em mem.vistos (não tenta de novo). Volta
 * { acao: 'postar', tipo, chave, texto, imagem, fonte } ou { acao: 'nada', motivo, tentou }.
 */
export async function garimpar({ canais = {}, amazonHtml = '', agora, cfg, mem, rede }) {
  const t = agora.getTime(), tentou = [];
  const lista = cfg.proibido || PROIBIDO_PADRAO;
  const posts = [];
  for (const [canal, html] of Object.entries(canais))
    for (const p of lerCanalTelegram(html)) {
      const idade = p.quando ? t - Date.parse(p.quando) : Infinity;
      if (idade > cfg.idadeMaxMin * 6e4 || mem.vistos[p.id]) continue;
      posts.push({ ...p, canal, ...lerPost(p.texto) });
    }
  posts.sort((a, b) => Date.parse(b.quando) - Date.parse(a.quando));
  const pessoal = (c) => (cfg.canais || Object.keys(canais)).some(n => c.toUpperCase().includes(String(n).toUpperCase().slice(0, 5)));

  const converterTodos = async (links, nomePost) => {
    const out = [];
    for (const l of links) { const c = await converterLink(l, cfg, rede, true, nomePost); if (!c.ok) return { ok: false, motivo: c.motivo }; out.push(c); }
    return { ok: true, out };
  };

  let tentativas = 0;
  for (const tipo of ['produto', 'cupom']) {
    if (tipo === 'cupom' && (mem.cupons || 0) >= cfg.cuponsPorDia) continue;
    for (const p of posts.filter(x => x.tipo === tipo)) {
      if (tentativas >= cfg.maxTentativas) break;
      mem.vistos[p.id] = t;
      if (proibido(p.texto, lista)) { tentou.push([p.id, 'proibido']); continue; }
      if (p.cupons.some(pessoal)) { tentou.push([p.id, 'cupom_do_canal']); continue; }
      tentativas++;
      const principal = p.link || p.links[p.links.length - 1];
      if (!principal && tipo === 'produto') { tentou.push([p.id, 'sem_link']); continue; }
      const c = principal ? await converterTodos([principal], p.nome) : { ok: false, motivo: 'sem_link' };
      if (!c.ok) {
        if (tipo === 'cupom' && p.cupons.length) {   // cupom sem link convertível: sai só com o código
          return { acao: 'postar', tipo, chave: `cupom:${p.cupons.join(',')}`, fonte: p.id, imagem: '',
            texto: legendaCupom({ linhasCupom: p.linhasCupom, cupons: p.cupons }) };
        }
        tentou.push([p.id, c.motivo]); continue;
      }
      const [prim] = c.out;
      if (tipo === 'produto') {
        if (mem.produtos[prim.chave]) { tentou.push([p.id, 'repetido']); continue; }
        const chamada = await pedirChamada(rede, p.nome);
        return { acao: 'postar', tipo, chave: prim.chave, fonte: p.id, imagem: p.foto || '', chamada_ia: !!chamada,
          texto: legendaAchado({ nome: p.nome, preco: p.preco, precoAntes: p.precoAntes, pagamento: p.pagamento, aPartir: p.aPartir,
            link: prim.url, cupons: p.cupons, chave: prim.chave, chamada }) };
      }
      const chave = `cupom:${p.cupons.join(',') || prim.chave}`;
      if (mem.produtos[chave]) { tentou.push([p.id, 'repetido']); continue; }
      return { acao: 'postar', tipo, chave, fonte: p.id, imagem: '',
        texto: legendaCupom({ loja: NOME_LOJA[prim.loja] || '', linhasCupom: p.linhasCupom, cupons: p.cupons, link: prim.url }) };
    }
    if (tipo === 'produto' && cfg.amazonTag) {
      const achados = lerAmazonDeals(amazonHtml)
        .filter(a => a.desconto >= cfg.descontoMin && !mem.produtos[`amazon:${a.asin}`] && !proibido(a.nome, lista))
        .sort((a, b) => b.desconto - a.desconto);
      if (achados.length) {
        const a = achados[0];
        const chamada = await pedirChamada(rede, a.nome);
        return { acao: 'postar', tipo: 'produto', chave: `amazon:${a.asin}`, fonte: 'amazon/deals', imagem: a.foto || '', chamada_ia: !!chamada,
          texto: legendaAchado({ nome: a.nome, preco: a.preco, precoAntes: a.precoAntes, prime: a.prime, chave: `amazon:${a.asin}`, chamada,
            link: `https://www.amazon.com.br/dp/${a.asin}?tag=${encodeURIComponent(cfg.amazonTag)}` }) };
      }
    }
  }
  return { acao: 'nada', motivo: 'sem_oferta_convertivel', tentou };
}

/** A chamada da IA, se houver; qualquer falha vira null (o post sai com a chamada da lista). */
async function pedirChamada(rede, nome) {
  if (!rede || !rede.chamada) return null;
  try { return await rede.chamada(nome); } catch (e) { return null; }
}

/** Depois que o gateway confirmou: conta e guarda o produto. */
export function registrarPostado(mem, { chave, tipo }, agora) {
  mem.postados = (mem.postados || 0) + 1;
  if (tipo === 'cupom') mem.cupons = (mem.cupons || 0) + 1;
  if (chave) mem.produtos[chave] = agora.getTime();
  return mem;
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

/** A rede de verdade dentro do nó Code: http = this.helpers, env = $env. */
export function redeN8n(http, env) {
  return {
    abrir: (url) => abrirLink(url, (u) => http.httpRequest({ method: 'GET', url: u, disableFollowRedirect: true,
      returnFullResponse: true, ignoreHttpStatusErrors: true, timeout: 15000, headers: { 'User-Agent': UA } })),
    async shopee(url) {
      const corpo = shopeeCorpo(url, ['grupo']);
      const auth = shopeeAutorizacao(env.SHOPEE_APP_ID, env.SHOPEE_SECRET, corpo);
      let r = await http.httpRequest({ method: 'POST', url: 'https://open-api.affiliate.shopee.com.br/graphql',
        headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: corpo, json: false, timeout: 15000 });
      if (typeof r === 'string') r = JSON.parse(r);
      return (r && r.data && r.data.generateShortLink && r.data.generateShortLink.shortLink) || null;
    },
    async chamada(nome) {
      if (!env.OPENROUTER_API_KEY) return null;
      const r = await http.httpRequest({ method: 'POST', url: 'https://openrouter.ai/api/v1/chat/completions', json: true, timeout: 12000,
        headers: { Authorization: `Bearer ${env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'X-Title': 'Ofertas' },
        body: pedidoChamada(nome, env.OPENROUTER_MODELO) });
      const texto = r && r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content;
      return limparChamada(texto, nome);
    },
    async pagina(url) {
      const r = await http.httpRequest({ method: 'GET', url, returnFullResponse: true, ignoreHttpStatusErrors: true, json: false,
        timeout: 20000, headers: { 'User-Agent': UA, 'Accept-Language': 'pt-BR,pt;q=0.9' } });
      return r && r.statusCode === 200 && typeof r.body === 'string' ? r.body : '';
    },
  };
}
