import { track } from "@vercel/analytics";

// Escolha do aviso de cookies, guardada no navegador. "declined" = so o essencial, sem medicao.
export const CHAVE_COOKIES = "mf_cookies";

// Token do Web Analytics do Cloudflare (painel do Cloudflare > Web Analytics). Com ele, o site
// mede pelo Cloudflare (components/Medicao.tsx).
export const MEDICAO_CLOUDFLARE = process.env.NEXT_PUBLIC_CF_BEACON || "";

/** Vercel so quando pedida (NEXT_PUBLIC_MEDICAO=vercel) e sem token do Cloudflare. */
export const MEDICAO_VERCEL = !MEDICAO_CLOUDFLARE && process.env.NEXT_PUBLIC_MEDICAO === "vercel";

// Pixel da Meta (14/11/2026): "Tem Descontos - site", criado na conta de anuncios da Tem Descontos.
// NAO e o pixel da Virtus, que a mesma conta tambem enxerga. O id e publico (vai no HTML de qualquer site).
// Ele usa cookie, entao so carrega com "Aceitar" explicito no aviso (components/PixelMeta.tsx).
export const PIXEL_META = "1724280369336369";

// Avisa os componentes de medicao quando a pessoa escolhe no aviso, para valer na hora.
export const EVENTO_COOKIES = "td-cookies";

export function aceitouMedicao(): boolean {
  try {
    return localStorage.getItem(CHAVE_COOKIES) === "accepted";
  } catch {
    return false;
  }
}

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
