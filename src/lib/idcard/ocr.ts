import { parseAadhaar, type AadhaarRead } from "./aadhaar";

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

/** Bigger, grey and higher contrast helps a lot with photocopies and phone photos. */
async function prepare(file: File): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(3, Math.max(1, 1800 / bmp.width));
  const cv = document.createElement("canvas");
  cv.width = Math.round(bmp.width * scale);
  cv.height = Math.round(bmp.height * scale);
  const ctx = cv.getContext("2d")!;
  ctx.filter = "grayscale(1) contrast(1.45)";
  ctx.drawImage(bmp, 0, 0, cv.width, cv.height);
  bmp.close();
  return cv;
}

export async function scanAadhaar(file: File, progress?: (p: number) => void): Promise<AadhaarRead> {
  onProgress = progress ?? null;
  const w = await getWorker();
  const cv = await prepare(file);
  try {
    const { data } = await w.recognize(cv);
    return parseAadhaar(data.text);
  } finally {
    cv.width = cv.height = 0; // drop the picture
    onProgress = null;
  }
}

export async function stopOcr() {
  if (!workerP) return;
  const w = await workerP;
  workerP = null;
  await w.terminate();
}
