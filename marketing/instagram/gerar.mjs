// Posts de conteúdo do Instagram (dicas e datas): gera as imagens 1080x1350 e a agenda que o fluxo 06 lê.
//
//   node marketing/instagram/gerar.mjs          (precisa do Playwright com Chromium)
//
// Entrada: posts.json (id, data AAAA-MM-DD, selo, titulo, texto, fundo, legenda; "cheio" = foto em tela cheia).
// Reel: item com "video" (o MP4 já renderizado em site/public/instagram) e "fonte" (o código em marketing/reels,
// feito em Remotion: npm run som && npm run render). O gerador só confere que o MP4 existe.
// Saída:   site/public/instagram/{id}.jpg e site/public/instagram/agenda.json (id, data, imagem, legenda).
// Regras: nada de oferta nem preço aqui; fato só o que já está num post revisado do blog; sem "#publi"
// (não é divulgação de produto). Fundo de dica = capa do post do blog; fundo de data = imagem própria em fundos/.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const saida = path.resolve(aqui, '../../site/public/instagram');
const { chromium } = createRequire(import.meta.url)('playwright');
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const url = (p) => pathToFileURL(path.resolve(aqui, p)).href;

const pagina = (p) => `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="${url('../anuncios/base.css')}">
<style>
body { background: #07142e; color: #fff; position: relative; }
.foto { position: absolute; left: 0; top: 0; width: 1080px; height: ${p.cheio ? 1350 : 640}px; object-fit: cover; }
.veu { position: absolute; inset: 0; background: ${p.cheio ? 'linear-gradient(180deg, rgba(7,20,46,0) 38%, rgba(7,20,46,.92) 62%, #07142e 80%)' : 'none'}; }
.caixa { position: absolute; left: 0; right: 0; top: ${p.cheio ? 730 : 640}px; bottom: 0; padding: ${p.cheio ? 40 : 64}px 72px 56px; display: flex; flex-direction: column;
  background: ${p.cheio ? 'none' : 'radial-gradient(700px 500px at 100% 0%, rgba(247,148,29,.28), transparent 60%), linear-gradient(170deg, #0d2f66, #0a1f45 55%, #07142e)'}; }
.selo { align-self: flex-start; background: linear-gradient(90deg, #f7941d, #e53b2c); font-weight: 900; font-size: 30px; letter-spacing: 3px; padding: 14px 30px; border-radius: 999px; }
h1 { font-size: ${p.titulo.length > 46 ? 62 : 72}px; font-weight: 900; line-height: 1.06; letter-spacing: -1.5px; margin-top: 30px; }
p { font-size: 38px; font-weight: 500; line-height: 1.3; color: #c9d6f2; margin-top: 24px; }
.pe { margin-top: auto; display: flex; align-items: center; justify-content: space-between; }
.pe img { height: 84px; } .pe span { font-size: 30px; font-weight: 700; color: #ffd08a; }
</style>
<img class="foto" src="${url(p.fundo)}"><div class="veu"></div>
<div class="caixa"><span class="selo">${esc(p.selo)}</span><h1>${esc(p.titulo)}</h1><p>${esc(p.texto)}</p>
<div class="pe"><img src="${url('../../site/assets/logo/tem-descontos-claro.png')}"><span>@temdescontos</span></div></div>`;

// Limpeza (13/11, pedido do Wellington): o Instagram baixa a mídia na hora de publicar, então o que já
// passou não precisa ficar no site (Cloudflare). Post com data de mais de GUARDAR_DIAS atrás sai do
// posts.json e da agenda, e o arquivo dele some de site/public/instagram. Os fontes (fundos, Reels em
// marketing/reels) ficam no repositório, para dar para refazer.
const GUARDAR_DIAS = 3;
const hojeSP = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const limite = new Date(Date.parse(`${hojeSP}T12:00:00Z`) - GUARDAR_DIAS * 864e5).toISOString().slice(0, 10);
const todos = JSON.parse(fs.readFileSync(path.join(aqui, 'posts.json'), 'utf8'));
const posts = todos.filter(p => p.data >= limite);
if (posts.length < todos.length) {
  fs.writeFileSync(path.join(aqui, 'posts.json'), JSON.stringify(posts, null, 2) + '\n');
  console.log('saiu da agenda (já passou):', todos.filter(p => p.data < limite).map(p => p.id).join(', '));
}
const ids = new Set();
for (const p of posts) {
  if (!/^[a-z0-9-]+$/.test(p.id) || ids.has(p.id)) throw new Error(`id ruim ou repetido: ${p.id}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.data)) throw new Error(`data ruim: ${p.id}`);
  if (JSON.stringify(p).includes(String.fromCharCode(0x2014)) || /#publi/.test(p.legenda) || /R\$/.test(JSON.stringify(p))) throw new Error(`regra quebrada (travessão, #publi ou preço): ${p.id}`);
  ids.add(p.id);
}
fs.mkdirSync(saida, { recursive: true });
const b = await chromium.launch();
for (const p of posts) {
  if (p.video) {
    if (!/^[a-z0-9-]+\.mp4$/.test(p.video) || !fs.existsSync(path.join(saida, p.video))) throw new Error(`reel sem MP4 em site/public/instagram: ${p.id}`);
    console.log('reel', p.id);
    continue;
  }
  const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  // Arquivo temporário ao lado do script: página aberta por file:// consegue ler as imagens e a fonte locais.
  const tmp = path.join(aqui, `.tmp-${p.id}.html`);
  fs.writeFileSync(tmp, pagina(p));
  await pg.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(saida, `${p.id}.jpg`), type: 'jpeg', quality: 84 });
  await pg.close();
  fs.unlinkSync(tmp);
  console.log('post', p.id);
}
await b.close();
fs.writeFileSync(path.join(saida, 'agenda.json'), JSON.stringify(posts.map(p => (p.video ? { id: p.id, data: p.data, video: `/instagram/${p.video}`, legenda: p.legenda } : { id: p.id, data: p.data, imagem: `/instagram/${p.id}.jpg`, legenda: p.legenda })), null, 1) + '\n');

// Arquivo em site/public/instagram que não está mais na agenda: apaga (já foi publicado ou saiu da agenda).
const usados = new Set(['agenda.json', ...posts.map(p => p.video || `${p.id}.jpg`)]);
for (const f of fs.readdirSync(saida)) {
  if (!usados.has(f) && /\.(jpg|mp4)$/.test(f)) { fs.unlinkSync(path.join(saida, f)); console.log('apagado do site:', f); }
}
