// Foto do post com o logo (18/10): GET /foto?u=FOTO&a=ASSINATURA[&t=LARGURA_DO_LOGO]
// Enquadra a foto em 1200x630 com fundo branco (o mesmo que o images.weserv.nl fazia, para o
// send-link LARGE do WhatsApp não cortar a foto quadrada) e põe o logo TD no canto de baixo à direita.
// Só abre foto assinada pelo n8n (HMAC com ENCURTADOR_SEGREDO): ninguém usa o domínio de proxy.
// Se a foto não abrir, manda para a foto original, e o post sai sem o logo em vez de sem foto.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const LARGURA = 1200, ALTURA = 630, MARGEM = 22;
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

export async function baixar(url) {
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
    const arquivo = path.join(cache, crypto.createHash('sha1').update(`${t}:${url}`).digest('hex') + '.jpg');
    try {
      let jpg;
      try { jpg = fs.readFileSync(arquivo); } catch (e) {
        jpg = await fotoComLogo(await baixarFoto(url), t);
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
