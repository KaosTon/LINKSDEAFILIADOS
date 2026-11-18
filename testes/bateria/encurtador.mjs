// Bateria do encurtador: sobe o servidor numa porta livre com uma pasta temporária.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { criarServidor, lojaPermitida, novoCodigo, ehRobo, ehRedeDaMeta, ipDoPedido, pedidoDeRobo, lerMovimento, VERSAO } from '../../encurtador/servidor.mjs';
import { assinarFoto } from '../../encurtador/foto.mjs';
import { assinarCard, dadosDoCard, linhasDoNome } from '../../encurtador/card.mjs';
import { assinarReel, lerReel, ffmpegDisponivel } from '../../encurtador/reel.mjs';
import { assinarAchados, lerAchados } from '../../encurtador/achados.mjs';
import { createRequire } from 'node:module';
const sharp = createRequire(new URL('../../encurtador/package.json', import.meta.url))('sharp');   // fica em encurtador/node_modules

let falhas = 0;
const caso = (nome, ok, extra) => { console.log(`  ${ok ? 'PASS' : 'FALHA'}  ${nome}`); if (!ok) { falhas++; if (extra) console.log(extra); } };

const SENHA = 'x'.repeat(40);
const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'encurtador-'));
const sobe = (opcoes = {}) => new Promise((ok) => {
  const s = criarServidor({ pasta, segredo: SENHA, base: 'https://promox.example', ...opcoes });
  s.listen(0, () => ok({ s, raiz: `http://127.0.0.1:${s.address().port}` }));
});
const encurta = (raiz, url, senha = SENHA) => fetch(`${raiz}/api/encurtar`, { method: 'POST',
  headers: { Authorization: `Bearer ${senha}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });

console.log('\n=== Encurtador ===');
caso('so loja da lista', lojaPermitida('https://www.mercadolivre.com.br/p/MLB123') && lojaPermitida('https://s.shopee.com.br/abc')
  && !lojaPermitida('https://golpe.example/x') && !lojaPermitida('http://www.amazon.com.br/dp/X') && !lojaPermitida('https://amazon.com.br.golpe.example/'));
caso('codigo de 5 letras sem caractere que confunde', /^[a-km-np-z2-9]{5}$/.test(novoCodigo(() => false)));

let { s, raiz } = await sobe();
const ML = 'https://www.mercadolivre.com.br/p/MLB47889235?matt_word=minhaetiqueta&matt_tool=12345678';
const r1 = await (await encurta(raiz, ML)).json();
caso('encurta e devolve o link com o dominio', /^https:\/\/promox\.example\/[a-z2-9]{5}$/.test(r1.curto), r1);
const r2 = await (await encurta(raiz, ML)).json();
caso('mesmo link, mesmo codigo', r2.codigo === r1.codigo);
caso('senha errada: 401', (await encurta(raiz, ML, 'y'.repeat(40))).status === 401);
caso('loja fora da lista: recusa', (await encurta(raiz, 'https://golpe.example/x')).status === 400);

const ida = await fetch(`${raiz}/${r1.codigo}`, { redirect: 'manual' });
caso('abre: 302 para o link de afiliado intacto', ida.status === 302 && ida.headers.get('location') === ML, ida.headers.get('location'));
caso('codigo que nao existe: 404', (await fetch(`${raiz}/zzzzz`, { redirect: 'manual' })).status === 404);
const cl = await (await fetch(`${raiz}/api/cliques`, { headers: { Authorization: `Bearer ${SENHA}` } })).json();
caso('conta o clique', cl.top[0].codigo === r1.codigo && cl.top[0].cliques === 1, cl);
// 21/10: robo (Google, previa do WhatsApp) e redirecionado mas nao conta
const GENTE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
caso('reconhece robos e gente', ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'WhatsApp/2.24.1 A', 'facebookexternalhit/1.1',
  'Mozilla/5.0 (compatible; bingbot/2.0)', 'curl/8.0', ''].every(ehRobo) && !ehRobo(GENTE) && !ehRobo('Mozilla/5.0 (Linux; Android 14) Chrome/128.0 Mobile Safari/537.36'));
const rb = await fetch(`${raiz}/${r1.codigo}`, { redirect: 'manual', headers: { 'User-Agent': 'WhatsApp/2.24.1 A' } });
const cl2 = await (await fetch(`${raiz}/api/cliques`, { headers: { Authorization: `Bearer ${SENHA}` } })).json();
caso('previa do WhatsApp: redireciona mas nao conta clique', rb.status === 302 && cl2.top[0].cliques === 1 && cl2.robos.links === 1, cl2);
caso('cliques pede senha', (await fetch(`${raiz}/api/cliques`)).status === 401);

await new Promise((ok) => s.close(ok));
({ s, raiz } = await sobe({ convite: 'https://chat.whatsapp.com/CONVITE' }));
const volta = await fetch(`${raiz}/${r1.codigo}`, { redirect: 'manual' });
caso('reiniciou: o link continua valendo (salvo no volume)', volta.status === 302 && volta.headers.get('location') === ML);
const home = await fetch(`${raiz}/`, { redirect: 'manual' });
caso('pagina inicial leva para o convite do grupo', home.status === 302 && home.headers.get('location') === 'https://chat.whatsapp.com/CONVITE');
const g = await fetch(`${raiz}/grupo?de=guia:cupom-amazon`, { redirect: 'manual' });
caso('/grupo leva ao convite', g.status === 302 && g.headers.get('location') === 'https://chat.whatsapp.com/CONVITE');
await fetch(`${raiz}/grupo?de=<script>`, { redirect: 'manual' });
const cg = await (await fetch(`${raiz}/api/cliques`, { headers: { Authorization: `Bearer ${SENHA}` } })).json();
caso('/grupo conta a origem e ignora origem estranha', cg.grupo['guia:cupom-amazon'] === 1 && cg.grupo.direto === 1 && !cg.grupo['<script>'], cg.grupo);
const gb = await fetch(`${raiz}/grupo?de=post:black-friday`, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } });
await fetch(`${raiz}/grupo?de=post:pix`, { redirect: 'manual', headers: { 'User-Agent': GENTE } });
const cg2 = await (await fetch(`${raiz}/api/cliques`, { headers: { Authorization: `Bearer ${SENHA}` } })).json();
caso('/grupo: Googlebot vai ao convite mas nao conta', gb.status === 302 && !cg2.grupo['post:black-friday'] && cg2.robos.grupo === 1, cg2);
const ult1 = cg2.grupoRecentes[cg2.grupoRecentes.length - 1];
caso('/grupo: guarda a hora e a origem do clique de gente (sem IP)', ult1.de === 'post:pix' && Math.abs(Date.parse(ult1.quando) - Date.now()) < 60000 && Object.keys(ult1).length === 2, cg2.grupoRecentes);
// 17/11: a revisao de anuncio da Meta abriu a pagina do v3 com User-Agent de celular comum e tocou em "Entrar no grupo".
// Contou como toque do anuncio e virou Lead. Quem vem da rede da propria Meta e robo, mesmo com cara de gente.
const DA_META = ['57.141.0.65', '31.13.24.1', '31.13.31.255', '157.240.0.1', '157.240.255.255', '173.252.127.255', '57.147.255.255',
  '2a03:2880:f0ff:1::1', '2A03:2880::', '2620:0:1c00::1', '2620:0:1cff:ffff::1', '::ffff:57.141.0.65', ' 57.141.0.65 '];
const DE_FORA = ['177.10.20.30', '189.5.6.7', '200.147.3.1', '57.141.1.1', '31.13.23.255', '31.13.32.0', '157.240.128.0', '57.148.0.0',
  '2a03:2881::1', '2804:14c::1', '2620:0:1d00::1', '', 'abc', '999.1.1.1', '1.2.3', '1.2.3.4.5', '2a03:2880', '2a03::2880::1', null, undefined, 0, {}];
caso('rede da Meta: reconhece IPv4 e IPv6, inclusive o caso de 17/11', DA_META.every(ehRedeDaMeta), DA_META.filter(x => !ehRedeDaMeta(x)));
caso('rede da Meta: operadora brasileira, vizinho de bloco e endereco torto ficam de fora', !DE_FORA.some(ehRedeDaMeta), DE_FORA.filter(ehRedeDaMeta));
caso('endereco de quem pediu: o primeiro do X-Forwarded-For', ipDoPedido({ 'x-forwarded-for': '57.141.0.65, 10.0.0.1' }) === '57.141.0.65' && ipDoPedido({}) === '' && ipDoPedido(null) === '');
caso('robo pela rede, mesmo com User-Agent de gente; gente de operadora nao e robo', pedidoDeRobo({ 'user-agent': GENTE, 'x-forwarded-for': '57.141.0.65' })
  && !pedidoDeRobo({ 'user-agent': GENTE, 'x-forwarded-for': '177.10.20.30' }) && !pedidoDeRobo({ 'user-agent': GENTE }) && pedidoDeRobo({ 'x-forwarded-for': '177.10.20.30' }));
const antesMeta = await (await fetch(`${raiz}/api/cliques`, { headers: { Authorization: `Bearer ${SENHA}` } })).json();
const gm = await fetch(`${raiz}/grupo?de=anuncio:v3`, { redirect: 'manual', headers: { 'User-Agent': GENTE, 'X-Forwarded-For': '57.141.0.65' } });
const lm = await fetch(`${raiz}/${r1.codigo}`, { redirect: 'manual', headers: { 'User-Agent': GENTE, 'X-Forwarded-For': '2a03:2880:f0ff:1::1' } });
const gg = await fetch(`${raiz}/grupo?de=anuncio:v3`, { redirect: 'manual', headers: { 'User-Agent': GENTE, 'X-Forwarded-For': '177.10.20.30' } });
const depoisMeta = await (await fetch(`${raiz}/api/cliques`, { headers: { Authorization: `Bearer ${SENHA}` } })).json();
caso('/grupo: revisao da Meta vai ao convite mas nao conta toque', gm.status === 302 && gm.headers.get('location') === 'https://chat.whatsapp.com/CONVITE'
  && depoisMeta.robos.grupo === antesMeta.robos.grupo + 1, depoisMeta.robos);
caso('/grupo: gente pelo mesmo anuncio conta um toque so', gg.status === 302 && depoisMeta.grupo['anuncio:v3'] === 1
  && depoisMeta.grupoRecentes.filter(x => x.de === 'anuncio:v3').length === 1, depoisMeta.grupo);
caso('link curto: rede da Meta e redirecionada mas nao conta clique', lm.status === 302 && lm.headers.get('location') === ML
  && depoisMeta.robos.links === antesMeta.robos.links + 1 && depoisMeta.top[0].cliques === antesMeta.top[0].cliques, depoisMeta.robos);
// 18/11: entradas e saidas da comunidade avisadas pelo WhatsApp. So resumo (12 letras de hash), hora e tipo.
const mandaMov = (corpo, senha = SENHA) => fetch(`${raiz}/api/movimento`, { method: 'POST',
  headers: { Authorization: `Bearer ${senha}`, 'Content-Type': 'application/json' }, body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo) });
const ID1 = 'a1b2c3d4e5f6', ID2 = '0f1e2d3c4b5a';
const haPouco = new Date(Date.now() - 4 * 60e3).toISOString();
caso('movimento: sem a senha, 401', (await mandaMov({ tipo: 'saiu', ids: [ID1] }, 'y'.repeat(40))).status === 401);
const mv1 = await mandaMov({ tipo: 'entrou', ids: [ID1], quando: haPouco });
caso('movimento: guarda a entrada', mv1.status === 200 && (await mv1.json()).guardados === 1);
caso('movimento: o mesmo aviso de novo nao duplica', (await (await mandaMov({ tipo: 'entrou', ids: [ID1], quando: haPouco })).json()).guardados === 0);
await mandaMov({ tipo: 'saiu', ids: [ID1, ID2] });
for (const ruim of [{ tipo: 'sumiu', ids: [ID1] }, { tipo: 'saiu' }, { tipo: 'saiu', ids: [] }, { tipo: 'saiu', ids: ['5511977776666'] }, { tipo: 'saiu', ids: ['776666'] },
  { tipo: 'saiu', ids: [ID1.toUpperCase()] }, { tipo: 'saiu', ids: Array(21).fill(0).map((_, i) => ('00000000000' + i.toString(16)).slice(-12)) }, { tipo: 'saiu', ids: [123456789012] }, '{', '[]', 'null', '']) {
  const rr = await mandaMov(ruim);
  caso(`movimento torto recusado: ${JSON.stringify(ruim).slice(0, 60)}`, rr.status === 400, rr.status);
}
const cm = await (await fetch(`${raiz}/api/cliques`, { headers: { Authorization: `Bearer ${SENHA}` } })).json();
caso('movimentos voltam no /api/cliques, so com quando, tipo e id', cm.movimentos.length === 3 && cm.movimentos[0].quando === haPouco && cm.movimentos[0].tipo === 'entrou' && cm.movimentos[0].id === ID1
  && cm.movimentos.every(x => Object.keys(x).sort().join() === 'id,quando,tipo'), cm.movimentos);
caso('telefone nunca e aceito como id', !JSON.stringify(cm.movimentos).includes('5511'));
caso('a versao do que esta no ar sai no /api/cliques', cm.versao === VERSAO && /^\d{4}-\d{2}-\d{2}-/.test(VERSAO), cm.versao);
caso('movimento: hora de mais de um dia atras, no futuro ou torta vira a hora de agora', [new Date(Date.now() - 3 * 864e5).toISOString(), new Date(Date.now() + 3600e3).toISOString(), 'ontem', undefined, 12345]
  .every(q => { const l = lerMovimento({ tipo: 'saiu', ids: [ID1], quando: q }, Date.now()); return l && Math.abs(Date.parse(l[0].quando) - Date.now()) < 5000; }));
caso('movimento: id repetido no mesmo aviso entra uma vez', lerMovimento({ tipo: 'saiu', ids: [ID1, ID1] }).length === 1);
await new Promise((ok) => s.close(ok));
({ s, raiz } = await sobe({ convite: 'https://chat.whatsapp.com/CONVITE' }));
const cm2 = await (await fetch(`${raiz}/api/cliques`, { headers: { Authorization: `Bearer ${SENHA}` } })).json();
caso('reiniciou: os movimentos continuam (salvos no volume)', cm2.movimentos.length === 3, cm2.movimentos);
// Movimento velho (mais de 30 dias) sai quando chega um novo.
{
  const arq = fs.readdirSync(pasta).map(f => path.join(pasta, f)).find(f => { try { return fs.statSync(f).isFile() && JSON.parse(fs.readFileSync(f, 'utf8')).movimentos; } catch { return false; } });
  await new Promise((ok) => s.close(ok));
  const d = JSON.parse(fs.readFileSync(arq, 'utf8'));
  d.movimentos.unshift({ quando: new Date(Date.now() - 40 * 864e5).toISOString(), tipo: 'saiu', id: 'ffffffffffff' });
  fs.writeFileSync(arq, JSON.stringify(d));
  ({ s, raiz } = await sobe({ convite: 'https://chat.whatsapp.com/CONVITE' }));
  await mandaMov({ tipo: 'entrou', ids: [ID2] });
  const cm3 = await (await fetch(`${raiz}/api/cliques`, { headers: { Authorization: `Bearer ${SENHA}` } })).json();
  caso('movimento de mais de 30 dias sai da memoria', cm3.movimentos.length === 4 && !cm3.movimentos.some(x => x.id === 'ffffffffffff'), cm3.movimentos);
}
await new Promise((ok) => s.close(ok));

// com o site no www: o dominio sem www so guarda os links curtos
({ s, raiz } = await sobe({ convite: 'https://chat.whatsapp.com/CONVITE', site: 'https://www.temdescontos.example/' }));
const ini = await fetch(`${raiz}/?utm_source=bio`, { redirect: 'manual' });
caso('com SITE_URL, a pagina inicial vai para o site (com o ?utm)', ini.status === 301 && ini.headers.get('location') === 'https://www.temdescontos.example/?utm_source=bio', ini.headers.get('location'));
const pag = await fetch(`${raiz}/guias/cupom?x=1`, { redirect: 'manual' });
caso('caminho do site vai para o www', pag.status === 301 && pag.headers.get('location') === 'https://www.temdescontos.example/guias/cupom?x=1');
const fim = await fetch(`${raiz}/zzzzz`, { redirect: 'manual' });
caso('codigo que nao existe mais: pagina de oferta encerrada', fim.status === 302 && fim.headers.get('location') === 'https://www.temdescontos.example/oferta-encerrada');
const ok2 = await fetch(`${raiz}/${r1.codigo}`, { redirect: 'manual' });
caso('com SITE_URL, o link curto continua indo para a loja', ok2.status === 302 && ok2.headers.get('location') === ML);
caso('com SITE_URL, /saude continua respondendo', (await fetch(`${raiz}/saude`)).status === 200);
await new Promise((ok) => s.close(ok));

// varios grupos: vale o ultimo convite (o grupo mais novo, com vaga); ?n= abre um especifico
({ s, raiz } = await sobe({ convite: 'https://chat.whatsapp.com/G1, https://chat.whatsapp.com/G2,https://chat.whatsapp.com/G3' }));
const ult = await fetch(`${raiz}/grupo?de=home`, { redirect: 'manual' });
caso('varios convites: /grupo abre o ultimo (grupo com vaga)', ult.headers.get('location') === 'https://chat.whatsapp.com/G3', ult.headers.get('location'));
const seg = await fetch(`${raiz}/grupo?n=2`, { redirect: 'manual' });
caso('/grupo?n=2 abre o segundo', seg.headers.get('location') === 'https://chat.whatsapp.com/G2');
const fora = await fetch(`${raiz}/grupo?n=9`, { redirect: 'manual' });
caso('n que nao existe: cai no ultimo', fora.headers.get('location') === 'https://chat.whatsapp.com/G3');
await new Promise((ok) => s.close(ok));

// Foto com logo (18/10): só com assinatura; 1200x630 com o logo no canto; foto que não abre volta para a original.
const quadrada = await sharp({ create: { width: 800, height: 800, channels: 3, background: '#3366cc' } }).jpeg().toBuffer();
let baixadas = 0;
({ s, raiz } = await sobe({ baixarFoto: async (u) => { baixadas++; if (/quebrada/.test(u)) throw new Error('x'); return quadrada; } }));
const FOTO = 'https://http2.mlstatic.com/D_NQ_NP_teste.jpg';
const semAss = await fetch(`${raiz}/foto?u=${encodeURIComponent(FOTO)}`, { redirect: 'manual' });
caso('/foto sem assinatura: 403 (ninguem usa o dominio de proxy)', semAss.status === 403);
const assErrada = await fetch(`${raiz}/foto?u=${encodeURIComponent(FOTO)}&a=${assinarFoto('outra-senha', FOTO)}`, { redirect: 'manual' });
caso('/foto com assinatura de outra senha: 403', assErrada.status === 403);
const ok1 = await fetch(`${raiz}/foto?u=${encodeURIComponent(FOTO)}&a=${assinarFoto(SENHA, FOTO)}`);
const jpg = Buffer.from(await ok1.arrayBuffer());
const meta = await sharp(jpg).metadata();
caso('/foto assinada: jpeg 1200x630', ok1.status === 200 && ok1.headers.get('content-type') === 'image/jpeg' && meta.width === 1200 && meta.height === 630, meta);
const px = async (x, y) => [...(await sharp(jpg).extract({ left: x, top: y, width: 1, height: 1 }).raw().toBuffer())];
const lado = await px(40, 40), meio = await px(600, 315);
const caixa = await sharp(jpg).extract({ left: 1200 - 22 - 120, top: 630 - 22 - 80, width: 120, height: 80 }).raw().toBuffer();
let cor = 0; for (let i = 0; i < caixa.length; i += 3) if (Math.min(caixa[i], caixa[i + 1], caixa[i + 2]) < 200) cor++;
const canto = cor / (caixa.length / 3);
caso('fundo branco nas laterais e a foto no meio', lado.every(v => v > 245) && meio[2] > 150 && meio[0] < 90, { lado, meio });
caso('logo no canto de baixo a direita (canto branco ficou colorido)', canto > 0.2, canto);
await fetch(`${raiz}/foto?u=${encodeURIComponent(FOTO)}&a=${assinarFoto(SENHA, FOTO)}`);
caso('segunda vez vem do cache (nao baixa de novo)', baixadas === 1, baixadas);
const QUEBRADA = 'https://http2.mlstatic.com/quebrada.jpg';
const q = await fetch(`${raiz}/foto?u=${encodeURIComponent(QUEBRADA)}&a=${assinarFoto(SENHA, QUEBRADA)}`, { redirect: 'manual' });
caso('foto que nao abre: manda para a original (post sai sem logo, mas com foto)', q.status === 302 && q.headers.get('location') === QUEBRADA);

// Card do status (27/10): 1080x1920, só assinado, de maior que por.
const D = dadosDoCard({ n: 'Fone Teste Bluetooth Com Cancelamento De Ruido Ativo', de: 500, por: 249.9, f: FOTO, l: 'Mercado Livre', v: '27/10 às 12h00' });
const cSem = await fetch(`${raiz}/card?d=${D}`);
caso('/card sem assinatura: 403', cSem.status === 403);
const cOk = await fetch(`${raiz}/card?d=${D}&a=${assinarCard(SENHA, D)}`);
const cJpg = Buffer.from(await cOk.arrayBuffer());
const cMeta = await sharp(cJpg).metadata();
caso('/card assinado: jpeg 1080x1920', cOk.status === 200 && cMeta.width === 1080 && cMeta.height === 1920, cMeta);
const cPx = async (x, y) => [...(await sharp(cJpg).extract({ left: x, top: y, width: 1, height: 1 }).raw().toBuffer())];
const cFoto = await cPx(540, 705), cSelo = await cPx(875, 420);
caso('foto no card branco e selo vermelho por cima', cFoto[2] > 150 && cFoto[0] < 90 && cSelo[0] > 180 && cSelo[1] < 110, { cFoto, cSelo });
const ruim = dadosDoCard({ n: 'X', de: 100, por: 150 });
const cFeed = await fetch(`${raiz}/card?d=${D}&a=${assinarCard(SENHA, D)}&f=feed`);
const cFeedMeta = await sharp(Buffer.from(await cFeed.arrayBuffer())).metadata();
caso('/card com f=feed: jpeg 1080x1350', cFeed.status === 200 && cFeedMeta.width === 1080 && cFeedMeta.height === 1350, cFeedMeta);
caso('/card com "de" menor que "por": 403', (await fetch(`${raiz}/card?d=${ruim}&a=${assinarCard(SENHA, ruim)}`)).status === 403);
const semFoto = dadosDoCard({ n: 'Sem Foto', de: 100, por: 50, f: 'https://http2.mlstatic.com/quebrada.jpg' });
caso('/card com foto que nao abre: sai sem foto', (await fetch(`${raiz}/card?d=${semFoto}&a=${assinarCard(SENHA, semFoto)}`)).status === 200);
// Foto em cena (15/11): guarda a imagem e o card do feed com a foto no topo.
const png = await sharp({ create: { width: 1024, height: 1024, channels: 3, background: '#3a6' } }).png().toBuffer();
const sobeImg = (corpo, senha = SENHA) => fetch(`${raiz}/api/imagem`, { method: 'POST', headers: { Authorization: `Bearer ${senha}`, 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
caso('/api/imagem sem senha: 401', (await sobeImg({ dados: 'data:image/png;base64,' + png.toString('base64') }, 'y'.repeat(40))).status === 401);
caso('/api/imagem que nao e imagem: 400', (await sobeImg({ dados: 'data:text/html;base64,PGI+' })).status === 400 && (await sobeImg({ dados: 'data:image/png;base64,QUFB' })).status === 400);
const gi = await (await sobeImg({ dados: 'data:image/png;base64,' + png.toString('base64') })).json();
caso('/api/imagem guarda e devolve o endereco', /^https:\/\/promox\.example\/img\/[a-f0-9]{24}\.jpg$/.test(gi.url || ''), gi);
const gImg = await fetch(`${raiz}/img/${String(gi.url).split('/img/')[1]}`);
caso('/img devolve o jpg', gImg.status === 200 && gImg.headers.get('content-type') === 'image/jpeg');
caso('/img que nao existe ou nome estranho: 404/301', (await fetch(`${raiz}/img/${'a'.repeat(24)}.jpg`)).status === 404 && (await fetch(`${raiz}/img/../links.json`, { redirect: 'manual' })).status !== 200);
const DC = dadosDoCard({ n: 'Smart TV LG NANO 4K 65 polegadas', de: 3805.68, por: 3261, f: 'https://http2.mlstatic.com/tv.jpg', l: 'Mercado Livre', v: '15/11 às 12h', c: 1 });
const cCena = await fetch(`${raiz}/card?d=${DC}&a=${assinarCard(SENHA, DC)}&f=feed`);
const cCenaBuf = Buffer.from(await cCena.arrayBuffer());
const cCenaMeta = await sharp(cCenaBuf).metadata();
caso('/card feed com foto em cena: jpeg 1080x1350', cCena.status === 200 && cCenaMeta.width === 1080 && cCenaMeta.height === 1350, cCenaMeta);
fs.writeFileSync(path.join(os.tmpdir(), 'card-cena-feed.jpg'), cCenaBuf);
const cCenaStory = await fetch(`${raiz}/card?d=${DC}&a=${assinarCard(SENHA, DC)}`);
fs.writeFileSync(path.join(os.tmpdir(), 'card-cena-story.jpg'), Buffer.from(await cCenaStory.arrayBuffer()));
caso('/card story com foto em cena: 200', cCenaStory.status === 200);
// Reel das ofertas (15/11)
const o3 = (x = {}) => ({ n: 'Smart TV LG 65', de: 3805.68, por: 3261, f: 'https://td.example/img/a.jpg', l: 'Mercado Livre', ...x });
const DR = (o) => Buffer.from(JSON.stringify({ o, v: '15/11' })).toString('base64url');
caso('reel: aceita 2 ou 3 ofertas', !!lerReel(DR([o3(), o3()])) && !!lerReel(DR([o3(), o3(), o3()])) && !lerReel(DR([o3()])) && !lerReel(DR([o3(), o3(), o3(), o3()])));
caso('reel: tira oferta sem foto https ou com de menor que por', !lerReel(DR([o3(), o3({ f: 'http://x/a.jpg' })])) && !lerReel(DR([o3(), o3({ de: 10, por: 20 })])) && !lerReel('lixo'));
caso('reel: sem assinatura certa, 403', (await fetch(`${raiz}/reel?d=${DR([o3(), o3()])}&a=${'0'.repeat(24)}`)).status === 403);
caso('reel: assinatura propria (nao vale a do card)', assinarReel(SENHA, 'x') !== assinarCard(SENHA, 'x'));
caso('reel: ffmpeg encontrado', fs.existsSync(ffmpegDisponivel()) || ffmpegDisponivel() === 'ffmpeg');
// Carrossel de achados (15/11)
const oa = (x = {}) => ({ n: 'Oculos de sol', de: 27, por: 18.6, f: 'https://http2.mlstatic.com/a.jpg', l: 'Shopee', v: '15/11', ...x });
const DA = (o) => Buffer.from(JSON.stringify({ t: 'abaixo de R$ 50', o })).toString('base64url');
caso('achados: aceita 3 a 5 ofertas', !!lerAchados(DA([oa(), oa(), oa()])) && !!lerAchados(DA([oa(), oa(), oa(), oa(), oa()])) && !lerAchados(DA([oa(), oa()])) && !lerAchados(DA([oa(), oa(), oa(), oa(), oa(), oa()])));
caso('achados: tira oferta sem foto https ou com de menor que por', !lerAchados(DA([oa(), oa(), oa({ f: 'http://x' })])) && !lerAchados(DA([oa(), oa(), oa({ de: 5 })])));
const d3 = DA([oa(), oa({ n: 'Fone' }), oa({ n: 'Chinelo' })]);
caso('achados: assinatura errada ou tela fora da faixa, 403', (await fetch(`${raiz}/achados?d=${d3}&a=${'0'.repeat(24)}&i=0`)).status === 403 && (await fetch(`${raiz}/achados?d=${d3}&a=${assinarAchados(SENHA, d3)}&i=9`)).status === 403);
for (const i of [0, 1, 4]) {
  const t = await fetch(`${raiz}/achados?d=${d3}&a=${assinarAchados(SENHA, d3)}&i=${i}`);
  const meta = await sharp(Buffer.from(await t.arrayBuffer())).metadata();
  caso(`achados: tela ${i} em jpg 1080x1350`, t.status === 200 && meta.width === 1080 && meta.height === 1350, meta);
}
caso('nome em ate 2 linhas, por palavra', JSON.stringify(linhasDoNome('Chave De Impacto Kinetx 68vf Brushless 880nm 2 Baterias')) === JSON.stringify(['Chave De Impacto', 'Kinetx 68vf Brushless']));
await new Promise((ok) => s.close(ok));
fs.rmSync(pasta, { recursive: true, force: true });

console.log(falhas ? `\n${falhas} FALHA(S)` : '\n  todos passaram');
process.exit(falhas ? 1 : 0);
