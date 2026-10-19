# Leia primeiro (quem abrir este repositório)

Robô de ofertas do Wellington (GitHub KaosTon): ele escolhe a oferta, o robô
troca o link pelo link de afiliado dele e posta no grupo de WhatsApp com foto
e legenda. Respostas a ele em português, objetivas, com as perguntas no fim.

## Por onde começar

1. `PLANEJAMENTO.md`: o desenho, o que já está decidido e o que espera
   resposta dele. É o estado de verdade.
2. `LICOES-DO-NETMAX.md`: o que deu errado no projeto da NetMax (mesma
   ferramenta: n8n + Z-API) e como não repetir.
3. `MODELO-RASCUNHO.md`: como o Wellington deve escrever a oferta no Rascunho (modelo testado) e a prévia
   (19/10: a oferta volta no Rascunho e só vai ao grupo com "sim"; `RASCUNHO_PREVIA=nao` desliga).
   Post que sair torto do Rascunho: corrigir a leitura e acrescentar o caso lá e na bateria.
4. `lib/ofertas.mjs`: as funções que viram nós Code (links, plataforma,
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
- Subir um nó Code pelo MCP do n8n (Railway): `update_workflow` com `setNodeParameter` em `/jsCode` e o código inteiro do export (`infra/n8n/exports/*.json`); depois `get_workflow_details` (sai em arquivo), comparar com o export normalizando os escapes `\u{...}` e `\u....` até dar "igual: true", e só então `publish_workflow`. Editar fluxo publicado cria rascunho: sem publicar, não vale.
- Conferir variável sem ver o valor: o Ensaio 96 (`V0XEygzTlePVkDCY`, nó "Le o post", rodar com executionMode manual) recebe um código que só devolve tem/não tem ou true/false. Nunca devolver o valor de segredo, token, `?k=` ou link de convite do grupo.
- No nó Code do n8n `URL` não é global: usar `require('url')`.
- Teste visual pedido pelo Wellington: mandar a prévia no rascunho antes de ligar no grupo (o robô ignora o que ele mesmo manda, então nada vaza para o grupo).
- Bateria: `node testes/bateria/todas.mjs` e olhar o código de saída; um `| grep` no meio já escondeu um SyntaxError.

## Regras que não mudam

- Site (`site/`): antes de qualquer página ou post, ler `site/DOCS/QUALIDADE.md` (padrão da Virtus e da
  fábrica). No texto do site, nunca "robô": falar da conferência (18/10/2026, trava no build).

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
| 01 Entrada (rascunho -> grupo) | `Q29NVtchUBdLaeKH` | PUBLICADO 15/10. Formatação do WhatsApp (18/10): `lerPost` tira `*negrito*`, `~riscado~` e `_itálico_` antes de ler; sem isso o preço riscado virava o preço e o nome sumia (oferta da TV via cutt.ly recusada). Publicado só no 01; o 02 e o 03 levam a lib nova no próximo deploy deles (export local já está à frente do que está no ar). Webhook `/webhook/ofertas-zapi?k=` na Z-API. Com nome e preço lidos, sai no padrão do garimpo (chamada, nome, De/por, link, cupom); senão, o texto como veio com os links trocados. Mensagem só de texto (colada, sem prévia) ganha a foto oficial: API da Shopee por loja e item, ou página da Amazon. Mensagem colada com prévia (17/10): a foto da prévia é miniatura (106x140, saía borrada), então a foto oficial vem primeiro e a miniatura só se não houver outra. ML de anúncio (/up/MLBU) a API não libera foto: para foto boa, mande a foto do produto como imagem com o texto na legenda. Link escondido de outro afiliado (18/10: `cutt.ly` para `meli.la` para a vitrine `/social/` de outra pessoa): o robô abre a vitrine, confere o produto em destaque pelo nome do texto e posta com a sua etiqueta; vitrine com outro produto é recusada. O card da vitrine mudou em 18/10 (o código do catálogo vem em `product_id`). Nome e preço na mesma linha ("TV 65 | De R$X Por R$Y") também são lidos |
| 02 Gateway de saída (Z-API) | `0lJeNYqZyDG9Rq2J` | PUBLICADO 17/10. Logo TD nas fotos (18/10, tamanho médio 130, aprovado pelo Wellington nas prévias do rascunho): o send-link usa `ENCURTADOR_URL/foto?u=&a=&t=130` (assinado com HMAC de `ENCURTADOR_SEGREDO`; o encurtador enquadra em 1200x630 e põe o logo, `encurtador/foto.mjs`); foto da Amazon segue só no weserv, sem logo (regra da Amazon); `FOTO_COM_LOGO=nao` desliga. Vários grupos: `phone` (e `GRUPO_OFERTAS`) aceita ids separados por vírgula; a mesma mensagem vai para cada um com `GRUPOS_INTERVALO_SEG` (15 s, variando 30%) entre eles, total abaixo de 200 s; ok = saiu em pelo menos um. Encurta uma vez só. Links do Mercado Livre saem encurtados pelo encurtador (ENCURTADOR_URL + ENCURTADOR_SEGREDO no n8n); se o encurtador falhar, vai o link original. Amazon vai direto (regra da Amazon) e Shopee já é curto. send-link com `linkType: LARGE` e a foto enquadrada em 1200x630 (images.weserv.nl, borda branca; sem isso a foto quadrada sai cortada). Plano B: send-image com a foto original |
| 03 Garimpo automático | `w7x4LWl6wiBWRZDB` | PUBLICADO 15/10 com `GARIMPO_LIGADO=sim`. O grupo em que ele posta virou o grupo oficial (17/10: o Wellington pôs foto, nome e descrição e vai usar esse mesmo). Fontes: canais do Telegram, Shopee oficial (productOfferV2, 1 a cada 3, desconto 30%+, maior comissão), Amazon /deals. Ritmo: espalha o limite do dia até as 22h (guarda 1 para a noite), 2h30 entre posts de madrugada. Não repete o mesmo tipo de produto em 6 posts. Vez do eletrônico (17/10, `GARIMPO_ELETRONICO_A_CADA`, padrão 2, 0 desliga): depois de 1 post sem eletrônico, o próximo tenta eletrônico primeiro em todas as fontes (pelo nome, `ehEletronico`); sem nenhum, sai o de sempre. Medido antes: 4 eletrônicos em 14 posts. Convite diário (17/10, `GARIMPO_CONVITE_HORA`, 19h): pede no grupo para compartilhar, com `temdescontos.com.br/grupo?de=indicacao`. Sugestão de status (17/10, `GARIMPO_STATUS_HORA`, 12h): a oferta de maior % OFF do dia até ali vai para o rascunho com `?de=status` no fim, para o Wellington encaminhar para o status dele (o status do número do robô quase ninguém vê). `GRUPO_LINK` troca o link do grupo; 0 desliga cada um. Resumo das 22h com painel (17/10): membros do grupo (Z-API `light-group-metadata`, soma os grupos de `GRUPO_OFERTAS`) com a diferença do dia e de 7 dias, cliques no convite por origem e as 3 ofertas mais clicadas (diferença dos contadores do encurtador para a foto da véspera em `mem.historico`), e vendas da Shopee do dia (`conversionReport`: pedidos, valor e comissão estimada; são todas as suas vendas de afiliado da Shopee). Domingo: membros dia a dia. O que falhar fica de fora. Amazon, ML e Magalu: só no painel de cada loja. Loja confiável na Shopee (18/10): pela API (`ratingStar`, `sales`, `shopType`), produto da Shopee só sai com nota de 4,5 para cima (`GARIMPO_SHOPEE_NOTA_MIN`) e 50 vendas ou mais (`GARIMPO_SHOPEE_VENDAS_MIN`, 0 desliga); de R$1.000 para cima (`GARIMPO_SHOPEE_CARO`), só de loja oficial (tipo 1) ou indicada (tipos 2 e 4). Vale para a lista oficial e para Shopee vinda de canal; o descarte aparece no resumo. Amazon: confere preço e usa título e foto oficiais. Mercado Livre de catálogo (/p/MLB): confere preço, nome e foto pela API (fluxo 04; anúncio comum MLB-123 a API não abre). Travas (16/10): link com produto diferente do texto (nome ou quantidade) não sai; ML sem como conferir só se o post tiver até 30 min (`GARIMPO_IDADE_SEM_CONFERIR`); "De" do canal com mais de 70% OFF sem a loja confirmar sai do post. Às 22h manda o resumo do dia (postados por loja, descartes por motivo) no rascunho. Rodada na mão não posta. O 01 foi republicado em 17/10 com a lib atual |
| 04 Mercado Livre | `s3ybSgtGEWoPM3x5` | PUBLICADO 16/10. Acesso OAuth à API do ML (app no ML Developers; `ML_APP_ID` e `ML_SECRET` no Railway). Webhooks: `ml-autorizar` (página com o botão; o dono autoriza uma vez), `ml-retorno` (troca o código e guarda o token na memória do fluxo, só a primeira conta), `ml-token` (entrega o token com o cabeçalho `x-chave` = sha256 de `ml-token:` + ML_SECRET). Renova de hora em hora. Lib: `lib/mercadolivre.mjs` |
| 96 Ensaio: lê um post do canal | `V0XEygzTlePVkDCY` | manual; investigar post errado (preço e foto na página da Amazon) |
| 97 Ensaio: de onde tirar ofertas | `dg95IghMfsJGlosW` | manual |
| 98 Ensaio: abre link curto | `dtJ7lwTKLItlckuD` | manual |
| 99 Diagnóstico | `ACXO2u8Hk4mjaxmm` | manual; rodar depois de mudar variável |

**Grupos (18/10):** `GRUPO_RASCUNHO` = Rascunho, `GRUPO_OFERTAS` = o grupo que era de teste e virou o oficial (17/10, com foto, nome e descrição; 14 membros em 17/10). O perfil do número do robô já se chama "Tem Descontos Oferta..."; se aparecer outro nome num celular, é o contato salvo na agenda daquele celular. Configuração do grupo recomendada: só admins editam e "Adicionar membros" desligado para membros.

**Railway (18/10):** todas as variáveis opcionais foram criadas com o valor padrão (lista em PLANEJAMENTO.md), menos `GARIMPO_PROIBIDO` (apagada de propósito), `ML_RETORNO` e `ML_TOKEN_URL`. `GARIMPO_POR_DIA=40` desde 15/10.

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
