import type { Metadata } from "next";
import Link from "next/link";
import { IconeInstagram, IconeWhats } from "@/components/Icones";
import { Logo } from "@/components/Marca";
import { PRINCIPAIS, SITE, TEXTOS, linkWhats } from "@/data/site";
import { MENSAGENS_ROTA } from "@/data/whatsapp";

// Pagina do link da bio (Instagram, TikTok): no lugar de um Linktree. Fora do Google e do sitemap.
// No lancamento: trocar o link da bio para www.temdescontos.com.br/links.

export const metadata: Metadata = {
  title: `Links | ${SITE.nome}`,
  description: `Grupo de ofertas, guias e redes do ${SITE.nome}.`,
  alternates: { canonical: "/links" },
  robots: { index: false, follow: true },
};

type Item = { titulo: string; href: string; detalhe?: string; externo?: boolean };

const GRUPOS: { nome: string; itens: Item[] }[] = [
  {
    nome: "Guias",
    itens: PRINCIPAIS.map((g) => ({ titulo: g.nome, href: `/guias/${g.slug}` })),
  },
  {
    nome: "Mais",
    itens: [
      { titulo: "Blog", href: "/blog" },
      { titulo: "Sobre o Tem Descontos", href: "/sobre" },
    ],
  },
];

function Botao({ item }: { item: Item }) {
  const classe =
    "flex items-center justify-between gap-4 w-full rounded-2xl bg-white border border-linha hover:border-marca px-5 py-4 transition-colors";
  const conteudo = (
    <>
      <span>
        <span className="block font-semibold text-tinta leading-snug">{item.titulo}</span>
        {item.detalhe ? <span className="block text-xs text-tinta-3 mt-0.5">{item.detalhe}</span> : null}
      </span>
      <span className="text-marca-escura text-lg shrink-0" aria-hidden="true">{item.externo ? "↗" : "›"}</span>
    </>
  );
  return item.externo ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={classe}>{conteudo}</a>
  ) : (
    <Link href={item.href} className={classe}>{conteudo}</Link>
  );
}

export default function Links() {
  return (
    <section className="grao">
      <div className="max-w-md mx-auto px-4 pt-8 pb-16">
        <div className="rounded-[2rem] bg-escuro text-white px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 brilho-marca-topo" aria-hidden="true" />
          <div className="relative">
            <Logo claro grande />
            <h1 className="sr-only">{SITE.nome}: links</h1>
            <p className="mt-5 font-display text-2xl font-bold leading-snug">{SITE.frase}</p>
            <a
              href={linkWhats(MENSAGENS_ROTA["/links"])}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 botao-marca font-semibold px-6 py-4"
            >
              <IconeWhats />
              {TEXTOS.agendar} de ofertas
            </a>
            <p className="mt-3 text-xs text-white/60">{SITE.horario}. Grátis.</p>
          </div>
        </div>

        {GRUPOS.map((g) => (
          <div key={g.nome} className="mt-8">
            <h2 className="eyebrow mb-3">{g.nome}</h2>
            <ul className="space-y-3">
              {g.itens.map((i) => (
                <li key={i.href}>
                  <Botao item={i} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        {SITE.instagram || SITE.redes.length ? (
          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-semibold text-tinta-2">
            {SITE.instagram ? (
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-marca-escura">
                <IconeInstagram className="w-4 h-4" /> Instagram
              </a>
            ) : null}
            {SITE.redes.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="hover:text-marca-escura">{r.nome}</a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
