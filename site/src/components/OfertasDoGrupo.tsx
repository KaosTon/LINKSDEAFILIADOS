import { ENTRAR } from "@/data/entrar";

// Ofertas reais que já passaram no grupo (15/11), com a foto em cena e o dia do post. Usada na página
// /entrar e na home. No celular os cards rolam para o lado; no computador ficam em grade.
// titulo vazio: sem titulo (na /entrar os cards vem logo depois do botao). primeiraSemEspera: a primeira
// foto carrega junto com a pagina (fica na primeira tela da /entrar); as outras so quando chegam perto.
export default function OfertasDoGrupo({ titulo = ENTRAR.provas.titulo, primeiraSemEspera = false }: { titulo?: string; primeiraSemEspera?: boolean }) {
  const { provas } = ENTRAR;
  return (
    <>
      {titulo ? <h2 className="px-4 font-display text-2xl md:text-3xl font-extrabold leading-tight text-center">{titulo}</h2> : null}
      <ul className={`${titulo ? "mt-6 " : ""}flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-3 md:grid md:grid-cols-5 md:overflow-visible`}>
        {provas.itens.map((p, i) => (
          <li key={p.img} className="snap-center shrink-0 w-[72%] sm:w-[40%] md:w-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.img} alt={p.alt} width={720} height={900} loading={primeiraSemEspera && i === 0 ? "eager" : "lazy"} className="w-full h-auto rounded-2xl border border-linha shadow-sm" />
          </li>
        ))}
      </ul>
      <p className="mt-3 px-4 text-sm text-tinta-3 text-center">{provas.nota}</p>
    </>
  );
}
