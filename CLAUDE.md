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
| 02 Gateway de saída (Z-API) | `0lJeNYqZyDG9Rq2J` | PUBLICADO 17/10. Vários grupos: `phone` (e `GRUPO_OFERTAS`) aceita ids separados por vírgula; a mesma mensagem vai para cada um com `GRUPOS_INTERVALO_SEG` (15 s, variando 30%) entre eles, total abaixo de 200 s; ok = saiu em pelo menos um. Encurta uma vez só. Links do Mercado Livre saem encurtados pelo encurtador (ENCURTADOR_URL + ENCURTADOR_SEGREDO no n8n); se o encurtador falhar, vai o link original. Amazon vai direto (regra da Amazon) e Shopee já é curto. send-link com `linkType: LARGE` e a foto enquadrada em 1200x630 (images.weserv.nl, borda branca; sem isso a foto quadrada sai cortada). Plano B: send-image com a foto original |
| 03 Garimpo automático | `w7x4LWl6wiBWRZDB` | PUBLICADO 15/10 com `GARIMPO_LIGADO=sim`. O grupo em que ele posta virou o grupo oficial (17/10: o Wellington pôs foto, nome e descrição e vai usar esse mesmo). Fontes: canais do Telegram, Shopee oficial (productOfferV2, 1 a cada 3, desconto 30%+, maior comissão), Amazon /deals. Ritmo: espalha o limite do dia até as 22h (guarda 1 para a noite), 2h30 entre posts de madrugada. Não repete o mesmo tipo de produto em 6 posts. Vez do eletrônico (17/10, `GARIMPO_ELETRONICO_A_CADA`, padrão 2, 0 desliga): depois de 1 post sem eletrônico, o próximo tenta eletrônico primeiro em todas as fontes (pelo nome, `ehEletronico`); sem nenhum, sai o de sempre. Medido antes: 4 eletrônicos em 14 posts. Convite diário (17/10, `GARIMPO_CONVITE_HORA`, 19h): pede no grupo para compartilhar, com `temdescontos.com.br/grupo?de=indicacao`. Sugestão de status (17/10, `GARIMPO_STATUS_HORA`, 12h): a oferta de maior % OFF do dia até ali vai para o rascunho com `?de=status` no fim, para o Wellington encaminhar para o status dele (o status do número do robô quase ninguém vê). `GRUPO_LINK` troca o link do grupo; 0 desliga cada um. Resumo das 22h com painel (17/10): membros do grupo (Z-API `light-group-metadata`, soma os grupos de `GRUPO_OFERTAS`) com a diferença do dia e de 7 dias, cliques no convite por origem e as 3 ofertas mais clicadas (diferença dos contadores do encurtador para a foto da véspera em `mem.historico`), e vendas da Shopee do dia (`conversionReport`: pedidos, valor e comissão estimada; são todas as suas vendas de afiliado da Shopee). Domingo: membros dia a dia. O que falhar fica de fora. Amazon, ML e Magalu: só no painel de cada loja. Amazon: confere preço e usa título e foto oficiais. Mercado Livre de catálogo (/p/MLB): confere preço, nome e foto pela API (fluxo 04; anúncio comum MLB-123 a API não abre). Travas (16/10): link com produto diferente do texto (nome ou quantidade) não sai; ML sem como conferir só se o post tiver até 30 min (`GARIMPO_IDADE_SEM_CONFERIR`); "De" do canal com mais de 70% OFF sem a loja confirmar sai do post. Às 22h manda o resumo do dia (postados por loja, descartes por motivo) no rascunho. Rodada na mão não posta. O 01 está com a lib de antes das travas (só muda a lista de unidades em "Kit/2 unidades") |
| 04 Mercado Livre | `s3ybSgtGEWoPM3x5` | PUBLICADO 16/10. Acesso OAuth à API do ML (app no ML Developers; `ML_APP_ID` e `ML_SECRET` no Railway). Webhooks: `ml-autorizar` (página com o botão; o dono autoriza uma vez), `ml-retorno` (troca o código e guarda o token na memória do fluxo, só a primeira conta), `ml-token` (entrega o token com o cabeçalho `x-chave` = sha256 de `ml-token:` + ML_SECRET). Renova de hora em hora. Lib: `lib/mercadolivre.mjs` |
| 96 Ensaio: lê um post do canal | `V0XEygzTlePVkDCY` | manual; investigar post errado (preço e foto na página da Amazon) |
| 97 Ensaio: de onde tirar ofertas | `dg95IghMfsJGlosW` | manual |
| 98 Ensaio: abre link curto | `dtJ7lwTKLItlckuD` | manual |
| 99 Diagnóstico | `ACXO2u8Hk4mjaxmm` | manual; rodar depois de mudar variável |

**Grupos (13/10):** `GRUPO_RASCUNHO` = Rascunho, `GRUPO_OFERTAS` = Grupo de Ofertas teste. Para ir ao grupo de verdade: trocar `GRUPO_OFERTAS` e Deploy. O número do robô ainda aparece com o nome de outra pessoa no perfil; ele troca para PromoX antes do grupo de verdade.

**Railway (15/10):** `GARIMPO_POR_DIA=40`. Parece haver `GARIMPO_INTERVALO_DIA=30` (posts saíram de 30 em 30 min); o padrão do código é 25.

**Mudou a lib:** subir de novo os nós Code que a usam (01, 02 e 03) quando a mudança afetar cada um.

## Vários grupos de ofertas (estrutura pronta 17/10, em uso: 1 grupo)

Cada grupo do WhatsApp aceita até 1.024 pessoas. Quando o grupo atual estiver perto de encher:
1. Criar o grupo novo (mesmo nome com #2, #3...), pôr o número do robô como admin e o número reserva também.
2. Railway, n8n: `GRUPO_OFERTAS` = ids de todos os grupos separados por vírgula, na ordem (`id1,id2`). Deploy.
3. Railway, ENCURTADOR: `CONVITE_GRUPO` = convites de todos, na mesma ordem. O `/grupo` (site, bio, posts) abre o ÚLTIMO, o mais novo, que tem vaga; `/grupo?n=1` abre um específico.
4. Com muitos grupos, ficar de olho no volume do número (cada oferta vira uma mensagem por grupo) e no plano da Z-API.

## Domínio, encurtador e site (16/10)

- `temdescontos.com.br` (Registro.br, DNS no Cloudflare). Sem www = **encurtador** (`encurtador/`,
  serviço ENCURTADOR no Railway, volume `/data`, `BASE_URL`, `ENCURTADOR_SEGREDO`, `CONVITE_GRUPO`;
  CNAME da raiz para o Railway, proxy do Cloudflare desligado). Com `SITE_URL`, a raiz e qualquer
  caminho que não é link curto vão para o site; código vencido vai para `/oferta-encerrada`;
  `/grupo?de=` abre o convite e conta a origem (`/api/cliques`, campo `grupo`).
- `www.temdescontos.com.br` = **site** (`site/`, Next.js estático da fábrica de sites, Cloudflare
  Pages com diretório raiz `site`). Ler `site/CLAUDE.md` e `site/BRIEFING.md` antes de mexer.
  O que o site diz sobre o robô sai daqui (conferências, lojas, horário): mudou a regra no robô,
  mudar o guia em `site/src/data/paginas-servico.ts`.
