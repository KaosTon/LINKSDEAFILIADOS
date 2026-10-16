"use client";

import Link from "next/link";
import { linkWhats } from "@/data/site";
import { MENSAGEM_PADRAO } from "@/data/whatsapp";

// Tela de erro inesperado: o site e quase todo estatico, entao isto so aparece em falha
// de rede ou de script. Oferece tentar de novo e o grupo, pra ninguem ficar sem saida.
export default function Erro({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="grao">
      <div className="max-w-3xl mx-auto px-4 py-20 md:py-28">
        <p className="eyebrow mb-5">Algo deu errado</p>
        <h1 className="font-display text-5xl md:text-6xl font-extrabold leading-[1.02]">
          A página não carregou
          <span className="block texto-degrade pb-1">tente de novo em instantes</span>
        </h1>
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center botao-marca font-semibold px-7 py-4"
          >
            Tentar de novo
          </button>
          <Link href="/" className="inline-flex items-center justify-center border border-tinta/20 hover:border-tinta font-semibold px-7 py-4 rounded-full transition-colors">
            Página inicial
          </Link>
        </div>
        <p className="mt-8 text-sm text-tinta-2">
          Se preferir, veja as ofertas direto no{" "}
          <a
            href={linkWhats(MENSAGEM_PADRAO)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-marca-escura underline underline-offset-4"
          >
            grupo do WhatsApp
          </a>
          .
        </p>
      </div>
    </section>
  );
}
