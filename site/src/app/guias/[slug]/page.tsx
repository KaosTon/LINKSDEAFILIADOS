import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb, { urlAbsoluta } from "@/components/Breadcrumb";
import { IconeWhats } from "@/components/Icones";
import { ID_ORGANIZACAO } from "@/components/Schemas";
import { POSTS_ORDENADOS } from "@/data/blog";
import { PAGINAS_SERVICO, paginaServico } from "@/data/paginas-servico";
import { AUTOR, PRINCIPAIS, SERVICOS, SITE, TEXTOS, linkWhats } from "@/data/site";
import { MENSAGENS_SERVICO } from "@/data/whatsapp";

// Guia (o papel da pagina de servico do site-modelo, METODO §2): pergunta no h1, resposta
// direta, CTA sem rolar no celular, tabela com dado real, passo a passo, FAQ, autoria e fontes.
// So existe pagina pro guia com conteudo em paginas-servico.ts; o resto e 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return PAGINAS_SERVICO.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/guias/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const pagina = paginaServico(slug);
  if (!pagina) return {};
  const url = `/guias/${slug}`;
  return {
    title: pagina.title,
    description: pagina.description,
    alternates: { canonical: url },
    // openGraph da pagina substitui o do layout inteiro (inclusive a imagem): por isso a imagem vai aqui
    openGraph: {
      title: pagina.title,
      description: pagina.description,
      url,
      type: "article",
      locale: "pt_BR",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE.nome}, ${SITE.titulo}` }],
    },
  };
}

export default async function PaginaGuia(props: PageProps<"/guias/[slug]">) {
  const { slug } = await props.params;
  const pagina = paginaServico(slug);
  const guia = SERVICOS.find((s) => s.slug === slug);
  if (!pagina || !guia) notFound();

  const url = `/guias/${slug}`;
  const posts = POSTS_ORDENADOS.filter((p) => p.servico === slug);
  // links de saida: os outros guias
  const relacionados = PRINCIPAIS.filter((p) => p.slug !== slug && paginaServico(p.slug));

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: pagina.h1,
      description: pagina.description,
      url: urlAbsoluta(url),
      inLanguage: "pt-BR",
      author: { "@id": ID_ORGANIZACAO },
      publisher: { "@id": ID_ORGANIZACAO },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: pagina.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Breadcrumb items={[{ name: "Início", href: "/" }, { name: "Guias", href: "/#guias" }, { name: guia.nome, href: url }]} />

      {/* Abertura: pergunta, resposta direta e CTA sem rolar no celular */}
      <section className="grao">
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-x-14 gap-y-8 items-start">
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="eyebrow mb-5">Guia</p>
            <h1 className="font-display text-[2.4rem] sm:text-5xl md:text-6xl font-extrabold leading-[1.04]">
              {pagina.h1}
              <span className="block texto-degrade pb-1">{pagina.h1Destaque}</span>
            </h1>
            <p className="mt-7 text-lg md:text-xl text-tinta leading-relaxed max-w-2xl">{pagina.resposta}</p>
          </div>

          <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2 rounded-[2rem] bg-escuro text-white p-7 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 brilho-marca" aria-hidden="true" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Em números</p>
              <dl className="mt-5 grid grid-cols-2 gap-5">
                {pagina.numeros.map((n) => (
                  <div key={n.rotulo}>
                    <dt className="text-xs text-white/60">{n.rotulo}</dt>
                    <dd className="font-display text-4xl font-extrabold leading-none mt-1 text-laranja">{n.valor}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm text-white/75 leading-relaxed">Ofertas conferidas assim, todos os dias, no grupo do {SITE.nome}.</p>
              <a
                href={linkWhats(MENSAGENS_SERVICO[slug])}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 botao-marca font-semibold px-6 py-4"
              >
                <IconeWhats />
                {TEXTOS.agendar}
              </a>
              <p className="mt-3 text-xs text-white/60 text-center">{SITE.horario}. Grátis.</p>
            </div>
          </aside>
          <p className="lg:col-start-1 lg:row-start-2 text-tinta-2 leading-relaxed max-w-2xl">{pagina.intro}</p>
        </div>
      </section>

      {/* Tabela com dado real */}
      <section className="bg-white border-y border-linha">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">{pagina.tabela.eyebrow}</p>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">{pagina.tabela.titulo}</h2>
          </div>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-linha">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">{pagina.tabela.titulo}</caption>
              <thead className="bg-tinta text-white">
                <tr>
                  {pagina.tabela.colunas.map((c) => (
                    <th key={c} scope="col" className="px-5 py-4 font-semibold">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagina.tabela.linhas.map(([a, b, c]) => (
                  <tr key={a} className="border-t border-linha even:bg-fundo align-top">
                    <th scope="row" className="px-5 py-4 font-semibold text-tinta w-1/4">{a}</th>
                    <td className="px-5 py-4 text-tinta-2 leading-relaxed">{b}</td>
                    <td className="px-5 py-4 text-tinta-2 leading-relaxed">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-tinta-3">{pagina.tabela.legenda}</p>
        </div>
      </section>

      {/* Passo a passo para quem le */}
      {pagina.etapas?.length ? (
        <section>
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-14">
            <div>
              <p className="eyebrow mb-4">Passo a passo</p>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">{pagina.etapasTitulo}</h2>
            </div>
            <ol className="divide-y divide-linha border-y border-linha">
              {pagina.etapas.map((e, i) => (
                <li key={e.nome} className="py-5 grid grid-cols-[3rem_1fr] gap-4">
                  <span className="font-display text-3xl font-extrabold text-marca-escura leading-none tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-semibold text-tinta">{e.nome}</h3>
                    <p className="mt-1 text-sm text-tinta-2 leading-relaxed">{e.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      <section className="bg-white border-y border-linha">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-20">
          <p className="eyebrow mb-4">Dúvidas</p>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">Perguntas frequentes</h2>
          <div className="mt-10 divide-y divide-linha">
            {pagina.faq.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="cursor-pointer list-none flex justify-between items-center gap-4 font-semibold">
                  {f.q}
                  <span className="text-marca-escura text-2xl leading-none group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-tinta-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Posts do blog sobre este guia: link de entrada pra eles */}
      {posts.length ? (
        <section className="max-w-3xl mx-auto px-4 pt-12">
          <p className="eyebrow mb-4">No blog</p>
          <ul className="divide-y divide-linha border-y border-linha">
            {posts.map((p) => (
              <li key={p.slug} className="py-4">
                <Link href={`/blog/${p.slug}`} className="font-display text-2xl font-bold leading-tight hover:text-marca-escura">{p.titulo}</Link>
                <p className="mt-1 text-sm text-tinta-2">{p.resumo}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Autoria, revisao e fontes (E-E-A-T) */}
      <section className="max-w-3xl mx-auto px-4 py-12 text-sm text-tinta-2">
        <p>
          Guia de <Link href={`/autor/${AUTOR.slug}`} className="font-semibold text-tinta hover:text-marca-escura">{AUTOR.nome}</Link>.{" "}
          {pagina.revisadoEm ? (
            <>Revisado em {pagina.revisadoEm}.</>
          ) : (
            // PENDENTE: revisao do Wellington antes do lancamento (preencher revisadoEm)
            <span className="text-marca-escura">Revisão pendente.</span>
          )}
        </p>
        {pagina.fontes.length ? (
          <>
            <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-tinta-3">Fontes</p>
            <ul className="mt-2 space-y-1">
              {pagina.fontes.map((f) => (
                <li key={f.url}>
                  <a href={f.url} target="_blank" rel="noopener" className="underline decoration-linha underline-offset-4 hover:decoration-marca">
                    {f.nome}
                  </a>
                  <span className="text-tinta-3">, consultada em {f.consultadaEm}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <div className="mt-8 pt-6 border-t border-linha flex flex-wrap gap-x-6 gap-y-2">
          {relacionados.map((p) => (
            <Link key={p.slug} href={`/guias/${p.slug}`} className="font-semibold text-marca-escura hover:text-tinta">{p.nome}</Link>
          ))}
          <Link href="/#como-funciona" className="font-semibold text-marca-escura hover:text-tinta">Como funciona o grupo</Link>
        </div>
      </section>
    </>
  );
}
