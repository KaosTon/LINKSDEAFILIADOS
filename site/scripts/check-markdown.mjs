// Trava automatica: o corpo do post e HTML, nunca Markdown.
//
// Copiada do site da Virtus (25/09/2026) sem mudanca de regra; historia do caso abaixo.
//
// O campo `conteudo` de src/data/blog.ts vai direto pro navegador com
// dangerouslySetInnerHTML (src/app/blog/[slug]/page.tsx). Markdown ali
// nao vira formatacao: aparece cru na tela.
//
// Por que existe: em 18/09/2026 um post entrou escrito em Markdown e ficou tres
// dias no ar assim. O visitante lia "## Tabela de indenizacao" e "**negrito**"
// como texto, e os 5 links internos apareciam como "[seguro de vida](/url)",
// nenhum clicavel. Foram 10 titulos, 21 negritos, 18 topicos e 10 linhas
// horizontais expostos, num post de 2.254 palavras sem um unico <h2>.
// Nenhuma trava pegava isso, e o build passava limpo.
//
// Varre `conteudo`, `resumoRapido` e `faq`. Roda dentro do `npm run build`,
// 100% estatico, sem rede.

import { readFileSync } from "node:fs";

const fonte = readFileSync("src/data/blog.ts", "utf8").replace(/\r\n/g, "\n");

// corta em blocos: de um '    slug: "' ate o proximo
const cortes = [...fonte.matchAll(/^ {4}slug: "/gm)].map((m) => m.index);
cortes.push(fonte.length);

// Cada regra: nome, regex e o que o visitante veria na tela.
const REGRAS = [
  { nome: "titulo em Markdown", re: /^\s{0,3}#{1,6} \S/gm, vira: "## Titulo aparece como texto, e o post fica sem <h2>" },
  { nome: "negrito em Markdown", re: /\*\*[^\n*]{2,80}\*\*/g, vira: "**palavra** aparece com os asteriscos na tela" },
  { nome: "lista em Markdown", re: /^\s{0,3}[*+] \S/gm, vira: "* item aparece como texto, sem virar lista" },
  { nome: "link em Markdown", re: /\[[^\]\n]{2,80}\]\((?:\/|https?:)[^)\s]+\)/g, vira: "[texto](link) aparece como texto e o link NAO fica clicavel" },
  { nome: "linha horizontal em Markdown", re: /^\s{0,3}-{3,}\s*$/gm, vira: "--- aparece como tracinhos no meio do texto" },
  { nome: "tabela em Markdown", re: /^\s{0,3}\|.+\|\s*$/gm, vira: "a tabela vira um amontoado de barras verticais" },
];

const erros = [];
// Post cujo corpo a trava nao conseguiu ler: silencio aqui seria pior que erro.
const semConteudo = [];

for (let i = 0; i < cortes.length - 1; i++) {
  const bloco = fonte.slice(cortes[i], cortes[i + 1]);
  const slug = bloco.match(/slug: "([^"]+)"/)?.[1] ?? "(sem slug)";

  // Le do abre-crase ate a proxima crase. Nenhum post usa crase dentro do
  // texto, entao a primeira que aparece e a que fecha.
  // Duas armadilhas ja pisadas ao escrever esta trava, em 21/09/2026:
  //   1. exigir outro campo depois do `conteudo` (ele e o ultimo campo em
  //      alguns posts, e a trava passava batido, falso negativo);
  //   2. exigir virgula depois da crase (61 dos 84 posts fecham com crase e
  //      quebra de linha, sem virgula, e a trava ficava cega neles).
  const campos = [];
  const c = bloco.match(/conteudo: `([^`]*)`/);
  if (c) campos.push(["conteudo", c[1]]);
  else semConteudo.push(slug);

  const r = bloco.match(/resumoRapido: \[([\s\S]*?)\n {4}\]/);
  if (r) campos.push(["resumoRapido", r[1]]);
  const f = bloco.match(/faq: \[([\s\S]*?)\n {4}\]/);
  if (f) campos.push(["faq", f[1]]);

  for (const [campo, texto] of campos) {
    for (const regra of REGRAS) {
      regra.re.lastIndex = 0;
      const achados = [...texto.matchAll(regra.re)];
      if (achados.length) {
        const exemplo = achados[0][0].trim().slice(0, 70);
        erros.push(
          `${slug} (${campo}): ${regra.nome}, ${achados.length} ocorrencia(s). ` +
            `Exemplo: ${JSON.stringify(exemplo)}\n      Na tela: ${regra.vira}`
        );
      }
    }
  }
}

if (semConteudo.length) {
  console.error(`\n✖ check-markdown nao conseguiu ler o corpo de ${semConteudo.length} post(s): ${semConteudo.join(", ")}`);
  console.error("  O formato de src/data/blog.ts mudou e a trava ficaria cega. Ajuste o regex antes de seguir.\n");
  process.exit(1);
}

if (erros.length) {
  console.error("\n✖ Markdown no corpo do post. O campo e HTML: Markdown aparece cru na tela.\n");
  for (const e of erros) console.error("  - " + e);
  console.error(
    "\n  Converta antes de publicar: ## vira <h2>, ** vira <strong>, * vira <ul><li>,\n" +
      '  [texto](url) vira <a href="url">texto</a>, --- some, e tabela vira <table>.\n' +
      "  Protocolo: DOCS/BLOG.md.\n"
  );
  process.exit(1);
}

console.log(`✓ Corpo dos posts em HTML: nenhum resquicio de Markdown em ${cortes.length - 1} posts (todos lidos).`);
