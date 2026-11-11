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
# Estilo (11/11/2026): um objeto só, grande e literal (o tema se reconhece em 1 segundo), em fundo de cor
# cheia da marca. Fundo claro some no feed; cena exagerada (fogo, raio) tem cara de isca e briga com
# a proposta do site, que é conferir antes de confiar. Sem texto e sem logo: o Google pede isso para
# mostrar a capa grande, e o título já aparece escrito ao lado da imagem no site e nas prévias de link.
FUNDOS = {
    "marinho": "a solid deep navy blue (#032451) background with a subtle lighter blue glow behind the subject; the subject in warm orange, white and yellow-gold",
    "laranja": "a solid vivid orange (#f26027) background with a subtle lighter orange glow behind the subject; the subject in deep navy blue and white with small yellow-gold details",
    "vermelho": "a solid rich red (#d2212b) background with a subtle lighter glow behind the subject; the subject in white, deep navy blue and yellow-gold",
    "azul": "a solid medium blue (#094f82) background with a subtle lighter glow behind the subject; the subject in warm orange, white and yellow-gold",
}
ESTILO = ("Clean premium 3D render, one single large subject centered and filling about 65 percent of the frame, slightly tilted, "
          "soft studio lighting with a gentle shadow under the subject, smooth matte and glossy materials, calm and trustworthy, high contrast, on {fundo}. "
          "Realistic everyday objects only: no fire, no explosions, no lightning, no fantasy. "
          "Absolutely no text, no letters, no numbers, no logos, no brand names, no watermarks, no human faces. Wide 16:9.")

# slug: (cena, fundo)
CENAS = {
    "black-friday-2026-quando-e": ("A large glossy black price tag with a string, leaning against a desk calendar that has one day circled.", "vermelho"),
    "direito-de-arrependimento-compra-online": ("A large open cardboard box with a thick curved return arrow looping around it.", "azul"),
    "produto-com-defeito-comprado-online": ("A large smartphone with a cracked screen, with a wrench and a screwdriver crossed in front of it.", "laranja"),
    "taxa-de-importacao-compra-internacional": ("A large cardboard parcel resting on a globe, with a small airplane flying around it and a few golden coins beside it.", "marinho"),
    "pix-ou-cartao-compra-online": ("A large balance scale with a smartphone on one plate and a plain credit card without numbers on the other plate.", "laranja"),
    "como-saber-se-loja-da-shopee-e-confiavel": ("A small shop front with a striped awning, with a large shield bearing a check mark in front of it and three stars above.", "vermelho"),
    "cupom-shopee-e-mercado-livre-como-usar": ("A large blank perforated coupon ticket with a dashed cut line, being cut by a pair of scissors.", "marinho"),
    "compra-garantida-mercado-livre": ("A large shield with a check mark standing in front of a cardboard parcel, protecting it.", "azul"),
    "garantia-de-a-a-z-amazon": ("A large open umbrella sheltering a cardboard parcel underneath it.", "laranja"),
    "link-de-afiliado-o-preco-muda": ("A large metal chain link connecting a smartphone on the left to a shopping bag on the right.", "vermelho"),
    "historico-de-preco-como-consultar": ("A large smartphone showing a simple line chart that rises and then drops sharply, with a big magnifying glass over the lowest point of the line.", "marinho"),
    "esquenta-black-friday-comprar-antes-ou-esperar": ("A large shopping cart with a big hourglass standing inside it, sand still falling.", "laranja"),
    "cyber-monday-2026-quando-e": ("A large open laptop with a shopping bag emerging from its screen and a big mouse cursor arrow touching the bag.", "azul"),
    "frete-gratis-amazon-mercado-livre-shopee": ("A large plain cardboard parcel with a blank hanging tag, resting on top of a small delivery van seen from the side.", "vermelho"),
    "cashback-como-funciona": ("A large open leather wallet with golden coins flying back into it in a curved arc.", "marinho"),
    "calendario-de-promocoes-datas-de-desconto": ("A large desk calendar with several days marked by blank price tags and one small gift box sitting on it.", "laranja"),
}


def gerar(slug):
    corpo = {"contents": [{"parts": [{"text": f"{CENAS[slug][0]} {ESTILO.format(fundo=FUNDOS[CENAS[slug][1]])}"}]}],
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
