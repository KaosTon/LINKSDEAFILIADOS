import { workflow, node, trigger } from '@n8n/workflow-sdk';

/* INSTAGRAM, POSTS DE CONTEÚDO: dicas e datas que não vendem nada
 *
 * A cada 30 minutos, das 18h às 22h, lê a agenda publicada com o site
 * (/instagram/agenda.json, gerada por marketing/instagram/gerar.mjs) e publica
 * no feed o item marcado para hoje, uma vez. Se a Meta falhar, tenta de novo
 * nas rodadas seguintes (até 3 vezes no dia).
 *
 * Liga com a mesma variável do feed de ofertas: INSTAGRAM_FEED=sim. Item com
 * vídeo (Reel) só sai com INSTAGRAM_REEL=sim também. O texto, a imagem e o
 * vídeo vêm prontos e revisados do repositório; nada é escrito na hora.
 */
const SITE = 'https://www.temdescontos.com.br';

const relogio = trigger({
  type: 'n8n-nodes-base.scheduleTrigger', version: 1.2,
  config: { name: 'A cada 30 minutos', position: [0, 0],
    parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 30 }] } } },
  output: [{}]
});

const publica = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: { name: 'Publica o post do dia', position: [240, 0],
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: [
"/*LIB:instagram*/",
"/*LIB:instagram-agenda*/",
"const mem = $getWorkflowStaticData('global');",
"const agora = new Date();",
"// Rodado na mão no editor: mostra o que sairia hoje e não publica.",
"const teste = typeof $execution !== 'undefined' && /^(test|manual)$/.test($execution.mode);",
"if (String($env.INSTAGRAM_FEED || '').trim().toLowerCase() !== 'sim' && !teste) return [{ json: { publicou: false, motivo: 'desligado' } }];",
"if (!horaDoConteudo(agora) && !teste) return [{ json: { publicou: false, motivo: 'fora_do_horario' } }];",
"let agenda = null;",
"try { agenda = await this.helpers.httpRequest({ method: 'GET', url: '" + SITE + "/instagram/agenda.json', json: true, timeout: 20000 }); } catch (e) { agenda = null; }",
"if (typeof agenda === 'string') { try { agenda = JSON.parse(agenda); } catch (e) { agenda = null; } }",
"if (!Array.isArray(agenda)) return [{ json: { publicou: false, motivo: 'sem_agenda' } }];",
"const p = postDeHoje(agenda, agora, teste ? { feitos: mem.feitos } : mem);",
"if (!p) return [{ json: { publicou: false, motivo: 'nada_hoje', itens: agenda.length } }];",
"if (teste) return [{ json: { publicou: false, motivo: 'teste', id: p.id, midiaUrl: '" + SITE + "' + (p.video || p.imagem), reel: !!p.video, legenda: p.legenda } }];",
"// Reel só com INSTAGRAM_REEL=sim; desligado, o item fica esperando (não conta tentativa).",
"if (p.video && !reelLigado($env)) return [{ json: { publicou: false, motivo: 'reel_desligado', id: p.id } }];",
"let id = null;",
"try { id = p.video ? await publicarReel(this.helpers, $env, '" + SITE + "' + p.video, p.legenda) : await publicarNoFeed(this.helpers, $env, '" + SITE + "' + p.imagem, p.legenda); } catch (e) { id = null; }",
"anotarTentativa(mem, p.id, !!id);",
"return [{ json: { publicou: !!id, id: p.id, reel: !!p.video, midia: id, tentativa: id ? undefined : mem.tentativas.n[p.id] } }];"
].join('\n') } },
  output: [{ publicou: true, id: 'dica-arrependimento', midia: '1790' }]
});

export default workflow('ofertas-06-instagram-conteudo', '[Ofertas] 06 Instagram: posts de conteúdo')
  .add(relogio.to(publica));
