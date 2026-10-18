import sys, numpy as np
from PIL import Image
from scipy import ndimage

def tira_fundo(src, dst, limiar, tam=1024, margem=0.06, miolo=0):
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.float64)
    h, w, _ = im.shape
    # fundo estimado: mediana da borda (o 2o arquivo tem fundo cinza claro com degradê)
    borda = np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]])
    fundo = np.median(borda, axis=0)
    claro = im.min(axis=2) >= limiar
    rot, _ = ndimage.label(claro)
    tocam = set(np.unique(np.concatenate([rot[0], rot[-1], rot[:, 0], rot[:, -1]]))) - {0}
    fora = np.isin(rot, list(tocam))                 # só o branco ligado à borda; o branco de dentro (o %) fica
    if miolo:                                        # miolo de letra (D, O) grande também é fundo
        tam_reg = ndimage.sum(np.ones_like(rot), rot, index=np.arange(rot.max() + 1))
        fora |= np.isin(rot, [i for i in range(1, rot.max() + 1) if tam_reg[i] >= miolo])
    perto = ndimage.binary_dilation(fora, iterations=3) & ~fora
    a = np.ones((h, w))
    a[fora] = 0
    # borda suave: tira a cor do fundo dos pixels de contorno (color to alpha)
    d = np.clip((fundo - im) / np.maximum(fundo, 1), 0, 1).max(axis=2)
    a[perto] = np.clip(d[perto] * 1.6, 0, 1)
    cor = im.copy()
    m = perto & (a > 0)
    cor[m] = np.clip((im[m] - fundo * (1 - a[m, None])) / a[m, None], 0, 255)
    rgba = np.dstack([cor, a * 255]).astype(np.uint8)
    out = Image.fromarray(rgba, 'RGBA')
    bb = out.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    out = out.crop(bb)
    lado = int(max(out.size) * (1 + 2 * margem))
    tela = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
    tela.paste(out, ((lado - out.width) // 2, (lado - out.height) // 2), out)
    tela.resize((tam, tam), Image.LANCZOS).save(dst, optimize=True)
    print(dst, bb)

base = sys.argv[1]
tira_fundo('/root/.claude/uploads/377b4df4-595b-54a1-87f0-b16c32e164da/16a62b60-image.png', base + '/td-icone.png', 235)
tira_fundo('/root/.claude/uploads/377b4df4-595b-54a1-87f0-b16c32e164da/43c4eb78-image.jpg', base + '/tem-descontos.png', 228, tam=1200, miolo=1000)
