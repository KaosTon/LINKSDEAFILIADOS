import type { Metadata } from "next";
import BotaoEntrar from "@/components/BotaoEntrar";
import BarraEntrar from "@/components/BarraEntrar";
import OfertasDoGrupo from "@/components/OfertasDoGrupo";
import { IconeCheck } from "@/components/Icones";
import { ENTRAR } from "@/data/entrar";
import { FAQ, LOJAS, SITE } from "@/data/site";

// Pagina de entrada dos anuncios: uma promessa, um botao. Fora do Google e do sitemap.
// Sem menu e sem botao flutuante (ForaDaEntrada no Header e no layout), com barra fixa do botao (BarraEntrar).
// O texto mora em src/data/entrar.ts.

export const metadata: Metadata = {
  title: `Entrar no grupo | ${SITE.nome}`,
  description: SITE.descricaoCurta,
  alternates: { canonical: "/entrar" },
  robots: { index: false, follow: true },
};

const CLASSE_BOTAO = "w-full sm:w-auto inline-flex items-center justify-center gap-2 botao-marca font-semibold text-lg px-8 py-4";

export default function Entrar() {
  const { comoE } = ENTRAR;
  return (
    <>
      {/* Primeira tela (17/11): titulo com a frase do anuncio, o botao e logo abaixo as ofertas reais. */}
      <section className="relative overflow-hidden grao">
        <div className="absolute -top-40 -right-40 w-[36rem] h-[36rem] rounded-full halo-marca opacity-40 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto px-4 pt-6 pb-6 md:pt-14 md:pb-10 text-center">
          <p className="eyebrow mb-3 justify-center">{ENTRAR.eyebrow}</p>
          <h1 className="font-display text-[1.7rem] sm:text-5xl font-extrabold leading-[1.08] text-tinta">
            {ENTRAR.h1}
            <span className="block texto-degrade pb-1">{ENTRAR.h1Destaque}</span>
          </h1>
          <div className="mt-5">
            <BotaoEntrar id="entrar-principal" texto={ENTRAR.botao} className={CLASSE_BOTAO} />
            <p className="mt-2.5 text-sm text-tinta-2">{ENTRAR.depoisDoBotao}</p>
          </div>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[13px] text-tinta-2">
            {ENTRAR.pontos.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <IconeCheck className="w-4 h-4 text-marca-escura shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative max-w-5xl mx-auto pb-10 md:pb-14">
          <p className="px-4 mb-3 text-sm font-semibold text-tinta-2 text-center">{ENTRAR.rotuloProvas}</p>
          <OfertasDoGrupo titulo="" primeiraSemEspera />
        </div>
      </section>

      <section className="bg-white border-y border-linha">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <p className="text-lg text-tinta-2 leading-relaxed max-w-xl mx-auto">{ENTRAR.lead}</p>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1">
            {LOJAS.map((l) => (
              <li key={l} className="font-display text-lg font-bold text-marinho">{l}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grao">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold leading-tight">{comoE.titulo}</h2>
          <ol className="mt-8 space-y-5">
            {comoE.itens.map((p, i) => (
              <li key={p.titulo} className="flex gap-4">
                <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-full bg-marinho text-white font-display text-lg font-extrabold">{i + 1}</span>
                <div>
                  <h3 className="font-semibold text-tinta text-lg leading-snug">{p.titulo}</h3>
                  <p className="mt-1 text-sm text-tinta-2 leading-relaxed">{p.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 space-y-3">
            {ENTRAR.faq.map((i) => (
              <details key={FAQ[i].q} className="rounded-2xl bg-white border border-linha px-5 py-4">
                <summary className="font-semibold text-tinta cursor-pointer">{FAQ[i].q}</summary>
                <p className="mt-2 text-sm text-tinta-2 leading-relaxed">{FAQ[i].a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <BotaoEntrar texto={ENTRAR.botao} className={CLASSE_BOTAO} />
            <p className="mt-3 text-sm text-tinta-3">{ENTRAR.rodapeBotao}</p>
            <p className="mt-1 text-sm text-tinta-3">{SITE.horario}.</p>
          </div>
        </div>
      </section>

      <BarraEntrar alvo="entrar-principal" texto={ENTRAR.botao} />
    </>
  );
}
