// Carrossel de achados do Instagram (15/11): GET /achados?d=DADOS&a=ASSINATURA&i=N  ->  JPG 1080x1350.
// DADOS = base64url de { t: "abaixo de R$ 50" (o fim do título), o: [{ n: nome, de, por, f: foto em cena
// (https), l: loja, v: "15/11" }] } com 3 a 5 ofertas. i=0 é a capa (mosaico das fotos e o título), i=1..n
// uma oferta por tela (foto grande, % OFF, de/por, dia e loja) e i=n+1 o fecho ("Qual você levaria?
// Comenta o número", grupo grátis, link na bio). O mesmo desenho da amostra aprovada em 15/11, feito
// aqui com sharp (SVG + fotos), sem navegador. Só abre com a assinatura do n8n (HMAC, como o /card).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import './card.mjs';   // configura as fontes (fontconfig) antes do sharp desenhar texto

const { default: sharp } = await import('sharp');
const W = 1080, H = 1350, FOTO = 1000;
const LOGO = new URL('./marca-td.png', import.meta.url).pathname;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const reais = (v) => (Number.isInteger(v) ? v.toLocaleString('pt-BR') : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const largura = (t, px, f = 0.6) => String(t).length * px * f;

export const assinarAchados = (segredo, d) => crypto.createHmac('sha256', String(segredo)).update('achados:' + d).digest('hex').slice(0, 24);

/** Lê e confere: 3 a 5 ofertas com nome, foto https e "de" maior que "por". */
export function lerAchados(d) {
  let x;
  try { x = JSON.parse(Buffer.from(String(d), 'base64url').toString('utf8')); } catch (e) { return null; }
  const o = (Array.isArray(x && x.o) ? x.o : []).map(i => ({ n: String(i.n || '').slice(0, 60), de: Number(i.de), por: Number(i.por),
    f: /^https:\/\//.test(i.f || '') ? i.f : '', l: String(i.l || '').slice(0, 20), v: String(i.v || '').slice(0, 10) }))
    .filter(i => i.n && i.f && i.de > i.por && i.por > 0);
  if (o.length < 3 || o.length > 5) return null;
  return { o, t: String((x && x.t) || '').slice(0, 30) };
}

/** O nome em até 2 linhas de ~26 letras, por palavra. */
export function linhasDoNome(nome, max = 26) {
  const out = [''];
  for (const p of String(nome).replace(/\s+/g, ' ').trim().split(' ')) {
    const l = out[out.length - 1];
    if (!l) out[out.length - 1] = p.slice(0, max);
    else if ((l + ' ' + p).length <= max) out[out.length - 1] = l + ' ' + p;
    else if (out.length < 2) out.push(p.slice(0, max));
    else break;
  }
  return out.filter(Boolean);
}

function svgCapa(x) {
  const t = x.t ? `${x.o.length} achados ${x.t}` : `${x.o.length} achados da semana`;
  const linhas = linhasDoNome(t, 17);
  const destaque = (s) => esc(s).replace(/(R\$ ?[\d.,]+|\d+% OFF)/, '<tspan fill="#ff8a3d">$1</tspan>');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#07142e"/>
  <g font-family="Inter" fill="#fff">
    <rect x="72" y="790" width="430" height="58" rx="10" fill="#ffd23f"/>
    <text x="96" y="830" font-size="28" font-weight="900" letter-spacing="2" fill="#07142e">ACHADOS DA SEMANA</text>
    ${linhas.map((l, i) => `<text x="72" y="${955 + i * 110}" font-size="108" font-weight="900" letter-spacing="-4">${destaque(l)}</text>`).join('\n    ')}
    <text x="${W - 72}" y="${H - 70}" text-anchor="end" font-size="32" font-weight="800" fill="#ffd23f">ARRASTE &#8594;</text>
  </g>
</svg>`;
}

function svgOferta(o, k, total) {
  const off = Math.round((1 - o.por / o.de) * 100);
  const nome = linhasDoNome(o.n);
  const yN = FOTO + 78, yP = yN + 62 * (nome.length - 1) + 118;
  const lRs = largura('R$', 46, 0.62) + 8, lPor = largura(reais(o.por), 92, 0.6);
  const deTxt = `R$ ${reais(o.de)}`, xDe = 64 + lRs + lPor + 30 + largura('de ', 34, 0.55);
  const pe = `No grupo${o.v ? ' em ' + o.v : ''}${o.l ? (/^mercado/i.test(o.l) ? ', no ' : ', na ') + o.l : ''}. Preço muda rápido.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect y="${FOTO}" width="${W}" height="${H - FOTO}" fill="#fff"/>
  <g font-family="Inter">
    <rect x="48" y="48" width="160" height="60" rx="30" fill="#07142e" fill-opacity="0.82"/>
    <text x="128" y="89" text-anchor="middle" font-size="30" font-weight="800" fill="#fff">${k} de ${total}</text>
    <g transform="rotate(-3 ${W - 150} ${FOTO - 90})"><rect x="${W - 260}" y="${FOTO - 140}" width="212" height="88" rx="18" fill="#c81e28"/>
    <text x="${W - 154}" y="${FOTO - 80}" text-anchor="middle" font-size="46" font-weight="900" fill="#fff">-${off}%</text></g>
    ${nome.map((l, i) => `<text x="64" y="${yN + 62 * i}" font-size="56" font-weight="900" letter-spacing="-1.5" fill="#032451">${esc(l)}</text>`).join('\n    ')}
    <text x="64" y="${yP}" font-size="46" font-weight="900" fill="#c81e28">R$</text>
    <text x="${64 + lRs}" y="${yP}" font-size="92" font-weight="900" letter-spacing="-3" fill="#c81e28">${reais(o.por)}</text>
    <text x="${64 + lRs + lPor + 30}" y="${yP}" font-size="34" font-weight="500" fill="#8a95ab">de ${esc(deTxt)}</text>
    <line x1="${xDe}" y1="${yP - 11}" x2="${xDe + largura(deTxt, 34, 0.55)}" y2="${yP - 11}" stroke="#8a95ab" stroke-width="3"/>
    <text x="64" y="${H - 32}" font-size="22" font-weight="500" fill="#8a95ab">${esc(pe)}</text>
    <text x="${W - 64}" y="${H - 32}" text-anchor="end" font-size="22" font-weight="500" fill="#8a95ab">@temdescontos</text>
  </g>
</svg>`;
}

function svgFecho(total) {
  const caixa = (i) => `<rect x="${72 + i * 170}" y="560" width="150" height="150" rx="32" fill="${i === 1 ? '#ff8a3d' : '#ffffff'}" fill-opacity="${i === 1 ? 1 : 0.1}" stroke="${i === 1 ? '#ff8a3d' : '#ffffff'}" stroke-opacity="${i === 1 ? 1 : 0.25}" stroke-width="3"/>
    <text x="${147 + i * 170}" y="660" text-anchor="middle" font-size="72" font-weight="900" fill="#fff">${i + 1}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="f" x1="0.3" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="#0d2f66"/><stop offset="1" stop-color="#07142e"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#f)"/>
  <g font-family="Inter" fill="#fff">
    <text x="72" y="300" font-size="96" font-weight="900" letter-spacing="-3">Qual você levaria?</text>
    <text x="72" y="410" font-size="96" font-weight="900" letter-spacing="-3">Comenta o número</text>
    ${Array.from({ length: total }, (_, i) => caixa(i)).join('\n    ')}
    <text x="72" y="830" font-size="40" font-weight="500" fill="#c9d6f2">Achados assim saem todo dia no nosso</text>
    <text x="72" y="884" font-size="40" font-weight="500" fill="#c9d6f2">grupo grátis do WhatsApp, com o preço</text>
    <text x="72" y="938" font-size="40" font-weight="500" fill="#c9d6f2">conferido na loja.</text>
    <rect x="72" y="990" width="400" height="100" rx="50" fill="#fff"/>
    <text x="272" y="1055" text-anchor="middle" font-size="44" font-weight="900" fill="#07142e">Link na bio &#8594;</text>
  </g>
</svg>`;
}

/** Uma tela do carrossel. baixarFoto(url) -> Buffer. */
export async function fazerTelaAchados(x, i, baixarFoto) {
  const total = x.o.length;
  if (i === 0) {
    // Mosaico: a 1ª foto alta à esquerda, as outras em grade (como a amostra aprovada).
    const fotos = await Promise.all(x.o.map(o => baixarFoto(o.f)));
    const G = 16, L0 = 48, T0 = 48, AL = 700, larg1 = 420;
    const resto = fotos.slice(1), cols = Math.ceil(resto.length / 2), lc = Math.floor((W - 2 * L0 - larg1 - G * cols) / cols), ac = Math.floor((AL - G) / 2);
    const canto = (w, h) => Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="28" fill="#fff"/></svg>`);
    const peca = async (b, w, h) => sharp(b).rotate().resize(w, h, { fit: 'cover', position: 'attention' }).composite([{ input: canto(w, h), blend: 'dest-in' }]).png().toBuffer();
    const camadas = [{ input: await peca(fotos[0], larg1, AL), left: L0, top: T0 }];
    for (const [k, b] of resto.entries()) {
      const c = Math.floor(k / 2), r = k % 2;
      camadas.push({ input: await peca(b, lc, ac), left: L0 + larg1 + G + c * (lc + G), top: T0 + r * (ac + G) });
    }
    camadas.push({ input: await sharp(LOGO).resize(150).toBuffer(), left: 72, top: H - 150 });
    return sharp(Buffer.from(svgCapa(x))).composite(camadas).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  }
  if (i >= 1 && i <= total) {
    const o = x.o[i - 1];
    const foto = await sharp(await baixarFoto(o.f)).rotate().resize(W, FOTO, { fit: 'cover', position: 'attention' }).toBuffer();
    return sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
      .composite([{ input: foto, left: 0, top: 0 }, { input: Buffer.from(svgOferta(o, i, total)), left: 0, top: 0 }]).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  }
  return sharp(Buffer.from(svgFecho(total))).composite([{ input: await sharp(LOGO).resize(150).toBuffer(), left: 72, top: H - 150 }]).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}

export function criarRotaAchados({ pasta, segredo, baixarFoto }) {
  const cache = path.join(pasta, 'achados');
  fs.mkdirSync(cache, { recursive: true });
  return async (u, res) => {
    const d = u.searchParams.get('d') || '', a = u.searchParams.get('a') || '';
    const certa = assinarAchados(segredo, d);
    const x = a.length === certa.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(certa)) ? lerAchados(d) : null;
    const i = Number(u.searchParams.get('i'));
    if (!x || !Number.isInteger(i) || i < 0 || i > x.o.length + 1) { res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('assinatura'); }
    const arquivo = path.join(cache, crypto.createHash('sha1').update(d).digest('hex') + `-${i}.jpg`);
    try {
      let jpg;
      try { jpg = fs.readFileSync(arquivo); } catch (e) {
        jpg = await fazerTelaAchados(x, i, baixarFoto);
        fs.writeFileSync(arquivo, jpg);
        const limite = Date.now() - 5 * 864e5;
        for (const f of fs.readdirSync(cache)) { try { if (fs.statSync(path.join(cache, f)).mtimeMs < limite) fs.unlinkSync(path.join(cache, f)); } catch (e2) { /* segue */ } }
      }
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': jpg.length, 'Cache-Control': 'public, max-age=86400' });
      res.end(jpg);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('erro');
    }
  };
}
