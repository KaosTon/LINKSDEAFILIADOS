# Leia primeiro (quem abrir este repositório)

Robô de ofertas do Wellington (GitHub KaosTon): ele escolhe a oferta, o robô
troca o link pelo link de afiliado dele e posta no grupo de WhatsApp com foto
e legenda. Respostas a ele em português, objetivas, com as perguntas no fim.

## Por onde começar

1. `PLANEJAMENTO.md`: o desenho, o que já está decidido e o que espera
   resposta dele. É o estado de verdade.
2. `LICOES-DO-NETMAX.md`: o que deu errado no projeto da NetMax (mesma
   ferramenta: n8n + Z-API) e como não repetir.
3. `lib/ofertas.mjs`: as funções que viram nós Code (links, plataforma,
   Amazon, Shopee, legenda), testadas em `testes/bateria/ofertas.mjs`.

## O caminho do grupo (a prioridade, não perder)

O objetivo é o grupo de ofertas no ar, postando sozinho. Ordem:

1. Ele traz a Z-API (instância nova, número do robô) e preenche as variáveis
   que faltam de uma vez: `ZAPI_INSTANCE_ID`, `ZAPI_INSTANCE_TOKEN`,
   `ZAPI_CLIENT_TOKEN`, `AUTOR_PHONE`, `WEBHOOK_SEGREDO`.
2. Rodar o 99 (diagnóstico) e subir 01, 02 e 03 juntos com a lib atual.
3. Publicar o 01, passar a ele a URL do webhook (com `?k=`) para a Z-API.
4. "Oi" no grupo rascunho e no de teste: ler os ids na execução e pôr em
   `GRUPO_RASCUNHO` e `GRUPO_OFERTAS`.
5. Testar rascunho e garimpo no grupo de teste (send-link com foto).
6. `GARIMPO_LIGADO=sim` e trocar `GRUPO_OFERTAS` para o grupo de verdade.
7. Shopee: quando a API aprovar (pedida 06/10), `SHOPEE_APP_ID` e `SHOPEE_SECRET`.

O aprendizado deste projeto vai para o **KaosTon/opensquad-starter**, sem
dado dele: receita `_recipes/robo-ofertas-afiliado.md` (produto 42), lições
no fim de `skills/n8n/SKILL.md` e em `skills/whatsapp-zapi/SKILL.md`
(PR #19, mesclado em 07/10). Isso é registro; o trabalho principal é aqui.

## Como trabalhar aqui

- Fluxo do n8n: escrever em `infra/n8n/sdk/` (Workflow SDK), compilar com
  `node infra/n8n/compilar.mjs`, rodar `node testes/bateria/todas.mjs`, e só
  então subir (`node infra/n8n/para-sdk.mjs --todos` gera o código para o MCP
  do n8n). Fluxo publicado que é editado vira rascunho: publicar de novo.
- Lógica nova de nó Code nasce como função em `lib/` com teste, e o teste
  tem que falhar no código antigo antes de valer.
- Trabalho direto no `main`.

## Regras que não mudam

- Segredo (token da Z-API, chaves das lojas, senha) nunca no chat, no git ou
  em documento. Mora nas variáveis do n8n. Se o Wellington colar um, avisar.
- Dado pessoal (telefone de membro do grupo, conversa) nunca no git. Telefone
  em teste é inventado (bloco repetido ou sequência: a bateria confere).
- O número do grupo de ofertas é separado do número da Juliana (NetMax).
- Não mexer nos projetos da NetMax (tv_netmax) nem da Virtus.
- Sem travessão em nenhum arquivo (a bateria `sem-travessao` confere).

## Fluxos no n8n (Railway, projeto pessoal 2Re5IRd41nXG21gD)

| Fluxo | id no n8n | Estado |
|---|---|---|
| 01 Entrada (rascunho -> grupo) | `Q29NVtchUBdLaeKH` | PUBLICADO 15/10. Webhook `/webhook/ofertas-zapi?k=` na Z-API. Com nome e preço lidos, sai no padrão do garimpo (chamada, nome, De/por, link, cupom); senão, o texto como veio com os links trocados. Mensagem só de texto (colada, sem prévia) ganha a foto oficial: API da Shopee por loja e item, ou página da Amazon |
| 02 Gateway de saída (Z-API) | `0lJeNYqZyDG9Rq2J` | PUBLICADO 15/10. send-link com `linkType: LARGE` e a foto enquadrada em 1200x630 (images.weserv.nl, borda branca; sem isso a foto quadrada sai cortada). Plano B: send-image com a foto original |
| 03 Garimpo automático | `w7x4LWl6wiBWRZDB` | PUBLICADO 15/10 com `GARIMPO_LIGADO=sim`, postando no grupo de TESTE. Fontes: canais do Telegram, Shopee oficial (productOfferV2, 1 a cada 3, desconto 30%+, maior comissão), Amazon /deals. Ritmo: espalha o limite do dia até as 22h (guarda 1 para a noite), 2h30 entre posts de madrugada. Não repete o mesmo tipo de produto em 6 posts. Amazon: confere preço e usa título e foto oficiais. Rodada na mão não posta |
| 04 Mercado Livre | `s3ybSgtGEWoPM3x5` | PUBLICADO 16/10. Acesso OAuth à API do ML (app no ML Developers; `ML_APP_ID` e `ML_SECRET` no Railway). Webhooks: `ml-autorizar` (página com o botão; o dono autoriza uma vez), `ml-retorno` (troca o código e guarda o token na memória do fluxo, só a primeira conta), `ml-token` (entrega o token com o cabeçalho `x-chave` = sha256 de `ml-token:` + ML_SECRET). Renova de hora em hora. Lib: `lib/mercadolivre.mjs` |
| 96 Ensaio: lê um post do canal | `V0XEygzTlePVkDCY` | manual; investigar post errado (preço e foto na página da Amazon) |
| 97 Ensaio: de onde tirar ofertas | `dg95IghMfsJGlosW` | manual |
| 98 Ensaio: abre link curto | `dtJ7lwTKLItlckuD` | manual |
| 99 Diagnóstico | `ACXO2u8Hk4mjaxmm` | manual; rodar depois de mudar variável |

**Grupos (13/10):** `GRUPO_RASCUNHO` = Rascunho, `GRUPO_OFERTAS` = Grupo de Ofertas teste. Para ir ao grupo de verdade: trocar `GRUPO_OFERTAS` e Deploy. O número do robô ainda aparece com o nome de outra pessoa no perfil; ele troca para PromoX antes do grupo de verdade.

**Railway (15/10):** `GARIMPO_POR_DIA=40`. Parece haver `GARIMPO_INTERVALO_DIA=30` (posts saíram de 30 em 30 min); o padrão do código é 25.

**Mudou a lib:** subir de novo os nós Code que a usam (01, 02 e 03) quando a mudança afetar cada um.
