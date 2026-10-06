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
}

console.log(`\n  ${ok}/${ok + mau} PASS`);
if (mau) process.exitCode = 1;
