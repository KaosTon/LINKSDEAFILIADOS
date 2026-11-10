# Criativos dos anúncios da Meta

- `a1.html` e `a2.html`: fonte dos criativos (1080x1350). Gerar o JPG com o Chromium (Playwright),
  captura da página em 1080x1350, qualidade 80.
- Os JPG publicados ficam em `site/public/anuncios/` (a Meta baixa de lá na criação do anúncio).
- Regras: sem preço exato, sem preço da Amazon, sem promessa nem urgência. Porcentagem só de
  oferta que saiu de verdade no grupo, com a data na nota do rodapé.
- Campanha `TD | Comunidade | Teste 01` (criada pausada em 09/11/2026): tráfego para
  `www.temdescontos.com.br/entrar?c=a1` e `?c=a2`. O clique no botão é contado pelo encurtador
  (`de=anuncio:a1`) e aparece no resumo das 22h.

## Vídeos

- `video-v1.html`: Reels de 18 s (1080x1920, 30 fps), desenhado quadro a quadro por `render(t)`.
  Gerar o MP4 com o `capture.py` da skill html-video:
  `python capture.py video-v1.html saida.mp4` (precisa de Playwright com Chromium e ffmpeg).
- Sem áudio: a trilha entra no Instagram ou no CapCut, onde a música é licenciada.
- `video-v2.html`: Reels de 15 s com a gravação real do grupo no meio. Os quadros vêm de uma gravação de tela
  (`quadros-v2/`, fora do repo): `ffmpeg -ss 1.5 -t 4.5 -i gravacao.mp4 -vf "fps=40,crop=1320:2610:0:170,scale=760:-2" -q:v 3 quadros-v2/q%03d.jpg`.
  Cortar a gravação antes de aparecer número de telefone (aviso de quem entrou) e produto da Amazon.
- O MP4 não fica no repo: é gerado a partir do HTML.
