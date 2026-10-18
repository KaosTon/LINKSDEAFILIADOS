import { workflow, node, trigger, ifElse, expr } from '@n8n/workflow-sdk';

/* GARIMPO: o robô acha a oferta sozinho e posta (100% automático)
 *
 * O relógio bate a cada 5 minutos; quem decide se é hora é o ritmo: de dia
 * (GARIMPO_INICIO às GARIMPO_FIM, 8h às 22h) um post a cada
 * GARIMPO_INTERVALO_DIA minutos (8), de madrugada um a cada
 * GARIMPO_INTERVALO_NOITE (150), até GARIMPO_POR_DIA (110). A cada 3 posts, 1
 * vem da lista oficial da Shopee (desconto de GARIMPO_DESCONTO_SHOPEE, 30%,
 * para cima; entre esses, a maior comissão). Lê as páginas públicas dos canais do Telegram
 * (GARIMPO_CANAIS) e as ofertas da Amazon, troca o link pelo seu e posta UMA
 * oferta por vez pelo gateway (fluxo 02). Eletrônico ganha a vez a cada
 * GARIMPO_ELETRONICO_A_CADA posts (2; 0 desliga): nessa vez ele é tentado
 * primeiro. Às GARIMPO_CONVITE_HORA (19h) pede no grupo para compartilhar; às
 * GARIMPO_STATUS_HORA (12h) manda a melhor oferta do dia no rascunho, para o
 * status (0 desliga cada um). Só posta com GARIMPO_LIGADO=sim: publicado sem isso, ele só
 * calcula (dá para ver na execução o que sairia).
 *
 * Link que não vira seu (ML de canal, Shopee sem API) descarta a oferta. A
 * legenda é sempre no seu padrão: nada do texto do canal vai para o grupo.
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

const garimpa = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Garimpa', position: [240, 0],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:ofertas*/",
"const agora = new Date();",
"const mem = arrumarMemoria($getWorkflowStaticData('global'), agora);",
"const N = (k, d) => (Number($env[k]) > 0 ? Number($env[k]) : d);",
"const N0 = (k, d) => (String($env[k] || '').trim() === '0' ? 0 : N(k, d));   // 0 desliga",

"const lista = (k, d) => String($env[k] || d).split(',').map(s => s.trim()).filter(Boolean);",
"const cfg = { amazonTag: $env.AMAZON_TAG, magaluLoja: $env.MAGALU_LOJA, mlEtiqueta: $env.ML_ETIQUETA, mlTool: $env.ML_MATT_TOOL,",
"  shopee: !!($env.SHOPEE_APP_ID && $env.SHOPEE_SECRET),",
"  inicio: N('GARIMPO_INICIO', 8), fim: N('GARIMPO_FIM', 22), porDia: N('GARIMPO_POR_DIA', 30),",
"  intervaloDia: N('GARIMPO_INTERVALO_DIA', 25), intervaloNoite: N('GARIMPO_INTERVALO_NOITE', 150), descontoShopee: N('GARIMPO_DESCONTO_SHOPEE', 30),",
"  cuponsPorDia: N('GARIMPO_CUPONS_POR_DIA', 6), descontoMin: N('GARIMPO_DESCONTO_MIN', 15), idadeSemConferirMin: N('GARIMPO_IDADE_SEM_CONFERIR', 30),",
"  idadeMaxMin: 120, maxTentativas: 8, eletronicoACada: N0('GARIMPO_ELETRONICO_A_CADA', 2),",
"  conviteHora: N0('GARIMPO_CONVITE_HORA', 19), statusHora: N0('GARIMPO_STATUS_HORA', 12),",
"  // Loja confiável na Shopee (18/10): nota e vendas mínimas do produto; caro só em loja oficial ou indicada.",
"  notaMinShopee: N('GARIMPO_SHOPEE_NOTA_MIN', 4.5), vendasMinShopee: N0('GARIMPO_SHOPEE_VENDAS_MIN', 50), caroShopee: N('GARIMPO_SHOPEE_CARO', 1000),",
"  canais: lista('GARIMPO_CANAIS', 'promotop,pechinchou,fadadoscupons,cupomonline'),",
"  proibido: $env.GARIMPO_PROIBIDO ? lista('GARIMPO_PROIBIDO', '') : undefined };",
"// Rodado na mão no editor ($execution.mode = 'test'): ignora horário e limite para mostrar o que sairia.",
"const teste = typeof $execution !== 'undefined' && /^(test|manual)$/.test($execution.mode);",
"const ligado = String($env.GARIMPO_LIGADO || '').trim().toLowerCase() === 'sim';",
"if (!urlDisponivel()) return [{ json: { postar: false, motivo: 'sem_url: NODE_FUNCTION_ALLOW_BUILTIN=crypto,url' } }];",
"// 22h: o resumo do dia vai para o rascunho (uma vez por dia), pelo mesmo caminho do post.",
"const rede = redeN8n(this.helpers, $env);",
"if ($env.GRUPO_RASCUNHO && !teste && horaDoResumo(mem, agora, cfg)) {",
"  // Membros, cliques e vendas da Shopee entram no resumo (17/10); o que falhar fica de fora.",
"  const painel = guardarPainel(mem, agora, await coletarPainel(rede, listaDeGrupos($env.GRUPO_OFERTAS), agora));",
"  return [{ json: { postar: ligado, tipo: 'resumo', dia: diaSP(agora), grupo: $env.GRUPO_RASCUNHO, texto: textoResumo(mem, agora, painel), imagem: '', link: '', titulo: '', teste: false } }];",
"}",
"// 19h: convite para compartilhar o grupo; 12h: a melhor oferta do dia no rascunho, para o status.",
"const linkGrupo = String($env.GRUPO_LINK || 'https://temdescontos.com.br/grupo').trim().replace(/\\/+$/, '');",
"if ($env.GRUPO_OFERTAS && !teste && horaDoConvite(mem, agora, cfg))",
"  return [{ json: { postar: ligado, tipo: 'convite', dia: diaSP(agora), grupo: $env.GRUPO_OFERTAS, texto: textoConvite(linkGrupo), imagem: '', link: '', titulo: '', teste: false } }];",
"if ($env.GRUPO_RASCUNHO && !teste && horaDoStatus(mem, agora, cfg))",
"  return [{ json: { postar: ligado, tipo: 'status', dia: diaSP(agora), grupo: $env.GRUPO_RASCUNHO, texto: textoStatus(mem.melhorDoDia, linkGrupo), imagem: mem.melhorDoDia.imagem, link: '', titulo: '', teste: false } }];",
"const pode = podeAgora(mem, agora, cfg);",
"if (!pode.ok && !teste) return [{ json: { postar: false, motivo: pode.motivo, postados_hoje: mem.postados } }];",
"const canais = {};",
"for (const c of cfg.canais) { try { canais[c] = await rede.pagina('https://t.me/s/' + encodeURIComponent(c)); } catch (e) { canais[c] = ''; } }",
"let amazonHtml = '';",
"if (cfg.amazonTag) { try { amazonHtml = await rede.pagina('https://www.amazon.com.br/deals'); } catch (e) { amazonHtml = ''; } }",
"let shopee = [];",
"if (cfg.shopee) { try { shopee = await rede.shopeeOfertas(); } catch (e) { shopee = []; } }",
"const r = await garimpar({ canais, amazonHtml, shopee, agora, cfg, mem, rede });",
"if (r.acao !== 'postar') return [{ json: { postar: false, motivo: r.motivo, tentou: r.tentou, postados_hoje: mem.postados } }];",
"return [{ json: { ...r, postar: ligado && !!$env.GRUPO_OFERTAS, ligado, teste, grupo: $env.GRUPO_OFERTAS || '', postados_hoje: mem.postados, parecido: primeiraPalavra(r.titulo || ''), eletronico: ehEletronico(r.titulo || '') } }];"
].join('\n') } },
  output: [{ postar: true, tipo: 'produto', chave: 'amazon:B0X', texto: 'Oferta', imagem: '', grupo: '120363000000000002-group' }]
});

const posta = ifElse({
  version: 2.2,
  config: { name: 'Posta?', position: [480, 0], parameters: {
    conditions: { combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
      // Rodada de teste (na mão) não posta: ela não grava a memória e repetiria
      // o produto na rodada automática seguinte (13/10, Pampers duas vezes).
      conditions: [{ leftValue: expr('{{ $json.postar }}'), rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } },
        { leftValue: expr('{{ $json.teste === true }}'), rightValue: false, operator: { type: 'boolean', operation: 'false', singleValue: true } }] },
    looseTypeValidation: true, options: {} } }
});

const envia = node({
  type: 'n8n-nodes-base.executeWorkflow', version: 1.2,
  config: { name: 'Posta no grupo', position: [720, -100], parameters: {
    source: 'database',
    workflowId: { __rl: true, mode: 'id', value: GATEWAY },
    workflowInputs: { mappingMode: 'defineBelow', matchingColumns: [], schema: ENTRADAS, attemptToConvertTypes: false,
      value: { phone: expr('{{ $json.grupo }}'), message: expr('{{ $json.texto }}'), image: expr('{{ $json.imagem }}'), origem: '03-garimpo',
        link: expr('{{ $json.link }}'), titulo: expr('{{ $json.titulo }}') } },
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
"if (r.ok && ['resumo', 'convite', 'status'].includes(g.tipo)) {",
"  mem[g.tipo + 'Dia'] = g.dia;",
"  return [{ json: { ok: true, [g.tipo]: true } }];",
"}",
"if (r.ok) {",
"  mem.postados = (mem.postados || 0) + 1;",
"  mem.resumo = mem.resumo || { lojas: {}, descartes: {} };",
"  const loja = String(g.chave || '').split(':')[0] || 'outra';",
"  mem.resumo.lojas[loja] = (mem.resumo.lojas[loja] || 0) + 1;",
"  mem.ultimo = Date.now();",
"  if (g.tipo === 'cupom') mem.cupons = (mem.cupons || 0) + 1;",
"  mem.produtos = mem.produtos || {};",
"  if (g.chave) mem.produtos[g.chave] = Date.now();",
"  if (g.parecido) mem.recentes = [...(mem.recentes || []), g.parecido].slice(-6);",
"  // Nome de cada link, para o resumo mostrar as ofertas mais clicadas pelo nome.",
"  if (g.link && g.titulo) mem.titulos = Object.fromEntries([...Object.entries(mem.titulos || {}).filter(([k]) => k !== g.link), [g.link, String(g.titulo).slice(0, 60)]].slice(-300));",
"  // Vez do eletrônico (GARIMPO_ELETRONICO_A_CADA): posts seguidos sem eletrônico.",
"  if (g.tipo !== 'cupom') mem.semEletronico = g.eletronico ? 0 : (mem.semEletronico || 0) + 1;",
"  // Melhor oferta do dia (maior % OFF da legenda), para a sugestão de status das 12h.",
"  if (g.tipo === 'produto' && g.imagem && g.texto) {",
"    const off = Number((String(g.texto).match(/(\\d{1,2})% OFF/) || [])[1]) || 0;",
"    const m = mem.melhorDoDia && mem.melhorDoDia.dia === mem.dia ? mem.melhorDoDia : null;",
"    if (!m || off > m.desconto) mem.melhorDoDia = { dia: mem.dia, desconto: off, texto: g.texto, imagem: g.imagem };",
"  }",
"}",
"return [{ json: { ok: !!r.ok, erro: r.erro || null, chave: g.chave || null, fonte: g.fonte || null, postados_hoje: mem.postados || 0 } }];"
].join('\n') } },
  output: [{ ok: true }]
});

export default workflow('ofertas-03-garimpo', '[Ofertas] 03 Garimpo automático')
  .add(relogio.to(garimpa).to(posta.onTrue(envia.to(anota))));
