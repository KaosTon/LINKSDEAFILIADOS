import React from "react";
import { C, TL, cl, easeInOut, lerp, prog, sp, MOLA } from "./lib";

// Uma pose e um conjunto de angulos e expressoes. O quadro mistura as poses em ordem.
type Pose = {
  sD: number; cD: number; sE: number; cE: number;   // ombro e cotovelo, direito e esquerdo (graus)
  boca: number; sob: number;                        // boca: +1 sorri, -1 triste. sobrancelha: +1 sobe, -1 franze
  inclina: number; olhaX: number; olhaY: number;
  fone: number; pulo: number; agacha: number;
};
const POSE0: Pose = { sD: -28, cD: -118, sE: 14, cE: 10, boca: 0.6, sob: 0.2, inclina: 0, olhaX: 0.5, olhaY: -0.2, fone: 1, pulo: 0, agacha: 0 };
const { s1, s2, s3, s4, s5, s6 } = TL;
const POSES: [number, number, Partial<Pose>][] = [
  [s1.toque - 0.14, 0.14, { cD: -130, sob: 0.5 }],                                           // toca em comprar
  [s1.pedido, 0.25, { cD: -116, boca: 1, sob: 0.8 }],                                        // pedido feito
  [s1.caixa - 0.15, 0.45, { sD: 10, cD: 14, fone: 0, olhaX: 1, olhaY: 0.4, sob: 0.7, boca: 0.7 }], // guarda o celular, ve a caixa
  [s1.abre - 0.1, 0.4, { inclina: 9, olhaY: 0.9, boca: 0.2, sob: 0.4 }],                     // espia dentro
  [s1.triste, 0.3, { boca: -0.85, sob: -0.9, sE: -150, cE: -70 }],                           // nao era isso
  [s2.calma - 0.1, 0.5, { inclina: 0, sE: 14, cE: 10, boca: 0.2, sob: 0.3, olhaX: 0, olhaY: 0 }], // respira, olha para voce
  [s3.cal - 0.05, 0.5, { sD: -128, cD: -22, olhaX: 0.9, olhaY: -0.5, boca: 0.6 }],           // aponta o calendario
  [s3.dias + 1.3, 0.4, { boca: 0.95, sob: 0.7 }],                                            // entendeu
  [s3.chip1 - 0.1, 0.5, { sD: 10, cD: 14, olhaX: 0.7, olhaY: 0.2 }],                         // baixa o braco e le
  [s4.caixaSai, 0.5, { sD: -62, cD: -78, olhaX: 0.9, olhaY: 0.1, boca: 0.9 }],               // estende a mao
  [s4.comemora - 0.22, 0.2, { agacha: 1 }],                                                  // antecipa o pulo
  [s4.comemora, 0.42, { agacha: 0, pulo: 1, boca: 1, sob: 1, sE: -160, cE: -12, sD: -152, cD: -18, olhaX: 0, olhaY: -0.3 }],
  [s5.lei - 0.15, 0.5, { sE: 14, cE: 10, sD: -128, cD: -22, olhaX: 0.9, olhaY: -0.4, boca: 0.7, sob: 0.5 }], // mostra a lei
  [s6.fim - 0.25, 0.5, { sD: -150, cD: -24, olhaX: 0, olhaY: 0, boca: 1, sob: 0.6 }],        // acena
];
const poseEm = (t: number): Pose => {
  const q = { ...POSE0 };
  for (const [a, dur, alvo] of POSES) {
    const k = prog(t, a, a + dur, easeInOut);
    if (k <= 0) break;
    for (const c in alvo) (q as any)[c] = lerp((q as any)[c], (alvo as any)[c], k);
  }
  return q;
};

export const BX = 320, BY = 1330, BS = 1.42;
// Onde a mao direita fica quando ele estende o braco (para as moedas chegarem ali).
export const MAO = { x: BX + 214 * BS, y: BY - 309 * BS };

export const Boneco: React.FC<{ t: number }> = ({ t }) => {
  const q = poseEm(t);
  // a cabeca segue a pose com um pequeno atraso: e o que da "peso" ao movimento
  const qa = poseEm(t - 0.09);
  const respira = Math.sin(t * 2.6) * 3;
  const hop = Math.sin(cl(q.pulo) * Math.PI);
  const sy = 1 - q.agacha * 0.09 + hop * 0.05;            // amassa antes do pulo, estica no ar
  const acena = t > s6.fim + 0.2 ? Math.sin((t - s6.fim - 0.2) * 9) * 16 : 0;
  const kf = prog(t, s6.fim - 0.35, s6.fim + 0.35, easeInOut); // no fechamento vai para o centro
  const x = lerp(BX, 540, kf), y = lerp(BY, 1440, kf), s = lerp(BS, 1.08, kf);
  const pisca = (t + 1) % 2.9 < 0.11 ? 0.12 : 1;
  const feito = sp(t, s1.pedido, MOLA.pop);
  const aperta = 1 - 0.12 * Math.sin(cl((t - s1.toque + 0.05) / 0.3) * Math.PI);
  const braco = (cor1: string, cor2: string) => (
    <>
      <line x1={0} y1={0} x2={0} y2={92} stroke={cor1} strokeWidth={40} strokeLinecap="round" />
    </>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={8} rx={120 - hop * 30} ry={18 - hop * 5} fill={C.tinta} opacity={0.14} />
      <g transform={`translate(0,${-hop * 64}) scale(${1 + (1 - sy) * 0.5},${sy})`}>
        <rect x={-58} y={-128} width={46} height={128} rx={22} fill="#0d2f66" />
        <rect x={12} y={-128} width={46} height={128} rx={22} fill="#0d2f66" />
        <ellipse cx={-38} cy={-4} rx={36} ry={16} fill="#07142e" />
        <ellipse cx={38} cy={-4} rx={36} ry={16} fill="#07142e" />
        <g transform={`translate(0,${respira}) rotate(${q.inclina} 0 -120)`}>
          <g transform="translate(-74,-282)">
            <g transform={`rotate(${q.sE})`}>
              {braco(C.blusaEsc, C.blusa)}
              <g transform={`translate(0,92) rotate(${q.cE})`}>
                <line x1={0} y1={0} x2={0} y2={80} stroke={C.blusa} strokeWidth={36} strokeLinecap="round" />
                <circle cx={0} cy={92} r={23} fill={C.pele} />
              </g>
            </g>
          </g>
          <rect x={-82} y={-310} width={164} height={200} rx={56} fill={C.blusa} />
          <path d="M-30 -310 Q0 -276 30 -310" fill="none" stroke="#c9461a" strokeWidth={8} strokeLinecap="round" />
          <rect x={-34} y={-196} width={68} height={46} rx={16} fill={C.blusaEsc} />
          <g transform={`translate(0,-318) rotate(${qa.inclina * 0.6 + qa.olhaX * 4 - hop * 4})`}>
            <circle cx={-80} cy={-72} r={16} fill="#eab48b" />
            <circle cx={80} cy={-72} r={16} fill="#eab48b" />
            <circle cx={0} cy={-78} r={82} fill={C.pele} />
            <path d="M-82 -84 A82 82 0 0 1 82 -84 Q60 -118 20 -112 Q-30 -104 -82 -84 Z" fill={C.tinta} />
            {[-30, 30].map((ox) => (
              <g key={ox} transform={`translate(${ox + q.olhaX * 7},${-70 + q.olhaY * 5}) scale(1,${pisca})`}>
                <ellipse rx={10} ry={13} fill={C.tinta} />
                <circle cx={3} cy={-4} r={3.2} fill="#fff" />
              </g>
            ))}
            {[-1, 1].map((l) => (
              <line key={l} x1={l * 44} y1={-98} x2={l * 16} y2={-98} stroke={C.tinta} strokeWidth={8} strokeLinecap="round"
                transform={`translate(0,${-q.sob * 7}) rotate(${q.sob < 0 ? -l * q.sob * 16 : 0} ${l * 30} -98)`} />
            ))}
            <circle cx={-52} cy={-44} r={13} fill="#f29b7a" opacity={0.55} />
            <circle cx={52} cy={-44} r={13} fill="#f29b7a" opacity={0.55} />
            <path d={`M-24 -38 Q0 ${-38 + q.boca * 24} 24 -38`} fill={q.boca > 0.85 ? "#7a1d12" : "none"} stroke={C.tinta} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g transform="translate(74,-282)">
            <g transform={`rotate(${q.sD + acena})`}>
              {braco(C.blusaEsc, C.blusa)}
              <g transform={`translate(0,92) rotate(${q.cD})`}>
                <line x1={0} y1={0} x2={0} y2={80} stroke={C.blusa} strokeWidth={36} strokeLinecap="round" />
                {/* celular: fica em pe na mao (desfaz o giro do braco) e some quando o braco baixa */}
                <g transform={`translate(0,92) rotate(${-(q.sD + q.cD) - q.inclina})`} opacity={cl(q.fone * 1.6)}>
                  <rect x={-46} y={-150} width={92} height={170} rx={20} fill={C.tinta} />
                  <rect x={-38} y={-140} width={76} height={150} rx={13} fill="#fff" />
                  <rect x={-28} y={-128} width={56} height={52} rx={8} fill="#ffe1c2" />
                  <rect x={-28} y={-62} width={56} height={26} rx={13} fill={C.vermelho} transform={`translate(0,-49) scale(${aperta}) translate(0,49)`} />
                  <g opacity={cl(feito * 2)} transform={`translate(0,-90) scale(${lerp(0.5, 1, feito)}) translate(0,90)`}>
                    <circle cx={0} cy={-90} r={30} fill={C.verde} />
                    <path d="M-13 -90 L-4 -80 L14 -101" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </g>
                <circle cx={0} cy={92} r={23} fill={C.pele} />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  );
};
