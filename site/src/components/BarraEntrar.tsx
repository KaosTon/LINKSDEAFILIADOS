"use client";

import { useEffect, useState } from "react";
import BotaoEntrar from "@/components/BotaoEntrar";

// Barra fixa da pagina /entrar (17/11): quando o botao principal sai da tela, o botao fica no rodape.
// Sobe junto com o aviso de cookies (--altura-cookie), como o botao flutuante nas outras paginas.
export default function BarraEntrar({ alvo, texto }: { alvo: string; texto: string }) {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    const el = document.getElementById(alvo);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => setMostrar(!e.isIntersecting && e.boundingClientRect.top < 0));
    obs.observe(el);
    return () => obs.disconnect();
  }, [alvo]);

  return (
    <div
      aria-hidden={!mostrar}
      style={{ bottom: "var(--altura-cookie, 0px)" }}
      className={`fixed inset-x-0 z-30 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-white/95 backdrop-blur border-t border-linha shadow-[0_-8px_24px_rgba(0,0,0,0.08)] transition-transform duration-200 sm:hidden ${mostrar ? "translate-y-0" : "translate-y-[150%] pointer-events-none"}`}
    >
      <BotaoEntrar texto={texto} className="w-full inline-flex items-center justify-center gap-2 botao-marca font-semibold text-lg px-6 py-3.5" />
    </div>
  );
}
