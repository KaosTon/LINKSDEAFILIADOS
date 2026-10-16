"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Menu do celular. <details> abre e fecha sem depender de JavaScript; o JavaScript aqui so
// fecha o menu quando a pagina muda (o topo nao recarrega na navegacao do Next e o menu
// ficaria aberto em cima da pagina nova). Ate 25/09/2026 o celular ficava sem menu nenhum.
export default function MenuCelular({ links }: { links: { label: string; href: string }[] }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);

  return (
    <details ref={menu} className="md:hidden group relative">
      <summary
        className="list-none cursor-pointer w-10 h-10 rounded-full border border-tinta/15 flex items-center justify-center [&::-webkit-details-marker]:hidden"
        aria-label="Menu"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path className="group-open:hidden" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          <path className="hidden group-open:block" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </summary>
      <nav aria-label="Menu do celular" className="absolute right-0 top-12 w-56 rounded-2xl bg-white border border-linha shadow-xl py-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => {
              // link pra ancora da mesma pagina nao muda o pathname: fecha na mao
              if (menu.current) menu.current.open = false;
            }}
            className="block px-5 py-3 text-tinta hover:bg-fundo hover:text-marca-escura"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
