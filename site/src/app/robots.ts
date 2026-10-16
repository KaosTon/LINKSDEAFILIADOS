import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";

// Export estatico (Cloudflare Pages): gerado uma vez no build.
export const dynamic = "force-static";

// Rastreamento liberado: quem mantem o site fora do Google ate o lancamento e o
// `robots: noindex` do layout, e o Google so le esse aviso se puder rastrear a pagina.
export default function robots(): MetadataRoute.Robots {
  return {
    // Pasta de fotos de pacientes ou clientes (antes e depois), se o segmento permitir e o
    // cliente tiver: fora do Google Imagens, pra foto de uma pessoa nao aparecer solta numa busca.
    rules: { userAgent: "*", allow: "/", disallow: ["/resultados/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
