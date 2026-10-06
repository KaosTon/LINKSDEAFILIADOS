import { workflow, node, trigger, ifElse, switchCase, merge, splitInBatches, nextBatch, languageModel, memory, tool, outputParser, newCredential, expr } from '@n8n/workflow-sdk';

const rodarNaMao = trigger({
  type: "n8n-nodes-base.manualTrigger",
  version: 1,
  config: { name: "Rodar na mão", position: [0, 0] }
});

const testaAsFontes = node({
  type: "n8n-nodes-base.code",
  version: 2,
  config: {
    name: "Testa as fontes",
    position: [240, 0],
    parameters: {
      mode: "runOnceForAllItems",
      language: "javaScript",
      jsCode: "const FONTES = ['https://www.mercadolivre.com.br/ofertas', 'https://www.amazon.com.br/deals'];\nconst H = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36', 'Accept-Language': 'pt-BR,pt;q=0.9', 'Accept': 'text/html' };\nconst saida = [];\nfor (const url of FONTES) {\n  const r = await this.helpers.httpRequest({ method: 'GET', url, headers: H, returnFullResponse: true, ignoreHttpStatusErrors: true, timeout: 20000, json: false });\n  const b = typeof r.body === 'string' ? r.body : '';\n  saida.push({ json: { url, status: r.statusCode, tamanho: b.length, amostra: b.slice(0, 300) } });\n}\nreturn saida;"
    }
  }
});

export default workflow("ofertas-97-ensaio-de-onde-tirar-ofertas", "[Ofertas] 97 Ensaio: de onde tirar ofertas")
  .add(rodarNaMao.to(testaAsFontes));
