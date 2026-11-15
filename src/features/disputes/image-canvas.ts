"use client";

/** The thin browser layer under `evidence.ts`: decode the picked file, draw it on a canvas, re-encode it. No rules live here. */
import { shrinkToLimit, type Attempt, type Shrunk } from "@/features/disputes/evidence";

/** WebP when the browser can write it, otherwise JPEG (Safari answers PNG when asked for WebP). */
async function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  const webp = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", quality));
  if (webp && webp.type === "image/webp") return webp;
  return new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", quality));
}

export async function compressImage(file: File): Promise<Shrunk> {
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); } catch { return { ok: false, reason: "encode_failed" }; }
  const canvas = document.createElement("canvas");
  const encode = async (a: Attempt): Promise<Blob | null> => {
    canvas.width = a.w; canvas.height = a.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, a.w, a.h); // JPEG has no transparency
    ctx.drawImage(bitmap, 0, 0, a.w, a.h);
    return toBlob(canvas, a.quality);
  };
  try { return await shrinkToLimit(bitmap.width, bitmap.height, encode); } finally { bitmap.close(); }
}
