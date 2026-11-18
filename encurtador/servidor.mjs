// Encurtador próprio: temdescontos.com.br/a7k2p -> link de afiliado.
// Roda no Railway como serviço separado do n8n, com um volume em /data. Dependências: sharp (foto.mjs, card.mjs)
// e ffmpeg-static (reel.mjs).
//
//   GET  /{codigo}          redireciona (302) e conta o clique
//   GET  /foto?u=&a=        foto do post em 1200x630 com o logo no canto; só com assinatura do n8n (foto.mjs)
//   GET  /card?d=&a=        card do status 1080x1920 (de, por, % OFF), mesma assinatura (card.mjs)
//   POST /api/encurtar      { url } com Authorization: Bearer ENCURTADOR_SEGREDO -> { codigo, curto }
//   GET  /api/cliques       mesma senha; os links mais clicados, cliques no convite por origem e os últimos
//                           cliques no convite com a hora (grupoRecentes), para cruzar com quem entrou no grupo
//
// Robô não conta (21/10): Google, Bing, a prévia de link do WhatsApp e do Facebook abrem o link
// e não são gente. Eles ainda são redirecionados normalmente; só ficam fora da contagem (robos).
//   POST /api/imagem        { dados: "data:image/...;base64,..." } com a senha -> { url } (15/11): guarda a foto
//                           em cena do garimpo (jpg até 1080 px) para o card do Instagram e o envio; apaga com 10 dias
//   GET  /img/{id}.jpg      a foto guardada
//   GET  /reel?d=&a=        Reel das ofertas do dia, MP4 1080x1920 (reel.mjs), mesma assinatura
//   GET  /achados?d=&a=&i=  tela i do carrossel de achados do Instagram, JPG 1080x1350 (achados.mjs)
//   GET  /saude             para o Railway saber que está de pé
//   GET  /grupo?de=home     convite do grupo (CONVITE_GRUPO); conta de qual página do site veio
//                           Com ?ev= (id do clique, 16/11), quem veio de anúncio vira um Lead na Meta: o clique
//                           vai assinado para o fluxo 07 do n8n (conversao.mjs). Nada disso fica guardado aqui.
//                           CONVITE_GRUPO pode ter vários convites separados por vírgula (17/10):
//                           vale o ÚLTIMO, o grupo mais novo, que ainda tem vaga. /grupo?n=2 abre o 2º.
//
// Com SITE_URL (o site no www), o domínio sem www só fica com os links curtos: a página
// inicial e qualquer outro caminho vão para o site, e código que não existe mais vai para
// a página "oferta encerrada" do site.
//
// Só encurta link das lojas da lista: mesmo que a senha vaze, ninguém usa o
// domínio para mandar gente para golpe.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { criarRotaFoto, baixar } from './foto.mjs';
import { criarRotaCard } from './card.mjs';
import { criarRotaReel } from './reel.mjs';
import { criarRotaAchados } from './achados.mjs';
import { camposDoClique, enviarConversao, URL_CONVERSAO } from './conversao.mjs';

const LOJAS = /(^|\.)(amazon\.com\.br|amzn\.to|mercadolivre\.com\.br|meli\.la|shopee\.com\.br|magazinevoce\.com\.br|magazineluiza\.com\.br)$/i;
const ALFABETO = 'abcdefghijkmnpqrstuvwxyz23456789';   // sem l, o, 0, 1 (confundem)

export function lojaPermitida(url) {
  let u; try { u = new URL(url); } catch { return false; }
  return u.protocol === 'https:' && LOJAS.test(u.hostname);
}

// User-Agent de robô de busca, de prévia de link ou de ferramenta. Sem User-Agent também é robô.
const ROBO = /bot\b|bot\/|crawl|spider|slurp|facebookexternalhit|facebot|whatsapp|telegram|twitterbot|linkedin|discord|skypeuripreview|preview|headless|lighthouse|pingdom|uptime|python|curl|wget|go-http|okhttp|java\/|axios|ahrefs|semrush|mj12|petal|bytespider|gpt|claude|perplexity|applebot|yandex|baidu|duckduck/i;
export function ehRobo(ua) { return !ua || ROBO.test(String(ua)); }

// Rede da Meta (AS32934), 17/11. A revisao automatica de anuncio abre a pagina do anuncio com User-Agent de
// celular comum e toca em "Entrar no grupo". Em 17/11 isso entrou como toque do anuncio v3 e virou Lead,
// 44 segundos depois de o conjunto ser ligado e antes de qualquer exibicao. Quem navega de verdade pelo
// Instagram ou pelo Facebook sai pela rede do proprio celular, nunca por esta.
// Lista: RIPEstat, announced-prefixes de AS32934, em 17/11/2026, com os blocos vizinhos juntados.
const REDE_META_V4 = [
  '31.13.24.0/21', '31.13.64.0/18', '45.64.40.0/22', '57.141.0.0/24', '57.141.2.0/23', '57.141.4.0/23',
  '57.141.6.0/24', '57.141.8.0/24', '57.141.10.0/24', '57.141.12.0/23', '57.141.14.0/24', '57.141.16.0/22',
  '57.141.20.0/24', '57.141.22.0/24', '57.141.24.0/24', '57.144.0.0/14', '66.220.144.0/20', '69.63.176.0/20',
  '69.171.224.0/19', '74.119.76.0/22', '102.132.96.0/20', '103.4.96.0/22', '129.134.0.0/17', '157.240.0.0/17',
  '157.240.192.0/18', '163.70.128.0/17', '163.77.132.0/23', '163.77.136.0/23', '163.77.160.0/20', '173.252.64.0/18',
  '179.60.192.0/22', '185.60.216.0/22', '185.89.216.0/22', '204.15.20.0/22',
];
// IPv6: 2a03:2880::/32 e 2620:0:1c00::/40, pelos primeiros digitos do endereco por extenso.
const REDE_META_V6 = ['2a032880', '262000001c'];
function v4num(ip) {
  const p = String(ip).split('.');
  if (p.length !== 4 || p.some(x => !/^\d{1,3}$/.test(x) || Number(x) > 255)) return null;
  return p.reduce((n, x) => n * 256 + Number(x), 0);
}
const FAIXAS_META_V4 = REDE_META_V4.map(c => { const [b, m] = c.split('/'); const ini = v4num(b); return [ini, ini + 2 ** (32 - Number(m)) - 1]; });
/** O IPv6 por extenso, 32 digitos hexadecimais, ou null se nao for um IPv6 bem formado. */
function v6hex(ip) {
  if (!/^[0-9a-f:]+$/.test(ip) || !ip.includes(':')) return null;
  const partes = ip.split('::');
  if (partes.length > 2) return null;
  const antes = partes[0] ? partes[0].split(':') : [];
  const depois = partes.length === 2 && partes[1] ? partes[1].split(':') : [];
  const n = antes.length + depois.length;
  if (partes.length === 1 ? n !== 8 : n > 7) return null;
  const todos = [...antes, ...Array(8 - n).fill('0'), ...depois];
  if (todos.some(h => !/^[0-9a-f]{1,4}$/.test(h))) return null;
  return todos.map(h => h.padStart(4, '0')).join('');
}
/** O endereco de quem pediu, como o Railway entrega (primeiro do X-Forwarded-For). */
export function ipDoPedido(headers) {
  return String((headers && headers['x-forwarded-for']) || '').split(',')[0].trim();
}
export function ehRedeDaMeta(ip) {
  const s = String(ip || '').trim().toLowerCase().replace(/^::ffff:/, '');
  const n = v4num(s);
  if (n !== null) return FAIXAS_META_V4.some(([a, b]) => n >= a && n <= b);
  const h = v6hex(s);
  return !!h && REDE_META_V6.some(p => h.startsWith(p));
}
/** Robo pelo User-Agent ou pela rede: e redirecionado como todo mundo, mas nao conta clique nem vira conversao. */
export function pedidoDeRobo(headers) {
  return ehRobo(headers && headers['user-agent']) || ehRedeDaMeta(ipDoPedido(headers));
}

const RECENTES = 300, RECENTES_DIAS = 14;

/** Guarda a foto como jpg (até 1080 px) com o nome tirado do conteúdo; apaga as de mais de 10 dias. */
export async function guardarImagem(pastaImg, bin, dias = 10) {
  const { default: sharp } = await import('sharp');
  const jpg = await sharp(bin).rotate().resize(1080, 1080, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  const nome = crypto.createHash('sha256').update(jpg).digest('hex').slice(0, 24) + '.jpg';
  fs.writeFileSync(path.join(pastaImg, nome), jpg);
  const limite = Date.now() - dias * 864e5;
  for (const f of fs.readdirSync(pastaImg)) {
    try { if (fs.statSync(path.join(pastaImg, f)).mtimeMs < limite) fs.unlinkSync(path.join(pastaImg, f)); } catch { /* segue */ }
  }
  return nome;
}

export function novoCodigo(existe, tamanho = 5) {
  for (;;) {
    const b = crypto.randomBytes(tamanho);
    const c = [...b].map(x => ALFABETO[x % ALFABETO.length]).join('');
    if (!existe(c)) return c;
  }
}

export function criarServidor({ pasta, segredo, base, convite, site, baixarFoto, conversao }) {
  const raizSite = String(site || '').replace(/\/+$/, '');
  const convites = String(convite || '').split(/[\s,;]+/).filter(c => /^https:\/\//.test(c));
  fs.mkdirSync(pasta, { recursive: true });
  const arquivo = path.join(pasta, 'links.json');
  let dados = { links: {} };
  try { dados = JSON.parse(fs.readFileSync(arquivo, 'utf8')); } catch (e) { /* primeira vez */ }
  dados.grupo = dados.grupo || {};
  dados.grupoRecentes = dados.grupoRecentes || [];
  dados.robos = dados.robos || { grupo: 0, links: 0 };
  const porUrl = new Map(Object.entries(dados.links).map(([c, l]) => [l.url, c]));

  let sujo = false;
  const salvar = () => {
    if (!sujo) return;
    const tmp = arquivo + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(dados));
    fs.renameSync(tmp, arquivo);
    sujo = false;
  };
  const pastaImg = path.join(pasta, 'img');
  fs.mkdirSync(pastaImg, { recursive: true });
  const foto = criarRotaFoto({ pasta, segredo, ...(baixarFoto ? { baixarFoto } : {}) });
  const card = criarRotaCard({ pasta, segredo, baixarFoto: baixarFoto || baixar });
  const reel = criarRotaReel({ pasta, segredo, baixarFoto: baixarFoto || baixar });
  const achados = criarRotaAchados({ pasta, segredo, baixarFoto: baixarFoto || baixar });
  const relogio = setInterval(salvar, 30000);
  relogio.unref();

  const responde = (res, status, corpo, extra = {}) => {
    const json = typeof corpo !== 'string';
    res.writeHead(status, { 'Content-Type': json ? 'application/json' : 'text/plain; charset=utf-8', ...extra });
    res.end(json ? JSON.stringify(corpo) : corpo);
  };
  const autorizado = (req) => {
    const t = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    return !!segredo && t.length === segredo.length && crypto.timingSafeEqual(Buffer.from(t), Buffer.from(segredo));
  };

  const servidor = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    const p = u.pathname;

    if (p === '/saude') return responde(res, 200, 'ok');
    if (p === '/foto') return void foto(u, res);
    if (p === '/card') return void card(u, res);
    if (p === '/reel') return void reel(u, req, res);
    if (p === '/achados') return void achados(u, res);

    if (p === '/api/encurtar' && req.method === 'POST') {
      if (!autorizado(req)) return responde(res, 401, { erro: 'senha' });
      let corpo = '';
      req.on('data', (c) => { corpo += c; if (corpo.length > 1e4) req.destroy(); });
      req.on('end', () => {
        let url;
        try { url = String(JSON.parse(corpo).url || ''); } catch { return responde(res, 400, { erro: 'json' }); }
        if (!lojaPermitida(url)) return responde(res, 400, { erro: 'loja_nao_permitida' });
        let codigo = porUrl.get(url);
        if (!codigo) {
          codigo = novoCodigo((c) => !!dados.links[c]);
          dados.links[codigo] = { url, criado: Date.now(), cliques: 0 };
          porUrl.set(url, codigo);
          sujo = true; salvar();
        }
        responde(res, 200, { codigo, curto: `${base.replace(/\/+$/, '')}/${codigo}` });
      });
      return;
    }

    if (p === '/api/imagem' && req.method === 'POST') {
      if (!autorizado(req)) return responde(res, 401, { erro: 'senha' });
      const partes = []; let tam = 0;
      req.on('data', (c) => { tam += c.length; if (tam > 12e6) req.destroy(); else partes.push(c); });
      req.on('end', async () => {
        let bin;
        try {
          const m = String(JSON.parse(Buffer.concat(partes).toString('utf8')).dados || '').match(/^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/);
          if (!m) return responde(res, 400, { erro: 'imagem' });
          bin = Buffer.from(m[2], 'base64');
        } catch { return responde(res, 400, { erro: 'json' }); }
        try {
          const jpg = await guardarImagem(pastaImg, bin);
          responde(res, 200, { url: `${base.replace(/\/+$/, '')}/img/${jpg}` });
        } catch (e) { responde(res, 400, { erro: 'imagem' }); }
      });
      return;
    }

    if (/^\/img\/[a-f0-9]{24}\.jpg$/.test(p)) {
      let jpg;
      try { jpg = fs.readFileSync(path.join(pastaImg, p.slice(5))); } catch { return responde(res, 404, 'não existe'); }
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': jpg.length, 'Cache-Control': 'public, max-age=604800' });
      return void res.end(jpg);
    }

    if (p === '/api/cliques') {
      if (!autorizado(req)) return responde(res, 401, { erro: 'senha' });
      const top = Object.entries(dados.links).sort((a, b) => b[1].cliques - a[1].cliques).slice(0, 50)
        .map(([codigo, l]) => ({ codigo, cliques: l.cliques, url: l.url, criado: new Date(l.criado).toISOString() }));
      return responde(res, 200, { total: Object.keys(dados.links).length, top, grupo: dados.grupo,
        grupoRecentes: dados.grupoRecentes, robos: dados.robos });
    }

    if (p === '/grupo') {
      // origem curta e sem nada de quem clicou: só a página do site ("home", "guia:cupom-amazon")
      const de = /^[a-z0-9:-]{1,60}$/.test(u.searchParams.get('de') || '') ? u.searchParams.get('de') : 'direto';
      if (pedidoDeRobo(req.headers)) dados.robos.grupo++;
      else {
        dados.grupo[de] = (dados.grupo[de] || 0) + 1;
        // só a hora e a origem; nada de quem clicou (sem IP, sem aparelho)
        const limite = Date.now() - RECENTES_DIAS * 864e5;
        dados.grupoRecentes = [...dados.grupoRecentes.filter(x => Date.parse(x.quando) > limite), { quando: new Date().toISOString(), de }].slice(-RECENTES);
        // Clique de quem veio de anúncio: avisa a Meta sem segurar o redirecionamento (16/11).
        const c = conversao ? camposDoClique(u, req.headers) : null;
        if (c) Promise.resolve().then(() => conversao(c)).catch(() => {});
      }
      sujo = true;
      const n = Number(u.searchParams.get('n'));
      const destino = (Number.isInteger(n) && n >= 1 && convites[n - 1]) || convites[convites.length - 1] || raizSite;
      return destino ? responde(res, 302, '', { Location: destino, 'Cache-Control': 'no-store' }) : responde(res, 404, 'Grupo ainda não configurado.');
    }

    if (p === '/' || p === '') {
      if (raizSite) return responde(res, 301, '', { Location: raizSite + '/' + u.search });
      return convites.length ? responde(res, 302, '', { Location: convites[convites.length - 1] }) : responde(res, 200, 'ok');
    }

    const l = dados.links[p.slice(1)];
    if (!l) {
      if (!raizSite) return responde(res, 404, 'Essa oferta não existe mais.');
      if (/^\/[a-km-np-z2-9]{5}$/.test(p)) return responde(res, 302, '', { Location: raizSite + '/oferta-encerrada', 'Cache-Control': 'no-store' });
      return responde(res, 301, '', { Location: raizSite + p + u.search });
    }
    if (pedidoDeRobo(req.headers)) dados.robos.links++; else l.cliques++;
    sujo = true;
    responde(res, 302, '', { Location: l.url, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer-when-downgrade' });
  });
  servidor.on('close', () => { clearInterval(relogio); salvar(); });
  return servidor;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const segredo = process.env.ENCURTADOR_SEGREDO;
  if (!segredo || segredo.length < 32) { console.error('falta ENCURTADOR_SEGREDO (32 caracteres ou mais)'); process.exit(1); }
  const s = criarServidor({ pasta: process.env.PASTA_DADOS || '/data', segredo,
    base: process.env.BASE_URL || 'http://localhost', convite: process.env.CONVITE_GRUPO || '',
    site: process.env.SITE_URL || '',
    conversao: process.env.CONVERSAO_DESLIGADA ? null : (c) => enviarConversao(c, segredo, process.env.CONVERSAO_URL || URL_CONVERSAO) });
  s.listen(Number(process.env.PORT) || 8080, () => console.log('encurtador de pé'));
  for (const sinal of ['SIGTERM', 'SIGINT']) process.on(sinal, () => s.close(() => process.exit(0)));
}
