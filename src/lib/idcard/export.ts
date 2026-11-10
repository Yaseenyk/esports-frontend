import { toJpeg, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { download, downloadBlob } from "./download";
export { download, downloadBlob };
import { FORMATS, type Fmt } from "./types";

/** Draws one finished card (the .idcard-box element) to a sharp PNG. targetPx is the wanted width in pixels; 1100 is about 330 dpi on a wallet card. */
export async function cardToPng(node: HTMLElement, targetPx = 1100): Promise<string> {
  const w = node.getBoundingClientRect().width || 300;
  return toPng(node, { pixelRatio: Math.max(1, targetPx / w), cacheBust: true, skipFonts: false });
}

/** A JPEG of the card for PDFs: far smaller than a PNG, and a print has no transparency anyway (the rounded corners print white). */
export async function cardToJpeg(node: HTMLElement, targetPx = 1100): Promise<string> {
  const w = node.getBoundingClientRect().width || 300;
  return toJpeg(node, { pixelRatio: Math.max(1, targetPx / w), quality: 0.92, backgroundColor: "#ffffff", cacheBust: true });
}

/**
 * A print-shop version of a card: square corners, with `bleedMm` of extra edge around the trim size. The extra edge is made by
 * repeating the outermost pixels outward, which is the standard way to extend a design that already runs to the edge.
 */
export async function cardToBleedJpeg(node: HTMLElement, fmt: Fmt, bleedMm: number, targetPx = 1100): Promise<string> {
  const prev = node.style.borderRadius;
  node.style.borderRadius = "0";
  let url: string;
  try { url = await cardToJpeg(node, targetPx); } finally { node.style.borderRadius = prev; }
  const img = new Image(); img.src = url; await img.decode();
  const b = Math.round((bleedMm / FORMATS[fmt].w) * img.width);
  const cv = document.createElement("canvas"); cv.width = img.width + 2 * b; cv.height = img.height + 2 * b;
  const c = cv.getContext("2d")!;
  c.drawImage(img, b, b);
  const w = img.width, h = img.height;
  c.drawImage(img, 0, 0, w, 1, b, 0, w, b); c.drawImage(img, 0, h - 1, w, 1, b, b + h, w, b); // top, bottom
  c.drawImage(img, 0, 0, 1, h, 0, b, b, h); c.drawImage(img, w - 1, 0, 1, h, b + w, b, b, h); // left, right
  c.drawImage(img, 0, 0, 1, 1, 0, 0, b, b); c.drawImage(img, w - 1, 0, 1, 1, b + w, 0, b, b); // corners
  c.drawImage(img, 0, h - 1, 1, 1, 0, b + h, b, b); c.drawImage(img, w - 1, h - 1, 1, 1, b + w, b + h, b, b);
  return cv.toDataURL("image/jpeg", 0.92);
}


export interface PdfCard { png: string; fmt: Fmt }

/**
 * Lays the cards out on A4 pages at their real size (millimetres), with optional crop marks at each corner.
 * Backs go on their own pages with each row mirrored, so the pages line up when printed double-sided and flipped on the long edge.
 */
export interface SheetOptions { marks: boolean; bleedMm?: number; /** Space between cards (mm). Default fits crop marks. */ gapMm?: number; /** Margin on every page edge (mm). Default 10. */ marginMm?: number; paper?: "a4" | "letter" }
export const PAPER = { a4: { w: 210, h: 297 }, letter: { w: 215.9, h: 279.4 } } as const;

export function buildPdf(fronts: PdfCard[], backs: PdfCard[], opts: SheetOptions): Blob {
  const paper = PAPER[opts.paper ?? "a4"];
  const doc = new jsPDF({ unit: "mm", format: opts.paper === "letter" ? "letter" : "a4", orientation: "portrait" });
  const PW = paper.w, PH = paper.h, M = Math.max(0, opts.marginMm ?? 10), bleed = opts.bleedMm ?? 0;
  const GAP = Math.max(opts.gapMm !== undefined ? Math.max(0, opts.gapMm) : opts.marks ? 7 : 4, 2 * bleed + (opts.gapMm !== undefined ? 0 : 3));
  let first = true;

  const place = (cards: PdfCard[], mirror: boolean) => {
    for (const fmt of Object.keys(FORMATS) as Fmt[]) {
      const group = cards.filter((c) => c.fmt === fmt);
      if (!group.length) continue;
      const { w, h } = FORMATS[fmt];
      const cols = Math.max(1, Math.floor((PW - 2 * M + GAP) / (w + GAP))), rows = Math.max(1, Math.floor((PH - 2 * M + GAP) / (h + GAP)));
      const per = cols * rows;
      const left = (PW - (cols * w + (cols - 1) * GAP)) / 2;
      for (let i = 0; i < group.length; i += per) {
        if (!first) doc.addPage(); first = false;
        group.slice(i, i + per).forEach((c, k) => {
          const r = Math.floor(k / cols); let col = k % cols;
          if (mirror) col = cols - 1 - col;
          const x = left + col * (w + GAP), y = M + r * (h + GAP);
          doc.addImage(c.png, "JPEG", x - bleed, y - bleed, w + 2 * bleed, h + 2 * bleed);
          if (opts.marks) {
            doc.setDrawColor(0).setLineWidth(0.12);
            for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
              const sx = cx === x ? -1 : 1, sy = cy === y ? -1 : 1;
              doc.line(cx + sx * (1.2 + bleed), cy, cx + sx * (4.2 + bleed), cy); doc.line(cx, cy + sy * (1.2 + bleed), cx, cy + sy * (4.2 + bleed));
            }
          }
        });
      }
    }
  };
  place(fronts, false);
  place(backs, true);
  return doc.output("blob");
}
