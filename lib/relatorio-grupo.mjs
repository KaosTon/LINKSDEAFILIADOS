// Relatório do dia (17/11/2026). Vai colado no fluxo 05 logo depois de lib/aviso-entrada.mjs,
// no mesmo nó: usa nomeDaOrigem de lá.
import { nomeDaOrigem, idDoMembro } from './aviso-entrada.mjs';
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
export const marcarRelatorio = (mem, agora) => { mem.relatorioDia = diaSP(agora); };

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
  return { conjuntos: ins ? conjuntosDoDia(ins) : null, saldo: saldoDaConta(info), orcamento: sets ? orcamentoDiario(sets) : null };
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
  if (h < 1) return 'menos de 1 hora';
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
  const doDia = (iso) => iso && diaSP(new Date(iso)) === dia;
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
  const semana = mem.relatorios.filter(h => h.dia > menosDias(dia, 7) && h.gasto != null);
  const g7 = semana.reduce((n, h) => n + h.gasto, 0), e7 = semana.reduce((n, h) => n + (h.anuncio || 0), 0);
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
