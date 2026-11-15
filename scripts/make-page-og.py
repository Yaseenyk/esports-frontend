"""Draws the 1200x630 share cards for the esports ID card pages (flat vector look on ink #05070A, cyan and violet only, no glow).
Run: python scripts/make-page-og.py   (needs Pillow; uses Windows Segoe UI like the site card). Output is committed to public/og/.
next/og cannot start on Windows (see CLAUDE.md), so these are drawn here instead and referenced from each page's metadata."""
import math, os
from PIL import Image, ImageDraw, ImageFont

INK, CYAN, VIOLET, WHITE, MUTED = "#05070A", "#22D3EE", "#A855F7", "#F4F4F5", "#9CA3AF"
F = "C:/Windows/Fonts/"
font = lambda n, s: ImageFont.truetype(F + n, s)
os.makedirs("public/og", exist_ok=True)

def hexagon(d, cx, cy, r, w):
    pts = [(cx + r * math.cos(math.radians(60 * i - 90)), cy + r * math.sin(math.radians(60 * i - 90))) for i in range(6)]
    d.line(pts + [pts[0]], fill=CYAN, width=w, joint="curve")
    d.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=CYAN)

def card(name, kicker, lines, sub, sample):
    im = Image.new("RGB", (1200, 630), INK); d = ImageDraw.Draw(im)
    hexagon(d, 120, 110, 44, 5)
    d.text((190, 84), "Esports", font=font("segoeuib.ttf", 46), fill=WHITE)
    d.text((190 + d.textlength("Esports", font=font("segoeuib.ttf", 46)), 84), "Hub", font=font("segoeuib.ttf", 46), fill=CYAN)
    d.text((72, 190), kicker.upper(), font=font("segoeuib.ttf", 26), fill=VIOLET)
    y = 240
    for ln in lines:
        d.text((72, y), ln, font=font("segoeuib.ttf", 56), fill=WHITE); y += 76
    d.text((72, y + 18), sub, font=font("segoeui.ttf", 30), fill=MUTED)
    # the studio's own sample card, flat, with a thin cyan outline
    s = Image.open(sample).convert("RGB"); w = 360; s = s.resize((w, round(s.height * w / s.width)), Image.LANCZOS)
    x0, y0 = 800, 300 if s.width > s.height else 120
    d.rectangle([x0 - 4, y0 - 4, x0 + s.width + 3, y0 + s.height + 3], outline=CYAN, width=3)
    im.paste(s, (x0, y0))
    d.rectangle([0, 622, 1200, 630], fill=CYAN)
    im.save(f"public/og/{name}.png", optimize=True)

wallet = "public/samples/esports/wallet-player-front.webp"
card("esports-id-card-maker", "Free, no sign-up", ["Esports ID card", "maker for tournaments"], "Roster to print-ready cards, QR for the gate", wallet)
card("best-free-esports-id-card-makers", "Compared, 15 Nov 2026", ["Best free esports", "ID card makers"], "Honest comparison and a decision guide", wallet)
