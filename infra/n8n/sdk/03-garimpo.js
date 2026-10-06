import { workflow, node, trigger, ifElse, expr } from '@n8n/workflow-sdk';

/* GARIMPO: o robô acha a oferta sozinho e posta (100% automático)
 *
 * A cada 35 minutos, das GARIMPO_INICIO às GARIMPO_FIM (8h às 22h em SP), até
 * GARIMPO_POR_DIA posts (25). Lê as páginas públicas dos canais do Telegram
 * (GARIMPO_CANAIS) e as ofertas da Amazon, troca o link pelo seu e posta UMA
 * oferta por vez pelo gateway (fluxo 02). Só posta com GARIMPO_LIGADO=sim:
 * publicado sem isso, ele só calcula (dá para ver na execução o que sairia).
 *
 * Link que não vira seu (ML de canal, Shopee sem API) descarta a oferta. A
 * legenda é sempre no seu padrão: nada do texto do canal vai para o grupo.
 */
const GATEWAY = '0lJeNYqZyDG9Rq2J';
const ENTRADAS = ['phone', 'message', 'image', 'origem'].map(id => ({
  id, displayName: id, required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }));

const relogio = trigger({
  type: 'n8n-nodes-base.scheduleTrigger', version: 1.2,
  config: { name: 'A cada 35 minutos', position: [0, 0],
    parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 35 }] } } },
  output: [{}]
});

const garimpa = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Garimpa', position: [240, 0],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:ofertas*/",
"const agora = new Date();",
"const mem = arrumarMemoria($getWorkflowStaticData('global'), agora);",
"const N = (k, d) => (Number($env[k]) > 0 ? Number($env[k]) : d);",
"const lista = (k, d) => String($env[k] || d).split(',').map(s => s.trim()).filter(Boolean);",
"const cfg = { amazonTag: $env.AMAZON_TAG, magaluLoja: $env.MAGALU_LOJA, mlEtiqueta: $env.ML_ETIQUETA,",
"  shopee: !!($env.SHOPEE_APP_ID && $env.SHOPEE_SECRET),",
"  inicio: N('GARIMPO_INICIO', 8), fim: N('GARIMPO_FIM', 22), porDia: N('GARIMPO_POR_DIA', 25),",
"  cuponsPorDia: N('GARIMPO_CUPONS_POR_DIA', 6), descontoMin: N('GARIMPO_DESCONTO_MIN', 15),",
"  idadeMaxMin: 120, maxTentativas: 8,",
"  canais: lista('GARIMPO_CANAIS', 'promotop,pechinchou,fadadoscupons,cupomonline'),",
"  proibido: $env.GARIMPO_PROIBIDO ? lista('GARIMPO_PROIBIDO', '') : undefined };",
"// Rodado na mão no editor ($execution.mode = 'test'): ignora horário e limite para mostrar o que sairia.",
"const teste = typeof $execution !== 'undefined' && /^(test|manual)$/.test($execution.mode);",
"const ligado = String($env.GARIMPO_LIGADO || '').trim().toLowerCase() === 'sim';",
"if (!urlDisponivel()) return [{ json: { postar: false, motivo: 'sem_url: NODE_FUNCTION_ALLOW_BUILTIN=crypto,url' } }];",
"const pode = podeAgora(mem, agora, cfg);",
"if (!pode.ok && !teste) return [{ json: { postar: false, motivo: pode.motivo, postados_hoje: mem.postados } }];",
"const rede = redeN8n(this.helpers, $env);",
"const canais = {};",
"for (const c of cfg.canais) { try { canais[c] = await rede.pagina('https://t.me/s/' + encodeURIComponent(c)); } catch (e) { canais[c] = ''; } }",
"let amazonHtml = '';",
"if (cfg.amazonTag) { try { amazonHtml = await rede.pagina('https://www.amazon.com.br/deals'); } catch (e) { amazonHtml = ''; } }",
"const r = await garimpar({ canais, amazonHtml, agora, cfg, mem, rede });",
"if (r.acao !== 'postar') return [{ json: { postar: false, motivo: r.motivo, tentou: r.tentou, postados_hoje: mem.postados } }];",
"return [{ json: { ...r, postar: ligado && !!$env.GRUPO_OFERTAS, ligado, teste, grupo: $env.GRUPO_OFERTAS || '', postados_hoje: mem.postados } }];"
].join('\n') } },
  output: [{ postar: true, tipo: 'produto', chave: 'amazon:B0X', texto: 'Oferta', imagem: '', grupo: '120363000000000002-group' }]
});

const posta = ifElse({
  version: 2.2,
  config: { name: 'Posta?', position: [480, 0], parameters: {
    conditions: { combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
      conditions: [{ leftValue: expr('{{ $json.postar }}'), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }] },
    looseTypeValidation: true, options: {} } }
});

const envia = node({
  type: 'n8n-nodes-base.executeWorkflow', version: 1.2,
  config: { name: 'Posta no grupo', position: [720, -100], parameters: {
    source: 'database',
    workflowId: { __rl: true, mode: 'id', value: GATEWAY },
    workflowInputs: { mappingMode: 'defineBelow', matchingColumns: [], schema: ENTRADAS, attemptToConvertTypes: false,
      value: { phone: expr('{{ $json.grupo }}'), message: expr('{{ $json.texto }}'), image: expr('{{ $json.imagem }}'), origem: '03-garimpo' } },
    options: { waitForSubWorkflow: true } } },
  output: [{ ok: true, id: 'Z1', origem: '03-garimpo', erro: null }]
});

const anota = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Anota', position: [960, -100],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"// Só conta e guarda o produto se o gateway confirmou o envio.",
"const r = $input.first().json || {};",
"const g = $('Garimpa').first().json || {};",
"const mem = $getWorkflowStaticData('global');",
"if (r.ok) {",
"  mem.postados = (mem.postados || 0) + 1;",
"  if (g.tipo === 'cupom') mem.cupons = (mem.cupons || 0) + 1;",
"  mem.produtos = mem.produtos || {};",
"  if (g.chave) mem.produtos[g.chave] = Date.now();",
"}",
"return [{ json: { ok: !!r.ok, erro: r.erro || null, chave: g.chave || null, fonte: g.fonte || null, postados_hoje: mem.postados || 0 } }];"
].join('\n') } },
  output: [{ ok: true }]
});

export default workflow('ofertas-03-garimpo', '[Ofertas] 03 Garimpo automático')
  .add(relogio.to(garimpa).to(posta.onTrue(envia.to(anota))));
