import { workflow, node, trigger, ifElse, expr } from '@n8n/workflow-sdk';

/* ENTRADA: a oferta que o Wellington posta no rascunho vira post no grupo
 *
 * A Z-API avisa toda mensagem (webhook "Ao receber"). Só vale o que chega no
 * GRUPO_RASCUNHO, do AUTOR_PHONE (ou do próprio número do robô digitado no
 * celular). O robô troca cada link pelo link de afiliado, posta no
 * GRUPO_OFERTAS com a mesma foto e responde no rascunho se deu certo ou por
 * que não postou. Toda saída passa pelo fluxo 02 (gateway).
 *
 * Se WEBHOOK_SEGREDO estiver configurado, a URL do webhook na Z-API tem que
 * terminar com ?k=O_SEGREDO; sem isso, qualquer um que achasse a URL poderia
 * mandar o robô postar no grupo.
 */
const GATEWAY = '0lJeNYqZyDG9Rq2J';
const ENTRADAS = ['phone', 'message', 'image', 'origem'].map(id => ({
  id, displayName: id, required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }));
const gateway = (nome, posicao, valores) => node({
  type: 'n8n-nodes-base.executeWorkflow', version: 1.2,
  config: { name: nome, position: posicao, parameters: {
    source: 'database',
    workflowId: { __rl: true, mode: 'id', value: GATEWAY },
    workflowInputs: { mappingMode: 'defineBelow', value: valores, matchingColumns: [], schema: ENTRADAS, attemptToConvertTypes: false },
    options: { waitForSubWorkflow: true } } },
  output: [{ ok: true, id: 'Z1', origem: valores.origem, erro: null }]
});

const zapi = trigger({
  type: 'n8n-nodes-base.webhook', version: 2.1,
  config: { name: 'Z-API avisou', position: [0, 0],
    parameters: { httpMethod: 'POST', path: 'ofertas-zapi', responseMode: 'onReceived', options: {} } },
  output: [{ body: { phone: '120363000000000001-group', isGroup: true, text: { message: 'oi' } }, query: {} }]
});

const prepara = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Prepara a oferta', position: [240, 0],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:ofertas*/",
"const w = $('Z-API avisou').first().json || {};",
"if ($env.WEBHOOK_SEGREDO && String((w.query || {}).k || '') !== $env.WEBHOOK_SEGREDO) return [];",
"const memoria = $getWorkflowStaticData('global');",
"memoria.vistos = memoria.vistos || [];",
"const cfg = { rascunho: $env.GRUPO_RASCUNHO, grupo: $env.GRUPO_OFERTAS, autor: $env.AUTOR_PHONE,",
"  instancia: $env.ZAPI_INSTANCE_ID, amazonTag: $env.AMAZON_TAG, magaluLoja: $env.MAGALU_LOJA,",
"  shopee: !!($env.SHOPEE_APP_ID && $env.SHOPEE_SECRET) };",
"const http = this.helpers;",
"const rede = {",
"  abrir: (url) => abrirLink(url, (u) => http.httpRequest({ method: 'GET', url: u, disableFollowRedirect: true,",
"    returnFullResponse: true, ignoreHttpStatusErrors: true, timeout: 15000 })),",
"  async shopee(url) {",
"    const corpo = shopeeCorpo(url, ['grupo']);",
"    const auth = shopeeAutorizacao($env.SHOPEE_APP_ID, $env.SHOPEE_SECRET, corpo);",
"    let r = await http.httpRequest({ method: 'POST', url: 'https://open-api.affiliate.shopee.com.br/graphql',",
"      headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: corpo, json: false, timeout: 15000 });",
"    if (typeof r === 'string') r = JSON.parse(r);",
"    return (r && r.data && r.data.generateShortLink && r.data.generateShortLink.shortLink) || null;",
"  },",
"};",
"const r = await prepararOferta(w.body, cfg, rede, memoria.vistos);",
"if (r.acao === 'ignorar') return [];",
"return [{ json: r }];"
].join('\n') } },
  output: [{ acao: 'postar', postar: true, grupo: '120363000000000002-group', texto: 'Oferta', imagem: '' }]
});

const podePostar = ifElse({
  version: 2.2,
  config: { name: 'Pode postar?', position: [480, 0], parameters: {
    conditions: { combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
      conditions: [{ leftValue: expr('{{ $json.postar }}'), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }] },
    looseTypeValidation: true, options: {} } }
});

const posta = gateway('Posta no grupo', [720, -100], {
  phone: expr('{{ $json.grupo }}'), message: expr('{{ $json.texto }}'), image: expr('{{ $json.imagem }}'), origem: '01-grupo' });

const comoFoi = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Como foi', position: [960, -100],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"const r = $input.first().json || {};",
"return [{ json: { resposta: r.ok",
"  ? '\\u2705 Postado no grupo de ofertas.'",
"  : '\\u274C Não consegui postar no grupo: ' + (r.erro || 'a Z-API não respondeu') } }];"
].join('\n') } },
  output: [{ resposta: 'Postado' }]
});

const responde = gateway('Responde no rascunho', [1200, 0], {
  phone: expr('{{ $env.GRUPO_RASCUNHO }}'), message: expr('{{ $json.resposta }}'), image: '', origem: '01-resposta' });

export default workflow('ofertas-01-entrada', '[Ofertas] 01 Entrada (rascunho para o grupo)')
  .add(zapi.to(prepara).to(podePostar
    .onTrue(posta.to(comoFoi).to(responde))
    .onFalse(responde)));
