"use client";

import { useSyncExternalStore } from "react";
import { ENTRAR } from "@/data/entrar";

// Aviso embaixo do botao da /entrar (18/11): quem entra no grupo nao ve as mensagens antigas.
// O site e estatico: a hora so existe no navegador. No HTML pronto (e sem JavaScript) fica o texto do dia;
// no navegador, das 23h30 as 8h de Brasilia, entra o da noite.
function horaDeBrasilia(agora: Date) {
  const [h, m] = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hour12: false })
    .format(agora)
    .split(":")
    .map(Number);
  return (h % 24) + m / 60;
}

const semAssinatura = () => () => {};
const ehNoite = () => {
  const h = horaDeBrasilia(new Date());
  return h >= ENTRAR.chegada.noiteDe || h < ENTRAR.chegada.noiteAte;
};

export default function AvisoDeChegada({ className }: { className?: string }) {
  const noite = useSyncExternalStore(semAssinatura, ehNoite, () => false);
  return <p className={className}>{noite ? ENTRAR.chegada.noite : ENTRAR.chegada.dia}</p>;
}
