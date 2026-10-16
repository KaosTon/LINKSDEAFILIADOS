import { workflow, node, trigger } from '@n8n/workflow-sdk';

/* MERCADO LIVRE: o acesso à API do ML para conferir preço, foto e estoque
 *
 * ml-autorizar  página com o botão "Entrar no Mercado Livre". O dono clica,
 *               entra na conta e permite. Uma vez só.
 * ml-retorno    o ML volta aqui com o código; vira token e fica guardado na
 *               memória deste fluxo. Só a primeira conta autorizada fica.
 * De hora em hora, renova o token antes de vencer (ele dura 6 horas).
 * ml-token      os outros fluxos pedem o token aqui, com o cabeçalho x-chave
 *               (sha256 de "ml-token:" + ML_SECRET). Sem a chave, nada.
 *
 * Precisa de ML_APP_ID e ML_SECRET nas variáveis do Railway. O redirect
 * cadastrado no app do ML tem que ser exatamente o RETORNO abaixo.
 */
const RETORNO = 'https://n8n-production-4226.up.railway.app/webhook/ml-retorno';
const pagina = { responseMode: 'lastNode', responseData: 'firstEntryJson',
  options: { responsePropertyName: 'html', responseContentType: 'text/html; charset=utf-8' } };

const autorizar = trigger({
  type: 'n8n-nodes-base.webhook', version: 2.1,
  config: { name: 'ML autorizar', position: [0, 0],
    parameters: { httpMethod: 'GET', path: 'ml-autorizar', ...pagina } },
  output: [{ query: {} }]
});

const montaLink = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Monta o link', position: [240, 0],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:mercadolivre*/",
"const mem = $getWorkflowStaticData('global');",
"if (!$env.ML_APP_ID || !$env.ML_SECRET) return [{ json: { html: pagina('Falta configurar', 'Coloque ML_APP_ID e ML_SECRET nas variáveis do n8n no Railway e espere ele reiniciar.') } }];",
"const url = linkAutorizacao($env.ML_APP_ID, $env.ML_RETORNO || '" + RETORNO + "', novoEstado(mem, Date.now()));",
"const ja = mem.ml && mem.ml.usuario ? ' O robô já está conectado; autorizar de novo só renova o acesso da mesma conta.' : '';",
"return [{ json: { html: pagina('Conectar o Mercado Livre', 'Clique no botão, entre na sua conta do Mercado Livre e clique em Permitir.' + ja, { url, texto: 'Entrar no Mercado Livre' }) } }];"
].join('\n') } },
  output: [{ html: '<p>ok</p>' }]
});

const retorno = trigger({
  type: 'n8n-nodes-base.webhook', version: 2.1,
  config: { name: 'ML retorno', position: [0, 200],
    parameters: { httpMethod: 'GET', path: 'ml-retorno', ...pagina } },
  output: [{ query: { code: 'TG-x', state: 'abc' } }]
});

const trocaCodigo = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Troca o código', position: [240, 200],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:mercadolivre*/",
"const mem = $getWorkflowStaticData('global');",
"const q = $('ML retorno').first().json.query || {};",
"const agora = Date.now();",
"const fim = (t, x) => [{ json: { html: pagina(t, x) } }];",
"if (q.error) return fim('Não autorizado', 'O Mercado Livre não liberou o acesso. Abra o link de autorização de novo e clique em Permitir.');",
"if (!usarEstado(mem, q.state, agora)) return fim('Link vencido', 'Esse retorno não veio do link do robô ou passou de 15 minutos. Abra o link de autorização de novo.');",
"const tok = await trocarCodigo(redeML(this.helpers), { appId: $env.ML_APP_ID, segredo: $env.ML_SECRET,",
"  retorno: $env.ML_RETORNO || '" + RETORNO + "', codigo: q.code });",
"if (!tok) return fim('Não deu certo', 'O Mercado Livre recusou o código. Confira se o redirect do app é o mesmo endereço do robô e tente de novo.');",
"const g = guardarToken(mem, tok, agora);",
"if (!g.ok) return fim('Conta diferente', 'O robô já está ligado a outra conta do Mercado Livre e continua com ela.');",
"return fim('Pronto!', 'O robô está conectado ao Mercado Livre. Pode fechar esta página.');"
].join('\n') } },
  output: [{ html: '<p>ok</p>' }]
});

const relogio = trigger({
  type: 'n8n-nodes-base.scheduleTrigger', version: 1.2,
  config: { name: 'De hora em hora', position: [0, 400],
    parameters: { rule: { interval: [{ field: 'hours', hoursInterval: 1 }] } } },
  output: [{}]
});

const renova = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Renova o token', position: [240, 400],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:mercadolivre*/",
"const mem = $getWorkflowStaticData('global');",
"const agora = Date.now();",
"if (!mem.ml) return [{ json: { ok: false, motivo: 'sem_autorizacao' } }];",
"if (!precisaRenovar(mem, agora)) return [{ json: { ok: true, motivo: 'ainda_vale', minutos: Math.round((mem.ml.expira - agora) / 60000) } }];",
"const r = await renovar(redeML(this.helpers), mem, { appId: $env.ML_APP_ID, segredo: $env.ML_SECRET }, agora);",
"return [{ json: { ok: r.ok, motivo: r.motivo || 'renovado', status: r.status || null } }];"
].join('\n') } },
  output: [{ ok: true }]
});

const pedeToken = trigger({
  type: 'n8n-nodes-base.webhook', version: 2.1,
  config: { name: 'ML token', position: [0, 600],
    parameters: { httpMethod: 'GET', path: 'ml-token', responseMode: 'lastNode', responseData: 'firstEntryJson',
      options: { responsePropertyName: 'dados' } } },
  output: [{ headers: {} }]
});

const entrega = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Entrega o token', position: [240, 600],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:mercadolivre*/",
"const mem = $getWorkflowStaticData('global');",
"const h = $('ML token').first().json.headers || {};",
"if (!$env.ML_SECRET || String(h['x-chave'] || '') !== chaveInterna($env.ML_SECRET)) return [{ json: { dados: { token: null, motivo: 'chave' } } }];",
"const token = tokenValido(mem, Date.now());",
"return [{ json: { dados: { token, motivo: token ? null : (mem.ml ? 'vencido' : 'sem_autorizacao') } } }];"
].join('\n') } },
  output: [{ dados: { token: null } }]
});

export default workflow('ofertas-04-mercadolivre', '[Ofertas] 04 Mercado Livre')
  .add(autorizar.to(montaLink))
  .add(retorno.to(trocaCodigo))
  .add(relogio.to(renova))
  .add(pedeToken.to(entrega));
