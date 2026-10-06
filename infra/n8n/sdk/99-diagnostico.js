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
"  const base = String(le('ZAPI_BASE_URL') || '');",
"  if (base && (/[/]instances[/]/.test(base) || base.slice(-1) === '/')) r.veredito.push('ZAPI_BASE_URL deve ser so o host: https://api.z-api.io');",
"}",
"try { const c = require('crypto'); r.crypto = c.createHash('sha256').update('x').digest('hex').length === 64; }",
"catch (e) { r.crypto = false; r.veredito.push('crypto bloqueado: falta NODE_FUNCTION_ALLOW_BUILTIN=crypto (assinatura da Shopee)'); }",
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
