// Bateria da conversão para a Meta (16/11): clique em "Entrar no grupo" de quem veio de anúncio vira
// Lead na API de Conversões. O que não pode acontecer: mandar clique de quem não veio de anúncio ou
// escolheu "Apenas essenciais", aceitar pedido sem a assinatura do encurtador, mandar o mesmo clique
// duas vezes, segurar o redirecionamento para o grupo, e o token aparecer na execução.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pegarCodigo, rodar } from './executar.mjs';
import { textoAssinado as textoLib, assinarConversao, conferirConversao, jaEnviado, eventoLead, pedidoEventos, PIXEL_TD, URL_EVENTOS } from '../../lib/conversao-meta.mjs';
import { camposDoClique, textoAssinado as textoEnc, assinar, enviarConversao } from '../../encurtador/conversao.mjs';
import { criarServidor } from '../../encurtador/servidor.mjs';

let ok = 0, mau = 0;
const caso = (nome, cond, extra) => {
  if (cond) { ok++; console.log(`  PASS  ${nome}`); }
  else { mau++; console.log(`  FAIL  ${nome}${extra !== undefined ? '\n        ' + JSON.stringify(extra) : ''}`); }
};
const SENHA = 's'.repeat(40);
const FBC = 'fb.1.1794850000000.IwZXh0bgNhZW0BMABhZGlkAasdf123';
const FBP = 'fb.1.1794850000000.123456789';
const AGORA = 1794850000000;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)';
const url = (q) => new URL('https://temdescontos.com.br/grupo?' + q);
const H = { 'x-forwarded-for': '200.10.20.30, 10.0.0.1', 'user-agent': UA };

console.log('\n=== Encurtador: quais cliques vão ===');
{
  const c = camposDoClique(url(`de=anuncio:v1&ev=abcd1234efgh&fbc=${FBC}&fbp=${FBP}`), H, AGORA);
  caso('clique do anúncio com id e fbc: vai, com o 1º IP da lista e o navegador', c && c.ev === 'abcd1234efgh' && c.de === 'anuncio:v1' && c.fbc === FBC && c.fbp === FBP && c.ip === '200.10.20.30' && c.ua === UA && c.t === AGORA, c);
  caso('sem id do clique (quem escolheu "Apenas essenciais" ou link antigo): não vai', camposDoClique(url(`de=anuncio:v1&fbc=${FBC}`), H, AGORA) === null);
  caso('página comum sem ter vindo de anúncio: não vai', camposDoClique(url('de=home&ev=abcd1234efgh'), H, AGORA) === null);
  const casa = camposDoClique(url(`de=home&ev=abcd1234efgh&fbc=${FBC}`), H, AGORA);
  caso('veio de anúncio e clicou em outra página do site: vai', casa && casa.de === 'home' && casa.fbc === FBC, casa);
  const lixo = camposDoClique(url('de=anuncio&ev=abcd1234efgh&fbc=<script>&fbp=x'), { 'x-forwarded-for': 'nao-e-ip' }, AGORA);
  caso('fbc, fbp e IP fora do formato ficam de fora', lixo && !lixo.fbc && !lixo.fbp && !lixo.ip, lixo);
  caso('id e origem fora do formato: não vai', camposDoClique(url('de=anuncio&ev=AB'), H, AGORA) === null && camposDoClique(url('de=<x>&ev=abcd1234efgh'), H, AGORA) === null);
  caso('o texto assinado é o mesmo nos dois lados (encurtador e n8n)', c && textoEnc(c) === textoLib(c) && assinar(c, SENHA) === assinarConversao(c, SENHA));
}

console.log('\n=== n8n: confere e monta o evento ===');
{
  const c = camposDoClique(url(`de=anuncio:v1&ev=abcd1234efgh&fbc=${FBC}&fbp=${FBP}`), H, AGORA);
  const a = assinar(c, SENHA);
  caso('assinatura certa e no prazo: ok', conferirConversao(c, a, SENHA, AGORA + 5000).ok);
  caso('assinatura de outra senha: recusa', conferirConversao(c, assinar(c, 'outra'.repeat(8)), SENHA, AGORA).motivo === 'assinatura');
  caso('mexeram no corpo (outra origem): recusa', conferirConversao({ ...c, de: 'anuncio:v2' }, a, SENHA, AGORA).motivo === 'assinatura');
  caso('mais de 10 minutos depois: recusa (não dá para reenviar depois)', conferirConversao(c, a, SENHA, AGORA + 11 * 60000).motivo === 'fora_do_prazo');
  caso('sem senha configurada: recusa', conferirConversao(c, a, '', AGORA).motivo === 'sem_segredo');
  const mem = {};
  caso('o mesmo clique não vai duas vezes', jaEnviado(mem, 'abcd1234efgh', AGORA) === false && jaEnviado(mem, 'abcd1234efgh', AGORA + 1000) === true);
  caso('a lista de cliques enviados esquece depois de 2 dias', jaEnviado(mem, 'abcd1234efgh', AGORA + 3 * 864e5) === false);
  const e = eventoLead(c);
  caso('evento Lead de site, com o id do clique (o mesmo do pixel)', e.event_name === 'Lead' && e.action_source === 'website' && e.event_id === 'abcd1234efgh' && e.event_time === Math.floor(AGORA / 1000), e);
  caso('fbc, fbp, IP e navegador sem hash, como a Meta pede', e.user_data.fbc === FBC && e.user_data.fbp === FBP && e.user_data.client_ip_address === '200.10.20.30' && e.user_data.client_user_agent === UA, e.user_data);
  caso('página do evento: /entrar com o código do anúncio', e.event_source_url === 'https://www.temdescontos.com.br/entrar?c=v1' && e.custom_data.content_name === 'anuncio:v1', e);
  const sem = eventoLead({ ...c, fbc: '', fbp: '' });
  caso('sem fbc/fbp: os campos vazios não vão', !('fbc' in sem.user_data) && !('fbp' in sem.user_data), sem.user_data);
  const p = pedidoEventos([e], 'TOKEN', 'TEST123');
  caso('pedido no pixel da Tem Descontos (não o da Virtus), com o código de teste quando houver', p.url === URL_EVENTOS && p.url.endsWith(`/${PIXEL_TD}/events`) && p.url !== 'https://graph.facebook.com/v21.0/27148685771418614/events' && p.body.test_event_code === 'TEST123' && JSON.parse(p.body.data)[0].event_id === 'abcd1234efgh', p);
  caso('sem código de teste, o pedido não leva test_event_code', !('test_event_code' in pedidoEventos([e], 'TOKEN').body));
}

console.log('\n=== Encurtador: /grupo avisa sem segurar o redirecionamento ===');
{
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'conversao-'));
  const recebidos = [];
  const s = criarServidor({ pasta, segredo: SENHA, base: 'https://promox.example', convite: 'https://chat.whatsapp.com/CONVITE',
    conversao: (c) => { recebidos.push(c); } });
  await new Promise((r) => s.listen(0, r));
  const raiz = `http://127.0.0.1:${s.address().port}`;
  const r1 = await fetch(`${raiz}/grupo?de=anuncio:v2&ev=zz99yy88xx77&fbc=${encodeURIComponent(FBC)}`, { redirect: 'manual', headers: { 'User-Agent': UA, 'X-Forwarded-For': '200.10.20.30' } });
  await new Promise((r) => setTimeout(r, 30));
  caso('vai para o grupo do mesmo jeito (302)', r1.status === 302 && r1.headers.get('location') === 'https://chat.whatsapp.com/CONVITE');
  caso('e repassa o clique com id, fbc e IP', recebidos.length === 1 && recebidos[0].ev === 'zz99yy88xx77' && recebidos[0].fbc === FBC && recebidos[0].ip === '200.10.20.30', recebidos);
  await fetch(`${raiz}/grupo?de=anuncio:v2`, { redirect: 'manual', headers: { 'User-Agent': UA } });
  await fetch(`${raiz}/grupo?de=anuncio:v2&ev=zz99yy88xx66`, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } });
  await new Promise((r) => setTimeout(r, 30));
  caso('sem id do clique, ou robô: não repassa', recebidos.length === 1, recebidos.length);
  // 17/11: a revisão de anúncio da Meta (rede dela, User-Agent de celular comum) tocou no botão e virou Lead do v3.
  const rm = await fetch(`${raiz}/grupo?de=anuncio:v3&ev=zz99yy88xx44&fbc=${encodeURIComponent(FBC)}`, { redirect: 'manual', headers: { 'User-Agent': UA, 'X-Forwarded-For': '57.141.0.65' } });
  await fetch(`${raiz}/grupo?de=anuncio:v3&ev=zz99yy88xx33&fbc=${encodeURIComponent(FBC)}`, { redirect: 'manual', headers: { 'User-Agent': UA, 'X-Forwarded-For': '2a03:2880:f0ff:1::1' } });
  await new Promise((r) => setTimeout(r, 30));
  caso('revisão da Meta: vai ao convite, mas não vira conversão', rm.status === 302 && rm.headers.get('location') === 'https://chat.whatsapp.com/CONVITE' && recebidos.length === 1, recebidos.length);
  await fetch(`${raiz}/grupo?de=anuncio:v3&ev=zz99yy88xx22&fbc=${encodeURIComponent(FBC)}`, { redirect: 'manual', headers: { 'User-Agent': UA, 'X-Forwarded-For': '177.10.20.30' } });
  await new Promise((r) => setTimeout(r, 30));
  caso('gente pelo mesmo anúncio, de operadora comum: vira conversão', recebidos.length === 2 && recebidos[1].de === 'anuncio:v3' && recebidos[1].ev === 'zz99yy88xx22', recebidos);
  const quebra = criarServidor({ pasta, segredo: SENHA, base: 'https://promox.example', convite: 'https://chat.whatsapp.com/CONVITE',
    conversao: () => { throw new Error('n8n fora do ar'); } });
  await new Promise((r) => quebra.listen(0, r));
  const r2 = await fetch(`http://127.0.0.1:${quebra.address().port}/grupo?de=anuncio&ev=zz99yy88xx55`, { redirect: 'manual', headers: { 'User-Agent': UA } });
  caso('o aviso falhou: a pessoa vai para o grupo do mesmo jeito', r2.status === 302);
  s.close(); quebra.close();
  let pedido = null;
  const okEnvio = await enviarConversao(recebidos[0], SENHA, 'https://n8n.example/webhook/conversao-meta', async (u, o) => { pedido = { u, o }; return { ok: true }; });
  caso('envio assinado: corpo em JSON e a assinatura no cabeçalho', okEnvio && pedido.o.headers['x-assinatura'] === assinar(recebidos[0], SENHA) && JSON.parse(pedido.o.body).ev === 'zz99yy88xx77', pedido && pedido.o.headers);
  caso('n8n fora do ar: envio volta false, sem estourar', (await enviarConversao(recebidos[0], SENHA, 'https://x', async () => { throw new Error('caiu'); })) === false);
}

console.log('\n=== Fluxo 07 (nó do n8n) ===');
{
  const codigo = pegarCodigo('07-conversao-meta.json', 'Manda para a Meta');
  const c = camposDoClique(url(`de=anuncio:v1&ev=abcd1234efgh&fbc=${FBC}`), H, Date.now());
  const corpo = (assinatura) => ({ 'Encurtador avisou': [{ json: { body: c, headers: { 'x-assinatura': assinatura } } }] });
  const ENV = { ENCURTADOR_SEGREDO: SENHA, META_ACCESS_TOKEN: 'TOKEN-SECRETO' };
  const meta = { quando: new RegExp('^' + URL_EVENTOS.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '$'), metodo: 'POST', responde: { events_received: 1, fbtrace_id: 'x' } };
  const memoria = {};
  const r = await rodar(codigo, { env: ENV, http: [meta], nos: corpo(assinar(c, SENHA)), memoria });
  const out = r.saida[0].json, ch = r.chamadas[0];
  caso('assinado: manda o Lead para o pixel e conta como enviado', out.enviado === true && ch && JSON.parse(ch.op.body.data)[0].event_id === 'abcd1234efgh', out);
  caso('o token não aparece na saída da execução', !JSON.stringify(out).includes('TOKEN-SECRETO'));
  const r2 = await rodar(codigo, { env: ENV, http: [meta], nos: corpo(assinar(c, SENHA)), memoria });
  caso('mesmo clique de novo: não manda', r2.saida[0].json.motivo === 'repetido' && r2.chamadas.length === 0, r2.saida[0].json);
  const r3 = await rodar(codigo, { env: ENV, http: [meta], nos: corpo('falsa'), memoria: {} });
  caso('assinatura errada: não manda', r3.saida[0].json.motivo === 'assinatura' && r3.chamadas.length === 0, r3.saida[0].json);
  const r4 = await rodar(codigo, { env: { ...ENV, META_TESTE_EVENTOS: 'TEST999' }, http: [meta], nos: corpo(assinar(c, SENHA)), memoria: {} });
  caso('com META_TESTE_EVENTOS: vai como teste', r4.chamadas[0] && r4.chamadas[0].op.body.test_event_code === 'TEST999');
}

console.log(`\n${ok} ok, ${mau} falha(s)`);
process.exit(mau ? 1 : 0);
