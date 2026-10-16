import { ImageResponse } from "next/og";
import { LOJAS, SITE } from "@/data/site";
import { CORES } from "@/data/tema";
import { fontesOg, logoOg } from "@/lib/fontes-og";

// Export estatico (Cloudflare Pages): gerado uma vez no build.
export const dynamic = "force-static";

// Imagem de compartilhamento padrao (1200x630), herdada por todas as paginas: e o que aparece
// quando alguem manda o link no WhatsApp. Fundo marinho com o brilho laranja, o logo claro
// (assets/logo/tem-descontos-claro.png) e a frase da marca.
export const alt = `${SITE.nome}, ${SITE.titulo}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await logoOg("tem-descontos-claro.png");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: 72,
          background: `radial-gradient(ellipse at top right, ${CORES.marca}66, ${CORES.escuro} 62%)`,
          color: "#ffffff",
          fontFamily: "Montserrat",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="" width={470} height={267} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 50, lineHeight: 1.12, letterSpacing: -1 }}>{SITE.frase}</div>
          <div style={{ fontSize: 24, marginTop: 28, color: CORES.laranja, lineHeight: 1.4 }}>
            {`Grupo grátis no WhatsApp · ${LOJAS.join(" · ")}`}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await fontesOg() },
  );
}
