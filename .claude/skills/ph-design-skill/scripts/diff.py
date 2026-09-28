"""Pixel-compare a reference image with a screenshot of the build.

usage: python diff.py REFERENCE SHOT OUT_PREFIX [--grid 8] [--threshold 24] [--exclude X0,Y0,X1,Y1 ...]

The shot is scaled to the reference width. Reports:
  match %     share of pixels whose max channel delta <= threshold
  mean delta  average absolute difference (0-255)
  height      reference vs shot height (a mismatch means spacing drift)
  worst cells grid cells (in REFERENCE pixels) with the most mismatch -> fix these first
Writes OUT_PREFIX-heat.png (reference dimmed, mismatches in red) and
OUT_PREFIX-side.png (reference | shot | heat) for visual inspection.
"""
import argparse
import numpy as np
from PIL import Image

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("reference"); ap.add_argument("shot"); ap.add_argument("out")
    ap.add_argument("--grid", type=int, default=8)
    ap.add_argument("--threshold", type=int, default=24)
    ap.add_argument("--exclude", nargs="*", default=[], metavar="X0,Y0,X1,Y1",
                    help="reference-pixel boxes to ignore (photos, canvas/WebGL, live data)")
    a = ap.parse_args()

    ref = Image.open(a.reference).convert("RGB")
    shot = Image.open(a.shot).convert("RGB")
    W, H = ref.size
    shot = shot.resize((W, round(shot.height * W / shot.width)), Image.LANCZOS)
    h = min(H, shot.height)
    r = np.asarray(ref, dtype=np.int16)[:h]
    s = np.asarray(shot, dtype=np.int16)[:h]
    delta = np.abs(r - s).max(axis=2)
    bad = delta > a.threshold
    for box in a.exclude:  # photos/WebGL/live content that can't match pixel for pixel
        x0, y0, x1, y1 = map(int, box.split(","))
        bad[y0:y1, x0:x1] = False; delta[y0:y1, x0:x1] = 0

    print(f"match      {100 * (1 - bad.mean()):.2f}%  (threshold {a.threshold})")
    print(f"mean delta {delta.mean():.2f}")
    if abs(H - shot.height) > 2:
        print(f"height     reference {H}px vs build {shot.height}px (scaled) -> vertical spacing drift of {shot.height - H:+d}px")

    g = a.grid; cells = []
    for gy in range(g):
        for gx in range(g):
            y0, y1 = gy * h // g, (gy + 1) * h // g
            x0, x1 = gx * W // g, (gx + 1) * W // g
            cells.append((bad[y0:y1, x0:x1].mean(), x0, y0, x1, y1))
    cells.sort(reverse=True)
    print("worst cells (x0,y0-x1,y1 in reference px):")
    for m, x0, y0, x1, y1 in cells[:6]:
        if m < 0.01: break
        print(f"   {100 * m:5.1f}% off  ({x0},{y0})-({x1},{y1})")

    heat = (np.asarray(ref)[:h] * 0.35).astype(np.uint8)
    heat[bad] = [255, 40, 40]
    heat_img = Image.fromarray(heat)
    heat_img.save(f"{a.out}-heat.png")
    side = Image.new("RGB", (W * 3, h), "white")
    side.paste(ref.crop((0, 0, W, h)), (0, 0)); side.paste(shot.crop((0, 0, W, h)), (W, 0)); side.paste(heat_img, (2 * W, 0))
    if side.width > 2400:
        side = side.resize((2400, round(h * 2400 / side.width)), Image.LANCZOS)
    side.save(f"{a.out}-side.png")
    print(f"wrote {a.out}-heat.png and {a.out}-side.png")

if __name__ == "__main__":
    main()
