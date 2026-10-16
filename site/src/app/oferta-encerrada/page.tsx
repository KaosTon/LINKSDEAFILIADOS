import type { Metadata } from "next";
import Link from "next/link";
import { IconeWhats } from "@/components/Icones";
import { PRINCIPAIS, SITE, TEXTOS, linkWhats } from "@/data/site";
import { MENSAGENS_ROTA } from "@/data/whatsapp";

// Para onde o encurtador manda um link curto que nao existe mais (temdescontos.com.br/xxxxx
// apagado ou digitado errado). Fora do Google e do sitemap.

export const metadata: Metadata = {
  title: `Oferta encerrada | ${SITE.nome}`,
  description: "Essa oferta não está mais disponível. Veja as próximas no grupo.",
  alternates: { canonical: "/oferta-encerrada" },
  robots: { index: false, follow: true },
};

export default function OfertaEncerrada() {
  return (
    <section className="grao">
      <div className="max-w-2xl mx-auto px-4 py-20 md:py-28 text-center">
        <p className="eyebrow mb-5 justify-center">Link de oferta</p>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.04]">
          Essa oferta acabou
          <span className="block texto-degrade pb-1">mas sempre chega outra</span>
        </h1>
        <p className="mt-6 text-lg text-tinta-2 leading-relaxed">
          O link que você abriu não leva mais a nenhuma oferta. As novas saem no grupo, {SITE.horario.toLowerCase().replace("ofertas ", "")}.
        </p>
        <a
          href={linkWhats(MENSAGENS_ROTA["/oferta-encerrada"])}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-center gap-2 botao-marca font-semibold px-7 py-4"
        >
          <IconeWhats />
          {TEXTOS.agendar}
        </a>
        <ul className="mt-12 text-left divide-y divide-linha border-y border-linha">
          {PRINCIPAIS.map((g) => (
            <li key={g.slug} className="py-3">
              <Link href={`/guias/${g.slug}`} className="font-semibold text-marca-escura hover:text-tinta">{g.nome}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
