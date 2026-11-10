"""Downloads the site's fonts once so they are served from this repo (src/fonts) instead of being fetched from Google at build time.
Run: python scripts/fetch-fonts.py     (needs internet; the files are committed, so builds never need it)"""
import os, re, urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"
OUT = "src/fonts"
os.makedirs(OUT, exist_ok=True)

# name -> Google CSS2 query. Variable fonts are one file per style; static fonts one file per weight.
FAMILIES = {
    "inter": "family=Inter:wght@100..900",
    "space-grotesk": "family=Space+Grotesk:wght@300..700",
    "poppins": "family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,500;1,600",
    "anton": "family=Anton",
    "bebas-neue": "family=Bebas+Neue",
    "oswald": "family=Oswald:wght@200..700",
    "montserrat": "family=Montserrat:ital,wght@0,100..900;1,100..900",
}

def get(url: str) -> bytes:
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})).read()

for name, q in FAMILIES.items():
    css = get(f"https://fonts.googleapis.com/css2?{q}&display=swap").decode()
    blocks = re.findall(r"/\* (latin) \*/\s*@font-face \{(.*?)\}", css, re.S)
    for _, body in blocks:
        style = re.search(r"font-style:\s*(\w+)", body).group(1)
        weight = re.search(r"font-weight:\s*([\d ]+);", body).group(1).strip().replace(" ", "-")
        url = re.search(r"url\((https://[^)]+\.woff2)\)", body).group(1)
        path = f"{OUT}/{name}-{weight}-{style}.woff2"
        open(path, "wb").write(get(url))
        print(path, os.path.getsize(path) // 1024, "KB")
