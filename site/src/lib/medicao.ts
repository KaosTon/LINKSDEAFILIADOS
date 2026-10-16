import { track } from "@vercel/analytics";

// Escolha do aviso de cookies, guardada no navegador. "declined" = so o essencial, sem medicao.
export const CHAVE_COOKIES = "mf_cookies";

// Token do Web Analytics do Cloudflare (painel do Cloudflare > Web Analytics). Com ele, o site
// mede pelo Cloudflare (components/Medicao.tsx).
export const MEDICAO_CLOUDFLARE = process.env.NEXT_PUBLIC_CF_BEACON || "";

/** Vercel so quando pedida (NEXT_PUBLIC_MEDICAO=vercel) e sem token do Cloudflare. */
export const MEDICAO_VERCEL = !MEDICAO_CLOUDFLARE && process.env.NEXT_PUBLIC_MEDICAO === "vercel";

export function recusouMedicao(): boolean {
  try {
    return localStorage.getItem(CHAVE_COOKIES) === "declined";
  } catch {
    // navegador que bloqueia localStorage: sem escolha registrada, mede
    return false;
  }
}

/**
 * Registra o clique num botao de WhatsApp (Vercel Analytics, evento "whatsapp_click").
 * Junto com as visitas por pagina, responde a pergunta que interessa (METODO §6): qual
 * pagina gera contato. Quem recusou medicao no aviso nao e registrado (beforeSend em
 * components/Medicao.tsx). Nunca atrapalha o clique: erro aqui e engolido.
 *
 * No Cloudflare este evento NAO e registrado: o Web Analytics de la conta visita por pagina,
 * mas nao aceita evento proprio. Pra voltar a contar clique la, precisa de outra ferramenta
 * (decisao em aberto, ver CLAUDE.md).
 */
export function registrarCliqueWhats(origem: string) {
  if (typeof window === "undefined" || !MEDICAO_VERCEL) return;
  try {
    track("whatsapp_click", { origem });
  } catch {
    // a medicao nunca pode impedir a conversa
  }
}
