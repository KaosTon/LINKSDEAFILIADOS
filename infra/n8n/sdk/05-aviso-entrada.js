import { workflow, node, trigger, ifElse, expr } from '@n8n/workflow-sdk';

/* AVISO DE ENTRADA: entrou alguém na comunidade, avisa no rascunho
 *
 * Em comunidade do WhatsApp, quem entra vê o grupo de Avisos vazio até um admin
 * enviar o histórico de mensagens. A cada 5 minutos (das 7h às 23h) este fluxo
 * lê a lista de participantes na Z-API (só leitura), compara com a guardada e,
 * se o grupo cresceu, manda um aviso no rascunho pelo gateway (fluxo 02).
 *
 * Qual grupo: AVISO_ENTRADA_GRUPO, ou o último de GRUPO_OFERTAS quando há mais
 * de um. AVISO_ENTRADA_GRUPO=0 desliga. Só o resumo (hash) do telefone fica na
 * memória do fluxo, nunca o número.
 */
const GATEWAY = '0lJeNYqZyDG9Rq2J';
const ENTRADAS = ['phone', 'message', 'image', 'origem', 'link', 'titulo'].map(id => ({
  id, displayName: id, required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }));

const relogio = trigger({
  type: 'n8n-nodes-base.scheduleTrigger', version: 1.2,
  config: { name: 'A cada 5 minutos', position: [0, 0],
    parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 5 }] } } },
  output: [{}]
});

const confere = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Confere quem entrou', position: [240, 0],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:aviso-entrada*/",
"const mem = $getWorkflowStaticData('global');",
"const agora = new Date();",
"// Rodado na mão no editor: mostra o que leu e não avisa (a memória só grava em produção).",
"const teste = typeof $execution !== 'undefined' && /^(test|manual)$/.test($execution.mode);",
"const grupo = grupoDoAvisoDeEntrada($env);",
"if (!$env.GRUPO_RASCUNHO || !grupo) return [{ json: { avisar: false, motivo: 'sem_grupo' } }];",
"if (!horaDoAvisoDeEntrada(agora) && !teste) return [{ json: { avisar: false, motivo: 'fora_do_horario' } }];",
"let part = null;",
"try { part = await participantesDoGrupo(this.helpers, $env, grupo); } catch (e) { part = null; }",
"if (!part) return [{ json: { avisar: false, motivo: 'sem_lista' } }];",
"const entrou = novosNoGrupo(mem, part);",
"const total = mem.entradaIds.length;",
"if (!entrou || teste) return [{ json: { avisar: false, motivo: teste ? 'teste' : 'ninguem_novo', total, entrou } }];",
"return [{ json: { avisar: true, entrou, total, grupo: $env.GRUPO_RASCUNHO, texto: textoEntrada(entrou, total) } }];"
].join('\n') } },
  output: [{ avisar: true, entrou: 1, total: 6, grupo: '120363000000000001-group', texto: 'Entrou 1 pessoa' }]
});

const avisa = ifElse({
  version: 2.2,
  config: { name: 'Avisa?', position: [480, 0], parameters: {
    conditions: { combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
      conditions: [{ leftValue: expr('{{ $json.avisar }}'), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }] },
    looseTypeValidation: true, options: {} } }
});

const envia = node({
  type: 'n8n-nodes-base.executeWorkflow', version: 1.2,
  config: { name: 'Avisa no rascunho', position: [720, -100], parameters: {
    source: 'database',
    workflowId: { __rl: true, mode: 'id', value: GATEWAY },
    workflowInputs: { mappingMode: 'defineBelow', matchingColumns: [], schema: ENTRADAS, attemptToConvertTypes: false,
      value: { phone: expr('{{ $json.grupo }}'), message: expr('{{ $json.texto }}'), image: '', origem: '05-aviso-entrada', link: '', titulo: '' } },
    options: { waitForSubWorkflow: true } } },
  output: [{ ok: true, id: 'Z1', origem: '05-aviso-entrada', erro: null }]
});

export default workflow('ofertas-05-aviso-entrada', '[Ofertas] 05 Aviso de entrada na comunidade')
  .add(relogio.to(confere).to(avisa.onTrue(envia)));
