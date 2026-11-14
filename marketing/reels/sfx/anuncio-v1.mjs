// Folha de sons do anúncio em vídeo v1. Uso: node sfx/anuncio-v1.mjs
import { DO, baque, clique, mesa, pop, sino, sopro } from "./sint.mjs";

const { TL, por, cama, salvar } = mesa("timeline-anuncio-v1.json", "public/anuncio-v1/sfx.wav");
const { s2, s3, s4 } = TL;
por(0.05, 0.5, baque(), 0.35, 0);
por(0.45, 0.25, pop(520, 330), 0.18, -0.2);
por(0.65, 0.25, pop(330, 247), 0.16, -0.2);
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
