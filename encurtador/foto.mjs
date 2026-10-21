// Foto do post com o logo (18/10): GET /foto?u=FOTO&a=ASSINATURA[&t=LARGURA_DO_LOGO][&f=FORMATO][&d=DESCONTO]
// Formatos (21/10, teste no rascunho): f ausente = deitado 1200x630 (o de sempre); f=q = quadrado 1080x1080
// branco com o produto recortado e maior; f=m = quadrado com fundo nas cores do TD, cartão branco com o
// produto e, com d (5 a 90), o selo "-d% OFF" (selos/ pré-renderizados: o servidor não tem fonte).
// Enquadra a foto em 1200x630 com fundo branco (o mesmo que o images.weserv.nl fazia, para o
// send-link LARGE do WhatsApp não cortar a foto quadrada) e põe o logo TD no canto de baixo à direita.
// Só abre foto assinada pelo n8n (HMAC com ENCURTADOR_SEGREDO): ninguém usa o domínio de proxy.
// Se a foto não abrir, manda para a foto original, e o post sai sem o logo em vez de sem foto.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const LARGURA = 1200, ALTURA = 630, MARGEM = 22, LADO = 1080;
const LOGO = fs.readFileSync(new URL('./marca-td.png', import.meta.url));

export function assinarFoto(segredo, url) {
  return crypto.createHmac('sha256', String(segredo)).update('foto:' + url).digest('hex').slice(0, 24);
}

export function assinaturaValida(segredo, url, a) {
  const certa = assinarFoto(segredo, url);
  return typeof a === 'string' && a.length === certa.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(certa));
}

export async function fotoComLogo(original, larguraLogo = 120) {
  const fundo = await sharp(original).rotate()
    .resize(LARGURA, ALTURA, { fit: 'contain', background: '#ffffff' })
    .flatten({ background: '#ffffff' }).toBuffer();
  const logo = await sharp(LOGO).resize({ width: larguraLogo }).toBuffer();
  const { height } = await sharp(logo).metadata();
  return sharp(fundo)
    .composite([{ input: logo, left: LARGURA - larguraLogo - MARGEM, top: ALTURA - height - MARGEM }])
    .jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}

// Tira a borda branca da foto da loja: o produto ocupa mais espaço. Foto sem borda volta como veio.
async function recortado(original) {
  const base = await sharp(original).rotate().flatten({ background: '#ffffff' }).toBuffer();
  try {
    const r = await sharp(base).trim({ background: '#ffffff', threshold: 18 }).toBuffer({ resolveWithObject: true });
    return r.info.width > 40 && r.info.height > 40 ? r.data : base;
  } catch (e) { return base; }
}

export async function fotoQuadrada(original, larguraLogo = 130) {
  const produto = await sharp(await recortado(original)).resize(LADO - 140, LADO - 200, { fit: 'inside' }).toBuffer();
  const pm = await sharp(produto).metadata();
  const logo = await sharp(LOGO).resize({ width: larguraLogo }).toBuffer();
  const lm = await sharp(logo).metadata();
  return sharp({ create: { width: LADO, height: LADO, channels: 3, background: '#ffffff' } })
    .composite([{ input: produto, left: Math.round((LADO - pm.width) / 2), top: Math.round((LADO - 60 - pm.height) / 2) },
      { input: logo, left: LADO - larguraLogo - 30, top: LADO - lm.height - 30 }])
    .jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}

const FUNDO_MARCA = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${LADO}" height="${LADO}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#032451"/><stop offset="1" stop-color="#094f82"/></linearGradient></defs>
  <rect width="${LADO}" height="${LADO}" fill="url(#g)"/>
  <circle cx="${LADO - 80}" cy="${LADO - 60}" r="260" fill="#fd9c1a" opacity=".10"/><circle cx="90" cy="110" r="190" fill="#f26027" opacity=".12"/>
  <rect x="60" y="60" width="${LADO - 120}" height="${LADO - 120}" rx="56" fill="#ffffff"/></svg>`);

export async function fotoMarca(original, desconto = 0, larguraLogo = 150) {
  const produto = await sharp(await recortado(original)).resize(LADO - 300, LADO - 360, { fit: 'inside' }).toBuffer();
  const pm = await sharp(produto).metadata();
  const logo = await sharp(LOGO).resize({ width: larguraLogo }).toBuffer();
  const lm = await sharp(logo).metadata();
  const camadas = [{ input: produto, left: Math.round((LADO - pm.width) / 2), top: Math.round((LADO - 40 - pm.height) / 2) },
    { input: logo, left: LADO - 60 - larguraLogo - 34, top: LADO - 60 - lm.height - 30 }];
  const d = Math.round(Number(desconto));
  if (d >= 5 && d <= 90) camadas.push({ input: fs.readFileSync(new URL(`./selos/${d}.png`, import.meta.url)), left: LADO - 60 - 240 + 30, top: 30 });
  return sharp(FUNDO_MARCA).composite(camadas).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}

async function baixar(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TemDescontos/1.0)' } });
  if (!r.ok || !/^image\//i.test(r.headers.get('content-type') || '')) throw new Error('nao_e_foto');
  const b = Buffer.from(await r.arrayBuffer());
  if (b.length > 10e6) throw new Error('foto_grande');
  return b;
}

export function criarRotaFoto({ pasta, segredo, baixarFoto = baixar }) {
  const cache = path.join(pasta, 'fotos');
  fs.mkdirSync(cache, { recursive: true });
  const limpar = () => {
    const velho = Date.now() - 3 * 864e5;
    for (const f of fs.readdirSync(cache)) {
      try { if (fs.statSync(path.join(cache, f)).mtimeMs < velho) fs.unlinkSync(path.join(cache, f)); } catch (e) { /* já foi */ }
    }
  };
  let feitas = 0;
  return async (u, res) => {
    const url = u.searchParams.get('u') || '';
    if (!/^https:\/\//.test(url) || !assinaturaValida(segredo, url, u.searchParams.get('a'))) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('assinatura');
    }
    const t = Math.min(200, Math.max(60, Number(u.searchParams.get('t')) || 120));
    const f = ['q', 'm'].includes(u.searchParams.get('f')) ? u.searchParams.get('f') : '';
    const d = Math.round(Number(u.searchParams.get('d'))) || 0;
    const arquivo = path.join(cache, crypto.createHash('sha1').update(`${t}:${f}:${f === 'm' ? d : 0}:${url}`).digest('hex') + '.jpg');
    try {
      let jpg;
      try { jpg = fs.readFileSync(arquivo); } catch (e) {
        const foto = await baixarFoto(url);
        jpg = f === 'q' ? await fotoQuadrada(foto) : f === 'm' ? await fotoMarca(foto, d) : await fotoComLogo(foto, t);
        fs.writeFileSync(arquivo, jpg);
        if (++feitas % 50 === 0) limpar();
      }
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': jpg.length, 'Cache-Control': 'public, max-age=86400' });
      res.end(jpg);
    } catch (e) {
      res.writeHead(302, { Location: url, 'Cache-Control': 'no-store' }); res.end();
    }
  };
}
