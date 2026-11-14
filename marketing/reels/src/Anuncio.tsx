import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, spring } from "remotion";
import { Audio } from "@remotion/media";
import { Acabamento, Fundo, Legenda, Titulo } from "./Arrependimento";
import { Clip } from "./ArrependimentoPersonagens";
import { C, MOLA, cl, easeIn, easeOut, lerp, prog } from "./lib";
// Personagens do LottieFiles (ver CREDITOS.md)
import cansada from "./lottie/104971.json";
import feliz from "./lottie/1511434.json";
import notificacao from "./lottie/91137.json";
import compradora from "./lottie/146287.json";
import noCelular from "./lottie/58002.json";
import entregador from "./lottie/91905.json";
import pensativo from "./lottie/119312.json";
import tV1 from "../timeline-anuncio-v1.json";
import tA from "../timeline-anuncio-a.json";
import tB from "../timeline-anuncio-b.json";
import tC from "../timeline-anuncio-c.json";
import pV1 from "./palavras-anuncio-v1.json";
import pA from "./palavras-anuncio-a.json";
import pB from "./palavras-anuncio-b.json";
import pC from "./palavras-anuncio-c.json";

/* Anúncios em vídeo para o grupo (14/11). Quatro ganchos diferentes com o MESMO corpo, para testar só a
 * abertura (o que mais pesa no Reels). Regras dos anúncios pagos: sem nome de loja, sem preço, sem ícone
 * do WhatsApp, sem promessa. Zona segura do Reels: nada importante nos 14% de cima (até ~270px) nem nos
 * 35% de baixo (depois de ~1250px), onde ficam nome da página, legenda e botão da Meta. */
export type Variante = "v1" | "a" | "b" | "c";
const DADOS = { v1: { tl: tV1, pal: pV1 }, a: { tl: tA, pal: pA }, b: { tl: tB, pal: pB }, c: { tl: tC, pal: pC } };
export const duracaoDe = (v: Variante) => Math.round(DADOS[v].tl.duracao * DADOS[v].tl.fps);

const AMARELO = "#ffc15e", PRETO = "#0d0d12", TOPO = 290, LEG = 1170;
const NOTIFS = ["Oferta do dia", "Cupom novo", "Achado da tarde", "Ofertas de várias lojas"];
const CONVERSA = ["Bom dia, grupo!! ☀️", "Alguém sabe se chega amanhã?", "kkkkkkkk", "\u{1F3A4} Áudio 0:47", "Me manda no privado"];

export const Anuncio: React.FC<{ v: Variante }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { tl, pal } = DADOS[v];
  const FPS = tl.fps, t = frame / FPS;
  const { s1, s2, s3, s4 } = tl;
  const sp = (a: number, config = MOLA.assenta) => (t < a ? 0 : spring({ frame: (t - a) * FPS, fps: FPS, config }));
  const corGancho = v === "a" ? PRETO : v === "b" ? C.laranja : C.vermelho;
  const TELAS: [number, string][] = [[-1, corGancho], [s2.corte, C.tinta], [s3.corte, C.verde], [s4.corte, C.creme]];
  const CORTES = [s1.vira || 0, s2.corte, s3.corte, s4.corte].filter(Boolean);
  const ultimo = Math.max(0, ...CORTES.filter((c) => c <= t));
  const soco = 1 + 0.07 * (1 - prog(t, ultimo, ultimo + 0.45, easeOut)) * (ultimo > 0 ? 1 : 0);
  const vis = (a: number, b: number) => (t >= a && t < b + 0.25 ? 1 - prog(t, b - 0.02, b + 0.18, easeIn) : 0);
  const vira = s1.vira || s2.corte;
  const botao = sp(s4.botao, MOLA.pop);
  const toque = t >= s4.toque ? Math.sin(cl((t - s4.toque) / 0.35) * Math.PI) : 0;
  const pulso = t >= s4.toque + 0.4 ? 1 + Math.sin((t - s4.toque) * 5) * 0.03 : 1;
  const marca = sp(s4.marca);
  const escuro = t < s3.corte;

  // Gancho de cada variante: [título antes da virada, título depois] e o desenho.
  const gancho = () => {
    if (v === "v1") return <div style={{ opacity: vis(-1, s2.corte) }}><Clip t={t} dados={cansada} de={-0.4} ate={s2.corte - 0.1} x={170} y={600} larg={740} cartao /></div>;
    if (v === "a") {
      const k = sp(0, { damping: 9, stiffness: 180, mass: 0.8 });
      const corre = prog(t, vira - 0.3, vira + 0.5, easeOut);
      return (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 620, textAlign: "center", opacity: cl(k * 3) * vis(-1, vira), transform: `scale(${lerp(2, 1, k)}) rotate(-4deg)` }}>
            <div style={{ fontSize: 190, lineHeight: 0.95, fontWeight: 900, letterSpacing: "-0.04em", color: AMARELO }}>BLACK<br />FRIDAY</div>
            <div style={{ display: "inline-block", marginTop: 24, background: "#fff", color: PRETO, fontSize: 56, fontWeight: 900, padding: "10px 36px", borderRadius: 16 }}>27 de novembro</div>
          </div>
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${lerp(-1100, 0, corre)}px)`, opacity: vis(vira - 0.4, s2.corte) }}>
            <Clip t={t} dados={entregador} de={vira - 0.4} ate={s2.corte - 0.1} x={-260} y={420} larg={1600} semPop />
          </div>
        </>
      );
    }
    if (v === "b") return <div style={{ opacity: vis(-1, s2.corte) }}><Clip t={t} dados={pensativo} de={-0.3} ate={s2.corte - 0.1} x={170} y={580} larg={740} mola={MOLA.pop} /></div>;
    // c: o grupo bagunçado, e o carimbo depois da virada
    const x = sp(vira, { damping: 8, stiffness: 220, mass: 0.7 });
    return (
      <>
        {CONVERSA.map((m, i) => {
          const a = 0.15 + i * 0.22, k = sp(a, MOLA.pop), cai = prog(t, vira + 0.15 + i * 0.04, vira + 0.7 + i * 0.04, easeIn);
          return t >= a ? (
            <div key={i} style={{ position: "absolute", left: i % 2 ? 330 : 90, top: 690 + i * 100, opacity: cl(k * 2) * (1 - cai) * vis(-1, s2.corte), transform: `translateY(${cai * 500}px) rotate(${(i % 2 ? 1 : -1) * (2 + cai * 25)}deg) scale(${lerp(0.7, 1, k)})`, background: i % 2 ? "#dcf8c6" : "#fff", color: "#222", fontSize: 40, fontWeight: 700, padding: "18px 28px", borderRadius: 24, boxShadow: "0 10px 24px rgba(0,0,0,.18)", whiteSpace: "nowrap" }}>{m}</div>
          ) : null;
        })}
        {t >= vira ? <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", opacity: cl(x * 2) * vis(vira, s2.corte), transform: `scale(${lerp(2.4, 1, x)}) rotate(-8deg)` }}>
          <span style={{ display: "inline-block", border: `14px solid ${AMARELO}`, color: AMARELO, fontSize: 120, fontWeight: 900, padding: "10px 40px", borderRadius: 30, letterSpacing: "-0.02em" }}>SEM PAPO</span>
        </div> : null}
      </>
    );
  };
  const titulos: Record<Variante, (string | [string])[][][]> = {
    v1: [[["Cansou", "de", "caçar"], [["promoção?"]]]],
    a: [[["A", ["Black"], ["Friday"]], ["vem", "aí."]], [["Vai", "caçar", "oferta"], [["sozinho?"]]]],
    b: [[["Vai", "comprar"], [["online?"]]], [["Olha", "o", ["grupo"]], ["antes."]]],
    c: [[["Grupo", "de", "ofertas"], ["cheio", "de", ["conversa?"]]], [["No", "nosso,", "ninguém"], ["fica", "de", ["papo."]]]],
  };
  const [tit1, tit2] = titulos[v];

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: corGancho }}>
      {TELAS.map(([a, cor], i) => {
        const k = a < 0 ? 1 : prog(t, a, a + 0.42, easeOut);
        return k > 0 ? <AbsoluteFill key={i} style={{ background: cor, clipPath: `circle(${k * 125}% at 50% 46%)` }} /> : null;
      })}
      {t >= s4.corte + 0.3 ? <Fundo t={t} /> : null}
      {escuro ? <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.12) 2.5px, transparent 3px)", backgroundSize: "54px 54px", backgroundPosition: `${t * 6}px ${t * 4}px` }} /> : null}

      <AbsoluteFill style={{ transform: `scale(${soco})`, transformOrigin: "50% 50%" }}>
        {gancho()}
        {/* corpo: as ofertas chegam num grupo só */}
        <Clip t={t} dados={feliz} de={s2.corte + 0.05} ate={s3.corte - 0.1} x={-20} y={600} larg={560} />
        <Clip t={t} dados={notificacao} de={s2.corte + 0.15} ate={s3.corte - 0.1} x={760} y={440} larg={230} />
        {NOTIFS.map((n, i) => {
          const a = s2.notif + i * s2.passo, k = sp(a, MOLA.pop), o = cl(k * 2) * vis(a, s3.corte - 0.05);
          return o > 0 ? (
            <div key={i} style={{ position: "absolute", left: 500, top: 640 + i * 124, width: 520, opacity: o, transform: `translateX(${(1 - k) * 180}px) scale(${lerp(0.8, 1, k)})`, background: "#fff", borderRadius: 26, padding: "20px 24px", display: "flex", gap: 16, alignItems: "center", boxShadow: "0 14px 30px rgba(0,0,0,.25)" }}>
              <div style={{ width: 58, height: 58, borderRadius: 16, background: `linear-gradient(135deg, ${C.laranja}, ${C.vermelho})`, color: "#fff", fontWeight: 900, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>TD</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: C.tinta, lineHeight: 1.1 }}>{n}</div>
            </div>
          ) : null;
        })}
        <Clip t={t} dados={compradora} de={s3.corte + 0.05} ate={s4.corte - 0.1} x={190} y={560} larg={700} />
        {([["Grátis", s3.gratis, 90], ["Sai quando quiser", s3.sai, 470]] as [string, number, number][]).map(([txt, a, x]) => {
          const k = sp(a, MOLA.pop), o = cl(k * 2) * vis(a, s4.corte - 0.05);
          return o > 0 ? <div key={txt} style={{ position: "absolute", left: x, top: 1050, opacity: o, transform: `scale(${lerp(0.4, 1, k)}) rotate(${lerp(-10, -3, k)}deg)`, background: "#fff", color: C.verde, fontWeight: 900, fontSize: 52, padding: "16px 36px", borderRadius: 999, boxShadow: "0 16px 34px rgba(0,0,0,.2)", whiteSpace: "nowrap" }}>{txt}</div> : null;
        })}
        <Clip t={t} dados={noCelular} de={s4.corte + 0.1} ate={99} x={320} y={440} larg={440} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", opacity: cl(botao * 2), transform: `scale(${lerp(0.5, 1, botao) * (1 - toque * 0.08) * pulso})` }}>
          <span style={{ display: "inline-block", background: `linear-gradient(90deg, ${C.laranja}, ${C.vermelho})`, color: "#fff", fontWeight: 900, fontSize: 64, padding: "30px 64px", borderRadius: 999, boxShadow: `0 ${18 - toque * 10}px 40px rgba(229,59,44,.4)` }}>Entrar no grupo grátis</span>
        </div>
        {t >= s4.toque - 0.4 ? (
          <div style={{ position: "absolute", left: 730, top: lerp(1110, 1000, prog(t, s4.toque - 0.4, s4.toque, easeOut)), fontSize: 120, opacity: 1 - prog(t, s4.toque + 0.6, s4.toque + 0.9, easeIn), transform: `scale(${1 - toque * 0.15})` }}>{"\u{1F446}"}</div>
        ) : null}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center", opacity: cl(marca * 2), transform: `translateY(${(1 - marca) * 40}px)` }}>
          <Img src={staticFile("marca.png")} style={{ width: 230 }} />
        </div>
      </AbsoluteFill>

      <Titulo t={t} entra={-0.35} sai={vira - 0.25} linhas={tit1} cor="#fff" forte={v === "b" ? C.tinta : AMARELO} tamanho={v === "c" ? 96 : 108} topo={TOPO} />
      {tit2 ? <Titulo t={t} entra={vira} sai={s2.corte - 0.3} linhas={tit2} cor="#fff" forte={v === "b" ? C.tinta : AMARELO} tamanho={v === "c" ? 96 : 108} topo={TOPO} /> : null}
      <Titulo t={t} entra={s2.corte + 0.05} sai={s3.corte - 0.3} linhas={[["As", "ofertas", "do", "dia"], ["num", ["grupo"], ["só"]]]} cor="#fff" forte={AMARELO} tamanho={100} topo={TOPO} />
      <Titulo t={t} entra={s3.corte + 0.05} sai={s4.corte - 0.3} linhas={[[["Grátis."]], ["Sai", "quando", "quiser."]]} cor="#fff" forte={AMARELO} tamanho={104} topo={TOPO} />
      <Titulo t={t} entra={s4.corte + 0.05} sai={99} linhas={[["Toca", "no", ["botão"]]]} tamanho={104} topo={TOPO} />
      <Legenda t={t} lista={pal} topo={LEG} />
      <Acabamento frame={frame} />
      <Audio src={staticFile(`anuncio-${v}/trilha.wav`)} />
    </AbsoluteFill>
  );
};
