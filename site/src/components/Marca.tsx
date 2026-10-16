import { useId } from "react";

// Marca do Tem Descontos redesenhada em SVG a partir do logo mandado pelo Wellington no chat
// (16/10/2026): monograma TD em degrade do marinho ao laranja e vermelho, etiqueta de preco com
// % pendurada no D e brilhos. PENDENTE (BRIEFING §2): o arquivo original do logo em
// public/logo/ para medir as cores e conferir o desenho.

export function Monograma({ className = "w-12 h-auto", claro = false }: { className?: string; claro?: boolean }) {
  const id = useId().replace(/:/g, "");
  const marinho = claro ? "#ffffff" : "var(--marinho)";
  return (
    <svg viewBox="0 0 132 104" className={className} role="img" aria-label="TD">
      <defs>
        <linearGradient id={`g${id}`} gradientUnits="userSpaceOnUse" x1="6" y1="14" x2="104" y2="90">
          <stop offset="0" stopColor={marinho} />
          <stop offset="0.55" stopColor="var(--marca)" />
          <stop offset="1" stopColor="var(--vermelho)" />
        </linearGradient>
      </defs>
      <g fill={`url(#g${id})`}>
        <rect x="6" y="14" width="54" height="17" rx="5" />
        <rect x="23" y="14" width="18" height="76" rx="5" />
        <path fillRule="evenodd" d="M48 14H66a38 38 0 0 1 0 76H48Z M65 31V73H66a21 21 0 0 0 0-42Z" />
      </g>
      {/* etiqueta com % pendurada no D */}
      <path d="M98 74 L104 82" stroke={marinho} strokeWidth="2.5" strokeLinecap="round" />
      <g transform="translate(103 80) rotate(28)">
        <path d="M0 0 L9 -8 H27 a4 4 0 0 1 4 4 V12 a4 4 0 0 1 -4 4 H9 Z" fill="var(--vermelho)" />
        <circle cx="7" cy="4" r="2" fill="var(--fundo)" />
        <circle cx="15" cy="-1" r="2.2" fill="#fff" />
        <circle cx="24" cy="9" r="2.2" fill="#fff" />
        <path d="M14 10 L25 -2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      {/* brilhos */}
      <path d="M112 8 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3Z" fill="var(--marca)" />
      <path d="M124 38 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6Z" fill={marinho} />
    </svg>
  );
}

/** Monograma + nome em duas linhas, como no logo: TEM leve, DESCONTOS forte. */
export function Logo({ claro = false, grande = false }: { claro?: boolean; grande?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Monograma className={grande ? "w-16 h-auto" : "w-11 h-auto"} claro={claro} />
      <span className={`flex flex-col leading-none font-display ${claro ? "text-white" : "text-marinho"}`}>
        <span className={`${grande ? "text-lg" : "text-[0.8rem]"} font-medium tracking-[0.32em]`}>TEM</span>
        <span className={`${grande ? "text-3xl" : "text-xl"} font-extrabold tracking-tight`}>DESCONTOS</span>
      </span>
    </span>
  );
}
