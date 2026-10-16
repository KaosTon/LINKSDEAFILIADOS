import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Fonte das imagens geradas com next/og (icone, icone da Apple e imagem de compartilhamento).
// Arquivo no repo (assets/fonts, licenca OFL ao lado) porque o next/og nao le as fontes do
// next/font. Tem que ser estatica (WOFF de um peso so): com a versao variavel o build quebra.
//
// ATENCAO, motor alterado so aqui (16/10/2026): no modelo esta funcao e fontesCormorant() e le a
// Cormorant. Aqui le a Bricolage Grotesque 800, a fonte de titulos do Tem Descontos. Levar para a
// fabrica como fonte configuravel (CLAUDE.md, "Onde estamos").
const pasta = join(process.cwd(), "assets/fonts");

export async function fontesOg() {
  const forte = await readFile(join(pasta, "bricolage-grotesque-latin-800-normal.woff"));
  return [{ name: "Bricolage", data: forte, weight: 800 as const, style: "normal" as const }];
}
