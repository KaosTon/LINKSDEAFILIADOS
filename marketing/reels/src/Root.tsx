import React from "react";
import { Composition } from "remotion";
import { Arrependimento } from "./Arrependimento";
import TL from "../timeline.json";

export const Root: React.FC = () => (
  <Composition
    id="Arrependimento"
    component={Arrependimento}
    durationInFrames={Math.round(TL.duracao * TL.fps)}
    fps={TL.fps}
    width={1080}
    height={1920}
  />
);
