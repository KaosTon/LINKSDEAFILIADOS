"use client";

import { useEffect, useState } from "react";
import { IconeWhats } from "@/components/Icones";
import { linkWhats } from "@/data/site";
import { origemAnuncio } from "@/data/whatsapp";

// Botao da pagina /entrar. O anuncio chega com ?c=codigo-do-criativo; o botao leva essa origem ao
// encurtador (?de=anuncio:codigo), que conta o clique. Sem ?c= a origem e "anuncio".
// O site e estatico: o ?c= so existe no navegador, por isso o efeito.
export default function BotaoEntrar({ texto, className }: { texto: string; className?: string }) {
  const [href, setHref] = useState(linkWhats(origemAnuncio(null)));

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    if (c) setHref(linkWhats(origemAnuncio(c)));
  }, []);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      <IconeWhats />
      {texto}
    </a>
  );
}
