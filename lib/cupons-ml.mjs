// Cupons do Mercado Livre (24/11/2026). O número do robô segue o canal "Afiliados e Criadores Mercado Livre", que manda
// os cupons do dia no formato:
//   🎟️ QUEROCUPONS30 👉 30% OFF
//   Variados | Compra mínima: R$1 | Desconto máx: R$500
//   🔗 https://bit.ly/...
//   > Válidos até 20.12, ou enquanto durarem os estoques, em produtos elegíveis.
// O fluxo 09 junta os cupons ainda válidos, escolhe os melhores e posta UMA vez por dia na comunidade, com o link
// trocado pelo seu (matt_word e matt_tool). Cupom que saiu nos últimos dias não repete; vencido nunca sai.

// No nó Code do n8n URL não é global: vem do require('url').
let urlModC = null; try { urlModC = require('url'); } catch (e) { urlModC = null; }
const URLM = typeof URL !== 'undefined' ? URL : (urlModC && urlModC.URL);

const diaC = (ms) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(ms));
const limpaLinha = (l) => String(l || '').replace(/[*_~`]/g, '').replace(/^\s*>\s*/, '').trim();
const reaisNum = (t) => { const n = Number(String(t).replace(/\./g, '').replace(',', '.')); return Number.isFinite(n) && n > 0 ? n : null; };
const CABECA = /^(?:🎟️|🎟|🎫)?\s*([A-Z0-9]{4,24})\s*👉\s*(.+)$/u;
const LINK = /https?:\/\/[^\s<>"')]+/;

/** A data (AAAA-MM-DD) até quando vale, lida do texto; sem data, vale só no dia do post. */
export function validadeDe(texto, postMs) {
  const t = String(texto || '').toLowerCase();
  const dia = diaC(postMs), ano = Number(dia.slice(0, 4)), mes = Number(dia.slice(5, 7));
  const data = (d, m) => `${m < mes - 6 ? ano + 1 : ano}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  let m = t.match(/at[eé]\s+(?:o\s+dia\s+)?(\d{1,2})[./](\d{1,2})/);
  if (m) return data(Number(m[1]), Number(m[2]));
  m = t.match(/somente\s+em\s+(\d{1,2})[./](\d{1,2})/);
  if (m) return data(Number(m[1]), Number(m[2]));
  return dia;
}

/** Os cupons de um post do canal. Linha de cabeçalho "CÓDIGO 👉 desconto", depois mínimo, máximo, categoria e link. */
export function lerCuponsML(texto, postMs) {
  const linhas = String(texto || '').split('\n').map(limpaLinha);
  const validadeGeral = validadeDe(linhas.filter(l => /v[aá]lid/i.test(l)).join(' '), postMs);
  const comLink = linhas.filter(l => LINK.test(l));
  const linkGeral = comLink.length ? comLink[comLink.length - 1].match(LINK)[0] : null;
  const cupons = [];
  let atual = null;
  for (const l of linhas) {
    const c = l.match(CABECA);
    if (c) {
      const valor = c[2].trim();
      const pct = Number((valor.match(/(\d{1,2})\s*%/) || [])[1]) || null;
      const reais = pct ? null : reaisNum((valor.match(/R\$\s*([\d.,]+)/) || [])[1]);
      if (!pct && !reais) { atual = null; continue; }
      atual = { codigo: c[1], pct, reais, minimo: null, maximo: null, categoria: null, link: null, ate: null };
      cupons.push(atual);
      continue;
    }
    if (!l) { atual = null; continue; }
    if (!atual) continue;
    const min = l.match(/compra\s+m[ií]n(?:ima|\.)?\s*:?\s*R\$\s*([\d.,]+)/i) || l.match(/a\s+partir\s+de\s+R\$\s*([\d.,]+)/i);
    if (min) atual.minimo = reaisNum(min[1]);
    const max = l.match(/desconto\s+m[aá]x(?:imo|\.)?\s*:?\s*R\$\s*([\d.,]+)/i);
    if (max) atual.maximo = reaisNum(max[1]);
    const lk = l.match(LINK);
    if (lk) atual.link = lk[0];
    if (/v[aá]lid/i.test(l)) atual.ate = validadeDe(l, postMs);
    // Categoria: o primeiro pedaço curto, sem número ("Tecnologia", "Acessórios para veículos"); "Variados" não conta.
    const pedaco = l.split('|')[0].trim();
    if (!min && !max && !lk && !/v[aá]lid|\d/i.test(pedaco) && pedaco.length <= 40 && !atual.categoria && !/^variad/i.test(pedaco)) atual.categoria = pedaco;
  }
  return cupons.map(c => ({ ...c, ate: c.ate || validadeGeral, link: c.link || linkGeral }));
}

/** Link do ML com a SUA etiqueta: tira a de quem divulgou (matt_*), utm_* e glk. Fora do ML: null. */
export function linkMLComEtiqueta(url, etiqueta, tool) {
  let u; try { u = new URLM(url); } catch { return null; }
  if (!/(^|\.)mercadolivre\.com\.br$/i.test(u.hostname) || !etiqueta || !tool) return null;
  for (const k of [...u.searchParams.keys()]) if (/^(matt_\w+|utm_\w+|glk|tracking_id)$/i.test(k)) u.searchParams.delete(k);
  u.searchParams.set('matt_word', String(etiqueta).trim());
  u.searchParams.set('matt_tool', String(tool).trim());
  u.hash = '';
  return u.toString();
}

/** Loja oficial pelo link (/loja/principia vira "Principia"). */
export function lojaDoLink(url) {
  const m = String(url || '').match(/mercadolivre\.com\.br\/loja\/([a-z0-9-]{2,40})/i);
  return m ? m[1].split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') : null;
}

/**
 * Os cupons para postar hoje: ainda válidos, sem repetir os que saíram nos últimos `diasSemRepetir` dias, os gerais
 * primeiro (sem categoria nem loja), os que vencem hoje na frente, depois o maior desconto. No máximo `max`.
 */
export function escolherCupons(posts, agoraMs, mem, { max = 5, diasSemRepetir = 5 } = {}) {
  const hoje = diaC(agoraMs);
  const recentes = mem.cuponsPostados || {};
  const limite = diaC(agoraMs - diasSemRepetir * 864e5);
  const vistos = new Set();
  const todos = [];
  for (const p of [...(posts || [])].sort((a, b) => Date.parse(b.quando) - Date.parse(a.quando))) {
    for (const c of lerCuponsML(p.texto, Date.parse(p.quando) || agoraMs)) {
      if (vistos.has(c.codigo) || c.ate < hoje) continue;
      if (recentes[c.codigo] && recentes[c.codigo] > limite) continue;
      vistos.add(c.codigo);
      todos.push(c);
    }
  }
  // Geral (sem categoria) vale mais; o que vence hoje passa na frente (amanhã já não serve); depois o maior desconto.
  const nota = (c) => (c.categoria ? 0 : 100) + (c.ate === hoje ? 50 : 0) + (c.pct || Math.min(30, (c.reais || 0) / 20));
  return todos.sort((a, b) => nota(b) - nota(a) || (a.minimo || 0) - (b.minimo || 0)).slice(0, max);
}

const rs = (v) => `R$${Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`;
const ddmmC = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** O texto do post. `links` = { codigo: link com a sua etiqueta }. */
export function textoCupons(cupons, agoraMs, links = {}) {
  const hoje = diaC(agoraMs);
  const linhas = ['🎟️ *CUPONS DO MERCADO LIVRE*', ''];
  // Junta os cupons do mesmo link (na ordem em que o link aparece), para o link sair uma vez só.
  const ordem = [];
  for (const c of cupons) if (!ordem.includes(links[c.codigo] || c.codigo)) ordem.push(links[c.codigo] || c.codigo);
  cupons = ordem.flatMap(k => cupons.filter(c => (links[c.codigo] || c.codigo) === k));
  cupons.forEach((c, i) => {
    const valor = c.pct ? `${c.pct}% OFF` : `${rs(c.reais)} OFF`;
    const onde = c.loja ? ` na loja oficial ${c.loja}` : c.categoria ? ` em ${c.categoria}` : '';
    const min = !c.minimo || c.minimo <= 1 ? 'sem compra mínima' : `acima de ${rs(c.minimo)}`;
    const max = c.maximo ? ` (desconto até ${rs(c.maximo)})` : '';
    const ate = c.ate === hoje ? ', só hoje' : `, até ${ddmmC(c.ate)}`;
    linhas.push(`*${c.codigo}*: ${valor}${onde}, ${min}${max}${ate}`);
    // Cupons seguidos com o mesmo link: o link sai uma vez só, depois do último deles.
    const prox = cupons[i + 1];
    if (links[c.codigo] && !(prox && links[prox.codigo] === links[c.codigo])) linhas.push(`👉 ${links[c.codigo]}`, '');
  });
  if (linhas[linhas.length - 1] !== '') linhas.push('');
  linhas.push('_Em produtos elegíveis, enquanto durarem os estoques. Use o código no carrinho._');
  return linhas.join('\n');
}

/** Hora de postar? Uma vez por dia, a partir de `hora`:`minuto` (11h30), até as 21h. */
export function horaDosCupons(mem, agoraMs, hora = 11, minuto = 30) {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(agoraMs));
  const [h, m] = f.split(':').map(Number);
  return h * 60 + m >= hora * 60 + minuto && h < 21 && mem.cuponsDia !== diaC(agoraMs);
}

/** Depois de postar: guarda o dia e os códigos (30 dias). */
export function anotarCupons(mem, codigos, agoraMs) {
  const hoje = diaC(agoraMs), limite = diaC(agoraMs - 30 * 864e5);
  mem.cuponsDia = hoje;
  mem.cuponsPostados = Object.fromEntries([...Object.entries(mem.cuponsPostados || {}).filter(([, d]) => d > limite), ...codigos.map(c => [c, hoje])]);
  return mem;
}
