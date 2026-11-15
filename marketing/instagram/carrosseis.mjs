// Carrosséis de dica do Instagram (15/11, versão aprovada pelo Wellington): capa com foto de gente de
// verdade e uma pergunta que toca na dor, telas com UMA ideia cada e algo para ver (gráfico, comparação,
// anotação), fecho com "salve" e o convite para o grupo. O gerar.mjs desenha cada tela em 1080x1350.
//
// Regras: fato só o que já está num post revisado do blog (o slug fica em "blog"); número de exemplo
// sempre com "EXEMPLO ILUSTRATIVO"; nada de oferta, loja ou marca real; sem travessão; sem "#publi".
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const url = (p) => pathToFileURL(path.resolve(aqui, p)).href;
const FONTES = `@font-face{font-family:M;src:url(${url('../../site/src/fonts/montserrat-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:Fi;src:url(${url('../../site/src/fonts/figtree-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}`;
const LOGO = url('../../site/public/logo/tem-descontos.webp'), LOGO_CLARO = url('../../site/public/logo/tem-descontos-claro.webp');

const BASE = `${FONTES}
*{margin:0;box-sizing:border-box}body{width:1080px;height:1350px;font-family:Fi;color:#032451;position:relative;overflow:hidden;background:#f7f8fb}
.k{position:absolute;left:72px;top:72px;font-family:M;font-weight:800;font-size:28px;letter-spacing:3px;color:#c81e28}
.pg{position:absolute;right:72px;top:72px;font-family:M;font-weight:800;font-size:28px;color:#9aa6bd}
.c{position:absolute;left:72px;right:72px;top:170px}
h2{font-family:M;font-weight:900;font-size:78px;line-height:1.04;letter-spacing:-2px}
.lead{font-size:40px;line-height:1.32;color:#33476b;margin-top:26px}
.ex{position:absolute;left:72px;font-size:24px;color:#8a95ab;font-weight:600;letter-spacing:1px}
.cartao{position:absolute;left:72px;right:72px;background:#fff;border-radius:36px;box-shadow:0 24px 60px rgba(3,36,81,.12);padding:44px}
.pe{position:absolute;left:72px;right:72px;bottom:56px;display:flex;justify-content:space-between;align-items:center}
.pe img{height:64px}.pe span{font-family:M;font-weight:700;font-size:28px;color:#5a6a88}`;
const pe = (claro = false) => `<div class="pe"><img src="${claro ? LOGO_CLARO : LOGO}"><span>@temdescontos</span></div>`;
const html = (css, corpo) => `<!doctype html><meta charset="utf-8"><style>${BASE}${css}</style>${corpo}`;

function capa({ foto, tag, titulo, sub }) {
  return html(`body{background:#07142e;color:#fff}.f{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%}
.v{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,20,46,0) 35%,rgba(7,20,46,.92) 68%)}
.cc{position:absolute;left:72px;right:72px;bottom:190px}.tag{display:inline-block;background:#ffd23f;color:#07142e;font-family:M;font-weight:900;font-size:30px;letter-spacing:2px;padding:12px 24px;border-radius:12px;transform:rotate(-2deg)}
h1{font-family:M;font-weight:900;font-size:100px;line-height:.98;letter-spacing:-3px;margin-top:34px}h1 em{font-style:normal;color:#ff8a3d}
.s{font-size:42px;color:#d5def0;margin-top:28px}.sw{position:absolute;right:72px;bottom:90px;font-family:M;font-weight:800;font-size:32px;color:#ffd23f}`,
  `<img class="f" src="${url(foto)}"><div class="v"></div><div class="cc"><span class="tag">${tag}</span><h1>${titulo}</h1><p class="s">${sub}</p></div><span class="sw">ARRASTE &rarr;</span>`);
}

function fecho({ titulo, texto }) {
  return html(`body{background:linear-gradient(160deg,#0d2f66,#07142e);color:#fff}.cc{position:absolute;left:72px;right:72px;top:300px}
.b{display:inline-flex;margin-top:60px;background:#fff;color:#07142e;font-family:M;font-weight:900;font-size:44px;padding:28px 48px;border-radius:999px}.pe span{color:#c9d6f2}`,
  `<div class="cc"><h2 style="font-size:88px">${titulo}</h2><p class="lead" style="color:#c9d6f2;margin-top:34px">${texto}</p><span class="b">Link na bio &rarr;</span></div>${pe(true)}`);
}

const tela = (k, i, n, titulo, lead, extra = '', css = '') => html(css,
  `<span class="k">${k}</span><span class="pg">${i}/${n}</span><div class="c"><h2>${titulo}</h2>${lead ? `<p class="lead">${lead}</p>` : ''}</div>${extra}${pe()}`);

export const CARROSSEIS = {
  // blog: historico-de-preco-como-consultar
  'preco-subiu': { blog: 'historico-de-preco-como-consultar', telas: (n = 6) => [
    capa({ foto: 'fundos/dica-preco-subiu.webp', tag: 'ANTES DA BLACK FRIDAY', titulo: 'A loja subiu o preço <em>antes</em> da promoção?', sub: 'Descubra em 30 segundos, de graça.' }),
    tela('O TRUQUE', 2, n, 'O "desconto" pode ser só o preço voltando ao normal', '', `<div class="cartao" style="top:520px;height:560px"><svg width="856" height="430" viewBox="0 0 856 430">
<line x1="0" y1="380" x2="856" y2="380" stroke="#e3e8f1" stroke-width="3"/>
<polyline points="20,300 180,300 300,300 380,120 600,120 660,300 836,300" fill="none" stroke="#032451" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="740" cy="300" r="18" fill="#c81e28"/>
<text x="40" y="275" font-family="M" font-weight="800" font-size="34" fill="#5a6a88">R$ 199</text>
<text x="400" y="95" font-family="M" font-weight="800" font-size="34" fill="#5a6a88">sobe para R$ 299</text>
<rect x="560" y="200" width="270" height="70" rx="35" fill="#c81e28"/><text x="695" y="247" text-anchor="middle" font-family="M" font-weight="900" font-size="32" fill="#fff">"33% OFF"</text>
<text x="700" y="345" font-family="M" font-weight="800" font-size="34" fill="#032451">R$ 199</text>
<text x="20" y="420" font-family="Fi" font-size="26" fill="#9aa6bd">setembro</text><text x="380" y="420" font-family="Fi" font-size="26" fill="#9aa6bd">outubro</text><text x="680" y="420" font-family="Fi" font-size="26" fill="#9aa6bd">Black Friday</text>
</svg></div><p class="ex" style="top:1110px">EXEMPLO ILUSTRATIVO</p>`),
    tela('ONDE VER', 3, n, 'Comparadores de preço mostram o histórico', 'Zoom e Buscapé mostram o gráfico na página do produto, de graça: 40 dias, 3 meses, 6 meses ou 1 ano.',
      `<div style="position:absolute;left:290px;top:640px;width:500px;height:520px;border-radius:60px;background:#032451;padding:22px"><div style="width:100%;height:100%;border-radius:42px;background:#fff;padding:40px 34px">
<p style="font-family:M;font-weight:800;font-size:30px">Histórico de preço</p><svg width="432" height="220" viewBox="0 0 432 220" style="margin-top:24px"><polyline points="0,160 90,150 160,60 260,70 320,150 432,140" fill="none" stroke="#f26027" stroke-width="8" stroke-linejoin="round"/><line x1="0" y1="200" x2="432" y2="200" stroke="#e3e8f1" stroke-width="3"/></svg>
<div style="height:22px;border-radius:11px;background:#e3e8f1;width:80%;margin-top:26px"></div><div style="height:22px;border-radius:11px;background:#e3e8f1;width:60%;margin-top:18px"></div></div></div>`),
    tela('A REGRA', 4, n, 'Compare com o menor preço do período', 'Não com o preço riscado. Ele pode estar inflado.',
      `<div style="position:absolute;left:72px;right:72px;top:640px;display:flex;gap:32px">
<div style="flex:1;border-radius:32px;padding:44px 36px;background:#fff;border:6px solid #e3e8f1"><p style="font-size:32px;color:#5a6a88;font-weight:600">Preço riscado</p><b style="display:block;font-family:M;font-size:84px;margin-top:14px;color:#9aa6bd;text-decoration:line-through">R$ 299</b><p style="margin-top:24px;font-family:M;font-weight:800;font-size:30px;color:#c81e28">&#10005; não compare</p></div>
<div style="flex:1;border-radius:32px;padding:44px 36px;background:#fff;border:6px solid #1f9d55"><p style="font-size:32px;color:#5a6a88;font-weight:600">Menor preço em 3 meses</p><b style="display:block;font-family:M;font-size:84px;margin-top:14px">R$ 199</b><p style="margin-top:24px;font-family:M;font-weight:800;font-size:30px;color:#1f9d55">&#10003; compare com este</p></div></div>
<p class="ex" style="top:1110px">EXEMPLO ILUSTRATIVO</p>`),
    tela('SEM GRÁFICO?', 5, n, 'Anote o preço com a data', 'Ou guarde um print. É o que os Procons orientam para conferir a promoção depois.',
      `<div style="position:absolute;left:72px;right:72px;top:660px;background:#fff8d6;border-radius:28px;padding:50px;transform:rotate(-1.5deg);box-shadow:0 20px 50px rgba(3,36,81,.1)">
${['01/11 &middot; R$ 199', '15/11 &middot; R$ 249', '28/11 &middot; R$ 199 "promoção"'].map(t => `<p style="font-family:M;font-weight:700;font-size:40px;line-height:1.6;border-bottom:3px dashed #e8d58a">${t}</p>`).join('')}</div>
<p class="ex" style="top:1130px">EXEMPLO ILUSTRATIVO</p>`),
    fecho({ titulo: 'Salve este post para a Black Friday', texto: 'E receba ofertas com o preço conferido na loja, todo dia, no nosso grupo grátis do WhatsApp.' }),
  ], legenda: 'Antes de comprar em promoção, veja se o preço não subiu nas semanas anteriores.\n\nComparadores como Zoom e Buscapé mostram o histórico de preço na página do produto, de graça. Compare o preço de hoje com o menor preço do período, não com o preço riscado. Produto sem gráfico: anote o preço com a data ou guarde um print, como orientam os Procons.\n\nSalve para consultar na Black Friday e mande para quem vai comprar. O passo a passo completo está no blog (link na bio).\n\n#blackfriday #dicasdecompra #economia #consumidor #promocao' },

  // blog: como-saber-se-um-site-e-confiavel
  'site-falso': { blog: 'como-saber-se-um-site-e-confiavel', telas: (n = 6) => [
    capa({ foto: 'fundos/dica-site-falso.webp', tag: 'ANTES DE PAGAR', titulo: 'Esse site é de verdade ou é <em>golpe</em>?', sub: '4 checagens que levam 2 minutos.' }),
    tela('1. O ENDEREÇO', 2, n, 'Confira o endereço letra por letra', 'Site falso costuma copiar o nome da loja com uma letra trocada.',
      `<div style="position:absolute;left:72px;right:72px;top:660px;display:flex;flex-direction:column;gap:28px">
${[['minhaloja-exemplo.com.br', '#1f9d55', '&#10003; certo'], ['minhaloja-exemp1o.com.br', '#c81e28', '&#10005; "1" no lugar do "l"']].map(([u, c, t]) => `<div style="background:#fff;border-radius:32px;padding:28px 40px;border:5px solid ${c}"><p style="font-family:M;font-weight:800;font-size:46px;white-space:nowrap">${u}</p><p style="font-family:M;font-weight:800;font-size:30px;color:${c};margin-top:6px">${t}</p></div>`).join('')}</div>
<p class="ex" style="top:1070px">EXEMPLO ILUSTRATIVO</p>`),
    tela('2. QUEM É O DONO', 3, n, 'Consulte o CNPJ e o domínio', 'O CNPJ, de graça, na Receita Federal: o nome tem que bater com o da loja. Quem registrou o endereço, no Registro.br.',
      `<div class="cartao" style="top:720px;display:flex;flex-direction:column;gap:20px">${['Receita Federal: CNPJ ativo?', 'O nome bate com o da loja?', 'Registro.br: quem é o dono do domínio?'].map(t => `<p style="font-family:M;font-weight:700;font-size:38px"><span style="color:#1f9d55">&#10003;</span> ${t}</p>`).join('')}</div>`),
    tela('3. A REPUTAÇÃO', 4, n, 'Veja o que outros clientes passaram', 'Pesquise a loja no consumidor.gov.br e veja se ela está na lista "Evite esses sites" do Procon-SP.',
      `<div class="cartao" style="top:760px"><p style="font-family:M;font-weight:800;font-size:40px">Não está na lista não quer dizer que é confiável.</p><p class="lead" style="font-size:34px;margin-top:14px">Site novo de golpe pode ainda não ter entrado nela.</p></div>`),
    tela('4. O CADEADO', 5, n, 'O cadeado não prova que a loja é honesta', 'Ele só mostra que a conexão é protegida. Site falso também pode ter. E site que só aceita Pix ou boleto pede cuidado dobrado.',
      `<div style="position:absolute;left:390px;top:760px;width:300px;height:300px;border-radius:50%;background:#fff;box-shadow:0 24px 60px rgba(3,36,81,.12);display:flex;align-items:center;justify-content:center"><svg width="150" height="170" viewBox="0 0 150 170"><path d="M35 75V50a40 40 0 0 1 80 0v25" fill="none" stroke="#032451" stroke-width="16"/><rect x="15" y="75" width="120" height="90" rx="18" fill="#032451"/><text x="75" y="140" text-anchor="middle" font-family="M" font-weight="900" font-size="54" fill="#ffd23f">?</text></svg></div>`),
    fecho({ titulo: 'Salve e confira antes de pagar', texto: 'Caiu em golpe pagando com Pix? Avise o seu banco o quanto antes e peça o MED. E receba ofertas de lojas conferidas no nosso grupo grátis.' }),
  ], legenda: 'Antes de pagar em uma loja que você não conhece, faça 4 checagens:\n\n1. Confira o endereço letra por letra. Site falso costuma copiar o nome da loja com uma letra trocada.\n2. Consulte o CNPJ na Receita Federal (grátis) e quem registrou o domínio no Registro.br.\n3. Veja a reputação no consumidor.gov.br e a lista "Evite esses sites" do Procon-SP.\n4. O cadeado não prova que a loja é honesta. Site que só aceita Pix ou boleto pede cuidado dobrado.\n\nSalve e mande para quem compra pela internet. O passo a passo está no blog (link na bio).\n\n#golpe #comprasonline #dicasdecompra #consumidor #blackfriday' },

  // blog: pix-ou-cartao-compra-online
  'pix-cartao': { blog: 'pix-ou-cartao-compra-online', telas: (n = 6) => [
    capa({ foto: 'fundos/dica-pix-cartao.webp', tag: 'COMPRA ONLINE', titulo: 'Pix ou cartão: qual te <em>protege</em> mais?', sub: 'O que acontece se der errado.' }),
    tela('PIX', 2, n, 'Pix não tem estorno como o cartão', 'Depois de enviado, o dinheiro só volta se o recebedor devolver ou, em caso de golpe, pelo MED do Banco Central.',
      `<div class="cartao" style="top:780px;display:flex;align-items:center;gap:36px"><svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="56" fill="#fde8e8"/><path d="M38 38l44 44M82 38L38 82" stroke="#c81e28" stroke-width="12" stroke-linecap="round"/></svg><p style="font-family:M;font-weight:800;font-size:40px;line-height:1.2">Mandou, foi. Não dá para "desfazer" sozinho.</p></div>`),
    tela('O MED', 3, n, 'O MED é para golpe, não para arrependimento', 'Peça no app do seu banco, de preferência no mesmo dia. Vale para Pix de até 80 dias e depende de ainda ter dinheiro na conta de destino.',
      `<div style="position:absolute;left:72px;right:72px;top:820px;display:flex;gap:28px">${[['Loja falsa, link falso', '#1f9d55', '&#10003; é caso de MED'], ['Atraso, produto diferente', '#c81e28', '&#10005; não é MED: loja ou Procon']].map(([a, c, b]) => `<div style="flex:1;background:#fff;border-radius:28px;padding:34px;border:5px solid ${c}"><p style="font-family:M;font-weight:800;font-size:34px">${a}</p><p style="font-family:M;font-weight:800;font-size:28px;color:${c};margin-top:14px">${b}</p></div>`).join('')}</div>`),
    tela('CARTÃO', 4, n, 'No cartão, dá para contestar', 'Compra que você não reconhece é contestada com o banco do cartão. Os prazos variam por banco e bandeira.',
      `<div class="cartao" style="top:800px"><p style="font-family:M;font-weight:800;font-size:40px">Cartão virtual ajuda</p><p class="lead" style="font-size:34px;margin-top:12px">Dá para apagar ou trocar, e o número do cartão físico fica protegido.</p></div>`),
    tela('E O DESCONTO NO PIX?', 5, n, 'Vale quando é maior que o rendimento do dinheiro', 'Se o dinheiro rende 1% ao mês, 10x sem juros equivalem a uns 5,3% de desconto.',
      `<div style="position:absolute;left:72px;right:72px;top:780px;display:flex;gap:28px">${[['Desconto no Pix', 'maior que 5,3%', '#1f9d55', 'pague no Pix'], ['Desconto no Pix', 'menor que 5,3%', '#032451', 'parcele sem juros']].map(([a, b, c, d]) => `<div style="flex:1;background:#fff;border-radius:28px;padding:34px;border:5px solid ${c}"><p style="font-size:30px;color:#5a6a88;font-weight:600">${a}</p><p style="font-family:M;font-weight:900;font-size:46px;margin-top:8px">${b}</p><p style="font-family:M;font-weight:800;font-size:30px;color:${c};margin-top:14px">&rarr; ${d}</p></div>`).join('')}</div>
<p class="ex" style="top:1110px">EXEMPLO HIPOTÉTICO, COM RENDIMENTO DE 1% AO MÊS</p>`),
    fecho({ titulo: 'Salve para a próxima compra', texto: 'E receba ofertas com o preço conferido na loja, todo dia, no nosso grupo grátis do WhatsApp.' }),
  ], legenda: 'Pix ou cartão na compra online? Depende do que você quer proteger.\n\nPix não tem estorno como o cartão: depois de enviado, só volta se o recebedor devolver ou, em golpe, pelo MED do Banco Central (Pix de até 80 dias). O MED é para golpe, não para arrependimento ou atraso.\n\nNo cartão, a compra não reconhecida é contestada com o banco; os prazos variam por banco e bandeira.\n\nDesconto no Pix compensa quando é maior que o rendimento que o dinheiro teria durante o parcelamento.\n\nSalve e mande para quem vive em dúvida. Mais detalhes no blog (link na bio).\n\n#pix #cartaodecredito #comprasonline #dicasdecompra #educacaofinanceira' },
};

/** As telas (HTML) de um carrossel. */
export function telasDoCarrossel(nome) {
  const c = CARROSSEIS[nome];
  if (!c) throw new Error(`carrossel que não existe: ${nome}`);
  const t = c.telas();
  if (t.length < 2 || t.length > 10) throw new Error(`carrossel com ${t.length} telas (2 a 10): ${nome}`);
  if (!fs.existsSync(path.resolve(aqui, '../../site/src/data/blog.ts')) || !fs.readFileSync(path.resolve(aqui, '../../site/src/data/blog.ts'), 'utf8').includes(c.blog))
    throw new Error(`carrossel sem post do blog de origem: ${nome}`);
  return t;
}
