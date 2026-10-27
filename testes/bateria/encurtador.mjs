// Bateria do encurtador: sobe o servidor numa porta livre com uma pasta temporária.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { criarServidor, lojaPermitida, novoCodigo, ehRobo } from '../../encurtador/servidor.mjs';
import { assinarFoto } from '../../encurtador/foto.mjs';
import { assinarCard, dadosDoCard, linhasDoNome } from '../../encurtador/card.mjs';
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
caso('/card com "de" menor que "por": 403', (await fetch(`${raiz}/card?d=${ruim}&a=${assinarCard(SENHA, ruim)}`)).status === 403);
const semFoto = dadosDoCard({ n: 'Sem Foto', de: 100, por: 50, f: 'https://http2.mlstatic.com/quebrada.jpg' });
caso('/card com foto que nao abre: sai sem foto', (await fetch(`${raiz}/card?d=${semFoto}&a=${assinarCard(SENHA, semFoto)}`)).status === 200);
caso('nome em ate 2 linhas, por palavra', JSON.stringify(linhasDoNome('Chave De Impacto Kinetx 68vf Brushless 880nm 2 Baterias')) === JSON.stringify(['Chave De Impacto', 'Kinetx 68vf Brushless']));
await new Promise((ok) => s.close(ok));
fs.rmSync(pasta, { recursive: true, force: true });

console.log(falhas ? `\n${falhas} FALHA(S)` : '\n  todos passaram');
process.exit(falhas ? 1 : 0);
