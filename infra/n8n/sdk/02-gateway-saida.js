import { workflow, node, trigger } from '@n8n/workflow-sdk';

/* GATEWAY DE SAÍDA: o único lugar que manda mensagem pela Z-API
 *
 * Os outros fluxos chamam este (Execute Workflow) com phone, message e, se
 * tiver, image. Ele monta o pedido (send-image com legenda, ou send-text),
 * tenta até 3 vezes, e só diz que saiu quando a Z-API devolve o id: ela
 * responde 200 com erro no corpo (lição do NetMax).
 *
 * É sub-fluxo, não webhook, de propósito: um webhook público que manda
 * mensagem no grupo seria uma porta aberta para qualquer um que achasse a URL.
 */
const chamada = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger', version: 1.2,
  config: { name: 'Alguém quer enviar', position: [0, 0],
    parameters: { inputSource: 'workflowInputs', workflowInputs: { values: [
      { name: 'phone', type: 'string' }, { name: 'message', type: 'string' },
      { name: 'image', type: 'string' }, { name: 'origem', type: 'string' },
      { name: 'link', type: 'string' }, { name: 'titulo', type: 'string' } ] } } },
  output: [{ phone: '120363000000000001-group', message: 'oi', image: '', origem: 'teste', link: '', titulo: '' }]
});

const envia = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Envia e confere', position: [260, 0],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:ofertas*/",
"const e = $('Alguém quer enviar').first().json || {};",
"const phone = String(e.phone || '').trim();",
"const origem = String(e.origem || 'desconhecida');",
"if (!phone) return [{ json: { ok: false, origem, erro: 'sem destino (phone)' } }];",
"const cfg = { base: $env.ZAPI_BASE_URL, instancia: $env.ZAPI_INSTANCE_ID, token: $env.ZAPI_INSTANCE_TOKEN };",
"const msg = { phone, message: String(e.message || ''), image: String(e.image || '') || null, link: String(e.link || '') || null, titulo: String(e.titulo || '') };",
"let pedido;",
"try { pedido = pedidoZapi(msg, cfg); } catch (x) { return [{ json: { ok: false, origem, erro: x.message } }]; }",
"const H = { 'client-token': $env.ZAPI_CLIENT_TOKEN || '', 'Content-Type': 'application/json' };",
"const dorme = (ms) => new Promise(r => setTimeout(r, ms));",
"let id = null, erro = null, forma = pedido.url.split('/').pop();",
"for (let t = 1; t <= 3 && !id; t++) {",
"  try {",
"    const r = await this.helpers.httpRequest({ method: 'POST', url: pedido.url, headers: H, body: pedido.body, json: true, timeout: 20000 });",
"    id = idDoEnvio(r);",
"    if (!id) erro = JSON.stringify(r).slice(0, 200);",
"  } catch (x) { erro = String(x.message || x).slice(0, 200); }",
"  // Plano B: se a prévia do link (send-link) não saiu, manda como foto com legenda.",
"  if (!id && forma === 'send-link') { pedido = pedidoZapi({ ...msg, forma: 'imagem' }, cfg); forma = 'send-image'; continue; }",
"  if (!id && t < 3) await dorme(3000);",
"}",
"return [{ json: { ok: !!id, id, origem, forma, erro: id ? null : erro } }];"
].join('\n') } },
  output: [{ ok: true, id: 'Z1', origem: 'teste', erro: null }]
});

export default workflow('ofertas-02-gateway-saida', '[Ofertas] 02 Gateway de saída (Z-API)')
  .add(chamada.to(envia));
