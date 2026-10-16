// Passo depois do `next build` (export estatico): corrige os arquivos de pre-carregamento.
//
// Problema achado em 08/10/2026 no site-modelo e no da Michele: o Next 16 grava o pre-carregamento
// de cada pagina em subpastas (out/sobre/__next.sobre/__PAGE__.txt), mas o navegador pede o
// arquivo com o caminho em linha, separado por ponto (/sobre/__next.sobre.__PAGE__.txt). No
// Cloudflare isso da 404 em todo link interno: a navegacao ainda funciona, so que vira
// carregamento completo (mais lento) e enche o console de erro.
//
// Aqui, para cada pasta "__next.*" dentro de out/, cada arquivo la dentro ganha uma copia ao
// lado da pasta com o nome em linha. Os originais ficam. 100% local, sem rede.

import { readdirSync, statSync, copyFileSync, existsSync } from "node:fs";
import { join, relative, sep, dirname } from "node:path";

const OUT = "out";
if (!existsSync(OUT)) {
  console.error("✖ pos-export: pasta out/ nao existe (o next build rodou com output: \"export\"?)");
  process.exit(1);
}

let copiados = 0;
function arquivos(dir, lista = []) {
  for (const nome of readdirSync(dir)) {
    const c = join(dir, nome);
    if (statSync(c).isDirectory()) arquivos(c, lista);
    else lista.push(c);
  }
  return lista;
}
function anda(dir) {
  for (const nome of readdirSync(dir)) {
    const c = join(dir, nome);
    if (!statSync(c).isDirectory()) continue;
    if (nome.startsWith("__next.")) {
      for (const f of arquivos(c)) {
        const emLinha = join(dirname(c), [nome, ...relative(c, f).split(sep)].join("."));
        if (!existsSync(emLinha)) {
          copyFileSync(f, emLinha);
          copiados++;
        }
      }
    } else if (nome !== "_next") {
      anda(c);
    }
  }
}
anda(OUT);
console.log(`✓ pos-export: ${copiados} arquivos de pre-carregamento com o nome que o navegador pede.`);
