// Bateria do gateway de saída (fluxo 02), rodando o código do nó como ele vai
// para o n8n (com a lib colada). O que não pode acontecer: dizer que saiu sem
// o id da Z-API, mandar para endereço montado errado, e desistir na primeira
// falha de rede.
import { pegarCodigo, rodar } from './executar.mjs';

let ok = 0, mau = 0;
const caso = (nome, cond, extra) => {
  if (cond) { ok++; console.log(`  PASS  ${nome}`); }
  else { mau++; console.log(`  FAIL  ${nome}${extra !== undefined ? '\n        ' + JSON.stringify(extra) : ''}`); }
};
const codigo = pegarCodigo('02-gateway-saida.json', 'Envia e confere');
const ENV = { ZAPI_BASE_URL: 'https://api.z-api.io', ZAPI_INSTANCE_ID: 'I1', ZAPI_INSTANCE_TOKEN: 'T1', ZAPI_CLIENT_TOKEN: 'C1' };
const roda = (entrada, responde, env = ENV) => rodar(codigo, { itens: [{ json: {} }], env,
  nos: { 'Alguém quer enviar': [{ json: entrada }] },
  http: [{ quando: /z-api\.io/, responde }] }).then(r => ({ ...r, out: r.saida[0].json }));

{
  const r = await roda({ phone: '120363000000000002-group', message: 'Oferta', image: 'https://img/1.jpg', origem: '01' }, { zaapId: 'Z9' });
  const c = r.chamadas[0];
  caso('com foto: send-image, com a legenda', c.url === 'https://api.z-api.io/instances/I1/token/T1/send-image' && c.body.caption === 'Oferta' && c.body.image === 'https://img/1.jpg', c);
  caso('saiu: devolve o id da Z-API', r.out.ok === true && r.out.id === 'Z9');
}
{
  const r = await roda({ phone: '120363000000000001-group', message: 'Postado' }, { messageId: 'M1' });
  caso('sem foto: send-text', r.chamadas[0].url.endsWith('/send-text') && r.chamadas[0].body.message === 'Postado');
}
{
  const r = await roda({ phone: 'g', message: 'x' }, { error: 'instance not connected' });
  caso('200 com erro no corpo: NAO saiu, e diz o porque', r.out.ok === false && /not connected/.test(r.out.erro), r.out);
  caso('e tenta 3 vezes antes de desistir', r.chamadas.length === 3);
}
{
  let n = 0;
  const r = await roda({ phone: 'g', message: 'x' }, () => { if (++n === 1) throw new Error('ECONNRESET'); return { zaapId: 'Z2' }; });
  caso('rede caiu na primeira: tenta de novo e sai', r.out.ok === true && r.chamadas.length === 2);
}
{
  const r = await roda({ phone: '', message: 'x' }, { zaapId: 'Z' });
  caso('sem destino: nao chama a Z-API', r.out.ok === false && r.chamadas.length === 0);
  const s = await roda({ phone: 'g', message: 'x' }, { zaapId: 'Z' }, { ZAPI_BASE_URL: 'https://api.z-api.io' });
  caso('sem instancia/token configurados: nao chama endereco quebrado', s.out.ok === false && s.chamadas.length === 0 && /ZAPI_INSTANCE_ID/.test(s.out.erro));
}

{
  const r = await roda({ phone: 'g', message: 'Oferta https://l', image: 'https://img/1.jpg', link: 'https://l', titulo: 'Produto', origem: '03' }, { zaapId: 'Z7' });
  caso('com link e foto: manda pela previa do link (send-link)', r.chamadas[0].url.endsWith('/send-link') && r.chamadas[0].body.linkUrl === 'https://l' && r.out.ok && r.out.forma === 'send-link', r.chamadas);
  const f = await roda({ phone: 'g', message: 'Oferta https://l', image: 'https://img/1.jpg', link: 'https://l', titulo: 'Produto', origem: '03' },
    (op) => (op.url.endsWith('/send-link') ? { error: 'link preview failed' } : { zaapId: 'Z8' }));
  caso('send-link falhou: plano B na hora, send-image com a mesma legenda', f.out.ok && f.out.forma === 'send-image' && f.chamadas.length === 2 && f.chamadas[1].body.caption === 'Oferta https://l', f.chamadas.map(c => c.url));
  caso('previa grande com a foto enquadrada (1200x630, borda branca)', r.chamadas[0].body.linkType === 'LARGE'
    && r.chamadas[0].body.image === 'https://images.weserv.nl/?url=' + encodeURIComponent('https://img/1.jpg') + '&w=1200&h=630&fit=contain&cbg=white&output=jpg', r.chamadas[0].body);
  caso('plano B (foto com legenda) usa a foto original, sem enquadrar', f.chamadas[1].body.image === 'https://img/1.jpg', f.chamadas[1].body);
}

{
  // Encurtador próprio (16/10): só os links do ML; se ele falhar, vai o link normal.
  const ENVE = { ...ENV, ENCURTADOR_URL: 'https://curto.example/', ENCURTADOR_SEGREDO: 'x'.repeat(40) };
  const ML = 'https://www.mercadolivre.com.br/p/MLB123?matt_word=minha&matt_tool=1';
  const AMZ = 'https://www.amazon.com.br/dp/B0TESTE001?tag=minha-20';
  const msg = `Oferta\n🛒 ${ML}\n🔗 ${AMZ}`;
  const comEnc = (resp) => rodar(codigo, { itens: [{ json: {} }], env: ENVE,
    nos: { 'Alguém quer enviar': [{ json: { phone: 'g', message: msg, image: 'https://img/1.jpg', link: ML, titulo: 'P', origem: '03' } }] },
    http: [{ quando: /curto\.example/, responde: resp }, { quando: /z-api\.io/, responde: { zaapId: 'Z1' } }] }).then(r => ({ ...r, out: r.saida[0].json }));
  const r = await comEnc((op) => ({ codigo: 'abc23', curto: 'https://curto.example/abc23', pedido: op.body }));
  const pedidoEnc = r.chamadas.find(c => /curto\.example/.test(c.url));
  const zapi = r.chamadas.find(c => /z-api/.test(c.url));
  caso('encurta so o link do ML, com a senha, e uma vez so', r.chamadas.filter(c => /curto/.test(c.url)).length === 1 && pedidoEnc.url === 'https://curto.example/api/encurtar'
    && pedidoEnc.headers.Authorization === 'Bearer ' + 'x'.repeat(40) && pedidoEnc.body.url === ML, r.chamadas);
  caso('mensagem e previa saem com o link curto; Amazon fica direto', zapi.body.message.includes('https://curto.example/abc23') && !zapi.body.message.includes(ML)
    && zapi.body.message.includes(AMZ) && zapi.body.linkUrl === 'https://curto.example/abc23' && r.out.encurtados === 1, zapi.body);
  const caiu = await comEnc(() => { throw new Error('getaddrinfo ENOTFOUND'); });
  const z2 = caiu.chamadas.find(c => /z-api/.test(c.url));
  caso('encurtador fora do ar: sai com o link normal', caiu.out.ok && z2.body.message.includes(ML) && z2.body.linkUrl === ML && caiu.out.encurtados === 0, z2 && z2.body);
  const lixo = await comEnc({ erro: 'senha' });
  caso('encurtador respondeu sem link: sai com o link normal', lixo.out.ok && lixo.chamadas.find(c => /z-api/.test(c.url)).body.linkUrl === ML);
  const sem = await roda({ phone: 'g', message: msg, origem: '03' }, { zaapId: 'Z' });
  caso('sem ENCURTADOR_URL: nem tenta', sem.chamadas.length === 1 && sem.chamadas[0].body.message.includes(ML));
}

console.log(`\n  ${ok}/${ok + mau} PASS`);
if (mau) process.exitCode = 1;
