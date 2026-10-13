import { workflow, node, trigger } from '@n8n/workflow-sdk';

/* ENSAIO: lê um post de canal e a página do produto na Amazon (manual)
 *
 * Nasceu em 13/10 para investigar o post do water cooler a R$2 (o canal
 * escreveu "Por: R$2,00"; a Amazon cobrava R$258,81). Mostrou onde a página
 * guarda o preço de compra: o bloco apex-pricetopay e o JSON priceAmount do
 * buybox. Página sem nenhum dos dois = produto sem venda direta (acabou).
 * No n8n o código atual dele é trocado conforme a investigação.
 */
const mao = trigger({
  type: 'n8n-nodes-base.manualTrigger', version: 1,
  config: { name: 'Rodar na mão', position: [0, 0] }, output: [{}]
});

const le = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Le o post', position: [240, 0],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"const ASINS = ['B0GGTXJD61'];",
"const H = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36', 'Accept-Language': 'pt-BR,pt;q=0.9' };",
"const out = [];",
"for (const asin of ASINS) {",
"  const r = await this.helpers.httpRequest({ method: 'GET', url: 'https://www.amazon.com.br/dp/' + asin, headers: H, returnFullResponse: true, ignoreHttpStatusErrors: true, timeout: 20000, json: false });",
"  const b = typeof r.body === 'string' ? r.body : '';",
"  const json = (b.match(/\"desktop_buybox_group_1\":\\[\\{[^}]*?\"priceAmount\":([\\d.]+)/) || [])[1] || null;",
"  const apex = (b.match(/apex-pricetopay-value[^>]*><span class=\"a-offscreen\">\\s*R\\$\\s*([\\d.]+,\\d{2})/) || [])[1] || null;",
"  out.push({ json: { asin, status: r.statusCode, captcha: /validateCaptcha/.test(b), json, apex } });",
"}",
"return out;"
].join('\n') } },
  output: [{ asin: 'x' }]
});

export default workflow('ofertas-96-ensaio-post', '[Ofertas] 96 Ensaio: le um post do canal')
  .add(mao.to(le));
