import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { Boneco, BX, BY, BS, MAO } from "./Boneco";
import { C, FPS, MOLA, TL, cl, easeIn, easeInOut, easeOut, lerp, prog, rnd, sp, vida } from "./lib";
import palavras from "./palavras.json";

for (const [peso, arq] of [[700, "Inter-Bold"], [800, "Inter-ExtraBold"], [900, "Inter-Black"]] as const) {
  loadFont({ family: "Inter", url: staticFile(`fontes/${arq}.otf`), weight: String(peso) });
}
const { s1, s2, s3, s4, s5, s6 } = TL;
const CX = 800, CY = BY; // onde a caixa pousa

/* ---------- Fundo: nada fica 100% parado (manchas e pontos derivam devagar) ---------- */
const Fundo: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: C.creme }}>
    <div style={{ position: "absolute", width: 1100, height: 1100, borderRadius: "50%", left: 480 + Math.sin(t * 0.35) * 40, top: -520 + Math.cos(t * 0.3) * 30, background: "radial-gradient(closest-side, rgba(247,148,29,.30), transparent)" }} />
    <div style={{ position: "absolute", width: 1200, height: 1200, borderRadius: "50%", left: -620 + Math.cos(t * 0.28) * 40, top: 1150 + Math.sin(t * 0.33) * 30, background: "radial-gradient(closest-side, rgba(229,59,44,.18), transparent)" }} />
    <div style={{ position: "absolute", inset: -60, backgroundImage: "radial-gradient(rgba(10,31,69,.10) 2.5px, transparent 3px)", backgroundSize: "54px 54px", backgroundPosition: `${t * 6}px ${t * 4}px`, WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, #000 20%, transparent 75%)" }} />
  </AbsoluteFill>
);

const Acabamento: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.07, mixBlendMode: "multiply" }}>
      <filter id="grao"><feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={Math.floor(frame / 2)} /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter="url(#grao)" />
    </svg>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(10,31,69,.16) 100%)" }} />
  </AbsoluteFill>
);

/* ---------- Titulo: palavras sobem de dentro de uma mascara, uma apos a outra ---------- */
type Linha = (string | [string])[]; // ["palavra"] entre colchetes = palavra de destaque
const Titulo: React.FC<{ t: number; entra: number; sai: number; linhas: Linha[]; tamanho?: number; sub?: string; selo?: string }> = ({ t, entra, sai, linhas, tamanho = 104, sub, selo }) => {
  if (t < entra - 0.05 || t > sai + 0.4) return null;
  const fora = prog(t, sai, sai + 0.32, easeIn);
  let n = 0;
  return (
    <div style={{ position: "absolute", left: 84, right: 84, top: 236, opacity: 1 - fora, transform: `translateY(${-fora * 40}px)` }}>
      {selo ? (
        <div style={{ display: "inline-block", background: `linear-gradient(90deg, ${C.laranja}, ${C.vermelho})`, color: "#fff", fontWeight: 900, fontSize: 32, letterSpacing: 3, padding: "14px 32px", borderRadius: 999, marginBottom: 26, transform: `scale(${lerp(0.6, 1, sp(t, entra, MOLA.pop))})`, transformOrigin: "left center", opacity: cl(sp(t, entra, MOLA.pop) * 2) }}>{selo}</div>
      ) : null}
      {linhas.map((linha, i) => (
        <div key={i} style={{ display: "flex", gap: "0 26px", flexWrap: "wrap", overflow: "hidden", paddingBottom: 14, marginBottom: -14 }}>
          {linha.map((p, j) => {
            const k = prog(t, entra + n * 0.09, entra + n * 0.09 + 0.7);
            n++;
            const forte = Array.isArray(p);
            return (
              <span key={j} style={{ display: "inline-block", fontSize: tamanho, lineHeight: 1.06, fontWeight: 900, letterSpacing: "-0.035em", color: forte ? C.vermelho : C.tinta, transform: `translateY(${(1 - k) * 110}%) rotate(${(1 - k) * 5}deg)`, transformOrigin: "left bottom" }}>
                {forte ? p[0] : p}
              </span>
            );
          })}
        </div>
      ))}
      {sub ? (
        <div style={{ fontSize: 44, lineHeight: 1.25, fontWeight: 700, color: C.mudo, marginTop: 20, opacity: prog(t, entra + 0.5, entra + 1), transform: `translateY(${(1 - prog(t, entra + 0.5, entra + 1.1)) * 24}px)` }}>{sub}</div>
      ) : null}
    </div>
  );
};

/* ---------- Legenda sincronizada: acende a palavra que a voz esta falando ---------- */
type P = { t: string; a: number; b: number };
const GRUPOS: P[][] = (() => {
  const g: P[][] = [[]];
  for (const p of palavras as P[]) {
    g[g.length - 1].push(p);
    if (/[.,?!]$/.test(p.t) || g[g.length - 1].length >= 4) g.push([]);
  }
  return g.filter((x) => x.length);
})();
const Legenda: React.FC<{ t: number }> = ({ t }) => {
  const i = GRUPOS.findIndex((g, n) => t >= g[0].a - 0.08 && t < (GRUPOS[n + 1] ? GRUPOS[n + 1][0].a - 0.08 : g[g.length - 1].b + 0.5));
  if (i < 0) return null;
  const g = GRUPOS[i];
  const k = sp(t, g[0].a - 0.08, MOLA.pop);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1490, display: "flex", justifyContent: "center" }}>
      <div style={{ background: C.tinta, borderRadius: 30, padding: "20px 38px", display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", transform: `scale(${lerp(0.86, 1, k)})`, opacity: cl(k * 3), boxShadow: "0 18px 40px rgba(10,31,69,.22)" }}>
        {g.map((p, j) => {
          const dita = t >= p.a - 0.03;
          const agora = dita && t < p.b + 0.12;
          return (
            <span key={j} style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-0.02em", color: agora ? "#ffc15e" : dita ? "#fff" : "rgba(255,255,255,.38)", transform: `translateY(${agora ? -4 : 0}px)`, display: "inline-block" }}>{p.t}</span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- Objetos ---------- */
const Caixa: React.FC<{ t: number }> = ({ t }) => {
  if (t < s1.caixa || t > s4.caixaSai + 1) return null;
  const queda = prog(t, s1.caixa, s1.pousa, easeIn);
  const assenta = sp(t, s1.pousa, { damping: 9, stiffness: 260, mass: 0.6 });
  const amassa = t >= s1.pousa ? (1 - assenta) * 0.22 : 0;     // amassa ao pousar e volta
  const sai = prog(t, s4.caixaSai, s4.caixaSai + 0.6, easeIn);
  const abre = prog(t, s1.abre, s1.abre + 0.45) - prog(t, s3.chip1 - 0.45, s3.chip1 - 0.15, easeInOut);
  return (
    <g transform={`translate(${CX + sai * 520},${lerp(CY - 900, CY, queda)}) rotate(${sai * 14}) scale(${1 + amassa * 0.6},${1 - amassa})`}>
      <ellipse cx={0} cy={6} rx={150} ry={20} fill={C.tinta} opacity={0.12 * queda} />
      <rect x={-130} y={-210} width={260} height={210} rx={18} fill="#d9a066" stroke="#b97d44" strokeWidth={6} />
      <rect x={-22} y={-207} width={44} height={204} fill="#e9c08e" />
      <rect x={-104} y={-96} width={64} height={44} rx={8} fill="#fff" opacity={0.85} />
      <g transform={`translate(0,-210) rotate(${-abre * 128} -130 0)`}><rect x={-130} y={-17} width={130} height={34} rx={10} fill="#c98f55" stroke="#b97d44" strokeWidth={5} /></g>
      <g transform={`translate(0,-210) rotate(${abre * 128} 130 0)`}><rect x={0} y={-17} width={130} height={34} rx={10} fill="#c98f55" stroke="#b97d44" strokeWidth={5} /></g>
    </g>
  );
};

const Duvida: React.FC<{ t: number }> = ({ t }) => {
  const v = vida(t, s1.duvida, s1.sai - 0.1);
  if (v.op <= 0) return null;
  return (
    <g opacity={v.op} transform={`translate(${BX + 150},${BY - 720 - v.k * 16}) scale(${lerp(0.4, 1, v.k)}) rotate(${Math.sin(t * 5) * 6})`}>
      <circle r={58} fill={C.tinta} />
      <text y={26} textAnchor="middle" fontSize={78} fontWeight={900} fill="#fff" fontFamily="Inter">?</text>
    </g>
  );
};

const Calendario: React.FC<{ t: number }> = ({ t }) => {
  if (t < s3.cal || t > s3.sai + 0.5) return null;
  const k = sp(t, s3.cal, MOLA.pesada);
  const sai = prog(t, s3.sai, s3.sai + 0.3, easeIn);
  return (
    <g opacity={cl(k * 2) * (1 - sai)} transform={`translate(566,${lerp(700, 580, k) - sai * 50}) rotate(${lerp(8, -3, k)} 235 165)`}>
      <rect x={6} y={14} width={470} height={330} rx={40} fill={C.tinta} opacity={0.12} />
      <rect width={470} height={330} rx={40} fill="#fff" />
      <path d="M0 40 A40 40 0 0 1 40 0 H430 A40 40 0 0 1 470 40 V92 H0 Z" fill={C.vermelho} />
      <text x={235} y={64} textAnchor="middle" fontSize={38} fontWeight={900} fill="#fff" letterSpacing={3} fontFamily="Inter">7 DIAS</text>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const x = 28 + (i % 4) * 106 + (i >= 4 ? 53 : 0), y = 116 + Math.floor(i / 4) * 104;
        const m = sp(t, s3.dias + i * s3.passo, MOLA.pop);
        return (
          <g key={i} transform={`translate(${x},${y})`}>
            <rect width={94} height={90} rx={20} fill="#fff4ea" />
            <g opacity={cl(m * 2)} transform={`translate(47,45) scale(${lerp(0.4, 1, m)}) translate(-47,-45)`}>
              <rect width={94} height={90} rx={20} fill={C.verde} />
              <path d="M27 47 L41 61 L68 31" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        );
      })}
    </g>
  );
};

const Chip: React.FC<{ t: number; entra: number; sai: number; x: number; y: number; texto: string; cor?: string }> = ({ t, entra, sai, x, y, texto, cor = C.tinta }) => {
  const v = vida(t, entra, sai);
  if (v.op <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: v.op, transform: `scale(${lerp(0.5, 1, v.k)}) rotate(${lerp(-8, 0, v.k)}deg)`, transformOrigin: "left center", background: cor, color: "#fff", fontWeight: 800, fontSize: 44, padding: "20px 34px", borderRadius: 999, boxShadow: "0 14px 30px rgba(10,31,69,.2)", whiteSpace: "nowrap" }}>{texto}</div>
  );
};

const Moedas: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const a = s4.moedas + i * 0.13, k = prog(t, a, a + 0.7, easeInOut);
      if (k <= 0 || k >= 1) return null;
      const x = lerp(1160, MAO.x, k), y = lerp(1080 - i * 20, MAO.y, k) - Math.sin(k * Math.PI) * 260;
      return (
        <g key={i} transform={`translate(${x},${y}) scale(${Math.cos(k * 9 + i) * 0.35 + 0.75},1) scale(${lerp(1.1, 0.7, k)})`}>
          <circle r={36} fill="#f7b733" stroke="#d98f12" strokeWidth={7} />
          <text y={15} textAnchor="middle" fontSize={40} fontWeight={900} fill="#b8740a" fontFamily="Inter">$</text>
        </g>
      );
    })}
  </g>
);

const Confete: React.FC<{ t: number }> = ({ t }) => {
  const dt = t - s4.comemora;
  if (dt < 0 || dt > 1.6) return null;
  const cores = [C.laranja, C.vermelho, C.verde, C.tinta, "#f7b733"];
  return (
    <g>
      {Array.from({ length: 34 }).map((_, i) => {
        const ang = lerp(-2.75, -0.4, rnd(i)), vel = lerp(520, 1150, rnd(i + 40));
        const x = 430 + Math.cos(ang) * vel * dt * (1 - dt * 0.2), y = 900 + Math.sin(ang) * vel * dt + 950 * dt * dt;
        return <rect key={i} x={-12} y={-8} width={24} height={16} rx={4} fill={cores[i % 5]} opacity={cl(1 - (dt - 1) / 0.5)} transform={`translate(${x},${y}) rotate(${dt * lerp(-520, 520, rnd(i + 80))})`} />;
      })}
    </g>
  );
};

const Lei: React.FC<{ t: number }> = ({ t }) => {
  if (t < s5.lei || t > s5.sai + 0.5) return null;
  const k = sp(t, s5.lei, MOLA.pesada), sai = prog(t, s5.sai, s5.sai + 0.3, easeIn);
  const a = sp(t, s5.artigo, MOLA.pop), c = prog(t, s5.codigo, s5.codigo + 0.6);
  return (
    <div style={{ position: "absolute", left: 560, top: 640, width: 460, opacity: cl(k * 2) * (1 - sai), transform: `translateY(${lerp(140, 0, k) - sai * 50}px) rotate(${lerp(10, 3, k)}deg)`, background: "#fff", borderRadius: 40, padding: "38px 40px 42px", boxShadow: "0 24px 50px rgba(10,31,69,.18)" }}>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 4, color: C.mudo }}>ESTÁ NA LEI</div>
      <div style={{ fontSize: 132, lineHeight: 1, fontWeight: 900, letterSpacing: "-0.04em", color: C.vermelho, marginTop: 10, transform: `scale(${lerp(0.5, 1, a)})`, transformOrigin: "left center", opacity: cl(a * 2) }}>Art. 49</div>
      <div style={{ fontSize: 40, lineHeight: 1.15, fontWeight: 800, color: C.tinta, marginTop: 14, opacity: c, transform: `translateY(${(1 - c) * 20}px)` }}>Código de Defesa do Consumidor</div>
    </div>
  );
};

const Fim: React.FC<{ t: number }> = ({ t }) => {
  if (t < s6.fim - 0.1) return null;
  const k = sp(t, s6.fim, MOLA.assenta), a = sp(t, s6.arroba, MOLA.pop);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center" }}>
      <Img src={staticFile("marca.png")} style={{ width: 300, opacity: cl(k * 2), transform: `scale(${lerp(0.6, 1, k)})` }} />
      <div style={{ fontSize: 74, lineHeight: 1.06, fontWeight: 900, letterSpacing: "-0.035em", color: C.tinta, marginTop: 18, opacity: prog(t, s6.fim + 0.25, s6.fim + 0.8), transform: `translateY(${(1 - prog(t, s6.fim + 0.25, s6.fim + 0.9)) * 30}px)` }}>Mais dicas de compra<br />no nosso perfil</div>
      <div style={{ display: "inline-block", marginTop: 22, fontSize: 52, fontWeight: 900, color: "#fff", background: C.vermelho, padding: "14px 36px", borderRadius: 999, opacity: cl(a * 2), transform: `scale(${lerp(0.5, 1, a)})` }}>@temdescontos</div>
    </div>
  );
};

export const Arrependimento: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // "camera": aproxima bem devagar o tempo todo e da um tranco leve no pouso da caixa
  const tranco = t >= s1.pousa ? Math.exp(-(t - s1.pousa) * 9) * Math.sin((t - s1.pousa) * 46) * 9 : 0;
  const zoom = 1 + Math.sin((t / TL.duracao) * Math.PI) * 0.035;
  const volta = vida(t, s4.volta, s4.sai);
  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.creme }}>
      <Fundo t={t} />
      <AbsoluteFill style={{ transform: `translateY(${tranco}px) scale(${zoom})`, transformOrigin: "50% 62%" }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
          <ellipse cx={540} cy={BY + 10} rx={470} ry={44} fill={C.tinta} opacity={0.06 * (1 - prog(t, s6.fim - 0.3, s6.fim, easeInOut))} />
          <Caixa t={t} />
          <Calendario t={t} />
          <Boneco t={t} />
          <Duvida t={t} />
          <Moedas t={t} />
          <Confete t={t} />
        </svg>
        <Chip t={t} entra={s3.chip1} sai={s3.sai} x={560} y={920} texto="A partir da entrega" />
        <Chip t={t} entra={s3.chip2} sai={s3.sai + 0.06} x={560} y={1012} texto="Sem dar motivo" cor={C.verde} />
        <div style={{ position: "absolute", left: 540, top: 1010, opacity: volta.op, transform: `scale(${lerp(0.5, 1, volta.k)})`, transformOrigin: "left center", background: C.verde, color: "#fff", fontWeight: 900, fontSize: 46, padding: "22px 36px", borderRadius: 999, boxShadow: "0 14px 30px rgba(31,157,85,.3)", whiteSpace: "nowrap" }}>Dinheiro de volta</div>
        <Chip t={t} entra={s4.frete} sai={s4.sai + 0.06} x={540} y={1124} texto="+ o frete" />
        <Lei t={t} />
      </AbsoluteFill>
      <Titulo t={t} entra={-0.35} sai={s1.abre - 0.25} selo="VOCÊ SABIA?" linhas={[["Comprou", "pela"], [["internet..."]]]} />
      <Titulo t={t} entra={s1.abre + 0.1} sai={s1.sai} linhas={[["...e", ["não"], ["era"]], ["bem", "isso?"]]} />
      <Titulo t={t} entra={s2.calma - 0.05} sai={s2.sai} linhas={[[["Calma."]]]} tamanho={168} />
      <Titulo t={t} entra={s3.cal} sai={s3.sai} linhas={[["Você", "tem", ["7"], ["dias"]], ["para", "desistir"]]} />
      <Titulo t={t} entra={s4.titulo} sai={s4.sai} linhas={[["E", "o", "dinheiro"], [["volta"]]]} />
      <Titulo t={t} entra={s5.lei} sai={s5.sai} linhas={[["É", "seu", ["direito"]]]} />
      <Fim t={t} />
      <Legenda t={t} />
      <Acabamento frame={frame} />
      <Audio src={staticFile("trilha.wav")} />
    </AbsoluteFill>
  );
};
