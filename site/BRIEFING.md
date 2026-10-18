# Briefing: site do Tem Descontos (grupo de ofertas no WhatsApp)

Tudo o que se sabe, o que falta e as regras do segmento. Quem abre esta pasta lê isto primeiro
(CLAUDE.md, "Comece por aqui"). Dado confirmado vai para `src/data/`; aqui fica de onde veio.

Criado em 16/10/2026 a partir do site-modelo do fabrica-sites (motor 2e80b5e), dentro do repo do
robô (`LINKSDEAFILIADOS/site`), porque o site e o encurtador dividem o domínio.

## 1. O que já sabemos (não perguntar de novo)

- Nome e atividade: Tem Descontos, grupo de ofertas no WhatsApp (chat, 16/10/2026).
- Domínio: `temdescontos.com.br`, comprado no Registro.br em 16/10/2026, DNS no Cloudflare.
- Lojas: Amazon, Mercado Livre, Shopee e Magalu, todas com programa de afiliado aprovado (05/10/2026).
- Horário das ofertas: 8h às 22h (padrão do robô, `GARIMPO_INICIO` e `GARIMPO_FIM`, 16/10/2026).
- O que o robô confere antes de postar: `lib/ofertas.mjs` (lista nos guias, conferida no código em 16/10/2026).
- WhatsApp: não há número de atendimento no site. O botão leva ao grupo. O número do robô fica separado.
- Logo: arquivo mandado em 16/10/2026, guardado em `assets/logo/tem-descontos-original.jpg`
  (1600x893, fundo branco). Recortes com fundo transparente em `public/logo/` (logo inteiro e só o
  monograma, cada um também na versão clara, com o marinho em branco, para fundo escuro).
- Público: quem compra nas grandes lojas pelo celular e quer promoção sem cair em golpe.

## 2. O que falta

Legenda: [ ] pendente · [x] resolvido · [~] parcial

### Para ir ao ar
- [x] 1. Domínio: temdescontos.com.br (16/10/2026).
- [x] 2. Projeto no Cloudflare Pages (`linksdeafiliados`), `www.temdescontos.com.br` ativo com SSL (16/10/2026).
- [x] 3. `SITE_URL` no ENCURTADOR (16/10/2026). Conferido pelo n8n: raiz 301 para o www com o `?utm`, código vencido 302 para `/oferta-encerrada`, `/grupo` 302 para o convite, link curto 302 para a loja.
- [x] 4. `CONVITE_GRUPO`: o grupo que já estava configurado virou o oficial (17/10, decisão do Wellington).
- [ ] 5. Search Console com o domínio, para tirar o `noindex` no lançamento.

### Marca
- [x] 6. Arquivo do logo (16/10/2026): recortado e com as cores medidas. Se houver versão em SVG
  ou PNG maior, trocar o original e refazer os recortes (ficam mais nítidos em tela grande).
- [x] 7. Instagram `@temdescontos` (16/10/2026). Bio do perfil: `www.temdescontos.com.br/links`. Outras redes (TikTok, Canal do WhatsApp) entram em `SITE.redes` quando existirem.
- [x] 8. `contato@temdescontos.com.br` (16/10/2026): Email Routing do Cloudflare, encaminha para o Gmail. Só recebe; para responder com o endereço, trocar por uma caixa (Zoho, Workspace) e desligar o encaminhamento.

### Conteúdo e aprovação
- [x] 9. Assina como Wellington Santos, com os dados do site da Virtus (decisão do Wellington, 18/10/2026: "pode usar meus dados como autoridade").
- [ ] 10. Ler e aprovar os 3 guias (preenche `revisadoEm`) e a política de privacidade.
- [ ] 11. Conferir no painel do Programa de Associados da Amazon a frase obrigatória de associado
  (usada no rodapé: "Como Associado da Amazon, recebo por compras qualificadas."). NÃO CONFIRMEI a
  redação exata (portal fora do alcance em 16/10/2026).
- [~] 12. Blog: 10 posts escritos em 18/10/2026, com "revisão pendente" até o Wellington ler e conferir as fontes da lista em `DOCS/REVISAO-BLOG.md`.

## 3. Identidade

- Cores medidas no arquivo do logo (16/10/2026): marinho `#032451` (TEM DESCONTOS, também o texto),
  azul `#094f82` (alto do T), laranja claro `#fd9c1a`, laranja `#f26027` e vermelho `#d2212b` (o D).
  CTA em degradê `#d93d1c` para `#c81e28` (branco por cima: 4,53:1 e 5,72:1). Contrastes em `globals.css`.
- Fontes: Montserrat (títulos; é a família do TEM DESCONTOS do logo) e Figtree (texto).
- No topo, o logo vai deitado (monograma + TEM DESCONTOS em texto), porque empilhado ele fica
  ilegível em 64 px de altura. Rodapé, /links e Sobre usam o logo inteiro.
- Hero com conteúdo real: a ficha das conferências do robô, em vez de foto (não há foto de produto
  própria, e preço da Amazon no site é proibido, §4).

## 4. Regras do segmento (afiliado, conferidas em 16/10/2026)

- Divulgação de afiliado: links identificados como de afiliado no rodapé de todas as páginas,
  com a frase de associado da Amazon (Contrato Operacional do Programa de Associados; pendência 11).
- CONAR, Guia de Publicidade por Influenciadores: link com comissão é publicidade. No site, o aviso
  do rodapé; nos posts de rede social, "#publi" (decisão do Wellington, 16/10/2026); no WhatsApp, não vai.
- Preço de produto da Amazon no site: NÃO. A política do Programa de Associados só aceita preço vindo
  da Amazon e atualizado. Site e blog falam de como conferir, nunca "custa R$ X".
- Preço anunciado vincula (CDC, art. 30) e publicidade enganosa é proibida (art. 37): os guias
  explicam isso e o robô já confere o preço na loja.
- Promessa: nada de "menor preço garantido". Urgência só se a loja disser.

## 5. Decisões e histórico

- 16/10/2026, Claude (a confirmar com o Wellington): o site mora no `www.temdescontos.com.br`
  (Cloudflare Pages); o domínio sem www continua no encurtador do Railway, para os links curtos das
  ofertas (`temdescontos.com.br/a7k2p`) não ganharem um salto a mais. Com `SITE_URL`, o encurtador
  manda a raiz e qualquer caminho que não é link curto para o www, e código vencido para `/oferta-encerrada`.
- 16/10/2026: o botão verde do modelo (conversa no WhatsApp) virou "Entrar no grupo", passando por
  `temdescontos.com.br/grupo?de=<origem>`: o convite troca sem mexer no site, e o encurtador conta
  de qual página veio cada entrada (`/api/cliques`, campo `grupo`).
- 16/10/2026: as "páginas de serviço" do modelo viraram guias, na rota `/guias/{slug}`.
- 16/10/2026: blog pronto e vazio. A página do post fica em `src/app/blog/_post/[slug]` até o
  primeiro post (o export estático não aceita rota dinâmica sem página).
