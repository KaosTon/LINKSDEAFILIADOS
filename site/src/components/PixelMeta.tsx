"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { EVENTO_COOKIES, PIXEL_META, aceitouMedicao } from "@/lib/medicao";

// Pixel da Meta (14/11/2026), para os anuncios otimizarem por quem clica no convite do grupo.
// So carrega depois do "Aceitar" no aviso de cookies: o pixel grava cookie (_fbp), e a LGPD pede
// consentimento. Quem escolhe "Apenas essenciais" ou nao escolhe nada nao manda nada para a Meta.
//
// Eventos: PageView em cada pagina; Lead no clique em qualquer botao do grupo (/grupo?de=...),
// com a origem do botao em content_name. Um listener so, por delegacao, como em WhatsCliques.
type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[][]; loaded?: boolean; version?: string; push?: unknown };
declare global {
  interface Window { fbq?: Fbq; _fbq?: Fbq }
}

function carregar(): boolean {
  if (!PIXEL_META || !aceitouMedicao()) return false;
  if (window.fbq) return true;
  const f = function (...args: unknown[]) {
    if (f.callMethod) f.callMethod(...args);
    else f.queue!.push(args);
  } as Fbq;
  f.push = f;
  f.loaded = true;
  f.version = "2.0";
  f.queue = [];
  window.fbq = f;
  window._fbq = f;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  f("init", PIXEL_META);
  return true;
}

export default function PixelMeta() {
  const pathname = usePathname();

  useEffect(() => {
    if (carregar()) window.fbq?.("track", "PageView");
    const aoEscolher = () => { if (carregar()) window.fbq?.("track", "PageView"); };
    window.addEventListener(EVENTO_COOKIES, aoEscolher);
    return () => window.removeEventListener(EVENTO_COOKIES, aoEscolher);
  }, [pathname]);

  useEffect(() => {
    function aoClicar(e: MouseEvent) {
      if (!window.fbq || !aceitouMedicao()) return;
      const link = (e.target as HTMLElement | null)?.closest?.("a") as HTMLAnchorElement | null;
      const href = link?.getAttribute("href") || "";
      if (!/\/grupo(\?|$)/.test(href)) return;
      let de = "";
      try { de = new URL(href, location.href).searchParams.get("de") || ""; } catch { de = ""; }
      try { window.fbq("track", "Lead", { content_name: de || "site" }); } catch { /* a medicao nunca atrapalha o clique */ }
    }
    document.addEventListener("click", aoClicar, { capture: true });
    return () => document.removeEventListener("click", aoClicar, { capture: true });
  }, []);

  return null;
}
