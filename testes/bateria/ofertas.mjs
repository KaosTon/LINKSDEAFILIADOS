// Bateria das funções de ofertas (lib/ofertas.mjs). O que não pode acontecer:
// postar o link de afiliado de outra pessoa, mandar link quebrado por causa
// de pontuação grudada, e legenda com preço inventado.
import crypto from 'node:crypto';
import { extrairLinks, plataformaDe, eEncurtado, amazonComTag, shopeeCorpo,
         shopeeAutorizacao, reais, legenda, lerMensagemZapi, aceitarDoRascunho, trocarLinks,
         comAviso, converterSemRede, MOTIVOS, pedidoZapi, idDoEnvio,
         magaluNaMinhaLoja, limparShopee, prepararOferta, abrirLink } from '../../lib/ofertas.mjs';

let ok = 0, mau = 0;
const caso = (nome, cond, extra) => {
  if (cond) { ok++; console.log(`  PASS  ${nome}`); }
  else { mau++; console.log(`  FAIL  ${nome}${extra !== undefined ? '\n        ' + JSON.stringify(extra) : ''}`); }
};

console.log('\n=== Links ===');
{
  const t = 'Olha isso (https://www.amazon.com.br/dp/B0TESTE123?tag=outro-20). E esse: https://shopee.com.br/produto-i.1.2!';
  const l = extrairLinks(t);
  caso('acha os dois links e tira a pontuação grudada', l.length === 2 && l[0].endsWith('tag=outro-20') && l[1].endsWith('i.1.2'), l);
  caso('texto sem link: lista vazia', extrairLinks('so texto').length === 0);
}
caso('Shopee, inclusive o encurtador', plataformaDe('https://shopee.com.br/x') === 'shopee' && plataformaDe('https://s.shopee.com.br/abc') === 'shopee');
caso('Mercado Livre, inclusive meli.la', plataformaDe('https://produto.mercadolivre.com.br/MLB-1') === 'mercadolivre' && plataformaDe('https://meli.la/abc') === 'mercadolivre');
caso('Amazon, inclusive amzn.to', plataformaDe('https://www.amazon.com.br/dp/B0X') === 'amazon' && plataformaDe('https://amzn.to/abc') === 'amazon');
caso('site que finge ser loja nao passa (shopee.com.br.golpe.com)', plataformaDe('https://shopee.com.br.golpe.com/x') === 'outra');
caso('link invalido: null', plataformaDe('nao e link') === null);
caso('encurtados sao reconhecidos', eEncurtado('https://amzn.to/x') && eEncurtado('https://meli.la/x') && !eEncurtado('https://www.amazon.com.br/dp/X'));

console.log('\n=== Amazon ===');
{
  const u = amazonComTag('https://www.amazon.com.br/dp/B0TESTE123?tag=outro-20&linkCode=ll1&psc=1', 'minha-20');
  const p = new URL(u).searchParams;
  caso('troca a tag de quem postou pela sua', p.get('tag') === 'minha-20' && p.getAll('tag').length === 1, u);
  caso('tira os rastreios de afiliado dele e mantem o resto', !p.has('linkCode') && p.get('psc') === '1', u);
  caso('amzn.to volta null (tem que abrir antes)', amazonComTag('https://amzn.to/abc', 'minha-20') === null);
  let erro = null; try { amazonComTag('https://www.amazon.com.br/dp/X', ''); } catch (e) { erro = e.message; }
  caso('sem tag: erro, nunca posta link sem a sua tag', /tag/.test(erro || ''));
}

console.log('\n=== Shopee ===');
{
  const corpo = shopeeCorpo('https://shopee.com.br/produto-i.1.2', ['grupo', 'tv']);
  const q = JSON.parse(corpo).query;
  caso('mutation generateShortLink com originUrl e subIds', /generateShortLink/.test(q) && /originUrl:"https:\/\/shopee\.com\.br\/produto-i\.1\.2"/.test(q) && /subIds:\["grupo","tv"\]/.test(q), q);
  caso('no maximo 5 subIds (limite da API)', (JSON.parse(shopeeCorpo('u', ['1','2','3','4','5','6'])).query.match(/"\d"/g) || []).length === 5);
  const a = shopeeAutorizacao('123456', 'segredo', corpo, 1700000000);
  const esperado = crypto.createHash('sha256').update('1234561700000000' + corpo + 'segredo').digest('hex');
  caso('assinatura = SHA256(AppId + Timestamp + Payload + Secret)', a === `SHA256 Credential=123456, Timestamp=1700000000, Signature=${esperado}`, a);
  caso('o segredo nao aparece no cabecalho', !a.includes('segredo'));
}

console.log('\n=== Legenda ===');
{
  caso('preco no formato brasileiro', reais(1234.5) === '1.234,50' && reais('1.234,5') === '1.234,50' && reais('abc') === null);
  const l = legenda({ nome: 'TV 50 polegadas', preco: 1999.9, precoAntes: 2599, link: 'https://x.co/1', loja: 'Amazon' });
  caso('com preco antes e depois', /De ~R\$ 2\.599,00~ por \*R\$ 1\.999,90\*/.test(l), l);
  caso('termina com o aviso de link de afiliado', /Link de afiliado/.test(l));
  const s = legenda({ nome: 'Fone', link: 'https://x.co/2' });
  caso('sem preco confiavel: sai sem preco, nunca inventa', !/R\$/.test(s), s);
  let erro = null; try { legenda({ nome: 'X' }); } catch (e) { erro = e.message; }
  caso('sem link: erro em vez de postar oferta sem link', /link/.test(erro || ''));
}

console.log('\n=== Entrada (rascunho) ===');
const CFG = { rascunho: '120363000000000001-group', autor: '5511999990042', instancia: 'INST1', amazonTag: 'minha-20' };
const msg = (extra) => lerMensagemZapi({ instanceId: 'INST1', phone: '120363000000000001-group', isGroup: true,
  participantPhone: '5511999990042', fromMe: false, fromApi: false, messageId: 'M1',
  image: { imageUrl: 'https://z/img.jpg', caption: 'TV 50 por R$ 1999 https://www.amazon.com.br/dp/B0X' }, ...extra });
{
  const m = msg();
  caso('le texto da legenda da foto e a imagem', m.texto.startsWith('TV 50') && m.imagem === 'https://z/img.jpg' && m.grupo);
  caso('aceita o autor no rascunho', aceitarDoRascunho(m, CFG).ok === true);
  caso('aceita o autor mesmo sem o nono digito', aceitarDoRascunho(msg({ participantPhone: '551199990042' }), CFG).ok === true);
  caso('ignora o que o proprio robo mandou (fromApi)', aceitarDoRascunho(msg({ fromApi: true }), CFG).motivo === 'enviada_pelo_robo');
  caso('ignora outro grupo (inclusive o grupo de ofertas)', aceitarDoRascunho(msg({ phone: '120363000000000002-group' }), CFG).motivo === 'fora_do_rascunho');
  caso('ignora outra pessoa no rascunho', aceitarDoRascunho(msg({ participantPhone: '5511988887777' }), CFG).motivo === 'autor_nao_autorizado');
  caso('aceita o numero do robo digitando no celular (fromMe sem ser da API)', aceitarDoRascunho(msg({ participantPhone: '', fromMe: true }), CFG).ok === true);
  caso('webhook de outra instancia e recusado', aceitarDoRascunho(msg({ instanceId: 'OUTRA' }), CFG).motivo === 'outra_instancia');
  caso('sem rascunho configurado: nao aceita nada', aceitarDoRascunho(m, {}).motivo === 'rascunho_nao_configurado');
  caso('texto sem foto tambem vale', lerMensagemZapi({ phone: 'g', text: { message: 'oi' } }).texto === 'oi');
}
console.log('\n=== Conversao sem rede ===');
{
  const a = converterSemRede('https://www.amazon.com.br/dp/B0X?tag=outro-20', CFG);
  caso('Amazon: troca a tag', a.ok && new URL(a.url).searchParams.get('tag') === 'minha-20');
  caso('Amazon encurtado: pede para abrir antes', converterSemRede('https://amzn.to/x', CFG).motivo === 'amazon_encurtado');
  caso('Amazon sem tag configurada: recusa com o motivo', converterSemRede('https://www.amazon.com.br/dp/B0X', {}).motivo === 'falta_AMAZON_TAG');
  caso('Shopee: avisa que precisa da API (rede)', converterSemRede('https://shopee.com.br/x', CFG).rede === 'shopee');
  caso('ML meli.la passa como veio', converterSemRede('https://meli.la/abc', CFG).url === 'https://meli.la/abc');
  caso('ML link comum: recusa (nao rende comissao)', converterSemRede('https://produto.mercadolivre.com.br/MLB-1', CFG).motivo === 'ml_precisa_link_do_painel');
  caso('Magalu: link da sua loja passa', converterSemRede('https://www.magazinevoce.com.br/magazineeu/p/x/', CFG).ok === true);
  caso('Magalu: link do site recusa com o motivo', converterSemRede('https://www.magazineluiza.com.br/x/p/1/', CFG).motivo === 'magalu_precisa_link_da_sua_loja');
  caso('loja desconhecida: recusa', converterSemRede('https://loja.com/x', CFG).motivo === 'loja_desconhecida');
  caso('todo motivo tem texto em portugues', ['amazon_encurtado', 'falta_AMAZON_TAG', 'ml_precisa_link_do_painel', 'magalu_precisa_link_da_sua_loja', 'loja_desconhecida'].every(k => MOTIVOS[k]));
}
{
  const t = trocarLinks('TV https://a.com/x e https://b.com/y', { 'https://a.com/x': 'https://A', 'https://b.com/y': 'https://B' });
  caso('troca os links no texto do autor', t === 'TV https://A e https://B', t);
  caso('aviso de afiliado entra uma vez so', /afiliado/.test(comAviso('oferta')) && comAviso('oferta\n_Link de afiliado._').match(/afiliad/g).length === 1);
}
console.log('\n=== Saida (Z-API) ===');
{
  const Z = { base: 'https://api.z-api.io/', instancia: 'I', token: 'T' };
  const im = pedidoZapi({ phone: 'g', message: 'leg', image: 'https://img' }, Z);
  caso('com foto: send-image com caption', im.url === 'https://api.z-api.io/instances/I/token/T/send-image' && im.body.caption === 'leg' && im.body.image === 'https://img', im);
  const tx = pedidoZapi({ phone: 'g', message: 'oi' }, Z);
  caso('sem foto: send-text', tx.url.endsWith('/send-text') && tx.body.message === 'oi');
  let e = null; try { pedidoZapi({ phone: 'g', message: 'x' }, {}); } catch (x) { e = x.message; }
  caso('sem configuracao: erro, nao manda para endereco quebrado', /ZAPI_BASE_URL/.test(e || ''));
  caso('saiu so com zaapId ou messageId', idDoEnvio({ zaapId: 'Z' }) === 'Z' && idDoEnvio({ messageId: 'M' }) === 'M' && idDoEnvio({ error: 'x' }) === null && idDoEnvio(null) === null);
}

console.log('\n=== Esteira (fluxo 01) ===');
{
  caso('Magalu: link de outra loja vira da sua', magaluNaMinhaLoja('https://www.magazinevoce.com.br/magazineoutro/p/tv-50/123/', 'magazineeu') === 'https://www.magazinevoce.com.br/magazineeu/p/tv-50/123/');
  caso('Magalu: com MAGALU_LOJA, o converter ja troca a loja', converterSemRede('https://www.magazinevoce.com.br/magazineoutro/p/x/', { magaluLoja: 'magazineeu' }).url === 'https://www.magazinevoce.com.br/magazineeu/p/x/');
  caso('Shopee: tira o rastreio de quem divulgou', limparShopee('https://shopee.com.br/produto-i.1.2?smtt=0.0.9&utm_source=x#a') === 'https://shopee.com.br/produto-i.1.2');
  caso('link mais longo trocado primeiro', trocarLinks('a https://x.co/1 b https://x.co/12', { 'https://x.co/1': 'A', 'https://x.co/12': 'B' }) === 'a A b B');

  const C = { ...CFG, grupo: '120363000000000002-group', shopee: true };
  const corpo = (texto, extra) => ({ instanceId: 'INST1', phone: CFG.rascunho, isGroup: true, participantPhone: CFG.autor,
    fromMe: false, fromApi: false, messageId: 'M' + Math.random(), image: { imageUrl: 'https://z/f.jpg', caption: texto }, ...extra });
  const rede = { abrir: async (u) => u === 'https://amzn.to/abc' ? 'https://www.amazon.com.br/dp/B0X?tag=outro-20' : (() => { throw new Error('x'); })(),
                 shopee: async (u) => u === 'https://shopee.com.br/produto-i.1.2' ? 'https://s.shopee.com.br/MEU' : null };

  const r1 = await prepararOferta(corpo('TV por R$ 1999 https://amzn.to/abc'), C, rede);
  caso('Amazon curto: abre, troca a tag, posta com a foto', r1.acao === 'postar' && /tag=minha-20/.test(r1.texto) && !/amzn\.to/.test(r1.texto) && r1.imagem === 'https://z/f.jpg' && r1.grupo === C.grupo, r1);
  caso('o texto do autor fica, com o aviso de afiliado no fim', r1.texto.startsWith('TV por R$ 1999') && /afiliado/.test(r1.texto));

  const r2 = await prepararOferta(corpo('Fone https://shopee.com.br/produto-i.1.2?smtt=outro'), C, rede);
  caso('Shopee: pede o link curto na API com o link limpo', r2.acao === 'postar' && r2.texto.includes('https://s.shopee.com.br/MEU') && !r2.texto.includes('smtt'), r2);

  const r3 = await prepararOferta(corpo('Combo https://amzn.to/abc e https://produto.mercadolivre.com.br/MLB-1'), C, rede);
  caso('um link nao converteu: NAO posta nada e diz o motivo', r3.acao === 'recusar' && /meli\.la/.test(r3.resposta), r3);

  const r4 = await prepararOferta(corpo('Fone https://shopee.com.br/produto-i.1.2'), { ...C, shopee: false }, rede);
  caso('Shopee sem chaves: recusa pedindo SHOPEE_APP_ID', r4.acao === 'recusar' && /SHOPEE_APP_ID/.test(r4.resposta));
  const r5 = await prepararOferta(corpo('Coisa https://shopee.com.br/outro-i.9.9'), C, rede);
  caso('Shopee nao gerou: recusa', r5.acao === 'recusar' && /Shopee/.test(r5.resposta));
  const r6 = await prepararOferta(corpo('Olha https://amzn.to/zzz'), C, rede);
  caso('link curto que nao abre: recusa', r6.acao === 'recusar' && /link curto/.test(r6.resposta), r6);
  const r7 = await prepararOferta(corpo('so texto sem link'), C, rede);
  caso('sem link: recusa', r7.acao === 'recusar' && /link/.test(r7.resposta));
  const r8 = await prepararOferta(corpo('x https://meli.la/1'), { ...C, grupo: '' }, rede);
  caso('sem GRUPO_OFERTAS: recusa, nao posta em lugar nenhum', r8.acao === 'recusar' && /GRUPO_OFERTAS/.test(r8.resposta));
  const r9 = await prepararOferta(corpo('x https://meli.la/1', { fromApi: true }), C, rede);
  caso('a propria resposta do robo e ignorada (nao vira loop)', r9.acao === 'ignorar');

  const vistos = [];
  const b = corpo('x https://meli.la/1', { messageId: 'IGUAL' });
  const p1 = await prepararOferta(b, C, rede, vistos), p2 = await prepararOferta(b, C, rede, vistos);
  caso('webhook repetido da Z-API: posta uma vez so', p1.acao === 'postar' && p2.acao === 'ignorar' && p2.motivo === 'repetida');


  const saltos = { 'https://amzn.to/a': 'https://amzn.to/b', 'https://amzn.to/b': 'https://www.amazon.com.br/dp/B0Y' };
  const fim = await abrirLink('https://amzn.to/a', async (u) => ({ headers: { location: saltos[u] } }));
  caso('abrirLink segue mais de um salto ate a loja', fim === 'https://www.amazon.com.br/dp/B0Y', fim);
  let e2 = null; try { await abrirLink('https://amzn.to/a', async () => ({ headers: {} })); } catch (x) { e2 = x.message; }
  caso('abrirLink sem destino: erro (nao devolve o link curto como se fosse produto)', /nao abriu|não abriu/.test(e2 || ''));
}

console.log(`\n  ${ok}/${ok + mau} PASS`);
if (mau) process.exitCode = 1;
