import { ENTRAR } from "@/data/entrar";

// Ofertas reais que já passaram no grupo (15/11), com a foto em cena e o dia do post. Usada na página
// /entrar e na home. No celular os cards rolam para o lado; no computador ficam em grade.
export default function OfertasDoGrupo({ titulo = ENTRAR.provas.titulo }: { titulo?: string }) {
  const { provas } = ENTRAR;
  return (
    <>
      <h2 className="px-4 font-display text-2xl md:text-3xl font-extrabold leading-tight text-center">{titulo}</h2>
      <ul className="mt-6 flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-3 md:grid md:grid-cols-5 md:overflow-visible">
        {provas.itens.map((p) => (
          <li key={p.img} className="snap-center shrink-0 w-[72%] sm:w-[40%] md:w-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.img} alt={p.alt} width={720} height={900} loading="lazy" className="w-full h-auto rounded-2xl border border-linha shadow-sm" />
          </li>
        ))}
      </ul>
      <p className="mt-3 px-4 text-sm text-tinta-3 text-center">{provas.nota}</p>
    </>
  );
}
