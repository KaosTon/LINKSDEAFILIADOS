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
      jsCode: "const links = ['https://meli.la/11WeZVe'];\nconst saida = [];\nfor (const inicio of links) {\n  let atual = inicio; const saltos = [];\n  for (let i = 0; i < 8; i++) {\n    let r;\n    try {\n      r = await this.helpers.httpRequest({ method: 'GET', url: atual, disableFollowRedirect: true,\n        returnFullResponse: true, ignoreHttpStatusErrors: true, timeout: 15000,\n        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });\n    } catch (e) { saltos.push({ url: atual, erro: String(e.message || e).slice(0, 200) }); break; }\n    const destino = r.headers && (r.headers.location || r.headers.Location);\n    saltos.push({ url: atual, status: r.statusCode });\n    if (!destino) {\n      const corpo = typeof r.body === 'string' ? r.body : '';\n      const m = corpo.match(/https?:\\/\\/[^\"'<> ]*(mercadolivre|mercadolibre)[^\"'<> ]*/i);\n      if (m) saltos.push({ no_corpo: m[0].slice(0, 600) });\n      break;\n    }\n    atual = new URL(destino, atual).toString();\n  }\n  const fim = saltos.filter(s => s.url).pop();\n  let params = {};\n  try { params = Object.fromEntries(new URL(fim.url).searchParams); } catch (e) {}\n  saida.push({ json: { inicio, saltos, params } });\n}\nreturn saida;"
    }
  }
});

export default workflow("ofertas-98-ensaio-abre-link-curto", "[Ofertas] 98 Ensaio: abre link curto")
  .add(rodarNaMao.to(qualLink));
