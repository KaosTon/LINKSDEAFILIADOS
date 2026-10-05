// Bateria das funções de ofertas (lib/ofertas.mjs). O que não pode acontecer:
// postar o link de afiliado de outra pessoa, mandar link quebrado por causa
// de pontuação grudada, e legenda com preço inventado.
import crypto from 'node:crypto';
import { extrairLinks, plataformaDe, eEncurtado, amazonComTag, shopeeCorpo,
         shopeeAutorizacao, reais, legenda } from '../../lib/ofertas.mjs';

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

console.log(`\n  ${ok}/${ok + mau} PASS`);
if (mau) process.exitCode = 1;
