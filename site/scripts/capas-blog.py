# Capas do blog (1200x675, public/blog/{slug}.webp). Tipografia nas cores do logo, sem foto:
# o tema e abstrato (direito do consumidor, pagamento, garantia), entao a capa e o objeto do tema
# escrito grande ao fundo (METODO §3 do fabrica-sites). Cada post tem fundo proprio: par de cores,
# angulo e textura diferentes (DOCS/BLOG.md §2: nunca repetir fundo).
#
#   python3 scripts/capas-blog.py        (precisa de Pillow; roda da pasta site/)
import math
from PIL import Image, ImageDraw, ImageFont

L, A = 1200, 675
FONTE = "assets/fonts/montserrat-latin-800-normal.woff"
LOGO = "public/logo/monograma.webp"

MARINHO, AZUL, LARANJA_CLARO, LARANJA, VERMELHO = "#032451", "#094f82", "#fd9c1a", "#f26027", "#d2212b"

# slug: (chamada pequena, titulo da capa, objeto do tema, cor 1, cor 2, angulo, textura)
CAPAS = {
    "black-friday-2026-quando-e": ("BLACK FRIDAY", "Black Friday 2026: quando é e como se preparar", "27/11", MARINHO, VERMELHO, 20, "pontos"),
    "direito-de-arrependimento-compra-online": ("SEUS DIREITOS", "Direito de arrependimento: 7 dias para devolver", "7 dias", AZUL, MARINHO, 120, "linhas"),
    "produto-com-defeito-comprado-online": ("SEUS DIREITOS", "Produto com defeito comprado online: o que fazer", "30 dias", VERMELHO, MARINHO, 200, "circulos"),
    "taxa-de-importacao-compra-internacional": ("COMPRA INTERNACIONAL", "Taxa de importação: quanto paga e como não ter surpresa", "US$", MARINHO, AZUL, 300, "grade"),
    "pix-ou-cartao-compra-online": ("PAGAMENTO", "Pix ou cartão na compra online: qual é mais seguro?", "Pix", LARANJA, MARINHO, 45, "linhas"),
    "como-saber-se-loja-da-shopee-e-confiavel": ("SHOPEE", "Como saber se uma loja da Shopee é confiável", "4,5", LARANJA, VERMELHO, 160, "pontos"),
    "cupom-shopee-e-mercado-livre-como-usar": ("CUPOM", "Cupom da Shopee e do Mercado Livre: como usar", "%", VERMELHO, LARANJA, 250, "grade"),
    "compra-garantida-mercado-livre": ("MERCADO LIVRE", "Compra Garantida: como pedir o dinheiro de volta", "R$", AZUL, LARANJA, 340, "circulos"),
    "garantia-de-a-a-z-amazon": ("AMAZON", "Garantia de A a Z da Amazon: quando vale", "A a Z", MARINHO, LARANJA, 80, "faixas"),
    "link-de-afiliado-o-preco-muda": ("COMO FUNCIONA", "Link de afiliado: o preço muda para quem compra?", "link", VERMELHO, AZUL, 280, "faixas"),
}


def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def degrade(c1, c2, ang):
    a, b = rgb(c1), rgb(c2)
    dx, dy = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    im = Image.new("RGB", (L, A))
    px = im.load()
    proj = [(x * dx + y * dy) for x, y in ((0, 0), (L, 0), (0, A), (L, A))]
    mn, mx = min(proj), max(proj)
    for y in range(A):
        for x in range(0, L):
            t = ((x * dx + y * dy) - mn) / (mx - mn)
            px[x, y] = tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
    return im


def textura(im, tipo):
    camada = Image.new("RGBA", (L, A), (0, 0, 0, 0))
    d = ImageDraw.Draw(camada)
    branco = (255, 255, 255, 22)
    if tipo == "pontos":
        for y in range(20, A, 36):
            for x in range(20, L, 36):
                d.ellipse((x - 3, y - 3, x + 3, y + 3), fill=branco)
    elif tipo == "linhas":
        for k in range(-A, L, 44):
            d.line((k, A, k + A, 0), fill=branco, width=3)
    elif tipo == "circulos":
        for r in range(80, 900, 70):
            d.ellipse((L - 200 - r, -150 - r, L - 200 + r, -150 + r), outline=branco, width=3)
    elif tipo == "grade":
        for x in range(0, L, 60):
            d.line((x, 0, x, A), fill=branco, width=2)
        for y in range(0, A, 60):
            d.line((0, y, L, y), fill=branco, width=2)
    elif tipo == "faixas":
        for k in range(0, L + A, 160):
            d.polygon([(k, 0), (k + 60, 0), (k + 60 - A, A), (k - A, A)], fill=(255, 255, 255, 16))
    return Image.alpha_composite(im.convert("RGBA"), camada)


def quebrar(d, texto, fonte, largura):
    linhas, atual = [], ""
    for p in texto.split():
        t = (atual + " " + p).strip()
        if d.textlength(t, font=fonte) <= largura:
            atual = t
        else:
            linhas.append(atual)
            atual = p
    linhas.append(atual)
    return linhas


def capa(slug, chamada, titulo, objeto, c1, c2, ang, tex):
    im = textura(degrade(c1, c2, ang), tex)
    # objeto do tema, grande e claro, a direita (camada propria: a transparencia precisa de mistura)
    fundo = Image.new("RGBA", (L, A), (0, 0, 0, 0))
    df = ImageDraw.Draw(fundo)
    tam = 400 if len(objeto) <= 3 else 260
    fo = ImageFont.truetype(FONTE, tam)
    bb = df.textbbox((0, 0), objeto, font=fo)
    df.text((L - (bb[2] - bb[0]) - 40 - bb[0], A - (bb[3] - bb[1]) - 70 - bb[1]), objeto, font=fo, fill=(255, 255, 255, 46))
    im = Image.alpha_composite(im, fundo)
    d = ImageDraw.Draw(im)
    # chamada pequena
    fc = ImageFont.truetype(FONTE, 30)
    d.rounded_rectangle((64, 64, 64 + d.textlength(chamada, font=fc) + 36, 64 + 52), radius=26, fill="white")
    d.text((82, 74), chamada, font=fc, fill=rgb(MARINHO))
    # titulo
    for tamanho in (74, 68, 62, 56):
        ft = ImageFont.truetype(FONTE, tamanho)
        linhas = quebrar(d, titulo, ft, 760)
        if len(linhas) <= 4:
            break
    y = 160
    for ln in linhas:
        d.text((64, y), ln, font=ft, fill="white")
        y += int(tamanho * 1.18)
    # rodape: endereco e monograma
    fr = ImageFont.truetype(FONTE, 26)
    d.text((64, A - 74), "temdescontos.com.br", font=fr, fill="white")
    logo = Image.open(LOGO).convert("RGBA")
    logo.thumbnail((120, 120))
    selo = Image.new("RGBA", (150, 150), (0, 0, 0, 0))
    ImageDraw.Draw(selo).ellipse((0, 0, 149, 149), fill=(255, 255, 255, 245))
    selo.alpha_composite(logo, ((150 - logo.width) // 2, (150 - logo.height) // 2))
    im.alpha_composite(selo, (L - 150 - 48, 40))
    im.convert("RGB").save(f"public/blog/{slug}.webp", quality=84)
    print("capa", slug)


if __name__ == "__main__":
    for s, args in CAPAS.items():
        capa(s, *args)
