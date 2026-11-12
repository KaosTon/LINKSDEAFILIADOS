import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Acabamento, Fim, Fundo, Legenda, Titulo } from "./Arrependimento";
import { Clip } from "./ArrependimentoPersonagens";
// Personagens do LottieFiles (ver CREDITOS.md)
import compradora from "./lottie/146287.json";
import pensativo from "./lottie/119312.json";
import investiga from "./lottie/140933.json";
import analista from "./lottie/1043196.json";
import lista from "./lottie/114050.json";
import { C, MOLA, cl, easeIn, easeInOut, easeOut, lerp, prog } from "./lib";
import { spring } from "remotion";
import TL from "../timeline-preco.json";
import palavras from "./palavras-preco.json";

// Reel "50% de desconto sobre qual preço?", com personagens animados do LottieFiles.
const FPS = TL.fps;
const { s1, s2, s3, s4, s5, s6 } = TL;
const AMARELO = "#ffc15e";
const sp = (t: number, inicio: number, config = MOLA.assenta) => (t < inicio ? 0 : spring({ frame: (t - inicio) * FPS, fps: FPS, config }));
const TELAS: [number, string][] = [[-1, C.vermelho], [s2.corte, C.tinta], [s3.corte, C.creme], [s4.corte, C.verde], [s5.corte, C.creme]];
const CORTES = [s2.corte, s3.corte, s4.corte, s5.corte, s6.corte];

const Raios: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.16 }}>
    <g transform={`translate(540,900) rotate(${t * 14})`}>
      {Array.from({ length: 14 }).map((_, i) => <path key={i} d="M0 0 L-70 -1500 L70 -1500 Z" fill="#fff" transform={`rotate(${(i * 360) / 14})`} />)}
    </g>
  </svg>
);

// Grafico do preco pelas semanas: a linha se desenha e o ponto mais baixo ganha destaque.
const PTS = [[0, 240], [1, 180], [2, 270], [3, 200], [4, 70], [5, 170], [6, 250]].map(([i, v]) => [90 + i * 120, 420 - v] as const);
const Grafico: React.FC<{ t: number }> = ({ t }) => {
  if (t < s4.corte) return null;
  const entra = sp(t, s4.corte + 0.15, MOLA.pesada), k = prog(t, s4.grafico, s4.grafico + 0.9, easeInOut), m = sp(t, s4.menor, MOLA.pop);
  const d = PTS.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const [mx, my] = PTS[4];
  return (
    <div style={{ position: "absolute", left: 60, top: 560, width: 960, height: 560, background: "#fff", borderRadius: 48, boxShadow: "0 24px 50px rgba(0,0,0,.2)", opacity: cl(entra * 2), transform: `translateY(${lerp(120, 0, entra)}px) rotate(${lerp(-4, 0, entra)}deg)` }}>
      <div style={{ position: "absolute", left: 44, top: 30, fontSize: 30, fontWeight: 800, letterSpacing: 3, color: C.mudo }}>PREÇO NAS ÚLTIMAS SEMANAS</div>
      <svg width={960} height={560} style={{ position: "absolute" }}>
        {[180, 280, 380].map((y) => <line key={y} x1={60} x2={900} y1={y + 60} y2={y + 60} stroke="rgba(10,31,69,.08)" strokeWidth={3} />)}
        <g transform="translate(0,60)">
          <path d={d} fill="none" stroke={C.tinta} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
          {PTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill={C.tinta} opacity={k > i / 6 ? 1 : 0} />)}
          <circle cx={mx} cy={my} r={lerp(0, 58, m) + Math.sin(t * 5) * 4} fill={C.verde} opacity={0.22 * cl(m * 2)} />
          <circle cx={mx} cy={my} r={lerp(0, 24, m)} fill={C.verde} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: mx - 150, top: my + 96, width: 300, textAlign: "center", opacity: cl(m * 2), transform: `scale(${lerp(0.5, 1, m)})` }}>
        <span style={{ display: "inline-block", background: C.verde, color: "#fff", fontWeight: 900, fontSize: 40, padding: "12px 26px", borderRadius: 999 }}>menor preço</span>
      </div>
    </div>
  );
};

export const Preco: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ultimo = Math.max(0, ...CORTES.filter((c) => c <= t));
  const soco = 1 + 0.07 * (1 - prog(t, ultimo, ultimo + 0.45, easeOut)) * (ultimo > 0 ? 1 : 0);
  const escuro = t < s3.corte || (t >= s4.corte && t < s5.corte);
  const selo = sp(t, s1.selo, { damping: 8, stiffness: 200, mass: 0.8 });
  const cartao = sp(t, s3.cartao, MOLA.pesada), risca = prog(t, s3.risca, s3.risca + 0.3, easeInOut), revela = sp(t, s3.revela, MOLA.pop);
  const bloco = sp(t, s5.bloco, MOLA.pesada), bf = sp(t, s5.bf, MOLA.pop);
  const escrito = "Preço hoje: R$ ____".slice(0, Math.max(0, Math.floor((t - s5.escreve) / 0.045)));
  const visivel = (a: number, b: number) => (t >= a && t < b + 0.25 ? 1 - prog(t, b - 0.02, b + 0.18, easeIn) : 0);
  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.vermelho }}>
      {TELAS.map(([a, cor], i) => {
        const k = a < 0 ? 1 : prog(t, a, a + 0.42, easeOut);
        return k > 0 ? <AbsoluteFill key={i} style={{ background: cor, clipPath: `circle(${k * 125}% at 50% 46%)` }} /> : null;
      })}
      {t >= s6.corte ? <AbsoluteFill style={{ clipPath: `circle(${prog(t, s6.corte, s6.corte + 0.42, easeOut) * 125}% at 50% 46%)` }}><Fundo t={t} /></AbsoluteFill> : null}
      {escuro ? <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.14) 2.5px, transparent 3px)", backgroundSize: "54px 54px", backgroundPosition: `${t * 6}px ${t * 4}px` }} /> : null}
      {(t >= s3.corte + 0.3 && t < s4.corte) || (t >= s5.corte + 0.3 && t < s6.corte) ? <Fundo t={t} /> : null}
      {t < s2.corte + 0.3 ? <Raios t={t} /> : null}

      <AbsoluteFill style={{ transform: `scale(${soco})`, transformOrigin: "50% 50%" }}>
        {/* 1. gancho: -50% enorme */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", opacity: cl(selo * 3) * visivel(-1, s2.corte), transform: `scale(${lerp(2.2, 1, selo)}) rotate(${lerp(-14, -5, selo)}deg)` }}>
          <div style={{ fontSize: 360, lineHeight: 0.95, fontWeight: 900, letterSpacing: "-0.05em", color: "#fff", textShadow: "0 14px 0 rgba(0,0,0,.18)" }}>-50%</div>
          <div style={{ display: "inline-block", marginTop: 6, background: AMARELO, color: C.tinta, fontSize: 64, fontWeight: 900, padding: "10px 40px", borderRadius: 20 }}>DE DESCONTO</div>
        </div>
        <Clip t={t} dados={compradora} de={-0.4} ate={s2.corte - 0.1} x={140} y={850} larg={800} />
        {/* 2. mas sobre qual preco? */}
                <Clip t={t} dados={pensativo} de={s2.corte + 0.08} ate={s3.corte - 0.1} x={150} y={700} larg={780} mola={MOLA.pop} />
        {/* 3. o preco riscado */}
        <div style={{ position: "absolute", left: 70, top: 560, width: 560, opacity: cl(cartao * 2) * visivel(s3.cartao, s4.corte), transform: `translateY(${lerp(140, 0, cartao)}px) rotate(${lerp(-10, -4, cartao)}deg)`, background: "#fff", borderRadius: 44, padding: "34px 40px 40px", boxShadow: "0 24px 50px rgba(10,31,69,.18)" }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, color: C.mudo }}>EXEMPLO</div>
          <div style={{ position: "relative", display: "inline-block", fontSize: 66, fontWeight: 800, color: C.mudo, marginTop: 10 }}>
            de R$ 2.000
            <div style={{ position: "absolute", left: -8, top: "52%", height: 9, borderRadius: 9, background: C.vermelho, width: `${risca * 106}%` }} />
          </div>
          <div style={{ fontSize: 104, lineHeight: 1, fontWeight: 900, letterSpacing: "-0.04em", color: C.tinta, marginTop: 6 }}>R$ 1.000</div>
          <div style={{ position: "absolute", right: -50, top: -40, width: 170, height: 170, borderRadius: "50%", background: C.vermelho, color: "#fff", fontSize: 56, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(12deg) scale(${lerp(0.3, 1, sp(t, s3.cartao + 0.2, MOLA.pop))})` }}>-50%</div>
        </div>
        <div style={{ position: "absolute", left: 90, top: 1010, opacity: cl(revela * 2) * visivel(s3.revela, s4.corte), transform: `scale(${lerp(0.4, 1, revela)}) rotate(${lerp(8, 3, revela)}deg)`, transformOrigin: "left center", background: C.tinta, color: "#fff", borderRadius: 34, padding: "24px 36px", boxShadow: "0 18px 40px rgba(10,31,69,.3)" }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: AMARELO }}>MÊS PASSADO CUSTAVA</div>
          <div style={{ fontSize: 84, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-0.03em" }}>R$ 1.050</div>
        </div>
        <Clip t={t} dados={investiga} de={s3.corte + 0.15} ate={s4.corte - 0.1} x={300} y={760} larg={900} />
        {/* 4. compare com o menor preco */}
        <div style={{ opacity: visivel(s4.corte, s5.corte) }}><Grafico t={t} /></div>
        <Clip t={t} dados={analista} de={s4.corte + 0.2} ate={s5.corte - 0.1} x={660} y={1150} larg={360} cartao />
        {/* 5. anote hoje */}
        <div style={{ position: "absolute", left: 60, top: 620, width: 520, opacity: cl(bloco * 2) * visivel(s5.bloco, s6.corte), transform: `translateY(${lerp(140, 0, bloco)}px) rotate(${lerp(8, -3, bloco)}deg)`, background: "#fffbe6", borderRadius: 30, padding: "70px 44px 50px", boxShadow: "0 24px 50px rgba(10,31,69,.18)", backgroundImage: "repeating-linear-gradient(transparent 0 86px, rgba(10,31,69,.12) 86px 89px)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 44, background: C.laranja, borderRadius: "30px 30px 0 0" }} />
          <div style={{ fontSize: 56, lineHeight: "89px", fontWeight: 800, color: C.tinta, minHeight: 178 }}>{escrito}<span style={{ opacity: Math.floor(t * 5) % 2 ? 1 : 0, color: C.vermelho }}>|</span></div>
        </div>
        <div style={{ position: "absolute", left: 70, top: 950, opacity: cl(bf * 2) * visivel(s5.bf, s6.corte), transform: `scale(${lerp(0.4, 1, bf)}) rotate(-4deg)`, transformOrigin: "left center", background: C.tinta, color: "#fff", fontWeight: 900, fontSize: 52, padding: "22px 38px", borderRadius: 999, boxShadow: "0 16px 34px rgba(10,31,69,.3)" }}>e confira na <span style={{ color: AMARELO }}>Black Friday</span></div>
        <Clip t={t} dados={lista} de={s5.corte + 0.15} ate={s6.corte - 0.1} x={470} y={1050} larg={560} />
        {/* 6. fechamento */}
        <Clip t={t} dados={compradora} de={s6.fim + 0.15} ate={99} x={190} y={800} larg={700} />
      </AbsoluteFill>

      <Titulo t={t} entra={s2.titulo - 0.05} sai={s3.corte - 0.3} linhas={[["Mas", "sobre"], [["qual"], ["preço?"]]]} cor="#fff" forte={AMARELO} tamanho={132} />
      <Titulo t={t} entra={s3.cartao - 0.05} sai={s4.corte - 0.3} linhas={[["O", "preço", ["riscado"]], ["pode", "enganar"]]} tamanho={100} />
      <Titulo t={t} entra={s4.corte + 0.05} sai={s5.corte - 0.3} linhas={[["Compare", "com", "o"], [["menor"], ["preço"]]]} cor="#fff" forte={AMARELO} tamanho={104} />
      <Titulo t={t} entra={s5.corte + 0.05} sai={s6.corte - 0.3} linhas={[[["Anote"], "o", "preço"], ["de", "hoje"]]} tamanho={112} />
      {t >= s6.corte ? <Fim t={t - s6.fim + 16.3} /> : null}
      <Legenda t={t} lista={palavras} />
      <Acabamento frame={frame} />
      <Audio src={staticFile("preco/trilha.wav")} />
    </AbsoluteFill>
  );
};
