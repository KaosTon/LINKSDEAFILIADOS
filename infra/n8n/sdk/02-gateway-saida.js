import { workflow, node, trigger } from '@n8n/workflow-sdk';

/* GATEWAY DE SAÍDA: o único lugar que manda mensagem pela Z-API
 *
 * Os outros fluxos chamam este (Execute Workflow) com phone, message e, se
 * tiver, image. phone pode ter vários grupos separados por vírgula (17/10): a
 * mesma mensagem vai para cada um, com GRUPOS_INTERVALO_SEG (15) de espera
 * variada entre eles, e "ok" quer dizer que saiu em pelo menos um. Ele monta o pedido (send-image com legenda, ou send-text),
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
"const grupos = listaDeGrupos(e.phone);",
"const origem = String(e.origem || 'desconhecida');",
"if (!grupos.length) return [{ json: { ok: false, origem, erro: 'sem destino (phone)' } }];",
"const cfg = { base: $env.ZAPI_BASE_URL, instancia: $env.ZAPI_INSTANCE_ID, token: $env.ZAPI_INSTANCE_TOKEN };",
"const msg = { phone: grupos[0], message: String(e.message || ''), image: String(e.image || '') || null, link: String(e.link || '') || null, titulo: String(e.titulo || '') };",
"// Links do ML pelo encurtador próprio (ENCURTADOR_URL), uma vez só para todos os grupos. Falhou, vai o link normal.",
"let final = msg;",
"if ($env.ENCURTADOR_URL && $env.ENCURTADOR_SEGREDO) {",
"  const encurtar = async (url) => {",
"    const r = await this.helpers.httpRequest({ method: 'POST', url: String($env.ENCURTADOR_URL).replace(/\\/+$/, '') + '/api/encurtar', json: true, timeout: 8000,",
"      headers: { Authorization: 'Bearer ' + $env.ENCURTADOR_SEGREDO, 'Content-Type': 'application/json' }, body: { url } });",
"    return r && r.curto;",
"  };",
"  final = await encurtarLinks(msg, encurtar);",
"}",
"try { pedidoZapi(final, cfg); } catch (x) { return [{ json: { ok: false, origem, erro: x.message } }]; }",
"const H = { 'client-token': $env.ZAPI_CLIENT_TOKEN || '', 'Content-Type': 'application/json' };",
"const dorme = (ms) => new Promise(r => setTimeout(r, ms));",
"const enviaPara = async (phone) => {",
"  let pedido = pedidoZapi({ ...final, phone }, cfg);",
"  let id = null, erro = null, forma = pedido.url.split('/').pop();",
"  for (let t = 1; t <= 3 && !id; t++) {",
"    try {",
"      const r = await this.helpers.httpRequest({ method: 'POST', url: pedido.url, headers: H, body: pedido.body, json: true, timeout: 20000 });",
"      id = idDoEnvio(r);",
"      if (!id) erro = JSON.stringify(r).slice(0, 200);",
"    } catch (x) { erro = String(x.message || x).slice(0, 200); }",
"    // Plano B: se a prévia do link (send-link) não saiu, manda como foto com legenda.",
"    if (!id && forma === 'send-link') { pedido = pedidoZapi({ ...final, phone, forma: 'imagem' }, cfg); forma = 'send-image'; continue; }",
"    if (!id && t < 3) await dorme(3000);",
"  }",
"  return { grupo: phone, ok: !!id, id, forma, erro: id ? null : erro };",
"};",
"const intervalo = Number($env.GRUPOS_INTERVALO_SEG ?? 15);",
"const res = [];",
"for (let i = 0; i < grupos.length; i++) {",
"  if (i) await dorme(pausaEntreGrupos(grupos.length, intervalo));",
"  res.push(await enviaPara(grupos[i]));",
"}",
"const primeiro = res.find(x => x.ok) || res[0];",
"return [{ json: { ok: res.some(x => x.ok), id: primeiro.id, origem, forma: primeiro.forma, encurtados: final.encurtados || 0,",
"  erro: res.every(x => x.ok) ? null : res.filter(x => !x.ok).map(x => x.erro).join(' | '), grupos: grupos.length > 1 ? res : undefined } }];"
].join('\n') } },
  output: [{ ok: true, id: 'Z1', origem: 'teste', erro: null }]
});

export default workflow('ofertas-02-gateway-saida', '[Ofertas] 02 Gateway de saída (Z-API)')
  .add(chamada.to(envia));
