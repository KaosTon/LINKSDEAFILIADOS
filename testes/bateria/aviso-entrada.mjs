// Bateria do aviso de entrada (fluxo 05). Telefones inventados.
import { pegarCodigo, rodar } from './executar.mjs';
import { novosNoGrupo, grupoDoAvisoDeEntrada, horaDoAvisoDeEntrada, textoEntrada, chegaramDesde, boasVindas, idDoMembro, provavelOrigem, nomeDaOrigem, linhaDaOrigem } from '../../lib/aviso-entrada.mjs';

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

console.log(`\n  ${ok}/${ok + mau} PASS`);
if (mau) process.exitCode = 1;
