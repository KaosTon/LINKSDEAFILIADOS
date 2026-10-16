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

(Nenhum post publicado ainda. Donos de busca hoje, que os posts nao devem disputar:
`/guias/como-saber-se-a-promocao-e-verdadeira` (promoção falsa, preço riscado, "De" inflado),
`/guias/grupo-de-ofertas-no-whatsapp-e-seguro` (golpe, link falso, segurança do grupo) e
`/guias/cupom-da-amazon-como-usar` (tipos de cupom da Amazon).)
