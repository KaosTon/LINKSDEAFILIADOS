// Bateria do garimpo (fluxo 03). Páginas de canal no formato do t.me/s, com
// conteúdo inventado. O que não pode acontecer: sair link de outra pessoa,
// repetir produto, postar coisa proibida, passar do limite do dia, e o texto
// do canal (com @ e chamada dele) ir para o seu grupo.
import { pegarCodigo, rodar } from './executar.mjs';
import { lerCanalTelegram, lerPost, lerPreco, legendaAchado, gancho, reaisCurto, limparChamada, pedidoChamada, MODELO_CHAMADA, proibido, lerAmazonDeals, garimpar, arrumarMemoria, podeAgora,
         registrarPostado, converterLink, legendaCupom } from '../../lib/ofertas.mjs';

let ok = 0, mau = 0;
const caso = (nome, cond, extra) => {
  if (cond) { ok++; console.log(`  PASS  ${nome}`); }
  else { mau++; console.log(`  FAIL  ${nome}${extra !== undefined ? '\n        ' + JSON.stringify(extra) : ''}`); }
};
const html = (t) => t.replace(/\$/g, '&#036;').replace(/!/g, '&#33;')
  .replace(/https?:\/\/[^\s<]+/g, u => `<a href="${u}" target="_blank">${u}</a>`).replace(/\n/g, '<br/>');
const post = (id, quando, texto, foto) => `<div class="tgme_widget_message_wrap js-widget_message_wrap"><div class="tgme_widget_message" data-post="${id}">`
  + (foto ? `<a class="tgme_widget_message_photo_wrap 1" style="width:800px;background-image:url('${foto}')"></a>` : '')
  + `<div class="tgme_widget_message_text js-message_text" dir="auto">${html(texto)}</div><div class="tgme_widget_message_footer"><time datetime="${quando}" class="time">22:28</time></div></div></div>`;
const pagina = (...posts) => `<html><body>${posts.join('\n')}</body></html>`;

const AGORA = new Date('2026-10-06T15:00:00Z');   // 12h em SP
const min = (m) => new Date(AGORA.getTime() - m * 6e4).toISOString();
const CFG = { amazonTag: 'minha-20', magaluLoja: 'minhaloja', inicio: 8, fim: 22, porDia: 25, cuponsPorDia: 6,
  idadeMaxMin: 120, maxTentativas: 8, descontoMin: 15, canais: ['canalum', 'canaldois'], shopee: false };
const REDIR = {
  'https://amzn.to/aaa': 'https://www.amazon.com.br/dp/B0AAAAAAAA?tag=outro-20&linkCode=sl1',
  'https://link.amazon/Bccc': 'https://www.amazon.com.br/Produto-Teste/dp/B0CCCCCCCC/ref=x?tag=outro-20',
  'https://pechin.co/111': 'https://amzn.to/ddd', 'https://amzn.to/ddd': 'https://www.amazon.com.br/dp/B0DDDDDDDD?tag=outro-21',
  'https://divulgador.magalu.com/Xyz': 'https://www.magazinevoce.com.br/magazineoutraloja/fone-teste/p/abc123def4/el/fone/',
};
const rede = { abrir: async (u) => {
  let a = u;
  for (let i = 0; i < 6 && REDIR[a]; i++) a = REDIR[a];
  if (a === u && !/amazon\.com\.br|magazinevoce/.test(u)) throw new Error('nao abriu');
  return a;
}, shopee: async () => null };
const memNova = () => arrumarMemoria({}, AGORA);

console.log('\n=== Leitura do canal ===');
const P1 = 'Monitor Gamer Teste 25 144hz\n\n🔥 Por: R$ 458 no Pix\n\n🛒 Link: https://amzn.to/aaa';
{
  const ps = lerCanalTelegram(pagina(post('canalum/1', min(10), P1, 'https://cdn1.telesco.pe/file/f1'), post('canalum/2', min(5), 'Veja https://t.me/outrocanal')));
  caso('le id, hora, foto e texto (com R$ e ! desfeitos)', ps.length === 2 && ps[0].id === 'canalum/1' && ps[0].foto === 'https://cdn1.telesco.pe/file/f1' && /R\$ 458/.test(ps[0].texto), ps[0]);
  caso('link para outro canal do Telegram nao conta', ps[1].links.length === 0);
}
{
  const a = lerPost(P1);
  caso('produto: nome, preco e link', a.tipo === 'produto' && a.nome === 'Monitor Gamer Teste 25 144hz' && a.preco === 458 && a.pagamento === 'no Pix' && a.link === 'https://amzn.to/aaa', a);
  const b = lerPost('QNED MINI LED 4K 🎬\n\n- Smart TV Teste 55 Mini LED\n\n🔥 Por: R$ 2.667 Parcelado\n🎯 Usem o cupom: TODOSEU\n\n🛒 Link: https://meli.la/zzz');
  caso('chamada em maiuscula + "- nome": pega o nome certo, preco e cupom', b.nome === 'Smart TV Teste 55 Mini LED' && b.preco === 2667 && b.pagamento === 'parcelado' && b.cupons.join() === 'TODOSEU', b);
  const c = lerPost('BAIXOU! 🏃 Sanduicheira! 🍔 UM LUXO\n\n•⁠  Sanduicheira Teste 2 em 1 850W\n\n🔥 R$ 90,14 Parcelado\nAchado Amazon 👇🏻\n🛒 https://pechin.co/111');
  caso('formato com "•" e preco sem "Por"', c.tipo === 'produto' && c.nome === 'Sanduicheira Teste 2 em 1 850W' && c.preco === 90.14 && c.link === 'https://pechin.co/111', c);
  const d = lerPost('Philco TV 50\n\n🔥 Por: R$ 1657 no pix\n⚠️ Resgate os cupons: https://s.shopee.com.br/cupons\n\n 🛒 Link: https://s.shopee.com.br/produto');
  caso('dois links: pega o da linha "Link:", nao o da pagina de cupons', d.link === 'https://s.shopee.com.br/produto', d);
  const e = lerPost('🔥 Cupons Mercado Livre em Selecionados\n\n🎟 20% OFF acima de R$89, limite R$30: TESTEUM\nLista: https://meli.la/l1\n\n🎟 10% OFF acima de R$99, limite R$20: TESTE0510\nLista: https://meli.la/l2');
  caso('post de cupom: tipo, codigos e linhas', e.tipo === 'cupom' && e.cupons.join() === 'TESTEUM,TESTE0510' && e.linhasCupom.length === 2 && /20% OFF/.test(e.linhasCupom[0]), e);
  const f = lerPost('🚨 Cupom Magalu APP\n\n🎟 15% OFF em compras de até R$500 - TESTE15\n\n✅ Resgate aqui:\nhttps://divulgador.magalu.com/Xyz');
  caso('cupom depois de " - "; "Magalu" e "APP" nao viram codigo', f.cupons.join() === 'TESTE15', f.cupons);
}
console.log('\n=== Padrao dos grupos de oferta ===');
{
  const a = lerPreco('💵 De R$456 por R$266 pix');
  caso('"De R$456 por R$266 pix": antes, depois e forma de pagamento', a.precoAntes === 456 && a.preco === 266 && a.pagamento === 'no Pix', a);
  const b = lerPreco('💵 De R$135 por a partir de R$57 até 2x sem juros');
  caso('"por a partir de" e "ate 2x sem juros"', b.preco === 57 && b.precoAntes === 135 && b.aPartir && b.pagamento === 'em até 2x sem juros', b);
  caso('"De" menor que o "por" nao vale (nao inventa desconto)', lerPreco('De R$50 por R$80').precoAntes === null);
  const P = lerPost('VOU DEIXAR SUA COZINHA SEM OLEO\n\nAir Fryer Teste 6,5L 1700W\n\n💵 De R$456 por R$266 pix\n🛒 https://amzn.to/aaa\n\n🏷️ Use o cupom TESTECUPOM0510 + Selecione PIX');
  caso('post no padrao: nome (pula a chamada), precos e cupom (sem "Selecione")', P.nome === 'Air Fryer Teste 6,5L 1700W' && P.preco === 266 && P.precoAntes === 456 && P.cupons.join() === 'TESTECUPOM0510', P);
  caso('dois cupons, o segundo na linha de baixo com "+"', lerPost('X Teste\n\n💵 Por R$9\n🛒 https://amzn.to/b\n\n🏷️ Use o cupom TESTEUM\n+ TESTEDOIS').cupons.join() === 'TESTEUM,TESTEDOIS');
  const L = legendaAchado({ ...P, link: 'https://www.amazon.com.br/dp/B0X?tag=minha-20', chave: 'amazon:B0X' });
  const linhas = L.split('\n');
  caso('legenda: chamada, nome, De/por com pix, link, cupom, nessa ordem', linhas[0] === '42% OFF, CORRE' && linhas[2] === 'Air Fryer Teste 6,5L 1700W' && linhas[4] === '\u{1F4B5} De R$456 por R$266 no Pix' && linhas[5] === '\u{1F6D2} https://www.amazon.com.br/dp/B0X?tag=minha-20' && linhas[7] === '\u{1F3F7}\uFE0F Use o cupom TESTECUPOM0510', linhas);
  caso('a chamada e nossa, nao a do canal', !L.includes('COZINHA SEM OLEO'));
  caso('sem desconto grande: chamada da lista, sempre a mesma para o mesmo produto', gancho('amazon:Z', 10) === gancho('amazon:Z', 10) && !/OFF/.test(gancho('amazon:Z', 10)) && gancho('amazon:Z', 30) === '30% OFF, CORRE');
  caso('preco curto como nos grupos', reaisCurto(456) === '456' && reaisCurto(2667) === '2.667' && reaisCurto(67.6) === '67,60');
  const S = legendaAchado({ nome: 'Fone', preco: 99, link: 'https://x', chave: 'k' });
  caso('sem preco antes e sem cupom: so "Por", sem linha de cupom', /\u{1F4B5} Por R\$99$/mu.test(S) && !/cupom/i.test(S), S);
}
console.log('\n=== Chamada criativa (IA) ===');
{
  const N = 'Air Fryer Teste 6,5L 1700W';
  caso('frase boa: vira maiuscula, sem aspas, ponto ou emoji', limparChamada('"Vou aposentar o óleo da sua casa! 🍟"', N) === 'VOU APOSENTAR O ÓLEO DA SUA CASA');
  caso('pega so a primeira linha (sem explicacao da IA)', limparChamada('Adeus óleo na cozinha\n\nEssa chamada destaca...', N) === 'ADEUS ÓLEO NA COZINHA');
  caso('inventou preco, % ou promessa: descarta', limparChamada('Menor preço do ano', N) === null && limparChamada('Só R$ 99 hoje', N) === null && limparChamada('50% de desconto', N) === null && limparChamada('Frete grátis pra você', N) === null);
  caso('numero que nao esta no nome: descarta; o do nome pode', limparChamada('3 motivos pra comprar', N) === null && limparChamada('1700W de pura crocancia', N) === '1700W DE PURA CROCANCIA');
  caso('frase grande demais ou vazia: descarta', limparChamada('esta e uma frase muito longa que passa do limite de palavras que a gente aceita aqui', N) === null && limparChamada('', N) === null);
  const ped = pedidoChamada(N);
  caso('pedido: modelo barato por padrao, resposta curta, regras no sistema', ped.model === MODELO_CHAMADA && ped.max_tokens <= 60 && /Proibido/.test(ped.messages[0].content) && ped.messages[1].content.includes(N));
  caso('OPENROUTER_MODELO troca o modelo', pedidoChamada(N, 'outro/modelo').model === 'outro/modelo');
  const L = legendaAchado({ nome: N, preco: 266, precoAntes: 456, link: 'https://x', chave: 'k', chamada: 'VOU APOSENTAR O ÓLEO DA SUA CASA' });
  caso('com chamada da IA: ela vai na primeira linha', L.split('\n')[0] === 'VOU APOSENTAR O ÓLEO DA SUA CASA');
  const mem = memNova();
  const pg = { canalum: pagina(post('canalum/70', min(5), P1)) };
  const r1 = await garimpar({ canais: pg, agora: AGORA, cfg: CFG, mem, rede: { ...rede, chamada: async () => 'MONITOR PRA JOGAR SEM TRAVAR' } });
  caso('garimpo usa a chamada da IA', r1.texto.startsWith('MONITOR PRA JOGAR SEM TRAVAR') && r1.chamada_ia === true, r1.texto);
  const r2 = await garimpar({ canais: pg, agora: AGORA, cfg: CFG, mem: memNova(), rede: { ...rede, chamada: async () => { throw new Error('timeout'); } } });
  caso('IA caiu: o post sai mesmo assim, com a chamada da lista', r2.acao === 'postar' && r2.chamada_ia === false && r2.texto.split('\n')[0] === gancho('amazon:B0AAAAAAAA', 0), r2.texto);
}
caso('proibido: bebida alcoolica e aposta', proibido('Whisky Teste 21 Anos 700ml') && proibido('cassino online') && !proibido('Chaleira inox'));

console.log('\n=== Amazon /deals ===');
const DEALS = 'lixo antes {"x":1,"productSearchResponse":{"nextIndex":0,"products":[' +
  JSON.stringify({ asin: 'B0EEEEEEEE', title: 'Kindle Teste [modelo] {2026}', image: { hiRes: { baseUrl: 'https://m.media-amazon.com/images/I/abc', extension: 'jpg' } },
    price: { priceToPay: { price: '519.0' }, basisPrice: { price: '899.0' } }, dealBadge: { messaging: { content: { fragments: [{ text: 'Mega Oferta Prime' }] } } }, dealDetails: { state: 'AVAILABLE' } }) + ',' +
  JSON.stringify({ asin: 'B0FFFFFFFF', title: 'Fone Teste', image: { lowRes: { baseUrl: 'https://m.media-amazon.com/images/I/def', extension: 'jpg' } },
    price: { priceToPay: { price: '90.0' }, basisPrice: { price: '100.0' } }, dealDetails: { state: 'AVAILABLE' } }) + ',' +
  JSON.stringify({ asin: 'B0GGGGGGGG', title: 'Esgotado', price: { priceToPay: { price: '10.0' } }, dealDetails: { state: 'EXPIRED' } }) +
  '],"startIndex":0},"resto":"]}"} depois';
{
  const a = lerAmazonDeals(DEALS);
  caso('le os produtos (colchete dentro do texto nao atrapalha), tira o esgotado', a.length === 2 && a[0].asin === 'B0EEEEEEEE', a.map(x => x.asin));
  caso('preco, preco antes, desconto e foto', a[0].preco === 519 && a[0].precoAntes === 899 && a[0].desconto === 42 && a[0].foto === 'https://m.media-amazon.com/images/I/abc.jpg' && a[0].prime === true, a[0]);
  caso('pagina sem o JSON: lista vazia', lerAmazonDeals('<html>nada</html>').length === 0);
}

console.log('\n=== Conversao de link de terceiro ===');
{
  const a = await converterLink('https://link.amazon/Bccc', CFG, rede, true);
  caso('link.amazon: abre e sai curto, so com a sua tag', a.ok && a.url === 'https://www.amazon.com.br/dp/B0CCCCCCCC?tag=minha-20' && a.chave === 'amazon:B0CCCCCCCC', a);
  const b = await converterLink('https://pechin.co/111', CFG, rede, true);
  caso('encurtador do canal que cai em outro encurtador: segue ate a Amazon', b.ok && b.url.endsWith('B0DDDDDDDD?tag=minha-20'), b);
  const c = await converterLink('https://meli.la/zzz', CFG, rede, true);
  caso('ML de canal: nunca passa (seria comissao de outra pessoa)', !c.ok && c.motivo === 'ml_terceiro');
  const d = await converterLink('https://divulgador.magalu.com/Xyz', CFG, rede, true);
  caso('Magalu de outra loja: vira a sua', d.ok && d.url.includes('/magazineminhaloja/fone-teste/p/abc123def4/'), d);
  const e = await converterLink('https://s.shopee.com.br/x', CFG, rede, true);
  caso('Shopee sem API: nao passa', !e.ok && e.motivo !== undefined);
}

console.log('\n=== Escolha ===');
{
  const mem = memNova();
  const canais = { canalum: pagina(
    post('canalum/10', min(200), 'Velho Produto\n\n🔥 Por: R$ 10\n\n🛒 Link: https://amzn.to/aaa', 'https://cdn/f0'),
    post('canalum/11', min(30), 'Produto ML Teste\n\n🔥 Por: R$ 99\n\n🛒 Link: https://meli.la/m1', 'https://cdn/f1'),
    post('canalum/12', min(40), P1 + '\n\n👀 Visto em https://t.me/canalum @canalum entre no grupo', 'https://cdn/f2')) };
  const r = await garimpar({ canais, agora: AGORA, cfg: CFG, mem, rede });
  caso('pula o ML e posta o da Amazon com a sua tag', r.acao === 'postar' && r.chave === 'amazon:B0AAAAAAAA' && r.texto.includes('https://www.amazon.com.br/dp/B0AAAAAAAA?tag=minha-20'), r);
  caso('legenda no seu padrao: nome e preco; nada do canal (@, "Visto em", t.me)', /Monitor Gamer Teste/.test(r.texto) && /Por R\$458 no Pix/.test(r.texto) && !/@canalum|Visto em|t\.me|outro-20/.test(r.texto), r.texto);
  caso('vai com a foto do post', r.imagem === 'https://cdn/f2');
  caso('post com mais de 2 horas nao entra', !mem.vistos['canalum/10']);
  caso('os tentados ficam marcados (nao tenta de novo)', mem.vistos['canalum/11'] && mem.vistos['canalum/12']);
  registrarPostado(mem, r, AGORA);
  const de_novo = await garimpar({ canais: { canaldois: pagina(post('canaldois/5', min(3), 'Outro Canal Mesmo Produto\n\n🔥 Por: R$ 450\n\n🛒 Link: https://amzn.to/aaa')) }, agora: AGORA, cfg: CFG, mem, rede });
  caso('mesmo produto vindo de outro canal: nao repete', de_novo.acao === 'nada' && de_novo.tentou.some(x => x[1] === 'repetido'), de_novo);
}
{
  const mem = memNova();
  const r = await garimpar({ canais: { canalum: pagina(post('canalum/20', min(5), 'Whisky Teste 12 Anos\n\n🔥 Por: R$ 99\n\n🛒 Link: https://amzn.to/aaa')) }, amazonHtml: DEALS, agora: AGORA, cfg: CFG, mem, rede });
  caso('proibido no canal: pula; sem mais nada, vai para as ofertas da Amazon (maior desconto)', r.acao === 'postar' && r.chave === 'amazon:B0EEEEEEEE' && /De R\$899 por R\$519 \(oferta Prime\)/.test(r.texto) && /^42% OFF/.test(r.texto), r);
  const r2 = await garimpar({ canais: {}, amazonHtml: DEALS, agora: AGORA, cfg: { ...CFG, descontoMin: 50 }, mem: memNova(), rede });
  caso('Amazon abaixo do desconto minimo: nao posta', r2.acao === 'nada');
}
{
  const mem = memNova();
  const cup = post('canalum/30', min(5), '🔥 Cupons Mercado Livre\n\n🎟 10% OFF acima de R$89, limite R$40: TESTEDOIS\n\n✅ Resgate aqui:\nhttps://meli.la/c1');
  const r = await garimpar({ canais: { canalum: pagina(cup) }, agora: AGORA, cfg: CFG, mem, rede });
  caso('cupom do ML sem link convertivel: sai so com o codigo, sem link de ninguem', r.acao === 'postar' && r.tipo === 'cupom' && /TESTEDOIS/.test(r.texto) && !/meli\.la|https?:/.test(r.texto), r);
  const mem2 = memNova(); mem2.cupons = 6;
  const r2 = await garimpar({ canais: { canalum: pagina(cup) }, agora: AGORA, cfg: CFG, mem: mem2, rede });
  caso('limite de cupons do dia: nao posta cupom', r2.acao === 'nada');
  const r3 = await garimpar({ canais: { canalum: pagina(post('canalum/31', min(5), '🔥 Cupom Amazon\n\n🎟 Use o cupom: CANALUM10 em tudo\n\nhttps://amzn.to/aaa')) }, agora: AGORA, cfg: CFG, mem: memNova(), rede });
  caso('cupom com o nome do canal (pessoal): nao posta', r3.acao === 'nada' && r3.tentou.some(x => x[1] === 'cupom_do_canal'), r3);
  const r4 = await garimpar({ canais: { canalum: pagina(post('canalum/32', min(5), '🚨 Cupom Magalu APP\n\n🎟 15% OFF em compras de até R$500 - TESTE15\n\n✅ Resgate aqui:\nhttps://divulgador.magalu.com/Xyz')) }, agora: AGORA, cfg: CFG, mem: memNova(), rede });
  caso('cupom Magalu: sai com o link da SUA loja', r4.acao === 'postar' && r4.texto.includes('/magazineminhaloja/') && /CUPOM MAGALU/.test(r4.texto), r4);
}
{
  const muitos = Array.from({ length: 12 }, (_, i) => post(`canalum/4${i}`, min(5 + i), `Produto ML ${i}\n\n🔥 Por: R$ 9\n\n🛒 Link: https://meli.la/x${i}`));
  const r = await garimpar({ canais: { canalum: pagina(...muitos) }, agora: AGORA, cfg: CFG, mem: memNova(), rede });
  caso('no maximo 8 tentativas por rodada (nao martela os sites)', r.acao === 'nada' && r.tentou.length === 8, r.tentou.length);
}

console.log('\n=== Horario e limite ===');
{
  const mem = memNova();
  caso('12h em SP: pode', podeAgora(mem, AGORA, CFG).ok);
  caso('23h em SP: fora do horario', podeAgora(mem, new Date('2026-10-07T02:00:00Z'), CFG).motivo === 'fora_do_horario');
  caso('7h59 em SP: fora do horario', podeAgora(mem, new Date('2026-10-06T10:59:00Z'), CFG).motivo === 'fora_do_horario');
  mem.postados = 25;
  caso('25 no dia: para', podeAgora(mem, AGORA, CFG).motivo === 'limite_do_dia');
  arrumarMemoria(mem, new Date('2026-10-07T12:00:00Z'));
  caso('dia novo: zera a conta', mem.postados === 0 && mem.dia === '2026-10-07');
  mem.produtos['amazon:X'] = AGORA.getTime() - 8 * 864e5; mem.produtos['amazon:Y'] = AGORA.getTime();
  arrumarMemoria(mem, AGORA);
  caso('esquece produto com mais de 7 dias, guarda o recente', !mem.produtos['amazon:X'] && mem.produtos['amazon:Y']);
  registrarPostado(mem, { chave: 'cupom:A', tipo: 'cupom' }, AGORA);
  caso('registrar: conta post e cupom', mem.postados === 1 && mem.cupons === 1 && mem.produtos['cupom:A']);
}
caso('legenda de cupom sem link nao fala de afiliado', !/afiliado/.test(legendaCupom({ cupons: ['X1234'] })));

console.log('\n=== No "Garimpa" (como vai para o n8n) ===');
{
  const codigo = pegarCodigo('03-garimpo.json', 'Garimpa');
  const ENV = { AMAZON_TAG: 'minha-20', GRUPO_OFERTAS: '120363000000000002-group', GARIMPO_CANAIS: 'canalum' };
  const pag = pagina(post('canalum/90', min(5), P1, 'https://cdn/f9'));
  const http = [
    { quando: /t\.me\/s\/canalum/, responde: { statusCode: 200, body: pag } },
    { quando: /amazon\.com\.br\/deals/, responde: { statusCode: 200, body: '<html></html>' } },
    { quando: /amzn\.to\/aaa/, responde: { statusCode: 301, headers: { location: 'https://www.amazon.com.br/dp/B0AAAAAAAA?tag=outro-20' } } },
  ];
  const roda = (extra = {}) => rodar(codigo, { env: ENV, http, memoria: {}, agora: AGORA, ...extra });
  const a = await roda();
  const o = a.saida[0].json;
  caso('desligado (sem GARIMPO_LIGADO): calcula a oferta mas NAO posta', o.postar === false && o.ligado === false && o.chave === 'amazon:B0AAAAAAAA' && /tag=minha-20/.test(o.texto), o);
  const b = await roda({ env: { ...ENV, GARIMPO_LIGADO: 'sim' } });
  caso('ligado: posta no GRUPO_OFERTAS, com a foto do post', b.saida[0].json.postar === true && b.saida[0].json.grupo === ENV.GRUPO_OFERTAS && b.saida[0].json.imagem === 'https://cdn/f9');
  const c = await roda({ env: { ...ENV, GARIMPO_LIGADO: 'sim' }, bloquear: ['url'] });
  caso('sem o modulo url: nao estoura, diz o motivo', c.saida[0].json.postar === false && /crypto,url/.test(c.saida[0].json.motivo));
  const d = await roda({ env: { ...ENV, GARIMPO_LIGADO: 'sim' }, memoria: { dia: '2026-10-06', postados: 25 } });
  caso('limite do dia (memoria do fluxo): nem busca nos sites', d.saida[0].json.motivo === 'limite_do_dia' && d.chamadas.length === 0, d.saida[0].json);
  const e = await roda({ env: { ...ENV, GARIMPO_LIGADO: 'sim' }, agora: new Date('2026-10-07T03:00:00Z') });
  caso('meia-noite em SP: fora do horario, nem busca', e.saida[0].json.motivo === 'fora_do_horario' && e.chamadas.length === 0);
  const f = await roda({ env: { ...ENV, GARIMPO_LIGADO: 'sim', GARIMPO_INICIO: '13' } });
  caso('GARIMPO_INICIO muda a janela (13h: ainda nao)', f.saida[0].json.motivo === 'fora_do_horario');
  const g = await roda({ memoria: { dia: '2026-10-06', postados: 25 }, modo: 'test' });
  caso('rodado na mao no editor (mode test): ignora o limite e mostra o que sairia', g.saida[0].json.chave === 'amazon:B0AAAAAAAA' && g.saida[0].json.teste === true && g.saida[0].json.postar === false, g.saida[0].json);
  const h = await roda({ env: { ...ENV, GARIMPO_LIGADO: 'sim' }, agora: new Date('2026-10-07T03:00:00Z'), modo: 'production' });
  caso('no gatilho (production) fora do horario: nao posta', h.saida[0].json.motivo === 'fora_do_horario');
  const ia = await roda({ env: { ...ENV, OPENROUTER_API_KEY: 'chave-teste' }, http: [...http,
    { quando: /openrouter\.ai\/api\/v1\/chat\/completions/, metodo: 'POST', responde: { choices: [{ message: { content: 'Monitor pra jogar sem travar' } }] } }] });
  const chamadaIA = ia.chamadas.find(c => /openrouter/.test(c.url));
  caso('no com OPENROUTER_API_KEY: pede a chamada e usa', ia.saida[0].json.texto.startsWith('MONITOR PRA JOGAR SEM TRAVAR') && chamadaIA && chamadaIA.headers.Authorization === 'Bearer chave-teste', ia.saida[0].json);
  caso('no sem OPENROUTER_API_KEY: nao chama o OpenRouter', !a.chamadas.some(c => /openrouter/.test(c.url)));
  const anota = pegarCodigo('03-garimpo.json', 'Anota');
  const mem = { postados: 3, produtos: {} };
  await rodar(anota, { itens: [{ json: { ok: false, erro: 'x' } }], memoria: mem, nos: { 'Garimpa': [{ json: { chave: 'amazon:Z', tipo: 'produto' } }] } });
  caso('Anota: envio falhou, nao conta nem guarda', mem.postados === 3 && !mem.produtos['amazon:Z']);
  await rodar(anota, { itens: [{ json: { ok: true } }], memoria: mem, nos: { 'Garimpa': [{ json: { chave: 'cupom:Q', tipo: 'cupom' } }] } });
  caso('Anota: envio confirmado, conta e guarda', mem.postados === 4 && mem.cupons === 1 && mem.produtos['cupom:Q']);
}

console.log(`\n  ${ok}/${ok + mau} PASS`);
if (mau) process.exitCode = 1;
