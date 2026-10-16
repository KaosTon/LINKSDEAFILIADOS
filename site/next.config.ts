import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Site 100% estatico (HTML pronto em out/), pra hospedar no Cloudflare Pages de graca.
  // Nenhuma pagina precisa de servidor: rotas dinamicas tem generateStaticParams e
  // dynamicParams = false. Se um dia entrar formulario com servidor, isto muda.
  output: "export",
  // Sem servidor nao ha otimizador de imagem do Next. As imagens ja saem leves
  // (capas .webp 1200x675, fotos de consultorio ate ~120 KB), entao servem como estao.
  images: { unoptimized: true },
  // Os cabecalhos de protecao (os mesmos da Virtus) agora moram em public/_headers, que o
  // Cloudflare Pages le. Export estatico nao aceita headers() aqui.
};

export default nextConfig;
