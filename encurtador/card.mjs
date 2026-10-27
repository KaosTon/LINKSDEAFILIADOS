// Card do status (27/10): GET /card?d=DADOS&a=ASSINATURA
// O mesmo card aprovado no S25 (marketing/cards/card-oferta-status.html), 1080x1920, feito aqui com
// sharp (SVG + foto), sem navegador. DADOS = base64url de { n: nome, de, por, f: foto, l: loja, v: visto }.
// Só abre card assinado pelo n8n (HMAC com ENCURTADOR_SEGREDO), como a /foto.
// A fonte Inter vem junto (fontes/, licença OFL): o Railway não tem fonte nenhuma instalada.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';

const FONTES = new URL('./fontes/', import.meta.url).pathname;
// O fontconfig lê isso na primeira vez que desenha texto: só as fontes daqui, igual no PC e no Railway.
const conf = path.join(os.tmpdir(), 'card-fonts.conf');
try {
  fs.writeFileSync(conf, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${FONTES}</dir><cachedir>${path.join(os.tmpdir(), 'fontconfig-card')}</cachedir></fontconfig>`);
  process.env.FONTCONFIG_FILE = conf;
} catch (e) { /* sem escrita: usa as fontes do sistema */ }
const { default: sharp } = await import('sharp');

const L = 1080, A = 1920;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const reais = (v) => (Number.isInteger(v) ? v.toLocaleString('pt-BR') : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
// Largura aproximada do texto na Inter (para riscar o "de" e medir as pílulas).
const largura = (t, px, f = 0.6) => String(t).length * px * f;

export function assinarCard(segredo, d) {
  return crypto.createHmac('sha256', String(segredo)).update('card:' + d).digest('hex').slice(0, 24);
}
export const dadosDoCard = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

/** O nome em até 2 linhas de ~22 letras, cortando por palavra. */
export function linhasDoNome(nome, max = 22) {
  const palavras = String(nome || '').replace(/\s+/g, ' ').trim().split(' ');
  const linhas = [''];
  for (const p of palavras) {
    const l = linhas[linhas.length - 1];
    if (!l) linhas[linhas.length - 1] = p.slice(0, max);
    else if ((l + ' ' + p).length <= max) linhas[linhas.length - 1] = l + ' ' + p;
    else if (linhas.length < 2) linhas.push(p.slice(0, max));
    else break;
  }
  return linhas.filter(Boolean);
}

export function svgDoCard({ n, de, por, l, v }) {
  const nome = linhasDoNome(n);
  const sobe = nome.length === 1 ? 40 : 0;
  const y0 = 1110 - sobe;
  const yDe = y0 + 80 * (nome.length - 1) + 78;
  const yPor = yDe + 140, yEco = yPor + 50;
  const deTxt = `R$ ${reais(de)}`, eco = `Economia de R$ ${reais(Math.round((de - por) * 100) / 100)}`;
  const xDe = L / 2 - largura('De ' + deTxt, 48, 0.58) / 2 + largura('De ', 48, 0.58);
  const lEco = largura(eco, 36, 0.56) + 64;
  const nota = `Preço visto${l ? (/^mercado/i.test(l) ? ' no ' : ' na ') + l : ''}${v ? ' em ' + v : ''}. Pode mudar a qualquer momento.`;
  const porTxt = reais(por);
  const lPor = largura(porTxt, 130, 0.62), lRs = largura('R$', 64, 0.62) + 10;
  const xPor = L / 2 - (lPor + lRs) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}" viewBox="0 0 ${L} ${A}">
  <defs>
    <linearGradient id="fundo" x1="0.4" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#0d2f66"/><stop offset="0.55" stop-color="#0a1f45"/><stop offset="1" stop-color="#07142e"/>
    </linearGradient>
    <radialGradient id="laranja" cx="0.85" cy="0.08" r="0.6"><stop offset="0" stop-color="#f7941d" stop-opacity="0.45"/><stop offset="1" stop-color="#f7941d" stop-opacity="0"/></radialGradient>
    <radialGradient id="vermelho" cx="0.1" cy="0.95" r="0.6"><stop offset="0" stop-color="#e53b2c" stop-opacity="0.4"/><stop offset="1" stop-color="#e53b2c" stop-opacity="0"/></radialGradient>
    <linearGradient id="pill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f7941d"/><stop offset="1" stop-color="#e53b2c"/></linearGradient>
  </defs>
  <rect width="${L}" height="${A}" fill="url(#fundo)"/>
  <rect width="${L}" height="${A}" fill="url(#laranja)"/>
  <rect width="${L}" height="${A}" fill="url(#vermelho)"/>
  <g font-family="Inter" text-anchor="middle" fill="#fff">
    <rect x="${L / 2 - 200}" y="110" width="400" height="76" rx="38" fill="url(#pill)"/>
    <text x="${L / 2}" y="160" font-size="34" font-weight="900" letter-spacing="4">OFERTA DO DIA</text>
    <text x="${L / 2}" y="290" font-size="66" font-weight="800">Esse grupo de ofertas tá</text>
    <text x="${L / 2}" y="363" font-size="66" font-weight="800" fill="#ffb347">valendo a pena</text>
    <rect x="152" y="402" width="776" height="606" rx="54" fill="#ffffff" fill-opacity="0.08"/>
    <rect x="160" y="410" width="760" height="590" rx="48" fill="#ffffff"/>
    ${nome.map((t, i) => `<text x="${L / 2}" y="${y0 + 80 * i}" font-size="72" font-weight="900" letter-spacing="-1">${esc(t)}</text>`).join('\n    ')}
    <text x="${L / 2}" y="${yDe}" font-size="48" font-weight="600" fill="#b9c7e6">De ${esc(deTxt)}</text>
    <line x1="${xDe + 2}" y1="${yDe - 16}" x2="${xDe + largura(deTxt, 48, 0.58) + 4}" y2="${yDe - 16}" stroke="#ff5a3c" stroke-width="5"/>
    <text x="${xPor}" y="${yPor - 52}" text-anchor="start" font-size="64" font-weight="800">R$</text>
    <text x="${xPor + lRs}" y="${yPor}" text-anchor="start" font-size="130" font-weight="900" letter-spacing="-4" fill="#ffb347">${porTxt}</text>
    <rect x="${L / 2 - lEco / 2}" y="${yEco}" width="${lEco}" height="64" rx="32" fill="#ffffff" fill-opacity="0.12"/>
    <text x="${L / 2}" y="${yEco + 44}" font-size="36" font-weight="700">${esc(eco)}</text>
    <rect x="90" y="1594" width="900" height="116" rx="58" fill="#ffffff"/>
    <text x="${L / 2}" y="1670" font-size="50" font-weight="900" fill="#0a1f45">Entra no grupo, é grátis</text>
    <text x="${L / 2}" y="1770" font-size="38" font-weight="700" fill="#ffd08a">temdescontos.com.br/grupo</text>
    <text x="${L / 2}" y="1820" font-size="24" font-weight="500" fill="#8fa2cc">${esc(nota)}</text>
  </g>
</svg>`;
}

/** O selo de % OFF vai por cima da foto (camada à parte). */
export function svgDoSelo({ de, por }) {
  const off = Math.round((1 - por / de) * 100);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}" viewBox="0 0 ${L} ${A}">
  <defs><radialGradient id="selo" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="#ff5a3c"/><stop offset="0.7" stop-color="#d8261b"/></radialGradient></defs>
  <g font-family="Inter" text-anchor="middle" fill="#fff">
    <g transform="rotate(10 875 475)">
      <circle cx="875" cy="475" r="115" fill="url(#selo)" stroke="#fff" stroke-width="10"/>
      <text x="875" y="490" font-size="${off >= 100 ? 74 : 92}" font-weight="900" letter-spacing="-3">${off}%</text>
      <text x="875" y="535" font-size="34" font-weight="800" letter-spacing="4">OFF</text>
    </g>
  </g>
</svg>`;
}

export async function fazerCard(o, foto) {
  const camadas = [];
  if (foto) {
    try {
      const f = await sharp(foto).rotate().resize(700, 550, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#ffffff' }).png().toBuffer();
      camadas.push({ input: f, left: 190, top: 430 });
    } catch (e) { /* foto ruim: card sem foto */ }
  }
  camadas.push({ input: Buffer.from(svgDoSelo(o)), left: 0, top: 0 });
  return sharp(Buffer.from(svgDoCard(o))).composite(camadas).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
}

/** Lê e confere os dados: nome, "de" maior que "por". */
export function lerDados(d) {
  let o;
  try { o = JSON.parse(Buffer.from(String(d), 'base64url').toString('utf8')); } catch (e) { return null; }
  const de = Number(o && o.de), por = Number(o && o.por);
  if (!o || !o.n || !(de > por && por > 0)) return null;
  return { n: String(o.n).slice(0, 80), de, por, f: /^https:\/\//.test(o.f || '') ? o.f : '', l: String(o.l || '').slice(0, 20), v: String(o.v || '').slice(0, 20) };
}

export function criarRotaCard({ pasta, segredo, baixarFoto }) {
  const cache = path.join(pasta, 'cards');
  fs.mkdirSync(cache, { recursive: true });
  return async (u, res) => {
    const d = u.searchParams.get('d') || '', a = u.searchParams.get('a') || '';
    const certa = assinarCard(segredo, d);
    const o = a.length === certa.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(certa)) ? lerDados(d) : null;
    if (!o) { res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('assinatura'); }
    const arquivo = path.join(cache, crypto.createHash('sha1').update(d).digest('hex') + '.jpg');
    try {
      let jpg;
      try { jpg = fs.readFileSync(arquivo); } catch (e) {
        let foto = null;
        if (o.f) { try { foto = await baixarFoto(o.f); } catch (e2) { foto = null; } }
        jpg = await fazerCard(o, foto);
        fs.writeFileSync(arquivo, jpg);
      }
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': jpg.length, 'Cache-Control': 'public, max-age=86400' });
      res.end(jpg);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('erro');
    }
  };
}
