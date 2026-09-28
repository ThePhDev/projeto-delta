"""Extract measurable facts from a reference image before writing CSS.

usage: python palette.py IMAGE [--colors 10] [--at X,Y ...] [--crop X0,Y0,X1,Y1 OUT.png [--scale 1]]

Prints image size, dominant colors (hex + share), exact colors at given points,
and optionally saves a crop (zoom into a region to read type, icons, radii).
"""
import argparse
from PIL import Image

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("--colors", type=int, default=10)
    ap.add_argument("--at", nargs="*", default=[])
    ap.add_argument("--crop", nargs=2, metavar=("BOX", "OUT"))
    ap.add_argument("--scale", type=int, default=2, help="crop zoom; use 1 to extract an asset (photo, logo) as-is")
    a = ap.parse_args()

    img = Image.open(a.image).convert("RGB")
    print(f"size {img.width}x{img.height}")
    q = img.quantize(colors=a.colors, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()
    total = img.width * img.height
    for count, idx in sorted(q.getcolors(), reverse=True):
        r, g, b = pal[idx * 3: idx * 3 + 3]
        print(f"#{r:02x}{g:02x}{b:02x}  {100 * count / total:5.1f}%")
    for pt in a.at:
        x, y = map(int, pt.split(","))
        r, g, b = img.getpixel((x, y))
        print(f"at {x},{y}: #{r:02x}{g:02x}{b:02x}")
    if a.crop:
        box = tuple(map(int, a.crop[0].split(",")))
        c = img.crop(box)
        c.resize((c.width * a.scale, c.height * a.scale), Image.NEAREST).save(a.crop[1])
        print(f"crop saved ({a.scale}x) -> {a.crop[1]}")

if __name__ == "__main__":
    main()
