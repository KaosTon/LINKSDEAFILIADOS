// Trava deste site (nao e motor): a palavra "robô" nao entra no que vai pro ar.
//
// Decisao do Wellington em 18/10/2026: o site fala da CONFERENCIA ("conferimos o preço na loja"),
// nao da automacao. "Robô" soa como disparo em massa para quem entra no grupo e entrega a
// concorrente o argumento para denunciar o numero (a Z-API nao e a API oficial do WhatsApp).
// Nunca o contrario: nao escrever que uma pessoa confere cada oferta a mao, porque nao e verdade.
// Texto certo: "conferimos", "nossa conferência", "as regras de conferência do Tem Descontos".
//
// Escopo: src/ e public/ (o que vai pro ar). DOCS/ e os arquivos do robo fora do site ficam de fora.
// Roda dentro do `npm run build`, 100% estatico, sem rede.
import { readdirSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";

// \b nao serve: sem a flag u o JS acha que "ô" nao e letra e "robô" escapava (teste em 18/10/2026)
const PROIBIDO = /(?<!\p{L})rob[ôo]s?(?!\p{L})/giu;
const RAIZES = ["src", "public"];
const EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".txt", ".html", ".svg", ".xml"]);

function* arquivos(dir) {
  let itens;
  try { itens = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of itens) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "node_modules") yield* arquivos(p); }
    else if (EXT.has(extname(e.name).toLowerCase())) yield p;
  }
}

const achados = [];
for (const raiz of RAIZES) {
  for (const arq of arquivos(raiz)) {
    readFileSync(arq, "utf8").split("\n").forEach((linha, i) => {
      // comentario de codigo ("o robo do repo LINKSDEAFILIADOS") nao vai pra tela: fica de fora
      if (/^\s*(\/\/|\/\*|\*|\{\/\*)/.test(linha)) return;
      const texto = linha.replace(/\/\/.*$|\/\*.*?\*\/|\{\/\*.*?\*\/\}/g, "");
      for (const m of texto.matchAll(PROIBIDO)) {
        achados.push(`${arq}:${i + 1}  ...${texto.slice(Math.max(0, m.index - 40), m.index + 40).trim()}...`);
      }
    });
  }
}

if (achados.length) {
  console.error(`✗ "robô" no texto do site (${achados.length}). Fale da conferência, nao da automacao (scripts/check-robo.mjs):`);
  for (const a of achados) console.error("  " + a);
  process.exit(1);
}
console.log('✓ Sem "robô" no texto do site: fala da conferência, não da automação.');
