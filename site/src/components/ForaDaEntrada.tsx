"use client";

import { usePathname } from "next/navigation";

// Some na pagina /entrar (17/11): quem chega do anuncio tem uma coisa so para fazer, entrar no grupo.
// Menu, botao do topo e botao flutuante levavam a pessoa para outro lugar ou repetiam o botao.
export default function ForaDaEntrada({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname && pathname.startsWith("/entrar")) return null;
  return <>{children}</>;
}
