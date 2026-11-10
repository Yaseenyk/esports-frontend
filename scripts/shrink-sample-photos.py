"""Crops each generated avatar to the person (so cut-out cards use the space well) and saves a small transparent WebP in public/samples/people."""
import glob, os
from PIL import Image

SRC, OUT = "scripts/.tmp-photos", "public/samples/people"
os.makedirs(OUT, exist_ok=True)
for f in sorted(glob.glob(f"{SRC}/*.png")):
    slug = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f).convert("RGBA")
    box = im.getchannel("A").point(lambda v: 255 if v > 12 else 0).getbbox()
    if box:
        x0, y0, x1, y1 = box
        m = int(0.02 * im.width)
        im = im.crop((max(0, x0 - m), max(0, y0 - m), min(im.width, x1 + m), im.height if y1 > im.height * 0.97 else min(im.height, y1 + m)))
    k = min(1, 900 / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    path = f"{OUT}/{slug}.webp"
    im.save(path, "WEBP", quality=84, method=6)
    print(slug, im.size, f"{os.path.getsize(path) // 1024} KB")
