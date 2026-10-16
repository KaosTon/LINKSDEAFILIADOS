# Site do Tem Descontos

Next.js (App Router) + Tailwind v4, exportado como site estático (`out/`) e hospedado no
Cloudflare Pages em `www.temdescontos.com.br`. Nasceu do site-modelo do
[fabrica-sites](https://github.com/KaosTon/fabrica-sites).

Leia primeiro o [BRIEFING.md](BRIEFING.md) e o [CLAUDE.md](CLAUDE.md).

## Rodar

```bash
cd site
npm ci
npm run dev                              # http://localhost:3000
npm run build                            # travas + build + pos-export (pasta out/)
npx wrangler pages dev out --port 8788   # o site como vai ficar no Cloudflare
```

## Onde mexer

| O que | Onde |
|---|---|
| Nome, lojas, link do grupo, guias, autor, FAQ, aviso de afiliado | `src/data/site.ts` |
| Texto das seções da home | `src/data/home.ts` |
| Guias (`/guias/...`) | `src/data/paginas-servico.ts` |
| Posts do blog | `src/data/blog.ts` + índice em `DOCS/BLOG.md` |
| Origem de cada botão "Entrar no grupo" | `src/data/whatsapp.ts` |
| Cores | `src/app/globals.css` + `src/data/tema.ts` (iguais; trava `check-tema`) |
| Marca (monograma TD) | `src/components/Marca.tsx` |
| Fontes | `src/app/layout.tsx` (e `assets/fonts` para ícone e imagem de compartilhamento) |

## Travas do build

`check-modelo`, `check-tema`, `check-copy`, `check-links-internos`, `check-markdown`,
`check-indice-blog`, `check-whatsapp`, `check-paginas`; depois do build, `pos-export`. O que cada
uma barra: `metodo/METODO.md` §5 do fabrica-sites.
