"""Puts each made-up QR on a plain 'sample card' image. The card is deliberately NOT a copy of a government document:
no emblem, no logos, a large SAMPLE watermark, and a number that starts with 0 (real Aadhaar numbers never do)."""
import json, os
from PIL import Image, ImageDraw, ImageFont

TMP = "scripts/.tmp-qr"
OUT = "public/samples"
os.makedirs(OUT, exist_ok=True)
people = json.load(open(f"{TMP}/people.json", encoding="utf-8"))
F = "C:/Windows/Fonts/"
ar = lambda s: ImageFont.truetype(F + "arial.ttf", s)
arb = lambda s: ImageFont.truetype(F + "arialbd.ttf", s)

for p in people:
    W, H = 805, 1120
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 70], fill="#1f2937")
    d.text((24, 18), "SAMPLE CARD  -  DUMMY DATA FOR DEMO ONLY", font=arb(30), fill="white")
    d.text((24, 100), "This is not a real Aadhaar card. Every detail is invented.", font=ar(24), fill="#444")
    d.text((24, 160), "To", font=ar(24), fill="black")
    y = 200
    for line in [p["name"], p["co"], p["house"], p["street"] + ",", f"{p['vtc']}, {p['district']},", f"{p['state']} - {p['pin']}"]:
        d.text((24, y), line, font=ar(26), fill="black"); y += 36
    d.text((24, 450), f"DOB: {p['dob'].replace('-', '/')}", font=ar(28), fill="black")
    d.text((24, 490), "MALE" if p["g"] == "M" else "FEMALE" if p["g"] == "F" else "TRANSGENDER", font=ar(28), fill="black")
    qr = Image.open(f"{TMP}/{p['file']}.png").convert("RGB")
    qr = qr.resize((460, 460), Image.NEAREST)
    img.paste(qr, (170, 560))
    d.text((190, 1050), f"Dummy number: {p['num']}", font=arb(34), fill="black")
    # diagonal SAMPLE watermark
    wm = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wm)
    wd.text((60, 480), "SAMPLE", font=arb(230), fill=(220, 38, 38, 55))
    wm = wm.rotate(28, resample=Image.BICUBIC)
    img = Image.alpha_composite(img.convert("RGBA"), wm).convert("RGB")
    img.save(f"{OUT}/sample-card-{p['file']}.png", optimize=True)
    print("wrote", f"{OUT}/sample-card-{p['file']}.png")
