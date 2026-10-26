# Marketing do grupo: Instagram, status e anúncios

Plano para crescer o grupo de ofertas Tem Descontos com Instagram, status do WhatsApp e
anúncios da Meta, no mesmo método da Virtus: produção em lote, aprovação por mosaico, fila
agendada e campanha criada pela API, sempre pausada até o Wellington aprovar.

Escrito em 26/10/2026 (sessão do robô de ofertas). Quem abrir no PC: ler inteiro antes de criar
qualquer coisa, e marcar no fim o que já foi feito.

## 1. Objetivo e métrica

- **Objetivo:** membros novos no grupo, não curtida. Cada peça leva para
  `temdescontos.com.br/grupo?de=<origem>`.
- **Métrica principal:** custo por membro novo, que é o gasto dividido pelos membros que entraram
  no período. Meta inicial: abaixo de R$ 1 a R$ 1,50. É um chute para o primeiro teste: ajustar
  com os números reais.
- **Onde ler:** o resumo das 22h no rascunho já mostra "Cliques no convite hoje" por origem (o
  `?de=`) e os membros do dia. O encurtador separa clique de robô (prévia do WhatsApp, crawler)
  do clique de gente.

Origens combinadas (usar sempre estas, para o resumo somar certo):

| Origem | Onde |
|---|---|
| `status` | status do WhatsApp do Wellington |
| `insta` | link da bio do Instagram |
| `insta-story` | adesivo de link nos stories |
| `anuncio` | anúncio pago da Meta |
| `indicacao` | convite das 19h no próprio grupo (já existe) |

## 2. O que já existe

- **Card de oferta** (`marketing/cards/`): 1080x1920 (status e stories), com foto, "De" riscado,
  preço grande, selo de % OFF, economia e botão "Entra no grupo, é grátis". Visual aprovado em
  26/10 com o Galaxy S25 Ultra. Gerar: ver a seção 4.
- **Status do meio-dia** (fluxo 03, `GARIMPO_STATUS_HORA`, padrão 12h): manda no rascunho a melhor
  oferta do dia com o link `?de=status`. Hoje sai como texto e foto simples, ainda não sai no visual
  do card.
- **Convite das 19h** no grupo (`?de=indicacao`).
- **Rastreio** por `?de=` no encurtador e no resumo das 22h.

## 3. Regras de conteúdo (aprendidas no 26/10)

O que o Wellington aprovou e o que ele recusou:

- **Recusou:** texto genérico de convite ("Criei um grupo de ofertas…"). Ninguém clica, e não é
  para dizer que o grupo é dele.
- **Aprovou o tom de indicação:** "Esse grupo de ofertas tá valendo a pena 👀".
- **O que vende:** produto de desejo e de marca boa (Samsung, Apple, JBL, Philips Walita,
  Electrolux, Adidas, Nike…) com **desconto grande de verdade**. Marca fraca não serve
  (ele recusou uma air fryer Kian).
- **Sempre** com "De" (riscado), "Por" e a % de desconto. Sem isso "não chama atenção de ninguém".
- **Visual trabalhado** (o card), não foto com legenda simples.
- O produto do status **tem que estar no grupo** antes do status (quem entra precisa achar).
- Preço exato só em peça do dia (status e stories), com a data e a hora no rodapé
  ("Preço visto na Amazon em 26/10 às 15h55. Pode mudar a qualquer momento."). Amazon muda preço
  em horas.
- **Anúncio pago nunca leva preço exato** (roda por dias, e preço velho vira propaganda enganosa
  para a Meta e problema com a Amazon). Anúncio usa o card perene (seção 5).
- Regras do projeto que valem aqui também: nunca "robô" no texto; nunca "menor preço" nem urgência
  falsa ("só hoje", "últimas unidades") que a loja não disse; nunca travessão.

## 4. Como gerar o card do dia

1. Achar a oferta: a melhor fonte para marca boa com desconto grande foi
   `amazon.com.br/deals?bubble-id=deals-collection-electronics` (Galaxy S25 Ultra 47%, iPad Air
   48%, iPhone 15 30%). Na Shopee as marcas boas não tinham desconto real nem vendas; o Mercado
   Livre (catálogo) quase não devolveu preço pela API em 26/10.
2. Soltar a oferta no grupo pelo rascunho (modelo em `MODELO-RASCUNHO.md`) e responder "sim".
3. Baixar a foto do produto (a da loja, fundo branco) para uma pasta.
4. Escrever o `oferta.json` na mesma pasta:

   ```json
   { "nome": "Galaxy S25 Ultra", "detalhe": "512GB · 12GB RAM", "de": "11.999", "por": "6.332",
     "foto": "foto.jpg", "loja": "Amazon", "visto": "26/10 às 15h55" }
   ```

5. Gerar: `node marketing/cards/gerar.mjs pasta/oferta.json pasta/card.jpg`
   (precisa do Playwright: `npm i -D playwright` e `npx playwright install chromium`). A % e a
   economia saem do "de" e do "por".
6. Conferir a imagem (texto não pode encostar no botão) e mandar ao Wellington.
7. Legenda para o status, que deixa o link clicável: `Entra aqui 👉 temdescontos.com.br/grupo?de=status`

A fazer: versão 1080x1350 (feed do Instagram) no mesmo visual.

## 5. Peças a produzir (igual ao lote da Virtus)

| Peça | Formato | Preço? | Frequência |
|---|---|---|---|
| Card da oferta do dia | 1080x1920 (status e stories) | Sim, com data e hora | Diária |
| Card da oferta do dia (feed) | 1080x1350 | Sim, com data e hora | 3 a 4 por semana |
| "O que saiu essa semana" | Carrossel 1080x1350 | Só % OFF | Semanal (domingo) |
| Card perene para anúncio | 1080x1920 e 1080x1350 | Não, só exemplos e % | Troca a cada 2 a 3 semanas |
| Bio do Instagram | Texto e link | Não | Uma vez |

Card perene, ideia de texto: "Ofertas da Amazon, Mercado Livre e Shopee todo dia, com cupom.
Já saiu Galaxy S25 Ultra com 47% OFF, air fryer, tênis… Entra no grupo, é grátis."

Fluxo de aprovação como na Virtus: produzir o lote, mandar o mosaico, o Wellington aprova, entra
na fila agendada. Nada sai sem aprovação.

## 6. Conta da Meta (checklist)

Tudo **separado da Virtus**: token, app, conta de anúncio e fila deste negócio ficam só neste
projeto (a sessão do Instagram da Virtus já combinou isso: "cada token fica no próprio projeto").

1. [ ] Instagram do Tem Descontos como **conta profissional** (Empresa ou Criador).
2. [ ] **Página do Facebook** do Tem Descontos, ligada ao Instagram.
3. [ ] **Business Manager** (portfólio empresarial) com a Página, o Instagram e uma **conta de
   anúncio** própria, com forma de pagamento.
4. [ ] **App** no Meta for Developers (tipo Empresa), dentro do Business Manager.
5. [ ] Permissões: `instagram_basic`, `instagram_content_publish`, `pages_show_list`,
   `pages_read_engagement`, `business_management` e `ads_management` (para os anúncios).
6. [ ] **Usuário do sistema** no Business Manager, com token de longa duração e acesso à Página,
   ao Instagram e à conta de anúncio.
7. [ ] Guardar só nas variáveis do Railway (n8n), nunca no chat nem no git:
   `META_TOKEN`, `META_IG_USER_ID`, `META_PAGE_ID`, `META_AD_ACCOUNT_ID`.
8. [ ] Conferir pelo Ensaio 96 que as variáveis existem (devolver só tem ou não tem).

## 7. Automação planejada (n8n)

**Fluxo novo "05 Instagram"** (em `infra/n8n/sdk/`, com teste em `testes/bateria/`):

- Publica no Instagram as peças aprovadas da fila, no horário: stories com o card do dia e feed.
- A API do Instagram só aceita imagem por **URL pública**. Caminho sugerido: o encurtador
  (Railway, já tem `sharp`) servir o card em `/card/<id>.jpg`. Gerar o card no servidor sem
  navegador: montar o mesmo visual em SVG e converter com `sharp`, ou rodar o
  `marketing/cards/gerar.mjs` no PC e subir a imagem.
- Status do WhatsApp: a Z-API não posta no status do número pessoal do Wellington. Continua
  manual: o card chega no rascunho e ele encaminha para o status. Melhoria: o envio do meio-dia
  (fluxo 03) passar a mandar o **card** em vez da foto simples, só quando houver oferta de marca
  com desconto de 30% ou mais; sem oferta boa, não manda nada.

**Fila:** a Virtus usa uma tabela de posts agendados no Supabase. Para este negócio, usar uma
fila **própria** (projeto ou tabela separada), nunca a da Virtus. Decidir no PC.

## 8. Anúncios (método da Virtus)

Campanha, conjunto e anúncio criados pela Marketing API, **tudo pausado** até o Wellington
aprovar no Gerenciador.

Primeiro teste:

- **Objetivo:** Tráfego (não Engajamento).
- **Destino:** `https://temdescontos.com.br/grupo?de=anuncio`.
- **Verba:** R$ 15 a R$ 20 por dia, 4 a 5 dias (uns R$ 80 no total).
- **Público:** Brasil, 18 a 45 anos, interesses em compras online, promoções, Shopee,
  Mercado Livre, Amazon.
- **Criativo:** o card perene (seção 5), nas versões stories e feed.
- **Decisão:** custo por membro abaixo da meta, aumentar a verba aos poucos; acima, trocar o
  criativo antes de gastar mais.

Anúncio "Clique para WhatsApp" leva para conversa com um número, não para grupo: não usar.

## 9. Ordem de trabalho

1. [ ] Checklist da Meta (seção 6).
2. [ ] Bio do Instagram com `temdescontos.com.br/grupo?de=insta`.
3. [ ] Versão feed (1080x1350) do card e o card perene.
4. [ ] Primeiro lote: 1 semana de stories e feed, mosaico, aprovação.
5. [ ] Fila própria e fluxo 05 publicando (seção 7).
6. [ ] Envio do meio-dia mandando o card (fluxo 03).
7. [ ] Campanha de teste pausada (seção 8), aprovação, rodar, ler o custo por membro.

## 10. Perguntas para o Wellington

- O Instagram do Tem Descontos já existe? Qual o @?
- Já existe Business Manager ou conta de anúncio para o Tem Descontos, ou só o da Virtus?
- Horário preferido para os stories e o feed?
- Verba do primeiro teste: R$ 80 no total está bom?
