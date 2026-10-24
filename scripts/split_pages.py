import numpy as np
from PIL import Image

OUT = "/app/frontend/public/samples/combo-6/pages"


def runs(mask, minlen):
    out, s = [], None
    for i, v in enumerate(list(mask) + [False]):
        if v and s is None:
            s = i
        elif not v and s is not None:
            if i - s >= minlen:
                out.append((s, i))
            s = None
    return out


def split(name):
    im = Image.open(f"/tmp/tall_{name}.png").convert("RGB")
    a = np.asarray(im.convert("L")).astype(float)[:, 10:-10]
    m, sd = a.mean(1), a.std(1)
    H = a.shape[0]
    if name == "medicine":
        seps = runs((sd < 4) & (m > 245), 12)
        cuts = [(s + e) // 2 for s, e in seps]
        lo, hi = 280, 520
    elif name == "disease":
        seps = runs((m < 45) & (sd < 15), 15)
        cuts = [e + 2 for s, e in seps]
        lo, hi = 600, 760
    else:
        seps = runs((sd < 4) & (m > 215) & (m < 247), 4)
        cuts = [(s + e) // 2 for s, e in seps]
        lo, hi = 650, 900
    bounds = [0] + cuts + [H]
    pages = [(bounds[i], bounds[i + 1]) for i in range(len(bounds) - 1) if lo <= bounds[i + 1] - bounds[i] <= hi]
    return im, pages


if __name__ == "__main__":
    for n in ["medicine", "disease", "emergency", "ayurvedic", "ecg", "lab"]:
        im, pages = split(n)
        print(n, [(s, e, e - s) for s, e in pages])
