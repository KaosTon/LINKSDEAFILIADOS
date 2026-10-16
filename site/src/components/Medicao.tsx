"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MEDICAO_CLOUDFLARE, MEDICAO_VERCEL, recusouMedicao } from "@/lib/medicao";

// Visitas, respeitando o aviso de cookies: quem clica em "Apenas essenciais" nao e medido.
// Mesmo desenho da Virtus (la, ate 15/09/2026, o aviso prometia e o codigo nao cumpria).
//
// A casa e escolhida por variavel de ambiente do build:
// - Cloudflare Pages (padrao da fabrica): NEXT_PUBLIC_CF_BEACON = token do Web Analytics do
//   Cloudflare. Carrega o beacon, que nao usa cookie. So carrega se a pessoa nao recusou; se ela
//   recusar no meio da visita, a proxima pagina aberta ja vem sem medicao.
// - Vercel: NEXT_PUBLIC_MEDICAO=vercel. Web Analytics + Speed Insights da Vercel; o beforeSend
//   roda a cada envio, entao a escolha vale na hora e cobre tambem o clique no WhatsApp.
// - Nenhuma das duas: nao carrega nada (fora da Vercel, os scripts dela dao 404 no console).
export default function Medicao() {
  useEffect(() => {
    if (!MEDICAO_CLOUDFLARE || recusouMedicao()) return;
    if (document.querySelector("script[data-cf-beacon]")) return;
    const s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token: MEDICAO_CLOUDFLARE, spa: true }));
    document.body.appendChild(s);
  }, []);

  if (!MEDICAO_VERCEL) return null;
  return (
    <>
      <SpeedInsights beforeSend={(evento) => (recusouMedicao() ? null : evento)} />
      <Analytics beforeSend={(evento) => (recusouMedicao() ? null : evento)} />
    </>
  );
}
