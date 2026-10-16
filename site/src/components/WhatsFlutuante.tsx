"use client";

import { usePathname } from "next/navigation";
import { IconeWhats } from "@/components/Icones";
import { SITE } from "@/data/site";
import { whatsDaRota } from "@/data/whatsapp";
import { registrarCliqueWhats } from "@/lib/medicao";

// Botao flutuante de WhatsApp, com a mensagem da pagina em que a pessoa esta.
// Sobe junto com o aviso de cookies enquanto ele estiver na tela: o aviso publica a propria
// altura em --altura-cookie (sem aviso, a variavel nao existe e o botao volta pro lugar).
export default function WhatsFlutuante() {
  const pathname = usePathname();
  return (
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
  );
}
