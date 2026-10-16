import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { POSTS_ORDENADOS, dataPorExtenso, tempoLeitura } from "@/data/blog";
import { AUTOR, PRINCIPAIS, SITE } from "@/data/site";

// Titulo, descricao e h1 do blog: escrever pro cliente (o assunto dele), sem promessa.
const BLOG = {
  title: `Blog: comprar bem na internet | ${SITE.nome}`,
  description: `Guias de compra, cupons e como não cair em promoção falsa na Amazon, no Mercado Livre, na Shopee e na Magalu. Do ${SITE.nome}, com fonte e data.`,
  h1: "Comprar bem na internet",
  h1Destaque: "com fonte e com data",
};

const TITLE = BLOG.title;
const DESCRIPTION = BLOG.description;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/blog",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE.nome}, ${SITE.titulo}` }],
  },
};

export default function Blog() {
  return (
    <>
      <Breadcrumb items={[{ name: "Início", href: "/" }, { name: "Blog", href: "/blog" }]} />
      <section className="grao">
        <div className="max-w-3xl mx-auto px-4 pt-12 pb-10 md:pt-20">
          <p className="eyebrow mb-5">Blog</p>
          <h1 className="font-display text-5xl md:text-6xl font-extrabold leading-[1.02]">
            {BLOG.h1}
            <span className="block texto-degrade pb-1">{BLOG.h1Destaque}</span>
          </h1>
          <p className="mt-6 text-lg text-tinta-2 leading-relaxed">
            {POSTS_ORDENADOS.length
              ? `Artigos de ${AUTOR.nome}: o que aprendemos conferindo oferta todo dia.`
              : "Os primeiros artigos estão a caminho. Enquanto isso, os guias respondem as dúvidas mais comuns."}
          </p>
          {POSTS_ORDENADOS.length ? null : (
            <ul className="mt-8 divide-y divide-linha border-y border-linha">
              {PRINCIPAIS.map((g) => (
                <li key={g.slug} className="py-3">
                  <Link href={`/guias/${g.slug}`} className="font-semibold text-marca-escura hover:text-tinta">{g.nome}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-8">
        <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS_ORDENADOS.map((p, i) => (
            <li
              key={p.slug}
              className="relative group rounded-2xl overflow-hidden border border-linha bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-20px_rgba(31,29,27,0.28)]"
            >
              <div className="relative aspect-[16/9] overflow-hidden border-b border-linha/60">
                <Image
                  src={p.imagem}
                  alt=""
                  fill
                  priority={i < 3}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              <div className="p-6">
              <p className="text-xs text-tinta-3 tabular-nums">
                <time dateTime={p.dataPublicacao}>{dataPorExtenso(p.dataPublicacao)}</time> · {tempoLeitura(p)} min de leitura
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight">
                <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 group-hover:text-marca-escura transition-colors">
                  {p.titulo}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-tinta-2 leading-relaxed">{p.resumo}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
