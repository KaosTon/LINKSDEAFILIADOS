import { ImageResponse } from "next/og";
import { LOJAS, SITE } from "@/data/site";
import { CORES } from "@/data/tema";
import { fontesOg } from "@/lib/fontes-og";

// Export estatico (Cloudflare Pages): gerado uma vez no build.
export const dynamic = "force-static";

// Imagem de compartilhamento padrao (1200x630), herdada por todas as paginas: e o que aparece
// quando alguem manda o link no WhatsApp. Fundo marinho com o brilho laranja, monograma, nome e
// a frase da marca.
export const alt = `${SITE.nome}, ${SITE.titulo}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: `radial-gradient(ellipse at top right, ${CORES.marca}70, ${CORES.escuro} 62%)`,
          color: "#ffffff",
          fontFamily: "Bricolage",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 132,
              height: 132,
              borderRadius: 28,
              background: "#ffffff",
              fontSize: 92,
              letterSpacing: -6,
              paddingBottom: 8,
            }}
          >
            <span
              style={{
                backgroundImage: `linear-gradient(135deg, ${CORES.marinho} 15%, ${CORES.marca} 60%, ${CORES.vermelho})`,
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {SITE.monograma}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <div style={{ fontSize: 34, letterSpacing: 12 }}>TEM</div>
            <div style={{ fontSize: 72, letterSpacing: -2 }}>DESCONTOS</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, lineHeight: 1.05, letterSpacing: -2, color: "#ffffff" }}>{SITE.frase}</div>
          <div style={{ fontSize: 28, marginTop: 28, color: CORES.marca }}>
            {`Grupo grátis no WhatsApp · ${LOJAS.join(" · ")}`}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await fontesOg() },
  );
}
