// Gera o card de oferta (1080x1920, status do WhatsApp e stories do Instagram).
// Uso: node marketing/cards/gerar.mjs oferta.json saida.jpg
// oferta.json: { "nome", "detalhe", "de", "por", "foto" (caminho local ou URL), "loja", "visto" ("26/10 às 15h55") }
// Precisa do Playwright com Chromium (no PC: npx playwright install chromium).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const aqui = dirname(fileURLToPath(import.meta.url));
const [, , entrada, saida = 'card.jpg'] = process.argv;
const o = JSON.parse(readFileSync(entrada, 'utf8'));
const num = (v) => Number(String(v).replace(/\./g, '').replace(',', '.'));
const reais = (v) => (Number.isInteger(v) ? v.toLocaleString('pt-BR') : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const de = num(o.de), por = num(o.por);
if (!(de > por && por > 0)) throw new Error('"de" tem que ser maior que "por"');
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const foto = /^https?:/.test(o.foto) ? o.foto : 'file://' + resolve(dirname(entrada), o.foto);
const campos = {
  DESCONTO: Math.round((1 - por / de) * 100), FOTO: foto, NOME: esc(o.nome), DETALHE: esc(o.detalhe || ''),
  DE: reais(de), POR: reais(por), ECONOMIA: reais(Math.round((de - por) * 100) / 100),
  NOTA: esc(`Preço visto ${o.loja ? 'na ' + o.loja + ' ' : ''}em ${o.visto}. Pode mudar a qualquer momento.`),
};
let html = readFileSync(resolve(aqui, 'card-oferta-status.html'), 'utf8');
for (const [k, v] of Object.entries(campos)) html = html.split(`{{${k}}}`).join(String(v));
const tmp = resolve(aqui, '.card-tmp.html');
writeFileSync(tmp, html);
// import() não olha o NODE_PATH; require olha (Playwright instalado global também serve).
const { chromium } = await import('playwright').catch(() => createRequire(import.meta.url)('playwright'));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('file://' + tmp);
await p.waitForTimeout(500);
await p.screenshot({ path: saida, type: 'jpeg', quality: 92 });
await b.close();
console.log('card salvo em', saida, `(${campos.DESCONTO}% OFF)`);
