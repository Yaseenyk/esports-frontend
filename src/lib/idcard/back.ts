import { accentOf } from "./recolor";
import { FORMATS, fmtOf, uid, type El, type FontKey, type Template } from "./types";

/**
 * The back of a card: the event, a bigger QR code, who to return it to, an emergency contact, the rules and a sponsor strip.
 * It takes its colours from the front so the two sides match. A wristband strip has no back.
 */
const fld = (field: El["field"], x: number, y: number, w: number, h: number, size: number, color: string, font: FontKey, o: Partial<El> = {}): El => ({ id: uid(), kind: "field", field, x, y, w, h, rot: 0, opacity: 1, size, color, font, weight: 600, align: "left", ...o });
const txt = (text: string, x: number, y: number, w: number, h: number, size: number, color: string, font: FontKey, o: Partial<El> = {}): El => ({ id: uid(), kind: "text", text, x, y, w, h, rot: 0, opacity: 1, size, color, font, weight: 600, align: "left", ...o });
const rect = (x: number, y: number, w: number, h: number, fill: string, o: Partial<El> = {}): El => ({ id: uid(), kind: "rect", x, y, w, h, rot: 0, opacity: 1, fill, radius: 0, ...o });

const lum = (hex: string) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return 0;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export function buildBack(front: Template): Template["back"] {
  const fmt = fmtOf(front);
  if (fmt === "strip") return undefined;
  const F = FORMATS[fmt], A = F.h / F.w;
  const light = lum(front.bg.a) > 0.7;
  const accent = accentOf(front) ?? "#22d3ee";
  const ink = light ? "#0f172a" : "#f8fafc", muted = light ? "#64748b" : "#94a3b8";
  const bg = light ? { a: "#ffffff", b: "#eef2f7", angle: 180 } : { a: "#0b0f14", b: "#151a22", angle: 165 };
  const bar = rect(0, 0, 100, A > 1 ? 2 : 3.5, accent);

  if (A > 1) {
    // Upright cards: everything stacked down the middle.
    const qw = Math.min(54, 38 + (A - 1.4) * 12), qh = qw / A;
    const qy = 21;
    return {
      bg,
      els: [
        bar,
        fld("event", 7, 5.5, 86, 5, 6, accent, "display", { weight: 800, upper: true, align: "center" }),
        fld("date", 7, 11, 86, 2.6, 3.1, muted, "body", { align: "center" }),
        fld("venue", 7, 13.8, 86, 2.6, 3.1, muted, "body", { align: "center" }),
        { id: uid(), kind: "qr", x: (100 - qw) / 2, y: qy, w: qw, h: qh, rot: 0, opacity: 1, color: "#111111", fill: "#ffffff", radius: 4 },
        fld("id", 7, qy + qh + 1.4, 86, 2.8, 3.6, ink, "mono", { align: "center", weight: 600 }),
        txt("IF FOUND, PLEASE RETURN TO", 7, qy + qh + 6, 86, 2.2, 2.4, muted, "body", { align: "center", spacing: 0.25, weight: 600 }),
        fld("organiser", 7, qy + qh + 8.6, 86, 3.4, 4.4, ink, "display", { align: "center", weight: 800 }),
        fld("emergency", 7, qy + qh + 12.4, 86, 2.6, 3.2, muted, "body", { align: "center" }),
        fld("rules", 9, qy + qh + 17, 82, 12, 2.8, ink, "body", { lines: true, weight: 500, opacity: 0.9 }),
        { id: uid(), kind: "image", bind: "sponsor", x: 30, y: 91, w: 40, h: 5.6 / (A / 1.6), rot: 0, opacity: 1 },
      ],
    };
  }

  // Wallet cards: the QR on the left, the words on the right.
  const qw = 30, qh = qw / A;
  return {
    bg,
    els: [
      bar,
      fld("event", 6, 9, 88, 9, 5.6, accent, "display", { weight: 800, upper: true }),
      { id: uid(), kind: "qr", x: 6, y: 24, w: qw, h: Math.min(qh, 62), rot: 0, opacity: 1, color: "#111111", fill: "#ffffff", radius: 4 },
      fld("id", 6, 24 + Math.min(qh, 62) + 2, qw, 7, 3.4, ink, "mono", { align: "center", weight: 600 }),
      txt("IF FOUND, PLEASE RETURN TO", 42, 24, 52, 6, 2.2, muted, "body", { spacing: 0.2 }),
      fld("organiser", 42, 31, 52, 8, 4.2, ink, "display", { weight: 800 }),
      fld("emergency", 42, 40, 52, 6, 3, muted, "body"),
      fld("rules", 42, 50, 52, 30, 2.6, ink, "body", { lines: true, weight: 500, opacity: 0.9 }),
      { id: uid(), kind: "image", bind: "sponsor", x: 72, y: 83, w: 22, h: 12, rot: 0, opacity: 1 },
      fld("date", 6, 88, 60, 6, 2.6, muted, "body"),
    ],
  };
}
