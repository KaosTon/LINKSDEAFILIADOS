import type { Metadata } from "next";
import { Figtree, Montserrat } from "next/font/google";
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
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["500", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.tituloSeo,
  description: SITE.descricao,
  // SITE EM CONSTRUCAO: fica fora do Google ate o lancamento. Remover ao publicar.
  robots: { index: false, follow: false },
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
