"""Mascote da Tem Descontos: uma base e várias poses, todas editadas a partir da mesma base (assim o
personagem não muda de uma pose para outra). Ideia do modo "por quadro a partir de uma base" da skill
character-animation (MIT), reescrita aqui. Fundo verde de recorte, removido no fim.

Uso: GEMINI_API_KEY=... python3 gerar.py base            (cria base.png, olhe antes de seguir)
     GEMINI_API_KEY=... python3 gerar.py poses [nomes]   (cria poses/<nome>.png, recortadas)
"""
import base64, io, json, os, sys, urllib.request
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
MODELO = "gemini-3.1-flash-image"
FUNDO = "solid flat vivid chroma-key green (#00B140) background, no shadow on the ground, no text, no letters, no logo, no border"
BASE = ("Character design of a cute cartoon mascot: a chubby orange price tag with rounded corners, standing upright, "
        "with a round punched hole near the top and a short navy blue string loop through it. It has two big friendly "
        "eyes with white highlights, small eyebrows and a happy open smile on the front of the tag, short navy blue arms "
        "with white cartoon gloves, short navy blue legs with red sneakers. Modern flat vector style, bold clean dark navy "
        "outlines, simple cel shading, orange (#F7941D) body. Full body, front view, neutral standing pose with arms "
        "relaxed at its sides, centered, small margin around it. " + FUNDO + ".")
REGRA = (" Keep exactly the same character from the reference image: same proportions, same colors, same outline weight, "
         "same face style, same size in the frame, full body visible. Change only the pose and the expression. " + FUNDO + ".")
POSES = {
    "celular": "The mascot holds a smartphone in one hand and looks at the screen with an excited, delighted smile, the other hand tapping the screen.",
    "caixa_feliz": "The mascot hugs a closed cardboard delivery box with both arms, very happy, eyes closed in joy.",
    "caixa_triste": "The mascot holds an open cardboard box and looks inside it with a disappointed, worried face, eyebrows tilted, mouth turned down.",
    "calma": "The mascot faces the viewer with a calm reassuring smile, one open hand raised forward in a 'wait, relax' gesture, the other hand on its hip.",
    "aponta": "The mascot smiles confidently and points up with the index finger of one raised hand, the other hand on its hip, like giving a tip.",
    "dinheiro": "The mascot happily holds a fan of green banknotes in one raised hand, the other hand giving a thumbs up, big smile.",
    "pulo": "The mascot jumps in the air celebrating, both arms raised high, legs bent, eyes closed, huge open smile.",
    "desconfiado": "The mascot looks suspicious and skeptical, one eyebrow raised, eyes glancing to the side, one hand on its chin thinking, the other hand on its hip.",
    "lupa": "The mascot holds a big magnifying glass up in front of one eye, which looks enlarged through the lens, curious investigative smile, the other hand on its hip.",
    "anota": "The mascot holds a small notepad in one hand and writes on it with a pencil in the other hand, focused happy expression, looking at the notepad.",
    "aceno": "The mascot waves hello with one raised open hand, friendly smile, the other arm relaxed.",
}


def chamar(texto, ref=None, aspecto="1:1"):
    partes = [{"text": texto}]
    if ref is not None:
        b = io.BytesIO(); ref.save(b, "PNG")
        partes.insert(0, {"inlineData": {"mimeType": "image/png", "data": base64.b64encode(b.getvalue()).decode()}})
    corpo = {"contents": [{"parts": partes}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspecto}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODELO}:generateContent",
                                 data=json.dumps(corpo).encode(), method="POST",
                                 headers={"Content-Type": "application/json", "x-goog-api-key": os.environ.get("GEMINI_API_KEY", "")})
    with urllib.request.urlopen(req, timeout=240) as r:
        d = json.load(r)
    for p in d["candidates"][0]["content"]["parts"]:
        if "inlineData" in p:
            return Image.open(io.BytesIO(base64.b64decode(p["inlineData"]["data"]))).convert("RGB")
    raise RuntimeError("a resposta veio sem imagem")


def recortar(im):
    """Tira o verde: transparência proporcional a quanto o verde domina, e limpa o reflexo verde da borda."""
    im = im.convert("RGBA"); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, _ = px[x, y]
            sobra = g - max(r, b)
            if sobra > 20:
                a = max(0, 255 - (sobra - 20) * 6)
                px[x, y] = (r, max(r, b) if a < 255 else g, b, a)
    return im


if __name__ == "__main__":
    modo = sys.argv[1] if len(sys.argv) > 1 else ""
    if modo == "base":
        chamar(BASE).save(os.path.join(AQUI, "base.png")); print("base.png")
    elif modo == "poses":
        base = Image.open(os.path.join(AQUI, "base.png"))
        os.makedirs(os.path.join(AQUI, "poses"), exist_ok=True)
        recortar(base).save(os.path.join(AQUI, "poses", "parado.png"))
        for nome in (sys.argv[2:] or POSES):
            try:
                recortar(chamar(POSES[nome] + REGRA, base)).save(os.path.join(AQUI, "poses", nome + ".png")); print(nome)
            except Exception as e:
                print(nome, "FALHOU", repr(e)[:200])
    else:
        print(__doc__)
