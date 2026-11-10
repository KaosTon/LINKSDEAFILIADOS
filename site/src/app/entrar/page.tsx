import type { Metadata } from "next";
import BotaoEntrar from "@/components/BotaoEntrar";
import { IconeCheck } from "@/components/Icones";
import { ENTRAR } from "@/data/entrar";
import { FAQ, LOJAS, SITE } from "@/data/site";

// Pagina de entrada dos anuncios: uma promessa, um botao. Fora do Google e do sitemap.
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
      <section className="relative overflow-hidden grao">
        <div className="absolute -top-40 -right-40 w-[36rem] h-[36rem] rounded-full halo-marca opacity-40 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto px-4 pt-10 pb-14 md:pt-16 md:pb-20 text-center">
          <p className="eyebrow mb-5">{ENTRAR.eyebrow}</p>
          <h1 className="font-display text-[2.4rem] sm:text-6xl font-extrabold leading-[1.04] text-tinta">
            {ENTRAR.h1}
            <span className="block texto-degrade pb-1">{ENTRAR.h1Destaque}</span>
          </h1>
          <p className="mt-5 text-lg text-tinta-2 leading-relaxed max-w-xl mx-auto">{ENTRAR.lead}</p>
          <div className="mt-8">
            <BotaoEntrar texto={ENTRAR.botao} className={CLASSE_BOTAO} />
            <p className="mt-3 text-sm text-tinta-3">{ENTRAR.rodapeBotao}</p>
          </div>
          <ul className="mt-8 flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-x-6 gap-y-3 text-sm text-tinta-2 text-left sm:text-center max-w-xs sm:max-w-none mx-auto">
            {ENTRAR.pontos.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <IconeCheck className="w-5 h-5 text-marca-escura shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-linha bg-white">
        <div className="max-w-3xl mx-auto px-4 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-8">
          <p className="text-xs uppercase tracking-[0.18em] text-tinta-3 shrink-0">Ofertas de</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
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
            <p className="mt-3 text-sm text-tinta-3">{SITE.horario}.</p>
          </div>
        </div>
      </section>
    </>
  );
}
