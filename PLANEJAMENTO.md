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

## Onde rodar

| Opção | Custo a mais | Observação |
|---|---|---|
| **Projeto novo no Easypanel que você já tem** (n8n + Postgres próprios) | nenhum, usa o mesmo servidor | separado da NetMax, mesma forma de trabalhar que você já conhece |
| Railway (escopo original) | plano Pro do Railway | funciona igual; é uma conta e uma fatura a mais |

Recomendação: Easypanel, projeto novo (`ofertas`). Não usar o n8n da NetMax:
é a infraestrutura do Viny, e misturar complica os dois.

Variáveis do n8n (Easypanel ou Railway):

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
NODE_FUNCTION_ALLOW_BUILTIN=crypto
```

`NODE_FUNCTION_ALLOW_BUILTIN=crypto` é para o nó Code assinar o pedido da
Shopee. As chaves das lojas e da Z-API entram como variáveis também
(`ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`, `SHOPEE_APP_ID`,
`SHOPEE_SECRET`, `AMAZON_TAG`, `GRUPO_OFERTAS`), nunca no código.

## Os fluxos

1. **Entrada**: webhook da Z-API ("Ao receber"). Só aceita mensagem do
   grupo rascunho (ou do seu número); o resto é ignorado.
2. **Converte**: `extrairLinks` e `plataformaDe` (`lib/ofertas.mjs`).
   Amazon: `amazonComTag`. Shopee: `shopeeCorpo` + `shopeeAutorizacao` e a
   chamada à API. Mercado Livre: passa como veio (já é seu link). Loja que o
   robô não conhece: devolve no rascunho "não sei converter esta loja" e não
   posta.
3. **Posta**: `send-image` com a sua foto e `legenda(...)`, ou `send-text`
   se não houver foto. Confere o `zaapId`.
4. **Avisa no rascunho**: "postado" ou o motivo de não ter postado. Assim
   você nunca fica sem saber.

## Cuidados

- **Número dedicado** para o grupo. Postar em grupo é tranquilo; o que derruba
  número é disparo em massa para conversas privadas. Ritmo: uma oferta por
  vez, com alguns minutos entre elas.
- **Aviso de afiliado** na legenda ("Link de afiliado"): já vem em `legenda()`.
- Cada loja tem regras do programa de afiliados (onde pode divulgar, o que
  não pode prometer). Vale ler as da Shopee, da Amazon e do ML antes de abrir
  o grupo.

## Esperando o Wellington

| # | Pergunta | Por quê |
|---|---|---|
| 1 | Easypanel (projeto novo) ou Railway? | decide onde subir o n8n |
| 2 | Em quais programas você já está aprovado (Shopee, Amazon, Mercado Livre)? | define o que entra no primeiro fluxo |
| 3 | Shopee: você já tem AppId e Secret da Open API de afiliados? | é o que gera o link curto automático |
| 4 | Qual número vai ser o do robô (instância nova da Z-API)? | não pode ser o da Juliana |
| 5 | O rascunho vai ser um grupo seu ou a conversa direta com o robô? | é por onde as ofertas entram |
