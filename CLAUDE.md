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
| 02 Gateway de saída (Z-API) | `0lJeNYqZyDG9Rq2J` | subido, sub-fluxo (não precisa publicar). A lib colada nele é de antes do `novaURL`; o que ele usa (pedidoZapi, idDoEnvio) não mudou. Subir de novo na próxima mudança do 02 |
| 03 Garimpo automático | `w7x4LWl6wiBWRZDB` | atualizado 06/10 (legenda dos grupos, IA, ML). NÃO publicado. Rodar na mão mostra o que sairia (ensaio 06/10: post do @cupomonline virou Amazon com a tag dele). Só posta com `GARIMPO_LIGADO=sim` |
| 97 Ensaio: de onde tirar ofertas | `dg95IghMfsJGlosW` | manual; ML /ofertas e Amazon /deals abrem do Railway, Magalu e API do ML não |
| 98 Ensaio: abre link curto | `dtJ7lwTKLItlckuD` | manual; mostra os saltos de um link e o que o nó Code tem (URL, require) |
| 99 Diagnóstico | `ACXO2u8Hk4mjaxmm` | manual; rodar depois de mudar variável |
| 01 Entrada (rascunho -> grupo) | `Q29NVtchUBdLaeKH` | subido SEM o CUPOM e sem o `converterLink` (falta subir a versão de 06/10 da lib), NÃO publicado: publicar quando a Z-API estiver nas variáveis. Webhook: `/webhook/ofertas-zapi` |

**Antes de ligar a Z-API:** subir de novo os fluxos 01, 02 e 03 com a lib
atual (`node infra/n8n/compilar.mjs`; o jsCode sai de `infra/n8n/exports/`).
O 02 ganhou as entradas `link` e `titulo` (send-link com plano B em
send-image) e o 03 passa esses dois; os três precisam subir juntos.
