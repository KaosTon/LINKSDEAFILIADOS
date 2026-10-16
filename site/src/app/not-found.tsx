import Link from "next/link";
import { IconeWhats } from "@/components/Icones";
import { PRINCIPAIS, linkWhats } from "@/data/site";
import { MENSAGENS_CTA } from "@/data/whatsapp";
import { paginaServico } from "@/data/paginas-servico";

// 404 com a cara do site e caminho de volta: quem cai aqui vem de link antigo (post antigo) ou de endereco digitado errado.
export default function NaoEncontrado() {
  const comPagina = PRINCIPAIS.filter((p) => paginaServico(p.slug));
  return (
    <section className="grao">
      <div className="max-w-3xl mx-auto px-4 py-20 md:py-28">
        <p className="eyebrow mb-5">Erro 404</p>
        <h1 className="font-display text-5xl md:text-6xl font-extrabold leading-[1.02]">
          Esta página não existe
          <span className="block texto-degrade pb-1">ou mudou de endereço</span>
        </h1>
        <p className="mt-6 text-lg text-tinta-2 leading-relaxed">
          O endereço pode ter sido digitado errado ou a página saiu do ar. Veja por onde continuar:
        </p>
        <ul className="mt-8 divide-y divide-linha border-y border-linha">
          <li className="py-3"><Link href="/" className="font-semibold text-marca-escura hover:text-tinta">Página inicial</Link></li>
          {comPagina.map((p) => (
            <li key={p.slug} className="py-3">
              <Link href={`/guias/${p.slug}`} className="font-semibold text-marca-escura hover:text-tinta">{p.nome}</Link>
            </li>
          ))}
          <li className="py-3"><Link href="/blog" className="font-semibold text-marca-escura hover:text-tinta">Blog</Link></li>
        </ul>
        <a
          href={linkWhats(MENSAGENS_CTA.naoEncontrada)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center justify-center gap-2 botao-marca font-semibold px-7 py-4"
        >
          <IconeWhats />
          Ver as ofertas no grupo
        </a>
      </div>
    </section>
  );
}
