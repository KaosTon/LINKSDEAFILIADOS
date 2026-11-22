// Bateria do vigia da Z-API (fluxo 08): quando avisar, quando calar, quando dizer que voltou.
import { decidirVigia, lerStatusZapi, avisoDoVencimento, pedidoNtfy, duracao } from '../../lib/vigia-zapi.mjs';

let ok = 0, mau = 0;
const caso = (nome, cond, extra) => {
  if (cond) { ok++; console.log(`  PASS  ${nome}`); }
  else { mau++; console.log(`  FAIL  ${nome}${extra !== undefined ? '\n        ' + JSON.stringify(extra) : ''}`); }
};
const T = (iso) => Date.parse(iso);
const DEZ = 10 * 60e3;
const CAIU = T('2026-11-21T21:02:00Z');   // 18h02 em SP

console.log('\n=== Leitura do /status ===');
caso('conectado, desconectado e torto', lerStatusZapi({ connected: true }) === true && lerStatusZapi({ connected: false, error: 'You are not connected.' }) === false
  && lerStatusZapi({ erro: 'timeout' }) === null && lerStatusZapi(null) === null && lerStatusZapi({}) === null);
caso('duracao em min e h', duracao(25 * 60e3) === '25 min' && duracao(125 * 60e3) === '2 h 5 min' && duracao(120 * 60e3) === '2 h');

console.log('\n=== Caiu ===');
{
  const mem = {};
  const a = decidirVigia(mem, false, CAIU, {});
  caso('1a conferencia desconectado: ainda nao avisa (pode ser piscada)', !a.push && mem.caiuEm === CAIU, a);
  const b = decidirVigia(mem, false, CAIU + DEZ, {});
  caso('2a seguida: avisa com a hora da queda e como reconectar', b.push && b.push.prioridade === 5 && /18:02/.test(b.push.texto) && /QR code/.test(b.push.texto) && !b.rascunho, b);
  const c = decidirVigia(mem, false, CAIU + 2 * DEZ, {});
  caso('continua fora: nao repete antes de 3h', !c.push);
  const d = decidirVigia(mem, false, CAIU + DEZ + 180 * 60e3, {});
  caso('3h depois do aviso: repete', d.push && /fora há 3 h 10 min/.test(d.push.texto), d.push);
  const e = decidirVigia(mem, true, CAIU + 20 * 60 * 60e3, {});
  caso('voltou: push e aviso no rascunho com o tempo fora', e.push && /voltou/.test(e.push.texto) && /20 h/.test(e.push.texto) && /mande de novo/.test(e.rascunho) && mem.caiuEm === null && mem.avisadoEm === null, e);
  const f = decidirVigia(mem, true, CAIU + 21 * 60 * 60e3, {});
  caso('conectado de novo: silencio', !f.push && !f.rascunho);
}
{
  const mem = {};
  decidirVigia(mem, false, CAIU, {});
  const v = decidirVigia(mem, true, CAIU + DEZ, {});
  caso('caiu e voltou antes de avisar: nao avisa nada', !v.push && !v.rascunho && mem.quedas === 0, v);
}

console.log('\n=== Madrugada ===');
{
  const mem = {};
  const noite = T('2026-11-22T05:00:00Z');   // 2h em SP
  decidirVigia(mem, false, noite, {});
  const a = decidirVigia(mem, false, noite + DEZ, {});
  caso('caiu de madrugada: nao toca o celular', !a.push);
  const b = decidirVigia(mem, false, T('2026-11-22T10:00:00Z'), {});   // 7h em SP
  caso('as 7h, ainda fora: avisa', b.push && /02:00/.test(b.push.texto), b.push);
}

console.log('\n=== Z-API sem resposta ===');
{
  const mem = {};
  const r1 = decidirVigia(mem, null, CAIU, {}), r2 = decidirVigia(mem, null, CAIU + DEZ, {}), r3 = decidirVigia(mem, null, CAIU + 2 * DEZ, {});
  caso('so avisa na 3a falha seguida', !r1.push && !r2.push && r3.push && /não consegue falar com a Z-API/.test(r3.push.texto), r3);
  const ok2 = decidirVigia(mem, true, CAIU + 3 * DEZ, {});
  caso('respondeu de novo depois do aviso: diz que voltou', ok2.push && /voltou/.test(ok2.push.texto));
}

console.log('\n=== Vencimento do plano ===');
{
  const agora = T('2026-12-10T15:00:00Z');   // 12h em SP
  const mem = {};
  caso('faltando mais de 3 dias: nada', avisoDoVencimento({}, T('2026-12-20T15:00:00Z'), 'PAID', agora) === null);
  const a = avisoDoVencimento(mem, T('2026-12-12T15:00:00Z'), 'PAID', agora);
  caso('faltando 2 dias: avisa com a data', a && /vence em 12\/12/.test(a.texto), a);
  caso('no mesmo dia nao repete', avisoDoVencimento(mem, T('2026-12-12T15:00:00Z'), 'PAID', agora + 3600e3) === null);
  caso('vencido e nao pago: diz', /venceu em 09\/12.*situação: OVERDUE/.test((avisoDoVencimento({}, T('2026-12-09T15:00:00Z'), 'OVERDUE', agora) || {}).texto || ''));
  caso('vencimento torto: nada', avisoDoVencimento({}, undefined, 'PAID', agora) === null);
}

console.log('\n=== Pedido do push ===');
{
  const av = { titulo: 'Robô de ofertas desconectado', texto: 'caiu', prioridade: 5 };
  const p = pedidoNtfy('td-robo-teste-0001', av);
  caso('vai para o ntfy com topico, titulo, texto e prioridade', p && p.url === 'https://ntfy.sh/' && p.body.topic === 'td-robo-teste-0001' && p.body.title === av.titulo && p.body.priority === 5, p);
  caso('sem topico ou topico torto: nao manda', pedidoNtfy('', av) === null && pedidoNtfy('ab', av) === null && pedidoNtfy('topico com espaco', av) === null && pedidoNtfy('https://x.com/a', av) === null);
  caso('sem aviso: nao manda', pedidoNtfy('td-robo-teste-0001', null) === null);
}

console.log(`\n  ${ok}/${ok + mau} PASS`);
if (mau) process.exitCode = 1;
