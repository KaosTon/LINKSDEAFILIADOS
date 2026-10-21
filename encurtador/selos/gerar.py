# Selos de desconto da foto no formato "marca" (21/10): -5% a -90%, PNG transparente 240x240.
# Pré-renderizados aqui (Pillow + Montserrat 800, OFL) porque o servidor no Railway não tem fonte
# instalada para o sharp escrever texto. Rodar da pasta encurtador/:  python3 selos/gerar.py
from PIL import Image, ImageDraw, ImageFont

FONTE = "../site/assets/fonts/montserrat-latin-800-normal.woff"
L = 240
for d in range(5, 91):
    im = Image.new("RGBA", (L * 4, L * 4), (0, 0, 0, 0))   # 4x e reduz: borda lisa
    g = ImageDraw.Draw(im)
    g.ellipse((8, 8, L * 4 - 8, L * 4 - 8), fill="#f26027", outline="#ffffff", width=36)
    texto = f"-{d}%"
    for tam in (300, 280, 260, 240):
        f = ImageFont.truetype(FONTE, tam)
        if g.textlength(texto, font=f) <= L * 4 * 0.78:
            break
    caixa = g.textbbox((0, 0), texto, font=f)
    x = (L * 4 - (caixa[2] - caixa[0])) / 2 - caixa[0]
    y = (L * 4 - (caixa[3] - caixa[1])) / 2 - caixa[1] - 40
    g.text((x, y), texto, font=f, fill="white")
    f2 = ImageFont.truetype(FONTE, 130)
    c2 = g.textbbox((0, 0), "OFF", font=f2)
    g.text(((L * 4 - (c2[2] - c2[0])) / 2 - c2[0], y + (caixa[3] - caixa[1]) + 70), "OFF", font=f2, fill="white")
    im.resize((L, L), Image.LANCZOS).save(f"selos/{d}.png", optimize=True)
