import { workflow, node, trigger, ifElse, expr } from '@n8n/workflow-sdk';

/* ENTRADA: a oferta que o Wellington posta no rascunho vira post no grupo
 *
 * A Z-API avisa toda mensagem (webhook "Ao receber"). Só vale o que chega no
 * GRUPO_RASCUNHO, do AUTOR_PHONE (ou do próprio número do robô digitado no
 * celular). O robô troca cada link pelo link de afiliado, posta no
 * GRUPO_OFERTAS com a mesma foto e responde no rascunho se deu certo ou por
 * que não postou. Toda saída passa pelo fluxo 02 (gateway).
 *
 * Prévia (19/10): a oferta pronta volta primeiro no próprio rascunho, igual
 * vai sair no grupo, e o robô pergunta. "sim" posta no grupo, "não" cancela.
 * O mesmo caminho "Posta no grupo" manda a prévia (grupo = rascunho). O robô
 * ignora o que ele mesmo manda, então a prévia não volta como oferta nova.
 *
 * Foto em cena (16/11): oferta de Shopee, ML e Magalu no padrão do grupo ganha a foto em cena já na
 * prévia, com a mesma conferência do garimpo (Amazon nunca). RASCUNHO_CENA_POR_DIA=0 desliga.
 *
 * Se WEBHOOK_SEGREDO estiver configurado, a URL do webhook na Z-API tem que
 * terminar com ?k=O_SEGREDO; sem isso, qualquer um que achasse a URL poderia
 * mandar o robô postar no grupo.
 */
const GATEWAY = '0lJeNYqZyDG9Rq2J';
const ENTRADAS = ['phone', 'message', 'image', 'origem', 'link', 'titulo'].map(id => ({
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
"  instancia: $env.ZAPI_INSTANCE_ID, amazonTag: $env.AMAZON_TAG, magaluLoja: $env.MAGALU_LOJA, mlEtiqueta: $env.ML_ETIQUETA, mlTool: $env.ML_MATT_TOOL,",
"  shopee: !!($env.SHOPEE_APP_ID && $env.SHOPEE_SECRET),",
"  // Prévia (19/10): a oferta volta no rascunho e só vai ao grupo com \"sim\". RASCUNHO_PREVIA=nao desliga.",
"  previa: String($env.RASCUNHO_PREVIA || 'sim').trim().toLowerCase() !== 'nao' };",
"const rede = redeN8n(this.helpers, $env);",
"let r = await prepararOferta(w.body, cfg, rede, memoria.vistos, memoria);",
"if (r.acao === 'ignorar') return [];",
"// Foto em cena na prévia (16/11), fora Amazon. RASCUNHO_CENA_POR_DIA (20 por dia; 0 desliga).",
"const nCena = String($env.RASCUNHO_CENA_POR_DIA ?? '').trim();",
"r = await cenaNoRascunho(r, memoria, new Date(), { cenaPorDia: nCena === '' || isNaN(Number(nCena)) ? 20 : Number(nCena) }, rede);",
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
  phone: expr('{{ $json.grupo }}'), message: expr('{{ $json.texto }}'), image: expr('{{ $json.imagem }}'), origem: '01-grupo', link: expr('{{ $json.link }}'), titulo: expr('{{ $json.titulo }}') });

const comoFoi = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Como foi', position: [960, -100],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"const r = $input.first().json || {};",
"const prep = $('Prepara a oferta').first().json || {};",
"const aviso = prep.aviso;",
"if (prep.previa) return [{ json: { resposta: r.ok",
"  ? '\\u{1F446} Assim vai sair no grupo.' + (aviso ? '\\n' + aviso : '') + '\\nResponda *sim* para postar ou *não* para cancelar.'",
"  : '\\u274C Não consegui mostrar a prévia: ' + (r.erro || 'a Z-API não respondeu') } }];",
"return [{ json: { resposta: r.ok",
"  ? '\\u2705 Postado no grupo de ofertas.' + (aviso ? '\\n' + aviso : '')",
"  : '\\u274C Não consegui postar no grupo: ' + (r.erro || 'a Z-API não respondeu') } }];"
].join('\n') } },
  output: [{ resposta: 'Postado' }]
});

const responde = gateway('Responde no rascunho', [1200, 0], {
  phone: expr('{{ $env.GRUPO_RASCUNHO }}'), message: expr('{{ $json.resposta }}'), image: '', origem: '01-resposta', link: '', titulo: '' });

// Aviso de entrada ou saída da comunidade (18/11). O WhatsApp avisa na hora pelo mesmo webhook do rascunho;
// este nó só repassa ao encurtador o resumo de quem foi, a hora e o tipo, para o relatório do dia (fluxo 05).
// Fica num ramo à parte: não segura nem muda o que o rascunho faz.
const anotaMovimento = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Anota quem entrou e saiu', position: [240, 220],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:aviso-entrada*/",
"const w = $('Z-API avisou').first().json || {};",
"if ($env.WEBHOOK_SEGREDO && String((w.query || {}).k || '') !== $env.WEBHOOK_SEGREDO) return [];",
"const m = movimentoDoAviso(w.body, grupoDoAvisoDeEntrada($env));",
"if (!m || !$env.ENCURTADOR_URL || !$env.ENCURTADOR_SEGREDO) return [];",
"// Só o tipo e a quantidade ficam na execução: nem telefone nem resumo.",
"try {",
"  const r = await this.helpers.httpRequest({ method: 'POST', url: String($env.ENCURTADOR_URL).replace(/\\/+$/, '') + '/api/movimento', json: true, timeout: 8000,",
"    headers: { Authorization: 'Bearer ' + $env.ENCURTADOR_SEGREDO }, body: m });",
"  return [{ json: { tipo: m.tipo, quantos: m.ids.length, guardado: !!(r && r.ok) } }];",
"} catch (e) {",
"  return [{ json: { tipo: m.tipo, quantos: m.ids.length, guardado: false, erro: String((e && e.message) || e).split(String($env.ENCURTADOR_SEGREDO)).join('***').slice(0, 80) } }];",
"}"
].join('\n') } },
  output: [{ tipo: 'saiu', quantos: 1, guardado: true }]
});

export default workflow('ofertas-01-entrada', '[Ofertas] 01 Entrada (rascunho para o grupo)')
  .add(zapi.to(prepara).to(podePostar
    .onTrue(posta.to(comoFoi).to(responde))
    .onFalse(responde)))
  .add(zapi.to(anotaMovimento));
