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
| 03 Garimpo automático | `w7x4LWl6wiBWRZDB` | subido, NÃO publicado. Rodar na mão mostra o que sairia (ensaio 06/10: post do @cupomonline virou Amazon com a tag dele). Só posta com `GARIMPO_LIGADO=sim` |
| 97 Ensaio: de onde tirar ofertas | `dg95IghMfsJGlosW` | manual; ML /ofertas e Amazon /deals abrem do Railway, Magalu e API do ML não |
| 98 Ensaio: abre link curto | `dtJ7lwTKLItlckuD` | manual; mostra os saltos de um link e o que o nó Code tem (URL, require) |
| 99 Diagnóstico | `ACXO2u8Hk4mjaxmm` | manual; rodar depois de mudar variável |
| 01 Entrada (rascunho -> grupo) | `Q29NVtchUBdLaeKH` | subido SEM o CUPOM e sem o `converterLink` (falta subir a versão de 06/10 da lib), NÃO publicado: publicar quando a Z-API estiver nas variáveis. Webhook: `/webhook/ofertas-zapi` |
