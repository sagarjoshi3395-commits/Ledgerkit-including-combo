import subprocess, sys, numpy as np, imageio_ffmpeg
from PIL import Image

F = imageio_ffmpeg.get_ffmpeg_exe()
W, H = 540, 960


def frames(path):
    p = subprocess.run([F, "-loglevel", "error", "-i", path, "-vf", "fps=10", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True)
    a = np.frombuffer(p.stdout, np.uint8).reshape(-1, H, W).astype(np.float32)
    p2 = subprocess.run([F, "-loglevel", "error", "-i", path, "-vf", "fps=10", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True)
    c = np.frombuffer(p2.stdout, np.uint8).reshape(-1, H, W, 3)
    return a, c


def shift(a, b):
    best, bs = 1e18, 0
    for s in range(0, 400):
        d = np.mean(np.abs(a[s + 100:H - 100] - b[100:H - 100 - s]))
        if d < best:
            best, bs = d, s
    return bs


def stitch(path):
    g, c = frames(path)
    rows = [c[0]]
    total = 0
    for i in range(1, len(g)):
        s = shift(g[i - 1], g[i])
        if s > 0:
            rows.append(c[i][H - s:])
            total += s
    return np.concatenate(rows, axis=0)


if __name__ == "__main__":
    img = stitch(sys.argv[1])
    Image.fromarray(img).save(sys.argv[2])
    print(img.shape)
