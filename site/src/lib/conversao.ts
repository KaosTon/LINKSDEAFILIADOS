import { recusouMedicao } from "@/lib/medicao";

// Conversao para a Meta (16/11). Quem veio de anuncio e clica em "Entrar no grupo" vira um evento Lead
// mandado pelo servidor (encurtador -> fluxo 07 do n8n), sem cookie: so o codigo do clique no anuncio
// (fbclid, que a propria Meta poe no link) e o id deste clique, o mesmo que o pixel usa quando a pessoa
// aceitou os cookies, para a Meta nao contar duas vezes. Quem escolheu "Apenas essenciais" nao manda nada.

const CHAVE = "td-fbclid";

/** Guarda o fbclid do link do anuncio (e a hora) enquanto a pessoa navega no site. */
export function guardarCliqueDoAnuncio(): void {
  try {
    const f = new URLSearchParams(window.location.search).get("fbclid");
    if (f && /^[A-Za-z0-9_-]{10,500}$/.test(f)) sessionStorage.setItem(CHAVE, JSON.stringify({ f, t: Date.now() }));
  } catch {
    /* sem sessionStorage, segue sem */
  }
}

function cookie(nome: string): string {
  const m = document.cookie.match(new RegExp("(?:^|; )" + nome + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : "";
}

/** fbc: o cookie do pixel (quando aceitou) ou montado do fbclid guardado, no formato da Meta. */
export function fbcAtual(): string {
  const c = cookie("_fbc");
  if (/^fb\.1\.\d{10,13}\./.test(c)) return c;
  try {
    const x = JSON.parse(sessionStorage.getItem(CHAVE) || "null");
    if (x && x.f && x.t) return `fb.1.${x.t}.${x.f}`;
  } catch {
    /* segue sem */
  }
  return "";
}

export function novoIdDoClique(): string {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 14)).slice(0, 24);
}

/**
 * O link do grupo com o id do clique (ev) e o codigo do anuncio (fbc, fbp), so para quem veio de
 * anuncio (fbc) ou esta na pagina do anuncio (de=anuncio...). Nos outros casos, o link como veio.
 */
export function linkComConversao(href: string, ev: string): string {
  if (recusouMedicao()) return href;
  let u: URL;
  try { u = new URL(href, window.location.href); } catch { return href; }
  if (!/\/grupo$/.test(u.pathname)) return href;
  const de = u.searchParams.get("de") || "";
  const fbc = fbcAtual();
  if (!fbc && !de.startsWith("anuncio")) return href;
  u.searchParams.set("ev", ev);
  if (fbc) u.searchParams.set("fbc", fbc);
  const fbp = cookie("_fbp");
  if (/^fb\.1\.\d{10,13}\.\d{5,25}$/.test(fbp)) u.searchParams.set("fbp", fbp);
  return u.toString();
}
