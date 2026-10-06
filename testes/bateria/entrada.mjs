// Bateria do fluxo 01 (entrada), rodando o código do nó "Prepara a oferta"
// como ele vai para o n8n. O que não pode acontecer: postar link de outra
// pessoa, aceitar webhook sem o segredo, e a assinatura da Shopee ir com um
// corpo diferente do que foi assinado.
import crypto from 'node:crypto';
import { pegarCodigo, rodar } from './executar.mjs';

let ok = 0, mau = 0;
const caso = (nome, cond, extra) => {
  if (cond) { ok++; console.log(`  PASS  ${nome}`); }
  else { mau++; console.log(`  FAIL  ${nome}${extra !== undefined ? '\n        ' + JSON.stringify(extra) : ''}`); }
};
const codigo = pegarCodigo('01-entrada.json', 'Prepara a oferta');
const ENV = { GRUPO_RASCUNHO: '120363000000000001-group', GRUPO_OFERTAS: '120363000000000002-group',
  AUTOR_PHONE: '5511999990042', ZAPI_INSTANCE_ID: 'INST1', AMAZON_TAG: 'minha-20',
  SHOPEE_APP_ID: '123456', SHOPEE_SECRET: 'segredo' };
const corpo = (texto, extra) => ({ instanceId: 'INST1', phone: ENV.GRUPO_RASCUNHO, isGroup: true,
  participantPhone: ENV.AUTOR_PHONE, fromMe: false, fromApi: false, messageId: 'M' + Math.random(),
  image: { imageUrl: 'https://z/f.jpg', caption: texto }, ...extra });
const roda = (body, { env = ENV, http = [], query = {}, memoria = {}, bloquear = [] } = {}) => rodar(codigo, { env, http, memoria, bloquear,
  nos: { 'Z-API avisou': [{ json: { body, query } }] } }).then(r => ({ ...r, out: r.saida[0] && r.saida[0].json }));

{
  const r = await roda(corpo('TV https://amzn.to/abc'), { http: [
    { quando: /amzn\.to\/abc/, responde: { statusCode: 301, headers: { location: 'https://www.amazon.com.br/dp/B0X?tag=outro-20' } } }] });
  caso('Amazon curto: abre sem seguir sozinho e troca a tag', r.out.postar === true && /tag=minha-20/.test(r.out.texto) && !/outro-20/.test(r.out.texto), r.out);
  const op = r.chamadas[0].op;
  caso('abre o link curto sem deixar o n8n seguir o redirecionamento', op.disableFollowRedirect === true && op.returnFullResponse === true, op);
}
{
  const r = await roda(corpo('Fone https://shopee.com.br/produto-i.1.2?smtt=x'), { http: [
    { quando: /open-api\.affiliate\.shopee\.com\.br\/graphql/, metodo: 'POST', responde: '{"data":{"generateShortLink":{"shortLink":"https://s.shopee.com.br/MEU"}}}' }] });
  const c = r.chamadas[0];
  caso('Shopee: posta com o link curto da API', r.out.postar === true && r.out.texto.includes('https://s.shopee.com.br/MEU'), r.out);
  const m = /Timestamp=(\d+), Signature=([0-9a-f]+)/.exec(c.headers.Authorization);
  const esperado = m && crypto.createHash('sha256').update('123456' + m[1] + c.body + 'segredo').digest('hex');
  caso('assinatura feita sobre o MESMO corpo que foi enviado', !!m && m[2] === esperado && typeof c.body === 'string', c.headers);
  caso('vai sem o rastreio de quem divulgou antes', !c.body.includes('smtt'));
}
{
  const r = await roda(corpo('Fone https://shopee.com.br/x-i.1.2'), { http: [
    { quando: /shopee/, responde: { errors: [{ message: 'invalid signature' }] } }] });
  caso('Shopee recusou: nao posta, explica', r.out.postar === false && /Shopee/.test(r.out.resposta), r.out);
}
{
  const r = await roda(corpo('x https://meli.la/1'), { env: { ...ENV, WEBHOOK_SEGREDO: 'abc' } });
  caso('com WEBHOOK_SEGREDO: chamada sem ?k= nao faz nada', r.saida.length === 0);
  const s = await roda(corpo('x https://meli.la/1'), { env: { ...ENV, WEBHOOK_SEGREDO: 'abc' }, query: { k: 'abc' } });
  caso('com o segredo certo: segue', s.out && s.out.postar === true);
}
{
  const r = await roda(corpo('x https://meli.la/1', { phone: ENV.GRUPO_OFERTAS }));
  caso('mensagem do grupo de ofertas: nada sai (sem loop)', r.saida.length === 0 && r.chamadas.length === 0);
  const memoria = {};
  const b = corpo('x https://meli.la/1', { messageId: 'IGUAL' });
  const p1 = await roda(b, { memoria }), p2 = await roda(b, { memoria });
  caso('webhook repetido: uma vez so (memoria do fluxo)', p1.out.postar === true && p2.saida.length === 0);
}
{
  const r = await roda(corpo('Fone https://shopee.com.br/x-i.1.2'), { env: { ...ENV, SHOPEE_SECRET: '' } });
  caso('Shopee sem segredo: nao chama a API, pede a configuracao', r.chamadas.length === 0 && /SHOPEE_APP_ID/.test(r.out.resposta), r.out);
}
{
  const r = await roda(corpo('TV https://www.amazon.com.br/dp/B0X'), { bloquear: ['url'] });
  caso('n8n sem o modulo url: nao estoura, responde no rascunho como resolver', r.out && r.out.postar === false && /crypto,url/.test(r.out.resposta), r.out);
  const ML = { ...ENV, ML_ETIQUETA: 'minhaetiqueta' };
  const abre = (palavra) => [{ quando: /meli\.la/, responde: { statusCode: 301, headers: { location: `https://www.mercadolivre.com.br/social/x?matt_word=${palavra}&matt_tool=1` } } }];
  const meu = await roda(corpo('Chaleira https://meli.la/AAA'), { env: ML, http: abre('MinhaEtiqueta') });
  caso('ML: meli.la da sua etiqueta passa como veio', meu.out.postar === true && meu.out.texto.includes('https://meli.la/AAA'), meu.out);
  const outro = await roda(corpo('Chaleira https://meli.la/BBB'), { env: ML, http: abre('outrapessoa') });
  caso('ML: meli.la de outra pessoa e recusado', outro.out.postar === false && /etiqueta/.test(outro.out.resposta), outro.out);
  const semDestino = await roda(corpo('Chaleira https://meli.la/CCC'), { env: ML, http: [{ quando: /meli\.la/, responde: { statusCode: 200, headers: {} } }] });
  caso('ML: meli.la que nao abre e recusado (na duvida, nao posta)', semDestino.out.postar === false, semDestino.out);
  const semEtiqueta = await roda(corpo('Chaleira https://meli.la/DDD'));
  caso('ML sem ML_ETIQUETA: passa sem abrir (como antes)', semEtiqueta.out.postar === true && semEtiqueta.chamadas.length === 0);
}
{
  const env = { ...ENV, ML_ETIQUETA: 'minhaetiqueta', ML_MATT_TOOL: '12345678' };
  const r = await roda(corpo('Cadeira https://www.mercadolivre.com.br/cadeira-teste/p/MLB46220740?matt_word=outro'), { env });
  caso('rascunho: link comum do ML vira o seu (com ML_MATT_TOOL)', r.out.postar === true && r.out.texto.includes('matt_word=minhaetiqueta&matt_tool=12345678') && !r.out.texto.includes('outro'), r.out);
  const s = await roda(corpo('Cadeira https://www.mercadolivre.com.br/cadeira-teste/p/MLB46220740'));
  caso('rascunho sem ML_MATT_TOOL: continua pedindo o link do painel', s.out.postar === false && /ML_MATT_TOOL/.test(s.out.resposta), s.out);
}
{
  const como = pegarCodigo('01-entrada.json', 'Como foi');
  const a = await rodar(como, { itens: [{ json: { ok: false, erro: 'instance not connected' } }] });
  caso('Como foi: leva o erro do gateway para o rascunho', /instance not connected/.test(a.saida[0].json.resposta));
  const b = await rodar(como, { itens: [{ json: { ok: true, id: 'Z1' } }] });
  const c = await rodar(como, { itens: [{ json: {} }] });
  caso('Como foi: ok vira Postado; sem resposta diz que a Z-API nao respondeu', /Postado/.test(b.saida[0].json.resposta) && /Z-API/.test(c.saida[0].json.resposta));
}

console.log(`\n  ${ok}/${ok + mau} PASS`);
if (mau) process.exitCode = 1;
