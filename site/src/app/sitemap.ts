import type { MetadataRoute } from "next";
import { POSTS } from "@/data/blog";
import { PAGINAS_SERVICO } from "@/data/paginas-servico";
import { SITE } from "@/data/site";

// Export estatico (Cloudflare Pages): gerado uma vez no build.
export const dynamic = "force-static";

// Prioridade real (DOCS/METODO.md §2.2): home e paginas de servico em cima.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: "monthly", priority: 1 },
    ...PAGINAS_SERVICO.map((p) => ({
      url: `${SITE.url}/guias/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${SITE.url}/sobre`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/politica-de-privacidade`, changeFrequency: "yearly", priority: 0.2 },
    ...POSTS.map((p) => ({
      url: `${SITE.url}/blog/${p.slug}`,
      lastModified: p.dataPublicacao,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
