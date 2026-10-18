// Tag com dono no site vira link pro dono do assunto (o guia ou o post que responde aquela
// busca). Tag sem dono vira so rotulo. Nao existe pagina de tag, de proposito (Virtus, 21/09/2026).
//
// Ao criar post que vira DONO de uma busca (DOCS/BLOG.md §3), acrescente as tags dele aqui.
// A trava de links (check-links-internos) confere todo destino (href) deste arquivo.

type Destino = { tags: string[]; href: string };

const DESTINOS: Destino[] = [
  { href: "/guias/como-saber-se-a-promocao-e-verdadeira", tags: ["promoção falsa", "preço riscado", "desconto de mentira"] },
  { href: "/guias/grupo-de-ofertas-no-whatsapp-e-seguro", tags: ["golpe no whatsapp", "link falso", "grupo de ofertas"] },
  { href: "/guias/cupom-da-amazon-como-usar", tags: ["cupom amazon", "cupom de desconto"] },
  { href: "/blog/black-friday-2026-quando-e", tags: ["black friday 2026", "quando é a black friday", "como se preparar para a black friday"] },
  { href: "/blog/direito-de-arrependimento-compra-online", tags: ["direito de arrependimento", "devolver compra online", "prazo de 7 dias para devolução", "frete de devolução quem paga"] },
  { href: "/blog/produto-com-defeito-comprado-online", tags: ["produto com defeito comprado online", "prazo para reclamar de defeito", "garantia legal", "garantia legal e contratual"] },
  { href: "/blog/taxa-de-importacao-compra-internacional", tags: ["taxa de importação", "taxa das blusinhas 2026", "remessa conforme", "icms compra internacional"] },
  { href: "/blog/pix-ou-cartao-compra-online", tags: ["pix ou cartão", "pix é seguro para compra online", "med pix", "desconto no pix vale a pena", "estorno pix"] },
  { href: "/blog/como-saber-se-loja-da-shopee-e-confiavel", tags: ["loja da shopee é confiável", "garantia shopee", "loja oficial shopee", "vendedor indicado shopee"] },
  { href: "/blog/cupom-shopee-e-mercado-livre-como-usar", tags: ["cupom shopee", "cupom mercado livre", "cupom indisponível", "moedas shopee", "cupom primeira compra"] },
  { href: "/blog/compra-garantida-mercado-livre", tags: ["compra garantida mercado livre", "como pedir reembolso no mercado livre", "mediação mercado livre"] },
  { href: "/blog/garantia-de-a-a-z-amazon", tags: ["garantia de a a z amazon", "como acionar garantia amazon", "reembolso amazon vendedor parceiro"] },
  { href: "/blog/link-de-afiliado-o-preco-muda", tags: ["link de afiliado", "link de afiliado muda o preço", "como funciona link de afiliado"] },
];

const MAPA = new Map<string, string>();
for (const d of DESTINOS) for (const t of d.tags) MAPA.set(t.toLowerCase(), d.href);

export function destinoDaTag(tag: string): string | undefined {
  return MAPA.get(tag.toLowerCase());
}
