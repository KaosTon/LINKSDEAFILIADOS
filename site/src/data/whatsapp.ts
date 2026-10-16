// Origem de cada botao "Entrar no grupo", num lugar so (METODO §6 do fabrica-sites).
//
// No site-modelo, cada botao abre uma conversa com uma frase que diz de onde a pessoa veio.
// Aqui o botao abre o GRUPO (linkWhats em site.ts leva ao temdescontos.com.br/grupo), e o
// texto abaixo vai como ?de=, que o encurtador conta antes de mandar para o convite. Assim se
// sabe qual pagina ou post trouxe gente para o grupo. Formato curto: letras, numeros, "-", ":".
//
// Trava: scripts/check-whatsapp.mjs. Barra o build se um post, um guia ou uma rota ficar sem
// origem aqui, se sobrar origem de pagina que nao existe, ou se algum componente escrever a
// origem solta em linkWhats("...").

import { linkWhats } from "./site";

export const MENSAGEM_PADRAO = "site";

/** paginas fixas: a chave e a rota */
export const MENSAGENS_ROTA: Record<string, string> = {
  "/": "home",
  "/sobre": "sobre",
  "/blog": "blog",
  "/links": "links",
  "/politica-de-privacidade": "privacidade",
  "/oferta-encerrada": "oferta-encerrada",
};

/** /guias/{slug}: um por guia (paginas-servico.ts) */
export const MENSAGENS_SERVICO: Record<string, string> = {
  "como-saber-se-a-promocao-e-verdadeira": "guia:promocao-verdadeira",
  "grupo-de-ofertas-no-whatsapp-e-seguro": "guia:grupo-seguro",
  "cupom-da-amazon-como-usar": "guia:cupom-amazon",
};

/** /blog/{slug}: um por post (blog.ts) */
export const MENSAGENS_POST: Record<string, string> = {
};

/** botoes com assunto proprio dentro de uma pagina */
export const MENSAGENS_CTA = {
  heroHome: "home:topo",
  fimHome: "home:fim",
  naoEncontrada: "nao-encontrada",
};

/** origem certa pra qualquer rota do site; cai na padrao se a rota nao tiver uma propria */
export function mensagemDaRota(pathname: string | null): string {
  const rota = (pathname || "/").replace(/\/$/, "") || "/";
  if (MENSAGENS_ROTA[rota]) return MENSAGENS_ROTA[rota];
  const [, secao, slug] = rota.split("/");
  if (secao === "guias" && MENSAGENS_SERVICO[slug]) return MENSAGENS_SERVICO[slug];
  if (secao === "blog" && MENSAGENS_POST[slug]) return MENSAGENS_POST[slug];
  return MENSAGEM_PADRAO;
}

export function whatsDaRota(pathname: string | null): string {
  return linkWhats(mensagemDaRota(pathname));
}
