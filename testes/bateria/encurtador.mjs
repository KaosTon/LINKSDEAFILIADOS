// Bateria do encurtador: sobe o servidor numa porta livre com uma pasta temporária.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { criarServidor, lojaPermitida, novoCodigo } from '../../encurtador/servidor.mjs';

let falhas = 0;
const caso = (nome, ok, extra) => { console.log(`  ${ok ? 'PASS' : 'FALHA'}  ${nome}`); if (!ok) { falhas++; if (extra) console.log(extra); } };

const SENHA = 'x'.repeat(40);
const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'encurtador-'));
const sobe = (opcoes = {}) => new Promise((ok) => {
  const s = criarServidor({ pasta, segredo: SENHA, base: 'https://promox.example', ...opcoes });
  s.listen(0, () => ok({ s, raiz: `http://127.0.0.1:${s.address().port}` }));
});
const encurta = (raiz, url, senha = SENHA) => fetch(`${raiz}/api/encurtar`, { method: 'POST',
  headers: { Authorization: `Bearer ${senha}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });

console.log('\n=== Encurtador ===');
caso('so loja da lista', lojaPermitida('https://www.mercadolivre.com.br/p/MLB123') && lojaPermitida('https://s.shopee.com.br/abc')
  && !lojaPermitida('https://golpe.example/x') && !lojaPermitida('http://www.amazon.com.br/dp/X') && !lojaPermitida('https://amazon.com.br.golpe.example/'));
caso('codigo de 5 letras sem caractere que confunde', /^[a-km-np-z2-9]{5}$/.test(novoCodigo(() => false)));

let { s, raiz } = await sobe();
const ML = 'https://www.mercadolivre.com.br/p/MLB47889235?matt_word=minhaetiqueta&matt_tool=12345678';
const r1 = await (await encurta(raiz, ML)).json();
caso('encurta e devolve o link com o dominio', /^https:\/\/promox\.example\/[a-z2-9]{5}$/.test(r1.curto), r1);
const r2 = await (await encurta(raiz, ML)).json();
caso('mesmo link, mesmo codigo', r2.codigo === r1.codigo);
caso('senha errada: 401', (await encurta(raiz, ML, 'y'.repeat(40))).status === 401);
caso('loja fora da lista: recusa', (await encurta(raiz, 'https://golpe.example/x')).status === 400);

const ida = await fetch(`${raiz}/${r1.codigo}`, { redirect: 'manual' });
caso('abre: 302 para o link de afiliado intacto', ida.status === 302 && ida.headers.get('location') === ML, ida.headers.get('location'));
caso('codigo que nao existe: 404', (await fetch(`${raiz}/zzzzz`, { redirect: 'manual' })).status === 404);
const cl = await (await fetch(`${raiz}/api/cliques`, { headers: { Authorization: `Bearer ${SENHA}` } })).json();
caso('conta o clique', cl.top[0].codigo === r1.codigo && cl.top[0].cliques === 1, cl);
caso('cliques pede senha', (await fetch(`${raiz}/api/cliques`)).status === 401);

await new Promise((ok) => s.close(ok));
({ s, raiz } = await sobe({ convite: 'https://chat.whatsapp.com/CONVITE' }));
const volta = await fetch(`${raiz}/${r1.codigo}`, { redirect: 'manual' });
caso('reiniciou: o link continua valendo (salvo no volume)', volta.status === 302 && volta.headers.get('location') === ML);
const home = await fetch(`${raiz}/`, { redirect: 'manual' });
caso('pagina inicial leva para o convite do grupo', home.status === 302 && home.headers.get('location') === 'https://chat.whatsapp.com/CONVITE');
await new Promise((ok) => s.close(ok));
fs.rmSync(pasta, { recursive: true, force: true });

console.log(falhas ? `\n${falhas} FALHA(S)` : '\n  todos passaram');
process.exit(falhas ? 1 : 0);
