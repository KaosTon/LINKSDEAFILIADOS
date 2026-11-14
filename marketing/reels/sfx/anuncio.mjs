// Anúncios em vídeo (v1, a, b, c): o tempo de cada cena sai das palavras da narração, e os sons seguem.
// Uso: node sfx/anuncio.mjs v1   (gera timeline-anuncio-v1.json e public/anuncio-v1/sfx.wav)
import { readFileSync, writeFileSync } from "node:fs";
import { DO, baque, clique, mesa, pop, sino, sopro } from "./sint.mjs";

const v = process.argv[2];
const P = JSON.parse(readFileSync(new URL(`../src/palavras-anuncio-${v}.json`, import.meta.url)));
const acha = (f) => { const i = P.findIndex(f); if (i < 0) throw new Error(`palavra não achada em ${v}`); return i; };
const iCorpo = acha((p, i) => p.t === "A" && P[i + 1] && P[i + 1].t === "gente" && P[i + 2] && /garimpa/.test(P[i + 2].t));
const iGratis = acha((p) => p.t === "É");
const iToca = acha((p) => p.t === "Toca");
// Virada dentro do gancho (segunda frase): a, b e c têm; v1 não.
const VIRA = { a: "Vai", b: "Olha", c: "No" };
const iVira = VIRA[v] ? P.findIndex((p, i) => p.t === VIRA[v] && i < iCorpo) : -1;
const fim = P[P.length - 1].b;
const r = (x) => Math.round(x * 100) / 100;
const TL = {
  fps: 30, duracao: r(fim + 2.4),
  s1: { inicio: 0, vira: iVira >= 0 ? r(P[iVira].a - 0.1) : null },
  s2: { corte: r(P[iCorpo].a - 0.12), notif: r(P[iCorpo].a + 0.45), passo: 0.55 },
  s3: { corte: r(P[iGratis].a - 0.12), gratis: r(P[iGratis + 1].a), sai: r(P[iGratis + 4].a) },
  s4: { corte: r(P[iToca].a - 0.15), botao: r(P[iToca].a + 0.3), toque: r(P[iToca + 2].a + 0.3), marca: r(fim + 0.55) },
};
writeFileSync(new URL(`../timeline-anuncio-${v}.json`, import.meta.url), JSON.stringify(TL, null, 2) + "\n");

const { por, cama, salvar } = mesa(`timeline-anuncio-${v}.json`, `public/anuncio-${v}/sfx.wav`);
const { s1, s2, s3, s4 } = TL;
por(0.04, 0.5, baque(), 0.35, 0);
por(0.4, 0.25, pop(520, 330), 0.16, -0.2);
if (s1.vira) { por(s1.vira - 0.08, 0.35, sopro(true), 0.16, 0); por(s1.vira, 0.45, baque(), 0.28, 0.2); }
por(s2.corte - 0.12, 0.4, sopro(true), 0.2, 0);
for (let i = 0; i < 4; i++) por(s2.notif + i * s2.passo - 0.02, 0.22, pop(DO[i + 4] * 1.5, DO[i + 4]), 0.2, 0.3);
por(s3.corte - 0.12, 0.4, sopro(true), 0.2, 0);
por(s3.gratis - 0.03, 0.9, sino(DO[7]), 0.16, -0.3);
por(s3.sai - 0.03, 0.9, sino(DO[8]), 0.14, 0.3);
por(s4.corte - 0.12, 0.45, sopro(false), 0.18, 0);
por(s4.botao - 0.03, 0.22, pop(880, 587), 0.22, 0);
por(s4.toque - 0.02, 0.08, clique(), 0.26, 0.2);
for (const [i, f] of [DO[5], DO[7], DO[8], DO[9]].entries()) por(s4.toque + 0.05 + i * 0.07, 1.5, sino(f), 0.13, -0.3 + i * 0.2);
por(s4.marca - 0.03, 2.2, sino(DO[9]), 0.1, 0);
cama();
salvar();
