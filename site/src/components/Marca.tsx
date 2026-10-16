import Image from "next/image";

// Logo do Tem Descontos. Arquivo original do Wellington (16/10/2026) em
// assets/logo/tem-descontos-original.jpg; os recortes com fundo transparente em public/logo/
// sairam dele (versao "claro": o marinho virou branco, para fundo escuro). Nao redesenhar:
// trocar o arquivo e refazer os recortes.

/** So o monograma TD com a etiqueta e os brilhos (464x314). */
export function Monograma({ className = "w-12 h-auto", claro = false, prioridade = false }: { className?: string; claro?: boolean; prioridade?: boolean }) {
  return (
    <Image
      src={claro ? "/logo/monograma-claro.webp" : "/logo/monograma.webp"}
      alt="TD"
      width={464}
      height={314}
      priority={prioridade}
      className={className}
    />
  );
}

/** O logo inteiro, como foi desenhado: TD em cima, TEM DESCONTOS embaixo (756x430). */
export function LogoCompleto({ className = "w-48 h-auto", claro = false, prioridade = false }: { className?: string; claro?: boolean; prioridade?: boolean }) {
  return (
    <Image
      src={claro ? "/logo/tem-descontos-claro.webp" : "/logo/tem-descontos.webp"}
      alt="Tem Descontos"
      width={756}
      height={430}
      priority={prioridade}
      className={className}
    />
  );
}

/** Versao deitada para o topo (64px de altura nao cabem o logo empilhado legivel): monograma +
 *  TEM DESCONTOS na mesma fonte do logo (Montserrat, TEM em italico, DESCONTOS extra negrito). */
export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Monograma className="w-[3.4rem] h-auto" claro={claro} prioridade />
      <span className={`flex flex-col leading-none font-display ${claro ? "text-white" : "text-marinho"}`}>
        <span className="text-[0.8rem] font-medium italic tracking-[0.06em]">TEM</span>
        <span className="text-[1.15rem] font-extrabold tracking-tight">DESCONTOS</span>
      </span>
    </span>
  );
}
