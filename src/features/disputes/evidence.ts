/**
 * Evidence images: the rules and the shrink loop, pure so they can be tested without a browser.
 * The API accepts at most 400 KB per file, 4 files per dispute, PNG / JPEG / WebP only (API.md section 5). Images are re-encoded in the
 * browser before upload, which also removes EXIF (location, camera) data. The actual canvas calls live in `image-canvas.ts`.
 */
export const MAX_BYTES = 400 * 1024;
export const MAX_FILES = 4;
export const MAX_INPUT_BYTES = 15 * 1024 * 1024;
export const MAX_DIMENSION = 1600;
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export interface PickedFile { name: string; type: string; size: number }

/** "" when the file may be tried, otherwise the reason in plain words. */
export function checkInput(f: PickedFile): string {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(f.type)) return "Only PNG, JPEG or WebP images can be attached.";
  if (f.size <= 0) return "This file is empty.";
  if (f.size > MAX_INPUT_BYTES) return "This image is larger than 15 MB. Take a smaller screenshot.";
  return "";
}

/** How many more files may be added to a dispute that already holds `existing` and where `selected` are already waiting. */
export const slotsLeft = (existing: number, selected: number): number => Math.max(0, MAX_FILES - existing - selected);

/** Fit inside a square of `max` pixels, keeping the shape. Never enlarges. */
export function fitDimensions(w: number, h: number, max = MAX_DIMENSION): { w: number; h: number } {
  const s = Math.min(1, max / Math.max(w, h, 1));
  return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) };
}

export interface Attempt { w: number; h: number; quality: number }

/** The order in which sizes are tried: best quality at full size first, then lower quality, then smaller pictures. */
export function planAttempts(w: number, h: number): Attempt[] {
  const base = fitDimensions(w, h);
  const out: Attempt[] = [];
  for (const scale of [1, 0.85, 0.7, 0.55, 0.4, 0.3]) {
    for (const quality of [0.85, 0.7, 0.55, 0.4]) out.push({ w: Math.max(1, Math.round(base.w * scale)), h: Math.max(1, Math.round(base.h * scale)), quality });
  }
  return out;
}

export type Shrunk = { ok: true; blob: Blob; attempts: number; attempt: Attempt } | { ok: false; reason: "too_big" | "encode_failed" };

/** Tries each attempt until the encoded size is within the limit. `encode` is the thin canvas call (or a fake in tests). */
export async function shrinkToLimit(w: number, h: number, encode: (a: Attempt) => Promise<Blob | null>, limit: number = MAX_BYTES): Promise<Shrunk> {
  const plan = planAttempts(w, h);
  let failedEncodes = 0;
  for (let i = 0; i < plan.length; i++) {
    const blob = await encode(plan[i]);
    if (!blob) { failedEncodes++; continue; }
    if (blob.size <= limit) return { ok: true, blob, attempts: i + 1, attempt: plan[i] };
  }
  return { ok: false, reason: failedEncodes === plan.length ? "encode_failed" : "too_big" };
}

export const kb = (bytes: number): string => `${Math.max(1, Math.round(bytes / 1024))} KB`;
