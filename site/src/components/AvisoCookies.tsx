"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CHAVE_COOKIES } from "@/lib/medicao";

// Aviso de cookies (LGPD). Consentimento e acao explicita: nada de "ao continuar navegando,
// voce concorda". O "se voce permitir" e verdade no codigo: components/Medicao.tsx nao envia
// nada de quem escolhe "Apenas essenciais". Texto igual ao aprovado na Virtus em 15/09/2026.
//
// Publica a propria altura em --altura-cookie pro botao flutuante de WhatsApp subir junto e
// nao ficar escondido embaixo (caso real na Virtus, 13/09/2026). z-40: o botao e z-50 e fica
// por cima.
const VAR_ALTURA = "--altura-cookie";

export default function AvisoCookies() {
  const [visivel, setVisivel] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (!localStorage.getItem(CHAVE_COOKIES)) setVisivel(true);
      } catch {
        // sem localStorage nao da pra guardar a escolha: nao incomoda a cada pagina
      }
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const raiz = document.documentElement;
    if (!visivel) {
      raiz.style.removeProperty(VAR_ALTURA);
      return;
    }
    const el = caixa.current;
    if (!el) return;
    const publica = () => raiz.style.setProperty(VAR_ALTURA, `${el.offsetHeight}px`);
    publica();
    const observador = new ResizeObserver(publica);
    observador.observe(el);
    return () => {
      observador.disconnect();
      raiz.style.removeProperty(VAR_ALTURA);
    };
  }, [visivel]);

  const escolher = (valor: "accepted" | "declined") => {
    try {
      localStorage.setItem(CHAVE_COOKIES, valor);
    } catch {
      // sem localStorage: a escolha vale so ate fechar a aba
    }
    setVisivel(false);
  };

  if (!visivel) return null;

  return (
    <div ref={caixa} role="region" aria-label="Aviso de cookies" className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-linha shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-6">
        <p className="basis-full sm:basis-auto flex-1 text-xs sm:text-sm text-tinta-2">
          Usamos cookies essenciais e, se você permitir, de medição. Detalhes na{" "}
          <Link href="/politica-de-privacidade" className="underline underline-offset-2 hover:text-tinta">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0 ml-auto sm:ml-0">
          <button
            type="button"
            onClick={() => escolher("accepted")}
            className="bg-tinta hover:bg-black text-fundo text-sm font-semibold px-5 py-2 rounded-[3px] transition-colors"
          >
            Aceitar
          </button>
          <button
            type="button"
            onClick={() => escolher("declined")}
            className="border border-tinta/20 hover:border-tinta text-tinta text-sm font-semibold px-5 py-2 rounded-[3px] transition-colors"
          >
            Apenas essenciais
          </button>
        </div>
      </div>
    </div>
  );
}
