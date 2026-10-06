import { workflow, node, trigger } from '@n8n/workflow-sdk';

/* ENSAIO: abre um link curto e mostra cada salto (manual)
 *
 * Para ver o que tem dentro de um meli.la, amzn.to ou s.shopee sem postar
 * nada. Troca o link no nó "Qual link" e roda na mão.
 */
const mao = trigger({
  type: 'n8n-nodes-base.manualTrigger', version: 1,
  config: { name: 'Rodar na mão', position: [0, 0] }, output: [{}]
});

const abre = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Qual link', position: [240, 0],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"// Sem URL global no nó Code do n8n: tudo aqui é texto e regex.",
"const links = ['https://meli.la/11WeZVe', 'https://meli.la/1X4BXdh'];",
"const ambiente = { URL: typeof URL, URLSearchParams: typeof URLSearchParams, setTimeout: typeof setTimeout, require: typeof require };",
"let urlModulo = null; try { urlModulo = typeof require('url').URL; } catch (e) { urlModulo = 'bloqueado: ' + String(e.message).slice(0, 80); }",
"ambiente.require_url = urlModulo;",
"const saida = [];",
"for (const inicio of links) {",
"  let atual = inicio; const saltos = [];",
"  for (let i = 0; i < 8; i++) {",
"    let r;",
"    try {",
"      r = await this.helpers.httpRequest({ method: 'GET', url: atual, disableFollowRedirect: true,",
"        returnFullResponse: true, ignoreHttpStatusErrors: true, timeout: 15000,",
"        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });",
"    } catch (e) { saltos.push({ url: atual, erro: String(e.message || e).slice(0, 200) }); break; }",
"    const destino = r.headers && (r.headers.location || r.headers.Location);",
"    saltos.push({ url: atual, status: r.statusCode });",
"    if (!destino) {",
"      const corpo = typeof r.body === 'string' ? r.body : '';",
"      const m = corpo.match(/https?:\\/\\/[^\"'<> ]*(mercadolivre|mercadolibre)[^\"'<> ]*/i);",
"      if (m) saltos.push({ no_corpo: m[0].slice(0, 800) });",
"      break;",
"    }",
"    atual = /^https?:/i.test(destino) ? destino : atual.replace(/^(https?:\\/\\/[^\\/]+).*$/, '$1') + destino;",
"  }",
"  const fim = saltos.filter(s => s.url).pop().url;",
"  const params = {};",
"  (fim.split('?')[1] || '').split('#')[0].split('&').filter(Boolean).forEach(p => { const [k, v] = p.split('='); params[decodeURIComponent(k)] = decodeURIComponent(v || ''); });",
"  saida.push({ json: { inicio, saltos, params, ambiente } });",
"}",
"return saida;"
].join('\n') } },
  output: [{ inicio: 'x', saltos: [], params: {} }]
});

export default workflow('ofertas-98-abre-link', '[Ofertas] 98 Ensaio: abre link curto')
  .add(mao.to(abre));
