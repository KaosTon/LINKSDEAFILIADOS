# Lições do NetMax (n8n + Z-API), para não pagar de novo

Cada item aconteceu de verdade no projeto da Juliana (NetMax, set/2026). O
que vale aqui é o mesmo: n8n, Z-API, nó Code, variáveis de ambiente.

## Variáveis de ambiente

- **URL com caminho duplicado.** O `SUPABASE_URL` estava com `/rest/v1` no
  fim, e os fluxos acrescentavam `/rest/v1` de novo: toda chamada dava 404,
  calada, em todos os fluxos. Mesma armadilha com a Z-API: `ZAPI_BASE_URL` é
  só o host (`https://api.z-api.io`); instância e token entram por variável
  própria. Regra: variável de endereço é só o endereço base, sem barra no fim.
- **Fuso.** Sem `GENERIC_TIMEZONE` e o fuso nas configurações do fluxo, o
  agendamento das 9h sai às 6h.
- **Chave de criptografia.** Sem `N8N_ENCRYPTION_KEY` fixa, recriar o
  container apaga todas as credenciais.
- **`$env` no nó Code** só funciona se a instância não bloquear. No n8n do
  Railway (06/10) veio bloqueado por padrão: "access to env vars denied", e o
  erro escapa até de `try`. Precisa de `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`
  nas variáveis do serviço. O fluxo 99 (diagnóstico) confere.

## Z-API

- **200 não quer dizer que saiu.** A Z-API responde 200 com erro no corpo.
  Mensagem enviada é a que volta com `zaapId` ou `messageId`; o resto é falha.
- **Um lugar só envia.** Um fluxo de saída (gateway) recebe "mande isto para
  tal número", envia, confere o id, tenta de novo se a rede falhar e avisa
  quando não sai. Os outros fluxos chamam o gateway. Quando a regra de envio
  muda, muda num lugar.
- **O robô ouve o que ele mesmo mandou.** Com "Notificar as enviadas por mim"
  ligado, cada mensagem do robô volta pelo webhook. Sem filtro, o robô
  responde a si mesmo. Aqui: ignorar `fromMe` e tudo que não for do grupo
  rascunho.
- **Partes em sequência.** Duas mensagens disparadas juntas chegam fora de
  ordem. Entre uma e outra, uma pausa curta.

## n8n e o Workflow SDK

- **Opção fora do lugar some calada.** `retryOnFail`, `maxTries`, `onError`,
  `alwaysOutputData` e as credenciais vão DENTRO de `config` do nó. Fora, o
  SDK descarta sem erro. O `compilar.mjs` daqui recusa chave desconhecida.
- **Fluxo publicado que é editado vira rascunho.** O que roda continua sendo
  a versão antiga até publicar de novo.
- **Erro engolido é erro escondido.** Nó que trata erro devolve o motivo num
  campo; e todo fluxo aponta para um fluxo de erro que avisa no WhatsApp.
- **Ids estáveis.** O compilador gera o id do nó a partir do nome: reimportar
  uma versão nova não vira "outro nó".

## Testes

- Toda lógica de nó Code vira função testada offline (`lib/` e
  `testes/bateria/`). O `executar.mjs` roda o código do nó com HTTP falso.
- **Teste novo tem que falhar no código antigo.** Se passa nos dois, não
  testa nada.
- **Vigias do repositório:** `sem-dado-real` (telefone de verdade não entra)
  e `sem-travessao`.

## Segurança

- Token, chave ou senha colados no chat ou num print: trocar na hora.
- Segredo mora em variável do n8n, nunca no código nem no git.
- Site de loja costuma bloquear servidor de datacenter. Não montar o robô
  dependendo de ler página de loja: nome, foto e preço vêm de você ou da API
  oficial do programa de afiliados.

## Deste projeto

- **O nó Code do n8n não tem `URL` global** (nem `URLSearchParams`), e o
  módulo `url` vem bloqueado. A bateria passava porque roda no Node, onde o
  `URL` existe. Agora o simulador (`testes/bateria/executar.mjs`) esconde o
  `URL` e bloqueia módulos como o n8n, e a lib usa `novaURL` com
  `require('url')`. Antes de confiar numa bateria, rodar um ensaio no n8n de
  verdade (fluxo 98) para ver o que o ambiente tem.
