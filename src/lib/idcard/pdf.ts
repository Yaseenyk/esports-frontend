/**
 * Reads an e-Aadhaar PDF in the browser. The PDF is opened and drawn to pictures on this device and never uploaded.
 * Those pictures then go through the same QR-first reading as a photo of the card.
 * Downloaded e-Aadhaar PDFs are protected: the password is usually the first 4 letters of the name in capitals followed by the year of birth (for example RAVI1998).
 */
export type PdfResult = { images: Blob[] } | { needPassword: true; wrong: boolean };

export async function pdfToImages(file: File, password?: string, maxPages = 2): Promise<PdfResult> {
  const pdfjs = await import("pdfjs-dist");
  // The worker is a plain file copied from pdfjs-dist (same version) into public/vendor, so the site build does not try to bundle it.
  pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/vendor/pdf.worker.min.mjs`;
  const data = new Uint8Array(await file.arrayBuffer());
  let doc;
  try {
    doc = await pdfjs.getDocument({ data, password }).promise;
  } catch (e) {
    const err = e as { name?: string; code?: number };
    if (err?.name === "PasswordException") return { needPassword: true, wrong: err.code === 2 };
    throw e;
  }
  const images: Blob[] = [];
  for (let n = 1; n <= Math.min(doc.numPages, maxPages); n++) {
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: Math.min(3.2, 2000 / base.width) });
    const cv = document.createElement("canvas");
    cv.width = Math.round(viewport.width); cv.height = Math.round(viewport.height);
    await page.render({ canvasContext: cv.getContext("2d")!, viewport }).promise;
    images.push(await new Promise<Blob>((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error("render failed"))), "image/png")));
    cv.width = cv.height = 0;
  }
  await doc.destroy();
  return { images };
}
