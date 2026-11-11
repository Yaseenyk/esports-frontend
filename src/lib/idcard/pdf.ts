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

/**
 * One A4 page for the event report, drawn on a canvas in the browser (so any script in an event name prints correctly) and placed in a PDF.
 * White background for printing. Counts only: the report never holds a name.
 */
export async function reportToPdf(r: import("../report").Report): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const W = 1240, H = 1754, M = 90, INK = "#111827", SOFT = "#4b5563", LINE = "#d1d5db", ACC = "#0e7490";
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d")!;
  const font = (px: number, w = 400) => { c.font = `${w} ${px}px system-ui, "Segoe UI", sans-serif`; };
  const fit = (t: string, max: number) => { if (c.measureText(t).width <= max) return t; let s = t; while (s.length > 1 && c.measureText(`${s}…`).width > max) s = s.slice(0, -1); return `${s}…`; };
  const wrap = (t: string, max: number) => { const out: string[] = []; let line = ""; for (const w of t.split(" ")) { const next = line ? `${line} ${w}` : w; if (c.measureText(next).width > max && line) { out.push(line); line = w; } else line = next; } if (line) out.push(line); return out; };
  c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, H); c.textBaseline = "alphabetic";

  let y = M + 20;
  c.fillStyle = ACC; font(24, 700); c.fillText("EVENT REPORT", M, y);
  y += 62; c.fillStyle = INK; font(54, 700); c.fillText(fit(r.event.name, W - 2 * M), M, y);
  y += 40; c.fillStyle = SOFT; font(26); c.fillText(fit([r.event.date, r.event.venue].filter(Boolean).join("  ·  "), W - 2 * M), M, y);

  // Headline numbers
  y += 40;
  const stats: [string, string][] = [["People", String(r.total)], ["Checked in", `${r.present}`], ["Attendance", `${r.percent}%`], ["Did not arrive", String(r.noShows)], ["Under 18", String(r.under18)]];
  const bw = (W - 2 * M - 4 * 16) / 5;
  stats.forEach(([label, v], i) => {
    const x = M + i * (bw + 16);
    c.strokeStyle = LINE; c.lineWidth = 2; c.strokeRect(x, y, bw, 120);
    c.fillStyle = INK; font(46, 700); c.fillText(v, x + 18, y + 66);
    c.fillStyle = SOFT; font(21); c.fillText(label, x + 18, y + 100);
  });
  y += 120 + 44;
  c.fillStyle = INK; font(26);
  for (const l of wrap(r.summary, W - 2 * M)) { c.fillText(l, M, y); y += 38; }

  // Tables
  const table = (title: string, rows: { label: string; present: number; total: number }[], x: number, width: number, top: number, limit: number) => {
    let ty = top; c.fillStyle = ACC; font(22, 700); c.fillText(title.toUpperCase(), x, ty); ty += 14;
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x, ty); c.lineTo(x + width, ty); c.stroke(); ty += 34;
    const shown = rows.slice(0, limit), more = rows.length - shown.length;
    for (const row of shown) {
      c.fillStyle = INK; font(23); c.fillText(fit(row.label, width - 170), x, ty);
      c.textAlign = "right"; c.fillStyle = SOFT; c.fillText(`${row.present} of ${row.total}`, x + width, ty); c.textAlign = "left";
      ty += 12; c.strokeStyle = LINE; c.lineWidth = 1; c.beginPath(); c.moveTo(x, ty); c.lineTo(x + width, ty); c.stroke(); ty += 30;
    }
    if (more > 0) { c.fillStyle = SOFT; font(21); c.fillText(`and ${more} more`, x, ty); ty += 30; }
    return ty;
  };
  y += 24;
  const half = (W - 2 * M - 60) / 2;
  const t1 = table("Present by role", r.byRole, M, half, y, 10), t2 = table("Present by team", r.byTeam, M + half + 60, half, y, 10);
  y = Math.max(t1, t2) + 30;

  // Arrivals chart
  c.fillStyle = ACC; font(22, 700); c.fillText("ARRIVALS, EVERY 15 MINUTES", M, y); y += 20;
  const ch = Math.min(380, H - y - 150), cw = W - 2 * M;
  if (!r.buckets.length) { c.fillStyle = SOFT; font(24); c.fillText("No check-ins recorded yet.", M, y + 50); }
  else {
    const max = Math.max(1, ...r.buckets.map((b) => b.count)), n = r.buckets.length, gap = n > 40 ? 1 : 4, bwid = (cw - gap * (n - 1)) / n, base = y + ch;
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(M, base); c.lineTo(M + cw, base); c.stroke();
    r.buckets.forEach((b, i) => {
      const h = (b.count / max) * (ch - 40), x = M + i * (bwid + gap);
      c.fillStyle = r.peak && b.start === r.peak.start ? "#7c3aed" : ACC; c.fillRect(x, base - h, bwid, h);
    });
    c.fillStyle = SOFT; font(20);
    const step = Math.max(1, Math.ceil(n / 8));
    r.buckets.forEach((b, i) => { if (i % step === 0) c.fillText(b.label, M + i * (bwid + gap), base + 28); });
    if (r.peak) { c.fillStyle = INK; font(22); c.fillText(`Busiest: ${r.peak.label}, ${r.peak.count} ${r.peak.count === 1 ? "arrival" : "arrivals"}   (scale: 0 to ${max})`, M, base + 66); }
  }

  c.fillStyle = SOFT; font(20); c.textAlign = "center"; c.fillText("Made with Esports Hub", W / 2, H - 60); c.textAlign = "left";

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  doc.addImage(cv.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, 210, 297);
  cv.width = cv.height = 0;
  return doc.output("blob");
}
