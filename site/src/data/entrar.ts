// Pagina de entrada dos anuncios (/entrar), criada em 09/11/2026.
//
// Anuncio da Meta nao aponta direto para o convite do WhatsApp: vai para esta pagina, curta, com
// um botao so. O anuncio manda ?c=codigo-do-criativo e o botao leva essa origem ao encurtador
// (?de=anuncio:codigo), que conta os cliques de verdade por criativo (resumo das 22h).
// Fora do Google e do sitemap. Sem preco, sem promessa, sem urgencia (QUALIDADE §1).

export const ENTRAR = {
  eyebrow: "Grupo de ofertas no WhatsApp",
  h1: "Ofertas e cupons",
  h1Destaque: "todo dia no seu WhatsApp",
  lead: "Promoções da Amazon, do Mercado Livre, da Shopee e da Magalu com o preço conferido na loja antes de postar. Você toca no link e compra direto na loja.",
  pontos: [
    "Grátis, sem cadastro",
    "Só os administradores postam",
    "Saia quando quiser, com um toque",
  ],
  botao: "Entrar no grupo grátis",
  rodapeBotao: "Abre o WhatsApp. Não mandamos mensagem no privado.",
  comoE: {
    titulo: "O que chega para você",
    itens: [
      { titulo: "Uma oferta por vez", desc: "Foto do produto, preço conferido na loja, frete e cupom quando houver." },
      { titulo: "Link da loja oficial", desc: "O link abre a página do produto na própria loja. A compra é com ela." },
      { titulo: "Das 8h às 22h", desc: "Se preferir, silencie o grupo e abra só quando for comprar alguma coisa." },
    ],
  },
  /** perguntas da home que tiram a duvida de quem veio do anuncio (indices de FAQ em site.ts) */
  faq: [0, 1, 4],
};
