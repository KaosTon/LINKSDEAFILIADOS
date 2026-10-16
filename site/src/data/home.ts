// Texto das secoes da home, na ordem em que aparecem. O desenho fica em src/app/page.tsx; o que
// a secao DIZ fica aqui. Numeros so do dado (site.ts, paginas-servico.ts) ou do robo, com data.

export const HOME = {
  hero: {
    eyebrow: "Grupo de ofertas no WhatsApp",
    h1: "Oferta boa, conferida",
    h1Destaque: "antes de chegar em você",
    lead: "Achamos as promoções da Amazon, do Mercado Livre, da Shopee e da Magalu, conferimos o preço na loja e mandamos no grupo só o que passou. Você clica e compra direto na loja.",
    ctaSecundario: { label: "Como conferimos", href: "/guias/como-saber-se-a-promocao-e-verdadeira" },
  },
  /** cartao do lado do h1: as conferencias de verdade (lib/ofertas.mjs, 16/10/2026) */
  ficha: {
    titulo: "Antes de postar, o robô confere",
    itens: [
      "O preço na página da loja",
      "Se o produto é o mesmo do anúncio",
      "Se o kit tem a mesma quantidade",
      "Se o preço riscado faz sentido",
      "Se o cupom vale para todo mundo",
    ],
    rodape: "Oferta que falha, não sai.",
  },
  /** faixa escura de numeros. Cada valor sai do dado ou do robo. */
  numeros: [
    { valor: "lojas", rotulo: "lojas grandes" },
    { valor: "conferencias", rotulo: "conferências por oferta" },
    { valor: "8h-22h", rotulo: "todos os dias" },
    { valor: "R$ 0", rotulo: "para entrar e ficar" },
  ] as { valor: "lojas" | "conferencias" | string; rotulo: string }[],
  passos: {
    eyebrow: "Como funciona",
    titulo: "Do convite à compra, sem intermediário",
    itens: [
      { titulo: "Entre pelo convite", desc: "Um toque no botão e você está no grupo. Sem cadastro e sem custo." },
      { titulo: "Receba a oferta", desc: "Foto, preço conferido, frete e cupom quando houver, uma oferta por vez." },
      { titulo: "Abra na loja oficial", desc: "O link leva para a página do produto na própria loja." },
      { titulo: "Compre lá", desc: "Pagamento, entrega e troca são com a loja, com as regras e a garantia dela." },
    ],
  },
  guias: {
    eyebrow: "Guias",
    titulo: "Para comprar sem cair em promoção de mentira",
    lead: "O que aprendemos conferindo oferta todo dia, explicado para você repetir em qualquer loja.",
  },
  faq: { eyebrow: "Dúvidas frequentes", titulo: "Antes de entrar" },
  cta: {
    titulo: "Entre no grupo e deixe a gente garimpar",
    texto: "As ofertas saem das 8h às 22h. Silencie se quiser e abra quando for comprar alguma coisa.",
  },
};
