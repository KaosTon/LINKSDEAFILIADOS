import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Lottie, LottieAnimationData } from "@remotion/lottie";
import { Acabamento, Chip, Fim, Fundo, Legenda, Lei, Titulo } from "./Arrependimento";
import { C, FPS, MOLA, TL, cl, easeIn, easeInOut, easeOut, lerp, prog, sp } from "./lib";
// Personagens animados do LottieFiles (ver CREDITOS.md). O movimento deles e de animador; aqui so montamos a historia.
import compradora from "./lottie/146287.json";
import entregador from "./lottie/91905.json";
import pacoteTriste from "./lottie/6926.json";
import comCaixa from "./lottie/105509.json";
import notas from "./lottie/31326.json";
import reembolso from "./lottie/134848.json";
import feliz from "./lottie/1043934.json";
import justica from "./lottie/127842.json";

const { s1, s2, s3, s4, s5, s6 } = TL;
const AMARELO = "#ffc15e";
const CORTE = { ruim: s1.abre - 0.1, calma: s2.calma - 0.08, dias: s3.cal - 0.05, volta: s4.titulo - 0.05, lei: s5.lei - 0.05 };
const TELAS: [number, string][] = [[CORTE.ruim, C.vermelho], [CORTE.calma, C.tinta], [CORTE.dias, C.creme], [CORTE.volta, C.verde], [CORTE.lei, C.creme]];
const CORTES = [...Object.values(CORTE), s6.fim];

type Dados = { w: number; h: number };
const Clip: React.FC<{ t: number; dados: unknown; de: number; ate: number; x: number; y: number; larg: number; mola?: typeof MOLA.pop; semPop?: boolean; cartao?: boolean }> = ({ t, dados, de, ate, x, y, larg, mola = MOLA.assenta, semPop, cartao }) => {
  if (t < de || t > ate + 0.3) return null;
  const d = dados as Dados, alt = (larg * d.h) / d.w;
  const k = semPop ? 1 : sp(t, de, mola), fora = prog(t, ate, ate + 0.22, easeIn);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: larg, height: alt, opacity: cl(k * 3) * (1 - fora), transform: `scale(${lerp(0.55, 1, k) * (1 - fora * 0.3)})`, transformOrigin: "50% 80%", ...(cartao ? { background: "#fff", borderRadius: 48, boxShadow: "0 24px 50px rgba(10,31,69,.2)", overflow: "hidden" } : {}) }}>
      <Sequence from={Math.round(de * FPS)} layout="none">
        <Lottie animationData={dados as LottieAnimationData} loop style={{ width: larg, height: alt }} />
      </Sequence>
    </div>
  );
};

export const ArrependimentoPersonagens: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ultimo = Math.max(0, ...CORTES.filter((c) => c <= t));
  const soco = 1 + 0.07 * (1 - prog(t, ultimo, ultimo + 0.45, easeOut)) * (ultimo > 0 ? 1 : 0);
  const treme = t > CORTE.ruim && t < CORTE.calma ? Math.sin(t * 55) * 7 * Math.exp(-(t - CORTE.ruim) * 3) : 0;
  const escuro = (t >= CORTE.ruim && t < CORTE.dias) || (t >= CORTE.volta && t < CORTE.lei);
  const n = Math.max(0, Math.min(7, Math.floor((t - s3.dias) / s3.passo) + 1));
  const bate = sp(t, s3.dias + (n - 1) * s3.passo, MOLA.pop);
  const sete = prog(t, s3.cal, s3.cal + 0.5), seteFora = prog(t, s3.sai, s3.sai + 0.25, easeIn);
  // o entregador entra correndo pela esquerda e freia no meio; a compradora cede espaco
  const corre = prog(t, s1.caixa - 0.25, s1.pousa + 0.1, easeOut);
  const cede = prog(t, s1.caixa - 0.3, s1.caixa + 0.3, easeInOut);
  const onda = (i: number) => 1 + 0.5 * prog(t, CORTE.calma + i * 0.5, CORTE.calma + i * 0.5 + 1.2, easeOut);
  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.creme }}>
      <Fundo t={t} />
      {TELAS.map(([a, cor], i) => {
        const k = prog(t, a, a + 0.42, easeOut);
        return k > 0 ? <AbsoluteFill key={i} style={{ background: cor, clipPath: `circle(${k * 125}% at 50% 46%)` }} /> : null;
      })}
      {escuro ? <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.14) 2.5px, transparent 3px)", backgroundSize: "54px 54px", backgroundPosition: `${t * 6}px ${t * 4}px` }} /> : <AbsoluteFill style={{ opacity: t >= CORTE.dias ? 1 : 0 }}><Fundo t={t} /></AbsoluteFill>}

      <AbsoluteFill style={{ transform: `translateX(${treme}px) scale(${soco})`, transformOrigin: "50% 50%" }}>
        {/* 1. comprou: ela desfila com as sacolas. chegou: o entregador entra correndo */}
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${-cede * 330}px) scale(${1 - cede * 0.18})`, transformOrigin: "30% 70%" }}>
          <Clip t={t} dados={compradora} de={-0.4} ate={CORTE.ruim - 0.15} x={40} y={560} larg={1000} />
        </div>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${lerp(-1100, 0, corre)}px)` }}>
          <Clip t={t} dados={entregador} de={s1.caixa - 0.25} ate={CORTE.ruim - 0.15} x={330} y={820} larg={900} semPop />
        </div>
        {/* 2. nao era isso: o pacote triste, grande, num cartao */}
        <Clip t={t} dados={pacoteTriste} de={CORTE.ruim + 0.05} ate={CORTE.calma - 0.12} x={250} y={660} larg={580} mola={MOLA.pop} cartao />
        {/* 3. calma: aneis respirando */}
        {t >= CORTE.calma && t < CORTE.dias ? [0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: 540 - 220, top: 1010 - 220, width: 440, height: 440, borderRadius: "50%", border: "6px solid rgba(255,255,255,.5)", transform: `scale(${onda(i)})`, opacity: (1 - prog(t, CORTE.calma + i * 0.5, CORTE.calma + i * 0.5 + 1.2, easeOut)) * (t >= CORTE.calma + i * 0.5 ? 1 : 0) }} />
        )) : null}
        {/* 4. sete dias */}
        <div style={{ position: "absolute", left: 84, top: 540, opacity: sete * (1 - seteFora), transform: `translateY(${(1 - sete) * 60 - seteFora * 40}px)`, display: "flex", alignItems: "baseline", gap: 26 }}>
          <span style={{ fontSize: 500, lineHeight: 0.9, fontWeight: 900, letterSpacing: "-0.06em", color: C.vermelho, display: "inline-block", transform: `scale(${n ? lerp(1.3, 1, bate) : 1})`, transformOrigin: "left bottom" }}>{Math.max(1, n)}</span>
          <span style={{ fontSize: 120, fontWeight: 900, letterSpacing: "-0.04em", color: C.tinta }}>{n === 1 ? "dia" : "dias"}</span>
        </div>
        <Clip t={t} dados={comCaixa} de={s3.cal + 0.1} ate={s3.sai} x={560} y={830} larg={500} />
        <Chip t={t} entra={s3.chip1} sai={s3.sai} x={84} y={1100} texto="A partir da entrega" />
        <Chip t={t} entra={s3.chip2} sai={s3.sai + 0.06} x={84} y={1212} texto="Sem dar motivo" cor={C.verde} />
        {/* 5. o dinheiro volta, depois a comemoracao */}
        <Clip t={t} dados={notas} de={s4.moedas - 0.2} ate={s4.comemora - 0.15} x={190} y={640} larg={700} mola={MOLA.pop} />
        <Clip t={t} dados={reembolso} de={s4.volta} ate={s4.comemora - 0.12} x={690} y={1090} larg={300} mola={MOLA.pop} cartao />
        <Clip t={t} dados={feliz} de={s4.comemora - 0.05} ate={CORTE.lei - 0.12} x={-10} y={700} larg={1100} mola={MOLA.pop} cartao />
        {t >= s4.frete ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", opacity: cl(sp(t, s4.frete, MOLA.pop) * 2) * (1 - prog(t, s4.sai, s4.sai + 0.2, easeIn)) }}>
            <span style={{ display: "inline-block", background: "#fff", color: C.verde, fontWeight: 900, fontSize: 60, padding: "20px 44px", borderRadius: 999, transform: `scale(${lerp(0.5, 1, sp(t, s4.frete, MOLA.pop))})`, boxShadow: "0 16px 34px rgba(0,0,0,.18)" }}>+ o frete</span>
          </div>
        ) : null}
        {/* 6. esta na lei */}
        <Clip t={t} dados={justica} de={s5.lei + 0.05} ate={s5.sai} x={30} y={700} larg={520} />
        <Lei t={t} />
        {/* 7. fechamento: ela volta, feliz */}
        <Clip t={t} dados={compradora} de={s6.fim + 0.15} ate={99} x={190} y={800} larg={700} />
      </AbsoluteFill>

      <Titulo t={t} entra={-0.35} sai={CORTE.ruim - 0.3} selo="VOCÊ SABIA?" linhas={[["Comprou", "pela"], [["internet?"]]]} tamanho={112} />
      <Titulo t={t} entra={CORTE.ruim + 0.05} sai={CORTE.calma - 0.3} linhas={[[["Não"], ["era"]], ["bem", "isso?"]]} cor="#fff" forte={AMARELO} tamanho={124} />
      <Titulo t={t} entra={CORTE.calma} sai={CORTE.dias - 0.3} linhas={[[["Calma."]]]} tamanho={200} forte="#fff" />
      <Titulo t={t} entra={s3.cal} sai={s3.sai} linhas={[["Você", "pode", ["desistir"]]]} />
      <Titulo t={t} entra={s4.titulo} sai={s4.sai} linhas={[["E", "o", "dinheiro"], [["volta"]]]} cor="#fff" forte={AMARELO} tamanho={124} />
      <Titulo t={t} entra={s5.lei} sai={s5.sai} linhas={[["É", "seu", ["direito"]]]} tamanho={112} />
      <Fim t={t} />
      <Legenda t={t} />
      <Acabamento frame={frame} />
      <Audio src={staticFile("arrependimento/trilha.wav")} />
    </AbsoluteFill>
  );
};
