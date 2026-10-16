// Bateria do acesso ao Mercado Livre (fluxo 04), sem rede: o ML é simulado.
import { linkAutorizacao, novoEstado, usarEstado, chaveInterna, guardarToken, precisaRenovar,
  tokenValido, trocarCodigo, renovar, pagina } from '../../lib/mercadolivre.mjs';

let falhas = 0;
const caso = (nome, ok, extra) => { console.log(`  ${ok ? 'PASS' : 'FALHA'}  ${nome}`); if (!ok) { falhas++; if (extra !== undefined) console.log(extra); } };
const H = 3600000;

console.log('\n=== Mercado Livre (OAuth) ===');
const RET = 'https://robo.example/webhook/ml-retorno';
const l = new URL(linkAutorizacao('123', RET, 'abc'));
caso('link de autorizacao no dominio do ML com redirect e estado', l.hostname === 'auth.mercadolivre.com.br'
  && l.searchParams.get('client_id') === '123' && l.searchParams.get('redirect_uri') === RET && l.searchParams.get('state') === 'abc');

const mem = {};
const s = novoEstado(mem, 0, () => 'e1');
caso('estado vale uma vez', usarEstado(mem, s, 1000) && !usarEstado(mem, s, 2000));
novoEstado(mem, 0, () => 'e2');
caso('estado vence em 15 minutos', !usarEstado(mem, 'e2', 16 * 60000));
caso('estado inventado nao passa', !usarEstado(mem, 'qualquer', 0));

caso('chave interna depende do segredo', chaveInterna('a') !== chaveInterna('b') && /^[0-9a-f]{64}$/.test(chaveInterna('a')));

const tok = (n, u = 42) => ({ access_token: 'APP-' + n, refresh_token: 'TG-' + n, expires_in: 21600, user_id: u, scope: 'read offline_access' });
caso('guarda o token', guardarToken(mem, tok(1), 0).ok && mem.ml.token === 'APP-1' && mem.ml.usuario === '42');
caso('outra conta nao troca o acesso', !guardarToken(mem, tok(2, 99), 0).ok && mem.ml.token === 'APP-1');
caso('mesma conta renova', guardarToken(mem, tok(3), 0).ok && mem.ml.token === 'APP-3');
caso('resposta sem token nao apaga o que tem', !guardarToken(mem, { error: 'x' }, 0).ok && mem.ml.token === 'APP-3');

caso('token vale enquanto nao vence', tokenValido(mem, H) === 'APP-3' && tokenValido(mem, 6 * H) === null);
caso('renova so perto de vencer', !precisaRenovar(mem, H) && precisaRenovar(mem, 4.5 * H));

const pedidos = [];
const ml = (resp) => async (p) => { pedidos.push(p); return resp; };
const t = await trocarCodigo(ml({ status: 200, corpo: tok(4) }), { appId: '123', segredo: 's', retorno: RET, codigo: 'TG-c' });
const p0 = pedidos[0];
caso('troca o codigo no /oauth/token com o redirect', t && t.access_token === 'APP-4' && p0.url === 'https://api.mercadolibre.com/oauth/token'
  && p0.form.grant_type === 'authorization_code' && p0.form.code === 'TG-c' && p0.form.redirect_uri === RET, p0);
caso('codigo recusado: null', (await trocarCodigo(ml({ status: 400, corpo: {} }), { appId: '1', segredo: 's', retorno: RET, codigo: 'x' })) === null);

const r1 = await renovar(ml({ status: 200, corpo: tok(5) }), mem, { appId: '123', segredo: 's' }, 5 * H);
caso('renova com o refresh token e guarda o novo', r1.ok && mem.ml.token === 'APP-5' && mem.ml.refresh === 'TG-5'
  && pedidos.at(-1).form.grant_type === 'refresh_token' && pedidos.at(-1).form.refresh_token === 'TG-3');
const r2 = await renovar(ml({ status: 400, corpo: { error: 'invalid_grant' } }), mem, { appId: '123', segredo: 's' }, 5 * H);
caso('renovacao recusada guarda o erro e mantem o token', !r2.ok && mem.ml.erro.status === 400 && mem.ml.token === 'APP-5');
caso('sem autorizacao nao chama o ML', !(await renovar(ml({}), {}, {}, 0)).ok);

const html = pagina('Oi <b>', 'texto "x"', { url: 'https://a.example/?a=1&b=2', texto: 'Ir' });
caso('pagina escapa o texto', html.includes('Oi &lt;b&gt;') && html.includes('a=1&amp;b=2') && !html.includes('<b>'));

console.log(falhas ? `\n${falhas} FALHA(S)` : '\n  todos passaram');
process.exit(falhas ? 1 : 0);
