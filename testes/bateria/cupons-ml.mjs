// Bateria dos cupons do Mercado Livre (fluxo 09). Textos no formato do canal "Afiliados e Criadores Mercado Livre",
// com códigos inventados. O que não pode: cupom vencido, cupom repetido, link sem a sua etiqueta, post de "live" virar cupom.
import { lerCuponsML, validadeDe, linkMLComEtiqueta, lojaDoLink, escolherCupons, textoCupons, horaDosCupons, anotarCupons } from '../../lib/cupons-ml.mjs';
import { postDoCanalOficial, CANAIS_OFICIAIS } from '../../lib/aviso-entrada.mjs';

let ok = 0, mau = 0;
const caso = (nome, cond, extra) => {
  if (cond) { ok++; console.log(`  PASS  ${nome}`); }
  else { mau++; console.log(`  FAIL  ${nome}${extra !== undefined ? '\n        ' + JSON.stringify(extra) : ''}`); }
};
const T = (iso) => Date.parse(iso);
const HOJE = T('2026-11-24T14:30:00Z');   // 11h30 em SP

const DOIS_HOJE = '*Tem cupom pra ajudar os dois lados!*\n\n🎟️ TESTEDEZ 👉 10% OFF\nCompra mín.: R$199 | Desconto máx: R$200\nVálido somente hoje, enquanto durarem os estoques, em produtos elegíveis.\n\n🎟️ TESTEREAIS 👉 R$250 OFF\nEm compras a partir de R$2.499\nVálido somente hoje.\n\n🎟️ TESTETECH 👉 10% OFF*\nTecnologia\nCompra mín.: R$199 | Desconto máx: R$200\n\n🔗 https://bit.ly/teste1\n\n> *Válidos somente hoje, enquanto durarem os estoques, em até 90% das respectivas categorias.';
const LONGOS = '*Mais opções:*\n\n🎟️ TESTETRINTA 👉 30% OFF\nVariados | Compra mínima: R$1 | Desconto máx: R$500\n🔗 https://bit.ly/teste2\n\n🎟️ TESTEVINTE 👉 25% OFF\nCompra mínima: R$1 | Desconto máx: R$500\n🔗 https://bit.ly/teste3\n\n> Válidos até 20.12, ou enquanto durarem os estoques, em produtos elegíveis.';
const LIVE = '*A CASA TÁ PRONTA!*\n\nÀs 11h, nossos especialistas vão compartilhar produtos.\n\nAo vivo em 15 minutos! 👇\n🔗 https://bit.ly/teste4';
const ONTEM = '🎟️ TESTEONTEM 👉 12% OFF\nCompra mín.: R$59 | Desconto máx.: R$120\n\n🔗 https://bit.ly/teste5';

console.log('\n=== Leitura dos cupons ===');
{
  const a = lerCuponsML(DOIS_HOJE, T('2026-11-24T13:00:00Z'));
  caso('3 cupons com código, desconto, mínimo e máximo', a.length === 3 && a[0].codigo === 'TESTEDEZ' && a[0].pct === 10 && a[0].minimo === 199 && a[0].maximo === 200
    && a[1].codigo === 'TESTEREAIS' && a[1].reais === 250 && a[1].minimo === 2499, a);
  caso('categoria do cupom (Tecnologia) e validade de hoje', a[2].categoria === 'Tecnologia' && a.every(c => c.ate === '2026-11-24'), a);
  caso('sem link próprio, vale o link do post', a.every(c => c.link === 'https://bit.ly/teste1'));
  const b = lerCuponsML(LONGOS, T('2026-11-24T14:00:00Z'));
  caso('"Variados" não vira categoria; mínimo de R$1; validade até 20/12; link de cada um', b.length === 2 && !b[0].categoria && b[0].minimo === 1 && b[0].ate === '2026-12-20'
    && b[0].link === 'https://bit.ly/teste2' && b[1].link === 'https://bit.ly/teste3', b);
  caso('post de live, sem código: nenhum cupom', lerCuponsML(LIVE, HOJE).length === 0);
  caso('sem data no texto: vale só no dia do post', lerCuponsML(ONTEM, T('2026-11-23T21:00:00Z'))[0].ate === '2026-11-23');
  caso('"somente em 24.11" e "até 31.12"', validadeDe('Válidos somente em 24.11', HOJE) === '2026-11-24' && validadeDe('Válidos até 31.12', HOJE) === '2026-12-31');
  caso('"até 10.01" em novembro é do ano seguinte', validadeDe('Válidos até 10.01', HOJE) === '2027-01-10');
}

console.log('\n=== Link com a sua etiqueta ===');
{
  const l = linkMLComEtiqueta('https://lista.mercadolivre.com.br/_Container_aff-list-55?matt_tool=99999999&utm_medium=notifications&utm_source=whatsapp&glk=abc123', 'minhaetiqueta', '11112222');
  caso('troca matt_tool, tira utm e glk, põe matt_word', l === 'https://lista.mercadolivre.com.br/_Container_aff-list-55?matt_word=minhaetiqueta&matt_tool=11112222', l);
  caso('fora do ML ou sem etiqueta: null', linkMLComEtiqueta('https://bit.ly/x', 'a', 'b') === null && linkMLComEtiqueta('https://www.mercadolivre.com.br/x', '', 'b') === null);
  caso('loja oficial pelo link', lojaDoLink('https://www.mercadolivre.com.br/loja/principia?x=1') === 'Principia' && lojaDoLink('https://www.mercadolivre.com.br/black-friday') === null);
}

console.log('\n=== Escolha ===');
{
  const posts = [
    { id: 'ml-afiliados/1', quando: '2026-11-23T21:00:00Z', texto: ONTEM },
    { id: 'ml-afiliados/2', quando: '2026-11-24T13:00:00Z', texto: DOIS_HOJE },
    { id: 'ml-afiliados/3', quando: '2026-11-24T13:45:00Z', texto: LIVE },
    { id: 'ml-afiliados/4', quando: '2026-11-24T14:00:00Z', texto: LONGOS },
  ];
  const e = escolherCupons(posts, HOJE, {});
  const cod = e.map(c => c.codigo);
  caso('cupom de ontem (vencido) não sai', !cod.includes('TESTEONTEM'), cod);
  caso('os que vencem hoje e gerais na frente; categoria por último', cod[0] === 'TESTEREAIS' && cod[1] === 'TESTEDEZ' && cod.indexOf('TESTETECH') > cod.indexOf('TESTEVINTE'), cod);
  caso('no máximo 5', escolherCupons(posts, HOJE, {}, { max: 2 }).length === 2);
  const mem = anotarCupons({}, ['TESTETRINTA'], T('2026-11-23T15:00:00Z'));
  caso('cupom postado ontem não repete (5 dias)', !escolherCupons(posts, HOJE, mem).some(c => c.codigo === 'TESTETRINTA'));
  caso('6 dias depois pode voltar', escolherCupons(posts, T('2026-11-29T15:00:00Z'), mem).some(c => c.codigo === 'TESTETRINTA'));
  caso('código repetido em dois posts sai uma vez', escolherCupons([...posts, { id: 'ml-afiliados/5', quando: '2026-11-24T14:05:00Z', texto: LONGOS }], HOJE, {}).filter(c => c.codigo === 'TESTETRINTA').length === 1);
}

console.log('\n=== Texto do post ===');
{
  const e = escolherCupons([{ id: 'x', quando: '2026-11-24T13:00:00Z', texto: DOIS_HOJE }, { id: 'y', quando: '2026-11-24T14:00:00Z', texto: LONGOS }], HOJE, {});
  const links = Object.fromEntries(e.map(c => [c.codigo, `https://www.mercadolivre.com.br/${c.link.slice(-6)}?matt_word=minhaetiqueta`]));
  const t = textoCupons(e, HOJE, links);
  caso('cabeçalho, código em negrito, desconto, mínimo e validade', /CUPONS DO MERCADO LIVRE/.test(t) && /\*TESTEREAIS\*: R\$250 OFF, acima de R\$2\.499, só hoje/.test(t)
    && /\*TESTETRINTA\*: 30% OFF, sem compra mínima \(desconto até R\$500\), até 20\/12/.test(t) && /em Tecnologia/.test(t), t);
  caso('mesmo link em cupons seguidos sai uma vez só', (t.match(/teste1\?/g) || []).length === 1, t);
  caso('todo link é o com a sua etiqueta', (t.match(/https?:\/\/\S+/g) || []).every(u => /matt_word=minhaetiqueta/.test(u)), t);
  caso('sem travessão', !/[–—]/.test(t));
}

console.log('\n=== Hora e memória ===');
{
  caso('antes das 11h30 não posta', !horaDosCupons({}, T('2026-11-24T14:00:00Z')));
  caso('11h30 posta; depois de postar, não posta de novo no dia', horaDosCupons({}, HOJE) && !horaDosCupons(anotarCupons({}, ['A'], HOJE), HOJE + 3600e3));
  caso('depois das 21h não posta', !horaDosCupons({}, T('2026-11-25T00:30:00Z')));
  const mem = anotarCupons({ cuponsPostados: { VELHO: '2026-10-01' } }, ['NOVO'], HOJE);
  caso('anotar guarda o dia, os códigos e esquece os de mais de 30 dias', mem.cuponsDia === '2026-11-24' && mem.cuponsPostados.NOVO === '2026-11-24' && !mem.cuponsPostados.VELHO, mem);
}

console.log('\n=== Canal de cupons no fluxo 01 ===');
{
  const ML = Object.keys(CANAIS_OFICIAIS).find(k => CANAIS_OFICIAIS[k] === 'ml-afiliados');
  const p = postDoCanalOficial({ isNewsletter: true, phone: ML, messageId: '3EB0TESTE000000009', momment: HOJE, text: { message: LONGOS } });
  caso('post de texto do canal de cupons vale, com tipo cupom e sem foto', p && p.tipo === 'cupom' && p.foto === '' && p.links.length === 2 && p.canal === 'ml-afiliados', p);
  const MAGALU = Object.keys(CANAIS_OFICIAIS).find(k => CANAIS_OFICIAIS[k] === 'magalu-oficial');
  caso('Magalu continua só com foto e tipo produto', postDoCanalOficial({ isNewsletter: true, phone: MAGALU, messageId: '3EB0TESTE000000010', momment: HOJE, text: { message: 'oi' } }) === null
    && postDoCanalOficial({ isNewsletter: true, phone: MAGALU, messageId: '3EB0TESTE000000011', momment: HOJE, image: { imageUrl: 'https://x.example/f.jpg', caption: 'Produto: X' } }).tipo === 'produto');
}

console.log(`\n  ${ok}/${ok + mau} PASS`);
if (mau) process.exitCode = 1;
