import React from "react";
import { Composition } from "remotion";
import { Arrependimento } from "./Arrependimento";
import { ArrependimentoPersonagens } from "./ArrependimentoPersonagens";
import { Preco } from "./Preco";
import TLpreco from "../timeline-preco.json";
import { Anuncio, duracaoDe } from "./Anuncio";
import TL from "../timeline.json";

export const Root: React.FC = () => (
  <>
  {(["v1", "a", "b", "c"] as const).map((v) => (
    <Composition key={v} id={`Anuncio-${v}`} component={Anuncio} defaultProps={{ v }} durationInFrames={duracaoDe(v)} fps={30} width={1080} height={1920} />
  ))}
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
