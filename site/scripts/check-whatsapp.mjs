// Trava automatica: todo botao de WhatsApp abre a conversa dizendo de onde a pessoa veio.
//
// Adaptada do check-whatsapp-routing da Virtus, que nasceu da auditoria de 13/09/2026: 19 posts
// sem mensagem propria e 56 botoes abrindo conversa vazia, somando 45% dos cliques organicos
// do site. O vendedor recebia "Oi" e nao sabia de qual pagina vinha o contato. Aqui ha um
// numero so, entao a parte de roteamento entre numeros ficou de fora.
//
// O build FALHA se:
//   1. algum arquivo de src/ montar link wa.me na mao (o unico lugar e linkWhats, em site.ts);
//   2. algum componente passar texto solto pra linkWhats("...") em vez de usar
//      src/data/whatsapp.ts (mensagem espalhada e mensagem que ninguem acha pra mudar);
//   3. um post do blog, uma pagina de servico ou uma rota fixa ficar sem mensagem propria
//      em src/data/whatsapp.ts (o botao do topo e o flutuante cairiam na frase generica);
//   4. sobrar mensagem de post, servico ou rota que nao existe mais.
//
// 100% estatica, sem rede. Roda no `npm run build`.

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const erros = [];
const ler = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");

function arquivos(dir, out = []) {
  for (const nome of readdirSync(dir)) {
    const c = join(dir, nome);
    if (statSync(c).isDirectory()) arquivos(c, out);
    else if (/\.(tsx?|mjs)$/.test(nome)) out.push(c);
  }
  return out;
}

// ---------------------------------------------------------------- 1 e 2: codigo
for (const arq of arquivos("src")) {
  const rel = arq.replace(/\\/g, "/");
  const texto = ler(arq);
  const linha = (i) => texto.slice(0, i).split("\n").length;
  if (rel !== "src/data/site.ts") {
    for (const m of texto.matchAll(/wa\.me\/|api\.whatsapp\.com/g)) {
      // comentario explicando a regra nao conta
      const inicioLinha = texto.lastIndexOf("\n", m.index) + 1;
      if (/^\s*(\/\/|\*)/.test(texto.slice(inicioLinha, m.index))) continue;
      erros.push(`${rel}:${linha(m.index)}  link de WhatsApp montado na mao: use linkWhats(...) de src/data/site.ts`);
    }
  }
  if (rel !== "src/data/whatsapp.ts") {
    for (const m of texto.matchAll(/linkWhats\(\s*["'`]/g)) {
      erros.push(`${rel}:${linha(m.index)}  mensagem solta em linkWhats("..."): coloque a frase em src/data/whatsapp.ts`);
    }
  }
}

// ---------------------------------------------------------------- 3 e 4: cobertura
const whats = ler("src/data/whatsapp.ts");
function chaves(nome) {
  const bloco = whats.match(new RegExp(`export const ${nome}[^=]*= \\{([\\s\\S]*?)\\n\\};`));
  if (!bloco) {
    erros.push(`src/data/whatsapp.ts: nao achei ${nome} (o formato mudou e a trava ficaria cega)`);
    return new Set();
  }
  return new Set([...bloco[1].matchAll(/^\s+"?([^":\s]+)"?:/gm)].map((m) => m[1]));
}

function compara(rotulo, existentes, comMensagem, arquivoDono) {
  for (const s of existentes) {
    if (!comMensagem.has(s)) erros.push(`${rotulo} "${s}" sem mensagem propria em src/data/whatsapp.ts`);
  }
  for (const s of comMensagem) {
    if (!existentes.has(s)) erros.push(`src/data/whatsapp.ts tem mensagem pra ${rotulo} "${s}", que nao existe em ${arquivoDono}`);
  }
}

const slugs = (arq) => (existsSync(arq) ? new Set([...ler(arq).matchAll(/^ {4}slug: "([^"]+)"/gm)].map((m) => m[1])) : new Set());

compara("post", slugs("src/data/blog.ts"), chaves("MENSAGENS_POST"), "src/data/blog.ts");
compara("servico", slugs("src/data/paginas-servico.ts"), chaves("MENSAGENS_SERVICO"), "src/data/paginas-servico.ts");

// rotas fixas: todo page.tsx fora de segmento dinamico
const rotas = new Set();
(function paginas(dir, base) {
  for (const nome of readdirSync(dir)) {
    const c = join(dir, nome);
    if (statSync(c).isDirectory()) {
      if (nome.startsWith("[")) continue;
      paginas(c, nome.startsWith("(") ? base : `${base}/${nome}`);
    } else if (nome === "page.tsx") rotas.add(base || "/");
  }
})("src/app", "");
compara("rota", rotas, chaves("MENSAGENS_ROTA"), "src/app");

if (erros.length) {
  console.error(`\n✖ WhatsApp sem mensagem de origem (${erros.length}):\n`);
  for (const e of erros) console.error("  - " + e);
  console.error("\n  Toda conversa tem que dizer de qual pagina a pessoa veio (DOCS/METODO.md §6).\n");
  process.exit(1);
}

console.log(`✓ WhatsApp ok: ${rotas.size} rotas, posts e procedimentos com mensagem propria; nenhum link montado na mao.`);
