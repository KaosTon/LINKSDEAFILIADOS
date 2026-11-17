"use client";

import { useEffect, useState } from "react";
import { IconeWhats } from "@/components/Icones";
import { linkWhats } from "@/data/site";
import { origemAnuncio } from "@/data/whatsapp";

// Botao da pagina /entrar. O anuncio chega com ?c=codigo-do-criativo; o botao leva essa origem ao
// encurtador (?de=anuncio:codigo), que conta o clique. Sem ?c= a origem e "anuncio".
// O site e estatico: o ?c= so existe no navegador, por isso o efeito.
// Abre na mesma aba (17/11): no navegador do Instagram e do Facebook, aba nova as vezes nao abre o
// WhatsApp e a pessoa fica parada numa tela em branco.
export default function BotaoEntrar({ texto, className, id }: { texto: string; className?: string; id?: string }) {
  const [href, setHref] = useState(linkWhats(origemAnuncio(null)));

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    if (c) setHref(linkWhats(origemAnuncio(c)));
  }, []);

  return (
    <a id={id} href={href} className={className}>
      <IconeWhats />
      {texto}
    </a>
  );
}
