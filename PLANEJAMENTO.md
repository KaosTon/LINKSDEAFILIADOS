# Planejamento: robô de ofertas no WhatsApp

Partiu de um escopo que o Wellington trouxe (n8n + Z-API, Railway, APIs de
Mercado Livre e Shopee). Este arquivo é a versão conferida: o que estava
certo ficou, o que quebraria na hora de rodar está corrigido com o motivo.

## O desenho

```
você manda a oferta  ->  n8n                                   ->  grupo de ofertas
(foto + texto + link)    1. separa os links e vê a loja             (foto, legenda,
no grupo "rascunho"      2. troca pelo SEU link de afiliado          link convertido)
                         3. monta a legenda
                         4. posta pela Z-API e confere que saiu
```

A oferta entra por **você**, não por cópia automática de canal alheio. Dois
motivos: robô do Telegram não lê canal de outra pessoa (só onde é
administrador), e oferta escolhida por você é o que dá credibilidade ao grupo.
O "rascunho" pode ser um grupo só seu com o número do robô, ou a conversa
direta com ele.

## O que mudou em relação ao escopo original

| Ponto | No escopo original | O certo | Por quê |
|---|---|---|---|
| Variável do banco | `DB_POSTGRES_HOST` | `DB_POSTGRESDB_HOST` (e `_DATABASE`, `_USER`, `_PASSWORD`, `_PORT`) | com o nome errado o n8n ignora e sobe em SQLite |
| Variáveis que faltavam | (nenhuma) | `N8N_ENCRYPTION_KEY`, `GENERIC_TIMEZONE=America/Sao_Paulo` | sem a chave, recriar o container perde as credenciais; sem o fuso, horário sai errado |
| Imagem do n8n | `n8nio/n8n:latest` | uma versão fixa (ex.: `n8nio/n8n:1.x.y`) | `latest` atualiza sozinho e pode quebrar fluxo sem ninguém mexer |
| Mercado Livre | `POST https://mercadolibre.com` com `link` e `source_id` | não existe API pública oficial de link de afiliado; o link sai do painel de afiliados (ou da extensão) já pronto, `meli.la/...` | o endpoint do escopo não existe; o robô só reconhece o link do ML e posta como veio |
| Shopee | `POST https://shopee.com.br`, assinatura HMAC | `POST https://open-api.affiliate.shopee.com.br/graphql`, mutation `generateShortLink`, cabeçalho `SHA256 Credential=AppId, Timestamp=..., Signature=SHA256(AppId+Timestamp+Corpo+Secret)` | endpoint e assinatura do escopo não batem com a API oficial de afiliados |
| Amazon | (sem detalhe) | não precisa de API: link do produto com `?tag=SUA-TAG`; `amzn.to` precisa ser aberto antes | é o próprio link de associado |
| Z-API | `https://z-api.io`, grupo `...@g.us` | `https://api.z-api.io/instances/{ID}/token/{TOKEN}/send-image`, cabeçalho `Client-Token`, grupo no formato `120363...-group` | o formato `@g.us` é de outra API; a Z-API usa `-group` |
| Conferir envio | (nenhum) | só conta como enviada se a resposta tiver `zaapId` ou `messageId` | a Z-API responde 200 com erro no corpo (lição do NetMax) |
| Foto, nome e preço | o n8n descobre sozinho | você manda a foto e o texto junto com o link; o robô só troca o link | site de loja bloqueia robô que lê página, e preço errado no grupo é pior que sem preço |

## Onde rodar: Railway (decidido em 05/10)

O Wellington já tem o plano Pro do Railway com uso de sobra (US$ 20 de uso
incluído, usando bem menos). Um n8n com Postgres para este volume cabe nisso.

1. No Railway, **New Project > Deploy a Template**, e escolher um template de
   **n8n com Postgres** (o n8n oficial em Docker e o banco juntos).
2. Conferir e completar as variáveis do serviço do n8n (abaixo). O template
   costuma gerar `N8N_ENCRYPTION_KEY` e as do banco; o resto entra à mão.
3. **Settings > Networking > Generate Domain** no n8n: é o endereço do painel
   e dos webhooks.
4. Trocar a imagem `latest` por uma versão fixa depois que subir.
5. Guardar a `N8N_ENCRYPTION_KEY` num lugar seguro: perdeu, perdeu todas as
   credenciais.

Variáveis do n8n:

```
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=<host interno do Postgres>
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=<senha forte>
N8N_ENCRYPTION_KEY=<texto aleatório longo, nunca trocar depois>
GENERIC_TIMEZONE=America/Sao_Paulo
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=48
NODE_FUNCTION_ALLOW_BUILTIN=crypto,url
```

`NODE_FUNCTION_ALLOW_BUILTIN=crypto,url`: `crypto` assina o pedido da Shopee e
`url` é obrigatório, porque o nó Code do n8n não tem `URL` global (ensaio 98,
06/10); sem ele o fluxo 01 responde no rascunho pedindo a variável. No Railway também precisa `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` (feito
em 05/10, diagnóstico 99 confere).

Variáveis do projeto (no serviço do n8n, nunca no código):

| Variável | O que é |
|---|---|
| `ZAPI_BASE_URL` | `https://api.z-api.io` (só o endereço, sem /instances) |
| `ZAPI_INSTANCE_ID`, `ZAPI_INSTANCE_TOKEN`, `ZAPI_CLIENT_TOKEN` | da instância nova da Z-API |
| `GRUPO_RASCUNHO` | id do grupo onde você posta a oferta (`120363...-group`) |
| `GRUPO_OFERTAS` | id do grupo que recebe as ofertas |
| `AUTOR_PHONE` | seu número, com 55 e DDD |
| `AMAZON_TAG` | sua tag de associado (termina em `-20`) |
| `SHOPEE_APP_ID`, `SHOPEE_SECRET` | da Open API da Shopee |
| `ML_ETIQUETA` | etiqueta do ML (`tonw17`): meli.la de outra etiqueta é recusado no rascunho; com `ML_MATT_TOOL`, link de produto vira o dele |
| `ML_MATT_TOOL` | id de afiliado do ML (`78518728`, aparece em todo meli.la dele): monta o link `produto?matt_word=ETIQUETA&matt_tool=ID` |
| `GARIMPO_LIGADO` | `sim` para o fluxo 03 postar sozinho; sem isso ele só calcula |
| `GARIMPO_CANAIS` | opcional: canais públicos do Telegram (padrão `promotop,pechinchou,fadadoscupons,cupomonline`; 13/10 ele pediu somar `tudonapromo`, o canal de referência do padrão de legenda) |
| `GARIMPO_INICIO`, `GARIMPO_FIM`, `GARIMPO_POR_DIA`, `GARIMPO_CUPONS_POR_DIA`, `GARIMPO_DESCONTO_MIN` | opcionais: 8, 22, 25, 6, 15 |
| `OPENROUTER_API_KEY` | chave do OpenRouter (segredo): a IA escreve a chamada de cada achado |
| `OPENROUTER_MODELO` | opcional: padrão `google/gemini-3.1-flash-lite` (US$ 0,25/1,50 por milhão; ~R$ 0,50/mês para 25 por dia) |
| `GARIMPO_PROIBIDO` | opcional: palavras proibidas separadas por vírgula (padrão: bebida, adulto, aposta, vape, arma) |
| `MAGALU_LOJA` | opcional: o nome da sua loja no magazinevoce (troca link de outra loja pela sua) |
| `WEBHOOK_SEGREDO` | opcional, recomendado: texto aleatório; a URL do webhook na Z-API termina com `?k=` e ele |

## Os fluxos

1. **Entrada**: webhook da Z-API ("Ao receber"). Só aceita mensagem do
   grupo rascunho (ou do seu número); o resto é ignorado.
2. **Converte**: `extrairLinks` e `plataformaDe` (`lib/ofertas.mjs`).
   Amazon: `amazonComTag`. Shopee: `shopeeCorpo` + `shopeeAutorizacao` e a
   chamada à API. Mercado Livre: passa como veio (já é seu link). Magalu: o
   Parceiro Magalu é uma loja sua em `magazinevoce.com.br`; a conversão do
   link do produto para a sua loja depende do formato atual (falta um exemplo). Loja que o
   robô não conhece: devolve no rascunho "não sei converter esta loja" e não
   posta.
3. **Posta**: `send-image` com a sua foto e `legenda(...)`, ou `send-text`
   se não houver foto. Confere o `zaapId`.
4. **Avisa no rascunho**: "postado" ou o motivo de não ter postado. Assim
   você nunca fica sem saber.

## Garimpo automático (fluxo 03, decidido em 06/10)

Ele quer 100% automático, 25 por dia. A cada 35 minutos, das 8h às 22h:
lê as páginas públicas `t.me/s/CANAL` (sem conta do Telegram), abre qualquer
link até a loja e troca pelo dele; sem oferta de canal, usa a página de ofertas
da Amazon (maior desconto). Legenda sempre no padrão dele, nunca o texto do
canal. Descarta: ML de canal (o link só sai do painel dele), Shopee até a API,
proibidos, cupom com nome do canal, produto repetido em 7 dias, post com mais
de 2 horas. Cupom de ML sem link convertível sai só com o código.

Canais (ensaio 06/10): @promotop (112 mil) e @pechinchou (69 mil) para
produto; @fadadoscupons (82 mil) e @cupomonline (29 mil) mais cupom.
Magalu bloqueia o Railway (403); API do ML fechada.

Legenda (06/10, padrão Tudo na Promo + Ha!DESCONTOS): CHAMADA (IA), nome,
"💵 De R$X por R$Y no Pix", "💳 ou R$Z em até Nx sem juros", "🚚 Frete grátis",
"🛒 link", "🏷️ Use o cupom A + dica" e "⚠️ Oferta exclusiva Prime" (o que
muda o preço). SEM a linha "Link de afiliado" (ele pediu para tirar em 06/10,
mesmo avisado da regra da Amazon). Foto do canal passa pela IA: com marca de
outro grupo (achou "@pechinchou" numa), posta sem foto. A chamada é
escrita pela IA (OpenRouter) e conferida por `limparChamada`: preço, número
que não está no nome, %, frete, "menor preço" e urgência falsa são barrados.
Se a IA errar ou cair, entra uma chamada da lista e o post sai igual.

Envio (06/10): achado com link e foto sai por `send-link` da Z-API (a prévia
grande do link com a foto, como o Tudo na Promo); se falhar, o gateway manda
na hora por `send-image`. Sem banner nas fotos (ele não quer). Nome do grupo,
por enquanto: PromoX (pode mudar; nada no robô depende dele ainda).

Programas (07/10): as 4 diretas (Amazon, Shopee, ML, Magalu) ficam; Lomadee
só para loja que faltar (ela fica com parte da comissão). Ele acha que tem
Casas Bahia e Fast Shop: falta um link de afiliado de exemplo de cada para o
robô aprender o formato. AliExpress: candidato (público do grupo compra lá);
cadastro no AliExpress Portals e link gerado pela API deles.

## Cuidados

- **Número dedicado** para o grupo. Postar em grupo é tranquilo; o que derruba
  número é disparo em massa para conversas privadas. Ritmo: uma oferta por
  vez, com alguns minutos entre elas.
- **Aviso de afiliado** na legenda ("Link de afiliado"): já vem em `legenda()`.
- Cada loja tem regras do programa de afiliados (onde pode divulgar, o que
  não pode prometer). Vale ler as da Shopee, da Amazon e do ML antes de abrir
  o grupo.

## Decidido (05/10)

- Railway, no plano Pro que ele já tem.
- Aprovado em todos os programas: Shopee, Amazon, Mercado Livre e Magalu.
- Grupo de teste primeiro; depois o grupo dele de 250 pessoas, com nome novo.
  O número do robô precisa ser membro do grupo (e admin, se o grupo só deixar
  admin mandar mensagem).

## Dados dele (06/10)

- Amazon: tag `promoprimex08-20` (vai em `AMAZON_TAG`; não é segredo, aparece em todo link).
- Magalu: programa agora se chama Influenciador Magalu; loja `magapromooficial`
  (vai em `MAGALU_LOJA`). No link ela aparece como `magazinemagapromooficial`:
  `magazinevoce.com.br/magazineLOJA/produto/p/ID/cat/sub/?seller_id=...`. O robô
  aceita os dois jeitos, troca a loja de link de outro divulgador e converte
  link de produto do magazineluiza.com.br para a loja dele.
- Shopee: acesso à Open API pedido em 06/10, esperando a Shopee aprovar.
- Mercado Livre (06/10): link de produto + `?matt_word=tonw17&matt_tool=78518728`
  CONTOU clique nas Métricas (2 cliques de 2 abas anônimas). Falta ver a
  primeira venda. Página /ofertas do ML passou a dar captcha para o Railway
  (não driblamos); ML de canal sai abrindo o perfil social do outro e achando
  o produto pelo nome (60% das palavras no endereço, senão descarta).
- Mercado Livre: etiqueta `tonw17`. O meli.la abre (301) em
  `mercadolivre.com.br/social/...?matt_word=tonw17&matt_tool=78518728&ref=...`;
  o robô confere o `matt_word`. Link comum do ML não dá para converter
  sozinho (o `ref` é cifrado), só pelo Gerador de links.

## Esperando o Wellington (15/10)

| # | O quê | Por quê |
|---|---|---|
| 1 | Comprar `pxofertas.com.br` (registro.br, 1 ano, renovação automática, no CPF dele) e pôr no Cloudflare | encurtador e, depois, o site |
| 2 | Subir o serviço `encurtador/` no Railway (volume em `/data`, `ENCURTADOR_SEGREDO`, `BASE_URL`, domínio próprio) | link curto `pxofertas.com.br/a7k2m` e contagem de cliques |
| 3 | Link (meli.la) da lista de afiliado do Mercado Livre ("Achados com cupom" ou "Minhas recomendações") | post de cupom do ML hoje sai sem link dele: sem comissão |
| 4 | Trocar o nome do perfil do número do robô para PromoX | aparece em todo post |
| 5 | Trocar `GRUPO_OFERTAS` pelo grupo de verdade | sair do grupo de teste |

## Pesquisa de melhorias (16/10)

Pesquisa na internet (docs oficiais, blogs e comunidades BR). Parte das fontes é blog de terceiro; o que está "a verificar" não foi confirmado em documento oficial.

**Compliance (fazer primeiro, esforço baixo)**
- CONAR, Guia de Influenciadores (vale desde 1/6/2026): link de afiliado com comissão é publicidade e tem que estar identificado de forma clara ("publi" ou "publicidade"). Proposta: "#publi" curto em cada post e a regra fixa na descrição do grupo.
- CDC arts. 30 e 31: o preço anunciado vincula. Já conferimos o preço na loja; falta o aviso "preços e estoque podem mudar" na descrição e cuidar do "De X" (preço riscado inflado é risco de publicidade enganosa; histórico de preço próprio resolve).
- Amazon Associados: o grupo tem que estar cadastrado como canal no painel (a verificar no contrato). Encurtador próprio: redirecionar direto para a Amazon com a tag, sem esconder que é Amazon.
- LGPD: não expor nem exportar os números do grupo; se o encurtador gravar IP, anonimizar e ter prazo.
- Cupom de terceiro: algumas lojas (KaBuM via Awin) cancelam a comissão se o cupom não veio delas. Hoje não postamos KaBuM.

**Riscos para acompanhar**
- Amazon: a PA-API 5 foi substituída pela Creators API (OAuth; dizem que pede 10 vendas em 30 dias; Brasil a verificar). A política fala em preço vindo de link ou API da Amazon e foto sem cache. O robô lê a página pública; quando tivermos vendas, migrar para a Creators API.
- WhatsApp: número dedicado, intervalos variados, entrada só por convite, plano B (espelho no Telegram e Canal do WhatsApp, número reserva).

**Melhorias de conversão**
- Shopee: subIds no link (até 5: canal, grupo, tipo, id) e o conversionReport para saber o que vende. Esforço baixo.
- Shopee: shopOfferV2 (lojas com comissão extra do vendedor).
- Histórico de preço próprio (tabela no n8n): "menor preço em 30 dias" e barrar "De X" falso.
- ML: uma etiqueta por grupo para medir cada grupo.
- Encurtador próprio: cliques por hora para ajustar o horário dos posts.
- Formatos: "cupom do dia", resumo dos mais vendidos da semana, enquete de categoria.
- Novas lojas: KaBuM (Awin), AliExpress (Awin/Admitad), Lomadee.

**Feito em 16/10**: preço, nome e foto do ML de catálogo pela API (fluxo 04); cupom da página da Amazon (código ou cupom de marcar; cupom de primeira compra vira aviso e não muda o preço).

## Próximas fases (ordem combinada em 15/10)

1. **Grupo de verdade rodando** com o ritmo de número novo (40 por dia, espalhado até as 22h) e subir aos poucos.
2. **Encurtador** no domínio próprio, ligado no gateway (se cair, posta com o link normal).
3. **Grupos por tema** (eletrônicos, games, casa, automotivo, achados): classificar a oferta por categoria, uma variável de grupo e um limite por grupo, mais um teto total por número (risco de banimento é do número).
4. **Site no mesmo domínio:** página de ofertas do dia alimentada pelo robô e botão "Entre no grupo". O próprio serviço do encurtador serve as páginas.
5. **Blog:** guias de intenção de compra ("melhor X até R$Y", "X vale a pena?", "X ou Y"), 2 por semana, com informação real (texto raso não ranqueia). Google Search Console primeiro (grátis); OpenSEO (every-app/open-seo, usa DataForSEO pago por consulta) só quando o blog for a sério, e conferir se tem dados do Brasil. Expectativa: 3 a 6 meses até trazer visita; o blog é porta de entrada para o grupo.
6. **Card sem foto** (opcional): imagem com nome e preço nas cores do grupo, montada no n8n, para o caso raro sem foto oficial. Nada de foto gerada por IA (mostra produto que não existe).
7. **Vender para outros donos de grupo** depois de validar com números reais (ver abaixo).

## Vender o robô para outros grupos (ideia, 15/10)

- Validar antes: 2 a 4 semanas no grupo de verdade com cliques e comissões medidos. O caso real é o que vende.
- Começo recomendado: o cliente cria a conta dele no Railway e na Z-API e a gente instala lá (custo de servidor é dele, uns US$3 a 8 por mês por n8n, conferir no painel); quem não quiser mexer fica num projeto nosso com o custo na mensalidade.
- Um n8n por cliente (projeto Railway separado): credenciais, número, tags de afiliado e memória do garimpo ficam isoladas; um erro de um não derruba o outro. Com muitos clientes, pensar em configuração por cliente numa tabela.
- Cada cliente com o próprio número da Z-API e as próprias contas de afiliado; nada de chave nossa no fluxo dele.
- Modelo: implantação + mensalidade (receita `robo-ofertas-afiliado` no opensquad-starter).
