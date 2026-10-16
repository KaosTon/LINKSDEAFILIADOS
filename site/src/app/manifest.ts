import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";
import { CORES } from "@/data/tema";

// Export estatico (Cloudflare Pages): gerado uma vez no build.
export const dynamic = "force-static";

// Nome e cores quando alguem salva o site na tela inicial do celular.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.nome}, ${SITE.titulo}`,
    short_name: SITE.nome.slice(0, 12),
    start_url: "/",
    display: "browser",
    background_color: CORES.fundo,
    theme_color: CORES.escuro,
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
