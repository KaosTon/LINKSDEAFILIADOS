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
| `ML_ETIQUETA` | opcional, recomendado: sua etiqueta do ML (`tonw17`); meli.la de outra etiqueta é recusado |
| `GARIMPO_LIGADO` | `sim` para o fluxo 03 postar sozinho; sem isso ele só calcula |
| `GARIMPO_CANAIS` | opcional: canais públicos do Telegram (padrão `promotop,pechinchou,fadadoscupons,cupomonline`) |
| `GARIMPO_INICIO`, `GARIMPO_FIM`, `GARIMPO_POR_DIA`, `GARIMPO_CUPONS_POR_DIA`, `GARIMPO_DESCONTO_MIN` | opcionais: 8, 22, 25, 6, 15 |
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
- Mercado Livre: etiqueta `tonw17`. O meli.la abre (301) em
  `mercadolivre.com.br/social/...?matt_word=tonw17&matt_tool=78518728&ref=...`;
  o robô confere o `matt_word`. Link comum do ML não dá para converter
  sozinho (o `ref` é cifrado), só pelo Gerador de links.

## Esperando o Wellington

| # | Pergunta | Por quê |
|---|---|---|
| 1 | Shopee: acesso à Open API pedido (06/10) pelo formulário da Central de Ajuda em affiliate.shopee.com.br/open_api; quando aprovar, AppId e Secret | é o que gera o link curto automático; vão direto nas variáveis do n8n |
| 2 | Qual número vai ser o do robô (instância nova da Z-API)? | não pode ser o da Juliana |
| 4 | Ids dos grupos rascunho e ofertas | sai do webhook: com a Z-API ligada, manda um "oi" em cada grupo e eu leio o id na execução |
