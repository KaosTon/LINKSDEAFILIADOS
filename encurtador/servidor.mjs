// Encurtador próprio: temdescontos.com.br/a7k2p -> link de afiliado.
// Roda no Railway como serviço separado do n8n, com um volume em /data. Única dependência: sharp (foto.mjs).
//
//   GET  /{codigo}          redireciona (302) e conta o clique
//   GET  /foto?u=&a=        foto do post em 1200x630 com o logo no canto; só com assinatura do n8n (foto.mjs)
//   POST /api/encurtar      { url } com Authorization: Bearer ENCURTADOR_SEGREDO -> { codigo, curto }
//   GET  /api/cliques       mesma senha; os links mais clicados, cliques no convite por origem e os últimos
//                           cliques no convite com a hora (grupoRecentes), para cruzar com quem entrou no grupo
//
// Robô não conta (21/10): Google, Bing, a prévia de link do WhatsApp e do Facebook abrem o link
// e não são gente. Eles ainda são redirecionados normalmente; só ficam fora da contagem (robos).
//   GET  /saude             para o Railway saber que está de pé
//   GET  /grupo?de=home     convite do grupo (CONVITE_GRUPO); conta de qual página do site veio
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
import { criarRotaFoto } from './foto.mjs';

const LOJAS = /(^|\.)(amazon\.com\.br|amzn\.to|mercadolivre\.com\.br|meli\.la|shopee\.com\.br|magazinevoce\.com\.br|magazineluiza\.com\.br)$/i;
const ALFABETO = 'abcdefghijkmnpqrstuvwxyz23456789';   // sem l, o, 0, 1 (confundem)

export function lojaPermitida(url) {
  let u; try { u = new URL(url); } catch { return false; }
  return u.protocol === 'https:' && LOJAS.test(u.hostname);
}

// User-Agent de robô de busca, de prévia de link ou de ferramenta. Sem User-Agent também é robô.
const ROBO = /bot\b|bot\/|crawl|spider|slurp|facebookexternalhit|facebot|whatsapp|telegram|twitterbot|linkedin|discord|skypeuripreview|preview|headless|lighthouse|pingdom|uptime|python|curl|wget|go-http|okhttp|java\/|axios|ahrefs|semrush|mj12|petal|bytespider|gpt|claude|perplexity|applebot|yandex|baidu|duckduck/i;
export function ehRobo(ua) { return !ua || ROBO.test(String(ua)); }

const RECENTES = 300, RECENTES_DIAS = 14;

export function novoCodigo(existe, tamanho = 5) {
  for (;;) {
    const b = crypto.randomBytes(tamanho);
    const c = [...b].map(x => ALFABETO[x % ALFABETO.length]).join('');
    if (!existe(c)) return c;
  }
}

export function criarServidor({ pasta, segredo, base, convite, site, baixarFoto }) {
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
  const foto = criarRotaFoto({ pasta, segredo, ...(baixarFoto ? { baixarFoto } : {}) });
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
      if (ehRobo(req.headers['user-agent'])) dados.robos.grupo++;
      else {
        dados.grupo[de] = (dados.grupo[de] || 0) + 1;
        // só a hora e a origem; nada de quem clicou (sem IP, sem aparelho)
        const limite = Date.now() - RECENTES_DIAS * 864e5;
        dados.grupoRecentes = [...dados.grupoRecentes.filter(x => Date.parse(x.quando) > limite), { quando: new Date().toISOString(), de }].slice(-RECENTES);
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
    if (ehRobo(req.headers['user-agent'])) dados.robos.links++; else l.cliques++;
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
    site: process.env.SITE_URL || '' });
  s.listen(Number(process.env.PORT) || 8080, () => console.log('encurtador de pé'));
  for (const sinal of ['SIGTERM', 'SIGINT']) process.on(sinal, () => s.close(() => process.exit(0)));
}
