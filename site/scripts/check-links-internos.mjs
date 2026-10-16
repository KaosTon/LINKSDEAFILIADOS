// Trava automatica: link interno tem que apontar pra pagina que existe.
//
// Vem do site da Virtus (criada em 18/09/2026 depois de um post ficar tres dias no ar
// com href pra rota inexistente, e de 456 links de tag apontando pra uma busca que
// nunca funcionou). Aqui, adaptada: ainda sem blog, sem mapa de tags; quando eles
// existirem, este script ja os enxerga (ver "rotas validas").
//
// O que confere, 100% estatico, sem rede:
//   1. todo href="/..." em src/ (JSX e HTML em string);
//   2. todo `href: "/..."` em objeto de dados (vira <Link href={x.href}> e escaparia);
//   3. destino de redirect do next.config.ts nao pode ser usado como link (aponte direto).
// O universo de rotas validas sai do proprio repositorio: page.tsx e route.ts em src/app,
// slugs do blog (src/data/blog.ts, se existir) e arquivos de public/.

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const erros = [];

// ---------------------------------------------------------------- rotas validas
const rotas = new Set(["/"]);

function paginas(dir, base) {
  for (const nome of readdirSync(dir)) {
    const c = join(dir, nome);
    if (statSync(c).isDirectory()) {
      if (nome.startsWith("[")) continue; // segmento dinamico: tratado a parte
      const seg = nome.startsWith("(") ? base : `${base}/${nome}`;
      paginas(c, seg);
    } else if (nome === "page.tsx" || nome === "route.ts") {
      rotas.add(base || "/");
    }
  }
}
paginas("src/app", "");

if (existsSync("src/data/blog.ts")) {
  const blog = readFileSync("src/data/blog.ts", "utf8").replace(/\r\n/g, "\n");
  for (const m of blog.matchAll(/^\s+slug: "([^"]+)"/gm)) rotas.add(`/blog/${m[1]}`);
}

// rotas dinamicas conhecidas. /servicos/[slug] so gera pagina pro slug com conteudo em
// src/data/paginas-servico.ts (dynamicParams = false): os outros slugs de SERVICOS dao 404
// e por isso NAO entram aqui. /unidades/[slug] a partir de UNIDADES, quando existir.
// ATENCAO, motor alterado so aqui (16/10/2026): no Tem Descontos a rota dessas paginas e
// /guias/[slug]. Levar para a fabrica (pasta da rota configuravel).
for (const pastaRota of ["servicos", "guias"]) {
  if (existsSync("src/data/paginas-servico.ts") && existsSync(`src/app/${pastaRota}/[slug]`)) {
    const paginas = readFileSync("src/data/paginas-servico.ts", "utf8");
    for (const m of paginas.matchAll(/^    slug: "([^"]+)"/gm)) rotas.add(`/${pastaRota}/${m[1]}`);
  }
}
if (existsSync("src/data/site.ts") && existsSync("src/app/unidades/[slug]")) {
  const site = readFileSync("src/data/site.ts", "utf8");
  const bloco = site.match(/export const UNIDADES[\s\S]*?\n\];/);
  if (bloco) for (const m of bloco[0].matchAll(/slug: "([^"]+)"/g)) rotas.add(`/unidades/${m[1]}`);
}

const redirects = new Map();
if (existsSync("next.config.ts")) {
  const cfg = readFileSync("next.config.ts", "utf8");
  for (const m of cfg.matchAll(/source:\s*['"]([^'"]+)['"],\s*\n\s*destination:\s*['"]([^'"]+)['"]/g)) {
    if (!m[1].includes(":")) redirects.set(m[1], m[2]);
  }
}

const existe = (href) => {
  const limpo = href.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
  if (rotas.has(limpo)) return true;
  if (/\.[a-z0-9]{2,5}$/i.test(limpo) && existsSync(join("public", limpo))) return true;
  if (["/sitemap.xml", "/robots.txt", "/opengraph-image"].includes(limpo)) return true;
  return false;
};

// ---------------------------------------------------------------- hrefs em src/
function arquivos(dir, out = []) {
  for (const nome of readdirSync(dir)) {
    const c = join(dir, nome);
    if (statSync(c).isDirectory()) arquivos(c, out);
    else if (/\.(tsx?|mjs)$/.test(nome)) out.push(c);
  }
  return out;
}

let conferidos = 0;
for (const arq of arquivos("src")) {
  const texto = readFileSync(arq, "utf8");
  // href="/caminho" (JSX/HTML) e href: "/caminho" (objeto de dados). Template com ${...} fica fora.
  for (const m of texto.matchAll(/href(?:=\{?|:\s*)["'`](\/[^"'`$\s]*)["'`]\}?/g)) {
    const href = m[1];
    if (href.startsWith("//")) continue;
    conferidos++;
    const limpo = href.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
    const linha = texto.slice(0, m.index).split("\n").length;
    const onde = `${arq.replace(/\\/g, "/")}:${linha}`;
    if (redirects.has(limpo)) erros.push(`${onde}  href="${href}" passa por redirect: aponte direto pra "${redirects.get(limpo)}"`);
    else if (!existe(href)) erros.push(`${onde}  href="${href}" nao existe (404)`);
  }
}

if (erros.length) {
  console.error(`\n✖ Link interno com problema (${erros.length}):\n`);
  for (const e of erros) console.error("  - " + e);
  console.error("\n  Confira o caminho certo em src/app.\n");
  process.exit(1);
}

console.log(`✓ Links internos ok: ${conferidos} href conferidos contra ${rotas.size} rotas.`);
