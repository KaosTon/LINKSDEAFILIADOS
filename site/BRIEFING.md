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
- Logo: mandado no chat em 16/10/2026 (imagem, sem arquivo). TEM em marinho, DESCONTOS em marinho
  forte, monograma TD em degradê do marinho ao laranja e vermelho, etiqueta com % pendurada no D e brilhos.
- Público: quem compra nas grandes lojas pelo celular e quer promoção sem cair em golpe.

## 2. O que falta

Legenda: [ ] pendente · [x] resolvido · [~] parcial

### Para ir ao ar
- [x] 1. Domínio: temdescontos.com.br (16/10/2026).
- [ ] 2. Projeto no Cloudflare Pages ligado ao repo, pasta `site` (passo a passo no CLAUDE.md).
- [ ] 3. `SITE_URL=https://www.temdescontos.com.br` no serviço ENCURTADOR do Railway (a raiz passa a levar ao site).
- [ ] 4. `CONVITE_GRUPO` no Railway com o convite do grupo DE VERDADE (hoje pode ser o de teste).
- [ ] 5. Search Console com o domínio, para tirar o `noindex` no lançamento.

### Marca
- [ ] 6. Arquivo do logo (PNG transparente ou SVG) em `site/public/logo/`. Com ele: medir as cores
  (hoje escolhidas pela imagem do chat), conferir o desenho do monograma em `src/components/Marca.tsx`.
- [ ] 7. Instagram (e outras redes) da marca, para o rodapé, o /links e o schema.
- [ ] 8. E-mail de contato no domínio (ex.: contato@temdescontos.com.br), para a política de privacidade.

### Conteúdo e aprovação
- [ ] 9. Assinar os guias com o seu nome (E-E-A-T) ou deixar "Equipe Tem Descontos".
- [ ] 10. Ler e aprovar os 3 guias (preenche `revisadoEm`) e a política de privacidade.
- [ ] 11. Conferir no painel do Programa de Associados da Amazon a frase obrigatória de associado
  (usada no rodapé: "Como Associado da Amazon, recebo por compras qualificadas."). NÃO CONFIRMEI a
  redação exata (portal fora do alcance em 16/10/2026).
- [ ] 12. Primeiro post do blog (protocolo em `DOCS/BLOG.md`).

## 3. Identidade

- Cores (provisórias, da imagem do logo no chat, 16/10/2026; medir no arquivo, pendência 6):
  marinho `#1b2a5e`, laranja `#e8590c`, vermelho `#d6332a`; texto `#121a3a`; fundo `#f7f8fb`.
  CTA em degradê `#c2410c` para `#c62f22` (branco por cima: 5,18:1 e 5,48:1). Contrastes em `globals.css`.
- Fontes: Bricolage Grotesque (títulos, forte como o DESCONTOS do logo) e Figtree (texto). Fora do
  Inter e do par da Michele.
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
