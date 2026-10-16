import { ImageResponse } from "next/og";
import { logoOg } from "@/lib/fontes-og";

// Export estatico (Cloudflare Pages): gerado uma vez no build.
export const dynamic = "force-static";

// Icone da aba: o monograma do logo (assets/logo/monograma.png) sobre branco.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const src = await logoOg("monograma.png");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", borderRadius: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={58} height={39} />
      </div>
    ),
    size,
  );
}
