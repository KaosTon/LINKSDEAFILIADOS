import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { IconeWhats } from "@/components/Icones";
import { ID_PESSOA, pessoaNode } from "@/components/Schemas";
import { POSTS_ORDENADOS } from "@/data/blog";
import { AUTOR, CREDENCIAIS, PRINCIPAIS, SITE, TEXTOS, linkWhats } from "@/data/site";
import { MENSAGENS_ROTA } from "@/data/whatsapp";

// Pagina do autor (E-E-A-T, METODO §2.5), no padrao da Virtus (/autor/wellington-santos la):
// quem escreve, formacao, anos de experiencia, redes e tudo o que ele assinou. Dados em site.ts.

const ROTA = `/autor/${AUTOR.slug}`;
const ANOS = new Date().getFullYear() - AUTOR.anoInicioCarreira;
const TITLE = `${AUTOR.nome} | ${AUTOR.cargo}`;
const DESCRIPTION = `${AUTOR.nome}, ${AUTOR.cargo.toLowerCase()}. Engenheiro de Produção, ${ANOS} anos no mercado de seguros e as regras de conferência do grupo antes de postar.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: ROTA },
  openGraph: { title: TITLE, description: DESCRIPTION, url: ROTA, type: "profile", locale: "pt_BR", images: [{ url: AUTOR.foto, width: 400, height: 400, alt: AUTOR.nome }] },
};

export default function Autor() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE.url}${ROTA}`,
    mainEntity: { ...pessoaNode(), "@id": ID_PESSOA },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Breadcrumb items={[{ name: "Início", href: "/" }, { name: "Sobre", href: "/sobre" }, { name: AUTOR.nome, href: ROTA }]} />

      <section className="grao">
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-16 md:pt-20 grid gap-10 lg:gap-14 items-center lg:grid-cols-[0.7fr_1.3fr]">
          <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-[2rem] overflow-hidden border border-linha mx-auto lg:mx-0">
            <Image src={AUTOR.foto} alt={AUTOR.nome} fill sizes="288px" className="object-cover" priority />
          </div>
          <div>
            <p className="eyebrow mb-5">Quem escreve</p>
            <h1 className="font-display text-[2.4rem] sm:text-5xl md:text-6xl font-extrabold leading-[1.04]">{AUTOR.nome}</h1>
            <p className="mt-3 text-lg font-semibold text-marca-escura">{AUTOR.cargo}</p>
            <div className="mt-6 space-y-4 text-lg text-tinta-2 leading-relaxed max-w-2xl">
              {AUTOR.bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={linkWhats(MENSAGENS_ROTA[ROTA])} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 botao-marca font-semibold px-7 py-4">
                <IconeWhats />
                {TEXTOS.agendar}
              </a>
              <a href={AUTOR.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-4 rounded-full border border-linha bg-white font-semibold text-tinta hover:text-marca-escura">LinkedIn</a>
              <a href={AUTOR.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-4 rounded-full border border-linha bg-white font-semibold text-tinta hover:text-marca-escura">Instagram</a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-linha">
        <div className="max-w-6xl mx-auto px-4 py-14 grid sm:grid-cols-3 gap-5">
          <div className="rounded-[1.5rem] bg-fundo border border-linha p-7">
            <p className="font-display text-4xl font-extrabold text-marca-escura">{ANOS} anos</p>
            <p className="mt-2 text-sm text-tinta-2">no mercado de seguros, desde {AUTOR.anoInicioCarreira}</p>
          </div>
          <div className="rounded-[1.5rem] bg-fundo border border-linha p-7">
            <p className="font-display text-xl font-bold">{CREDENCIAIS.graduacao?.curso}</p>
            <p className="mt-2 text-sm text-tinta-2">{CREDENCIAIS.graduacao?.instituicao} (Universidade do Grande ABC, atual Anhanguera)</p>
          </div>
          <div className="rounded-[1.5rem] bg-fundo border border-linha p-7">
            <p className="font-display text-xl font-bold">Virtus Corretora de Seguros</p>
            <p className="mt-2 text-sm text-tinta-2">fundador, desde 2020</p>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 grid md:grid-cols-2 gap-10">
          <div>
            <p className="eyebrow mb-4">Artigos de {AUTOR.nome}</p>
            <ul className="divide-y divide-linha border-y border-linha">
              {POSTS_ORDENADOS.map((p) => (
                <li key={p.slug} className="py-3">
                  <Link href={`/blog/${p.slug}`} className="font-semibold text-tinta hover:text-marca-escura">{p.titulo}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Guias</p>
            <ul className="divide-y divide-linha border-y border-linha">
              {PRINCIPAIS.map((p) => (
                <li key={p.slug} className="py-3">
                  <Link href={`/guias/${p.slug}`} className="font-semibold text-marca-escura hover:text-tinta">{p.nome}</Link>
                  <p className="text-sm text-tinta-2 mt-0.5">{p.desc}</p>
                </li>
              ))}
            </ul>
            <Link href="/sobre" className="mt-4 inline-block text-sm font-semibold text-marca-escura hover:text-tinta">Como o {SITE.nome} escolhe as ofertas</Link>
          </div>
        </div>
      </section>
    </>
  );
}
