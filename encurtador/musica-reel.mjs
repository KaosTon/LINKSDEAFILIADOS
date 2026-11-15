// Trilha do Reel das ofertas (15/11): 16 s feitos por código (sem música de terceiros, sem direito autoral).
//   node encurtador/musica-reel.mjs   ->  encurtador/musica-reel.m4a (precisa de ffmpeg)
// Batida leve (bumbo, chimbal, palmas) e um arpejo em dó maior pentatônico, 112 bpm; sobe no fim.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SR = 44100, DUR = 16, N = SR * DUR, BPM = 112, B = 60 / BPM;
const L = new Float32Array(N), R = new Float32Array(N);
let s = 11; const ruido = () => ((s = (s * 16807) % (2 ** 31 - 1)) / (2 ** 31 - 1)) * 2 - 1;
const por = (t, dur, fn, g, pan = 0) => {
  const i0 = Math.round(t * SR), n = Math.round(dur * SR), gl = g * (1 - pan) / 2 * 1.4, gr = g * (1 + pan) / 2 * 1.4;
  for (let i = 0; i < n && i0 + i < N; i++) { const v = fn(i / SR, i / n); L[i0 + i] += v * gl; R[i0 + i] += v * gr; }
};
const bumbo = (t) => Math.sin(2 * Math.PI * (50 + 110 * Math.exp(-t * 35)) * t) * Math.exp(-t * 9);
const chimbal = (t) => ruido() * Math.exp(-t * 70);
const palma = (t) => ruido() * (Math.exp(-t * 40) + 0.5 * Math.exp(-Math.max(0, t - 0.012) * 40));
const nota = (f) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 5)) * Math.exp(-t * 5) * Math.min(1, t * 300);
const baixo = (f) => (t) => Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 3) * Math.min(1, t * 200);
const ESC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
const ARP = [0, 2, 4, 5, 4, 2, 3, 5];
const ACORDES = [130.81, 110.0, 174.61, 196.0];   // C, Am, F, G (raiz no grave)
const batidas = Math.floor(DUR / B);
for (let b = 0; b < batidas; b++) {
  const t = b * B, fim = t > DUR - 2.2;
  por(t, 0.5, bumbo, 0.55);
  if (b % 2 === 1) por(t, 0.25, palma, 0.16, 0.1);
  por(t + B / 2, 0.08, chimbal, 0.07, -0.3);
  por(t, 0.06, chimbal, 0.04, 0.3);
  if (b % 4 === 0) por(t, B * 4, baixo(ACORDES[(b / 4) % 4]), 0.22);
  for (let k = 0; k < 2; k++) {
    const i = (b * 2 + k) % ARP.length;
    por(t + k * B / 2, 0.6, nota(ESC[ARP[i]] * (fim ? 2 : 1)), 0.075, i % 2 ? 0.35 : -0.35);
  }
}
for (let i = 0; i < N; i++) { const env = Math.min(1, i / (SR * 0.3)) * Math.min(1, (N - i) / (SR * 0.8)); L[i] = Math.tanh(L[i] * 1.2) * env; R[i] = Math.tanh(R[i] * 1.2) * env; }
const pcm = Buffer.alloc(44 + N * 4);
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write('WAVEfmt ', 8); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32000), 44 + i * 4); pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32000), 46 + i * 4); }
const wav = path.join(os.tmpdir(), 'musica-reel.wav');
fs.writeFileSync(wav, pcm);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-c:a', 'aac', '-b:a', '128k', new URL('./musica-reel.m4a', import.meta.url).pathname]);
console.log('musica-reel.m4a pronta');
