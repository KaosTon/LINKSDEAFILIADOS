import { ImageResponse } from "next/og";
import { logoOg } from "@/lib/fontes-og";

// Export estatico (Cloudflare Pages): gerado uma vez no build.
export const dynamic = "force-static";

// Icone da tela inicial do iPhone (180x180): mesmo monograma do icon.tsx, sem cantos (o iOS arredonda).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const src = await logoOg("monograma.png");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={160} height={108} />
      </div>
    ),
    size,
  );
}
