import { ImageResponse } from "next/og";
import { SITE } from "@/data/site";
import { CORES } from "@/data/tema";
import { fontesOg } from "@/lib/fontes-og";

// Export estatico (Cloudflare Pages): gerado uma vez no build.
export const dynamic = "force-static";

// Icone da aba: o monograma TD no degrade da marca sobre fundo claro. Logo inteiro some em 32px.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", borderRadius: 14 }}>
        <div
          style={{
            fontFamily: "Bricolage",
            fontSize: 44,
            letterSpacing: -3,
            backgroundImage: `linear-gradient(135deg, ${CORES.marinho} 15%, ${CORES.marca} 60%, ${CORES.vermelho})`,
            backgroundClip: "text",
            color: "transparent",
            paddingBottom: 4,
          }}
        >
          {SITE.monograma}
        </div>
      </div>
    ),
    { ...size, fonts: await fontesOg() },
  );
}
