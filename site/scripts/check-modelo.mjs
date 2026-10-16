// Trava automatica: site de cliente nao vai pro ar com dado do site-modelo.
//
// O site nasce do modelo do fabrica-sites, com a "Clinica Modelo" (cliente ficticio) em todo
// arquivo de dado. Enquanto `MODELO = true` em src/data/site.ts, o build FALHA: e o jeito de
// garantir que telefone 11 90000-0000, endereco "Rua Exemplo" e texto de exemplo nao cheguem
// a ser publicados por engano.
//
// Tambem procura os marcadores do modelo nos arquivos de dado mesmo com MODELO = false
// (alguem desligou a chave sem trocar tudo).
//
// O repositorio fabrica-sites testa o proprio modelo com FABRICA_MODELO=1, que libera a trava.
// 100% estatica. Roda no `npm run build`.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ler = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const site = ler("src/data/site.ts");
const ligado = /export const MODELO = true;/.test(site);

if (process.env.FABRICA_MODELO === "1") {
  console.log("✓ Modelo: FABRICA_MODELO=1, build do proprio site-modelo (trava liberada).");
  process.exit(0);
}

const MARCAS = [/Clínica Modelo/, /5511900000000/, /Rua Exemplo|Av\. Exemplo/, /clinicamodelo/, /000000-F/];
const achados = [];
const pasta = "src/data";
if (existsSync(pasta)) {
  for (const nome of readdirSync(pasta)) {
    const texto = ler(join(pasta, nome));
    texto.split("\n").forEach((linha, i) => {
      for (const re of MARCAS) if (re.test(linha)) achados.push(`${pasta}/${nome}:${i + 1}  ${linha.trim().slice(0, 90)}`);
    });
  }
}

if (ligado || achados.length) {
  console.error("\n✖ Ainda tem dado do site-modelo neste site.\n");
  if (ligado) console.error("  - MODELO = true em src/data/site.ts (desligue quando o ultimo dado de exemplo sair).");
  for (const a of achados.slice(0, 20)) console.error("  - " + a);
  if (achados.length > 20) console.error(`  ... e mais ${achados.length - 20}`);
  console.error("\n  Troque pelo dado real do cliente (o que ele nao mandou e PENDENTE no BRIEFING.md).\n");
  process.exit(1);
}
console.log("✓ Modelo: nenhum dado de exemplo no site.");
