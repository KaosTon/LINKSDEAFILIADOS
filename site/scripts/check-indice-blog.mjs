// Trava automática: todo post do blog PRECISA estar no índice anti-canibalização
// do DOCS/BLOG.md (§3). Copiada do site da Virtus em 25/09/2026; o caso que a criou
// está abaixo.
//
// Por que isso existe: o índice é o único lugar onde dá para checar, antes de
// escrever, se um tema já foi coberto. Em 26/08/2026 propus criar um post
// "Azos é confiável" que JÁ EXISTIA (o `azos-seguro-de-vida-vale-a-pena`, cujo
// metaTitle é literalmente "Azos é confiável? Nota 9,3"). O índice estava lá e
// eu não consultei. Na mesma varredura, o post
// `melhor-consorcio-porto-ademicon-embracon-rodobens` (19/08) estava fora do
// índice porque alguém esqueceu de registrar.
//
// Doc depende de alguém ler e de alguém lembrar de atualizar; esta trava não.
//
// Roda no build (package.json -> "build") e pode ser chamada à mão:
//   npm run check:indice
//
// Uso extra, para consultar antes de escrever um tema novo:
//   node scripts/check-indice-blog.mjs --tema "seguro de moto"

import { readFileSync } from "node:fs";

const BLOG = "src/data/blog.ts";
const PROTOCOLO = "DOCS/BLOG.md";

// CRLF do Windows vira LF: os regex abaixo contam com "\n"
const blog = readFileSync(BLOG, "utf-8").replace(/\r\n/g, "\n");
const protocolo = readFileSync(PROTOCOLO, "utf-8").replace(/\r\n/g, "\n");

const slugsCodigo = [...blog.matchAll(/\n    slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const slugsIndice = [...protocolo.matchAll(/^\d+\.\s+`([^`]+)`/gm)].map((m) => m[1]);

// --- modo consulta: "esse tema ja existe?" -----------------------------------
const argTema = process.argv.indexOf("--tema");
if (argTema !== -1) {
  const termo = (process.argv[argTema + 1] || "").toLowerCase().trim();
  if (!termo) {
    console.error('Uso: node scripts/check-indice-blog.mjs --tema "palavra chave"');
    process.exit(1);
  }
  const palavras = termo.split(/\s+/).filter((p) => p.length > 3);
  const achados = [];
  for (const [, slug, corpo] of blog.matchAll(/\n    slug:\s*"([^"]+)"([\s\S]*?)(?=\n    slug:|$)/g)) {
    const titulo = (corpo.match(/titulo:\s*"([^"]+)"/) || [])[1] || "";
    const metaTitle = (corpo.match(/metaTitle:\s*"([^"]+)"/) || [])[1] || "";
    const tags = (corpo.match(/tags:\s*\[([^\]]*)\]/) || [])[1] || "";
    const alvo = `${slug} ${titulo} ${metaTitle} ${tags}`.toLowerCase().replace(/-/g, " ");
    const hits = palavras.filter((p) => alvo.includes(p));
    if (hits.length) achados.push({ slug, titulo, score: hits.length, hits });
  }
  achados.sort((a, b) => b.score - a.score);
  if (!achados.length) {
    console.log(`\nNenhum post cobre "${termo}". Tema livre.\n`);
  } else {
    console.log(`\nPosts que já tocam em "${termo}" (confira antes de escrever):\n`);
    for (const a of achados.slice(0, 8)) {
      console.log(`  [${a.hits.join(", ")}]  ${a.slug}`);
      console.log(`      ${a.titulo.slice(0, 92)}`);
    }
    console.log("");
  }
  process.exit(0);
}

// --- modo trava: roda no build ------------------------------------------------
const faltando = slugsCodigo.filter((s) => !slugsIndice.includes(s));
const fantasma = slugsIndice.filter((s) => !slugsCodigo.includes(s));

if (faltando.length || fantasma.length) {
  console.error("\n✖ Índice do blog fora de sincronia com src/data/blog.ts:\n");
  if (faltando.length) {
    console.error(`  Posts que EXISTEM e não estão no índice do DOCS/BLOG.md (${faltando.length}):`);
    for (const s of faltando) console.error(`    - ${s}`);
    console.error("\n  Adicione cada um no final da lista numerada do §3, com uma linha dizendo");
    console.error("  de que buscas o post é dono e com o que ele NÃO deve ser confundido.");
  }
  if (fantasma.length) {
    console.error(`\n  No índice mas sem post correspondente (${fantasma.length}):`);
    for (const s of fantasma) console.error(`    - ${s}`);
    console.error("\n  Ou o slug mudou, ou o post foi removido. Corrija o índice.");
  }
  console.error("\n  Regra: DOCS/BLOG.md §3. O índice é o que evita escrever duas vezes o");
  console.error("  mesmo tema, e ele só funciona se estiver completo.\n");
  process.exit(1);
}

console.log(
  `✓ Índice do blog ok: ${slugsCodigo.length} posts, todos registrados no anti-canibalização.`
);
