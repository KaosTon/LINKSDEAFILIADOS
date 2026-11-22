import { workflow, node, trigger, ifElse, expr } from '@n8n/workflow-sdk';

/* VIGIA DA Z-API: avisa no celular se o WhatsApp do robô cair (22/11)
 *
 * Em 21/11, às 18h, o WhatsApp do robô desconectou da Z-API e só se soube no dia seguinte. A cada 10
 * minutos este fluxo pergunta à Z-API se a instância está conectada. Caiu (2 conferências seguidas):
 * push no celular pelo ntfy (app grátis; tópico em AVISO_NTFY_TOPICO), repetido a cada
 * AVISO_REPETIR_MIN (180) minutos, sem tocar das 23h às 7h. Voltou: push e aviso no rascunho.
 * Uma vez por dia confere o vencimento do plano da Z-API (aviso com 3 dias de antecedência).
 * Sem AVISO_NTFY_TOPICO o fluxo só confere (dá para ver na execução) e avisa a volta no rascunho.
 */
const GATEWAY = '0lJeNYqZyDG9Rq2J';
const ENTRADAS = ['phone', 'message', 'image', 'origem', 'link', 'titulo'].map(id => ({
  id, displayName: id, required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }));

const relogio = trigger({
  type: 'n8n-nodes-base.scheduleTrigger', version: 1.2,
  config: { name: 'A cada 10 minutos', position: [0, 0],
    parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 10 }] } } },
  output: [{}]
});

const confere = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Confere a Z-API', position: [240, 0],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:vigia-zapi*/",
"const env = $env, agora = Date.now();",
"const mem = $getWorkflowStaticData('global');",
"const raiz = String(env.ZAPI_BASE_URL || 'https://api.z-api.io').replace(/\\/+$/, '') + '/instances/' + env.ZAPI_INSTANCE_ID + '/token/' + env.ZAPI_INSTANCE_TOKEN;",
"const H = env.ZAPI_CLIENT_TOKEN ? { 'client-token': env.ZAPI_CLIENT_TOKEN } : {};",
"// Nunca deixa token na execução.",
"const limpa = (e) => [env.ZAPI_INSTANCE_TOKEN, env.ZAPI_CLIENT_TOKEN].filter(Boolean).reduce((s, k) => s.split(String(k)).join('***'), String((e && e.message) || e)).slice(0, 120);",
"let r;",
"try { r = await this.helpers.httpRequest({ method: 'GET', url: raiz + '/status', json: true, timeout: 20000, headers: H }); } catch (e) { r = { erro: limpa(e) }; }",
"const conectado = lerStatusZapi(r);",
"const d = decidirVigia(mem, conectado, agora, { repetirMin: Number(env.AVISO_REPETIR_MIN) || 180 });",
"const avisos = d.push ? [d.push] : [];",
"// Vencimento do plano: uma consulta por dia.",
"const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(agora));",
"if (conectado !== null && mem.meDia !== dia) {",
"  mem.meDia = dia;",
"  try { const m = await this.helpers.httpRequest({ method: 'GET', url: raiz + '/me', json: true, timeout: 20000, headers: H }); mem.vence = m && m.due; mem.pago = m && m.paymentStatus; } catch (e) { /* tenta amanhã */ }",
"}",
"const v = avisoDoVencimento(mem, mem.vence, mem.pago, agora);",
"if (v) avisos.push(v);",
"const enviados = [];",
"for (const a of avisos) {",
"  const p = pedidoNtfy(env.AVISO_NTFY_TOPICO, a);",
"  if (!p) { enviados.push({ titulo: a.titulo, push: 'sem_topico' }); continue; }",
"  try { await this.helpers.httpRequest(p); enviados.push({ titulo: a.titulo, push: true }); } catch (e) { enviados.push({ titulo: a.titulo, push: false, erro: String((e && e.message) || e).slice(0, 80) }); }",
"}",
"return [{ json: { conectado, erro: r && r.erro ? r.erro : null, avisos: enviados, rascunho: d.rascunho || '', avisar: !!(d.rascunho && env.GRUPO_RASCUNHO), grupo: env.GRUPO_RASCUNHO || '' } }];"
].join('\n') } },
  output: [{ conectado: true, avisos: [], rascunho: '', avisar: false, grupo: '' }]
});

const avisa = ifElse({
  version: 2.2,
  config: { name: 'Avisa no rascunho?', position: [480, 0], parameters: {
    conditions: { combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
      conditions: [{ leftValue: expr('{{ $json.avisar }}'), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }] },
    looseTypeValidation: true, options: {} } }
});

const rascunho = node({
  type: 'n8n-nodes-base.executeWorkflow', version: 1.2,
  config: { name: 'Avisa que voltou', position: [720, -100], parameters: {
    source: 'database',
    workflowId: { __rl: true, mode: 'id', value: GATEWAY },
    workflowInputs: { mappingMode: 'defineBelow', matchingColumns: [], schema: ENTRADAS, attemptToConvertTypes: false,
      value: { phone: expr('{{ $json.grupo }}'), message: expr('{{ $json.rascunho }}'), image: '', origem: '08-vigia', link: '', titulo: '' } },
    options: { waitForSubWorkflow: true } } },
  output: [{ ok: true, id: 'Z1', origem: '08-vigia', erro: null }]
});

export default workflow('ofertas-08-vigia-zapi', '[Ofertas] 08 Vigia da Z-API (avisa se o WhatsApp cair)')
  .add(relogio.to(confere).to(avisa.onTrue(rascunho)));
