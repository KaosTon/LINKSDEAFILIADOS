// Trava automatica: travessao nao entra no que vai pro ar.
//
// Regra da casa (vem do site da Virtus, onde foi criada em 14/09/2026 depois de achar
// 16 travessoes no repositorio, 10 em texto que o visitante le): sem travessao ("—",
// U+2014), nem em copy nem em codigo nem em comentario. E o tell mais comum de texto
// de IA, e o PT-BR usa virgula, dois-pontos, parenteses ou reticencias. Regra com
// excecao e regra que volta, por isso vale em tudo.
//
// A meia-risca ("–", U+2013) NAO trava: e usada como separador em titulo e em nome
// proprio. O script so conta e informa.
//
// Escopo: src/ e public/ (o que vai pro ar). DOCS/ fica de fora de proposito.
// Roda dentro do `npm run build`, 100% estatico, sem rede.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const TRAVESSAO = "—";
const MEIA_RISCA = "–";

const RAIZES = ["src", "public"];
const IGNORAR_PASTA = new Set(["node_modules", ".next", ".git"]);
const EXT_TEXTO = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".html", ".htm", ".json", ".md", ".txt", ".svg", ".xml"]);

function* arquivos(dir) {
  let entradas;
  try {
    entradas = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entradas) {
    const caminho = join(dir, e.name);
    if (e.isDirectory()) {
      if (!IGNORAR_PASTA.has(e.name)) yield* arquivos(caminho);
    } else if (EXT_TEXTO.has(extname(e.name).toLowerCase())) {
      yield caminho;
    }
  }
}

const achados = [];
let meiaRisca = 0;
let lidos = 0;

for (const raiz of RAIZES) {
  try {
    statSync(raiz);
  } catch {
    continue;
  }
  for (const caminho of arquivos(raiz)) {
    let texto;
    try {
      texto = readFileSync(caminho, "utf8");
    } catch {
      continue;
    }
    lidos++;
    if (texto.includes(MEIA_RISCA)) meiaRisca += texto.split(MEIA_RISCA).length - 1;
    if (!texto.includes(TRAVESSAO)) continue;
    texto.split("\n").forEach((linha, i) => {
      if (!linha.includes(TRAVESSAO)) return;
      const col = linha.indexOf(TRAVESSAO);
      const trecho = linha.slice(Math.max(0, col - 45), col + 45).trim();
      achados.push(`${caminho.replace(/\\/g, "/")}:${i + 1}  ...${trecho}...`);
    });
  }
}

if (achados.length) {
  console.error(`\n✖ Travessao encontrado em ${achados.length} linha(s). A regra da casa e nao usar:\n`);
  for (const a of achados) console.error("  - " + a);
  console.error("\n  Troque por virgula, dois-pontos, parenteses ou ponto final, o que couber na frase.\n");
  process.exit(1);
}

console.log(
  `✓ Copy ok: nenhum travessao em ${lidos} arquivos de src/ e public/` +
    (meiaRisca ? ` (${meiaRisca} meia-risca, que nao trava).` : "."),
);
