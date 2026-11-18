// Bateria do aviso de entrada (fluxo 05). Telefones inventados.
import { pegarCodigo, rodar } from './executar.mjs';
import { novosNoGrupo, grupoDoAvisoDeEntrada, horaDoAvisoDeEntrada, textoEntrada, chegaramDesde, boasVindas, idDoMembro, provavelOrigem, nomeDaOrigem, linhaDaOrigem, avisoDoMarco, movimentoDoAviso } from '../../lib/aviso-entrada.mjs';

let ok = 0, mau = 0;
const caso = (nome, cond, extra) => {
  if (cond) { ok++; console.log(`  PASS  ${nome}`); }
  else { mau++; console.log(`  FAIL  ${nome}`, extra === undefined ? '' : JSON.stringify(extra)); }
};

console.log('# Regras');
const m = {};
caso('primeira leitura só guarda', novosNoGrupo(m, ['5511900000001', '5511900000002']) === 0 && m.entradaIds.length === 2, m);
caso('memória não guarda telefone', !JSON.stringify(m).includes('5511900000001'));
caso('ninguém novo, nada', novosNoGrupo(m, ['5511900000001', '5511900000002']) === 0);
caso('entrou 1', novosNoGrupo(m, ['5511900000001', '5511900000002', '5511900000003']) === 1 && m.entradaIds.length === 3);
caso('saiu 1, nada', novosNoGrupo(m, ['5511900000001', '5511900000003']) === 0 && m.entradaIds.length === 2);
caso('mesma gente com outro identificador não vira aviso', novosNoGrupo(m, ['111@lid', '222@lid']) === 0);
caso('leitura que falhou não mexe na memória', novosNoGrupo(m, null) === 0 && novosNoGrupo(m, []) === 0 && m.entradaIds.length === 2);
caso('grupo é o último de GRUPO_OFERTAS quando há dois', grupoDoAvisoDeEntrada({ GRUPO_OFERTAS: 'a-group,b-group' }) === 'b-group' && grupoDoAvisoDeEntrada({ GRUPO_OFERTAS: 'a-group' }) === '');
caso('variável escolhe o grupo e 0 desliga', grupoDoAvisoDeEntrada({ AVISO_ENTRADA_GRUPO: 'c-group', GRUPO_OFERTAS: 'a-group,b-group' }) === 'c-group' && grupoDoAvisoDeEntrada({ AVISO_ENTRADA_GRUPO: '0', GRUPO_OFERTAS: 'a-group,b-group' }) === '');
caso('só das 7h às 23h', horaDoAvisoDeEntrada(new Date('2026-11-10T13:00:00Z')) && !horaDoAvisoDeEntrada(new Date('2026-11-10T06:00:00Z')) && !horaDoAvisoDeEntrada(new Date('2026-11-11T02:30:00Z')));
caso('texto no singular e no plural', /Entrou 1 pessoa na comunidade\* \(agora 6\)/.test(textoEntrada(1, 6)) && /Entraram 3 pessoas/.test(textoEntrada(3, 9)) && /histórico/.test(textoEntrada(1, 6)));

console.log('\n# No "Confere quem entrou" (como vai para o n8n)');
const codigo = pegarCodigo('05-aviso-entrada.json', 'Confere quem entrou');
const env = { GRUPO_RASCUNHO: 'r-group', GRUPO_OFERTAS: 'a-group,b-group', ZAPI_BASE_URL: 'https://zapi.test', ZAPI_INSTANCE_ID: 'I', ZAPI_INSTANCE_TOKEN: 'T', ZAPI_CLIENT_TOKEN: 'C' };
const dia = new Date('2026-11-10T15:00:00Z');
const lista = (n) => [{ quando: /light-group-metadata\/b-group$/, metodo: 'GET', responde: { participants: Array.from({ length: n }, (_, i) => ({ phone: '55119000000' + String(i).padStart(2, '0') })) } }];
const memoria = {};
let r = await rodar(codigo, { env, http: lista(4), memoria, agora: dia });
caso('1ª rodada: guarda e não avisa', r.saida[0].json.avisar === false && r.saida[0].json.motivo === 'ninguem_novo' && memoria.entradaIds.length === 4, r.saida);
caso('lê só o grupo da comunidade, com o client-token', r.chamadas.length === 1 && r.chamadas[0].headers['client-token'] === 'C');
r = await rodar(codigo, { env, http: lista(6), memoria, agora: dia });
caso('entraram 2: avisa no rascunho', r.saida[0].json.avisar === true && r.saida[0].json.entrou === 2 && r.saida[0].json.grupo === 'r-group' && /Entraram 2 pessoas na comunidade\* \(agora 6\)/.test(r.saida[0].json.texto), r.saida);
caso('aviso não leva telefone', !/5511900/.test(JSON.stringify(r.saida)) && !/5511900/.test(JSON.stringify(memoria)));
r = await rodar(codigo, { env, http: lista(6), memoria, agora: dia });
caso('rodada seguinte não repete o aviso', r.saida[0].json.avisar === false);
r = await rodar(codigo, { env, http: lista(7), memoria, agora: new Date('2026-11-11T05:00:00Z') });
caso('de madrugada não lê nem avisa', r.saida[0].json.motivo === 'fora_do_horario' && r.chamadas.length === 0 && memoria.entradaIds.length === 6, r.saida);
r = await rodar(codigo, { env, http: lista(7), memoria, agora: new Date('2026-11-11T10:05:00Z') });
caso('às 7h avisa quem entrou de madrugada', r.saida[0].json.avisar === true && r.saida[0].json.entrou === 1);
r = await rodar(codigo, { env, http: [{ quando: /light-group-metadata/, responde: () => { throw new Error('fora do ar'); } }], memoria, agora: dia });
caso('Z-API fora do ar: não avisa e não perde a lista', r.saida[0].json.motivo === 'sem_lista' && memoria.entradaIds.length === 7, r.saida);
r = await rodar(codigo, { env: { ...env, AVISO_ENTRADA_GRUPO: '0' }, http: [], memoria, agora: dia });
caso('AVISO_ENTRADA_GRUPO=0 desliga', r.saida[0].json.motivo === 'sem_grupo' && r.chamadas.length === 0);
r = await rodar(codigo, { env, http: lista(9), memoria: { entradaIds: memoria.entradaIds.slice() }, agora: dia, modo: 'manual' });
caso('rodado na mão: mostra e não avisa', r.saida[0].json.avisar === false && r.saida[0].json.motivo === 'teste' && r.saida[0].json.entrou === 2, r.saida);

console.log('\n# Boas-vindas no convite das 19h (14/11)');
const antes = ['5511900000001', '5511900000002'].map(idDoMembro);
caso('ninguém novo: 0', chegaramDesde(antes, ['5511900000001', '5511900000002']) === 0);
caso('um novo: 1', chegaramDesde(antes, ['5511900000001', '5511900000002', '5511900000003']) === 1);
caso('sem lista guardada: 0 (não chuta)', chegaramDesde(null, ['5511900000003']) === 0 && chegaramDesde([], ['5511900000003']) === 0);
caso('Z-API sem resposta: 0', chegaramDesde(antes, null) === 0);
caso('sem novos: texto igual', boasVindas('CONVITE', 0) === 'CONVITE');
caso('com novos: boas-vindas no topo e o convite inteiro embaixo', /^\u{1F44B} \*Boas-vindas/u.test(boasVindas('CONVITE', 2)) && boasVindas('CONVITE', 2).endsWith('\nCONVITE'));
const cb = pegarCodigo('03-garimpo.json', 'Boas-vindas');
const envB = { ZAPI_BASE_URL: 'https://z', ZAPI_INSTANCE_ID: 'i', ZAPI_INSTANCE_TOKEN: 't', GRUPO_OFERTAS: 'g1-group,com-group' };
const part = (n) => [{ quando: /light-group-metadata\/com-group/, metodo: 'GET', responde: { participants: Array.from({ length: n }, (_, k) => ({ phone: '551190000000' + (k + 1) })) } }];
let rb = await rodar(cb, { env: envB, http: part(3), memoria: { membrosIds: { dia: '2026-11-13', ids: antes } }, itens: [{ json: { tipo: 'convite', texto: 'CONVITE' } }] });
caso('nó: convite com 1 novo ganha boas-vindas', rb.saida[0].json.novos === 1 && /Boas-vindas/.test(rb.saida[0].json.texto), rb.saida);
rb = await rodar(cb, { env: envB, http: [], memoria: {}, itens: [{ json: { tipo: 'produto', texto: 'OFERTA' } }] });
caso('nó: post de oferta passa sem mudança e sem chamar a Z-API', rb.saida[0].json.texto === 'OFERTA' && rb.chamadas.length === 0, rb.saida);

console.log('\n# Origem provável de quem entrou (14/11)');
const T = new Date('2026-11-14T16:15:02Z');
const rec = [
  { quando: '2026-11-14T11:26:29.821Z', de: 'home:fim' },
  { quando: '2026-11-14T16:05:00.000Z', de: 'home' },
  { quando: '2026-11-14T16:10:00.100Z', de: 'home' }, { quando: '2026-11-14T16:10:00.200Z', de: 'home:topo' }, { quando: '2026-11-14T16:10:00.300Z', de: 'home:fim' },
  { quando: '2026-11-14T16:13:21.163Z', de: 'anuncio:a2' },
  { quando: '2026-11-14T16:15:08.687Z', de: 'links' },
];
const o = provavelOrigem(rec, T);
caso('último clique antes do aviso, dentro de 20 min', o && o.de === 'anuncio:a2' && o.minutos === 2, o);
caso('clique depois do aviso não conta', provavelOrigem([rec[6]], T) === null);
caso('3 cliques no mesmo segundo é robô', provavelOrigem(rec.slice(2, 5), T) === null);
caso('clique de horas antes não conta', provavelOrigem([rec[0]], T) === null);
caso('nomes legíveis', nomeDaOrigem('anuncio:a1') === 'anúncio a1 (Meta)' && nomeDaOrigem('home:topo') === 'site, página inicial' && /bio do Instagram/.test(nomeDaOrigem('links')) && /indicação/.test(nomeDaOrigem('indicacao')));
caso('linha com e sem origem', /anúncio a2 \(Meta\)\* \(clicou no convite 2 min antes\)/.test(linhaDaOrigem(o)) && /não deu para saber/.test(linhaDaOrigem(null)));

console.log('\n  marco dos 100 membros');
{
  const m = {};
  caso('abaixo de 100 não avisa', avisoDoMarco(m, 99) === null && !m.marcos);
  const a = avisoDoMarco(m, 100);
  caso('aos 100 avisa, com as variáveis da foto em cena', /100 membros/.test(a) && /GARIMPO_CENA_POR_DIA=80/.test(a) && !/[\u2013\u2014]/.test(a), a);
  caso('avisa uma vez só', avisoDoMarco(m, 101) === null && m.marcos.length === 1);
  caso('total inválido não avisa', avisoDoMarco({}, undefined) === null);
}

console.log('\n# Aviso de entrada e saída do WhatsApp (18/11)');
{
  // 17/11: entrou às 22h15 e saiu às 22h17; a lista de participantes ainda mostrava a pessoa 1 h depois.
  const G = '120363000000000002-group', T = '5511977776666', ADMIN = '5511999998888';
  const AGORA = Date.parse('2026-11-18T01:20:00Z');
  const aviso = (notification, extra = {}) => ({ isGroup: true, phone: G, notification, notificationParameters: [T], participantPhone: null, momment: Date.parse('2026-11-18T01:15:32Z'), ...extra });
  const e = movimentoDoAviso(aviso('GROUP_PARTICIPANT_INVITE'), G, AGORA);
  caso('entrou pelo link: tipo, resumo e a hora do aviso', e && e.tipo === 'entrou' && e.ids.length === 1 && e.ids[0] === idDoMembro(T) && e.quando === '2026-11-18T01:15:32.000Z', e);
  const s = movimentoDoAviso(aviso('GROUP_PARTICIPANT_LEAVE', { participantPhone: T, momment: Date.parse('2026-11-18T01:17:36Z') }), G, AGORA);
  caso('saiu: o número vem duas vezes no aviso e vira um resumo só', s && s.tipo === 'saiu' && s.ids.length === 1 && s.ids[0] === idDoMembro(T) && s.quando === '2026-11-18T01:17:36.000Z', s);
  const rem = movimentoDoAviso(aviso('GROUP_PARTICIPANT_REMOVE', { participantPhone: ADMIN }), G, AGORA);
  caso('removido: conta quem saiu, não o admin que removeu', rem && rem.tipo === 'saiu' && rem.ids.length === 1 && rem.ids[0] === idDoMembro(T), rem);
  const add = movimentoDoAviso(aviso('GROUP_PARTICIPANT_ADD', { participantPhone: ADMIN, notificationParameters: [T, '5511955554444'] }), G, AGORA);
  caso('adicionados dois: dois resumos, sem o admin', add && add.tipo === 'entrou' && add.ids.length === 2 && !add.ids.includes(idDoMembro(ADMIN)), add);
  caso('sem lista no aviso: vale o participantPhone', (movimentoDoAviso(aviso('GROUP_PARTICIPANT_LEAVE', { notificationParameters: [], participantPhone: T }), G, AGORA) || {}).ids?.[0] === idDoMembro(T));
  caso('nada de telefone no que sai', [e, s, rem, add].every(x => !/5511/.test(JSON.stringify(x))));
  caso('aviso de outro grupo: nada', movimentoDoAviso(aviso('GROUP_PARTICIPANT_LEAVE'), '120363000000000001-group', AGORA) === null);
  caso('sem grupo configurado: nada', movimentoDoAviso(aviso('GROUP_PARTICIPANT_LEAVE'), '', AGORA) === null && movimentoDoAviso(aviso('GROUP_PARTICIPANT_LEAVE'), undefined, AGORA) === null);
  caso('mensagem comum e outros avisos: nada', [undefined, null, '', 'GROUP_CREATE', 'GROUP_PARTICIPANT_PROMOTE', 'CALL_MISSED_VOICE', 'constructor', '__proto__', 'toString']
    .every(n => movimentoDoAviso(aviso(n), G, AGORA) === null));
  caso('aviso vazio ou torto: nada', [null, undefined, {}, { notification: 'GROUP_PARTICIPANT_LEAVE' }, aviso('GROUP_PARTICIPANT_LEAVE', { notificationParameters: ['abc', '', null, '123'] }),
    aviso('GROUP_PARTICIPANT_LEAVE', { notificationParameters: 'x', participantPhone: {} })].every(b => movimentoDoAviso(b, G, AGORA) === null));
  caso('número com sinais: mesmo resumo da lista de participantes', movimentoDoAviso(aviso('GROUP_PARTICIPANT_INVITE', { notificationParameters: ['+55 (11) 97777-6666'] }), G, AGORA).ids[0] === idDoMembro(T));
  const semHora = movimentoDoAviso(aviso('GROUP_PARTICIPANT_INVITE', { momment: undefined }), G, AGORA);
  const futura = movimentoDoAviso(aviso('GROUP_PARTICIPANT_INVITE', { momment: AGORA + 3600e3 }), G, AGORA);
  const emSegundos = movimentoDoAviso(aviso('GROUP_PARTICIPANT_INVITE', { momment: Math.floor(AGORA / 1000) - 60 }), G, AGORA);
  caso('sem hora, hora no futuro ou em segundos: vale a hora de agora', [semHora, futura, emSegundos].every(x => x.quando === new Date(AGORA).toISOString()), [semHora, futura, emSegundos]);

  // O nó do fluxo 01, como vai para o n8n.
  const codigo = pegarCodigo('01-entrada.json', 'Anota quem entrou e saiu');
  const env = { WEBHOOK_SEGREDO: 'k-secreta', GRUPO_OFERTAS: '120363000000000001-group,' + G, ENCURTADOR_URL: 'https://enc.test/', ENCURTADOR_SEGREDO: 'SENHA-DO-ENCURTADOR' };
  const recebe = { quando: /^https:\/\/enc\.test\/api\/movimento$/, metodo: 'POST', responde: { ok: true, guardados: 1 } };
  const zapi = (body, k = 'k-secreta') => ({ 'Z-API avisou': [{ json: { query: { k }, body } }] });
  let r = await rodar(codigo, { env, http: [recebe], nos: zapi(aviso('GROUP_PARTICIPANT_LEAVE', { participantPhone: T, momment: Date.now() - 5000 })) });
  const ch = r.chamadas[0] || {};
  caso('nó: repassa o tipo, o resumo e a hora com a senha', r.chamadas.length === 1 && ch.metodo === 'POST' && ch.headers.Authorization === 'Bearer SENHA-DO-ENCURTADOR'
    && ch.body.tipo === 'saiu' && ch.body.ids.length === 1 && ch.body.ids[0] === idDoMembro(T) && Object.keys(ch.body).sort().join() === 'ids,quando,tipo', ch);
  caso('nó: o telefone não sai do n8n nem fica na execução', !/5511/.test(JSON.stringify(ch.body)) && !/5511/.test(JSON.stringify(r.saida)) && !JSON.stringify(r.saida).includes(idDoMembro(T)), { body: ch.body, saida: r.saida });
  caso('nó: devolve só o tipo e a quantidade', JSON.stringify(r.saida[0].json) === JSON.stringify({ tipo: 'saiu', quantos: 1, guardado: true }), r.saida);
  r = await rodar(codigo, { env, http: [recebe], nos: zapi(aviso('GROUP_PARTICIPANT_LEAVE'), 'outra-chave') });
  caso('nó: chave do webhook errada, não repassa', r.saida.length === 0 && r.chamadas.length === 0, r);
  r = await rodar(codigo, { env, http: [recebe], nos: zapi({ isGroup: true, phone: 'r-group', text: { message: 'Fone JBL\nPor R$ 99\nLink: https://amzn.to/x' } }) });
  caso('nó: oferta mandada no rascunho não vira movimento', r.saida.length === 0 && r.chamadas.length === 0, r);
  r = await rodar(codigo, { env, http: [recebe], nos: zapi(aviso('GROUP_PARTICIPANT_LEAVE', { phone: '120363000000000001-group' })) });
  caso('nó: saída do grupo antigo (não é a comunidade) não repassa', r.saida.length === 0 && r.chamadas.length === 0, r);
  r = await rodar(codigo, { env, http: [{ ...recebe, responde: () => { throw new Error('connect ECONNREFUSED Bearer SENHA-DO-ENCURTADOR'); } }], nos: zapi(aviso('GROUP_PARTICIPANT_INVITE')) });
  caso('nó: encurtador fora do ar não derruba o fluxo nem mostra a senha', r.saida[0].json.guardado === false && !JSON.stringify(r.saida).includes('SENHA-DO-ENCURTADOR'), r.saida);
  r = await rodar(codigo, { env: { ...env, ENCURTADOR_URL: '' }, http: [recebe], nos: zapi(aviso('GROUP_PARTICIPANT_INVITE')) });
  caso('nó: sem encurtador configurado, não faz nada', r.saida.length === 0 && r.chamadas.length === 0, r);
  r = await rodar(codigo, { env, http: [recebe], nos: zapi(aviso('GROUP_PARTICIPANT_INVITE')), bloquear: ['crypto', 'node:crypto'] });
  caso('nó: sem crypto, não manda pedaço de telefone', r.chamadas.length === 0 && !/7666/.test(JSON.stringify(r.saida)), r);
}

console.log(`\n  ${ok}/${ok + mau} PASS`);
if (mau) process.exitCode = 1;
