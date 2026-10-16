"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { registrarCliqueWhats } from "@/lib/medicao";

// Registra TODO clique em link de WhatsApp, inclusive os de Server Components (que nao podem
// ter onClick): um listener so, no layout, por delegacao. Caso real na Virtus (26/08/2026):
// 38 botoes em 25 paginas nao mediam nada porque cada um dependia de lembrar do onClick.
//
// Anti-duplicacao: botao que ja registra sozinho (o flutuante) vem com data-wa-medido="1".
export default function WhatsCliques() {
  const pathname = usePathname();

  useEffect(() => {
    function aoClicar(e: MouseEvent) {
      const link = (e.target as HTMLElement | null)?.closest?.("a") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (!href.includes("wa.me")) return;
      if (link.dataset.waMedido === "1") return;
      registrarCliqueWhats(`pagina:${pathname || "/"}`);
    }
    document.addEventListener("click", aoClicar, { capture: true });
    return () => document.removeEventListener("click", aoClicar, { capture: true });
  }, [pathname]);

  return null;
}
