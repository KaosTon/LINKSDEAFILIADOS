import { ImageResponse } from "next/og";
import { SITE } from "@/data/site";
import { CORES } from "@/data/tema";
import { fontesOg } from "@/lib/fontes-og";

// Export estatico (Cloudflare Pages): gerado uma vez no build.
export const dynamic = "force-static";

// Icone da tela inicial do iPhone (180x180): mesmo monograma do icon.tsx, sem cantos (o iOS arredonda).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <div
          style={{
            fontFamily: "Bricolage",
            fontSize: 120,
            letterSpacing: -8,
            backgroundImage: `linear-gradient(135deg, ${CORES.marinho} 15%, ${CORES.marca} 60%, ${CORES.vermelho})`,
            backgroundClip: "text",
            color: "transparent",
            paddingBottom: 12,
          }}
        >
          {SITE.monograma}
        </div>
      </div>
    ),
    { ...size, fonts: await fontesOg() },
  );
}
