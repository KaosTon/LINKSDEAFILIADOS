// Conferência das fontes do PubMed citadas no blog. Veio do EvolProt (08/10/2026).
//
// Por que isso existe: em setembro de 2026, no blog do EvolProt, rascunhos de post
// saíram com estudo citado de memória: um agente de pesquisa descreveu dois PMIDs
// com o tema errado, um estudo foi citado com o ano errado (2021 em vez de 2022) e
// quase entraram nomes de autor inventados. Link de PubMed parece fonte; se o número
// não bate com o que está escrito, é dado inventado com cara de ciência.
//
// O que confere, em cada link pubmed.ncbi.nlm.nih.gov/<PMID> dos arquivos lidos:
//   1. o PMID existe no PubMed (ERRO se não existe);
//   2. o ano escrito no mesmo <li> ou parágrafo bate com o ano de publicação no
//      PubMed (ERRO se há ano escrito e nenhum bate);
//   3. as palavras do título no PubMed aparecem no texto da citação (AVISO se menos
//      da metade aparece: pode ser título traduzido de propósito, então só avisa).
//
// NÃO roda no build: as travas do `npm run build` rodam sem rede, e esta depende da
// API do NCBI. Rodar à mão antes de abrir PR de post com estudo:
//   npm run check:fontes
//   node scripts/check-fontes.mjs src/data/blog.ts outro-arquivo.ts
// Sem internet ou com o NCBI fora do ar, sai com código 2 ("não conferido"): não
// conta como aprovado.

import { readFileSync } from "node:fs";

const arquivos = process.argv.slice(2).length ? process.argv.slice(2) : ["src/data/blog.ts"];
const API = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";
const LOTE = 150; // ids por requisição; sem chave de API o NCBI aceita 3 requisições por segundo

const semAcento = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const textoPuro = (html) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// Cada citação = o <li> (ou <p>) que contém o link. Sem tag em volta, usa 300
// caracteres antes do link.
const citacoes = [];
for (const arquivo of arquivos) {
  const fonte = readFileSync(arquivo, "utf-8").replace(/\r\n/g, "\n");
  for (const m of fonte.matchAll(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/g)) {
    const antes = fonte.slice(0, m.index);
    const inicio = Math.max(antes.lastIndexOf("<li"), antes.lastIndexOf("<p"));
    const trecho = inicio !== -1 && m.index - inicio < 1500 ? fonte.slice(inicio, m.index) : fonte.slice(Math.max(0, m.index - 300), m.index);
    const slug = [...antes.matchAll(/slug:\s*"([^"]+)"/g)].pop()?.[1] ?? "(sem slug)";
    citacoes.push({ arquivo, slug, pmid: m[1], texto: textoPuro(trecho) });
  }
}

const pmids = [...new Set(citacoes.map((c) => c.pmid))];
console.log(`[check-fontes] ${citacoes.length} links do PubMed (${pmids.length} PMIDs) em ${arquivos.join(", ")}`);
if (pmids.length === 0) {
  console.log("[check-fontes] Nada para conferir.");
  process.exit(0);
}

const resumo = {};
try {
  for (let i = 0; i < pmids.length; i += LOTE) {
    const ids = pmids.slice(i, i + LOTE).join(",");
    const res = await fetch(`${API}?db=pubmed&retmode=json&id=${ids}`, { headers: { "User-Agent": "fabrica-sites-check-fontes/1.0" } });
    if (!res.ok) throw new Error(`NCBI respondeu HTTP ${res.status}`);
    Object.assign(resumo, (await res.json()).result ?? {});
    if (i + LOTE < pmids.length) await new Promise((r) => setTimeout(r, 400));
  }
} catch (err) {
  console.error(`[check-fontes] NÃO CONFERIDO: sem acesso ao PubMed (${err.message}). Rode de novo com internet.`);
  process.exit(2);
}

const erros = [];
const avisos = [];
for (const c of citacoes) {
  const item = resumo[c.pmid];
  const onde = `${c.arquivo} / ${c.slug} / PMID ${c.pmid}`;
  if (!item || item.error || !item.title) {
    erros.push(`${onde}: não existe no PubMed`);
    continue;
  }
  // Vale o ano da revista ou o da publicação online antecipada: os dois são citados
  const anoPubmed = (item.pubdate || "").slice(0, 4);
  const anoOnline = (item.epubdate || "").slice(0, 4);
  const anosValidos = [anoPubmed, anoOnline].filter(Boolean);
  const anosEscritos = [...c.texto.matchAll(/\b(19[5-9]\d|20[0-4]\d)\b/g)].map((m) => m[1]);
  if (anosEscritos.length && anoPubmed && !anosEscritos.some((a) => anosValidos.includes(a))) {
    const pubmedDiz = anoOnline && anoOnline !== anoPubmed ? `${anoPubmed} (online ${anoOnline})` : anoPubmed;
    erros.push(`${onde}: o texto diz ${[...new Set(anosEscritos)].join("/")}, o PubMed diz ${pubmedDiz} ("${item.title}")`);
  }
  const palavras = semAcento(item.title).match(/[a-z0-9]{5,}/g) ?? [];
  const texto = semAcento(c.texto);
  const achadas = palavras.filter((p) => texto.includes(p)).length;
  if (palavras.length >= 3 && achadas / palavras.length < 0.5) {
    // Nenhuma palavra em comum costuma ser PMID errado (caso real: um estudo de
    // treino apontava para um artigo sobre bactéria de solo). Abrir e conferir.
    const grau = achadas === 0 ? "NENHUMA palavra do título bate" : `${achadas} de ${palavras.length} palavras do título batem`;
    avisos.push(`${onde}: ${grau} ("${item.title}", ${anoPubmed})`);
  }
}

for (const a of avisos) console.warn(`[check-fontes] aviso: ${a}`);
if (erros.length) {
  console.error(`[check-fontes] FALHOU (${erros.length}):`);
  for (const e of erros) console.error(`  - ${e}`);
  // exitCode, não exit(): no Windows, process.exit() logo depois do fetch derruba o
  // Node com "Assertion failed" (código 127) e o erro real some.
  process.exitCode = 1;
} else {
  console.log(`[check-fontes] OK: ${pmids.length} PMIDs existem e os anos citados batem com o PubMed.`);
}
