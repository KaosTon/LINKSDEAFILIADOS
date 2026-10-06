import { workflow, node, trigger } from '@n8n/workflow-sdk';

/* ENSAIO: de onde o robô consegue tirar ofertas sozinho (manual)
 *
 * Resultado de 06/10 (do Railway): ML /ofertas abre (cards poly-card com
 * JSON: url, foto, preço e preço antes); API do ML fechada (403/401);
 * Magalu bloqueia (403); Amazon /deals abre com JSON productSearchResponse
 * (asin, title, image.hiRes, price.priceToPay, basisPrice, dealBadge).
 */
const mao = trigger({
  type: 'n8n-nodes-base.manualTrigger', version: 1,
  config: { name: 'Rodar na mão', position: [0, 0] }, output: [{}]
});

const fontes = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Testa as fontes', position: [240, 0],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"const FONTES = ['https://www.mercadolivre.com.br/ofertas', 'https://www.amazon.com.br/deals'];",
"const H = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36', 'Accept-Language': 'pt-BR,pt;q=0.9', 'Accept': 'text/html' };",
"const saida = [];",
"for (const url of FONTES) {",
"  const r = await this.helpers.httpRequest({ method: 'GET', url, headers: H, returnFullResponse: true, ignoreHttpStatusErrors: true, timeout: 20000, json: false });",
"  const b = typeof r.body === 'string' ? r.body : '';",
"  saida.push({ json: { url, status: r.statusCode, tamanho: b.length, amostra: b.slice(0, 300) } });",
"}",
"return saida;"
].join('\n') } },
  output: [{ url: 'x', status: 200 }]
});

export default workflow('ofertas-97-ensaio-fontes', '[Ofertas] 97 Ensaio: de onde tirar ofertas')
  .add(mao.to(fontes));
