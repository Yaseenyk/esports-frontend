/**
 * The run of show as a printable PDF: A4 portrait, white background, a tick box, time, what, who and (if any) a short note per row.
 * Drawn on a canvas in the browser, so names in any script print correctly, then placed in a PDF with jsPDF.
 * Up to 26 rows fit on one page; a longer list continues on the next pages with the header repeated.
 */
import type { RosItem } from "./runofshow";
import { STATUS_LABEL, sortByTime, whenText } from "./runofshow";

const W = 1240, H = 1754, M = 80;
const INK = "#111827", SOFT = "#4b5563", LINE = "#d1d5db", ACC = "#0e7490";
export const ROWS_ONE_PAGE = 26;

/** How many pages a list of this length needs. */
export const pageCount = (n: number): number => Math.max(1, Math.ceil(n / ROWS_ONE_PAGE));

export interface PdfMeta { eventName: string; date?: string; venue?: string }

export async function runOfShowToPdf(items: RosItem[], meta: PdfMeta, opts: { notes?: boolean } = {}): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const list = sortByTime(items);
  const pages = pageCount(list.length);
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  for (let p = 0; p < pages; p++) {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    drawPage(cv.getContext("2d")!, list.slice(p * ROWS_ONE_PAGE, (p + 1) * ROWS_ONE_PAGE), meta, p, pages, opts.notes !== false);
    if (p > 0) doc.addPage();
    doc.addImage(cv.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, 297);
    cv.width = cv.height = 0;
  }
  return doc.output("blob");
}

function drawPage(c: CanvasRenderingContext2D, rows: RosItem[], meta: PdfMeta, page: number, pages: number, notes: boolean) {
  const font = (px: number, w = 400) => { c.font = `${w} ${px}px system-ui, "Segoe UI", sans-serif`; };
  const fit = (t: string, max: number) => { if (c.measureText(t).width <= max) return t; let s = t; while (s.length > 1 && c.measureText(`${s}…`).width > max) s = s.slice(0, -1); return `${s}…`; };
  c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, H); c.textBaseline = "alphabetic";

  let y = M + 16;
  c.fillStyle = ACC; font(22, 700); c.fillText(`RUN OF SHOW${pages > 1 ? `  ·  PAGE ${page + 1} OF ${pages}` : ""}`, M, y);
  y += 56; c.fillStyle = INK; font(48, 700); c.fillText(fit(meta.eventName, W - 2 * M), M, y);
  y += 38; c.fillStyle = SOFT; font(24); c.fillText(fit([meta.date, meta.venue].filter(Boolean).join("  ·  "), W - 2 * M), M, y);
  y += 30;

  const cols = { box: M, time: M + 56, what: M + 270, who: W - M - 250 };
  c.fillStyle = SOFT; font(18, 700);
  c.fillText("TIME", cols.time, y + 22); c.fillText("WHAT", cols.what, y + 22); c.fillText("WHO", cols.who, y + 22);
  y += 34; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(M, y); c.lineTo(W - M, y); c.stroke();

  if (rows.length === 0) { c.fillStyle = SOFT; font(26); c.fillText("Nothing has been added yet.", M, y + 60); return; }

  const bottom = H - M - 40;
  const rowH = Math.min(68, Math.floor((bottom - y) / Math.min(ROWS_ONE_PAGE, Math.max(rows.length, 12))));
  rows.forEach((r) => {
    const base = y + Math.round(rowH * (notes && r.notes ? 0.5 : 0.68));
    // tick box: a done item is ticked, so the sheet also works as a record
    c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(cols.box, y + (rowH - 28) / 2, 28, 28);
    if (r.status === "done") { c.beginPath(); c.moveTo(cols.box + 6, y + rowH / 2); c.lineTo(cols.box + 13, y + rowH / 2 + 8); c.lineTo(cols.box + 23, y + rowH / 2 - 8); c.stroke(); }
    c.fillStyle = INK; font(26, 700); c.fillText(fit(whenText(r), cols.what - cols.time - 12), cols.time, base);
    font(26, r.status === "done" ? 400 : 600); c.fillStyle = r.status === "done" ? SOFT : INK;
    const status = r.status === "doing" ? `  (${STATUS_LABEL.doing.toLowerCase()})` : "";
    c.fillText(fit(r.title + status, cols.who - cols.what - 16), cols.what, base);
    c.fillStyle = INK; font(24); c.fillText(fit(r.ownerName || "-", W - M - cols.who), cols.who, base);
    if (notes && r.notes) { c.fillStyle = SOFT; font(19); c.fillText(fit(r.notes, W - M - cols.what), cols.what, base + 22); }
    y += rowH;
    c.strokeStyle = LINE; c.lineWidth = 1; c.beginPath(); c.moveTo(M, y); c.lineTo(W - M, y); c.stroke();
  });

  c.fillStyle = SOFT; font(18); c.fillText("Made with Esports Hub. Times are local to the venue.", M, H - M + 10);
}
