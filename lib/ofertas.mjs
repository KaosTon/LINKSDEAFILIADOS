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
    // Encaminhada de outro grupo, a oferta chega como prévia de link: a foto
    // vem em text.thumbnailUrl, não em image.
    imagem: img ? (img.imageUrl || img.url || null) : ((b.text && b.text.thumbnailUrl) || null),
    // A da prévia é miniatura (17/10: 106x140, sai borrada no post): a foto oficial vem primeiro.
    miniatura: !img && !!(b.text && b.text.thumbnailUrl),
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
  // Link curto: o nome do produto no endereço é enfeite, /p/MLB123 abre o mesmo produto.
  const cat = u.pathname.match(/\/(p\/MLB\d+|up\/MLBU\d+)/i);
  if (cat) { u.hostname = 'www.mercadolivre.com.br'; u.pathname = `/${cat[1]}`; }
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
/** Quantas unidades o nome diz ("Kit 3", "2 unidades", "com 4"); 1 se não diz. */
export function quantidade(nome) {
  const t = semAcento(nome);
  const m = t.match(/\b(?:kit|combo|pack|c\/)\s*(?:com\s*)?(\d{1,2})\b/) || t.match(/\b(\d{1,2})\s*(?:un|unid|unidades|pecas|pares|pcs|latas|rolos|pacotes|caixas|frascos|potes)\b/);
  return m ? Number(m[1]) : 1;
}

/**
 * Vitrine de afiliado do ML (mercadolivre.com.br/social/fulano?ref=...): o meli.la
 * de outro canal cai aqui, e o produto divulgado é o card em destaque
 * (c_id=/home/card-featured), com preço. O resto da página é recomendação.
 */
export function lerVitrineML(html) {
  const b = String(html || '').replace(/\\u002F/gi, '/').replace(/\\\//g, '/');
  const dest = b.match(/href="(https?:\/\/[^"]*?MLB-?(\d{6,})[^"]*?card-featured[^"]*)"/);
  if (!dest) return null;
  const id = `MLB${dest[2]}`;
  // Card novo (18/10): metadata.id é o anúncio e o do produto de catálogo vem em product_id.
  let k = b.indexOf(`"metadata":{"id":"${id}"`);
  if (k < 0) k = b.indexOf(`"product_id":"${id}"`);
  if (k < 0) return null;
  const card = b.slice(k, k + 4000);
  const titulo = (card.match(/"title":\{"text":"([^"]+)"/) || [])[1];
  const preco = Number((card.match(/"current_price":\{"value":([\d.]+)/) || [])[1]) || null;
  const antes = Number((card.match(/"previous_price":\{"value":([\d.]+)/) || [])[1]) || null;
  const url = dest[1].replace(/&amp;/g, '&').split(/[?#]/)[0];
  if (!titulo || !preco) return null;
  const og = (b.match(/property="og:image" content="(https:\/\/[^"]+)"/) || [])[1] || null;
  return { id, url, nome: titulo, preco, precoDe: antes && antes > preco && antes <= preco * 5 ? antes : null, foto: og };
}

export function escolherProdutoML(html, nome) {
  const b = String(html || '').replace(/\\u002F/gi, '/').replace(/\\\//g, '/').replace(/&amp;/g, '&');
  if (/abuse-captcha/.test(b.slice(0, 2000))) return null;
  // No JSON da página o endereço vem sem "https://" (www.mercadolivre.com.br/...).
  // produto.mercadolivre.com.br/MLB-123-... vem logo depois do domínio (sem outra barra):
  // até 16/10 esse formato nunca casava e sobravam só as recomendações da vitrine.
  const achados = [...b.matchAll(/(?:https?:\/\/)?(?:www\.|produto\.)mercadolivre\.com\.br\/(?:[^"'\s<>]*?\/)?(?:p\/MLB\d+|up\/MLBU\d+|MLB-\d+[^"'\s<>?#]*)/g)]
    .map(m => (/^https?:/.test(m[0]) ? m[0] : `https://${m[0]}`));
  const alvo = palavras(nome);
  if (alvo.length < 2) return null;
  const q = quantidade(nome);
  let melhor = null, nota = 0;
  const vistos = new Set();
  for (const url of achados) {
    const id = (url.match(/MLBU?-?\d+/i) || [''])[0].replace('-', '');
    if (vistos.has(id)) continue;
    vistos.add(id);
    // "Kit 3 Legging" não pode virar a legging avulsa (16/10).
    if (quantidade(url.split('mercadolivre.com.br/')[1].replace(/[-_/]/g, ' ')) !== q) continue;
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
  ml_de_outra_pessoa: 'Mercado Livre: esse meli.la é de outra pessoa e não achei o produto para trocar pelo seu link; gere o link no seu painel',
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

  const mapa = {}, chaves = {}, problemas = [];
  const lido = lerPost(m.texto);
  const nomePost = lido.nome;
  for (const de of links) {
    const c = await converterLink(de, cfg, rede, false, nomePost);
    if (c.ok) { mapa[de] = c.url; chaves[de] = c.chave || ''; } else problemas.push(c.motivo);
  }
  if (problemas.length) return recusa(problemas);
  const principal = (lido.link && mapa[lido.link]) ? lido.link : links[links.length - 1];
  const nome = nomePost || String(m.texto).split('\n').map(s => s.trim()).find(s => s && !/https?:/i.test(s)) || '';
  // Sem foto na mensagem (texto puro, 14/10): busca a foto oficial na loja.
  const imagem = (m.imagem && !m.miniatura ? m.imagem : '') || await fotoDaLoja(chaves[principal], rede, mapa[principal]) || m.imagem;
  // Com nome e preço lidos, sai no padrão do grupo (o mesmo do garimpo); senão, o texto como veio.
  let texto = trocarLinks(m.texto, mapa).trim();
  if (!cupom && lido.tipo === 'produto' && nomePost && lido.preco) {
    const chamada = await pedirChamada(rede, nomePost);
    const linhas = String(m.texto).split('\n');
    const outros = links.filter(l => l !== principal).map(l => {
      const k = linhas.findIndex(x => x.includes(l));
      const perto = `${linhas[k] || ''} ${linhas[k - 1] || ''}`;
      return /cupo/i.test(perto) ? `\u{1F3F7}\uFE0F Resgate o cupom: ${mapa[l]}` : `\u{1F517} ${mapa[l]}`;
    });
    texto = legendaAchado({ ...lido, nome: nomePost, link: mapa[principal], chave: chaves[principal], chamada });
    if (outros.length) texto += `\n\n${outros.join('\n')}`;
  }
  // Com foto, sai como prévia grande do link (send-link) com o nome como título.
  return { acao: 'postar', postar: true, grupo: cfg.grupo, texto, imagem: imagem || '',
    link: imagem ? (mapa[principal] || '') : '', titulo: nome.slice(0, 100) };
}

/** Foto oficial do produto: API da Shopee (por loja e item) ou página da Amazon. Sem foto, volta ''. */
async function fotoDaLoja(chave, rede, url) {
  const k = String(chave || '');
  const cat = String(url || '').match(/mercadolivre\.com\.br\/p\/(MLB\d+)/i);
  try {
    if (k.startsWith('shopee:') && rede.shopeeProduto) {
      const [loja, item] = k.slice(7).split('.');
      const o = await rede.shopeeProduto(loja, item);
      return (o && o.foto) || '';
    }
    if (cat && rede.mlCatalogo) return ((await rede.mlCatalogo(cat[1].toUpperCase())) || {}).foto || '';
    if (k.startsWith('amazon:') && rede.pagina) return lerPaginaAmazon(await rede.pagina(`https://www.amazon.com.br/dp/${k.slice(7)}`)).foto || '';
  } catch (e) { /* sem foto, segue sem */ }
  return '';
}

/** Resumo do dia para o rascunho (22h): o que saiu por loja e o que foi descartado e por quê. */
const MOTIVO_RESUMO = {
  preco_diferente_da_loja: 'Preço do canal diferente da loja', produto_diferente_do_post: 'Link com produto diferente do texto',
  ml_sem_conferir_antigo: 'ML sem como conferir e post antigo', sem_preco_na_loja: 'Sem preço ou estoque na loja',
  sem_foto: 'Sem foto', foto_de_outro_grupo: 'Foto com marca de outro grupo', sem_nome: 'Sem nome de produto',
  repetido: 'Repetido (já saiu na semana)', parecido_com_recente: 'Parecido com um post recente', proibido: 'Categoria proibida',
  cupom_do_canal: 'Cupom pessoal do canal', ml_terceiro: 'ML de outro canal sem achar o produto', nao_abriu: 'Link que não abriu',
  loja_desconhecida: 'Loja que não converto', ml_de_outra_pessoa: 'ML de outra pessoa', sem_link: 'Sem link',
  loja_pouco_confiavel: 'Shopee: nota ou vendas baixas, ou produto caro em loja comum',
};
const LOJA_RESUMO = { amazon: 'Amazon', shopee: 'Shopee', ml: 'Mercado Livre', magalu: 'Magalu', cupom: 'Cupons' };
export function lojaDaChave(chave) {
  const k = String(chave || '').split(':')[0];
  return LOJA_RESUMO[k] ? k : 'outra';
}
/**
 * Painel do resumo (17/10): membros do grupo (Z-API), cliques no convite e nas ofertas (encurtador)
 * e vendas da Shopee (conversionReport). Cada parte que falhar fica de fora, o resumo sai igual.
 * Os contadores do encurtador são acumulados: o do dia sai da diferença para a foto da véspera,
 * guardada em mem.historico (um registro por dia, 40 dias).
 */
export async function coletarPainel(rede, grupos, agora) {
  const p = { membros: null, cliques: null, shopee: null };
  try {
    const n = [];
    for (const g of grupos) n.push(await rede.membrosDoGrupo(g));
    if (n.length && n.every(x => Number.isInteger(x))) p.membros = n.reduce((a, b) => a + b, 0);
  } catch (e) { /* sem membros */ }
  try { p.cliques = (await rede.cliques()) || null; } catch (e) { /* sem cliques */ }
  try {
    const ini = Math.floor(Date.parse(`${diaSP(agora)}T00:00:00-03:00`) / 1000);
    p.shopee = (await rede.shopeeVendas(ini, Math.floor(agora.getTime() / 1000))) || null;
  } catch (e) { /* sem Shopee */ }
  return p;
}

const menosDias = (dia, n) => new Date(Date.parse(`${dia}T12:00:00Z`) - n * 864e5).toISOString().slice(0, 10);
const diferenca = (agora, antes) => Object.fromEntries(Object.entries(agora || {})
  .map(([k, v]) => [k, v - ((antes || {})[k] || 0)]).filter(([, v]) => v > 0));

/** Guarda a foto do dia em mem.historico e devolve o que o resumo mostra. */
export function guardarPainel(mem, agora, p) {
  const dia = diaSP(agora);
  const links = {};
  for (const l of (p.cliques && p.cliques.top) || []) links[l.url] = l.cliques;
  const hoje = { dia, membros: p.membros, grupo: (p.cliques && p.cliques.grupo) || null, links: p.cliques ? links : null };
  const hist = (mem.historico || []).filter(h => h.dia !== dia);
  const ontem = [...hist].reverse().find(h => h.dia < dia) || null;
  const semana = [...hist].reverse().find(h => h.dia <= menosDias(dia, 7) && h.membros != null) || null;
  mem.historico = [...hist, hoje].slice(-40);
  const titulo = (url) => (mem.titulos || {})[url] || url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40);
  return {
    membros: p.membros,
    membrosDia: p.membros != null && ontem && ontem.membros != null ? p.membros - ontem.membros : null,
    membrosSemana: p.membros != null && semana ? p.membros - semana.membros : null,
    convites: hoje.grupo ? (ontem && ontem.grupo ? diferenca(hoje.grupo, ontem.grupo) : null) : undefined,
    topOfertas: hoje.links && ontem && ontem.links
      ? Object.entries(diferenca(hoje.links, ontem.links)).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([url, n]) => ({ titulo: titulo(url), cliques: n }))
      : null,
    shopee: p.shopee,
    // Domingo: membros dia a dia na semana.
    semana: new Date(`${dia}T12:00:00Z`).getUTCDay() === 0
      ? mem.historico.filter(h => h.dia > menosDias(dia, 7) && h.membros != null).map(h => [h.dia.slice(8, 10) + '/' + h.dia.slice(5, 7), h.membros])
      : null,
  };
}

const sinal = (n) => (n > 0 ? `+${n}` : String(n));
function linhasPainel(x) {
  const l = [];
  if (x.membros != null) {
    const d = [x.membrosDia != null ? `hoje ${sinal(x.membrosDia)}` : null, x.membrosSemana != null ? `7 dias ${sinal(x.membrosSemana)}` : null].filter(Boolean);
    l.push('', '\u{1F465} *Grupo*', `\u2022 Membros: ${x.membros}${d.length ? ` (${d.join(', ')})` : ''}`);
  }
  if (x.convites) {
    const c = Object.entries(x.convites).sort((a, b) => b[1] - a[1]);
    const total = c.reduce((n, [, v]) => n + v, 0);
    if (!l.length) l.push('', '\u{1F465} *Grupo*');
    l.push(`\u2022 Cliques no convite hoje: ${total}${c.length ? ` (${c.map(([k, v]) => `${k} ${v}`).join(', ')})` : ''}`);
  } else if (x.convites === null) {
    if (!l.length) l.push('', '\u{1F465} *Grupo*');
    l.push('\u2022 Cliques no convite: começa a contar amanhã');
  }
  if (x.semana && x.semana.length > 1) l.push(`\u{1F4C8} Semana: ${x.semana.map(([d, n]) => `${d} ${n}`).join(' \u00B7 ')}`);
  if (x.topOfertas && x.topOfertas.length) {
    l.push('', '\u{1F525} *Mais clicadas hoje*');
    for (const o of x.topOfertas) l.push(`\u2022 ${o.titulo.slice(0, 50)}: ${o.cliques}`);
  }
  if (x.shopee) {
    const s = x.shopee;
    l.push('', '\u{1F6CD}\uFE0F *Shopee hoje*', s.pedidos
      ? `\u2022 ${s.pedidos} ${s.pedidos === 1 ? 'pedido' : 'pedidos'}, R$ ${reais(s.valor)} em compras, comissão estimada R$ ${reais(s.comissao)}`
      : '\u2022 Nenhuma venda registrada ainda (a Shopee pode levar algumas horas para mostrar)');
  }
  return l;
}

/** Vendas da Shopee no período (conversionReport): pedidos, valor das compras e comissão estimada. */
export function somarVendasShopee(nodes) {
  let pedidos = 0, valor = 0, comissao = 0;
  for (const n of nodes || []) {
    pedidos += (n.orders || []).length || 1;
    comissao += Number(n.estimatedTotalCommission || n.totalCommission) || 0;
    for (const o of n.orders || []) for (const i of o.items || []) valor += Number(i.actualAmount) || 0;
  }
  return { pedidos, valor: Math.round(valor * 100) / 100, comissao: Math.round(comissao * 100) / 100 };
}

export function textoResumo(mem, agora, painel = null) {
  const r = mem.resumo || { lojas: {}, descartes: {} };
  const dia = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' }).format(agora);
  const lojas = Object.entries(r.lojas).sort((a, b) => b[1] - a[1]);
  const desc = Object.entries(r.descartes).sort((a, b) => b[1] - a[1]);
  const total = (l) => l.reduce((n, [, v]) => n + v, 0);
  const linhas = [`\u{1F4CA} *Resumo do robô (${dia})*`, '', `\u2705 Postados: ${total(lojas)}`];
  for (const [k, v] of lojas) linhas.push(`\u2022 ${LOJA_RESUMO[k] || 'Outras'}: ${v}`);
  linhas.push('', `\u{1F6AB} Descartados: ${total(desc)}`);
  for (const [k, v] of desc.slice(0, 8)) linhas.push(`\u2022 ${MOTIVO_RESUMO[k] || k}: ${v}`);
  if (painel) linhas.push(...linhasPainel(painel));
  return linhas.join('\n');
}
export const horaDoResumo = (mem, agora, cfg) => horaSP(agora) >= cfg.fim && mem.resumoDia !== diaSP(agora);

/** Dentro da janela do dia, a partir da hora h (0 desliga) e ainda não feito hoje (campo `${qual}Dia`). */
const naHora = (mem, agora, cfg, h, qual) => h > 0 && horaSP(agora) >= h && horaSP(agora) < cfg.fim && mem[`${qual}Dia`] !== diaSP(agora);

/**
 * Convite diário (17/10): uma vez por dia, a partir de cfg.conviteHora (19h), o grupo recebe o
 * pedido para compartilhar, com o link de entrada que conta a origem no encurtador (?de=indicacao).
 */
export const horaDoConvite = (mem, agora, cfg) => naHora(mem, agora, cfg, cfg.conviteHora, 'convite');
export function textoConvite(link) {
  return ['\u{1F4F2} *Gostou das ofertas?*', '', 'Manda o grupo para quem também ama promoção. É grátis e dá para sair quando quiser:',
    `\u{1F449} ${link}?de=indicacao`].join('\n');
}

/**
 * Sugestão de status (17/10): a Z-API só tem o número do robô, e o status dele quase ninguém vê
 * (só quem tem o número salvo). Então, a partir de cfg.statusHora (12h), a oferta de maior desconto
 * do dia até ali (mem.melhorDoDia, guardada no nó Anota) vai para o rascunho com o link do grupo no
 * fim, pronta para o Wellington encaminhar para "Meu status".
 */
export const horaDoStatus = (mem, agora, cfg) => naHora(mem, agora, cfg, cfg.statusHora, 'status')
  && !!(mem.melhorDoDia && mem.melhorDoDia.dia === diaSP(agora) && mem.melhorDoDia.imagem);
export function textoStatus(oferta, link) {
  return `${String(oferta.texto || '').trim()}\n\n\u{1F4F2} Mais ofertas assim, todo dia, no grupo grátis:\n\u{1F449} ${link}?de=status`;
}

/**
 * Encurtador próprio (temdescontos.com.br/a7k2p), 16/10: só os links do
 * Mercado Livre, que são os enormes. Amazon fica direto (a regra dela pede
 * que fique claro que o link vai para a Amazon) e a Shopee já vem curta.
 * Se o encurtador falhar, o link original fica: post nunca sai com link curto que não abre.
 */
export const ehLinkML = (u) => /^https:\/\/(?:www\.|produto\.)?mercadolivre\.com\.br\//i.test(String(u || ''));
export async function encurtarLinks(msg, encurtar) {
  const urls = [...new Set([...extrairLinks(msg.message), ...(msg.link ? [msg.link] : [])].filter(ehLinkML))];
  const mapa = {};
  for (const u of urls) {
    try { const c = await encurtar(u); if (/^https:\/\/\S+$/.test(String(c || ''))) mapa[u] = c; } catch (e) { /* fica o original */ }
  }
  return { ...msg, message: trocarLinks(msg.message, mapa), link: msg.link ? (mapa[msg.link] || msg.link) : msg.link, encurtados: Object.keys(mapa).length };
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
  if (/shopee\.com\.br$/.test(h) && (m = p.match(/i\.(\d+)\.(\d+)/) || p.match(/product\/(\d+)\/(\d+)/) || p.match(/\/(\d{5,})\/(\d{5,})(?:\/|$)/))) return `shopee:${m[1]}.${m[2]}`;
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
  const v = lerVitrineML(html);
  if (v && mesmoProduto(nome, v.nome) && quantidade(v.nome) === quantidade(nome))
    return { ok: true, loja: 'mercadolivre', url: mlAfiliado(v.url, cfg), chave: chaveProduto(v.url), vitrine: v };
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
    if (dono.toLowerCase() !== String(cfg.mlEtiqueta).trim().toLowerCase()) {
      // meli.la de outro afiliado (encaminhado de outro grupo): acha o produto
      // pelo nome, igual ao garimpo, e monta o link com a sua etiqueta.
      if (nome && cfg.mlTool) { const c = await mlDeTerceiro(destino, cfg, rede, nome); if (c.ok) return c; }
      return { ok: false, motivo: 'ml_de_outra_pessoa' };
    }
    return { ok: true, url: de, chave: de };
  }
  if (!lojaFinal(url)) {
    try { url = await rede.abrir(url); }
    catch (e) { return { ok: false, motivo: plataformaDe(de) === 'outra' ? 'loja_desconhecida' : 'nao_abriu' }; }
  }
  if (terceiro && plataformaDe(url) === 'mercadolivre' && !mlAfiliado(url, cfg)) return mlDeTerceiro(url, cfg, rede, nome);
  // Rascunho (18/10): link escondido (cutt.ly, bit.ly) que cai na vitrine de outro afiliado: acha o produto pelo nome.
  if (!terceiro && nome && cfg.mlTool && plataformaDe(url) === 'mercadolivre' && !mlAfiliado(url, cfg)) {
    const c = await mlDeTerceiro(url, cfg, rede, nome);
    if (c.ok) return c;
  }
  let c = converterSemRede(url, cfg);
  if (c.rede === 'shopee') {
    if (!cfg.shopee) return { ok: false, motivo: 'falta_shopee' };
    let curto = null;
    try { curto = await rede.shopee(limparShopee(url)); } catch (e) { curto = null; }
    c = curto ? { ok: true, loja: 'shopee', url: curto } : { ok: false, motivo: 'shopee_recusou' };
  }
  if (!c.ok) return c;
  // Amazon sai sempre no formato limpo /dp/ASIN?tag=, sem o rastreio de quem postou antes.
  if (c.loja === 'amazon') c.url = amazonCanonico(url, cfg.amazonTag);
  return { ...c, chave: chaveProduto(url) };
}

// ------------------------------------------------------------ a saída (Z-API)

/**
 * Foto no formato da prévia grande do WhatsApp (1200x630, deitada) com borda branca:
 * sem isso a foto quadrada do produto sai cortada (teste no grupo, 14/10).
 * Se o serviço de imagem cair, o send-link falha e o gateway manda a foto original (plano B).
 */
export function enquadrar(foto) {
  if (!foto || /images\.weserv\.nl/.test(foto)) return foto;
  return `https://images.weserv.nl/?url=${encodeURIComponent(foto)}&w=1200&h=630&fit=contain&cbg=white&output=jpg`;
}

/**
 * O pedido de envio. Com link e foto: send-link (a prévia grande do link com a
 * foto, como nos grupos de oferta). Só foto: send-image com legenda. Senão,
 * send-text. `forma: 'imagem'` força o send-image (plano B do gateway).
 */
export function pedidoZapi({ phone, message, image, link, titulo, forma }, cfg) {
  if (!cfg.base || !cfg.instancia || !cfg.token) throw new Error('falta ZAPI_BASE_URL, ZAPI_INSTANCE_ID ou ZAPI_INSTANCE_TOKEN');
  const raiz = `${String(cfg.base).replace(/\/+$/, '')}/instances/${cfg.instancia}/token/${cfg.token}`;
  if (image && link && forma !== 'imagem')
    return { url: `${raiz}/send-link`, body: { phone, message: message || '', image: enquadrar(image), linkUrl: link,
      title: String(titulo || '').slice(0, 100), linkDescription: '', linkType: 'LARGE' } };
  return image
    ? { url: `${raiz}/send-image`, body: { phone, image, caption: message || '' } }
    : { url: `${raiz}/send-text`, body: { phone, message } };
}

/**
 * Vários grupos de ofertas (17/10): GRUPO_OFERTAS aceita mais de um id,
 * separados por vírgula, ponto e vírgula ou quebra de linha. Um grupo só
 * continua funcionando igual.
 */
export function listaDeGrupos(texto) {
  return [...new Set(String(texto || '').split(/[\s,;]+/).map(g => g.trim()).filter(Boolean))];
}

/**
 * Espera entre um grupo e o próximo, em ms: o intervalo pedido com variação de
 * 30% para cima ou para baixo (mandar tudo no mesmo segundo, sempre no mesmo
 * ritmo, tem cara de disparo). O total fica abaixo de 200 s para o nó do n8n
 * não estourar o tempo, mesmo com muitos grupos.
 */
export function pausaEntreGrupos(qtd, segundos = 15, sorteio = Math.random) {
  if (qtd < 2 || !(segundos > 0)) return 0;
  const teto = 200000 / (qtd - 1);
  return Math.floor(Math.min(segundos * 1000 * (0.7 + 0.6 * sorteio()), teto));
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
    // Só foto de verdade (cdn*.telesco.pe/file/...): post sem foto traz um emoji no lugar.
    const foto = (x.match(/tgme_widget_message_photo_wrap[^>]*background-image:url\('(https:\/\/cdn\d*\.telesco\.pe\/file\/[^']+)'\)/) || [])[1] || null;
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
  const semEmoji = (l) => l.replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}\uFE0F]/gu, '').trim();
  // Linha de preço: não confundir com condição de cupom ("acima de R$89", "limite R$30", "R$30 OFF").
  const eLinhaPreco = (l) => PRECO_RE.test(l) && !/OFF|acima|limite|cupo|frete/i.test(l);
  const linhaDe = linhas.find(l => /^[^\p{L}\d]*de\s*:?\s*R\$/iu.test(l) && !/\bpor\b/i.test(l));
  const precoLinha = linhas.find(l => l !== linhaDe && eLinhaPreco(l) && /\bpor\b|🔥|✅|💵|💰|💸/iu.test(l)) || linhas.find(l => l !== linhaDe && eLinhaPreco(l));
  const lido = lerPreco(precoLinha);
  const { preco, pagamento, aPartir } = lido;
  let precoAntes = lido.precoAntes;
  if (!precoAntes && linhaDe) { const a = numero((linhaDe.match(PRECO_RE) || [])[1]); if (a && preco && a > preco) precoAntes = a; }
  // Segundo preço (pix e parcelado): "R$ 395,91 em até 7x sem juros".
  const outra = linhas.find(l => l !== precoLinha && l !== linhaDe && eLinhaPreco(l));
  const o = outra ? lerPreco(outra) : null;
  const outroPreco = o && o.preco && o.preco !== preco ? { preco: o.preco, pagamento: o.pagamento } : null;
  const linhaFrete = linhas.find(l => /frete gr[aá]tis/i.test(l));
  const frete = linhaFrete ? `Frete grátis${/prime/i.test(linhaFrete) ? ' para assinantes Prime' : /meli\s*\+/i.test(linhaFrete) ? ' para assinantes Meli+' : ''}` : null;
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
  let nome = bullet ? bullet.replace(/^[-•▪\uFE0E·]\s*/, '') : (linhas.find(l => !chamada(l) && !PRECO_RE.test(l) && !/https?:/i.test(l) && !/link|loja:|frete/i.test(l) && !nomeFraco(semEmoji(l))) || '');
  // Formato "CHAMADA / frase de efeito / Nome / preço" (13/10): o nome é a linha logo antes do preço.
  const antes = linhas[linhas.indexOf(linhaDe || precoLinha) - 1];
  if (!bullet && antes && !chamada(antes) && !PRECO_RE.test(antes) && !/^https?:|link|loja:|frete/i.test(antes) && !nomeFraco(semEmoji(antes))
    && !/^\(.*\)$/.test(antes.trim())) nome = antes;
  // Nome e preço na mesma linha ("TV 65 Samsung | De R$4.899 Por R$3.899", 18/10): o nome é o que vem antes.
  const antesDoPreco = precoLinha ? semEmoji(precoLinha.split(/\s*[|:]?\s*\b(?:de|por)\s*:?\s*R\$/i)[0]).replace(/[\s|:]+$/, '').replace(/^\([^)]*\)\s*/, '') : '';
  if ((!nome || /https?:/i.test(nome)) && antesDoPreco && !PRECO_RE.test(antesDoPreco) && !chamada(antesDoPreco) && !nomeFraco(antesDoPreco)) nome = antesDoPreco;
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
  // Dica do cupom: o que vem junto do código ("+ Selecione PIX", "+ Aplicar cupom de 10% abaixo do valor").
  const codigos = [...new Set(cupons)];
  let dicaCupom = null;
  const linhaCupom = linhas.findIndex(l => codigos.some(c => l.includes(c)));
  if (linhaCupom >= 0) {
    let resto = linhas[linhaCupom] + (/^\+/.test(linhas[linhaCupom + 1] || '') ? ' ' + linhas[linhaCupom + 1] : '');
    resto = semEmoji(resto).replace(/^[^\p{L}]*/u, '').replace(/^(usem?|use|utilize)?\s*(o\s*)?(cupom|c[oó]digo)\s*:?\s*/i, '');
    for (const c of codigos) resto = resto.split(c).join('');
    resto = resto.replace(/(^|\s)\+(\s*\+)*/g, ' + ').replace(/^[\s+]+|[\s+]+$/g, '').replace(/\s+/g, ' ').trim();
    if (resto.length >= 4 && !PRECO_RE.test(resto)) dicaCupom = resto;
  }
  let linhaInstrucao = null;
  if (!codigos.length) {
    linhaInstrucao = linhas.find(l => /cupo/i.test(l) && /aplique|aplicar|ative|ativar|resgate|resgatar|selecione/i.test(l) && !eLinhaPreco(l)) || null;
    if (linhaInstrucao) dicaCupom = semEmoji(linhaInstrucao).replace(/^[^\p{L}\d]+/u, '').replace(/[!.]+$/, '').trim();
  }
  // "Resgate todos os cupons aqui:" apontava para um link do canal, que não vai junto (14/10).
  if (dicaCupom && /(aqui|abaixo|link)\s*:?\s*$|:\s*$/i.test(dicaCupom)) dicaCupom = null;
  // Avisos que mudam o preço: Prime, Meli+, desconto só no pix, cupom que não aparece pra todos.
  const LIXO = /#publi|caf[eé]|tempo limitado|visto em|grupo|canal|t\.me|siga|whats|https?:/i;
  const avisos = [...new Set(linhas
    .filter(l => l !== linhaFrete && l !== linhaInstrucao && !codigos.some(c => l.includes(c)) && !eLinhaPreco(l) && l !== linhaDe && !LIXO.test(l))
    .filter(l => /exclusiv|assinantes|tela de pagamento|alterar para (o )?pix|n[aã]o aparecer|resgat\w* (o |os )?cupo|aplic\w* (o )?cupo|ative o cupo|selecione/i.test(l))
    .map(l => { const t = semEmoji(l).replace(/^[^\p{L}\d]+/u, '').replace(/[!.]+$/, '').trim(); return t.charAt(0).toUpperCase() + t.slice(1); })
    .filter(t => t.length >= 6))].slice(0, 2);
  return { tipo: eCupomPost ? 'cupom' : (preco && (nome || link) ? 'produto' : 'outro'), nome, preco, precoAntes, pagamento, aPartir, outroPreco, frete,
    cupons: codigos, dicaCupom, avisos, linhasCupom, link };
}

/** O que não vai para o grupo. Dá para trocar a lista com GARIMPO_PROIBIDO (palavras separadas por vírgula). */
export const PROIBIDO_PADRAO = ['whisky', 'whiskey', 'vodka', 'cerveja', 'vinho', ' gin ', 'licor', 'cachaça', 'tequila', 'espumante',
  'champagne', 'rum ', 'sex shop', 'vibrador', 'erótic', 'erotic', 'aposta', 'cassino', ' bet ', 'vape', 'pod descartável',
  'cigarro eletr', 'narguil', 'arma de fogo', 'munição', 'pistola', 'revólver'];
/**
 * Eletrônico pelo nome (17/10: o Wellington quer mais eletrônico no grupo; de 14 posts do dia, 4 eram).
 * Serve só para dar a vez (cfg.eletronicoACada); errar aqui não barra nenhuma oferta.
 */
const ELETRONICO = /\b(smartphones?|celular|iphone|galaxy|xiaomi|redmi|poco|motorola|smart ?tv|tv|televis|monitor|notebook|laptop|chromebook|tablet|ipad|fones?|headsets?|earbuds?|airpods|airdots|caixa de som|soundbar|jbl|smartwatch|smartband|rel[oó]gio inteligente|apple watch|console|playstation|ps5|xbox|nintendo|ssd|hd externo|pendrive|cart[aã]o de mem[oó]ria|mouse|teclado|carregador|power ?bank|c[aâ]mera|gopro|alexa|echo dot|fire tv|chromecast|roteador|kindle|impressora|placa de v[ií]deo|mem[oó]ria ram|webcam|drone|projetor|bluetooth)(?![a-zà-ú])/i;
export const ehEletronico = (nome) => ELETRONICO.test(String(nome || ''));

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

/** O pedido para a IA olhar a foto: tem marca de outro canal/grupo de ofertas? */
export function pedidoFoto(url, modelo) {
  const pergunta = 'Esta foto vai ser usada num grupo de ofertas. Ela tem logo, nome, marca d\'água, banner ou texto de um CANAL ou GRUPO DE PROMOÇÕES '
    + '(nome de grupo, @canal, site de cupons, "link do grupo")? A marca do PRODUTO ou da loja (Amazon, Mercado Livre, Magalu) não conta. '
    + 'Responda numa linha: SIM ou NAO, e se SIM, qual texto aparece.';
  return { model: modelo || MODELO_CHAMADA, max_tokens: 60, temperature: 0,
    messages: [{ role: 'user', content: [{ type: 'text', text: pergunta }, { type: 'image_url', image_url: { url } }] }] };
}

/** "NAO" = foto limpa. "SIM" ou resposta estranha = não usa (na dúvida, sem foto). */
export function fotoLimpaDaResposta(texto) {
  return /^\W*N[AÃ]O\b/i.test(String(texto || '').trim());
}

/** A foto que vai no post: só se a IA disse que está limpa. Sem IA configurada, vai como veio. */
async function fotoDoPost(rede, foto) {
  if (!foto) return '';
  if (!rede || !rede.fotoLimpa) return foto;
  try { return (await rede.fotoLimpa(foto)) ? foto : ''; } catch (e) { return ''; }
}

/**
 * Confere o preço do canal com o da loja (página da Amazon ou API da Shopee) e decide o que vai no post.
 * - Canal mais barato que a loja (mais de 3%) sem cupom no post: preço velho ou condição escondida, não posta.
 * - Canal mais barato com cupom: vale o preço com cupom e mostra o preço sem cupom.
 * - Senão: vale o preço da loja (a forma de pagamento do canal sai, porque não é dela).
 */
/** "De R$X" do canal com mais de 70% de desconto: provável preço inflado, sai do post (16/10). */
export const deCrivel = (preco, antes) => !!(preco && antes && preco / antes >= 0.3);

export function conferirPreco(post, loja) {
  if (!loja || !loja.preco) return { ok: true, campos: {} };
  const temCupom = (post.cupons || []).length > 0 || !!post.dicaCupom;
  // Cupom da própria loja (Amazon, 16/10): a referência passa a ser o preço com ele.
  const cp = loja.cupom && loja.cupom.precoCom && !loja.cupom.restrito ? loja.cupom : null;
  const so1a = loja.cupom && loja.cupom.restrito && loja.cupom.codigo ? loja.cupom : null;
  const ref = cp ? cp.precoCom : loja.preco;
  if (post.preco && post.preco < ref * 0.97) {
    if (!temCupom) return { ok: false, motivo: 'preco_diferente_da_loja' };
    return { ok: true, campos: { semCupom: loja.preco } };
  }
  const antes = loja.precoDe || (post.precoAntes && post.precoAntes > loja.preco && deCrivel(loja.preco, post.precoAntes) ? post.precoAntes : null);
  const campos = { preco: ref, precoAntes: antes, pagamento: null, menorOpcao: !!loja.menorOpcao, outroPreco: null };
  if (cp) {
    campos.semCupom = loja.preco;
    if (cp.codigo) campos.cupons = [cp.codigo, ...(post.cupons || []).filter(c => c !== cp.codigo)].slice(0, 2);
    else campos.dicaCupom = `Marque o cupom de ${cp.texto} na página do produto`;
    if (cp.app) campos.avisos = [...(post.avisos || []), 'Cupom válido no app da Amazon'].slice(-2);
  }
  if (so1a) campos.avisos = [...(post.avisos || []), `Primeira compra${so1a.app ? ' no app' : ''}? Cupom ${so1a.codigo} dá mais ${so1a.texto} off`].slice(-2);
  return { ok: true, campos };
}

/**
 * A legenda de um achado, no padrão dos grupos de oferta:
 *   CHAMADA / Nome / 💵 De R$X por R$Y pix / 🛒 link / 🏷️ Use o cupom A + B
 * Nada do texto de quem postou antes vai junto (a chamada é nossa).
 */
export function legendaAchado({ nome, preco, precoAntes, pagamento, aPartir, outroPreco, semCupom, menorOpcao, frete, link, cupons, dicaCupom, avisos, chave, prime, chamada }) {
  const p = reaisCurto(preco), a = precoAntes && precoAntes > preco ? reaisCurto(precoAntes) : null;
  const linhas = [chamada || gancho(chave || nome, descontoDe(preco, precoAntes)), '', String(nome).trim().slice(0, 110), ''];
  // A porcentagem chama atenção: vai junto do "De/por" (se a chamada já não falou dela).
  const off = a ? descontoDe(preco, precoAntes) : 0;
  const pct = off >= 5 && !/%/.test(linhas[0]) ? ` (${off}% OFF)` : '';
  if (p) linhas.push(`\u{1F4B5} ${a ? `De R$${a} por ` : 'Por '}${aPartir ? 'a partir de ' : ''}R$${p}${pagamento ? ' ' + pagamento : ''}${pct}`);
  // Shopee: o preço da API é o da opção mais barata (cor, tamanho); avisa para não parecer preço errado.
  if (menorOpcao) linhas.push('\u{1F4CC} Valor da opção mais barata');
  if (semCupom) linhas.push(`\u{1F4B3} Sem cupom: R$${reaisCurto(semCupom)}`);
  if (outroPreco && outroPreco.preco) linhas.push(`\u{1F4B3} ou R$${reaisCurto(outroPreco.preco)}${outroPreco.pagamento ? ' ' + outroPreco.pagamento : ''}`);
  if (frete) linhas.push(`\u{1F69A} ${frete}`);
  linhas.push(`\u{1F6D2} ${link}`);
  const c = (cupons || []).slice(0, 2);
  const extra = [];
  if (c.length) extra.push(`\u{1F3F7}\uFE0F Use o cupom ${c.join(' + ')}${dicaCupom ? ' + ' + dicaCupom : ''}`);
  else if (dicaCupom) extra.push(`\u{1F3F7}\uFE0F ${dicaCupom}`);
  const av = [...(avisos || [])];
  if (prime && !av.some(x => /prime/i.test(x))) av.unshift('Oferta exclusiva para assinantes Prime');
  for (const x of av.slice(0, 2)) extra.push(`\u26A0\uFE0F ${x}`);
  if (extra.length) linhas.push('', ...extra);
  return linhas.join('\n');
}

/** A legenda de um post de cupom. */
export function legendaCupom({ loja, linhasCupom, cupons, link }) {
  const linhas = [`\u{1F39F} *CUPOM${loja ? ' ' + loja.toUpperCase() : ''}*`, ''];
  const corpo = (linhasCupom || []).slice(0, 6);
  if (corpo.length) linhas.push(...corpo); else for (const c of cupons || []) linhas.push(`Cupom: *${c}*`);
  if (link) linhas.push('', `\u{1F449} ${link}`);
  return linhas.join('\n');
}

const NOME_LOJA = { amazon: 'Amazon', magalu: 'Magalu', shopee: 'Shopee', mercadolivre: 'Mercado Livre' };

/** Ofertas da página da Amazon (/deals): o JSON productSearchResponse. */
/** Nome que não é de produto: curto demais ou frase de canal ("Ofertas por tempo limitado"). */
export function nomeFraco(nome) {
  const n = String(nome || '').trim();
  if (n.replace(/[^\p{L}]/gu, '').length < 6 || n.split(/\s+/).length < 2) return true;
  // Linha de pagamento ou de aviso no lugar do nome ("[em até 6x sem juros]", 14/10).
  return /tempo limitado|^ofertas?\b|^promo|^achad|grupo|canal|cupo|^[\[(]|sem juros|no pix|[àa] vista|parcel|frete|R\$/i.test(n);
}

/** Primeira palavra que diz o que é o produto ("creatina", "fone"): para não postar 3 iguais seguidos. */
export function primeiraPalavra(nome) {
  return palavras(nome).find(w => !/^\d/.test(w)) || '';
}

/** O nome do post e o da loja falam do mesmo produto? (pelo menos 30% das palavras do post na loja) */
function mesmoProduto(doPost, daLoja) {
  const a = palavras(doPost), b = new Set(palavras(daLoja));
  return a.length > 0 && a.filter(w => b.has(w)).length / a.length >= 0.3;
}

/** Nome e foto da página de produto da Amazon. Página de captcha volta vazia (não dribla). */
/**
 * Produto de catálogo do ML (link /p/MLB…) pela API, com o acesso do fluxo 04.
 * Preço: o do vendedor que ganha a página (buy box); sem ele, o mais barato
 * entre os vendedores. Anúncio comum (MLB-123) a API não abre para terceiros.
 */
export function lerProdutoML(prod, itens) {
  if (!prod || !prod.id) return {};
  const nome = String(prod.name || '').trim();
  const foto = (((prod.pictures || [])[0] || {}).url || '').replace(/^http:/, 'https:');
  const bb = prod.buy_box_winner && prod.buy_box_winner.price ? prod.buy_box_winner : null;
  const ofertas = (itens || []).filter(x => x && Number(x.price) > 0).sort((a, b) => a.price - b.price);
  const v = bb || ofertas[0] || null;
  const preco = v ? Number(v.price) : null;
  const de = v && Number(v.original_price) > preco && Number(v.original_price) <= preco * 5 ? Number(v.original_price) : null;
  return { nome, foto, preco, precoDe: de, aberta: true };
}

/**
 * Cupom da Amazon na página do produto (bloco promoPriceBlockMessage), 16/10:
 *   "R$20 off. Insira o código COMPRANOAPP na finalização"  (código)
 *   "Aplicar cupom de 10%" / "Economize R$ 15 com cupom"     (cupom de marcar)
 * Devolve o preço com o cupom. Pedido mínimo acima do preço: não vale.
 */
const ENTIDADES = { aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', atilde: 'ã', otilde: 'õ', ccedil: 'ç', acirc: 'â', ecirc: 'ê', ocirc: 'ô', agrave: 'à' };
export function lerCupomAmazon(html, preco) {
  const b = String(html || '');
  const i = b.indexOf('id="promoPriceBlockMessage_feature_div"');
  if (i < 0 || !preco) return null;
  // Começa depois da tag de abertura (ela repete o nome em data-csa-c-slot-id)
  // e para no próximo bloco <div id="..._feature_div">.
  let bloco = b.slice(b.indexOf('>', i) + 1, i + 20000);
  const fim = bloco.search(/<div id="[A-Za-z]+_feature_div"/);
  if (fim > 0) bloco = bloco.slice(0, fim);
  const t = desfazHtml(bloco.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<span[^>]*aok-hidden[^>]*>[\s\S]*?<\/span>/g, ' '))
    .replace(/&([a-z]+);/g, (m, e) => ENTIDADES[e] || m).replace(/\s+/g, ' ');
  if (!/cupom|c[óo]digo/i.test(t)) return null;
  const codigo = (t.match(/c[óo]digo\s+([A-Z0-9]{4,24})\b/) || [])[1] || null;
  const v = t.match(/R\$\s*([\d.]+(?:,\d{1,2})?)\s*(?:off|de desconto)/i) || t.match(/(?:Aplicar cupom de|Economize)\s*R\$\s*([\d.]+(?:,\d{1,2})?)/i);
  const pc = t.match(/(?:Aplicar cupom de|Economize)\s*(\d{1,2})\s*%/i) || t.match(/(\d{1,2})\s*%\s*(?:off|de desconto)/i);
  const desconto = v ? numero(v[1]) : (pc ? Math.round(preco * Number(pc[1])) / 100 : null);
  if (!desconto || desconto >= preco * 0.7) return null;
  const minimo = numero((t.match(/(?:acima de|a partir de|m[íi]nim[oa] de)\s*R\$\s*([\d.]+(?:,\d{1,2})?)/i) || [])[1] || '');
  if (minimo && preco < minimo) return null;
  // "Válido na sua primeira compra na Amazon, pelo App" (B0DHWFBYVC, 16/10): não é o
  // preço de quase ninguém do grupo. Vira aviso, e o preço fica o normal.
  const restrito = /primeir[ao] (compra|pedido)|novos? clientes?|clientes? novos?/i.test(t);
  const app = /pelo app|no app/i.test(t);
  return { codigo, desconto, texto: v ? `R$${reaisCurto(desconto)}` : `${pc[1]}%`, restrito, app,
    precoCom: Math.round((preco - desconto) * 100) / 100 };
}

export function lerPaginaAmazon(html) {
  const b = String(html || '');
  if (!b || /validateCaptcha|api-services-support@amazon/i.test(b)) return {};
  const nome = desfazHtml((b.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/) || [])[1] || '').replace(/\s+/g, ' ').trim() || null;
  const foto = (b.match(/"hiRes":"(https:\/\/[^"]+)"/) || b.match(/data-old-hires="(https:\/\/[^"]+)"/)
    || b.match(/id="landingImage"[^>]*src="(https:\/\/[^"]+)"/) || b.match(/property="og:image" content="(https:\/\/[^"]+)"/) || [])[1] || null;
  // Preço de compra: o JSON do buybox (priceAmount) ou o bloco apex-pricetopay (ensaio 96, 13/10).
  // Sem nenhum dos dois, a página abriu mas o produto não está à venda direto (só "outras ofertas"):
  // a promoção acabou (Pampers e frasqueira, 13/10).
  const apex = numero((b.match(/apex-pricetopay-value[^>]*><span class="a-offscreen">\s*R\$\s*([\d.]+,\d{2})/) || [])[1] || '');
  const json = Number((b.match(/"desktop_buybox_group_1":\[\{[^}]*?"priceAmount":([\d.]+)/) || [])[1]);
  const preco = apex || (json > 0 ? json : null);
  // Preço "De" (riscado): só vale se for maior que o de compra e não absurdo (até 5x).
  const risco = numero((b.match(/a-text-price"[^>]*data-a-strike="true"[^>]*><span class="a-offscreen">\s*R\$\s*([\d.]+,\d{2})/) || [])[1] || '');
  const precoDe = preco && risco > preco && risco <= preco * 5 ? risco : null;
  return { nome, foto, preco, precoDe, cupom: lerCupomAmazon(b, preco), aberta: !!nome };
}

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
const minutoSP = (agora) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', minute: '2-digit' }).format(agora));
const horaSP = (agora) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }).format(agora));

/** Arruma a memória do fluxo: zera a conta no dia novo e esquece o velho. */
export function arrumarMemoria(mem, agora) {
  const dia = diaSP(agora), t = agora.getTime();
  if (mem.dia !== dia) { mem.dia = dia; mem.postados = 0; mem.cupons = 0; mem.resumo = { lojas: {}, descartes: {} }; }
  mem.resumo = mem.resumo || { lojas: {}, descartes: {} };
  mem.vistos = mem.vistos || {}; mem.produtos = mem.produtos || {};
  for (const [k, v] of Object.entries(mem.vistos)) if (t - v > 3 * 864e5) delete mem.vistos[k];
  for (const [k, v] of Object.entries(mem.produtos)) if (t - v > 7 * 864e5) delete mem.produtos[k];
  return mem;
}

/** Pode postar agora? Janela de horário (SP) e limite do dia. */
/**
 * Ritmo (14/10, medido no canal de referência: 85 a 146 posts por dia, das 8h
 * às 22h): de dia um post a cada cfg.intervaloDia minutos, de madrugada um a
 * cada cfg.intervaloNoite (umas 4 ofertas), até cfg.porDia no dia.
 */
export function podeAgora(mem, agora, cfg) {
  const h = horaSP(agora), noite = h < cfg.inicio || h >= cfg.fim;
  if ((mem.postados || 0) >= cfg.porDia) return { ok: false, motivo: 'limite_do_dia' };
  let intervalo = (noite ? (cfg.intervaloNoite || 150) : (cfg.intervaloDia || 8)) * 6e4;
  // De dia, espalha o que sobrou do limite até o fim da janela (senão acaba às 16h e
  // o horário nobre fica sem post, 14/10). Guarda 1 para depois das 22h.
  if (!noite) {
    const sobram = cfg.porDia - (mem.postados || 0) - (cfg.reservaNoite ?? 1);
    if (sobram <= 0) return { ok: false, motivo: 'reserva_da_noite' };
    const faltam = (cfg.fim - h) * 60 - minutoSP(agora);
    intervalo = Math.max(intervalo, (faltam / sobram) * 6e4);
  }
  if (mem.ultimo && agora.getTime() - mem.ultimo < intervalo) return { ok: false, motivo: 'cedo', noite };
  return { ok: true, noite };
}

/** A lista oficial de ofertas da Shopee (productOfferV2) no formato do garimpo. */
export function lerOfertasShopee(resposta) {
  let r = resposta;
  if (typeof r === 'string') { try { r = JSON.parse(r); } catch (e) { return []; } }
  const nodes = (r && r.data && r.data.productOfferV2 && r.data.productOfferV2.nodes) || [];
  return nodes.map(n => ({
    nome: String(n.productName || '').trim(), preco: Number(n.priceMin) || null,
    desconto: Number(n.priceDiscountRate) || 0, comissao: Number(n.commissionRate) || 0,
    foto: n.imageUrl || null, link: n.offerLink || null, chave: chaveProduto(n.productLink || ''),
    nota: n.ratingStar != null ? Number(n.ratingStar) || 0 : null, vendas: n.sales != null ? Number(n.sales) || 0 : null,
    loja: n.shopName || null, tipoLoja: Array.isArray(n.shopType) ? n.shopType : [],
  })).filter(o => o.nome && o.preco && o.link && o.foto && o.chave.startsWith('shopee:'));
}

/**
 * Loja confiável na Shopee (18/10), pelos dados da API: nota do produto (cfg.notaMinShopee, 4.5),
 * vendas do produto (cfg.vendasMinShopee, 50) e, para produto caro (cfg.caroShopee, R$1.000),
 * loja oficial (Shopee Mall, tipo 1) ou indicada (tipos 2 e 4). Sem esses dados na resposta, não barra.
 */
const SHOPEE_LOJA_BOA = [1, 2, 4];
export function lojaConfiavel(o, cfg = {}) {
  if (!o || o.nota == null) return true;
  if (o.nota > 0 && o.nota < (cfg.notaMinShopee || 4.5)) return false;
  if ((o.vendas || 0) < (cfg.vendasMinShopee ?? 50)) return false;
  if ((o.preco || 0) >= (cfg.caroShopee || 1000) && !(o.tipoLoja || []).some(t => SHOPEE_LOJA_BOA.includes(Number(t)))) return false;
  return true;
}

/** Da lista da Shopee: desconto mínimo e, entre esses, a maior comissão (na vez do eletrônico, eletrônico primeiro). */
function escolherShopee(lista, mem, cfg, proibidos, querEletronico = false) {
  const vez = (o) => (querEletronico && ehEletronico(o.nome) ? 1 : 0);
  return (lista || [])
    .filter(o => o.desconto >= (cfg.descontoShopee || 30) && !mem.produtos[o.chave] && !proibido(o.nome, proibidos) && lojaConfiavel(o, cfg)
      && !(mem.recentes || []).includes(primeiraPalavra(o.nome)))
    .sort((a, b) => (vez(b) - vez(a)) || (b.comissao - a.comissao) || (b.desconto - a.desconto))[0] || null;
}

async function postShopee(o, rede) {
  const chamada = await pedirChamada(rede, o.nome);
  const antes = o.desconto > 0 && o.desconto < 100 ? Math.round(o.preco / (1 - o.desconto / 100)) : null;
  return { acao: 'postar', tipo: 'produto', chave: o.chave, fonte: 'shopee/ofertas', imagem: o.foto, link: o.link, titulo: o.nome, chamada_ia: !!chamada,
    texto: legendaAchado({ nome: o.nome, preco: o.preco, precoAntes: antes, menorOpcao: true, link: o.link, chave: o.chave, chamada }) };
}

/**
 * Escolhe e prepara UMA oferta. Ordem: produto de canal (mais novo primeiro),
 * depois produto da Amazon (maior desconto), depois cupom (até cfg.cuponsPorDia).
 * Todo post de canal tentado fica em mem.vistos (não tenta de novo). Volta
 * { acao: 'postar', tipo, chave, texto, imagem, fonte } ou { acao: 'nada', motivo, tentou }.
 */
export async function garimpar({ canais = {}, amazonHtml = '', shopee = [], agora, cfg, mem, rede }) {
  const t = agora.getTime(), tentou = [];
  const lista = cfg.proibido || PROIBIDO_PADRAO;
  const resumo = mem.resumo || (mem.resumo = { lojas: {}, descartes: {} });
  const pula = (id, motivo) => { tentou.push([id, motivo]); resumo.descartes[motivo] = (resumo.descartes[motivo] || 0) + 1; };
  // Vez do eletrônico (17/10): depois de cfg.eletronicoACada - 1 posts sem eletrônico, o
  // próximo tenta eletrônico primeiro (canal, Shopee e Amazon). Sem nenhum, sai o de sempre.
  const querEletronico = cfg.eletronicoACada > 0 && (mem.semEletronico || 0) >= cfg.eletronicoACada - 1;
  const vez = (nome) => (querEletronico && ehEletronico(nome) ? 1 : 0);
  // A cada 3 posts, 1 vem da lista oficial da Shopee (14/10). Na vez do eletrônico, só se for eletrônico.
  const daShopee = escolherShopee(shopee, mem, cfg, lista, querEletronico);
  if (daShopee && (mem.postados || 0) % 3 === 2 && (!querEletronico || ehEletronico(daShopee.nome))) return postShopee(daShopee, rede);
  const posts = [];
  for (const [canal, html] of Object.entries(canais))
    for (const p of lerCanalTelegram(html)) {
      const idade = p.quando ? t - Date.parse(p.quando) : Infinity;
      if (idade > cfg.idadeMaxMin * 6e4 || mem.vistos[p.id]) continue;
      posts.push({ ...p, canal, ...lerPost(p.texto) });
    }
  posts.sort((a, b) => (vez(b.nome || b.texto) - vez(a.nome || a.texto)) || (Date.parse(b.quando) - Date.parse(a.quando)));
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
      if (proibido(p.texto, lista)) { pula(p.id, 'proibido'); continue; }
      if (p.cupons.some(pessoal)) { pula(p.id, 'cupom_do_canal'); continue; }
      tentativas++;
      const principal = p.link || p.links[p.links.length - 1];
      if (!principal && tipo === 'produto') { pula(p.id, 'sem_link'); continue; }
      const c = principal ? await converterTodos([principal], p.nome) : { ok: false, motivo: 'sem_link' };
      if (!c.ok) {
        if (tipo === 'cupom' && p.cupons.length) {   // cupom sem link convertível: sai só com o código
          return { acao: 'postar', tipo, chave: `cupom:${p.cupons.join(',')}`, fonte: p.id, imagem: '',
            texto: legendaCupom({ linhasCupom: p.linhasCupom, cupons: p.cupons }) };
        }
        pula(p.id, c.motivo); continue;
      }
      const [prim] = c.out;
      if (tipo === 'produto') {
        if (mem.produtos[prim.chave]) { pula(p.id, 'repetido'); continue; }
        // Post de produto só sai com foto e com nome de produto de verdade
        // (13/10: saiu "Ofertas por tempo limitado." sem foto). Faltando um dos
        // dois, a página da Amazon completa; senão pula para o próximo post.
        // Amazon: a página do produto é a fonte de verdade. O preço do canal
        // tem que bater com o da loja (13/10: canal postou R$2 num item de
        // R$258) e a foto oficial vem primeiro (a do canal saiu em branco).
        let nome = p.nome, d = {};
        // ML de outro canal pela vitrine: o card em destaque já traz preço e foto.
        if (prim.vitrine && prim.vitrine.preco) d = { nome: prim.vitrine.nome, foto: prim.vitrine.foto, preco: prim.vitrine.preco, precoDe: prim.vitrine.precoDe, aberta: true };
        if (prim.loja === 'amazon' && rede.pagina) {
          let html = '';
          try { html = await rede.pagina(`https://www.amazon.com.br/dp/${prim.chave.slice(7)}`); } catch (e) { html = ''; }
          d = lerPaginaAmazon(html);
        }
        // Mercado Livre de catálogo: preço, nome e foto oficiais pela API.
        const cat = prim.loja === 'mercadolivre' && rede.mlCatalogo && String(prim.url).match(/\/p\/(MLB\d+)/i);
        if (cat) { try { d = (await rede.mlCatalogo(cat[1].toUpperCase())) || {}; } catch (e) { d = {}; } }
        if (d.aberta && !d.preco) { pula(p.id, 'sem_preco_na_loja'); continue; }
        // Shopee: preço e foto oficiais pela API (por loja e item).
        let sh = null;
        if (prim.loja === 'shopee' && rede.shopeeProduto && /^shopee:\d+\.\d+$/.test(prim.chave)) {
          const [lj, it] = prim.chave.slice(7).split('.');
          try { sh = await rede.shopeeProduto(lj, it); } catch (e) { sh = null; }
          if (sh && !lojaConfiavel(sh, cfg)) { pula(p.id, 'loja_pouco_confiavel'); continue; }
        }
        // ML que não deu para conferir (anúncio comum): só post bem novo (30 min).
        const idadePost = p.quando ? t - Date.parse(p.quando) : Infinity;
        if (prim.loja === 'mercadolivre' && !d.preco && idadePost > (cfg.idadeSemConferirMin || 30) * 6e4) { pula(p.id, 'ml_sem_conferir_antigo'); continue; }
        const daLoja = d.preco ? { preco: d.preco, precoDe: d.precoDe, cupom: d.cupom } : (sh ? { preco: sh.preco, menorOpcao: true } : null);
        const pr = conferirPreco(p, daLoja);
        if (!pr.ok) { pula(p.id, pr.motivo); continue; }
        // O link tem que ser o produto do texto (16/10): nome que não bate ou
        // quantidade diferente ("Kit 3" no post, 1 unidade na loja) não sai.
        if (d.nome && !nomeFraco(nome)) {
          const qp = quantidade(nome), ql = quantidade(d.nome);
          if (!mesmoProduto(nome, d.nome) || (qp > 1 && ql !== qp)) { pula(p.id, 'produto_diferente_do_post'); continue; }
        }
        if (d.nome && nomeFraco(nome)) nome = d.nome;
        if ((mem.recentes || []).includes(primeiraPalavra(nome))) { pula(p.id, 'parecido_com_recente'); continue; }
        let imagem = d.foto || (sh && sh.foto) || await fotoDoPost(rede, p.foto);
        const descartada = !d.foto && !(sh && sh.foto) && !!p.foto && !imagem;
        if (nomeFraco(nome)) { pula(p.id, 'sem_nome'); continue; }
        if (!imagem) { pula(p.id, descartada ? 'foto_de_outro_grupo' : 'sem_foto'); continue; }
        const chamada = await pedirChamada(rede, nome);
        return { acao: 'postar', tipo, chave: prim.chave, fonte: p.id, imagem, link: prim.url, titulo: nome, foto_descartada: descartada, chamada_ia: !!chamada,
          preco_post: p.preco || null, preco_loja: daLoja ? daLoja.preco : null,
          texto: legendaAchado({ ...p, ...(daLoja || deCrivel(p.preco, p.precoAntes) ? {} : { precoAntes: null }), ...pr.campos, nome, link: prim.url, chave: prim.chave, chamada }) };
      }
      const chave = `cupom:${p.cupons.join(',') || prim.chave}`;
      if (mem.produtos[chave]) { pula(p.id, 'repetido'); continue; }
      return { acao: 'postar', tipo, chave, fonte: p.id, imagem: '',
        texto: legendaCupom({ loja: NOME_LOJA[prim.loja] || '', linhasCupom: p.linhasCupom, cupons: p.cupons, link: prim.url }) };
    }
    if (tipo === 'produto' && daShopee) return postShopee(daShopee, rede);
    if (tipo === 'produto' && cfg.amazonTag) {
      const achados = lerAmazonDeals(amazonHtml)
        .filter(a => a.desconto >= cfg.descontoMin && !mem.produtos[`amazon:${a.asin}`] && !proibido(a.nome, lista))
        .sort((a, b) => (vez(b.nome) - vez(a.nome)) || (b.desconto - a.desconto));
      if (achados.length) {
        const a = achados[0];
        const chamada = await pedirChamada(rede, a.nome);
        const link = `https://www.amazon.com.br/dp/${a.asin}?tag=${encodeURIComponent(cfg.amazonTag)}`;
        return { acao: 'postar', tipo: 'produto', chave: `amazon:${a.asin}`, fonte: 'amazon/deals', imagem: a.foto || '', link, titulo: a.nome, chamada_ia: !!chamada,
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
export function registrarPostado(mem, { chave, tipo, eletronico }, agora) {
  mem.postados = (mem.postados || 0) + 1;
  if (tipo !== 'cupom') mem.semEletronico = eletronico ? 0 : (mem.semEletronico || 0) + 1;
  mem.ultimo = agora.getTime();
  if (tipo === 'cupom') mem.cupons = (mem.cupons || 0) + 1;
  if (chave) mem.produtos[chave] = agora.getTime();
  return mem;
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

/** A rede de verdade dentro do nó Code: http = this.helpers, env = $env. */
export function redeN8n(http, env) {
  let mlToken;   // undefined: ainda não pediu ao fluxo 04 nesta execução
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
    async fotoLimpa(url) {
      if (!env.OPENROUTER_API_KEY) return true;
      const r = await http.httpRequest({ method: 'POST', url: 'https://openrouter.ai/api/v1/chat/completions', json: true, timeout: 20000,
        headers: { Authorization: `Bearer ${env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'X-Title': 'Ofertas' },
        body: pedidoFoto(url, env.OPENROUTER_MODELO) });
      return fotoLimpaDaResposta(r && r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content);
    },
    async shopeeProduto(loja, item) {
      if (!/^\d+$/.test(String(loja)) || !/^\d+$/.test(String(item))) return null;
      const corpo = JSON.stringify({ query: `{productOfferV2(shopId:${loja},itemId:${item}){nodes{productName priceMin priceDiscountRate commissionRate imageUrl productLink offerLink ratingStar sales shopName shopType}}}` });
      const auth = shopeeAutorizacao(env.SHOPEE_APP_ID, env.SHOPEE_SECRET, corpo);
      const r = await http.httpRequest({ method: 'POST', url: 'https://open-api.affiliate.shopee.com.br/graphql',
        headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: corpo, json: false, timeout: 15000 });
      return lerOfertasShopee(r)[0] || null;
    },
    async shopeeOfertas() {
      const corpo = JSON.stringify({ query: `{productOfferV2(page:${1 + Math.floor(Math.random() * 3)},limit:50,sortType:2){nodes{productName priceMin priceDiscountRate commissionRate imageUrl productLink offerLink ratingStar sales shopName shopType}}}` });
      const auth = shopeeAutorizacao(env.SHOPEE_APP_ID, env.SHOPEE_SECRET, corpo);
      const r = await http.httpRequest({ method: 'POST', url: 'https://open-api.affiliate.shopee.com.br/graphql',
        headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: corpo, json: false, timeout: 20000 });
      return lerOfertasShopee(r);
    },
    async mlCatalogo(id) {
      if (!env.ML_SECRET || !/^MLB\d+$/.test(String(id))) return null;
      if (mlToken === undefined) {
        mlToken = null;
        try {
          const t = await http.httpRequest({ method: 'GET', url: env.ML_TOKEN_URL || 'https://n8n-production-4226.up.railway.app/webhook/ml-token',
            headers: { 'x-chave': crypto.createHash('sha256').update('ml-token:' + env.ML_SECRET).digest('hex') }, json: true, timeout: 10000 });
          mlToken = (t && t.token) || null;
        } catch (e) { mlToken = null; }
      }
      if (!mlToken) return null;
      const api = async (p) => {
        const r = await http.httpRequest({ method: 'GET', url: 'https://api.mercadolibre.com' + p, json: false, returnFullResponse: true,
          ignoreHttpStatusErrors: true, timeout: 15000, headers: { Authorization: `Bearer ${mlToken}`, Accept: 'application/json' } });
        if (r.statusCode !== 200) return null;
        return typeof r.body === 'string' ? JSON.parse(r.body) : r.body;
      };
      const prod = await api(`/products/${id}`);
      if (!prod) return null;
      const itens = prod.buy_box_winner && prod.buy_box_winner.price ? [] : ((await api(`/products/${id}/items?limit=20`)) || {}).results;
      return lerProdutoML(prod, itens);
    },
    /** Quantos participantes o grupo tem (Z-API light-group-metadata, conferido em 17/10). */
    async membrosDoGrupo(grupo) {
      if (!env.ZAPI_BASE_URL || !env.ZAPI_INSTANCE_ID || !env.ZAPI_INSTANCE_TOKEN) return null;
      const raiz = `${String(env.ZAPI_BASE_URL).replace(/\/+$/, '')}/instances/${env.ZAPI_INSTANCE_ID}/token/${env.ZAPI_INSTANCE_TOKEN}`;
      const r = await http.httpRequest({ method: 'GET', url: `${raiz}/light-group-metadata/${encodeURIComponent(grupo)}`, json: true, timeout: 15000,
        headers: env.ZAPI_CLIENT_TOKEN ? { 'client-token': env.ZAPI_CLIENT_TOKEN } : {} });
      return r && Array.isArray(r.participants) ? r.participants.length : null;
    },
    /** Contadores do encurtador (acumulados): cliques no convite por origem e nos links. */
    async cliques() {
      if (!env.ENCURTADOR_URL || !env.ENCURTADOR_SEGREDO) return null;
      return http.httpRequest({ method: 'GET', url: String(env.ENCURTADOR_URL).replace(/\/+$/, '') + '/api/cliques', json: true, timeout: 10000,
        headers: { Authorization: 'Bearer ' + env.ENCURTADOR_SEGREDO } });
    },
    /** Vendas da Shopee entre ini e fim (segundos), até 5 páginas de 500. */
    async shopeeVendas(ini, fim) {
      if (!env.SHOPEE_APP_ID || !env.SHOPEE_SECRET) return null;
      const nodes = [];
      let scroll = '';
      for (let i = 0; i < 5; i++) {
        const corpo = JSON.stringify({ query: `{conversionReport(purchaseTimeStart:${ini},purchaseTimeEnd:${fim},limit:500${scroll ? `,scrollId:${JSON.stringify(scroll)}` : ''}){nodes{totalCommission estimatedTotalCommission orders{items{actualAmount}}} pageInfo{hasNextPage scrollId}}}` });
        const auth = shopeeAutorizacao(env.SHOPEE_APP_ID, env.SHOPEE_SECRET, corpo);
        let r = await http.httpRequest({ method: 'POST', url: 'https://open-api.affiliate.shopee.com.br/graphql',
          headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: corpo, json: false, timeout: 20000 });
        if (typeof r === 'string') r = JSON.parse(r);
        const c = r && r.data && r.data.conversionReport;
        if (!c) return null;
        nodes.push(...(c.nodes || []));
        if (!c.pageInfo || !c.pageInfo.hasNextPage || !c.pageInfo.scrollId) break;
        scroll = c.pageInfo.scrollId;
      }
      return somarVendasShopee(nodes);
    },
    async pagina(url) {
      const r = await http.httpRequest({ method: 'GET', url, returnFullResponse: true, ignoreHttpStatusErrors: true, json: false,
        timeout: 20000, headers: { 'User-Agent': UA, 'Accept-Language': 'pt-BR,pt;q=0.9' } });
      return r && r.statusCode === 200 && typeof r.body === 'string' ? r.body : '';
    },
  };
}
