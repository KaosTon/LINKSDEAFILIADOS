# Site do Tem Descontos

Site feito na fábrica de sites do Wellington (repo `KaosTon/fabrica-sites`). O padrão de qualidade
e as regras de trabalho moram lá; esta pasta tem o site e o conteúdo do Tem Descontos. Ela fica
dentro do repo do robô (`LINKSDEAFILIADOS`), que trabalha direto no `main`.

## Comece por aqui, sempre
1. Leia `BRIEFING.md` inteiro: o que já se sabe (não perguntar de novo), o que falta, as regras do
   segmento (§4) e o que já foi decidido (§5).
2. Leia o `metodo/METODO.md` do fabrica-sites: SEO medido, blog, design sem cara de IA, travas.
3. Dado só existe em `src/data/`. Nunca escrever nome, loja, horário ou link solto em componente.
4. O que o site diz sobre o robô (conferências, lojas, horário) sai do código do robô
   (`lib/ofertas.mjs`, `infra/n8n/sdk/03-garimpo.js`, `encurtador/servidor.mjs`). Mudou lá, muda aqui.

## O que é motor e o que é deste site

`fabrica.json` lista os arquivos do MOTOR. Eles chegam do fabrica-sites (`atualizar-motor`).
**Não editar motor aqui**, com duas exceções feitas em 16/10/2026 (também em `fabrica.json`,
campo `alteradoAqui`), que precisam virar opção na fábrica antes de o próximo `atualizar-motor`
sobrescrever:
- `scripts/check-links-internos.mjs`: aceita a rota `/guias/[slug]` além de `/servicos/[slug]`.
- `src/lib/fontes-og.ts`: `fontesOg()` lê a Montserrat (no modelo, `fontesCormorant()`) e `logoOg()` põe o logo nas imagens geradas.

Outras diferenças do modelo, todas fora do motor: o botão verde abre o grupo (`linkWhats` em
`site.ts` leva a `temdescontos.com.br/grupo?de=`), as páginas de serviço são guias
(`src/app/guias/[slug]`), não há unidades, e o schema é `Organization` + `WebSite`.

## Onde estamos (atualizar a cada entrega)
- 16/10/2026: site criado (motor 2e80b5e). Home, 3 guias, Sobre, Blog (vazio), /links,
  /oferta-encerrada, 404 e política de privacidade. Build com todas as travas passando; conferido no
  `wrangler pages dev` em 1280 e 390, console sem erro. `noindex` ligado. No ar no mesmo dia em
  `www.temdescontos.com.br` (Cloudflare Pages) e com `SITE_URL` no encurtador. Falta: BRIEFING §2.
- Primeiro post: mover `src/app/blog/_post/[slug]` para `src/app/blog/[slug]` (o export estático
  não aceita rota dinâmica sem página). Depois seguir `DOCS/BLOG.md`.

## Caminho de volta para a fábrica (obrigatório ao fechar qualquer trabalho)

Antes de fechar uma entrega, responder: **"isso serve para outros sites?"**

| O que mudou | Para onde vai |
|---|---|
| Código de motor | PRIMEIRO na fábrica (`inicial/`), depois desce pelo `atualizar-motor`. |
| Lição de processo, SEO, design ou conversão | PR na fábrica: `metodo/METODO.md`, com data e número medido. |
| Regra de um segmento | PR na fábrica: `metodo/SEGMENTOS.md` (afiliado ainda não tem linha lá). |
| Hospedagem, domínio, DNS, Cloudflare | PR na fábrica: `metodo/HOSPEDAGEM.md`. |
| Texto, foto, cor, página ou dado só deste site | Fica aqui. |

Para subir (não feito ainda, 16/10/2026): as duas alterações de motor acima como opção; a linha
"afiliado" em SEGMENTOS (§4 do BRIEFING); e a lição "rota dinâmica sem página quebra o export
estático" (blog vazio), com a saída da pasta privada `_post`.

## Regras de trabalho
- Sem travessão (traço longo) em copy nem em código.
- Não inventar dado. Se não está em `src/data/` nem no BRIEFING, é PENDENTE.
- Preço de produto da Amazon nunca no site (BRIEFING §4).
- `robots: noindex` (em `src/app/layout.tsx`) até o lançamento.
- `npm run build` tem que passar antes de subir (travas, type-check e pós-export).
- Conferir no simulador do Cloudflare: `npx wrangler pages dev out --port 8788`. Foto em 1280 e
  390, console sem erro.

## Hospedagem (Cloudflare Pages, ainda não criado)

Domínio sem www = encurtador (Railway, já no ar). `www` = este site (Pages). Passo a passo:
1. Cloudflare → Workers e Pages → Criar aplicativo → link "Continuar para o Pages" → Importar
   repositório Git → `KaosTon/LINKSDEAFILIADOS`.
2. Build: predefinição Nenhum; comando `npm run build`; saída `out`; **diretório raiz `site`**;
   variável `NODE_VERSION` = `22`. Em Configurações → Build → caminhos observados, incluir só `site/*`
   (assim commit do robô não refaz o site).
3. Domínios personalizados → `www.temdescontos.com.br` (o Cloudflare cria o CNAME sozinho).
   NÃO adicionar o domínio sem www no Pages: ele é do encurtador.
4. Railway → ENCURTADOR → Variables → `SITE_URL` = `https://www.temdescontos.com.br`.
5. Web Analytics: token em `NEXT_PUBLIC_CF_BEACON` (Produção) e refazer o deploy.
6. Conferir: `curl -sI https://temdescontos.com.br/?utm_source=t` dá 301 para o www com o `?utm`.

@AGENTS.md
