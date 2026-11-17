// Pagina de entrada dos anuncios (/entrar), criada em 09/11/2026.
//
// Anuncio da Meta nao aponta direto para o convite do WhatsApp: vai para esta pagina, curta, com
// um botao so. O anuncio manda ?c=codigo-do-criativo e o botao leva essa origem ao encurtador
// (?de=anuncio:codigo), que conta os cliques de verdade por criativo (resumo das 22h).
// Fora do Google e do sitemap. Sem promessa, sem urgencia (QUALIDADE §1). Preco so nos cards de prova,
// sempre com o dia do post (15/11).

// 17/11: de cada 100 pessoas que tocavam no anuncio, umas 5 tocavam em "Entrar". A primeira tela era
// so texto, com o botao no meio da tela e o menu do site em cima. Agora: a frase do anuncio no titulo,
// o botao logo abaixo, as ofertas reais em seguida, sem menu nem botao flutuante, e uma barra com o
// botao quando a pessoa rola a pagina.
export const ENTRAR = {
  eyebrow: "Grupo de ofertas no WhatsApp",
  h1: "Preço de antes, preço de agora",
  h1Destaque: "e cupom, no seu WhatsApp",
  lead: "Promoções da Amazon, do Mercado Livre, da Shopee e da Magalu com o preço conferido na loja antes de postar. Você toca no link e compra direto na loja.",
  pontos: [
    "Grátis, sem cadastro",
    "Só os administradores postam",
    "Saia quando quiser, com um toque",
  ],
  botao: "Entrar no grupo grátis",
  /** embaixo do botao: o que acontece depois do toque (o WhatsApp abre e pede mais um toque para entrar) */
  depoisDoBotao: "Abre o WhatsApp. Lá, toque em entrar e pronto.",
  rodapeBotao: "Abre o WhatsApp. Não mandamos mensagem no privado.",
  comoE: {
    titulo: "O que chega para você",
    itens: [
      { titulo: "Uma oferta por vez", desc: "Foto do produto, preço conferido na loja, frete e cupom quando houver." },
      { titulo: "Link da loja oficial", desc: "O link abre a página do produto na própria loja. A compra é com ela." },
      { titulo: "Das 8h à meia-noite", desc: "Se preferir, silencie o grupo e abra só quando for comprar alguma coisa." },
    ],
  },
  /**
   * Prova (15/11): ofertas reais que sairam no grupo, com a data do post (preco de oferta muda; o card
   * diz o dia). Foto em cena feita por IA e conferida contra a foto da loja. Nunca Amazon (regra: sem
   * preco da Amazon no site). Para trocar: card novo em public/entrar/ e a linha aqui.
   */
  provas: {
    titulo: "Ofertas que já passaram no grupo",
    nota: "Preço de oferta muda rápido: cada card mostra o dia em que a oferta foi postada.",
    itens: [
      { img: "/entrar/oferta-tv.webp", alt: "Smart TV LG 65 polegadas por R$ 3.261 no Pix, oferta postada no grupo em 15/11" },
      { img: "/entrar/oferta-perfume.webp", alt: "Perfume Quasar Blue 100 ml de R$ 189 por R$ 76 no Pix, oferta postada no grupo em 14/11" },
      { img: "/entrar/oferta-lavadora.webp", alt: "Máquina de lavar Electrolux 13 kg por R$ 1.499, oferta postada no grupo em 15/11" },
      { img: "/entrar/oferta-furadeira.webp", alt: "Parafusadeira 48V com 2 baterias por R$ 83 no Pix, oferta postada no grupo em 14/11" },
      { img: "/entrar/oferta-arvore.webp", alt: "Árvore de Natal 1,80 m por R$ 134 à vista, oferta postada no grupo em 14/11" },
    ],
  },
  /** perguntas da home que tiram a duvida de quem veio do anuncio (indices de FAQ em site.ts) */
  faq: [0, 1, 4],
};
