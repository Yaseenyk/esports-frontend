import { parseAadhaar, type AadhaarRead } from "./aadhaar";
import { scanQr } from "./qr";

/**
 * Runs OCR entirely in the browser with Tesseract (free, open source). The picture is never sent to any server and is
 * dropped as soon as the text has been read. The first scan downloads the English language data once.
 */
type Worker = import("tesseract.js").Worker;
let workerP: Promise<Worker> | null = null;
let onProgress: ((p: number) => void) | null = null;

async function getWorker() {
  if (!workerP) {
    workerP = import("tesseract.js").then((T) =>
      T.createWorker("eng", 1, { logger: (m: { status: string; progress: number }) => { if (m.status === "recognizing text") onProgress?.(m.progress); } }),
    );
  }
  return workerP;
}

/** Bigger, grey and higher contrast helps a lot with photocopies and phone photos. A second look uses a hard black-and-white threshold. */
async function prepare(file: File, mode: "soft" | "hard" = "soft"): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(3, Math.max(1, 1800 / bmp.width));
  const cv = document.createElement("canvas");
  cv.width = Math.round(bmp.width * scale);
  cv.height = Math.round(bmp.height * scale);
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.filter = mode === "soft" ? "grayscale(1) contrast(1.45)" : "grayscale(1) contrast(1.8)";
  ctx.drawImage(bmp, 0, 0, cv.width, cv.height);
  bmp.close();
  if (mode === "hard") {
    // Otsu threshold on the grey levels: good for faint photocopies and shadows.
    const img = ctx.getImageData(0, 0, cv.width, cv.height), d = img.data, hist = new Array(256).fill(0);
    for (let i = 0; i < d.length; i += 4) hist[d[i]]++;
    const total = d.length / 4; let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i];
    let sB = 0, wB = 0, best = 0, thr = 128;
    for (let t = 0; t < 256; t++) { wB += hist[t]; if (!wB) continue; const wF = total - wB; if (!wF) break; sB += t * hist[t]; const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) ** 2; if (v > best) { best = v; thr = t; } }
    for (let i = 0; i < d.length; i += 4) { const v = d[i] > thr ? 255 : 0; d[i] = d[i + 1] = d[i + 2] = v; }
    ctx.putImageData(img, 0, 0);
  }
  return cv;
}

const missing = (r: AadhaarRead) => !r.name || !(r.dob || r.yob) || !r.last4 || !r.gender;
const score = (r: AadhaarRead) => (r.name ? 2 : 0) + (r.dob ? 2 : r.yob ? 1 : 0) + (r.last4 ? 1 : 0) + (r.gender ? 1 : 0);

/**
 * 1. Try the QR code on the card: exact, instant, and needs no OCR at all.
 * 2. Otherwise OCR the printed text. If anything is missing, look again with a harder black-and-white version and keep the better read.
 */
export async function scanAadhaar(file: File, progress?: (p: number) => void): Promise<AadhaarRead> {
  const q = await scanQr(file).catch(() => null);
  if (q?.name) { progress?.(1); return { ...q, source: "qr" }; }

  onProgress = progress ?? null;
  const w = await getWorker();
  let best: AadhaarRead = {};
  try {
    for (const mode of ["soft", "hard"] as const) {
      const cv = await prepare(file, mode);
      try {
        const { data } = await w.recognize(cv);
        const r = parseAadhaar(data.text, data.lines.map((l) => ({ text: l.text, conf: l.confidence })));
        if (score(r) > score(best)) best = r;
      } finally { cv.width = cv.height = 0; } // drop the picture
      if (!missing(best)) break;
    }
  } finally { onProgress = null; }
  return { ...best, source: "ocr" };
}

export async function stopOcr() {
  if (!workerP) return;
  const w = await workerP;
  workerP = null;
  await w.terminate();
}
