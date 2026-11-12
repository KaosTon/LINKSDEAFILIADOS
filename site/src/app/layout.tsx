import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AvisoCookies from "@/components/AvisoCookies";
import Medicao from "@/components/Medicao";
import WhatsCliques from "@/components/WhatsCliques";
import WhatsFlutuante from "@/components/WhatsFlutuante";
import { SchemaOrganizacao } from "@/components/Schemas";
import { SITE } from "@/data/site";
import "./globals.css";

// Par de fontes do Tem Descontos: Montserrat (titulos; e a familia do TEM DESCONTOS do logo, o TEM
// em italico e o DESCONTOS em extra negrito) e Figtree (texto). Fora do Inter e do par da Michele.
// Arquivos no repo (src/fonts, versao variavel, so latin, licenca OFL ao lado) desde 12/11/2026: com
// next/font/google o build baixava a fonte do Google e caiu quando o download falhou (PR #33).
const figtree = localFont({
  src: [{ path: "../fonts/figtree-latin-wght-normal.woff2", weight: "300 900", style: "normal" }],
  variable: "--font-figtree",
  display: "swap",
});

const montserrat = localFont({
  src: [
    { path: "../fonts/montserrat-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../fonts/montserrat-latin-wght-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.tituloSeo,
  description: SITE.descricao,
  // No Google desde 19/10/2026 (lancamento, pedido do Wellington). Post sem revisao do autor fica
  // fora (noindex na propria pagina, src/app/blog/[slug]/page.tsx) ate ter `revisadoEm`.
  // max-image-preview:large (11/11/2026): sem isso o Google não mostra a capa grande no Discover nem na busca.
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  twitter: { card: "summary_large_image" },
  openGraph: {
    title: SITE.tituloSeo,
    description: SITE.descricao,
    type: "website",
    locale: "pt_BR",
    siteName: SITE.nome,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} ${montserrat.variable}`}>
      <body className="min-h-screen flex flex-col">
        <SchemaOrganizacao />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsFlutuante />
        <WhatsCliques />
        <AvisoCookies />
        <Medicao />
      </body>
    </html>
  );
}
