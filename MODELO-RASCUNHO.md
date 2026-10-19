# Como mandar oferta no Rascunho

Guia do Wellington para postar pelo grupo Rascunho sem sair torto no grupo de ofertas.
O robô lê o texto, troca os links pelos seus e monta o post no padrão do grupo.
Modelo testado em 19/10/2026 (`lerPost` e `legendaAchado`, `lib/ofertas.mjs`).

## O modelo (uma informação por linha, nesta ordem)

```
Soundbar JBL BAR 1000MK2 Dolby Atmos
De R$ 6.799 por R$ 3.799,90 no Pix
ou 12x de R$ 333,32 no cartão
Frete grátis para Prime
Cupom: JBL10
Link: https://amzn.to/xxxx
```

Sai no grupo assim:

```
44% OFF, CORRE

Soundbar JBL BAR 1000MK2 Dolby Atmos

💵 De R$6.799 por R$3.799,90 no Pix
💳 ou 12x de R$333,32 no cartão
🚚 Frete grátis para assinantes Prime
🛒 (seu link de afiliado)

🏷️ Use o cupom JBL10
```

## Linha por linha

1. **Nome do produto**, sozinho na primeira linha: sem emoji, sem preço, sem "Oferta:" na frente.
2. **Preço**: "De R$ X por R$ Y". Sem preço antigo, só "Por R$ Y". Pode terminar com "no Pix" ou "à vista".
3. **Parcelado** (opcional): "ou 12x de R$ Z no cartão".
4. **Frete** (opcional): "Frete grátis" ou "Frete grátis para Prime".
5. **Cupom** (opcional): "Cupom: CODIGO", código em maiúsculas.
6. **Link** por último: "Link: " e o link. Pode ser de outra pessoa ou de outro grupo: o robô troca pelo seu.

## O que não colocar

- Frases de efeito ("PREÇÃO!", "Menor valor postado!", "Corre que acaba"): o robô tira e cria a chamada dele.
- Promessa de menor preço ou urgência que a loja não disse (regra do grupo).

## Foto

- Pode mandar a foto junto (texto na legenda). Com marca de outro grupo, o robô troca pela foto da loja.
- Sem foto, ele busca a da loja (Amazon, Shopee e ML de catálogo). Anúncio comum do ML (/up/MLBU) não tem
  foto pela API: para foto boa, mande a foto do produto.

## Cupom sem produto

Comece a mensagem com "CUPOM" (ex.: "CUPOM MERCADO LIVRE" na primeira linha), com o código e o link embaixo.

## Encaminhar de outro grupo

Pode encaminhar direto, sem reescrever: na maioria das vezes sai certo. Formato novo que sair estranho:
mandar o print no chat do Claude, que vira correção e teste na bateria (`testes/bateria/ofertas.mjs`).
Casos já cobertos: negrito, riscado e itálico do WhatsApp; "CUPOM:" em maiúsculas; nome e preço na mesma
linha ("Nome | De R$X Por R$Y"); "Entrega Grátis" e "12x de R$" (19/10); linha de descrição antes do preço.
