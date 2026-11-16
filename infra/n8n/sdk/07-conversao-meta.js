import { workflow, node, trigger } from '@n8n/workflow-sdk';

/* CONVERSÃO META: clique em "Entrar no grupo" de quem veio de anúncio vira Lead (16/11)
 *
 * Os anúncios otimizavam por visualização da página e traziam clique barato que não entrava no
 * grupo. Com o Lead chegando pela API de Conversões, a campanha pode otimizar por quem clica em
 * "Entrar". O encurtador (temdescontos.com.br/grupo) assina o clique e manda para este webhook;
 * aqui a assinatura é conferida (ENCURTADOR_SEGREDO, a mesma senha do encurtador) e o evento vai
 * para o pixel "Tem Descontos - site" com o META_ACCESS_TOKEN, que só o n8n tem.
 *
 * Mesmo clique não vai duas vezes (id do clique guardado 2 dias). META_TESTE_EVENTOS (opcional):
 * o código de "Testar eventos" do Gerenciador de Eventos, para conferir sem contar.
 */
const recebe = trigger({
  type: 'n8n-nodes-base.webhook', version: 2.1,
  config: { name: 'Encurtador avisou', position: [0, 0],
    parameters: { httpMethod: 'POST', path: 'conversao-meta', responseMode: 'onReceived', options: {} } },
  output: [{ body: { ev: 'abc12345', t: 1794850000000, de: 'anuncio:v1', fbc: '', fbp: '', ip: '200.1.2.3', ua: 'Mozilla' }, headers: { 'x-assinatura': 'x' } }]
});

const manda = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Manda para a Meta', position: [240, 0],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:conversao-meta*/",
"const w = $('Encurtador avisou').first().json || {};",
"const c = w.body || {};",
"const v = conferirConversao(c, (w.headers || {})['x-assinatura'], $env.ENCURTADOR_SEGREDO);",
"if (!v.ok) return [{ json: { enviado: false, motivo: v.motivo } }];",
"const mem = $getWorkflowStaticData('global');",
"if (jaEnviado(mem, c.ev)) return [{ json: { enviado: false, motivo: 'repetido' } }];",
"const tok = $env.META_ACCESS_TOKEN;",
"if (!tok) return [{ json: { enviado: false, motivo: 'sem_token' } }];",
"const r = await this.helpers.httpRequest(pedidoEventos([eventoLead(c)], tok, $env.META_TESTE_EVENTOS || ''));",
"// Nunca devolve o token na execução.",
"return [{ json: JSON.parse(JSON.stringify({ enviado: !!(r && r.events_received), de: c.de, comFbc: !!c.fbc, resposta: r }).split(tok).join('***')) }];"
].join('\n') } },
  output: [{ enviado: true, de: 'anuncio:v1', comFbc: true }]
});

export default workflow('ofertas-07-conversao-meta', '[Ofertas] 07 Conversão Meta (clique no grupo vira Lead)')
  .add(recebe.to(manda));
