import { workflow, node, trigger } from '@n8n/workflow-sdk';

/* DIAGNÓSTICO DA INSTÂNCIA (rodar na mão)
 *
 * Antes do primeiro fluxo de verdade: o nó Code lê variável ($env)? O fuso
 * está certo? O crypto (assinatura da Shopee) está liberado? Quais das
 * variáveis do projeto já existem? Mostra só os NOMES das variáveis, nunca
 * os valores (exceto fuso e tipo de banco, que não são segredo).
 */
const inicio = trigger({ type: 'n8n-nodes-base.manualTrigger', version: 1,
  config: { name: 'Rodar na mão', position: [0, 0], parameters: {} }, output: [{}] });

const confere = node({ type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Confere a instância', position: [260, 0], parameters: {
    mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"const PRECISA = ['ZAPI_BASE_URL', 'ZAPI_INSTANCE_ID', 'ZAPI_INSTANCE_TOKEN', 'ZAPI_CLIENT_TOKEN',",
"  'GRUPO_RASCUNHO', 'GRUPO_OFERTAS', 'AUTOR_PHONE', 'AMAZON_TAG', 'SHOPEE_APP_ID', 'SHOPEE_SECRET'];",
"const r = { veredito: [] };",
"let le = null;",
"try { le = (k) => $env[k]; void le('PATH'); r.env_legivel = true; } catch (e) { r.env_legivel = false; r.env_erro = String(e.message).slice(0, 120); }",
"if (le) {",
"  r.presentes = PRECISA.filter(k => !!le(k));",
"  r.faltando = PRECISA.filter(k => !le(k));",
"  r.fuso = le('GENERIC_TIMEZONE') || null;",
"  r.banco = le('DB_TYPE') || 'sqlite (padrao)';",
"  r.poda = { EXECUTIONS_DATA_PRUNE: le('EXECUTIONS_DATA_PRUNE') || null, EXECUTIONS_DATA_MAX_AGE: le('EXECUTIONS_DATA_MAX_AGE') || null };",
"  r.chave_de_cripto_fixa = !!le('N8N_ENCRYPTION_KEY');",
"  // Valores que não são segredo, para conferir de olho (o que o assistente do Railway escreveu, por exemplo).",
"  const ABERTAS = ['ZAPI_BASE_URL', 'AMAZON_TAG', 'MAGALU_LOJA', 'ML_ETIQUETA', 'ML_MATT_TOOL', 'AUTOR_PHONE', 'GRUPO_RASCUNHO', 'GRUPO_OFERTAS',",
"    'GARIMPO_LIGADO', 'GARIMPO_POR_DIA', 'GARIMPO_INICIO', 'GARIMPO_FIM', 'GARIMPO_CUPONS_POR_DIA', 'GARIMPO_DESCONTO_MIN', 'GARIMPO_CANAIS', 'GARIMPO_PROIBIDO', 'OPENROUTER_MODELO'];",
"  r.valores = Object.fromEntries(ABERTAS.map(k => [k, le(k) === undefined ? '(nao existe)' : (le(k) === '' ? '(vazia)' : le(k))]));",
"  // Segredo: só diz se está preenchido e o tamanho, nunca o valor.",
"  const SEGREDOS = ['ZAPI_INSTANCE_ID', 'ZAPI_INSTANCE_TOKEN', 'ZAPI_CLIENT_TOKEN', 'OPENROUTER_API_KEY', 'WEBHOOK_SEGREDO', 'SHOPEE_APP_ID', 'SHOPEE_SECRET'];",
"  r.segredos = Object.fromEntries(SEGREDOS.map(k => [k, le(k) ? `preenchido (${String(le(k)).length} caracteres)` : (le(k) === '' ? '(vazia)' : '(nao existe)')]));",
"  const canais = String(le('GARIMPO_CANAIS') || '');",
"  if (/[@\\/]|t\\.me/.test(canais)) r.veredito.push('GARIMPO_CANAIS: so os nomes separados por virgula, sem @ e sem t.me (ex.: promotop,pechinchou)');",
"  for (const k of ['GARIMPO_POR_DIA', 'GARIMPO_INICIO', 'GARIMPO_FIM', 'GARIMPO_CUPONS_POR_DIA', 'GARIMPO_DESCONTO_MIN'])",
"    if (le(k) && !(Number(le(k)) > 0)) r.veredito.push(k + ' tem que ser numero (esta \"' + le(k) + '\")');",
"  const base = String(le('ZAPI_BASE_URL') || '');",
"  if (base && (/[/]instances[/]/.test(base) || base.slice(-1) === '/')) r.veredito.push('ZAPI_BASE_URL deve ser so o host: https://api.z-api.io');",
"}",
"try { const c = require('crypto'); r.crypto = c.createHash('sha256').update('x').digest('hex').length === 64; }",
"catch (e) { r.crypto = false; r.veredito.push('crypto bloqueado: falta NODE_FUNCTION_ALLOW_BUILTIN=crypto (assinatura da Shopee)'); }",
"try { const U = require('url').URL; r.url = new U('https://a.com/x?y=1').searchParams.get('y') === '1'; }",
"catch (e) { r.url = false; r.veredito.push('url bloqueado: NODE_FUNCTION_ALLOW_BUILTIN tem que ser crypto,url (sem ele o fluxo 01 nao le link nenhum)'); }",
"r.hora_no_n8n = new Date().toLocaleString('pt-BR', { timeZone: r.fuso || 'UTC' });",
"if (!r.env_legivel) r.veredito.push('O no Code nao le $env: liberar com N8N_BLOCK_ENV_ACCESS_IN_NODE=false');",
"if (r.fuso !== 'America/Sao_Paulo') r.veredito.push('GENERIC_TIMEZONE deveria ser America/Sao_Paulo');",
"if (!/postgres/.test(r.banco)) r.veredito.push('Banco nao e Postgres: DB_TYPE=postgresdb');",
"if (!r.chave_de_cripto_fixa) r.veredito.push('Sem N8N_ENCRYPTION_KEY: recriar o servico perde as credenciais');",
"if (!r.veredito.length) r.veredito.push('Instancia pronta. Faltam so as variaveis do projeto listadas em faltando.');",
"return [{ json: r }];"
].join('\n') } },
  output: [{ veredito: [] }] });

export default workflow('ofertas-99-diagnostico', '[Ofertas] 99 Diagnóstico da instância (manual)')
  .add(inicio.to(confere));
