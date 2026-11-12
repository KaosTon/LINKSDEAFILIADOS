# Reels em Remotion

Reels do Instagram feitos por codigo (React + Remotion), com narracao, legenda sincronizada e efeitos sonoros.

- `timeline.json`: todos os tempos do video. Imagem e som leem o mesmo arquivo, entao nunca saem de sincronia.
- `src/Boneco.tsx`: o personagem (poses, expressoes, piscada, pulo).
- `src/ArrependimentoPersonagens.tsx`: o Reel dos 7 dias que vai ao ar, com personagens do LottieFiles (`src/lottie/`, ver CREDITOS.md).
- `src/Arrependimento.tsx`: versao anterior com o boneco desenhado por codigo; ainda fornece titulo, legenda e cartoes.
- `src/palavras.json`: tempo de cada palavra da narracao (alinhamento do ElevenLabs), usado na legenda.
- `public/voz.mp3`: narracao gerada no ElevenLabs (voz Monica).
- `sfx/gerar.mjs`: efeitos sonoros sintetizados por codigo, sem arquivos de terceiros.

## Como gerar

```
npm install
npm run som      # efeitos + mistura com a voz (precisa de ffmpeg)
npm run render   # grava site/public/instagram/reel-dica-arrependimento.mp4
```

Licenca do Remotion: gratuita para pessoa fisica e empresas de ate 3 pessoas (remotion.dev/license).
