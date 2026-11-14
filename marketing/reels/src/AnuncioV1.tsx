import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, spring } from "remotion";
import { Audio } from "@remotion/media";
import { Acabamento, Fundo, Legenda, Titulo } from "./Arrependimento";
import { Clip } from "./ArrependimentoPersonagens";
import { C, MOLA, cl, easeIn, easeOut, lerp, prog } from "./lib";
import TL from "../timeline-anuncio-v1.json";
import palavras from "./palavras-anuncio-v1.json";
// Personagens do LottieFiles (ver CREDITOS.md)
import cansada from "./lottie/104971.json";
import feliz from "./lottie/1511434.json";
import notificacao from "./lottie/91137.json";
import compradora from "./lottie/146287.json";
import noCelular from "./lottie/58002.json";

// Anúncio em vídeo v1 (14/11): leva para /entrar?c=v1. Regras dos anúncios pagos: sem nome de loja,
// sem preço, sem ícone do WhatsApp, sem promessa.
const FPS = TL.fps;
const { s2, s3, s4 } = TL;
const AMARELO = "#ffc15e";
const sp = (t: number, inicio: number, config = MOLA.assenta) => (t < inicio ? 0 : spring({ frame: (t - inicio) * FPS, fps: FPS, config }));
const TELAS: [number, string][] = [[-1, C.vermelho], [s2.corte, C.tinta], [s3.corte, C.verde], [s4.corte, C.creme]];
const CORTES = [s2.corte, s3.corte, s4.corte];
const NOTIFS = ["Oferta do dia", "Cupom novo", "Achado da tarde", "Ofertas de várias lojas"];

export const AnuncioV1: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ultimo = Math.max(0, ...CORTES.filter((c) => c <= t));
  const soco = 1 + 0.07 * (1 - prog(t, ultimo, ultimo + 0.45, easeOut)) * (ultimo > 0 ? 1 : 0);
  const escuro = t < s3.corte + 0.3 ? t < s2.corte || t >= s2.corte : false;
  const vis = (a: number, b: number) => (t >= a && t < b + 0.25 ? 1 - prog(t, b - 0.02, b + 0.18, easeIn) : 0);
  const botao = sp(t, s4.botao, MOLA.pop);
  const toque = t >= s4.toque ? Math.sin(cl((t - s4.toque) / 0.35) * Math.PI) : 0;
  const pulso = t >= s4.toque + 0.4 ? 1 + Math.sin((t - s4.toque) * 5) * 0.03 : 1;
  const marca = sp(t, s4.marca, MOLA.assenta);
  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.vermelho }}>
      {TELAS.map(([a, cor], i) => {
        const k = a < 0 ? 1 : prog(t, a, a + 0.42, easeOut);
        return k > 0 ? <AbsoluteFill key={i} style={{ background: cor, clipPath: `circle(${k * 125}% at 50% 46%)` }} /> : null;
      })}
      {t >= s4.corte + 0.3 ? <Fundo t={t} /> : null}
      {escuro && t < s4.corte ? <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.14) 2.5px, transparent 3px)", backgroundSize: "54px 54px", backgroundPosition: `${t * 6}px ${t * 4}px` }} /> : null}

      <AbsoluteFill style={{ transform: `scale(${soco})`, transformOrigin: "50% 50%" }}>
        {/* 1. cansada de procurar */}
        <div style={{ opacity: vis(-1, s2.corte) }}>
          <Clip t={t} dados={cansada} de={-0.4} ate={s2.corte - 0.1} x={170} y={760} larg={740} cartao />
        </div>
        {/* 2. as ofertas chegam num grupo só */}
        <Clip t={t} dados={feliz} de={s2.corte + 0.05} ate={s3.corte - 0.1} x={-30} y={700} larg={700} />
        <Clip t={t} dados={notificacao} de={s2.corte + 0.15} ate={s3.corte - 0.1} x={720} y={560} larg={300} />
        {NOTIFS.map((n, i) => {
          const a = s2.notif + i * s2.passo, k = sp(t, a, MOLA.pop), o = cl(k * 2) * vis(a, s3.corte - 0.05);
          return o > 0 ? (
            <div key={i} style={{ position: "absolute", left: 520, top: 880 + i * 128, width: 500, opacity: o, transform: `translateX(${(1 - k) * 180}px) scale(${lerp(0.8, 1, k)})`, background: "#fff", borderRadius: 26, padding: "20px 24px", display: "flex", gap: 16, alignItems: "center", boxShadow: "0 14px 30px rgba(0,0,0,.25)" }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: `linear-gradient(135deg, ${C.laranja}, ${C.vermelho})`, color: "#fff", fontWeight: 900, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>TD</div>
              <div style={{ fontSize: 38, fontWeight: 800, color: C.tinta, lineHeight: 1.15 }}>{n}</div>
            </div>
          ) : null;
        })}
        {/* 3. grátis, sai quando quiser */}
        <Clip t={t} dados={compradora} de={s3.corte + 0.05} ate={s4.corte - 0.1} x={110} y={760} larg={860} />
        {[["Grátis", s3.gratis, 110], ["Sai quando quiser", s3.sai, 470]].map(([txt, a, x]) => {
          const k = sp(t, a as number, MOLA.pop), o = cl(k * 2) * vis(a as number, s4.corte - 0.05);
          return o > 0 ? <div key={txt as string} style={{ position: "absolute", left: x as number, top: 1250, opacity: o, transform: `scale(${lerp(0.4, 1, k)}) rotate(${lerp(-10, -3, k)}deg)`, background: "#fff", color: C.verde, fontWeight: 900, fontSize: 52, padding: "18px 38px", borderRadius: 999, boxShadow: "0 16px 34px rgba(0,0,0,.2)", whiteSpace: "nowrap" }}>{txt as string}</div> : null;
        })}
        {/* 4. toca no botão */}
        <Clip t={t} dados={noCelular} de={s4.corte + 0.1} ate={99} x={250} y={540} larg={580} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", opacity: cl(botao * 2), transform: `scale(${lerp(0.5, 1, botao) * (1 - toque * 0.08) * pulso})` }}>
          <span style={{ display: "inline-block", background: `linear-gradient(90deg, ${C.laranja}, ${C.vermelho})`, color: "#fff", fontWeight: 900, fontSize: 64, padding: "30px 64px", borderRadius: 999, boxShadow: `0 ${18 - toque * 10}px 40px rgba(229,59,44,.4)` }}>Entrar no grupo grátis</span>
        </div>
        {t >= s4.toque - 0.4 ? (
          <div style={{ position: "absolute", left: 720, top: lerp(1250, 1140, prog(t, s4.toque - 0.4, s4.toque, easeOut)), fontSize: 120, opacity: 1 - prog(t, s4.toque + 0.6, s4.toque + 0.9, easeIn), transform: `scale(${1 - toque * 0.15})` }}>{"\u{1F446}"}</div>
        ) : null}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", opacity: cl(marca * 2), transform: `translateY(${(1 - marca) * 40}px)` }}>
          <Img src={staticFile("marca.png")} style={{ width: 240 }} />
        </div>
      </AbsoluteFill>

      <Titulo t={t} entra={-0.35} sai={s2.corte - 0.3} linhas={[["Cansou", "de", "caçar"], [["promoção?"]]]} cor="#fff" forte={AMARELO} tamanho={112} />
      <Titulo t={t} entra={s2.corte + 0.05} sai={s3.corte - 0.3} linhas={[["As", "ofertas", "do", "dia"], ["num", ["grupo"], ["só"]]]} cor="#fff" forte={AMARELO} tamanho={104} />
      <Titulo t={t} entra={s3.corte + 0.05} sai={s4.corte - 0.3} linhas={[[["Grátis."]], ["Sai", "quando", "quiser."]]} cor="#fff" forte={AMARELO} tamanho={116} />
      <Titulo t={t} entra={s4.corte + 0.05} sai={99} linhas={[["Toca", "no", ["botão"]]]} tamanho={112} />
      <Legenda t={t} lista={palavras} />
      <Acabamento frame={frame} />
      <Audio src={staticFile("anuncio-v1/trilha.wav")} />
    </AbsoluteFill>
  );
};
