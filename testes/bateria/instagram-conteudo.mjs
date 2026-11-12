// Bateria dos posts de conteúdo do Instagram (fluxo 06) e da agenda gerada.
import fs from 'node:fs';
import { pegarCodigo, rodar } from './executar.mjs';
import { horaDoConteudo, postDeHoje, anotarTentativa } from '../../lib/instagram-agenda.mjs';

let ok = 0, mau = 0;
const caso = (nome, cond, extra) => {
  if (cond) { ok++; console.log(`  PASS  ${nome}`); }
  else { mau++; console.log(`  FAIL  ${nome}`, extra === undefined ? '' : JSON.stringify(extra)); }
};

console.log('# Regras');
const AG = [
  { id: 'dica-a', data: '2026-11-14', imagem: '/instagram/dica-a.jpg', legenda: 'A' },
  { id: 'dica-b', data: '2026-11-15', imagem: '/instagram/dica-b.jpg', legenda: 'B' },
  { id: 'ruim', data: '2026-11-14', imagem: 'https://outro.site/x.jpg', legenda: 'X' },
];
const h18 = new Date('2026-11-14T21:05:00Z'), h10 = new Date('2026-11-14T13:00:00Z'), h22 = new Date('2026-11-15T01:10:00Z');
caso('só das 18h às 22h', horaDoConteudo(h18) && !horaDoConteudo(h10) && !horaDoConteudo(h22));
let m = {};
caso('acha o item de hoje', postDeHoje(AG, h18, m).id === 'dica-a');
caso('imagem de fora do site não entra', postDeHoje([AG[2]], h18, {}) === null);
anotarTentativa(m, 'dica-a', true);
caso('publicado não sai de novo', postDeHoje(AG, h18, m) === null && m.feitos.includes('dica-a'));
m = {}; postDeHoje(AG, h18, m);
anotarTentativa(m, 'dica-a', false); anotarTentativa(m, 'dica-a', false);
caso('falhou 2 vezes: ainda tenta', postDeHoje(AG, h18, m) !== null);
anotarTentativa(m, 'dica-a', false);
caso('falhou 3 vezes: para no dia', postDeHoje(AG, h18, m) === null);
caso('agenda quebrada não derruba', postDeHoje(null, h18, {}) === null && postDeHoje('x', h18, {}) === null);

console.log('\n# No "Publica o post do dia" (como vai para o n8n)');
const codigo = pegarCodigo('06-instagram-conteudo.json', 'Publica o post do dia');
const env = { INSTAGRAM_FEED: 'sim', META_IG_USER_ID: '1789', META_ACCESS_TOKEN: 'TOKEN_TESTE' };
const http = [
  { quando: /temdescontos\.com\.br\/instagram\/agenda\.json$/, metodo: 'GET', responde: AG },
  { quando: /\/1789\/media$/, metodo: 'POST', responde: { id: 'C1' } },
  { quando: /\/C1\?fields=status_code/, metodo: 'GET', responde: { status_code: 'FINISHED' } },
  { quando: /\/1789\/media_publish$/, metodo: 'POST', responde: { id: 'P9' } },
];
let memoria = {};
let r = await rodar(codigo, { env, http, memoria, agora: h18 });
const criar = r.chamadas.find(c => /\/media$/.test(c.url));
caso('publica o item do dia com a imagem do site', r.saida[0].json.publicou === true && r.saida[0].json.id === 'dica-a' && criar.body.image_url === 'https://www.temdescontos.com.br/instagram/dica-a.jpg' && criar.body.caption === 'A', r.saida);
r = await rodar(codigo, { env, http, memoria, agora: h18 });
caso('rodada seguinte não repete', r.saida[0].json.motivo === 'nada_hoje' && !r.chamadas.some(c => /\/media$/.test(c.url)));
r = await rodar(codigo, { env, http, memoria: {}, agora: h10 });
caso('fora do horário não lê nem publica', r.saida[0].json.motivo === 'fora_do_horario' && r.chamadas.length === 0);
r = await rodar(codigo, { env: { ...env, INSTAGRAM_FEED: '' }, http, memoria: {}, agora: h18 });
caso('desligado sem INSTAGRAM_FEED=sim', r.saida[0].json.motivo === 'desligado' && r.chamadas.length === 0);
memoria = {};
const ruim = [http[0], { quando: /\/1789\/media$/, metodo: 'POST', responde: () => { throw new Error('fora do ar'); } }];
r = await rodar(codigo, { env, http: ruim, memoria, agora: h18 });
caso('Meta fora do ar: conta a tentativa e não marca como feito', r.saida[0].json.publicou === false && r.saida[0].json.tentativa === 1 && !(memoria.feitos || []).length, r.saida);
r = await rodar(codigo, { env, http: [{ quando: /agenda\.json$/, responde: () => { throw new Error('404'); } }], memoria: {}, agora: h18 });
caso('site fora do ar: não publica', r.saida[0].json.motivo === 'sem_agenda');
r = await rodar(codigo, { env: { ...env, INSTAGRAM_FEED: '' }, http, memoria: {}, agora: h10, modo: 'manual' });
caso('rodado na mão: mostra o post e não publica', r.saida[0].json.motivo === 'teste' && r.saida[0].json.id === 'dica-a' && !r.chamadas.some(c => /\/media$/.test(c.url)), r.saida);

console.log('\n# Reel (item com vídeo)');
const AGR = [{ id: 'reel-a', data: '2026-11-14', video: '/instagram/reel-a.mp4', legenda: 'R' }];
const httpR = [
  { quando: /agenda\.json$/, metodo: 'GET', responde: AGR },
  { quando: /\/1789\/media$/, metodo: 'POST', responde: { id: 'V1' } },
  { quando: /\/V1\?fields=status_code/, metodo: 'GET', responde: { status_code: 'FINISHED' } },
  { quando: /\/1789\/media_publish$/, metodo: 'POST', responde: { id: 'R7' } },
];
memoria = {};
r = await rodar(codigo, { env, http: httpR, memoria, agora: h18 });
caso('reel desligado sem INSTAGRAM_REEL=sim: espera, sem gastar tentativa', r.saida[0].json.motivo === 'reel_desligado' && !r.chamadas.some(c => /\/media$/.test(c.url)) && !(memoria.tentativas.n['reel-a']), r.saida);
r = await rodar(codigo, { env: { ...env, INSTAGRAM_REEL: 'sim' }, http: httpR, memoria, agora: h18 });
const criarR = r.chamadas.find(c => /\/media$/.test(c.url));
caso('reel ligado: publica como REELS com o vídeo do site', r.saida[0].json.publicou === true && r.saida[0].json.reel === true && criarR.body.media_type === 'REELS' && criarR.body.video_url === 'https://www.temdescontos.com.br/instagram/reel-a.mp4' && criarR.body.share_to_feed === true, { s: r.saida, b: criarR && criarR.body });
r = await rodar(codigo, { env: { ...env, INSTAGRAM_REEL: 'sim' }, http: httpR, memoria, agora: h18 });
caso('reel não repete', r.saida[0].json.motivo === 'nada_hoje');
memoria = {};
r = await rodar(codigo, { env: { ...env, INSTAGRAM_REEL: 'sim' }, http: [httpR[0], httpR[1], { quando: /\/V1\?fields=status_code/, metodo: 'GET', responde: { status_code: 'ERROR' } }], memoria, agora: h18 });
caso('reel que a Meta recusa: não publica e conta a tentativa', r.saida[0].json.publicou === false && r.saida[0].json.tentativa === 1 && !r.chamadas.some(c => /media_publish$/.test(c.url)), r.saida);

console.log('\n# Agenda gerada (site/public/instagram)');
const agenda = JSON.parse(fs.readFileSync(new URL('../../site/public/instagram/agenda.json', import.meta.url), 'utf8'));
const ids = agenda.map(p => p.id);
caso('ids únicos e uma data por dia', new Set(ids).size === ids.length && new Set(agenda.map(p => p.data)).size === agenda.length, ids);
caso('toda imagem ou vídeo existe', agenda.every(p => fs.existsSync(new URL('../../site/public' + (p.video || p.imagem), import.meta.url))));
caso('sem #publi, sem preço e sem link na legenda', agenda.every(p => !/#publi|R\$|https?:/.test(p.legenda)));
caso('legenda cabe no Instagram (até 2.200 letras)', agenda.every(p => p.legenda.length <= 2200));

console.log(`\n  ${ok}/${ok + mau} PASS`);
if (mau) process.exitCode = 1;
