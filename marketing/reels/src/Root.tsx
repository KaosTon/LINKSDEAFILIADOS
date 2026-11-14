import React from "react";
import { Composition } from "remotion";
import { Arrependimento } from "./Arrependimento";
import { ArrependimentoPersonagens } from "./ArrependimentoPersonagens";
import { Preco } from "./Preco";
import TLpreco from "../timeline-preco.json";
import { AnuncioV1 } from "./AnuncioV1";
import TLv1 from "../timeline-anuncio-v1.json";
import TL from "../timeline.json";

export const Root: React.FC = () => (
  <>
  <Composition id="AnuncioV1" component={AnuncioV1} durationInFrames={Math.round(TLv1.duracao * TLv1.fps)} fps={TLv1.fps} width={1080} height={1920} />
  <Composition id="Preco" component={Preco} durationInFrames={Math.round(TLpreco.duracao * TLpreco.fps)} fps={TLpreco.fps} width={1080} height={1920} />
  <Composition id="ArrependimentoPersonagens" component={ArrependimentoPersonagens} durationInFrames={Math.round(TL.duracao * TL.fps)} fps={TL.fps} width={1080} height={1920} />
  <Composition
    id="Arrependimento"
    component={Arrependimento}
    durationInFrames={Math.round(TL.duracao * TL.fps)}
    fps={TL.fps}
    width={1080}
    height={1920}
  />
  </>
);
