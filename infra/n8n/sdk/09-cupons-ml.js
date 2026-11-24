import { workflow, node, trigger, ifElse, expr } from '@n8n/workflow-sdk';

/* CUPONS DO MERCADO LIVRE: um post por dia com os melhores cupons do canal de afiliados (24/11)
 *
 * O número do robô segue o canal "Afiliados e Criadores Mercado Livre", que manda os cupons do dia (código,
 * desconto, compra mínima, validade, link). O fluxo 01 guarda esses posts no encurtador com tipo "cupom" (o garimpo
 * não lê esses). A cada 15 minutos este fluxo vê se já é hora (CUPONS_HORA, 11; minuto 30) e, uma vez por dia, posta
 * na comunidade até CUPONS_MAX (5) cupons ainda válidos, os que vencem hoje e os gerais na frente, com o link de cada
 * um trocado pelo seu (ML_ETIQUETA e ML_MATT_TOOL). Cupom que saiu nos últimos 5 dias não repete. Só posta com
 * CUPONS_LIGADO=sim; sem isso, só calcula (dá para ver na execução o que sairia). Sai pelo gateway (fluxo 02).
 */
const GATEWAY = '0lJeNYqZyDG9Rq2J';
const ENTRADAS = ['phone', 'message', 'image', 'origem', 'link', 'titulo'].map(id => ({
  id, displayName: id, required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }));

const relogio = trigger({
  type: 'n8n-nodes-base.scheduleTrigger', version: 1.2,
  config: { name: 'A cada 15 minutos', position: [0, 0],
    parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 15 }] } } },
  output: [{}]
});

const monta = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Monta os cupons', position: [240, 0],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:cupons-ml*/",
"const env = $env, agora = Date.now();",
"const mem = $getWorkflowStaticData('global');",
"const teste = typeof $execution !== 'undefined' && /^(test|manual)$/.test($execution.mode);",
"const ligado = String(env.CUPONS_LIGADO || '').trim().toLowerCase() === 'sim';",
"const hora = Number(env.CUPONS_HORA) > 0 ? Number(env.CUPONS_HORA) : 11;",
"if (!teste && !horaDosCupons(mem, agora, hora, 30)) return [{ json: { postar: false, motivo: 'fora_da_hora_ou_ja_postou' } }];",
"if (!env.ENCURTADOR_URL || !env.ENCURTADOR_SEGREDO || !env.GRUPO_OFERTAS) return [{ json: { postar: false, motivo: 'falta_variavel' } }];",
"let posts = [];",
"try { const r = await this.helpers.httpRequest({ method: 'GET', url: String(env.ENCURTADOR_URL).replace(/\\/+$/, '') + '/api/canal?tipo=cupom', json: true, timeout: 15000,",
"  headers: { Authorization: 'Bearer ' + env.ENCURTADOR_SEGREDO } }); posts = (r && r.posts) || []; } catch (e) { return [{ json: { postar: false, motivo: 'encurtador_falhou' } }]; }",
"const cupons = escolherCupons(posts, agora, mem, { max: Number(env.CUPONS_MAX) > 0 ? Number(env.CUPONS_MAX) : 5 });",
"if (!cupons.length) return [{ json: { postar: false, motivo: 'sem_cupom_novo', posts: posts.length } }];",
"// Abre o link curto (bit.ly) até o ML e põe a sua etiqueta. Link que não abre: o cupom sai sem link.",
"const abre = async (u) => {",
"  let atual = u;",
"  for (let i = 0; i < 4 && atual && !/^https:\\/\\/([a-z0-9-]+\\.)*mercadolivre\\.com\\.br\\//i.test(atual); i++) {",
"    const r = await this.helpers.httpRequest({ method: 'GET', url: atual, disableFollowRedirect: true, returnFullResponse: true, ignoreHttpStatusErrors: true, timeout: 15000 });",
"    const d = r && r.headers && (r.headers.location || r.headers.Location);",
"    if (!d) break;",
"    atual = /^https?:/i.test(d) ? d : null;",
"  }",
"  return atual;",
"};",
"const links = {};",
"for (const c of cupons) {",
"  if (!c.link) continue;",
"  let fim = null;",
"  try { fim = await abre(c.link); } catch (e) { fim = null; }",
"  c.loja = lojaDoLink(fim);",
"  const meu = fim && linkMLComEtiqueta(fim, env.ML_ETIQUETA, env.ML_MATT_TOOL);",
"  if (meu) links[c.codigo] = meu;",
"}",
"const texto = textoCupons(cupons, agora, links);",
"return [{ json: { postar: ligado && !teste, teste, ligado, grupo: env.GRUPO_OFERTAS, texto, codigos: cupons.map(c => c.codigo), semLink: cupons.filter(c => !links[c.codigo]).map(c => c.codigo) } }];"
].join('\n') } },
  output: [{ postar: true, grupo: '120363000000000002-group', texto: 'Cupons', codigos: ['TESTE'] }]
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
      value: { phone: expr('{{ $json.grupo }}'), message: expr('{{ $json.texto }}'), image: '', origem: '09-cupons', link: '', titulo: '' } },
    options: { waitForSubWorkflow: true } } },
  output: [{ ok: true, id: 'Z1', origem: '09-cupons', erro: null }]
});

const anota = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Anota', position: [960, -100],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:cupons-ml*/",
"// Só marca o dia e os códigos se o gateway confirmou o envio; se falhou, tenta de novo na próxima rodada.",
"const r = $input.first().json || {};",
"const m = $('Monta os cupons').first().json || {};",
"if (r.ok) anotarCupons($getWorkflowStaticData('global'), m.codigos || [], Date.now());",
"return [{ json: { ok: !!r.ok, erro: r.erro || null, codigos: m.codigos || [] } }];"
].join('\n') } },
  output: [{ ok: true }]
});

export default workflow('ofertas-09-cupons-ml', '[Ofertas] 09 Cupons do Mercado Livre (um post por dia)')
  .add(relogio.to(monta).to(posta.onTrue(envia.to(anota))));
