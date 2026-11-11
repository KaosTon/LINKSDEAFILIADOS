# Capas do blog geradas pelo Gemini (1200x675, public/blog/{slug}.webp). Padrão da Virtus (QUALIDADE.md §2).
#
#   GEMINI_API_KEY=... python3 scripts/capas-gemini.py slug [slug ...] [--saida pasta]
#
# Sem --saida grava direto em public/blog/. Com --saida grava lá, para olhar antes de trocar a capa
# (a regra é mostrar a imagem antes do commit). Precisa de Pillow. Em sessão com o segredo de rede
# configurado, o proxy coloca a chave e qualquer valor em GEMINI_API_KEY serve.
# Sem chave no ambiente, a capa tipográfica de scripts/capas-blog.py segura.
#
# Regras da imagem: sem texto, sem logo e sem marca de loja, sem rosto de pessoa real, nas cores
# do site (marinho, azul, laranja, vermelho). Uma cena por post, casada com o tema.
import base64, io, json, os, sys, urllib.request
from PIL import Image

MODELO = os.environ.get("GEMINI_MODELO_IMAGEM", "gemini-3.1-flash-image")
ESTILO = ("Editorial 3D illustration, soft studio lighting, clean composition with generous empty space, "
          "color palette restricted to deep navy blue (#032451), medium blue (#094f82), warm orange (#fd9c1a, #f26027) "
          "and a small red accent (#d2212b) on an off-white or navy background. "
          "Absolutely no text, no letters, no numbers, no logos, no brand names, no watermarks, no human faces. "
          "Wide 16:9 banner for a Brazilian consumer blog about online shopping deals.")

CENAS = {
    "historico-de-preco-como-consultar": "A smartphone standing upright showing a simple line chart that goes up and then drops, with a magnifying glass over the lowest point of the line and a blank price tag beside it.",
    "esquenta-black-friday-comprar-antes-ou-esperar": "A desk calendar page with one day circled in orange, next to a shopping cart and an hourglass with sand still falling, suggesting the choice between buying now or waiting.",
    "cyber-monday-2026-quando-e": "A laptop with a shopping bag coming out of the screen and a mouse cursor arrow clicking it, a small wall calendar in the background with the first day of the week highlighted.",
    "frete-gratis-amazon-mercado-livre-shopee": "A small delivery van and three plain cardboard parcels of different sizes on a road that ends at a house door, with a blank tag hanging from the largest parcel.",
    "cashback-como-funciona": "A shopping bag with coins flowing out of it in a curved arrow that returns into an open wallet, showing money coming back after a purchase.",
    "calendario-de-promocoes-datas-de-desconto": "A large wall calendar with several days marked by orange and red blank price tags and gift boxes resting on some of the days, seen slightly from above.",
}


def gerar(slug):
    corpo = {"contents": [{"parts": [{"text": f"{CENAS[slug]} {ESTILO}"}]}],
             "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "16:9"}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODELO}:generateContent",
                                 data=json.dumps(corpo).encode(), method="POST",
                                 headers={"Content-Type": "application/json", "x-goog-api-key": os.environ.get("GEMINI_API_KEY", "")})
    with urllib.request.urlopen(req, timeout=180) as r:
        d = json.load(r)
    for p in d["candidates"][0]["content"]["parts"]:
        if "inlineData" in p:
            return Image.open(io.BytesIO(base64.b64decode(p["inlineData"]["data"]))).convert("RGB")
    raise RuntimeError(f"{slug}: a resposta veio sem imagem")


def enquadrar(im, l=1200, a=675):
    r = max(l / im.width, a / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    x, y = (im.width - l) // 2, (im.height - a) // 2
    return im.crop((x, y, x + l, y + a))


if __name__ == "__main__":
    args = sys.argv[1:]
    saida = "public/blog"
    if "--saida" in args:
        i = args.index("--saida"); saida = args[i + 1]; del args[i:i + 2]
    if not os.environ.get("GEMINI_API_KEY"):
        sys.exit("Falta GEMINI_API_KEY no ambiente.")
    for slug in args or list(CENAS):
        if slug not in CENAS:
            sys.exit(f"Sem cena para {slug}: acrescente em CENAS.")
        enquadrar(gerar(slug)).save(os.path.join(saida, f"{slug}.webp"), quality=84)
        print("capa", slug)
