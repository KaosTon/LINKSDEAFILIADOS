// Folha de sons do Reel "50% sobre qual preco?". Uso: node sfx/preco.mjs
import { DO, baque, clique, mesa, pop, sino, sopro } from "./sint.mjs";

const { TL, por, cama, salvar } = mesa("timeline-preco.json", "public/preco/sfx.wav");
const { s1, s2, s3, s4, s5, s6 } = TL;
por(s1.selo - 0.03, 0.5, baque(), 0.45, 0);                    // o selo de -50% bate na tela
por(s1.selo + 0.02, 0.9, sino(DO[7]), 0.14, 0.2);
por(s2.corte - 0.12, 0.4, sopro(false), 0.2, 0);               // corte para a duvida
por(s2.titulo, 0.22, pop(520, 330), 0.22, -0.2);
por(s2.titulo + 0.2, 0.25, pop(330, 247), 0.2, -0.2);
por(s3.corte - 0.12, 0.4, sopro(true), 0.18, 0);
por(s3.cartao - 0.03, 0.2, pop(700, 440), 0.22, 0.2);
por(s3.risca - 0.04, 0.25, sopro(true), 0.22, 0.2);            // o risco no preco
por(s3.revela - 0.03, 0.45, baque(), 0.4, 0.2);                // a revelacao
por(s3.revela, 0.2, clique(), 0.2, 0.2);
por(s4.corte - 0.12, 0.4, sopro(true), 0.18, 0);
for (let i = 0; i < 6; i++) por(s4.grafico + i * 0.12, 0.18, pop(DO[6 - i] * 1.5, DO[6 - i]), 0.16, -0.3 + i * 0.12); // a linha desce
por(s4.menor - 0.03, 1.2, sino(DO[5]), 0.18, 0);
por(s4.menor - 0.03, 1.2, sino(DO[7]), 0.12, 0);
por(s5.corte - 0.12, 0.4, sopro(false), 0.18, 0);
por(s5.bloco - 0.03, 0.2, pop(660, 440), 0.2, 0.2);
for (let i = 0; i < 9; i++) por(s5.escreve + i * 0.09, 0.05, clique(), 0.1 + (i % 3) * 0.02, 0.2); // lapis
por(s5.bf - 0.03, 0.2, pop(880, 587), 0.22, 0.3);
por(s6.corte - 0.12, 0.45, sopro(true), 0.18, 0);
for (const [i, f] of [DO[5], DO[7], DO[8]].entries()) por(s6.fim + i * 0.07, 1.6, sino(f), 0.14, -0.2 + i * 0.2);
por(s6.arroba - 0.03, 2.0, sino(DO[9]), 0.12, 0.2);
cama();
salvar();
