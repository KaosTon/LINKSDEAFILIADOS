import { workflow, node, trigger, ifElse, switchCase, merge, splitInBatches, nextBatch, languageModel, memory, tool, outputParser, newCredential, expr } from '@n8n/workflow-sdk';

const rodarNaMao = trigger({
  type: "n8n-nodes-base.manualTrigger",
  version: 1,
  config: { name: "Rodar na mão", position: [0, 0] }
});

const confereAInstancia = node({
  type: "n8n-nodes-base.code",
  version: 2,
  config: {
    name: "Confere a instância",
    position: [260, 0],
    parameters: {
      mode: "runOnceForAllItems",
      language: "javaScript",
      jsCode: "const PRECISA = ['ZAPI_BASE_URL', 'ZAPI_INSTANCE_ID', 'ZAPI_INSTANCE_TOKEN', 'ZAPI_CLIENT_TOKEN',\n  'GRUPO_RASCUNHO', 'GRUPO_OFERTAS', 'AUTOR_PHONE', 'AMAZON_TAG', 'SHOPEE_APP_ID', 'SHOPEE_SECRET'];\nconst r = { veredito: [] };\nlet le = null;\ntry { le = (k) => $env[k]; void le('PATH'); r.env_legivel = true; } catch (e) { r.env_legivel = false; r.env_erro = String(e.message).slice(0, 120); }\nif (le) {\n  r.presentes = PRECISA.filter(k => !!le(k));\n  r.faltando = PRECISA.filter(k => !le(k));\n  r.fuso = le('GENERIC_TIMEZONE') || null;\n  r.banco = le('DB_TYPE') || 'sqlite (padrao)';\n  r.poda = { EXECUTIONS_DATA_PRUNE: le('EXECUTIONS_DATA_PRUNE') || null, EXECUTIONS_DATA_MAX_AGE: le('EXECUTIONS_DATA_MAX_AGE') || null };\n  r.chave_de_cripto_fixa = !!le('N8N_ENCRYPTION_KEY');\n  const base = String(le('ZAPI_BASE_URL') || '');\n  if (base && (/[/]instances[/]/.test(base) || base.slice(-1) === '/')) r.veredito.push('ZAPI_BASE_URL deve ser so o host: https://api.z-api.io');\n}\ntry { const c = require('crypto'); r.crypto = c.createHash('sha256').update('x').digest('hex').length === 64; }\ncatch (e) { r.crypto = false; r.veredito.push('crypto bloqueado: falta NODE_FUNCTION_ALLOW_BUILTIN=crypto (assinatura da Shopee)'); }\nr.hora_no_n8n = new Date().toLocaleString('pt-BR', { timeZone: r.fuso || 'UTC' });\nif (!r.env_legivel) r.veredito.push('O no Code nao le $env: liberar com N8N_BLOCK_ENV_ACCESS_IN_NODE=false');\nif (r.fuso !== 'America/Sao_Paulo') r.veredito.push('GENERIC_TIMEZONE deveria ser America/Sao_Paulo');\nif (!/postgres/.test(r.banco)) r.veredito.push('Banco nao e Postgres: DB_TYPE=postgresdb');\nif (!r.chave_de_cripto_fixa) r.veredito.push('Sem N8N_ENCRYPTION_KEY: recriar o servico perde as credenciais');\nif (!r.veredito.length) r.veredito.push('Instancia pronta. Faltam so as variaveis do projeto listadas em faltando.');\nreturn [{ json: r }];"
    }
  }
});

export default workflow("ofertas-99-diagnostico-da-instancia-manu", "[Ofertas] 99 Diagnóstico da instância (manual)")
  .add(rodarNaMao.to(confereAInstancia));
