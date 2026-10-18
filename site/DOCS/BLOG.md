# Blog: protocolo e índice

O método completo está no `METODO.md` do fabrica-sites (§3). Aqui fica o que é específico deste
site e o índice que as travas conferem.

## 1. Antes de escrever

1. Rode `npm run check:indice -- --tema "palavra chave"` para ver se algum post ou página já
   responde essa busca. Se já existe dono, reforce o dono em vez de criar outro (§3 abaixo).
2. Pesquisa com fonte. Número, estatística e norma só com fonte e ano, conferidos na fonte
   original (não em blog que cita a fonte). O que não confirmar: "varia", ou fica de fora.
3. Regras do segmento (preço, antes e depois, promessa): BRIEFING.md §4 e `SEGMENTOS.md` do
   fabrica-sites.

## 2. Como o post entra

- Dado em `src/data/blog.ts`. Corpo em HTML, começa em `<h2>`, tabela com dado real quando
  houver. Markdown trava o build (`scripts/check-markdown.mjs`).
- `resumoRapido` (2 a 4 tópicos, resposta direta), FAQ de 3 a 5 itens, fontes com link.
- `servico`: a página de serviço dona do assunto. Ela lista o post (link de entrada) e o post
  aponta pra ela (link de saída). No corpo, pelo menos dois links internos.
- Mensagem de WhatsApp própria, citando o post, em `MENSAGENS_POST` no `src/data/whatsapp.ts`
  (a trava `check-whatsapp` barra post sem mensagem).
- `revisadoEm` só depois que o autor revisar. Até lá a tela mostra "revisão pendente".
- `tags`: as buscas de que o post trata. Se o post é DONO de alguma busca, acrescente a tag em
  `src/data/tag-destinos.ts` apontando pra ele. Não existe página de tag.
- `imagem`: capa 1200x675 em `public/blog/{slug}.webp`, própria e casada com o tema. Nunca
  repetir fundo entre posts.
- `dataRevisao` (AAAA-MM-DD) quando o conteúdo mudar: vira `dateModified`.
- Registrar no índice abaixo (trava `scripts/check-indice-blog.mjs`).

## 3. Índice anti-canibalização

Um item por post publicado, na ordem de publicação: o slug, de que buscas ele é dono e com o que
ele NÃO deve ser confundido. As páginas de serviço também são donas de busca: o post não
disputa com elas.

1. `black-friday-2026-quando-e`: dono de "black friday 2026", "quando é a black friday", "como se preparar para a black friday". Não confundir com /guias/como-saber-se-a-promocao-e-verdadeira (o guia é dono de "De" inflado e promoção falsa; o post só resume em 1 frase e linka) nem com /guias/grupo-de-ofertas-no-whatsapp-e-seguro (golpe em grupo; o post só lista sinais de site falso da Senacon/Procon-SP e linka).
2. `direito-de-arrependimento-compra-online`: dono de "direito de arrependimento", "devolver compra online", "prazo de 7 dias para devolução", "frete de devolução quem paga". Não confundir com /guias/grupo-de-ofertas-no-whatsapp-e-seguro (o guia é dono de golpe e segurança do grupo; o post só cita em 1 parágrafo e linka) nem com /blog/produto-com-defeito-comprado-online (defeito tem prazo de 30/90 dias, outro assunto).
3. `produto-com-defeito-comprado-online`: dono de "produto com defeito comprado online", "prazo para reclamar de defeito", "garantia legal", "garantia legal e contratual". Não confundir com /guias/grupo-de-ofertas-no-whatsapp-e-seguro (segurança do grupo, só citado no fim) nem com /blog/direito-de-arrependimento-compra-online (7 dias sem motivo; aqui é defeito, 30/90 dias).
4. `taxa-de-importacao-compra-internacional`: dono de "taxa de importação", "taxa das blusinhas 2026", "remessa conforme", "icms compra internacional". Não confundir com /guias/como-saber-se-a-promocao-e-verdadeira (o guia trata de preço falso e "De" inflado; aqui o assunto é imposto no checkout, o guia só é linkado na dica de olhar o total).
5. `pix-ou-cartao-compra-online`: dono de "pix ou cartão", "pix é seguro para compra online", "med pix", "desconto no pix vale a pena", "estorno pix". Não confundir com /guias/grupo-de-ofertas-no-whatsapp-e-seguro (o guia é dono de golpe e link falso; aqui o golpe de Pix em link falso tem 1 parágrafo e linka o guia).
6. `como-saber-se-loja-da-shopee-e-confiavel`: dono de "loja da shopee é confiável", "garantia shopee", "loja oficial shopee", "vendedor indicado shopee". Não confundir com /guias/grupo-de-ofertas-no-whatsapp-e-seguro (o guia trata de golpe e link falso no grupo; aqui é a reputação da loja dentro da Shopee, e o golpe de link só aparece em 1 frase com link para o guia).
7. `cupom-shopee-e-mercado-livre-como-usar`: dono de "cupom shopee", "cupom mercado livre", "cupom indisponível", "moedas shopee", "cupom primeira compra". Não confundir com /guias/cupom-da-amazon-como-usar (o guia é só Amazon; aqui Amazon aparece em 1 frase com link).
8. `compra-garantida-mercado-livre`: dono de "compra garantida mercado livre", "como pedir reembolso no mercado livre", "mediação mercado livre". Não confundir com /guias/grupo-de-ofertas-no-whatsapp-e-seguro (o guia trata do golpe e da segurança do grupo; aqui o assunto é o programa de proteção do Mercado Livre e o passo a passo da reclamação, e o golpe fora da plataforma aparece em 1 parágrafo com link para o guia).
9. `garantia-de-a-a-z-amazon`: dono de "garantia de a a z amazon", "como acionar garantia amazon", "reembolso amazon vendedor parceiro". Não confundir com /guias/cupom-da-amazon-como-usar (o guia trata de cupom e desconto; aqui é proteção pós-compra) nem com /guias/grupo-de-ofertas-no-whatsapp-e-seguro (golpe fora da Amazon só em 1 parágrafo com link).
10. `link-de-afiliado-o-preco-muda`: dono de "link de afiliado", "link de afiliado muda o preço", "como funciona link de afiliado". Não confundir com /guias/grupo-de-ofertas-no-whatsapp-e-seguro (o guia é dono de golpe e link falso; aqui o assunto é como funciona a comissão e a transparência, e o golpe aparece em 1 frase com link).

Donos de busca que os posts não disputam: `/guias/como-saber-se-a-promocao-e-verdadeira` (promoção falsa, preço riscado, "De" inflado), `/guias/grupo-de-ofertas-no-whatsapp-e-seguro` (golpe, link falso, segurança do grupo) e `/guias/cupom-da-amazon-como-usar` (tipos de cupom da Amazon).
