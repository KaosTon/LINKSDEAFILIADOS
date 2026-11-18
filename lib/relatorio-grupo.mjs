// Relatório do dia (17/11/2026). Vai colado no fluxo 05 logo depois de lib/aviso-entrada.mjs,
// no mesmo nó: usa nomeDaOrigem de lá.
import { nomeDaOrigem, idDoMembro, linhaDaOrigem } from './aviso-entrada.mjs';
/*
 * Relatório do dia (17/11, pedido do Wellington): a partir de hoje dá para medir quem veio de fora.
 * Os membros de antes são quase todos números dele e conhecidos, que não compram. Cada pessoa nova
 * ganha uma ficha (só o resumo do telefone): quando entrou, de onde veio (o clique no convite) e
 * quando saiu. Às 23h50 o relatório vai para o rascunho: quem entrou e saiu, de onde veio, quem
 * continua, e o que cada anúncio gastou e trouxe.
 */
const diaSP = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const minutoDoDiaSP = (d) => {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }).format(d).split(':').map(Number);
  return (h % 24) * 60 + m;
};
const ddmm = (dia) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;
const reais = (v) => (Math.round(Number(v) * 100) / 100).toFixed(2).replace('.', ',');
const menosDias = (dia, n) => new Date(Date.parse(`${dia}T12:00:00Z`) - n * 864e5).toISOString().slice(0, 10);

/** Às 23h50, uma vez por dia (o fluxo roda a cada 5 minutos; se a das 23h50 falhar, a das 23h55 manda). */
export const horaDoRelatorio = (mem, agora) => minutoDoDiaSP(agora) >= 23 * 60 + 50 && mem.relatorioDia !== diaSP(agora);
// relatorioEm (18/11): a hora em que o relatório saiu. O que acontecer depois dele, ainda no mesmo dia
// (das 23h50 à meia-noite), entra na conta do relatório seguinte.
export const marcarRelatorio = (mem, agora) => { mem.relatorioDia = diaSP(agora); mem.relatorioEm = agora.toISOString(); };

/** Quem entrou e quem saiu entre duas leituras (listas de resumos). */
export function diferencaDeIds(antes, agora) {
  if (!Array.isArray(antes) || !Array.isArray(agora)) return { novos: [], foram: [] };
  const a = new Set(antes), h = new Set(agora);
  return { novos: agora.filter(x => !a.has(x)), foram: antes.filter(x => !h.has(x)) };
}

/**
 * Janela para achar o clique de quem entrou: 20 minutos, ou desde a última leitura quando ficou um
 * tempo sem ler (de madrugada o fluxo não lê, e quem entrou às 2h só aparece às 7h). Máximo 10 horas.
 */
export function janelaDaOrigem(minutosSemLer) {
  const m = Number(minutosSemLer) || 0;
  return m > 30 ? Math.min(m + 20, 600) : 20;
}

/**
 * Separa clique de gente de clique de robô (17/11). O encurtador já tira os robôs que se apresentam
 * (Google, prévia do WhatsApp). Sobram os que se passam por navegador e abrem todos os links do site:
 * em 14 dias, 38 dos 49 cliques vindos de posts do blog eram isso. Dois sinais, só pela hora e pela origem:
 * - rajada: 3 cliques ou mais no mesmo segundo, ou de 3 origens diferentes em 5 segundos;
 * - varredura: uma sequência de cliques com menos de 10 minutos entre um e outro que passa por 6 páginas
 *   diferentes ou mais. Dentro dela, só clique de anúncio com código (anuncio:v2) conta como gente.
 */
export function separarRobos(recentes) {
  const lista = (Array.isArray(recentes) ? recentes : []).map(x => ({ t: Date.parse(x && x.quando), de: String((x && x.de) || ''), quando: x && x.quando }))
    .filter(x => Number.isFinite(x.t)).sort((a, b) => a.t - b.t);
  const doAnuncio = (x) => /^anuncio:/.test(x.de);
  const robo = new Set();
  lista.forEach((x, i) => {
    const perto = (ms) => lista.filter(y => Math.abs(y.t - x.t) < ms);
    if (perto(1000).length >= 3 || new Set(perto(5000).map(y => y.de)).size >= 3) robo.add(i);
  });
  for (let i = 0; i < lista.length;) {
    let j = i;
    while (j + 1 < lista.length && lista[j + 1].t - lista[j].t < 10 * 60e3) j++;
    const paginas = new Set(lista.slice(i, j + 1).filter(x => !doAnuncio(x)).map(x => x.de));
    if (paginas.size >= 6) for (let k = i; k <= j; k++) if (!doAnuncio(lista[k])) robo.add(k);
    i = j + 1;
  }
  return { gente: lista.filter((_, i) => !robo.has(i)), robos: lista.filter((_, i) => robo.has(i)) };
}

/** Os cliques no convite que podem ser de quem entrou, do mais novo para o mais velho (até n). */
export function origensProvaveis(recentes, agora, janelaMin = 20, n = 1) {
  const fim = agora.getTime(), ini = fim - janelaMin * 60e3;
  const humanos = separarRobos(recentes).gente.filter(x => x.t >= ini && x.t <= fim);
  return humanos.sort((a, b) => b.t - a.t).slice(0, Math.max(0, n))
    .map(u => ({ de: u.de, nome: nomeDaOrigem(u.de), minutos: Math.max(0, Math.round((fim - u.t) / 60e3)) }));
}

/**
 * Atualiza as fichas com quem entrou e saiu. Mudança grande demais de uma vez (a Z-API trocou o jeito
 * de identificar as pessoas) não vira entrada nem saída: só a lista nova passa a valer.
 */
export function registrarMovimento(mem, dif, agora, origens = []) {
  const { novos, foram } = dif || { novos: [], foram: [] };
  const base = Array.isArray(mem.entradaIds) ? mem.entradaIds.length : 0;
  if (foram.length > Math.max(3, 0.2 * base) || novos.length > Math.max(10, 0.5 * base)) return { ignorado: true, entraram: 0, sairam: 0 };
  const quando = agora.toISOString();
  mem.fichas = mem.fichas || {};
  if (!mem.fichasDesde) { mem.fichasDesde = diaSP(agora); mem.fichasInicio = quando; }
  novos.forEach((id, i) => {
    const o = origens[i];
    mem.fichas[id] = { e: quando, de: o ? o.de : null };
  });
  for (const id of foram) {
    if (mem.fichas[id] && mem.fichas[id].e) mem.fichas[id].s = quando;
    else mem.fichas[id] = { e: null, de: 'antigo', s: quando };
  }
  // Fichas de quem saiu há mais de 120 dias saem da memória.
  for (const [id, f] of Object.entries(mem.fichas)) if (f.s && agora.getTime() - Date.parse(f.s) > 120 * 864e5) delete mem.fichas[id];
  return { entraram: novos.length, sairam: foram.length };
}

/** Em que grupo de origem a pessoa entra no balanço desde o começo da medição. */
/** Os avisos válidos, do mais velho para o mais novo: { t, tipo, id }. */
function movimentosEmOrdem(movimentos) {
  return (Array.isArray(movimentos) ? movimentos : [])
    .map(m => ({ t: Date.parse(m && m.quando), tipo: m && m.tipo, id: String((m && m.id) || '') }))
    .filter(m => Number.isFinite(m.t) && (m.tipo === 'entrou' || m.tipo === 'saiu') && /^[a-f0-9]{12}$/.test(m.id))
    .sort((a, b) => a.t - b.t);
}

/** Quem saiu e não voltou (o último aviso da pessoa é de saída), com a hora dessa saída: Map id -> ms. */
function ultimasSaidas(movimentos) {
  const ultimo = new Map();
  for (const m of movimentosEmOrdem(movimentos)) ultimo.set(m.id, m);
  return new Map([...ultimo].filter(([, m]) => m.tipo === 'saiu').map(([id, m]) => [id, m.t]));
}
export function idsQueSairam(movimentos) {
  return new Set(ultimasSaidas(movimentos).keys());
}

/**
 * Tira da lista lida quem o WhatsApp avisou que saiu (18/11). A lista de participantes da Z-API demora a
 * tirar quem saiu: em 17/11 uma pessoa saiu às 22h17 e mais de uma hora depois ainda estava na lista.
 * Vale enquanto a lista continuar mostrando a pessoa. Quando a lista enfim tira, a saída fica confirmada
 * (mem.saidasConfirmadas) e o filtro para de valer para ela: se aparecer de novo na lista, é entrada de
 * verdade, mesmo que o aviso de entrada tenha se perdido.
 */
export function tirarQuemSaiu(mem, movimentos, participantes) {
  if (!Array.isArray(participantes)) return participantes;
  const saidas = ultimasSaidas(movimentos);
  const naLista = new Set(participantes.map(idDoMembro));
  const antes = (mem && mem.saidasConfirmadas) || {};
  const conf = {};
  for (const [id, t] of saidas) {
    const quando = new Date(t).toISOString();
    if (antes[id] === quando || !naLista.has(id)) conf[id] = quando;
  }
  if (Object.keys(conf).length) mem.saidasConfirmadas = conf; else delete mem.saidasConfirmadas;
  if (!saidas.size) return participantes;
  return participantes.filter(tel => { const id = idDoMembro(tel); return !(saidas.has(id) && !conf[id]); });
}

// Quanto tempo depois do aviso de entrada a leitura ainda pode ser a dessa entrada: de madrugada o fluxo
// não lê a lista (das 23h às 7h), e quem entrou à meia-noite só aparece na leitura das 7h.
const ESPERA_DA_LEITURA = 10 * 3600e3;

/** O aviso de entrada de quem continua no grupo (o último aviso da pessoa é de entrada, nas últimas 10 horas). */
function entradaAvisada(movimentos, id, agora) {
  const evs = movimentosEmOrdem(movimentos).filter(m => m.id === id);
  const u = evs[evs.length - 1];
  if (!u || u.tipo !== 'entrou') return null;
  const faz = agora.getTime() - u.t;
  return faz >= -60e3 && faz <= ESPERA_DA_LEITURA ? u : null;
}

/**
 * Quantos dos novos da lista têm aviso de entrada do WhatsApp (18/11). Esses contam para o aviso no
 * rascunho mesmo quando o total não cresceu: em 18/11 uma pessoa entrou de madrugada, a lista tirou
 * outra que tinha saído, o total ficou igual e o aviso de entrada não saiu.
 */
export function entradasComAviso(movimentos, novos, agora) {
  return (Array.isArray(novos) ? novos : []).filter(id => entradaAvisada(movimentos, id, agora)).length;
}

/**
 * A origem de quem acabou de aparecer na lista, pela hora certa do aviso de entrada (18/11): o clique no
 * convite nos 20 minutos antes do aviso, não antes da leitura. Em 18/11 uma pessoa clicou no anúncio v1 e
 * entrou às 00h39; outra clicou no v2 à 1h42. A leitura das 7h pegou o clique mais novo da madrugada e
 * marcou a primeira como v2. Devolve undefined quando não há aviso dessa entrada (vale a conta antiga) e
 * null quando há aviso e ninguém clicou no convite antes dele.
 */
export function origemPeloAviso(movimentos, id, recentes, agora) {
  const u = Array.isArray(recentes) ? entradaAvisada(movimentos, id, agora) : null;
  if (!u) return undefined;
  const o = origensProvaveis(recentes, new Date(u.t), 20, 1)[0];
  return o ? { ...o, entrou: new Date(u.t).toISOString() } : null;
}

/** A linha da origem no aviso de entrada. Quem entrou faz tempo (de madrugada) sai com a hora em que entrou. */
export function linhaDaOrigemPeloAviso(o, agora) {
  if (!o || !o.entrou || agora.getTime() - Date.parse(o.entrou) <= 15 * 60e3) return linhaDaOrigem(o);
  const m = minutoDoDiaSP(new Date(o.entrou));
  return `\u{1F4CD} Origem provável: *${o.nome}* (entrou às ${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}, ${o.minutos <= 1 ? 'logo depois de clicar no convite' : `${o.minutos} min depois de clicar no convite`})`;
}

/**
 * Acerta as fichas pelos avisos do WhatsApp (18/11), depois da leitura da lista. Para quem entrou e
 * continua (o último aviso é de entrada): a ficha que a leitura abriu até 10 horas depois do aviso ganha
 * a hora certa de entrar e a origem pelo clique antes dessa hora (uma vez só: depois de acertada, não é
 * mexida de novo). Para quem saiu e não
 * voltou (o último aviso é de saída):
 * - sem ficha: entrou e saiu sem a leitura ver. Ganha ficha com as duas horas e a origem provável na
 *   hora da entrada; sem aviso de entrada, é membro de antes das fichas ("antigo");
 * - ficha de uma estadia antiga já fechada antes dessa entrada: a ficha nova toma o lugar;
 * - ficha aberta antes da saída: ganha a hora certa de sair, e a de entrar quando a leitura viu a pessoa
 *   até 15 minutos depois do aviso de entrada;
 * - ficha aberta depois da saída: se foi até 15 minutos depois do aviso de entrada, a leitura só viu a
 *   pessoa quando ela já tinha saído (lista atrasada, caso de 17/11) e a ficha é acertada; se não, é uma
 *   volta que os avisos não contam, e a ficha não é mexida.
 * Pode rodar quantas vezes for: o resultado é o mesmo. Devolve quantas fichas mudou.
 */
export function aplicarAvisos(mem, movimentos, recentes = null) {
  const porId = new Map();
  for (const m of movimentosEmOrdem(movimentos)) { if (!porId.has(m.id)) porId.set(m.id, []); porId.get(m.id).push(m); }
  if (!porId.size) return 0;
  mem.fichas = mem.fichas || {};
  let mudou = 0;
  const iso = (t) => new Date(t).toISOString();
  const PERTO = 15 * 60e3;
  for (const [id, evs] of porId) {
    const saiu = evs[evs.length - 1];
    if (saiu.tipo !== 'saiu') {
      // Entrou e continua: a hora e a origem da ficha passam a ser as do aviso de entrada.
      const f = mem.fichas[id], e = iso(saiu.t);
      if (!Array.isArray(recentes) || !f || f.s || !f.e || f.e === e) continue;
      const depois = Date.parse(f.e) - saiu.t;
      if (!(depois >= -60e3 && depois <= ESPERA_DA_LEITURA)) continue;   // ficha de outra estadia
      const o = origensProvaveis(recentes, new Date(saiu.t), 20, 1)[0];
      f.e = e; f.de = o ? o.de : null; mudou++;
      continue;
    }
    const entrou = [...evs].reverse().find(m => m.tipo === 'entrou') || null;
    const nova = () => {
      const o = entrou ? origensProvaveis(recentes, new Date(entrou.t), 20, 1)[0] : null;
      return entrou ? { e: iso(entrou.t), de: o ? o.de : null, s: iso(saiu.t) } : { e: null, de: 'antigo', s: iso(saiu.t) };
    };
    const f = mem.fichas[id];
    if (!f || (f.s && entrou && Date.parse(f.s) < entrou.t)) {
      const n = nova();
      if (!f || JSON.stringify(f) !== JSON.stringify(n)) { mem.fichas[id] = n; mudou++; }
      continue;
    }
    const eDaFicha = f.e ? Date.parse(f.e) : null;
    let e = f.e;
    if (eDaFicha != null && eDaFicha > saiu.t + 60e3) {
      if (!entrou || eDaFicha - entrou.t > PERTO) continue;   // voltou depois: não mexe
      e = iso(entrou.t);
    } else if (entrou && eDaFicha != null && Math.abs(eDaFicha - entrou.t) <= PERTO) e = iso(entrou.t);
    const s = iso(saiu.t);
    let de = f.de;
    if (de == null && entrou) { const o = origensProvaveis(recentes, new Date(entrou.t), 20, 1)[0]; if (o) de = o.de; }
    if (f.s !== s || f.e !== e || f.de !== de) { f.s = s; f.e = e; f.de = de; mudou++; }
  }
  return mudou;
}

export function categoriaDaOrigem(de) {
  if (de == null) return 'Sem origem';
  const d = String(de);
  if (/^anuncio/.test(d)) return 'Anúncio';
  if (d === 'links') return 'Instagram';
  if (d === 'indicacao') return 'Indicação';
  if (d === 'status') return 'Status do WhatsApp';
  if (d === 'facebook') return 'Facebook';
  if (d === 'direto') return 'Link direto do convite';
  return 'Site';
}
const rotuloDoClique = (de) => (/^anuncio:/.test(String(de)) ? `anúncio ${String(de).slice(8)}` : de === 'anuncio' ? 'anúncio sem código' : categoriaDaOrigem(de).toLowerCase());

/** Os grupos de GRUPO_OFERTAS (o último é a comunidade, onde entra quem vem do site e do anúncio). */
export function gruposDasOfertas(env) {
  return [...new Set(String((env && env.GRUPO_OFERTAS) || '').split(/[\s,;]+/).map(x => x.trim()).filter(Boolean))];
}

/** Pessoas diferentes somando todos os grupos (quem está em dois conta uma vez). null se algum não respondeu. */
export function pessoasNosGrupos(listas) {
  if (!Array.isArray(listas) || !listas.length || listas.some(l => !Array.isArray(l) || !l.length)) return null;
  return new Set(listas.flat().map(idDoMembro)).size;
}

/** Anúncios do dia por conjunto (insights level=adset). O código do anúncio (car1, v1, v2) sai do nome. */
export function conjuntosDoDia(r) {
  const lista = r && Array.isArray(r.data) ? r.data : [];
  return lista.map(d => {
    const nome = String(d.adset_name || '').trim();
    const partes = nome.split('|').map(s => s.trim());
    const codigo = (partes.find(p => /^[a-z]{1,4}\d{1,3}$/i.test(p)) || '').toLowerCase();
    return { codigo, nome: codigo || nome.slice(0, 30), gasto: Math.round((Number(d.spend) || 0) * 100) / 100, cliques: Number(d.inline_link_clicks) || 0 };
  }).filter(c => c.gasto > 0 || c.cliques > 0).sort((a, b) => b.gasto - a.gasto);
}

/** Saldo pré-pago da conta, do texto da forma de pagamento ("Saldo disponível (R$172,24 BRL)"). */
export function saldoDaConta(info) {
  if (!info || !info.is_prepay_account) return null;
  const m = String((info.funding_source_details || {}).display_string || '').match(/R\$\s*([\d.]+,\d{2}|\d+(?:\.\d{1,2})?)/);
  if (!m) return null;
  const v = m[1].includes(',') ? Number(m[1].replace(/\./g, '').replace(',', '.')) : Number(m[1]);
  return Number.isFinite(v) ? v : null;
}

/** Orçamento por dia dos conjuntos que estão rodando (daily_budget vem em centavos). */
export function orcamentoDiario(r) {
  const lista = r && Array.isArray(r.data) ? r.data : [];
  return lista.filter(s => s.effective_status === 'ACTIVE').reduce((n, s) => n + (Number(s.daily_budget) || 0) / 100, 0);
}

/** O dia de ontem já fechado na Meta (insights da conta, date_preset=yesterday): { dia, gasto } ou null. */
export function diaFechado(r) {
  const d = r && Array.isArray(r.data) ? r.data[0] : null;
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(String(d.date_start || '')) || !Number.isFinite(Number(d.spend))) return null;
  return { dia: d.date_start, gasto: Math.round(Number(d.spend) * 100) / 100 };
}

/** Lê os anúncios de hoje na Meta. Qualquer parte que falhar fica de fora; o token nunca volta. */
export async function anunciosDoDia(http, env) {
  if (!env.META_ACCESS_TOKEN || !env.META_AD_ACCOUNT_ID) return null;
  const conta = encodeURIComponent(env.META_AD_ACCOUNT_ID);
  const pega = async (u) => {
    try {
      return await http.httpRequest({ method: 'GET', json: true, timeout: 20000,
        url: `https://graph.facebook.com/v21.0/${u}${u.includes('?') ? '&' : '?'}access_token=${encodeURIComponent(env.META_ACCESS_TOKEN)}` });
    } catch (e) { return null; }
  };
  const ins = await pega(`${conta}/insights?level=adset&date_preset=today&fields=adset_name,spend,impressions,inline_link_clicks`);
  const info = await pega(`${conta}?fields=is_prepay_account,funding_source_details`);
  const sets = await pega(`${conta}/adsets?fields=name,effective_status,daily_budget&limit=50`);
  // Ontem já fechado (17/11): a conta de anúncio está no fuso de Los Angeles e a Meta fecha o dia às 5h
  // de Brasília. O relatório das 23h50 perde o que é gasto depois dele (R$ 1,94 de R$ 18,16 em 16/11).
  const ont = await pega(`${conta}/insights?date_preset=yesterday&fields=spend`);
  return { conjuntos: ins ? conjuntosDoDia(ins) : null, saldo: saldoDaConta(info), orcamento: sets ? orcamentoDiario(sets) : null, ontem: diaFechado(ont) };
}

/** Faixas combinadas com o Wellington (16/11) para o custo de cada membro novo. */
export function faixaDoCusto(v) {
  if (v == null) return null;
  if (v <= 1) return 'ótimo, pode aumentar o saldo';
  if (v <= 2) return 'bom para crescer o grupo';
  if (v <= 3) return 'segure o orçamento e ajuste o anúncio';
  return 'caro, corte ou mude o anúncio';
}

function quantoFicou(e, s) {
  const h = (Date.parse(s) - Date.parse(e)) / 36e5;
  if (!(h >= 0)) return null;
  // Menos de uma hora sai em minutos (18/11): com o aviso do WhatsApp a hora é exata, e ficar 2 minutos é
  // bem diferente de ficar 50.
  if (h < 1) { const m = Math.round(h * 60); return m < 1 ? 'menos de 1 min' : `${m} min`; }
  if (h < 24) return `${Math.round(h)} ${Math.round(h) === 1 ? 'hora' : 'horas'}`;
  const d = Math.round(h / 24);
  return `${d} ${d === 1 ? 'dia' : 'dias'}`;
}
const contar = (lista) => lista.reduce((m, k) => ({ ...m, [k]: (m[k] || 0) + 1 }), {});
const emOrdem = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]);

/**
 * Monta o relatório e guarda a foto do dia (mem.relatorios: membros, gasto e quem entrou pelo anúncio,
 * 40 dias). `membros`: quantos tem na comunidade agora (null se a Z-API não respondeu); `total`: pessoas
 * diferentes somando os grupos de GRUPO_OFERTAS (null se não deu para ler todos). `recentes`: os cliques
 * no convite do encurtador. `meta`: o que anunciosDoDia devolveu.
 */
export function relatorioDoDia(mem, agora, { membros = null, total = null, recentes = null, meta = null } = {}) {
  const dia = diaSP(agora);
  const fichas = Object.values(mem.fichas || {});
  // Conta também o que veio depois do relatório de ontem (das 23h50 à meia-noite): com a hora certa do
  // aviso do WhatsApp, quem entra às 23h55 tem a ficha de ontem e ficaria fora dos dois relatórios.
  const corte = mem.relatorioEm && diaSP(new Date(mem.relatorioEm)) < dia ? Date.parse(mem.relatorioEm) : null;
  const doDia = (iso) => !!iso && (diaSP(new Date(iso)) === dia || (corte != null && Date.parse(iso) > corte && diaSP(new Date(iso)) < dia));
  const entraramHoje = fichas.filter(f => doDia(f.e));
  const sairamHoje = fichas.filter(f => doDia(f.s));
  const viaAnuncio = (cod) => entraramHoje.filter(f => cod ? f.de === `anuncio:${cod}` : /^anuncio/.test(String(f.de || ''))).length;
  // Clique de robô que varre o site fica de fora da conta (separarRobos).
  const cliques = separarRobos(recentes);
  const cliquesHoje = cliques.gente.filter(x => doDia(x.quando));
  const robosHoje = cliques.robos.filter(x => doDia(x.quando)).length;
  const conj = meta && meta.conjuntos;
  const gasto = conj ? Math.round(conj.reduce((n, c) => n + c.gasto, 0) * 100) / 100 : null;

  const hist = (mem.relatorios || []).filter(h => h.dia !== dia);
  // Todo mundo: pessoas diferentes nos grupos; sem isso, só a comunidade.
  const todos = total != null ? total : membros;
  const ontem = [...hist].reverse().find(h => h.dia < dia && (total != null ? h.total != null : h.membros != null)) || null;
  const antes = ontem ? (total != null ? ontem.total : ontem.membros) : null;
  mem.relatorios = [...hist, { dia, membros, total, gasto, anuncio: viaAnuncio() }].slice(-40);

  const l = [`\u{1F4CB} *Relatório do dia (${ddmm(dia)})*`];
  // Primeiro dia: a ficha de quem entrou e saiu só começou a contar na hora em que o relatório foi ligado.
  if (mem.fichasInicio && diaSP(new Date(mem.fichasInicio)) === dia) {
    const m = minutoDoDiaSP(new Date(mem.fichasInicio));
    l.push(`_Primeiro dia: entradas e saídas contadas a partir das ${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}. Os cliques e os anúncios são do dia inteiro._`);
  }
  l.push('', '\u{1F465} *Grupo*');
  const desdeOntem = todos != null && antes != null ? ` (${todos - antes >= 0 ? '+' : ''}${todos - antes} desde ontem)` : '';
  if (todos != null) l.push(`• Membros agora: ${todos}${total != null && membros != null && total !== membros ? ' pessoas' : ''}${desdeOntem}`);
  else l.push('• Membros: a Z-API não respondeu agora');
  if (total != null && membros != null && total !== membros) l.push(`   ◦ ${membros} na comunidade, onde entra quem vem do site e do anúncio`);
  l.push(`• Entraram hoje: ${entraramHoje.length}`);
  for (const [k, v] of emOrdem(contar(entraramHoje.map(f => (f.de ? nomeDaOrigem(f.de) : 'sem origem (não clicou no convite pelo site)'))))) l.push(`   ◦ ${k}: ${v}`);
  l.push(`• Saíram hoje: ${sairamHoje.length}`);
  for (const f of sairamHoje.filter(x => x.e)) l.push(`   ◦ ${f.de ? nomeDaOrigem(f.de) : 'sem origem'}: ficou ${quantoFicou(f.e, f.s)}`);
  const antigos = sairamHoje.filter(x => !x.e).length;
  if (antigos) l.push(`   ◦ ${antigos} de antes de ${ddmm(mem.fichasDesde || dia)}`);
  if (cliquesHoje.length) {
    l.push(`• Cliques em "Entrar no grupo": ${cliquesHoje.length} (${emOrdem(contar(cliquesHoje.map(x => rotuloDoClique(x.de)))).map(([k, v]) => `${k}: ${v}`).join(', ')})`);
  } else l.push('• Cliques em "Entrar no grupo": nenhum hoje');
  if (robosHoje) l.push(`   ◦ sem contar ${robosHoje} de robô que abriu os links do site`);

  l.push('', '\u{1F4E3} *Anúncios hoje*');
  if (!conj) l.push('• Não consegui ler a Meta agora');
  else if (!conj.length) l.push('• Nenhum gasto hoje');
  else {
    for (const c of conj) {
      const entrar = c.codigo ? cliquesHoje.filter(x => x.de === `anuncio:${c.codigo}`).length : null;
      const ent = c.codigo ? viaAnuncio(c.codigo) : null;
      const partes = [`R$ ${reais(c.gasto)}`, c.cliques ? `${c.cliques} ${c.cliques === 1 ? 'clique' : 'cliques'} no anúncio` : 'nenhum clique no anúncio'];
      if (entrar != null && c.cliques) partes.push(`${entrar} em Entrar`);
      if (ent != null && (c.cliques || ent)) partes.push(ent ? `${ent} ${ent === 1 ? 'entrou' : 'entraram'}` : 'ninguém entrou');
      l.push(`• ${c.nome}: ${partes.join(', ')}`);
    }
    const n = viaAnuncio();
    l.push(`• Total: R$ ${reais(gasto)}, ${n ? `${n} ${n === 1 ? 'entrou' : 'entraram'} pelo anúncio: R$ ${reais(gasto / n)} por membro` : 'ninguém entrou pelo anúncio hoje'}`);
  }
  // O dia em que a medição começou fica de fora da conta da semana: o gasto é do dia inteiro, mas as
  // entradas só foram contadas a partir da hora em que as fichas ligaram (em 16/11, às 21h55).
  // O gasto de ontem guardado às 23h50 é trocado pelo valor fechado da Meta (o que foi gasto de madrugada entra).
  let fechou = null;
  if (meta && meta.ontem && meta.ontem.dia < dia) {
    const h = mem.relatorios.find(x => x.dia === meta.ontem.dia);
    if (h && h.gasto != null && !h.fechado) {
      if (Math.abs(meta.ontem.gasto - h.gasto) >= 0.01) fechou = { antes: h.gasto, depois: meta.ontem.gasto };
      h.gasto = meta.ontem.gasto; h.fechado = true;
    }
  }
  const diaParcial = mem.fichasInicio ? diaSP(new Date(mem.fichasInicio)) : null;
  const semana = mem.relatorios.filter(h => h.dia > menosDias(dia, 7) && h.gasto != null && h.dia !== diaParcial);
  const g7 = semana.reduce((n, h) => n + h.gasto, 0), e7 = semana.reduce((n, h) => n + (h.anuncio || 0), 0);
  if (fechou) l.push(`• Ontem fechou em R$ ${reais(fechou.depois)} (às 23h50 eram R$ ${reais(fechou.antes)}; a Meta fecha o dia às 5h)`);
  if (semana.length >= 2 && g7 > 0) {
    l.push(e7 ? `• Últimos ${semana.length} dias: R$ ${reais(g7 / e7)} por membro do anúncio (R$ ${reais(g7)} ÷ ${e7}): ${faixaDoCusto(g7 / e7)}`
      : `• Últimos ${semana.length} dias: R$ ${reais(g7)} gastos e ninguém entrou pelo anúncio`);
  }
  if (meta && meta.saldo != null) {
    const ritmo = meta.orcamento > 0 ? meta.orcamento : null;
    l.push(`• Saldo: R$ ${reais(meta.saldo)}${ritmo ? `, dá uns ${Math.floor(meta.saldo / ritmo)} dias com R$ ${reais(ritmo)} por dia` : ''}`);
  }

  l.push('', `\u{1F4C8} *Quem veio de fora desde ${ddmm(mem.fichasDesde || dia)}*`);
  const de = fichas.filter(f => f.e);
  if (!de.length) l.push('• Ninguém ainda');
  else {
    const grupos = {};
    for (const f of de) { const k = categoriaDaOrigem(f.de); grupos[k] = grupos[k] || { e: 0, c: 0 }; grupos[k].e++; if (!f.s) grupos[k].c++; }
    for (const [k, v] of Object.entries(grupos).sort((a, b) => b[1].e - a[1].e)) l.push(`• ${k}: ${v.e} ${v.e === 1 ? 'entrou' : 'entraram'}, ${v.c} ${v.c === 1 ? 'continua' : 'continuam'}`);
    const ficam = de.filter(f => !f.s).length;
    if (todos != null) l.push(`• No grupo agora: ${ficam} de fora e ${Math.max(0, todos - ficam)} de antes`);
  }
  // Domingo: membros dia a dia na semana.
  if (new Date(`${dia}T12:00:00Z`).getUTCDay() === 0) {
    const s = mem.relatorios.filter(h => h.dia > menosDias(dia, 7) && (h.total != null || h.membros != null));
    if (s.length > 1) l.push('', `\u{1F4C6} Semana: ${s.map(h => `${ddmm(h.dia)} ${h.total != null ? h.total : h.membros}`).join(' · ')}`);
  }
  return l.join('\n');
}
