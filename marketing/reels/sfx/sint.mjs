// Sintetizador dos efeitos sonoros: tudo feito por codigo, sem arquivos de terceiros.
// Cada video tem a sua folha de sons (sfx/<video>.mjs), que le o mesmo timeline do video.
import { readFileSync, writeFileSync } from "node:fs";

export const SR = 48000;
export const DO = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 1046.5]; // do maior pentatonico
let semente = 7;
const M = 2 ** 31 - 1;
export const ruido = () => ((semente = (semente * 16807) % M) / M) * 2 - 1;
export const pop = (f0, f1) => (t) => Math.sin(2 * Math.PI * (f1 * t + ((f0 - f1) * (1 - Math.exp(-t * 40))) / 40)) * Math.exp(-t * 22) * Math.min(1, t * 900);
export const clique = () => (t) => (ruido() * 0.5 + Math.sin(2 * Math.PI * 2100 * t)) * Math.exp(-t * 160);
export const sino = (f) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.45 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * 6) + 0.2 * Math.sin(2 * Math.PI * f * 3.02 * t) * Math.exp(-t * 10)) * Math.exp(-t * 4.5) * Math.min(1, t * 400);
export const baque = () => (t) => (Math.sin(2 * Math.PI * (55 + 90 * Math.exp(-t * 30)) * t) + ruido() * 0.25 * Math.exp(-t * 60)) * Math.exp(-t * 11);
export function sopro(sobe = true) { // ruido filtrado que varre de grave para agudo (ou o contrario)
  let y = 0;
  return (t, k) => { const a = 0.02 + 0.5 * (sobe ? k : 1 - k) ** 2; y += a * (ruido() - y); return y * Math.sin(Math.PI * k) ** 1.5 * 2.2; };
}
export const moeda = (f) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.6 * Math.sin(2 * Math.PI * f * 1.5 * t)) * Math.exp(-t * 26) * Math.min(1, t * 1500);

// Abre a mesa de som de um video: devolve o timeline, "por" (coloca um som no tempo) e "salvar".
export function mesa(nomeTimeline, saida) {
  const TL = JSON.parse(readFileSync(new URL("../" + nomeTimeline, import.meta.url)));
  const N = Math.ceil(TL.duracao * SR), L = new Float32Array(N), R = new Float32Array(N);
  function por(t, dur, fn, ganho = 0.3, pan = 0) {
    const i0 = Math.round(t * SR), n = Math.round(dur * SR);
    const gl = ganho * Math.cos(((pan + 1) * Math.PI) / 4), gr = ganho * Math.sin(((pan + 1) * Math.PI) / 4);
    for (let i = 0; i < n && i0 + i < N; i++) {
      if (i0 + i < 0) continue;
      const v = fn(i / SR, i / n);
      L[i0 + i] += v * gl * 1.414; R[i0 + i] += v * gr * 1.414;
    }
  }
  // cama bem baixa (do + sol) so para nao haver silencio seco entre as falas
  function cama() {
    for (const [f, p] of [[130.81, -0.4], [196.0, 0.4], [261.63, 0]]) {
      por(0, TL.duracao, (t, k) => (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t)) * (0.8 + 0.2 * Math.sin(t * 1.3 + f)) * Math.min(1, t * 2) * Math.min(1, (1 - k) * 12), 0.022, p);
    }
  }
  function salvar() {
    const pcm = Buffer.alloc(44 + N * 4);
    pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write("WAVEfmt ", 8); pcm.writeUInt32LE(16, 16);
    pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22); pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28);
    pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34); pcm.write("data", 36); pcm.writeUInt32LE(N * 4, 40);
    for (let i = 0; i < N; i++) {
      pcm.writeInt16LE(Math.round(Math.tanh(L[i]) * 32000), 44 + i * 4);
      pcm.writeInt16LE(Math.round(Math.tanh(R[i]) * 32000), 46 + i * 4);
    }
    writeFileSync(new URL("../" + saida, import.meta.url), pcm);
    console.log(saida, TL.duracao + " s");
  }
  return { TL, por, cama, salvar };
}
