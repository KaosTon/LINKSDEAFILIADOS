import { Easing, spring } from "remotion";
import TLjson from "../timeline.json";

export const TL = TLjson;
export const FPS = TL.fps;

// Paleta da marca. Uma cor de destaque (vermelho) por quadro; o verde so aparece como "deu certo".
export const C = {
  creme: "#fff4ea",
  tinta: "#0a1f45",
  laranja: "#f7941d",
  vermelho: "#e53b2c",
  verde: "#1f9d55",
  mudo: "#5b6b8c",
  pele: "#f2c29b",
  blusa: "#f26027",
  blusaEsc: "#e8551f",
};

export const cl = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// Entradas chegam desacelerando; saidas saem acelerando e duram a metade.
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.6, 0, 0.9, 0.35);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const prog = (t: number, a: number, b: number, ease: (x: number) => number = easeOut) =>
  ease(cl((t - a) / (b - a)));

export const MOLA = {
  assenta: { damping: 14, stiffness: 140, mass: 0.8 },
  pesada: { damping: 18, stiffness: 180, mass: 1 },
  pop: { damping: 10, stiffness: 220, mass: 0.7 },
};
export const sp = (t: number, inicio: number, config = MOLA.assenta) =>
  t < inicio ? 0 : spring({ frame: (t - inicio) * FPS, fps: FPS, config });

// Aparece em "entra" (mola) e some em "sai" (rapido). Devolve opacidade e escala prontas.
export const vida = (t: number, entra: number, sai: number, config = MOLA.pop) => {
  const k = sp(t, entra, config);
  const f = 1 - prog(t, sai, sai + 0.3, easeIn);
  return { op: cl(k * 2) * f, k, f };
};

// Numero pseudoaleatorio fixo por indice (nada de Math.random em video).
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 3.7) * 43758.5453;
  return x - Math.floor(x);
};
