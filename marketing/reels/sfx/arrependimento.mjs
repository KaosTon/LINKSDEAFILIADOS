// Folha de sons do Reel dos 7 dias. Uso: node sfx/arrependimento.mjs
import { DO, baque, clique, mesa, moeda, pop, sino, sopro } from "./sint.mjs";

const { TL, por, cama, salvar } = mesa("timeline.json", "public/arrependimento/sfx.wav");
const { s1, s2, s3, s4, s5, s6 } = TL;
// cada som comeca um tico antes da imagem pousar: cedo parece sincronizado, atrasado parece quebrado
por(s1.toque - 0.02, 0.08, clique(), 0.22, 0.2);
por(s1.pedido - 0.03, 0.5, sino(DO[7]), 0.2, 0.2);
por(s1.caixa - 0.05, 0.4, sopro(false), 0.2, 0.5);
por(s1.pousa - 0.02, 0.5, baque(), 0.5, 0.5);
por(s1.abre - 0.03, 0.2, pop(260, 140), 0.25, 0.5);
por(s1.duvida - 0.03, 0.22, pop(520, 330), 0.22, -0.3);
por(s1.duvida + 0.16, 0.25, pop(330, 247), 0.2, -0.3);
por(s2.calma - 0.04, 1.2, sino(DO[3]), 0.16, 0);
por(s2.calma - 0.04, 1.2, sino(DO[5]), 0.1, 0);
por(s3.cal - 0.1, 0.4, sopro(true), 0.18, 0.4);
for (let i = 0; i < 7; i++) por(s3.dias + i * s3.passo - 0.02, 0.2, pop(DO[i + 2] * 1.5, DO[i + 2]), 0.2, 0.2 + i * 0.08);
por(s3.chip1 - 0.03, 0.2, pop(700, 440), 0.2, 0.4);
por(s3.chip2 - 0.03, 0.2, pop(800, 523), 0.2, 0.4);
por(s3.sai - 0.05, 0.4, sopro(false), 0.14, 0.3);
por(s4.caixaSai, 0.5, sopro(true), 0.18, 0.7);
for (let i = 0; i < 7; i++) por(s4.moedas + i * 0.13 + 0.62, 0.25, moeda(1568 + (i % 3) * 196), 0.14, 0.1);
por(s4.volta - 0.03, 0.2, pop(880, 587), 0.2, 0.4);
por(s4.frete - 0.03, 0.2, pop(988, 659), 0.2, 0.4);
for (const [i, f] of [DO[5], DO[7], DO[8], DO[9]].entries()) por(s4.comemora + i * 0.07, 1.4, sino(f), 0.15, -0.3 + i * 0.2); // acorde da comemoracao: o ponto alto
por(s5.lei - 0.1, 0.4, sopro(true), 0.16, 0.4);
por(s5.artigo - 0.03, 0.45, baque(), 0.38, 0.4);
por(s5.codigo - 0.03, 0.2, pop(660, 440), 0.14, 0.4);
por(s5.sai - 0.05, 0.4, sopro(false), 0.14, 0.3);
por(s6.fim - 0.12, 0.45, sopro(true), 0.18, 0);
por(s6.fim + 0.05, 1.6, sino(DO[5]), 0.14, -0.2);
por(s6.arroba - 0.03, 2.0, sino(DO[8]), 0.16, 0.2);
cama();
salvar();
