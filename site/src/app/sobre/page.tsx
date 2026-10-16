import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { IconeWhats } from "@/components/Icones";
import { Monograma } from "@/components/Marca";
import { POSTS_ORDENADOS } from "@/data/blog";
import { AUTOR, LOJAS, PRINCIPAIS, SITE, TEXTOS, linkWhats } from "@/data/site";
import { MENSAGENS_ROTA } from "@/data/whatsapp";

// Quem faz o Tem Descontos e como as ofertas sao escolhidas (E-E-A-T, METODO §2.5). E pra ca que
// aponta o "Guia de ..." das paginas e posts.

const TITLE = `Sobre o ${SITE.nome}: como escolhemos as ofertas`;
const DESCRIPTION = `Quem faz o ${SITE.nome}, como o robô encontra e confere as ofertas de ${LOJAS.join(", ")} e como ganhamos dinheiro sem mudar o seu preço.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/sobre" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/sobre",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE.nome}, ${SITE.titulo}` }],
  },
};

const PRINCIPIOS = [
  { titulo: "A loja tem a última palavra", desc: "O preço, o estoque e as regras são da loja. Conferimos antes de postar, e se algo mudar depois, vale o que está na loja." },
  { titulo: "Na dúvida, não posta", desc: "Oferta que não deu para conferir, produto que não bate com o anúncio ou kit com quantidade diferente fica de fora." },
  { titulo: "Sem exagero no post", desc: "Nada de \"menor preço da história\" ou \"só nos próximos minutos\" se a loja não disse isso." },
  { titulo: "Comissão às claras", desc: "Os links são de afiliado: a loja nos paga uma comissão pela venda, e o preço para você é o mesmo." },
];

export default function Sobre() {
  return (
    <>
      <Breadcrumb items={[{ name: "Início", href: "/" }, { name: "Sobre", href: "/sobre" }]} />

      <section className="grao">
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-16 md:pt-20 grid gap-10 lg:gap-14 items-center lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow mb-5">Sobre</p>
            <h1 className="font-display text-[2.4rem] sm:text-5xl md:text-6xl font-extrabold leading-[1.04]">
              Quem faz o {SITE.nome}
              <span className="block texto-degrade pb-1">e como as ofertas são escolhidas</span>
            </h1>
            <div className="mt-7 space-y-4 text-lg text-tinta-2 leading-relaxed max-w-2xl">
              {AUTOR.bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <a
              href={linkWhats(MENSAGENS_ROTA["/sobre"])}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 botao-marca font-semibold px-7 py-4"
            >
              <IconeWhats />
              {TEXTOS.agendar}
            </a>
          </div>
          <div className="rounded-[2rem] bg-white border border-linha p-10 flex items-center justify-center">
            <Monograma className="w-56 max-w-full h-auto" />
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-linha">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <p className="eyebrow mb-4">Como trabalhamos</p>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-tight max-w-2xl">Quatro regras que valem para toda oferta</h2>
          <div className="mt-10 grid sm:grid-cols-2 gap-5">
            {PRINCIPIOS.map((p) => (
              <div key={p.titulo} className="rounded-[1.5rem] bg-fundo border border-linha p-7">
                <h3 className="font-display text-xl font-bold">{p.titulo}</h3>
                <p className="mt-2 text-sm text-tinta-2 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-tinta-2">
            A lista completa do que o robô confere está em{" "}
            <Link href="/guias/como-saber-se-a-promocao-e-verdadeira" className="font-semibold text-marca-escura underline decoration-marca/40 underline-offset-4">
              como saber se a promoção é verdadeira
            </Link>
            .
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 grid md:grid-cols-2 gap-10">
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
          </div>
          <div>
            <p className="eyebrow mb-4">Artigos</p>
            {POSTS_ORDENADOS.length ? (
              <ul className="divide-y divide-linha border-y border-linha">
                {POSTS_ORDENADOS.map((p) => (
                  <li key={p.slug} className="py-3">
                    <Link href={`/blog/${p.slug}`} className="font-semibold text-tinta hover:text-marca-escura">{p.titulo}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-tinta-2">Os primeiros artigos do blog estão a caminho.</p>
            )}
            <Link href="/blog" className="mt-4 inline-block text-sm font-semibold text-marca-escura hover:text-tinta">Ir para o blog</Link>
          </div>
        </div>
      </section>
    </>
  );
}
