import Link from "next/link";
import { MENU, SITE } from "@/data/site";
import { Logo } from "./Marca";
import MenuCelular from "./MenuCelular";
import WhatsTopo from "./WhatsTopo";

// Menu: MENU em src/data/site.ts (a trava de links confere cada rota).
const LINKS = MENU;

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-fundo/90 backdrop-blur border-b border-linha">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4 md:gap-6">
        <Link href="/" className="min-w-0" aria-label={`${SITE.nome}, início`}>
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm text-tinta-2" aria-label="Principal">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-marca-escura transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <WhatsTopo />
          <MenuCelular links={LINKS} />
        </div>
      </div>
    </header>
  );
}
