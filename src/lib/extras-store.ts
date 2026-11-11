import { LOGO_MAX, sanitizeExtras, type Extras } from "./display";

/** Sponsors and announcements are set once per browser and carried by every screen and link. */
export const EXTRAS_KEY = "eh-extras-v1";

/** Reads the saved extras. Blocked or damaged storage gives undefined, never an error. */
export function loadExtras(): Extras | undefined {
  try { const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(EXTRAS_KEY); return raw ? sanitizeExtras(JSON.parse(raw)) : undefined; } catch { return undefined; }
}

/** Saves the extras (cleaned first). Returns false when the browser would not store them. */
export function saveExtras(x: Extras | undefined): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    const clean = sanitizeExtras(x);
    if (clean) localStorage.setItem(EXTRAS_KEY, JSON.stringify(clean)); else localStorage.removeItem(EXTRAS_KEY);
    return true;
  } catch { return false; }
}

/** The size a logo is scaled to: no wider than `maxW`, never enlarged, and no taller than twice that width over three. */
export function fitSize(w: number, h: number, maxW = 240): { w: number; h: number } {
  if (!(w > 0) || !(h > 0)) return { w: 1, h: 1 };
  const maxH = Math.round((maxW * 2) / 3);
  const k = Math.min(1, maxW / w, maxH / h);
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}

/** The attempts made, in order, to bring a logo under the size limit: PNG first (keeps transparency), then JPEG at falling quality, then smaller. */
export const LOGO_ATTEMPTS: { width: number; type: "image/png" | "image/jpeg"; quality?: number }[] = [
  { width: 240, type: "image/png" }, { width: 240, type: "image/jpeg", quality: 0.85 }, { width: 240, type: "image/jpeg", quality: 0.65 },
  { width: 180, type: "image/jpeg", quality: 0.7 }, { width: 120, type: "image/jpeg", quality: 0.7 },
];

/**
 * Turns an uploaded image file into a small data URL (max 240 px wide, under 60 KB). Throws an Error with a plain message when the file is not
 * an image the browser can read, or is too detailed to fit.
 */
export async function logoFromFile(file: File): Promise<string> {
  if (!/^image\/(png|jpeg|webp|gif|bmp)$/.test(file.type)) throw new Error("Choose a PNG or JPEG picture. Other file types cannot be used as a logo.");
  if (file.size > 8_000_000) throw new Error("That picture is very large. Choose one under 8 MB.");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error("That picture could not be read. Try a PNG or JPEG.")); im.src = url; });
    for (const a of LOGO_ATTEMPTS) {
      const { w, h } = fitSize(img.naturalWidth, img.naturalHeight, a.width), canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const g = canvas.getContext("2d");
      if (!g) throw new Error("Your browser cannot resize pictures here.");
      if (a.type === "image/jpeg") { g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h); } // a JPEG has no transparency
      g.drawImage(img, 0, 0, w, h);
      const data = canvas.toDataURL(a.type, a.quality);
      if (data.length <= LOGO_MAX && data.startsWith(`data:${a.type}`)) return data;
    }
    throw new Error("This logo is too detailed to fit (the limit is 60 KB after shrinking). Try a simpler or flatter version of it.");
  } finally { URL.revokeObjectURL(url); }
}
