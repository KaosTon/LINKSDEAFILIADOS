import Link from "next/link";
import { LOJAS, PRINCIPAIS, SITE } from "@/data/site";
import { IconeInstagram } from "./Icones";
import { Logo } from "./Marca";

export default function Footer() {
  return (
    <footer className="bg-escuro text-white/80 mt-24">
      <div className="max-w-6xl mx-auto px-4 py-14 grid gap-10 md:grid-cols-[1.1fr_0.9fr_1.2fr]">
        <div>
          <Logo claro />
          <p className="text-sm mt-5 leading-relaxed text-white/65">{SITE.descricaoCurta}</p>
          <p className="text-sm mt-3 text-white/65">Ofertas de {LOJAS.join(", ")}.</p>
          {SITE.instagram ? (
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm hover:text-white">
              <IconeInstagram className="w-4 h-4" /> {SITE.instagramUsuario}
            </a>
          ) : null}
        </div>
        <div className="text-sm">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/50 mb-3">Guias</p>
          <ul className="space-y-2">
            {PRINCIPAIS.map((g) => (
              <li key={g.slug}>
                <Link href={`/guias/${g.slug}`} className="hover:text-white">{g.nome}</Link>
              </li>
            ))}
            <li>
              <Link href="/blog" className="hover:text-white">Blog</Link>
            </li>
            <li>
              <Link href="/sobre" className="hover:text-white">Sobre o Tem Descontos</Link>
            </li>
          </ul>
        </div>
        <div className="text-xs leading-relaxed text-white/65">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/50 mb-3">Aviso</p>
          <p>{SITE.aviso}</p>
          {SITE.email ? <p className="mt-3">{SITE.email}</p> : null}
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="max-w-6xl mx-auto px-4 py-5 text-xs text-white/50">
          © {new Date().getFullYear()} {SITE.nome}. ·{" "}
          <Link href="/politica-de-privacidade" className="underline underline-offset-2 hover:text-white">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </footer>
  );
}
