// Efeitos sonoros feitos por codigo (sem arquivos de terceiros), nos mesmos tempos do timeline.json.
// Saida: public/sfx.wav. Depois: npm run som (mistura com a voz e ajusta o volume).
import { readFileSync, writeFileSync } from "node:fs";

const TL = JSON.parse(readFileSync(new URL("../timeline.json", import.meta.url)));
const SR = 48000, N = Math.ceil(TL.duracao * SR);
const L = new Float32Array(N), R = new Float32Array(N);
let semente = 7;
const M = 2 ** 31 - 1;
const ruido = () => ((semente = (semente * 16807) % M) / M) * 2 - 1;

// coloca um som (funcao do tempo local em segundos) no instante t, com volume e posicao estereo
function por(t, dur, fn, ganho = 0.3, pan = 0) {
  const i0 = Math.round(t * SR), n = Math.round(dur * SR);
  const gl = ganho * Math.cos(((pan + 1) * Math.PI) / 4), gr = ganho * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n && i0 + i < N; i++) {
    if (i0 + i < 0) continue;
    const v = fn(i / SR, i / n);
    L[i0 + i] += v * gl * 1.414; R[i0 + i] += v * gr * 1.414;
  }
}
const pop = (f0, f1) => (t, k) => Math.sin(2 * Math.PI * (f1 * t + ((f0 - f1) * (1 - Math.exp(-t * 40))) / 40)) * Math.exp(-t * 22) * Math.min(1, t * 900);
const clique = () => (t) => (ruido() * 0.5 + Math.sin(2 * Math.PI * 2100 * t)) * Math.exp(-t * 160);
const sino = (f) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.45 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * 6) + 0.2 * Math.sin(2 * Math.PI * f * 3.02 * t) * Math.exp(-t * 10)) * Math.exp(-t * 4.5) * Math.min(1, t * 400);
const baque = () => (t) => (Math.sin(2 * Math.PI * (55 + 90 * Math.exp(-t * 30)) * t) + ruido() * 0.25 * Math.exp(-t * 60)) * Math.exp(-t * 11);
function sopro(sobe = true) { // ruido filtrado que varre de grave para agudo (ou o contrario)
  let y = 0;
  return (t, k) => { const a = 0.02 + 0.5 * (sobe ? k : 1 - k) ** 2; y += a * (ruido() - y); return y * Math.sin(Math.PI * k) ** 1.5 * 2.2; };
}
const moeda = (f) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.6 * Math.sin(2 * Math.PI * f * 1.5 * t)) * Math.exp(-t * 26) * Math.min(1, t * 1500);

const { s1, s2, s3, s4, s5, s6 } = TL;
const DO = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 1046.5]; // do maior pentatonico
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
// cama bem baixa (do + sol) so para nao haver silencio seco entre as falas
for (const [f, p] of [[130.81, -0.4], [196.0, 0.4], [261.63, 0]]) {
  por(0, TL.duracao, (t, k) => (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t)) * (0.8 + 0.2 * Math.sin(t * 1.3 + f)) * Math.min(1, t * 2) * Math.min(1, (1 - k) * 12), 0.022, p);
}

const pcm = Buffer.alloc(44 + N * 4);
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write("WAVEfmt ", 8); pcm.writeUInt32LE(16, 16);
pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22); pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28);
pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34); pcm.write("data", 36); pcm.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  pcm.writeInt16LE(Math.round(Math.tanh(L[i]) * 32000), 44 + i * 4);
  pcm.writeInt16LE(Math.round(Math.tanh(R[i]) * 32000), 46 + i * 4);
}
writeFileSync(new URL("../public/sfx.wav", import.meta.url), pcm);
console.log("public/sfx.wav", TL.duracao + " s");
