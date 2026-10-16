"use client";

import { usePathname } from "next/navigation";
import { IconeWhats } from "@/components/Icones";
import { TEXTOS } from "@/data/site";
import { whatsDaRota } from "@/data/whatsapp";

// Botao "Agendar" do topo. Client so pra saber a pagina atual e abrir a conversa com a
// mensagem dela ("Vim pela página de ..."), em vez da frase generica em todo o site.
export default function WhatsTopo() {
  const pathname = usePathname();
  return (
    <a
      href={whatsDaRota(pathname)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 botao-marca text-sm font-semibold px-4 py-2.5"
    >
      <IconeWhats className="w-4 h-4" />
      <span className="hidden sm:inline">{TEXTOS.agendar}</span>
      <span className="sm:hidden">{TEXTOS.agendarCurto}</span>
    </a>
  );
}
