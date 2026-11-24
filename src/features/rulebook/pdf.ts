/**
 * Browser-only: draws the rulebook text on A4-sized canvases (so any script prints correctly) and places them in a PDF with jsPDF,
 * the same way the run of show PDF is made. Nothing is uploaded.
 */
import { layoutLines, paginate, parseBlocks, type Block } from "@/features/rulebook/domain";

const W = 1240, H = 1754, M = 100, FOOT = 70;
const INK = "#111827", SOFT = "#4b5563", ACC = "#0e7490";
const FONT: Record<Block["kind"], [number, number]> = { title: [44, 700], heading: [30, 700], bullet: [24, 400], para: [24, 400] };
const fam = `system-ui, "Segoe UI", Arial, sans-serif`;

export async function rulebookToPdf(text: string, footer: string): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  if (!c) throw new Error("The PDF could not be made in this browser.");
  const setFont = (k: Block["kind"]) => { const [px, w] = FONT[k]; c.font = `${w} ${px}px ${fam}`; };
  const lines = layoutLines(parseBlocks(text), W - 2 * M, (k, s) => { setFont(k); return c.measureText(s).width; });
  const pages = paginate(lines, H - 2 * M - FOOT);
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  pages.forEach((page, p) => {
    c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, H); c.textBaseline = "alphabetic";
    let y = M;
    page.forEach((l, k) => {
      y += (k ? l.gap : 0) + l.h;
      setFont(l.kind);
      c.fillStyle = l.kind === "heading" ? ACC : INK;
      const x = l.kind === "bullet" ? M + 32 : M;
      if (l.kind === "bullet" && l.first) { c.fillStyle = ACC; c.fillText("•", M + 6, y - 8); c.fillStyle = INK; }
      c.fillText(l.text, x, y - 8);
    });
    c.fillStyle = SOFT; c.font = `400 18px ${fam}`;
    c.fillText(footer, M, H - M + 20);
    c.textAlign = "right"; c.fillText(`Page ${p + 1} of ${pages.length}`, W - M, H - M + 20); c.textAlign = "left";
    if (p > 0) doc.addPage();
    doc.addImage(cv.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, 297);
  });
  cv.width = cv.height = 0;
  return doc.output("blob");
}
