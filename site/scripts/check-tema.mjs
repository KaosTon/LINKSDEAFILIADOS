// Trava automatica: as cores de src/data/tema.ts batem com os tokens de src/app/globals.css.
//
// O icone da aba, o icone Apple, a imagem de compartilhamento e o manifest nao leem CSS, entao
// as cores deles moram em tema.ts. Sem esta trava, trocar a marca no CSS deixaria o icone e a
// previa do link no WhatsApp com a cor antiga, sem ninguem perceber.
// 100% estatica. Roda no `npm run build`.

import { readFileSync } from "node:fs";

const css = readFileSync("src/app/globals.css", "utf8");
const tema = readFileSync("src/data/tema.ts", "utf8");

const erros = [];
const cores = [...tema.matchAll(/^\s+(\w+): "(#[0-9a-fA-F]{6})"/gm)];
if (!cores.length) erros.push("nao achei as cores em src/data/tema.ts (formato mudou: trava cega)");
for (const [, nome, valor] of cores) {
  const m = css.match(new RegExp(`--${nome}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) erros.push(`tema.ts tem "${nome}", mas globals.css nao tem --${nome}`);
  else if (m[1].toLowerCase() !== valor.toLowerCase()) erros.push(`${nome}: tema.ts ${valor} x globals.css ${m[1]}`);
}

if (erros.length) {
  console.error("\n✖ Cores fora de sincronia entre src/data/tema.ts e src/app/globals.css:\n");
  for (const e of erros) console.error("  - " + e);
  console.error("\n  Corrija os dois juntos: o CSS pinta o site, o tema.ts pinta icone e imagem de compartilhamento.\n");
  process.exit(1);
}
console.log(`✓ Tema ok: ${cores.length} cores iguais no CSS e no tema.ts.`);
