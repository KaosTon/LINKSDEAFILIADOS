import type { Metadata } from "next";
import Link from "next/link";
import { HOME } from "@/data/home";
import { POSTS_ORDENADOS } from "@/data/blog";
import { PAGINAS_SERVICO, paginaServico } from "@/data/paginas-servico";
import { DESTAQUES_TOPO, FAQ, LOJAS, PRINCIPAIS, SITE, TEXTOS, linkWhats } from "@/data/site";
import { MENSAGENS_CTA } from "@/data/whatsapp";
import { IconeCheck, IconeWhats } from "@/components/Icones";
import { Monograma } from "@/components/Marca";

// Home. Estrutura do site-modelo da fabrica (hero com conteudo real, faixa de numeros, passos,
// guias, FAQ, CTA), com a cara do Tem Descontos: o "conteudo real" do hero e a ficha das
// conferencias que o robo faz. O texto mora em src/data/home.ts.

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** valor de um numero da faixa escura: palavra-chave vira contagem do dado, o resto e texto */
function valorNumero(v: string): string {
  if (v === "lojas") return String(LOJAS.length);
  if (v === "conferencias") return String(PAGINAS_SERVICO[0].tabela.linhas.length);
  return v;
}

export default function Home() {
  const { hero, ficha, numeros } = HOME;
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden grao">
        <div className="absolute -top-40 -right-40 w-[36rem] h-[36rem] rounded-full halo-marca opacity-40 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <div>
            <p className="eyebrow mb-6">{hero.eyebrow}</p>
            <h1 className="font-display text-[2.6rem] sm:text-6xl xl:text-7xl font-extrabold leading-[1.02] text-tinta">
              {hero.h1}
              <span className="block texto-degrade pb-1">{hero.h1Destaque}</span>
            </h1>
            <p className="mt-6 text-lg text-tinta-2 leading-relaxed max-w-xl">{hero.lead}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={linkWhats(MENSAGENS_CTA.heroHome)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 botao-marca font-semibold px-7 py-4"
              >
                <IconeWhats />
                {TEXTOS.agendar}
              </a>
              <Link
                href={hero.ctaSecundario.href}
                className="inline-flex items-center justify-center border border-tinta/20 hover:border-tinta text-tinta font-semibold px-7 py-4 rounded-full transition-colors"
              >
                {hero.ctaSecundario.label}
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-tinta-2">
              {DESTAQUES_TOPO.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <IconeCheck className="w-5 h-5 text-marca-escura shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Ficha de conferencia: o que o robo checa de verdade antes de cada post */}
          <div className="relative max-w-[440px] w-full mx-auto">
            <div className="relative rounded-[2rem] bg-escuro text-white p-7 md:p-8 overflow-hidden shadow-[0_30px_60px_-30px_rgba(14,21,51,0.6)]">
              <div className="absolute inset-0 brilho-marca" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-display text-2xl font-bold leading-tight">{ficha.titulo}</p>
                  <Monograma className="w-16 h-auto shrink-0" claro />
                </div>
                <ol className="mt-6 space-y-3">
                  {ficha.itens.map((t, i) => (
                    <li key={t} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3">
                      <span className="w-7 h-7 rounded-full botao-marca flex items-center justify-center text-xs font-bold shrink-0 tabular-nums">{i + 1}</span>
                      <span className="text-[0.95rem]">{t}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 text-sm text-white/70">
                  {ficha.rodape}{" "}
                  <Link href={hero.ctaSecundario.href} className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                    Ver todas
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numeros reais, do dado e do robo */}
      <section className="bg-tinta text-white relative overflow-hidden">
        <div className="absolute inset-0 brilho-marca" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 text-center">
          {numeros.map((n) => (
            <div key={n.rotulo}>
              <p className="font-display text-4xl md:text-5xl font-extrabold leading-none text-marca">{valorNumero(n.valor)}</p>
              <p className="mt-2 text-sm text-white/70">{n.rotulo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lojas */}
      <section className="border-b border-linha bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
          <p className="text-xs uppercase tracking-[0.18em] text-tinta-3 shrink-0">Ofertas de</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {LOJAS.map((l) => (
              <li key={l} className="font-display text-xl md:text-2xl font-bold text-marinho">{l}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="grao scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">{HOME.passos.eyebrow}</p>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">{HOME.passos.titulo}</h2>
          </div>
          <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {HOME.passos.itens.map((p, i) => (
              <li key={p.titulo} className="relative">
                {i < HOME.passos.itens.length - 1 ? <span className="hidden lg:block absolute top-7 left-[3.5rem] right-[-2rem] h-px bg-linha" aria-hidden="true" /> : null}
                <span className="relative inline-flex w-14 h-14 items-center justify-center rounded-full bg-marinho text-white font-display text-2xl font-extrabold">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-tinta text-lg">{p.titulo}</h3>
                <p className="mt-1.5 text-sm text-tinta-2 leading-relaxed">{p.desc}</p>
              </li>
            ))}
          </ol>
          <p className="mt-12 text-sm text-tinta-3">{SITE.horario}.</p>
        </div>
      </section>

      {/* Guias */}
      <section id="guias" className="bg-white border-y border-linha scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">{HOME.guias.eyebrow}</p>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">{HOME.guias.titulo}</h2>
            <p className="mt-5 text-tinta-2 leading-relaxed">{HOME.guias.lead}</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {PRINCIPAIS.map((g, i) => {
              const pagina = paginaServico(g.slug);
              return (
                <article
                  key={g.slug}
                  className={`relative rounded-[1.5rem] border p-7 flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-20px_rgba(14,21,51,0.3)] ${i === 0 ? "bg-marca-clara border-marca/30 hover:border-marca" : "bg-fundo border-linha hover:border-marca/40"}`}
                >
                  <p className="font-display text-5xl font-extrabold text-marca/25 leading-none tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-4 font-display text-2xl font-bold leading-tight">
                    <Link href={`/guias/${g.slug}`} className="after:absolute after:inset-0 hover:text-marca-escura">
                      {pagina ? pagina.h1 : g.nome}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-tinta-2 leading-relaxed flex-1">{g.desc}</p>
                  <p className="mt-5 text-sm font-semibold text-marca-escura">
                    Ler o guia <span aria-hidden="true">→</span>
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blog (some enquanto nao houver post) */}
      {POSTS_ORDENADOS.length ? (
        <section className="max-w-6xl mx-auto px-4 pt-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-4">Blog</p>
              <h2 className="font-display text-4xl font-extrabold leading-tight">Do blog</h2>
            </div>
            <Link href="/blog" className="text-sm font-semibold text-marca-escura hover:text-tinta">Ver todos</Link>
          </div>
          <ul className="mt-8 grid md:grid-cols-3 gap-5">
            {POSTS_ORDENADOS.slice(0, 3).map((p) => (
              <li key={p.slug} className="rounded-[1.5rem] border border-linha bg-white p-6">
                <Link href={`/blog/${p.slug}`} className="font-display text-xl font-bold leading-tight hover:text-marca-escura">{p.titulo}</Link>
                <p className="mt-2 text-sm text-tinta-2">{p.resumo}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* FAQ */}
      <section id="duvidas" className="scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 py-20">
          <p className="eyebrow mb-4">{HOME.faq.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">{HOME.faq.titulo}</h2>
          <div className="mt-10 divide-y divide-linha border-y border-linha">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="cursor-pointer list-none flex justify-between items-center gap-4 font-semibold">
                  {f.q}
                  <span className="text-marca-escura text-2xl leading-none group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-tinta-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-tinta-2">
            Mais sobre segurança em{" "}
            <Link href="/guias/grupo-de-ofertas-no-whatsapp-e-seguro" className="font-semibold text-marca-escura underline decoration-marca/40 underline-offset-4">
              grupo de ofertas no WhatsApp é seguro?
            </Link>
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="rounded-[2rem] bg-escuro text-white px-8 py-14 md:px-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 brilho-marca" aria-hidden="true" />
          <div className="relative">
            <Monograma className="w-20 h-auto mx-auto" claro />
            <h2 className="mt-6 font-display text-4xl md:text-5xl font-extrabold leading-tight">{HOME.cta.titulo}</h2>
            <p className="mt-4 text-white/70 max-w-xl mx-auto">{HOME.cta.texto}</p>
            <a
              href={linkWhats(MENSAGENS_CTA.fimHome)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 botao-marca font-semibold px-8 py-4"
            >
              <IconeWhats />
              {TEXTOS.agendar} no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
