import { workflow, node, trigger, ifElse, switchCase, merge, splitInBatches, nextBatch, languageModel, memory, tool, outputParser, newCredential, expr } from '@n8n/workflow-sdk';

const rodarNaMao = trigger({
  type: "n8n-nodes-base.manualTrigger",
  version: 1,
  config: { name: "Rodar na mão", position: [0, 0] }
});

const qualLink = node({
  type: "n8n-nodes-base.code",
  version: 2,
  config: {
    name: "Qual link",
    position: [240, 0],
    parameters: {
      mode: "runOnceForAllItems",
      language: "javaScript",
      jsCode: "// Sem URL global no nó Code do n8n: tudo aqui é texto e regex.\nconst links = ['https://meli.la/11WeZVe', 'https://meli.la/1X4BXdh'];\nconst ambiente = { URL: typeof URL, URLSearchParams: typeof URLSearchParams, setTimeout: typeof setTimeout, require: typeof require };\nlet urlModulo = null; try { urlModulo = typeof require('url').URL; } catch (e) { urlModulo = 'bloqueado: ' + String(e.message).slice(0, 80); }\nambiente.require_url = urlModulo;\nconst saida = [];\nfor (const inicio of links) {\n  let atual = inicio; const saltos = [];\n  for (let i = 0; i < 8; i++) {\n    let r;\n    try {\n      r = await this.helpers.httpRequest({ method: 'GET', url: atual, disableFollowRedirect: true,\n        returnFullResponse: true, ignoreHttpStatusErrors: true, timeout: 15000,\n        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });\n    } catch (e) { saltos.push({ url: atual, erro: String(e.message || e).slice(0, 200) }); break; }\n    const destino = r.headers && (r.headers.location || r.headers.Location);\n    saltos.push({ url: atual, status: r.statusCode });\n    if (!destino) {\n      const corpo = typeof r.body === 'string' ? r.body : '';\n      const m = corpo.match(/https?:\\/\\/[^\"'<> ]*(mercadolivre|mercadolibre)[^\"'<> ]*/i);\n      if (m) saltos.push({ no_corpo: m[0].slice(0, 800) });\n      break;\n    }\n    atual = /^https?:/i.test(destino) ? destino : atual.replace(/^(https?:\\/\\/[^\\/]+).*$/, '$1') + destino;\n  }\n  const fim = saltos.filter(s => s.url).pop().url;\n  const params = {};\n  (fim.split('?')[1] || '').split('#')[0].split('&').filter(Boolean).forEach(p => { const [k, v] = p.split('='); params[decodeURIComponent(k)] = decodeURIComponent(v || ''); });\n  saida.push({ json: { inicio, saltos, params, ambiente } });\n}\nreturn saida;"
    }
  }
});

export default workflow("ofertas-98-ensaio-abre-link-curto", "[Ofertas] 98 Ensaio: abre link curto")
  .add(rodarNaMao.to(qualLink));
