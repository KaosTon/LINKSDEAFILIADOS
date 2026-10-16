import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Fonte das imagens geradas com next/og (icone, icone da Apple e imagem de compartilhamento).
// Arquivo no repo (assets/fonts, licenca OFL ao lado) porque o next/og nao le as fontes do
// next/font. Tem que ser estatica (WOFF de um peso so): com a versao variavel o build quebra.
//
// ATENCAO, motor alterado so aqui (16/10/2026): no modelo esta funcao e fontesCormorant() e le a
// Cormorant. Aqui le a Montserrat 800, a fonte do logo e dos titulos do Tem Descontos. Levar para a
// fabrica como fonte configuravel (CLAUDE.md, "Onde estamos").
const pasta = join(process.cwd(), "assets/fonts");

export async function fontesOg() {
  const forte = await readFile(join(pasta, "montserrat-latin-800-normal.woff"));
  return [{ name: "Montserrat", data: forte, weight: 800 as const, style: "normal" as const }];
}

/** imagem do assets/logo como data URL, pra usar dentro do next/og (ele nao le /public por URL) */
export async function logoOg(arquivo: string) {
  const dado = await readFile(join(process.cwd(), "assets/logo", arquivo));
  return `data:image/png;base64,${dado.toString("base64")}`;
}
