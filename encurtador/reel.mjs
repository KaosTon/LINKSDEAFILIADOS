// Reel das ofertas (15/11): GET /reel?d=DADOS&a=ASSINATURA  ->  MP4 1080x1920, 16 s, com até 3 ofertas.
// DADOS = base64url de { o: [{ n: nome, de, por, f: foto em cena (https), l: loja }], v: "15/11" }.
// Fora das bordas que o Reels cobre (topo ~150 px, legenda embaixo a partir de ~1600 px).
// Abertura (2,3 s), uma oferta por vez (4,3 s, a foto em cena com zoom lento, nome, de, por e % OFF por
// cima) e o fecho (2 s: grupo grátis, link na bio). Trilha feita por código (musica-reel.mjs).
// Só abre com a assinatura do n8n (HMAC com ENCURTADOR_SEGREDO, como o /card). Fica guardado em
// /data/reels e sai do cache em 3 dias. Precisa de ffmpeg (FFMPEG, ffmpeg-static ou o do sistema).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import './card.mjs';   // configura as fontes (fontconfig) antes do sharp desenhar texto

const { default: sharp } = await import('sharp');
const W = 1080, H = 1920, FPS = 30, T_ABRE = 2.3, T_OFERTA = 4.3, T_FECHO = 2.0, XF = 0.3;
const MUSICA = new URL('./musica-reel.m4a', import.meta.url).pathname;
const LOGO = new URL('./marca-td.png', import.meta.url).pathname;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const reais = (v) => (Number.isInteger(v) ? v.toLocaleString('pt-BR') : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const largura = (t, px, f = 0.6) => String(t).length * px * f;

export function ffmpegDisponivel() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { const p = createRequire(import.meta.url)('ffmpeg-static'); if (p && fs.existsSync(p)) return p; } catch (e) { /* sem o pacote */ }
  return 'ffmpeg';
}
export const assinarReel = (segredo, d) => crypto.createHmac('sha256', String(segredo)).update('reel:' + d).digest('hex').slice(0, 24);

/** Lê e confere: 2 ou 3 ofertas com nome, foto https e "de" maior que "por". */
export function lerReel(d) {
  let x;
  try { x = JSON.parse(Buffer.from(String(d), 'base64url').toString('utf8')); } catch (e) { return null; }
  const o = (Array.isArray(x && x.o) ? x.o : []).map(i => ({ n: String(i.n || '').slice(0, 80), de: Number(i.de), por: Number(i.por),
    f: /^https:\/\//.test(i.f || '') ? i.f : '', l: String(i.l || '').slice(0, 20) })).filter(i => i.n && i.f && i.de > i.por && i.por > 0);
  if (o.length < 2 || o.length > 3) return null;
  return { o, v: String((x && x.v) || '').slice(0, 10) };
}

function linhas(nome, max = 24) {
  const out = [''];
  for (const p of String(nome).replace(/\s+/g, ' ').trim().split(' ')) {
    const l = out[out.length - 1];
    if (!l) out[out.length - 1] = p.slice(0, max);
    else if ((l + ' ' + p).length <= max) out[out.length - 1] = l + ' ' + p;
    else if (out.length < 2) out.push(p.slice(0, max));
    else { out[1] = out[1].replace(/\s*\S*$/, '') + '...'; break; }
  }
  return out.filter(Boolean);
}

/** Por cima da foto: a pílula "1 de 3" e o painel de baixo (fora das bordas que o Reels cobre). */
export function svgDaOferta({ n, de, por, l }, i, total, v) {
  const nome = linhas(n), off = Math.round((1 - por / de) * 100);
  const yN = 1200, yDe = yN + 76 * (nome.length - 1) + 84, yPor = yDe + 140;
  const deTxt = `R$ ${reais(de)}`, xDe = 72 + largura('De ', 46, 0.58);
  const lRs = largura('R$', 62, 0.62) + 10;
  const nota = `Preço visto${l ? (/^mercado/i.test(l) ? ' no ' : ' na ') + l : ''}${v ? ' em ' + v : ''}. Pode mudar a qualquer momento.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07142e" stop-opacity="0"/><stop offset="0.35" stop-color="#07142e" stop-opacity="0.82"/><stop offset="1" stop-color="#07142e" stop-opacity="0.96"/></linearGradient>
    <linearGradient id="pill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f7941d"/><stop offset="1" stop-color="#e53b2c"/></linearGradient>
    <radialGradient id="selo" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="#ff5a3c"/><stop offset="0.7" stop-color="#d8261b"/></radialGradient>
  </defs>
  <rect y="1080" width="${W}" height="${H - 1080}" fill="url(#v)"/>
  <g font-family="Inter" fill="#fff">
    <rect x="96" y="186" width="300" height="70" rx="35" fill="url(#pill)"/>
    <text x="246" y="233" text-anchor="middle" font-size="32" font-weight="900" letter-spacing="3">OFERTA ${i} DE ${total}</text>
    ${nome.map((t, k) => `<text x="72" y="${yN + 76 * k}" font-size="68" font-weight="900" letter-spacing="-1">${esc(t)}</text>`).join('\n    ')}
    <text x="72" y="${yDe}" font-size="46" font-weight="600" fill="#b9c7e6">De ${esc(deTxt)}</text>
    <line x1="${xDe}" y1="${yDe - 16}" x2="${xDe + largura(deTxt, 46, 0.58) + 4}" y2="${yDe - 16}" stroke="#ff5a3c" stroke-width="5"/>
    <text x="72" y="${yPor - 56}" font-size="66" font-weight="800">R$</text>
    <text x="${72 + lRs}" y="${yPor}" font-size="150" font-weight="900" letter-spacing="-5" fill="#ffb347">${reais(por)}</text>
    <text x="72" y="${yPor + 70}" font-size="26" font-weight="500" fill="#8fa2cc">${esc(nota)}</text>
    <g transform="rotate(10 880 ${yN - 170})">
      <circle cx="880" cy="${yN - 170}" r="110" fill="url(#selo)" stroke="#fff" stroke-width="10"/>
      <text x="880" y="${yN - 155}" text-anchor="middle" font-size="${off >= 100 ? 70 : 88}" font-weight="900" letter-spacing="-3">${off}%</text>
      <text x="880" y="${yN - 112}" text-anchor="middle" font-size="32" font-weight="800" letter-spacing="4">OFF</text>
    </g>
  </g>
</svg>`;
}

function svgAbertura(v, total) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="pill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f7941d"/><stop offset="1" stop-color="#e53b2c"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="#07142e" fill-opacity="0.62"/>
  <g font-family="Inter" fill="#fff" text-anchor="middle">
    <rect x="${W / 2 - 230}" y="640" width="460" height="80" rx="40" fill="url(#pill)"/>
    <text x="${W / 2}" y="694" font-size="38" font-weight="900" letter-spacing="4">OFERTAS DE HOJE</text>
    <text x="${W / 2}" y="860" font-size="104" font-weight="900" letter-spacing="-2">${total} achados</text>
    <text x="${W / 2}" y="975" font-size="104" font-weight="900" letter-spacing="-2" fill="#ffb347">que valeram</text>
    <text x="${W / 2}" y="1090" font-size="104" font-weight="900" letter-spacing="-2" fill="#ffb347">a pena</text>
    <text x="${W / 2}" y="1190" font-size="40" font-weight="600" fill="#c9d6f2">Postados no grupo${v ? ' em ' + esc(v) : ''}</text>
  </g>
</svg>`;
}

function svgFecho() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="f" x1="0.4" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="#0d2f66"/><stop offset="1" stop-color="#07142e"/></linearGradient>
  <radialGradient id="l" cx="0.85" cy="0.15" r="0.7"><stop offset="0" stop-color="#f7941d" stop-opacity="0.4"/><stop offset="1" stop-color="#f7941d" stop-opacity="0"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#f)"/><rect width="${W}" height="${H}" fill="url(#l)"/>
  <g font-family="Inter" fill="#fff" text-anchor="middle">
    <text x="${W / 2}" y="1000" font-size="84" font-weight="900" letter-spacing="-1">Ofertas assim</text>
    <text x="${W / 2}" y="1095" font-size="84" font-weight="900" letter-spacing="-1">todo dia, de graça</text>
    <text x="${W / 2}" y="1190" font-size="40" font-weight="600" fill="#c9d6f2">No grupo do WhatsApp.</text>
    <text x="${W / 2}" y="1240" font-size="40" font-weight="600" fill="#c9d6f2">Só os administradores postam.</text>
    <rect x="${W / 2 - 260}" y="1300" width="520" height="96" rx="48" fill="#fff"/>
    <text x="${W / 2}" y="1363" font-size="44" font-weight="900" fill="#0a1f45">Link na bio</text>
  </g>
</svg>`;
}

const roda = (bin, args) => new Promise((ok, falha) => execFile(bin, args, { timeout: 170000, maxBuffer: 1e7 }, (e, so, se) => (e ? falha(new Error(String(se || e.message).slice(-400))) : ok())));

/** Monta o MP4. baixarFoto(url) -> Buffer. Devolve o Buffer do vídeo. */
export async function fazerReel({ o, v }, baixarFoto, ffmpeg = ffmpegDisponivel()) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-'));
  try {
    const fotos = [];
    for (const [i, x] of o.entries()) {
      const bin = await baixarFoto(x.f);
      const arq = path.join(tmp, `f${i}.jpg`);
      // A foto em cena é quadrada: vai inteira no alto (1080x1080), com ela mesma desfocada atrás. Zoom leve
      // no quadro todo (cortar para 9:16 cortava o produto, teste de 15/11).
      const fundo = await sharp(bin).rotate().resize(W, H, { fit: 'cover' }).blur(30).modulate({ brightness: 0.55 }).toBuffer();
      const frente = await sharp(bin).rotate().resize(960, 960, { fit: 'cover', position: 'attention' })
        .composite([{ input: Buffer.from('<svg width="960" height="960"><rect width="960" height="960" rx="40" fill="#fff"/></svg>'), blend: 'dest-in' }]).png().toBuffer();
      // (o sharp faz o resize antes do composite: por isso dois passos)
      const quadro = await sharp(fundo).composite([{ input: frente, top: 150, left: 60 }]).png().toBuffer();
      await sharp(quadro).resize(1620, 2880).jpeg({ quality: 90 }).toFile(arq);
      await sharp(Buffer.from(svgDaOferta(x, i + 1, o.length, v))).png().toFile(path.join(tmp, `o${i}.png`));
      fotos.push(arq);
    }
    const fundo = await sharp(fotos[0]).resize(W, H).blur(18).modulate({ brightness: 0.9 }).toBuffer();
    await sharp(fundo).composite([{ input: Buffer.from(svgAbertura(v, o.length)) }, { input: await sharp(LOGO).resize(260).toBuffer(), top: 330, left: W / 2 - 130 }]).jpeg({ quality: 90 }).toFile(path.join(tmp, 'abre.jpg'));
    await sharp(Buffer.from(svgFecho())).composite([{ input: await sharp(LOGO).resize(340).toBuffer(), top: 560, left: W / 2 - 170 }]).jpeg({ quality: 90 }).toFile(path.join(tmp, 'fecho.jpg'));
    const nF = Math.round(T_OFERTA * FPS);
    const args = ['-y', '-loglevel', 'error', '-loop', '1', '-framerate', String(FPS), '-t', String(T_ABRE), '-i', path.join(tmp, 'abre.jpg')];
    o.forEach((_, i) => args.push('-i', fotos[i], '-loop', '1', '-framerate', String(FPS), '-t', String(T_OFERTA), '-i', path.join(tmp, `o${i}.png`)));
    args.push('-loop', '1', '-framerate', String(FPS), '-t', String(T_FECHO), '-i', path.join(tmp, 'fecho.jpg'), '-i', MUSICA);
    const fecho = 1 + o.length * 2, musica = fecho + 1;
    const f = [`[0:v]scale=${W}:${H},setsar=1,fps=${FPS},format=yuv420p[s0]`];
    o.forEach((_, i) => {
      const fi = 1 + i * 2, oi = fi + 1, dir = i % 2 ? `'ih/2-(ih/zoom/2)'` : `'ih/2-(ih/zoom/2)-${20}'`;
      f.push(`[${fi}:v]zoompan=z='min(zoom+0.0005,1.06)':x='iw/2-(iw/zoom/2)':y=${dir}:d=${nF}:s=${W}x${H}:fps=${FPS},setsar=1[z${i}]`);
      f.push(`[z${i}][${oi}:v]overlay=0:0:shortest=1,format=yuv420p,trim=duration=${T_OFERTA}[s${i + 1}]`);
    });
    f.push(`[${fecho}:v]scale=${W}:${H},setsar=1,fps=${FPS},format=yuv420p[s${o.length + 1}]`);
    let ant = 's0', t = T_ABRE;
    for (let i = 1; i <= o.length + 1; i++) {
      const off = (t - XF).toFixed(2), out = i === o.length + 1 ? 'vid' : `x${i}`;
      f.push(`[${ant}][s${i}]xfade=transition=${i === o.length + 1 ? 'fade' : 'slideleft'}:duration=${XF}:offset=${off}[${out}]`);
      ant = out; t = t - XF + (i === o.length + 1 ? T_FECHO : T_OFERTA);
    }
    f.push(`[${musica}:a]atrim=0:${t.toFixed(2)},afade=t=out:st=${(t - 0.8).toFixed(2)}:d=0.8[aud]`);
    const saida = path.join(tmp, 'reel.mp4');
    args.push('-filter_complex', f.join(';'), '-map', '[vid]', '-map', '[aud]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p',
      '-r', String(FPS), '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-t', t.toFixed(2), saida);
    await roda(ffmpeg, args);
    return fs.readFileSync(saida);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

export function criarRotaReel({ pasta, segredo, baixarFoto }) {
  const cache = path.join(pasta, 'reels');
  fs.mkdirSync(cache, { recursive: true });
  const fazendo = new Map();   // o mesmo reel pedido duas vezes ao mesmo tempo é feito uma vez só
  return async (u, req, res) => {
    const d = u.searchParams.get('d') || '', a = u.searchParams.get('a') || '';
    const certa = assinarReel(segredo, d);
    const x = a.length === certa.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(certa)) ? lerReel(d) : null;
    if (!x) { res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('assinatura'); }
    const arquivo = path.join(cache, crypto.createHash('sha1').update(d).digest('hex') + '.mp4');
    try {
      let mp4;
      try { mp4 = fs.readFileSync(arquivo); } catch (e) {
        if (!fazendo.has(arquivo)) fazendo.set(arquivo, fazerReel(x, baixarFoto).then((b) => { fs.writeFileSync(arquivo, b); return b; }).finally(() => fazendo.delete(arquivo)));
        mp4 = await fazendo.get(arquivo);
        const limite = Date.now() - 3 * 864e5;
        for (const f of fs.readdirSync(cache)) { try { if (fs.statSync(path.join(cache, f)).mtimeMs < limite) fs.unlinkSync(path.join(cache, f)); } catch (e2) { /* segue */ } }
      }
      // Faixa de bytes (o Instagram e os navegadores pedem o vídeo em partes).
      const faixa = String(req.headers.range || '').match(/^bytes=(\d*)-(\d*)$/);
      if (faixa) {
        const ini = faixa[1] ? Number(faixa[1]) : 0, fim = faixa[2] ? Math.min(Number(faixa[2]), mp4.length - 1) : mp4.length - 1;
        res.writeHead(206, { 'Content-Type': 'video/mp4', 'Content-Range': `bytes ${ini}-${fim}/${mp4.length}`, 'Content-Length': fim - ini + 1, 'Accept-Ranges': 'bytes' });
        return res.end(mp4.subarray(ini, fim + 1));
      }
      res.writeHead(200, { 'Content-Type': 'video/mp4', 'Content-Length': mp4.length, 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=86400' });
      res.end(mp4);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('erro');
    }
  };
}
