"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IconeWhats } from "@/components/Icones";
import { SITE, linkWhats } from "@/data/site";
import { MENSAGENS_CTA, whatsDaRota } from "@/data/whatsapp";
import { registrarCliqueWhats } from "@/lib/medicao";

// Botao flutuante de WhatsApp, com a mensagem da pagina em que a pessoa esta.
// Sobe junto com o aviso de cookies enquanto ele estiver na tela: o aviso publica a propria
// altura em --altura-cookie (sem aviso, a variavel nao existe e o botao volta pro lugar).
//
// Balao (15/11, ideia do Wellington, como na landing do Meu Dental): quem fica um tempo lendo sem
// tocar em nada ve um convite curto ao lado do botao. Aparece uma vez por visita (sessionStorage),
// some no X e nao volta. Tocar em qualquer coisa da pagina recomeca a contagem; rolar nao conta
// (rolar e ler). Sem urgencia nem promessa (QUALIDADE §1).
const ESPERA_MS = 15000;
const CHAVE_BALAO = "td-balao";

export default function WhatsFlutuante() {
  const pathname = usePathname();
  const [balao, setBalao] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(CHAVE_BALAO)) return;
    } catch {
      // sem sessionStorage o balao ainda aparece, so nao lembra que ja apareceu
    }
    let t = setTimeout(() => setBalao(true), ESPERA_MS);
    const recomeca = () => {
      clearTimeout(t);
      t = setTimeout(() => setBalao(true), ESPERA_MS);
    };
    window.addEventListener("pointerdown", recomeca);
    window.addEventListener("keydown", recomeca);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointerdown", recomeca);
      window.removeEventListener("keydown", recomeca);
    };
  }, []);

  useEffect(() => {
    if (!balao) return;
    try {
      sessionStorage.setItem(CHAVE_BALAO, "1");
    } catch {
      // ver comentario acima
    }
  }, [balao]);

  return (
    <>
      {balao && (
        <div
          role="dialog"
          aria-label="Convite para o grupo de ofertas"
          style={{ bottom: "calc(5.75rem + var(--altura-cookie, 0px))" }}
          className="fixed right-5 z-50 w-[min(19rem,calc(100vw-2.5rem))] rounded-2xl bg-white border border-linha shadow-xl shadow-black/15 p-4 balao-entra"
        >
          <button
            type="button"
            onClick={() => setBalao(false)}
            aria-label="Fechar convite"
            className="absolute top-2 right-2 w-8 h-8 rounded-full text-tinta-3 hover:bg-fundo-2 flex items-center justify-center text-lg leading-none"
          >
            ×
          </button>
          <p className="pr-6 font-semibold text-tinta leading-snug">Quer receber ofertas e cupons no seu WhatsApp?</p>
          <p className="mt-1 text-sm text-tinta-2 leading-relaxed">O grupo é grátis, só os administradores postam e você sai quando quiser.</p>
          <a
            href={linkWhats(MENSAGENS_CTA.balao)}
            target="_blank"
            rel="noopener noreferrer"
            data-wa-medido="1"
            onClick={() => {
              registrarCliqueWhats(`${MENSAGENS_CTA.balao}:${pathname || "/"}`);
              setBalao(false);
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 botao-marca font-semibold px-4 py-2.5"
          >
            <IconeWhats className="w-5 h-5" />
            Entrar no grupo grátis
          </a>
          <span aria-hidden="true" className="absolute -bottom-2 right-6 w-4 h-4 rotate-45 bg-white border-r border-b border-linha" />
        </div>
      )}
      <a
        href={whatsDaRota(pathname)}
        target="_blank"
        rel="noopener noreferrer"
        data-wa-medido="1"
        onClick={() => registrarCliqueWhats(`flutuante:${pathname || "/"}`)}
        aria-label={`Falar com ${SITE.nome} no WhatsApp`}
        style={{ bottom: "calc(1.25rem + var(--altura-cookie, 0px))" }}
        className="fixed right-5 z-50 w-14 h-14 rounded-full bg-whats text-white shadow-lg shadow-black/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <IconeWhats className="w-7 h-7" />
      </a>
    </>
  );
}
