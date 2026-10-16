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
];

const MAPA = new Map<string, string>();
for (const d of DESTINOS) for (const t of d.tags) MAPA.set(t.toLowerCase(), d.href);

export function destinoDaTag(tag: string): string | undefined {
  return MAPA.get(tag.toLowerCase());
}
