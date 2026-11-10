import { toJpeg, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
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

export const download = (href: string, name: string) => { const a = document.createElement("a"); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
export const downloadBlob = (blob: Blob, name: string) => { const u = URL.createObjectURL(blob); download(u, name); setTimeout(() => URL.revokeObjectURL(u), 4000); };

export interface PdfCard { png: string; fmt: Fmt }

/**
 * Lays the cards out on A4 pages at their real size (millimetres), with optional crop marks at each corner.
 * Backs go on their own pages with each row mirrored, so the pages line up when printed double-sided and flipped on the long edge.
 */
export function buildPdf(fronts: PdfCard[], backs: PdfCard[], opts: { marks: boolean }): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const PW = 210, PH = 297, M = 10, GAP = opts.marks ? 7 : 4;
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
          doc.addImage(c.png, "JPEG", x, y, w, h);
          if (opts.marks) {
            doc.setDrawColor(0).setLineWidth(0.12);
            for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
              const sx = cx === x ? -1 : 1, sy = cy === y ? -1 : 1;
              doc.line(cx + sx * 1.2, cy, cx + sx * 4.2, cy); doc.line(cx, cy + sy * 1.2, cx, cy + sy * 4.2);
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
