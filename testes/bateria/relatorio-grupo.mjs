// Bateria do relatório do dia (fluxo 05, 17/11). Telefones e números inventados.
// O que não pode acontecer: guardar telefone, contar errado quem entrou e saiu, trocar a origem,
// mandar o relatório duas vezes no dia, o token da Meta aparecer na saída, travessão no texto.
import { pegarCodigo, rodar } from './executar.mjs';
import { idDoMembro } from '../../lib/aviso-entrada.mjs';
import { diferencaDeIds, janelaDaOrigem, origensProvaveis, registrarMovimento, categoriaDaOrigem, conjuntosDoDia, saldoDaConta,
  orcamentoDiario, faixaDoCusto, relatorioDoDia, horaDoRelatorio, marcarRelatorio, gruposDasOfertas, pessoasNosGrupos, separarRobos, diaFechado } from '../../lib/relatorio-grupo.mjs';

let ok = 0, mau = 0;
const caso = (nome, cond, extra) => {
  if (cond) { ok++; console.log(`  PASS  ${nome}`); }
  else { mau++; console.log(`  FAIL  ${nome}`, extra === undefined ? '' : JSON.stringify(extra)); }
};
const TRAVESSAO = /[\u2013\u2014]/;
// 17/11 em São Paulo (UTC-3): 14h = 17h UTC; 23h50 = 02h50 UTC do dia 18.
const SP = (hhmm, dia = '17') => new Date(`2026-11-${dia}T${hhmm}${hhmm.length === 5 ? ':00' : ''}-03:00`);

console.log('# Regras');
caso('diferença: quem entrou e quem saiu', JSON.stringify(diferencaDeIds(['a', 'b', 'c'], ['b', 'c', 'd'])) === JSON.stringify({ novos: ['d'], foram: ['a'] }));
caso('sem lista anterior: nada', diferencaDeIds(null, ['a']).novos.length === 0);
caso('janela: 20 min no dia, desde a última leitura depois da madrugada, no máximo 10 h',
  janelaDaOrigem(5) === 20 && janelaDaOrigem(0) === 20 && janelaDaOrigem(480) === 500 && janelaDaOrigem(2000) === 600);
const rec = [
  { quando: SP('13:50').toISOString(), de: 'home' },
  { quando: SP('13:58').toISOString(), de: 'anuncio:v2' },
  { quando: SP('13:59:30').toISOString(), de: 'links' }, { quando: SP('13:59:30').toISOString(), de: 'links' }, { quando: SP('13:59:30').toISOString(), de: 'links' },
];
const os = origensProvaveis(rec, SP('14:00'), 20, 2);
caso('duas pessoas: os dois cliques mais novos de gente (robô fora)', os.length === 2 && os[0].de === 'anuncio:v2' && os[1].de === 'home', os);
caso('n = 0: nada', origensProvaveis(rec, SP('14:00'), 20, 0).length === 0);

// Robô que abre todos os links do site (17/11): em 14 dias, 38 dos 49 cliques de posts eram varredura.
{
  const seg = (s) => new Date(SP('08:02').getTime() + s * 1000).toISOString();
  const paginas = ['home:topo', 'home:fim', 'home', 'nao-encontrada', 'blog', 'sobre', 'post:a', 'post:b', 'guia:x', 'privacidade', 'anuncio'];
  const varredura = paginas.map((de, i) => ({ quando: seg(i * 40), de }));
  const gente = [{ quando: seg(200), de: 'anuncio:v2' }, { quando: seg(3 * 3600), de: 'home' },
    { quando: seg(5 * 3600), de: 'post:a' }, { quando: seg(5 * 3600 + 30), de: 'post:a' }];
  const r = separarRobos([...varredura, ...gente]);
  caso('varredura (6 páginas ou mais em sequência): fica de fora, até o clique de anúncio sem código', r.robos.length === 11 && r.robos.some(x => x.de === 'anuncio'), r.robos.map(x => x.de));
  caso('clique de anúncio com código no meio da varredura conta; gente fora dela também (até dois toques seguidos no mesmo post)',
    JSON.stringify(r.gente.map(x => x.de)) === JSON.stringify(['anuncio:v2', 'home', 'post:a', 'post:a']), r.gente.map(x => x.de));
  const trio = separarRobos(['home:topo', 'home:fim', 'home'].map((de, i) => ({ quando: seg(9 * 3600 + i), de })));
  caso('rajada: 3 origens diferentes em 5 segundos é robô', trio.gente.length === 0 && trio.robos.length === 3);
  const dia = separarRobos([{ quando: seg(0), de: 'home' }, { quando: seg(300), de: 'post:a' }, { quando: seg(500), de: 'anuncio:v1' }, { quando: seg(900), de: 'links' }, { quando: seg(1200), de: 'guia:x' }]);
  caso('dia movimentado de gente (5 origens, poucas páginas): ninguém é tirado', dia.robos.length === 0 && dia.gente.length === 5, dia.robos);
  caso('lista vazia ou quebrada', separarRobos(null).gente.length === 0 && separarRobos([{ quando: 'x', de: 'home' }]).gente.length === 0);
  caso('origem de quem entrou não cai num clique da varredura', origensProvaveis(varredura, new Date(SP('08:02').getTime() + 8 * 60e3), 20, 1).length === 0);
  const t = relatorioDoDia({}, SP('23:50'), { membros: 40, recentes: [...varredura, ...gente], meta: { conjuntos: [] } });
  caso('relatório: conta só gente e avisa quantos eram de robô',
    /Cliques em "Entrar no grupo": 4 \(site: 3, anúncio v2: 1\)\n   ◦ sem contar 11 de robô que abriu os links do site/.test(t), t);
}

{
  const ids = (n) => Array.from({ length: n }, (_, i) => idDoMembro('55119000000' + String(i).padStart(2, '0')));
  const mem = { entradaIds: ids(10) };
  const dif = diferencaDeIds(ids(10), [...ids(10).slice(1), idDoMembro('5511988887777')]);
  const r = registrarMovimento(mem, dif, SP('14:00'), [{ de: 'anuncio:v2' }]);
  const novo = mem.fichas[idDoMembro('5511988887777')], velho = mem.fichas[ids(10)[0]];
  caso('quem entrou ganha ficha com a origem; quem era de antes e saiu fica marcado como antigo',
    r.entraram === 1 && r.sairam === 1 && novo.de === 'anuncio:v2' && !novo.s && velho.de === 'antigo' && velho.e === null && !!velho.s && mem.fichasDesde === '2026-11-17' && mem.fichasInicio === SP('14:00').toISOString(), mem.fichas);
  registrarMovimento(mem, { novos: [], foram: [idDoMembro('5511988887777')] }, SP('17:00'), []);
  caso('quem veio de fora e saiu: a ficha guarda a saída', !!mem.fichas[idDoMembro('5511988887777')].s && mem.fichas[idDoMembro('5511988887777')].de === 'anuncio:v2');
  const antes = JSON.stringify(mem.fichas);
  const troca = registrarMovimento(mem, { novos: ids(8).map(x => x + 'x'), foram: ids(8) }, SP('18:00'), []);
  caso('Z-API trocou o identificador de todo mundo: não vira entrada nem saída', troca.ignorado === true && JSON.stringify(mem.fichas) === antes);
  caso('memória sem telefone', !/5511/.test(JSON.stringify(mem)));
}
caso('grupos das ofertas: lista sem repetir', JSON.stringify(gruposDasOfertas({ GRUPO_OFERTAS: 'a-group, b-group,a-group' })) === JSON.stringify(['a-group', 'b-group']) && gruposDasOfertas({}).length === 0);
caso('pessoas nos grupos: quem está nos dois conta uma vez; grupo sem resposta, null',
  pessoasNosGrupos([['5511900000001', '5511900000002'], ['5511900000002', '5511900000003']]) === 3 && pessoasNosGrupos([['5511900000001'], null]) === null && pessoasNosGrupos([]) === null);
caso('categorias', categoriaDaOrigem('anuncio:v1') === 'Anúncio' && categoriaDaOrigem('home:topo') === 'Site' && categoriaDaOrigem('post:x') === 'Site'
  && categoriaDaOrigem('links') === 'Instagram' && categoriaDaOrigem(null) === 'Sem origem' && categoriaDaOrigem('indicacao') === 'Indicação');

// Formato real da Meta (insights level=adset), números inventados.
const INSIGHTS = { data: [
  { adset_name: 'Brasil 18-55 | amplo', spend: '3.82', impressions: '903', inline_link_clicks: '28' },
  { adset_name: 'TD | LEAD | car1 | BR 25-54', spend: '6.01', impressions: '300', inline_link_clicks: '0' },
  { adset_name: 'TD | LEAD | v1 | BR 25-54', spend: '5.98', impressions: '200', inline_link_clicks: '6' },
  { adset_name: 'TD | LEAD | v2 | BR 25-54', spend: '6', impressions: '250', inline_link_clicks: '14' },
  { adset_name: 'TD | LEAD | v3 | BR 25-54', spend: '0', impressions: '0', inline_link_clicks: '0' },
] };
const conj = conjuntosDoDia(INSIGHTS);
caso('conjuntos: código do anúncio pelo nome, sem gasto fica de fora, maior gasto primeiro',
  conj.length === 4 && conj[0].codigo === 'car1' && conj.find(c => c.codigo === 'v2').cliques === 14 && conj.find(c => c.codigo === '').nome === 'Brasil 18-55 | amplo', conj);
caso('conjuntos: resposta vazia ou quebrada', conjuntosDoDia(null).length === 0 && conjuntosDoDia({ error: { message: 'x' } }).length === 0);
caso('saldo pré-pago pelo texto da Meta', saldoDaConta({ is_prepay_account: true, funding_source_details: { display_string: 'Saldo disponível (R$172,24 BRL)' } }) === 172.24
  && saldoDaConta({ is_prepay_account: true, funding_source_details: { display_string: 'Saldo disponível (R$1.234,56 BRL)' } }) === 1234.56
  && saldoDaConta({ is_prepay_account: false }) === null && saldoDaConta(null) === null);
caso('orçamento por dia: só os conjuntos rodando', orcamentoDiario({ data: [
  { effective_status: 'ACTIVE', daily_budget: '600' }, { effective_status: 'ACTIVE', daily_budget: '600' }, { effective_status: 'ACTIVE', daily_budget: '600' },
  { effective_status: 'CAMPAIGN_PAUSED', daily_budget: '1000' }] }) === 18);
caso('faixas combinadas', /ótimo/.test(faixaDoCusto(1)) && /bom/.test(faixaDoCusto(1.8)) && /segure/.test(faixaDoCusto(2.55)) && /caro/.test(faixaDoCusto(5.78)) && faixaDoCusto(null) === null);
caso('hora do relatório: 23h50 em SP, uma vez por dia', (() => {
  const m = {};
  const antes = horaDoRelatorio(m, SP('23:45')), na = horaDoRelatorio(m, SP('23:50'));
  marcarRelatorio(m, SP('23:50'));
  return !antes && na && !horaDoRelatorio(m, SP('23:55')) && horaDoRelatorio(m, SP('23:50', '18'));
})());

console.log('\n# Texto do relatório');
{
  const f = (de, e, s) => ({ e: e && e.toISOString(), de, ...(s ? { s: s.toISOString() } : {}) });
  const mem = {
    fichasDesde: '2026-11-16',
    fichas: {
      a: f('anuncio:v2', SP('20:05')),
      b: f('home', SP('10:00'), SP('13:10')),
      c: f(null, SP('15:00', '16')),
      d: { e: null, de: 'antigo', s: SP('09:00').toISOString() },
      e: f('anuncio:v1', SP('19:00', '16'), SP('08:00')),
    },
    relatorios: [{ dia: '2026-11-16', membros: 45, gasto: 17.5, anuncio: 1 }],
  };
  const recentes = [
    ...['10:20', '19:58', '20:03'].map(h => ({ quando: SP(h).toISOString(), de: 'anuncio:v2' })),
    { quando: SP('11:00').toISOString(), de: 'anuncio:v1' },
    { quando: SP('09:59').toISOString(), de: 'home' }, { quando: SP('12:00').toISOString(), de: 'home:fim' },
    { quando: SP('22:00', '16').toISOString(), de: 'home' },
  ];
  const meta = { conjuntos: conj, saldo: 154.25, orcamento: 18 };
  const t = relatorioDoDia(mem, SP('23:50'), { membros: 47, recentes, meta });
  const tem = (re) => re.test(t);
  caso('título com o dia', tem(/^\u{1F4CB} \*Relatório do dia \(17\/11\)\*/u), t);
  caso('membros e diferença desde ontem', tem(/• Membros agora: 47 \(\+2 desde ontem\)/), t);
  caso('quem entrou hoje e de onde', tem(/• Entraram hoje: 2\n/) && tem(/◦ anúncio v2 \(Meta\): 1/) && tem(/◦ site, página inicial: 1/), t);
  caso('quem saiu: de onde tinha vindo e quanto tempo ficou; de antes, só a conta',
    tem(/• Saíram hoje: 3\n/) && tem(/◦ site, página inicial: ficou 3 horas/) && tem(/◦ anúncio v1 \(Meta\): ficou 13 horas/) && tem(/◦ 1 de antes de 16\/11/), t);
  caso('cliques em Entrar hoje (o de ontem não conta)', tem(/Cliques em "Entrar no grupo": 6 \(anúncio v2: 3, site: 2, anúncio v1: 1\)/), t);
  caso('cada anúncio: gasto, cliques, quem clicou em Entrar e quem entrou',
    tem(/• v2: R\$ 6,00, 14 cliques no anúncio, 3 em Entrar, 1 entrou/) && tem(/• v1: R\$ 5,98, 6 cliques no anúncio, 1 em Entrar, ninguém entrou/)
    && tem(/• car1: R\$ 6,01, nenhum clique no anúncio\n/) && tem(/• Brasil 18-55 \| amplo: R\$ 3,82, 28 cliques no anúncio\n/), t);
  caso('total do dia e custo por membro do anúncio', tem(/• Total: R\$ 21,81, 1 entrou pelo anúncio: R\$ 21,81 por membro/), t);
  caso('últimos dias com a faixa combinada', tem(/• Últimos 2 dias: R\$ 19,66 por membro do anúncio \(R\$ 39,31 ÷ 2\): caro, corte ou mude o anúncio/), t);
  caso('saldo e quantos dias dá', tem(/• Saldo: R\$ 154,25, dá uns 8 dias com R\$ 18,00 por dia/), t);
  caso('quem veio de fora desde o começo: entraram e continuam por origem',
    tem(/\*Quem veio de fora desde 16\/11\*/) && tem(/• Anúncio: 2 entraram, 1 continua/) && tem(/• Site: 1 entrou, 0 continuam/) && tem(/• Sem origem: 1 entrou, 1 continua/)
    && tem(/• No grupo agora: 2 de fora e 45 de antes/), t);
  caso('sem travessão', !TRAVESSAO.test(t));
  caso('guarda a foto do dia para amanhã', mem.relatorios.length === 2 && mem.relatorios[1].dia === '2026-11-17' && mem.relatorios[1].membros === 47 && mem.relatorios[1].anuncio === 1 && mem.relatorios[1].gasto === 21.81, mem.relatorios);
  const t2 = relatorioDoDia(mem, SP('23:55'), { membros: 47, recentes, meta });
  caso('rodar de novo no mesmo dia não duplica a foto', mem.relatorios.length === 2 && t2 === t);

  const mt = { relatorios: [{ dia: '2026-11-16', membros: 15, total: 43 }] };
  const tt = relatorioDoDia(mt, SP('23:50'), { membros: 16, total: 45, recentes: [{ quando: SP('10:00').toISOString(), de: 'anuncio' }], meta: { conjuntos: [] } });
  caso('dois grupos: total de pessoas e a comunidade separada, diferença pelo total',
    /• Membros agora: 45 pessoas \(\+2 desde ontem\)\n   ◦ 16 na comunidade, onde entra quem vem do site e do anúncio/.test(tt) && /No grupo agora: 0 de fora/.test(tt) === false && mt.relatorios[1].total === 45, tt);
  caso('clique de anúncio sem código', /\(anúncio sem código: 1\)/.test(tt), tt);
  // 16/11 foi parcial (fichas ligadas às 21h55): o gasto daquele dia não entra na conta da semana.
  const mp = { fichasDesde: '2026-11-16', fichasInicio: SP('21:55', '16').toISOString(), fichas: { a: f('anuncio:v1', SP('09:57')) },
    relatorios: [{ dia: '2026-11-16', membros: 40, gasto: 16.22, anuncio: 0 }] };
  const tp1 = relatorioDoDia(mp, SP('23:50'), { membros: 41, meta: { conjuntos: [{ codigo: 'v1', nome: 'v1', gasto: 18, cliques: 9 }] } });
  caso('dia em que a medição começou não entra na conta da semana', !/Últimos/.test(tp1) && /1 entrou pelo anúncio: R\$ 18,00 por membro/.test(tp1), tp1);
  mp.fichas.b = f('anuncio:v2', SP('10:00', '18'));
  const tp2 = relatorioDoDia(mp, SP('23:50', '18'), { membros: 42, meta: { conjuntos: [{ codigo: 'v2', nome: 'v2', gasto: 18, cliques: 9 }] } });
  caso('no dia seguinte a semana aparece só com os dias inteiros', /Últimos 2 dias: R\$ 18,00 por membro do anúncio \(R\$ 36,00 ÷ 2\)/.test(tp2), tp2);
  // Dia fechado (17/11): a conta de anúncio fecha o dia às 5h de Brasília; o gasto das 23h50 é corrigido na noite seguinte.
  caso('dia fechado: lê a data e o gasto; resposta vazia ou quebrada, null', JSON.stringify(diaFechado({ data: [{ spend: '18.16', date_start: '2026-11-16' }] })) === JSON.stringify({ dia: '2026-11-16', gasto: 18.16 })
    && diaFechado({ data: [] }) === null && diaFechado(null) === null && diaFechado({ data: [{ spend: 'x', date_start: '2026-11-16' }] }) === null);
  const mf = { fichas: { a: f('anuncio:v1', SP('09:57')), b: f('anuncio:v2', SP('20:00', '16')) },
    relatorios: [{ dia: '2026-11-15', membros: 39, gasto: 10, anuncio: 1 }, { dia: '2026-11-16', membros: 40, gasto: 16.22, anuncio: 1 }] };
  const metaF = { conjuntos: [{ codigo: 'v1', nome: 'v1', gasto: 18, cliques: 9 }], ontem: { dia: '2026-11-16', gasto: 18.16 } };
  const tf = relatorioDoDia(mf, SP('23:50'), { membros: 41, meta: metaF });
  caso('ontem fechado: troca o gasto guardado e avisa a diferença', mf.relatorios[1].gasto === 18.16 && mf.relatorios[1].fechado === true
    && /• Ontem fechou em R\$ 18,16 \(às 23h50 eram R\$ 16,22; a Meta fecha o dia às 5h\)/.test(tf), tf);
  caso('a conta da semana usa o gasto fechado', /Últimos 3 dias: R\$ 15,39 por membro do anúncio \(R\$ 46,16 ÷ 3\)/.test(tf), tf);
  const tf2 = relatorioDoDia(mf, SP('23:55'), { membros: 41, meta: metaF });
  caso('rodar de novo não troca nem avisa duas vezes', !/Ontem fechou/.test(tf2) && mf.relatorios[1].gasto === 18.16);
  const mg = { relatorios: [{ dia: '2026-11-16', membros: 40, gasto: 16.22, anuncio: 1 }] };
  relatorioDoDia(mg, SP('23:50'), { membros: 41, meta: { conjuntos: [], ontem: { dia: '2026-11-17', gasto: 99 } } });
  caso('data que não é de um dia anterior guardado: não mexe', mg.relatorios[0].gasto === 16.22 && !mg.relatorios[0].fechado);
  const vazio = relatorioDoDia({}, SP('23:50'), { membros: null, recentes: null, meta: null });
  caso('sem Z-API, sem encurtador e sem Meta: sai do mesmo jeito, avisando',
    /Membros: a Z-API não respondeu agora/.test(vazio) && /Entraram hoje: 0/.test(vazio) && /nenhum hoje/.test(vazio) && /Não consegui ler a Meta agora/.test(vazio) && /Ninguém ainda/.test(vazio), vazio);
  const semGasto = relatorioDoDia({}, SP('23:50'), { membros: 40, meta: { conjuntos: [], saldo: null, orcamento: 0 } });
  caso('dia sem gasto', /Nenhum gasto hoje/.test(semGasto) && !/Saldo/.test(semGasto), semGasto);
  const domingo = { relatorios: ['16', '17', '18', '19', '20', '21'].map((d, i) => ({ dia: `2026-11-${d}`, membros: 40 + i, gasto: 18, anuncio: 1 })) };
  const td = relatorioDoDia(domingo, SP('23:50', '22'), { membros: 47, meta: { conjuntos: [], saldo: null, orcamento: 0 } });
  caso('domingo: membros dia a dia', /\u{1F4C6} Semana: 16\/11 40 · 17\/11 41 .* 22\/11 47/u.test(td), td);
}

console.log('\n# No "Confere quem entrou" (como vai para o n8n)');
{
  const codigo = pegarCodigo('05-aviso-entrada.json', 'Confere quem entrou');
  const env = { GRUPO_RASCUNHO: 'r-group', GRUPO_OFERTAS: 'a-group,b-group', ZAPI_BASE_URL: 'https://zapi.test', ZAPI_INSTANCE_ID: 'I', ZAPI_INSTANCE_TOKEN: 'T',
    ENCURTADOR_URL: 'https://enc.test/', ENCURTADOR_SEGREDO: 'S', META_ACCESS_TOKEN: 'TOKEN-SECRETO', META_AD_ACCOUNT_ID: 'act_123' };
  const fones = (lista) => ({ quando: /light-group-metadata\/b-group$/, metodo: 'GET', responde: { participants: lista.map(phone => ({ phone })) } });
  const base = Array.from({ length: 4 }, (_, i) => '55119000000' + i);
  let recentes = [];
  const enc = { quando: /^https:\/\/enc\.test\/api\/cliques$/, metodo: 'GET', responde: () => ({ grupo: {}, grupoRecentes: recentes }) };
  const META = [
    { quando: /graph\.facebook\.com\/v21\.0\/act_123\/insights\?level=adset&date_preset=today/, metodo: 'GET', responde: INSIGHTS },
    { quando: /graph\.facebook\.com\/v21\.0\/act_123\?fields=is_prepay_account/, metodo: 'GET', responde: { is_prepay_account: true, funding_source_details: { display_string: 'Saldo disponível (R$154,25 BRL)' } } },
    { quando: /graph\.facebook\.com\/v21\.0\/act_123\/insights\?date_preset=yesterday/, metodo: 'GET', responde: { data: [{ spend: '18.16', date_start: '2026-11-16' }] } },
    { quando: /graph\.facebook\.com\/v21\.0\/act_123\/adsets\?/, metodo: 'GET', responde: { data: [{ effective_status: 'ACTIVE', daily_budget: '600' }, { effective_status: 'ACTIVE', daily_budget: '600' }, { effective_status: 'ACTIVE', daily_budget: '600' }] } },
  ];
  const memoria = {};
  let r = await rodar(codigo, { env, http: [fones(base), enc, ...META], memoria, agora: SP('14:00') });
  caso('1ª leitura: só guarda, sem ficha', r.saida[0].json.motivo === 'ninguem_novo' && !memoria.fichas && r.chamadas.length === 1, r.saida);
  recentes = [{ quando: SP('14:03').toISOString(), de: 'anuncio:v2' }];
  r = await rodar(codigo, { env, http: [fones([...base, '5511977776666']), enc, ...META], memoria, agora: SP('14:05') });
  const ficha = memoria.fichas && memoria.fichas[idDoMembro('5511977776666')];
  caso('entrou pelo anúncio: avisa com a origem e abre a ficha', r.saida[0].json.avisar === true && r.saida[0].json.origem === 'anuncio:v2' && ficha && ficha.de === 'anuncio:v2', { saida: r.saida, fichas: memoria.fichas });
  r = await rodar(codigo, { env, http: [fones(['5511977776666', ...base.slice(1)]), enc, ...META], memoria, agora: SP('16:00') });
  caso('saiu um de antes: sem aviso, ficha de antigo', r.saida[0].json.avisar === false && memoria.fichas[idDoMembro(base[0])].de === 'antigo', memoria.fichas);
  recentes.push({ quando: SP('18:00').toISOString(), de: 'home' });
  r = await rodar(codigo, { env, http: [fones(['5511977776666', ...base.slice(1), '5511955554444']), enc, ...META], memoria, agora: SP('18:05') });
  r = await rodar(codigo, { env, http: [fones(['5511977776666', ...base.slice(1)]), enc, ...META], memoria, agora: SP('21:00') });
  caso('entrou pelo site e saiu 3 h depois: a ficha guarda as duas coisas', memoria.fichas[idDoMembro('5511955554444')].de === 'home' && !!memoria.fichas[idDoMembro('5511955554444')].s);
  r = await rodar(codigo, { env, http: [fones(['5511977776666', ...base.slice(1)])], memoria, agora: SP('23:30') });
  caso('entre 23h e 23h50 não lê nada', r.saida[0].json.motivo === 'fora_do_horario' && r.chamadas.length === 0);
  recentes.push({ quando: SP('20:00').toISOString(), de: 'anuncio:v1' });
  const outro = { quando: /light-group-metadata\/a-group$/, metodo: 'GET', responde: { participants: ['5511977776666', '5511911110000', '5511911110001'].map(phone => ({ phone })) } };
  r = await rodar(codigo, { env, http: [fones(['5511977776666', ...base.slice(1)]), outro, enc, ...META], memoria, agora: SP('23:50') });
  const j = r.saida[0].json;
  caso('primeiro dia: avisa a partir de que hora contou', /_Primeiro dia: entradas e saídas contadas a partir das 14h05\. Os cliques e os anúncios são do dia inteiro\._/.test(r.saida[0].json.texto), r.saida[0].json.texto);
  caso('23h50: manda o relatório no rascunho', j.avisar === true && j.tipo === 'relatorio' && j.grupo === 'r-group' && /Relatório do dia \(17\/11\)/.test(j.texto), j);
  caso('relatório com quem entrou, saiu e de onde', /Entraram hoje: 2/.test(j.texto) && /anúncio v2 \(Meta\): 1/.test(j.texto) && /Saíram hoje: 2/.test(j.texto)
    && /site, página inicial: ficou 3 horas/.test(j.texto) && /1 de antes de 17\/11/.test(j.texto), j.texto);
  caso('relatório com os anúncios e o saldo', /• v2: R\$ 6,00, 14 cliques no anúncio, 1 em Entrar, 1 entrou/.test(j.texto) && /• v1: R\$ 5,98, 6 cliques no anúncio, 1 em Entrar, ninguém entrou/.test(j.texto)
    && /Saldo: R\$ 154,25, dá uns 8 dias/.test(j.texto), j.texto);
  caso('membros somando os dois grupos (quem está nos dois conta uma vez)', /• Membros agora: 6 pessoas\n   ◦ 4 na comunidade/.test(j.texto), j.texto);
  caso('relatório com quem veio de fora e continua', /• Anúncio: 1 entrou, 1 continua/.test(j.texto) && /• Site: 1 entrou, 0 continuam/.test(j.texto) && /No grupo agora: 1 de fora e 5 de antes/.test(j.texto), j.texto);
  caso('o token da Meta não aparece na saída nem na memória', !JSON.stringify(r.saida).includes('TOKEN-SECRETO') && !JSON.stringify(memoria).includes('TOKEN-SECRETO'));
  caso('nem telefone', !/5511/.test(JSON.stringify(r.saida)) && !/5511/.test(JSON.stringify(memoria)));
  caso('Meta lida só com GET', r.chamadas.filter(c => /graph\.facebook/.test(c.url)).every(c => c.metodo === 'GET') && r.chamadas.filter(c => /graph\.facebook/.test(c.url)).length === 4);
  r = await rodar(codigo, { env, http: [fones(['5511977776666', ...base.slice(1)]), enc, ...META], memoria, agora: SP('23:55') });
  caso('23h55: não manda de novo', r.saida[0].json.avisar === false && r.saida[0].json.motivo === 'fora_do_horario', r.saida);
  // Entrou de madrugada (2h), clicou no convite à 1h58; o fluxo só lê às 7h.
  recentes.push({ quando: SP('01:58', '18').toISOString(), de: 'links' });
  r = await rodar(codigo, { env, http: [fones(['5511977776666', ...base.slice(1), '5511933332222']), enc, ...META], memoria, agora: SP('07:00', '18') });
  caso('às 7h: quem entrou de madrugada fica com o clique da madrugada', r.saida[0].json.avisar === true && memoria.fichas[idDoMembro('5511933332222')].de === 'links', memoria.fichas[idDoMembro('5511933332222')]);

  const m2 = JSON.parse(JSON.stringify(memoria));
  r = await rodar(codigo, { env, http: [{ quando: /light-group-metadata/, responde: () => { throw new Error('fora do ar'); } }, enc, ...META], memoria: m2, agora: SP('23:50', '18') });
  caso('Z-API fora do ar às 23h50: o relatório sai assim mesmo', r.saida[0].json.avisar === true && /a Z-API não respondeu/.test(r.saida[0].json.texto) && /• v2: R\$ 6,00/.test(r.saida[0].json.texto), r.saida[0].json.texto);
  const m3 = JSON.parse(JSON.stringify(memoria));
  r = await rodar(codigo, { env, http: [fones(['5511977776666', ...base.slice(1)]), enc, ...META.map(x => ({ ...x, responde: () => { throw new Error('400 token'); } }))], memoria: m3, agora: SP('23:50', '18') });
  caso('Meta fora do ar: o relatório sai sem os anúncios', r.saida[0].json.avisar === true && /Não consegui ler a Meta agora/.test(r.saida[0].json.texto), r.saida[0].json.texto);
  r = await rodar(codigo, { env, http: [fones(['5511977776666', ...base.slice(1)]), enc, ...META], memoria: JSON.parse(JSON.stringify(memoria)), agora: SP('15:00', '18'), modo: 'manual' });
  caso('rodado na mão: devolve a prévia e não manda', r.saida[0].json.avisar === false && r.saida[0].json.motivo === 'teste' && /Relatório do dia \(18\/11\)/.test(r.saida[0].json.previa), r.saida);
}

console.log(`\n  ${ok}/${ok + mau} PASS`);
if (mau) process.exitCode = 1;
