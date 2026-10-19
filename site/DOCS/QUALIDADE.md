# Padrão de qualidade do site do Tem Descontos

Lido ANTES de qualquer página, post ou ajuste no site. Junta três fontes, nesta ordem de força:
1. **As regras do Tem Descontos** (§1): decisões do Wellington para este site.
2. **O padrão da Virtus** (§2): o site que mais converte e ranqueia do Wellington
   (`projeto-virtus-site`, `DOCS/PROTOCOLO_BLOG.md`). É a régua de "ficou bom".
3. **O método da Fábrica de Sites** (§3): `fabrica-sites/metodo/METODO.md`, com os números medidos.

Se uma regra daqui brigar com o método da fábrica, vale esta página e a briga vira PR na fábrica.
Criado em 18/10/2026, a pedido do Wellington: "para nunca esquecer da qualidade que deve seguir".

## 1. Regras do Tem Descontos (não mudam sem o Wellington)

- **Sem "robô" no site.** O texto fala da conferência ("conferimos o preço na loja", "nossas regras
  de conferência"), não da automação. Motivo: "robô" soa como disparo em massa e dá a concorrente
  o argumento para denunciar o número (a Z-API não é a API oficial do WhatsApp). Também nunca o
  contrário: não escrever que uma pessoa confere cada oferta à mão. Trava: `scripts/check-robo.mjs`.
- **Preço de produto da Amazon nunca no site** (política do Programa de Associados). Falar de como
  conferir, nunca "custa R$ X".
- **Nada de promessa:** sem "menor preço garantido", sem urgência que a loja não disse.
- **Link de afiliado às claras:** o aviso do rodapé fica; "#publi" só nas redes sociais.
- **Autor:** Wellington Santos, com os dados do site da Virtus (`src/data/site.ts`, `AUTOR`).
  Nada além disso sobre ele sem ele confirmar.
- **Divulgar sempre `temdescontos.com.br/grupo`**, nunca o convite direto do WhatsApp.
- **Sem travessão** (o traço longo) em nada (trava `check-copy`).

## 2. O padrão da Virtus (o que faz o post "ficar bom")

**Texto**
- Abre com um parágrafo de gancho na voz do Wellington e a **resposta em negrito** antes do
  primeiro `<h2>`. Ex. da Virtus: "A pergunta que mais chega aqui depois de uma batida não é
  qual seguradora é melhor, é quanto tempo vai demorar."
- Tom consultivo, do lado do cliente, sem jargão sem explicar. Escrito para quem compra, nunca
  para colegas.
- **Lei citada entre aspas, com o artigo**, e explicada logo depois ("Leia de novo a parte em
  destaque..."). Uma "observação honesta" quando a regra tem limite.
- Heading em pergunta e resposta objetiva no primeiro parágrafo da seção (answer-first: IA cita).
- **Dado próprio obrigatório** em todo post (o Google premia quem origina dado): aqui, as regras
  reais de conferência (nota 4,5 e 50 vendas na Shopee, preço conferido na loja, etc.).

**Fonte e vigência (os erros que a Virtus já pagou)**
- Nenhum número, prazo, lei ou estatística sem fonte e ano, **conferido na fonte original**.
- **Vigência de norma a cada citação:** lei no Planalto em "texto compilado"; resolução no
  cadastro do órgão. A Virtus citou por 8 meses um artigo revogado.
- **Nome, regra e preço de terceiro conferidos na página dele** antes de publicar. A Virtus já
  publicou tabela com produtos que não existiam.
- **Nota de reputação** (Reclame Aqui etc.) só com a data da apuração ao lado.
- O que não confirmar: "varia", ou fica de fora, e anota NÃO CONFIRMEI nas fontes do post.

**Estrutura**
- `metaTitle` até 60 caracteres, palavra-chave na esquerda, número quando der; `metaDescription`
  de 140 a 160 com o dado na frente; sem frase repetida entre páginas.
- Tabela com dado real (é o formato que mais ganha clique, medido na Virtus).
- FAQ de 3 a 5, resposta na primeira frase.
- **Gate de profundidade medido:** alvo = mediana dos 3 melhores do tema; piso 600 (800 em guia).
  Engordar só com substância. A Virtus já soltou lote "premium" de 485 palavras sem medir.
- Pelo menos 2 links de saída para os guias e **pelo menos 1 link de entrada** de página que já
  existe (o post mais caro da Virtus nasceu órfão).
- Página do autor (`/autor/wellington-santos`) com schema `Person`; selo "revisado por" só com a
  revisão real do Wellington (`revisadoEm`).

**Imagem**
- Imagem própria por post, 1200x675, WebP, nunca repetir fundo, casada com o tema.
- Padrão da Virtus desde 20/07/2026: o agente gera com o Imagen 4
  (`opensquad-virtus/skills/image-generator/scripts/generate.js`, lê `GEMINI_API_KEY`), converte
  para WebP e **mostra a imagem no chat antes do commit** (no máximo 2 rodadas de ajuste). Sem a
  chave no ambiente, a capa tipográfica de `scripts/capas-blog.py` segura.

## 3. Método da Fábrica de Sites (resumo; a íntegra está no `METODO.md`)

- Dado só em `src/data/`; nunca nome, loja ou link solto em componente.
- Uma URL por intenção de busca: antes de criar, `npm run check:indice -- --tema "..."`.
- Página nova recebe link de entrada; toda página tem 2 links de saída para os guias.
- Página de categoria do blog só a partir de 3 posts no tema.
- `noindex` até o lançamento (Search Console com acesso).
- `npm run build` passa todas as travas antes de subir; conferir em 390 e 1280 px, console limpo.
- Ao fechar uma entrega: "isso serve para outros sites?" Se sim, vai para a fábrica.

## 4. Checklist antes do PR

- [ ] `npm run build` passou (travas: modelo, tema, copy, robô, links, markdown, índice, WhatsApp, páginas).
- [ ] Fonte de cada número aberta e conferida; vigência da lei conferida; NÃO CONFIRMEI anotado.
- [ ] Abertura com gancho e resposta em negrito; lei entre aspas; dado próprio no texto.
- [ ] Palavras medidas contra o alvo do tema.
- [ ] Link de entrada e 2 de saída; índice anti-canibalização; mensagem de WhatsApp do post.
- [ ] Imagem própria mostrada no chat antes do commit.
- [ ] Visto no celular (390) e no computador (1280), sem rolagem lateral e sem erro no console.
- [ ] Nenhum "robô", nenhum preço da Amazon, nenhuma promessa.
