// Trava automatica: pagina gerada a partir de dado tem que apontar pra dado que existe.
//
// Faz o papel do check-operadoras da Virtus (la: toda pagina de operadora registrada no menu,
// no sitemap e no mapa de mensagens). Aqui menu, sitemap, home e mensagens ja saem do proprio
// dado (SERVICOS, UNIDADES, POSTS), entao nao da pra esquecer de registrar; o que ainda
// pode quebrar em silencio e o dado apontar pro vazio:
//   1. pagina em paginas-servico.ts com slug que nao existe em SERVICOS (a rota
//      geraria 404 sem aviso);
//   2. post do blog com `servico` que nao existe em SERVICOS (sumiria o link de saida);
//   3. unidade com foto que nao existe em public/ (imagem quebrada na home e na pagina dela);
//   4. foto de resultado (RESULTADOS) que nao existe em public/.
// 100% estatica. Roda no `npm run build`.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ler = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const erros = [];

const site = ler("src/data/site.ts");
const bloco = (nome) => site.match(new RegExp(`export const ${nome}[\\s\\S]*?\\n\\];`))?.[0] ?? "";
const procedimentos = new Set([...bloco("SERVICOS").matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]));
if (!procedimentos.size) erros.push("nao achei SERVICOS em src/data/site.ts (formato mudou: trava cega)");

for (const m of ler("src/data/paginas-servico.ts").matchAll(/^ {4}slug: "([^"]+)"/gm)) {
  if (!procedimentos.has(m[1])) erros.push(`paginas-servico.ts: "${m[1]}" nao existe em SERVICOS (site.ts)`);
}

if (existsSync("src/data/blog.ts")) {
  for (const m of ler("src/data/blog.ts").matchAll(/^ {4}servico: "([^"]+)"/gm)) {
    if (!procedimentos.has(m[1])) erros.push(`blog.ts: servico "${m[1]}" nao existe em SERVICOS (site.ts)`);
  }
}

// 4. foto de resultado cadastrada em RESULTADOS tem que existir em public/
for (const m of bloco("RESULTADOS").matchAll(/^\s+\{ servico: "([^"]+)", arquivo: "([^"]+)"/gm)) {
  if (!procedimentos.has(m[1])) erros.push(`RESULTADOS: servico "${m[1]}" nao existe em SERVICOS`);
  if (!existsSync(join("public", m[2]))) erros.push(`RESULTADOS: foto ${m[2]} nao existe em public/`);
}

// 5. foto de servico (cards da home) cadastrada tem que existir em public/
for (const m of bloco("SERVICOS").matchAll(/foto: "([^"]+)"/g)) {
  if (!existsSync(join("public", m[1]))) erros.push(`SERVICOS: foto ${m[1]} nao existe em public/`);
}

// 6. capa de post do blog tem que existir em public/
if (existsSync("src/data/blog.ts")) {
  const blog = ler("src/data/blog.ts");
  const slugsPost = [...blog.matchAll(/^ {4}slug: "([^"]+)"/gm)].map((m) => m[1]);
  const capas = [...blog.matchAll(/^ {4}imagem: "([^"]+)"/gm)].map((m) => m[1]);
  if (capas.length !== slugsPost.length) erros.push(`blog.ts: ${slugsPost.length} posts e ${capas.length} capas (todo post precisa de imagem)`);
  for (const c of capas) if (!existsSync(join("public", c))) erros.push(`blog.ts: capa ${c} nao existe em public/`);
}

const unidades = bloco("UNIDADES");
let fotos = 0;
for (const m of unidades.matchAll(/foto: "([^"]+)"/g)) {
  fotos++;
  if (!existsSync(join("public", m[1]))) erros.push(`UNIDADES: foto ${m[1]} nao existe em public/`);
}

if (erros.length) {
  console.error(`\n✖ Dado apontando pro vazio (${erros.length}):\n`);
  for (const e of erros) console.error("  - " + e);
  console.error("");
  process.exit(1);
}
console.log(`✓ Paginas ok: ${procedimentos.size} servicos, paginas e posts apontando pra dado que existe, ${fotos} fotos de unidade no lugar.`);
