import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb, { urlAbsoluta } from "@/components/Breadcrumb";
import { IconeWhats } from "@/components/Icones";
import { CATEGORIAS, POSTS, POSTS_ORDENADOS, dataPorExtenso, post, tempoLeitura } from "@/data/blog";
import { paginaServico } from "@/data/paginas-servico";
import { AUTOR, CREDENCIAIS, SERVICOS, SITE, TEXTOS, linkWhats } from "@/data/site";
import { destinoDaTag } from "@/data/tag-destinos";
import { ID_ORGANIZACAO, pessoaNode } from "@/components/Schemas";
import { MENSAGENS_POST } from "@/data/whatsapp";

// Ate o primeiro post (16/10/2026) esta pagina ficou na pasta privada _post, porque o export
// estatico nao aceita rota dinamica sem pagina nenhuma. Saiu de la em 18/10/2026, com os 10 primeiros.
type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const p = post(slug);
  if (!p) return {};
  const url = `/blog/${slug}`;
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    keywords: p.tags,
    alternates: { canonical: url },
    // Post sem revisao do Wellington nao vai pro Google (19/10/2026): a pagina abre para quem tem o
    // link, mas so entra na busca depois de `revisadoEm` (DOCS/REVISAO-BLOG.md).
    ...(p.revisadoEm ? {} : { robots: { index: false, follow: true } }),
    twitter: { card: "summary_large_image", title: p.metaTitle, description: p.metaDescription, images: [p.imagem] },
    // openGraph da pagina substitui o do layout inteiro (inclusive a imagem): por isso a imagem vai aqui
    openGraph: {
      title: p.metaTitle,
      description: p.metaDescription,
      url,
      type: "article",
      locale: "pt_BR",
      publishedTime: `${p.dataPublicacao}T00:00:00-03:00`,
      modifiedTime: `${p.dataRevisao || p.dataPublicacao}T00:00:00-03:00`,
      tags: p.tags,
      authors: [AUTOR.nome],
      images: [{ url: p.imagem, width: 1200, height: 675, alt: p.titulo }],
    },
  };
}

export default async function PaginaPost(props: Props) {
  const { slug } = await props.params;
  const p = post(slug);
  if (!p) notFound();

  const url = `/blog/${slug}`;
  const servico = SERVICOS.find((x) => x.slug === p.servico);
  const temPagina = servico && paginaServico(servico.slug);
  const outros = POSTS_ORDENADOS.filter((x) => x.slug !== slug).slice(0, 3);

  const palavras = p.conteudo.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  // Mesmo desenho do Article da Virtus: autor com credenciais, revisao so quando ele revisou
  // de fato (revisadoEm), publisher, secao, keywords e speakable (trecho que IA e voz leem).
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.titulo,
      description: p.metaDescription,
      url: urlAbsoluta(url),
      mainEntityOfPage: { "@type": "WebPage", "@id": urlAbsoluta(url) },
      datePublished: `${p.dataPublicacao}T00:00:00-03:00`,
      dateModified: `${p.dataRevisao || p.dataPublicacao}T00:00:00-03:00`,
      inLanguage: "pt-BR",
      author: pessoaNode(),
      ...(p.revisadoEm ? { reviewedBy: pessoaNode() } : {}),
      publisher: { "@id": ID_ORGANIZACAO },
      image: [urlAbsoluta(p.imagem)],
      articleSection: servico?.nome,
      keywords: p.tags.join(", "),
      wordCount: palavras,
      citation: p.fontes.map((f) => f.url),
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".resumo-rapido li"] },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Breadcrumb items={[{ name: "Início", href: "/" }, { name: "Blog", href: "/blog" }, { name: p.titulo, href: url }]} />

      <article>
        <header className="grao">
          <div className="max-w-3xl mx-auto px-4 pt-12 pb-10 md:pt-16">
            <p className="eyebrow mb-5">{CATEGORIAS[p.categoria].nome}</p>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-[1.05]">{p.titulo}</h1>
            <p className="mt-5 text-sm text-tinta-3">
              Por <Link href={`/autor/${AUTOR.slug}`} className="text-tinta hover:text-marca-escura">{AUTOR.nome}</Link>
              {AUTOR.registro ? `, ${AUTOR.registro}` : ""} · <time dateTime={p.dataPublicacao}>{dataPorExtenso(p.dataPublicacao)}</time> · {tempoLeitura(p)} min de leitura
            </p>

            <div className="mt-8 relative aspect-[16/9] rounded-2xl overflow-hidden border border-linha">
              <Image src={p.imagem} alt="" fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
            </div>

            <div className="mt-8 rounded-2xl bg-marca-clara/60 border border-marca/25 p-6">
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-marca-escura">Resumo rápido</p>
              <ul className="resumo-rapido mt-3 space-y-2 text-tinta leading-relaxed">
                {p.resumoRapido.map((r) => (
                  <li key={r} className="flex gap-3">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-marca shrink-0" aria-hidden="true" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-10 prosa" dangerouslySetInnerHTML={{ __html: p.conteudo }} />

        {/* CTA do post: mensagem propria, pra saber de onde veio */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="rounded-[2rem] bg-tinta text-fundo p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 brilho-marca" aria-hidden="true" />
            <div className="relative">
              <p className="font-display text-3xl font-extrabold leading-tight">Quer receber ofertas conferidas assim?</p>
              <p className="mt-3 text-fundo/70 max-w-xl">
                O grupo é grátis. {SITE.horario}.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href={linkWhats(MENSAGENS_POST[p.slug])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 botao-marca font-semibold px-6 py-3.5"
                >
                  <IconeWhats className="w-4 h-4" />
                  {TEXTOS.agendar}
                </a>
                {temPagina ? (
                  <Link
                    href={`/guias/${servico.slug}`}
                    className="inline-flex items-center justify-center border border-fundo/25 hover:border-fundo font-semibold px-6 py-3.5 rounded-full transition-colors"
                  >
                    {servico.nome}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <section className="max-w-3xl mx-auto px-4 pt-14">
          <h2 className="font-display text-3xl font-extrabold leading-tight">Perguntas frequentes</h2>
          <div className="mt-6 divide-y divide-linha border-y border-linha">
            {p.faq.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="cursor-pointer list-none flex justify-between items-center gap-4 font-semibold">
                  {f.q}
                  <span className="text-marca text-2xl leading-none group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-tinta-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="max-w-3xl mx-auto px-4 pt-10 text-sm text-tinta-2">
          <p>
            {p.revisadoEm ? (
              <>Revisado por {AUTOR.nome} em {p.revisadoEm}.</>
            ) : (
              // PENDENTE: revisao do autor antes do lancamento (preencher revisadoEm)
              <span className="text-marca-escura">Revisão técnica pendente.</span>
            )}{" "}
            Conteúdo informativo: não substitui a avaliação individual.
          </p>
          {p.fontes.length ? (
            <>
              <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-tinta-3">Fontes</p>
              <ul className="mt-2 space-y-1">
                {p.fontes.map((f) => (
                  <li key={f.url}>
                    <a href={f.url} target="_blank" rel="noopener" className="underline decoration-linha underline-offset-4 hover:decoration-marca">
                      {f.nome}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {/* Tags: com dono no site viram link pro dono; sem dono, so rotulo (padrao Virtus) */}
          <div className="mt-8 flex flex-wrap gap-2">
            {p.tags.map((tag) => {
              const destino = destinoDaTag(tag);
              return destino && destino !== url ? (
                <Link key={tag} href={destino} className="px-3 py-1 rounded-full border border-linha bg-white text-xs text-tinta-2 hover:border-marca hover:text-marca-escura transition-colors">
                  {tag}
                </Link>
              ) : (
                <span key={tag} className="px-3 py-1 rounded-full border border-linha bg-fundo text-xs text-tinta-3">{tag}</span>
              );
            })}
          </div>
        </footer>

        {/* Autor (E-E-A-T, padrao Mayo Clinic): quem escreve, com registro e formacao */}
        <aside className="max-w-3xl mx-auto px-4 pt-10" aria-label="Sobre o autor">
          <div className="rounded-2xl border border-linha bg-white p-6 flex gap-5 items-start">
            {AUTOR.foto ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-marca/40">
                <Image src={AUTOR.foto} alt={AUTOR.nome} fill sizes="80px" className="object-cover" />
              </div>
            ) : null}
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-tinta-3">Escrito por</p>
              <p className="font-display text-2xl leading-tight mt-1">{AUTOR.nome}</p>
              <p className="text-sm text-tinta-2 mt-1">
                {[AUTOR.cargo, AUTOR.registro].filter(Boolean).join(", ")}.
                {CREDENCIAIS.graduacao ? ` ${CREDENCIAIS.graduacao.curso} (${CREDENCIAIS.graduacao.instituicao}).` : ""}
              </p>
              <Link href={`/autor/${AUTOR.slug}`} className="mt-2 inline-block text-sm font-semibold text-marca-escura hover:text-tinta">Formação completa</Link>
            </div>
          </div>
        </aside>
      </article>

      {outros.length ? (
        <section className="max-w-3xl mx-auto px-4 pt-14">
          <h2 className="font-display text-3xl font-extrabold leading-tight">Leia também</h2>
          <ul className="mt-4 divide-y divide-linha border-y border-linha">
            {outros.map((o) => (
              <li key={o.slug} className="py-4">
                <Link href={`/blog/${o.slug}`} className="font-semibold hover:text-marca-escura">{o.titulo}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="max-w-3xl mx-auto px-4 pt-10">
        <Link href="/blog" className="text-sm font-semibold text-marca-escura hover:text-tinta">Todos os artigos do blog</Link>
      </p>
    </>
  );
}
