# Reels em Remotion

Reels do Instagram feitos por codigo (React + Remotion), com narracao, legenda sincronizada e efeitos sonoros.

- `timeline.json` / `timeline-preco.json`: todos os tempos de cada video. Imagem e som leem o mesmo arquivo.
- `src/ArrependimentoPersonagens.tsx`: Reel dos 7 dias, com personagens do LottieFiles (`src/lottie/`, ver CREDITOS.md).
- `src/Preco.tsx`: Reel "50% sobre qual preco?", tambem com personagens do LottieFiles.
- `src/Arrependimento.tsx`: versao antiga com boneco desenhado por codigo; fornece titulo, legenda e cartoes aos outros.
- `src/palavras*.json`: tempo de cada palavra da narracao (ElevenLabs), usado na legenda.
- `public/<video>/voz.mp3`: narracao (ElevenLabs, voz Monica, modelo eleven_v4; o v2 ficou pior e foi descartado).
  O tempo das palavras vem do alinhamento forcado do ElevenLabs sobre o mesmo audio.
- `sfx/sint.mjs` + `sfx/<video>.mjs`: efeitos sonoros sintetizados por codigo, sem arquivos de terceiros.

## Como gerar

```
npm install
npm run som:preco      # efeitos + mistura com a voz (precisa de ffmpeg)
npm run render:preco   # grava site/public/instagram/reel-dica-historico-de-preco.mp4
```

Licenca do Remotion: gratuita para pessoa fisica e empresas de ate 3 pessoas (remotion.dev/license).
