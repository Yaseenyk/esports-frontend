import { LIMITS } from "@/lib/live";

/**
 * Shrinks a picked logo to at most 240 px wide and returns it as a PNG data URL, or a JPEG one when the PNG is too big, under the 60000
 * character limit the server accepts. Rejects with a plain sentence when the file is not an image or cannot be made small enough.
 */
export async function logoFromFile(file: File): Promise<string> {
  if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) throw new Error("Choose a PNG or JPEG picture.");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => fail(new Error("That file could not be read as a picture.")); i.src = url; });
    for (const maxW of [240, 180, 120, 80]) {
      const w = Math.min(maxW, img.naturalWidth), h = Math.max(1, Math.round((img.naturalHeight * w) / img.naturalWidth));
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
      const g = cv.getContext("2d");
      if (!g) throw new Error("This browser cannot resize pictures.");
      g.drawImage(img, 0, 0, w, h);
      const png = cv.toDataURL("image/png");
      if (png.length <= LIMITS.logoChars) return png;
      g.globalCompositeOperation = "destination-over"; g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h); // JPEG has no see-through parts
      for (const q of [0.85, 0.7, 0.5]) { const jpg = cv.toDataURL("image/jpeg", q); if (jpg.length <= LIMITS.logoChars) return jpg; }
    }
    throw new Error("That picture is too detailed to shrink under 60 KB. Try a simpler logo.");
  } finally { URL.revokeObjectURL(url); }
}
