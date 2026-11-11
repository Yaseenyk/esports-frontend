import { HOW_COUNTED, LOADS_NOT_PEOPLE, SPONSORS_SHOWN, chartBars, shortDay, sourceRows, summaryText, type SponsorReportData } from "@/lib/sponsorreport";

export interface SponsorPdfInput {
  eventName: string; periodName: string; data: SponsorReportData;
  sponsors: { name: string; logo?: string }[];
}

const loadImage = (src: string) => new Promise<HTMLImageElement | null>((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });

/**
 * One A4 page: event, period, sponsors (names and logos), the page-load numbers and a plain paragraph on how they are counted.
 * Drawn on a canvas in the browser (like the event report), white for printing. Counts only; it says loads, never people.
 */
export async function sponsorReportToPdf(r: SponsorPdfInput): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const W = 1240, H = 1754, M = 90, INK = "#111827", SOFT = "#4b5563", LINE = "#d1d5db", ACC = "#0e7490";
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d")!;
  const font = (px: number, w = 400) => { c.font = `${w} ${px}px system-ui, "Segoe UI", sans-serif`; };
  const fit = (t: string, max: number) => { if (c.measureText(t).width <= max) return t; let s = t; while (s.length > 1 && c.measureText(`${s}…`).width > max) s = s.slice(0, -1); return `${s}…`; };
  const wrap = (t: string, max: number) => { const out: string[] = []; let line = ""; for (const w of t.split(" ")) { const next = line ? `${line} ${w}` : w; if (c.measureText(next).width > max && line) { out.push(line); line = w; } else line = next; } if (line) out.push(line); return out; };
  c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, H); c.textBaseline = "alphabetic";
  const cw = W - 2 * M;

  let y = M + 20;
  c.fillStyle = ACC; font(24, 700); c.fillText("SPONSOR REPORT", M, y);
  y += 62; c.fillStyle = INK; font(54, 700); c.fillText(fit(r.eventName, cw), M, y);
  y += 40; c.fillStyle = SOFT; font(26); c.fillText(fit(r.periodName, cw), M, y);

  // Sponsors
  y += 56; c.fillStyle = ACC; font(22, 700); c.fillText("SPONSORS ON THE LIVE PAGE", M, y); y += 14;
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(M, y); c.lineTo(M + cw, y); c.stroke(); y += 24;
  if (!r.sponsors.length) { c.fillStyle = SOFT; font(24); c.fillText("No sponsors were set on the live page.", M, y + 30); y += 60; }
  else {
    const n = r.sponsors.length, cell = (cw - (n - 1) * 20) / n, boxH = 150;
    const imgs = await Promise.all(r.sponsors.map((s) => (s.logo ? loadImage(s.logo) : Promise.resolve(null))));
    r.sponsors.forEach((s, i) => {
      const x = M + i * (cell + 20);
      c.strokeStyle = LINE; c.lineWidth = 2; c.strokeRect(x, y, cell, boxH);
      const img = imgs[i];
      if (img) { const k = Math.min((cell - 30) / img.width, 90 / img.height, 1.5); c.drawImage(img, x + (cell - img.width * k) / 2, y + 12 + (90 - img.height * k) / 2, img.width * k, img.height * k); }
      c.fillStyle = INK; font(22, 600); c.textAlign = "center"; c.fillText(fit(s.name, cell - 20), x + cell / 2, y + boxH - 18); c.textAlign = "left";
    });
    y += boxH + 36;
    c.fillStyle = SOFT; font(22); c.fillText(SPONSORS_SHOWN, M, y); y += 20;
  }

  // Numbers
  y += 40;
  c.strokeStyle = LINE; c.lineWidth = 2; c.strokeRect(M, y, cw, 130);
  c.fillStyle = INK; font(64, 700); c.fillText(String(r.data.total), M + 24, y + 80);
  const tw = c.measureText(String(r.data.total)).width;
  c.fillStyle = SOFT; font(26); c.fillText("page loads in this period", M + 24 + tw + 20, y + 78);
  y += 130 + 40;
  c.fillStyle = INK; font(26);
  for (const l of wrap(summaryText(r.data, r.periodName), cw)) { c.fillText(l, M, y); y += 38; }
  c.fillStyle = SOFT; font(22); c.fillText(LOADS_NOT_PEOPLE, M, y); y += 50;

  // By where it was seen
  c.fillStyle = ACC; font(22, 700); c.fillText("WHERE IT WAS SEEN", M, y); y += 14;
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(M, y); c.lineTo(M + cw, y); c.stroke(); y += 36;
  for (const s of sourceRows(r.data.bySource)) {
    c.fillStyle = INK; font(24); c.fillText(s.label, M, y);
    c.textAlign = "right"; c.fillStyle = SOFT; c.fillText(`${s.hits} page ${s.hits === 1 ? "load" : "loads"}`, M + cw, y); c.textAlign = "left";
    y += 12; c.strokeStyle = LINE; c.lineWidth = 1; c.beginPath(); c.moveTo(M, y); c.lineTo(M + cw, y); c.stroke(); y += 32;
  }

  // By day
  y += 24; c.fillStyle = ACC; font(22, 700); c.fillText("PAGE LOADS BY DAY", M, y); y += 20;
  const ch = 300, days = r.data.days;
  if (!days.length || r.data.total === 0) { c.fillStyle = SOFT; font(24); c.fillText("Nothing was counted in this period.", M, y + 50); y += 120; }
  else {
    const base = y + ch, { bars, max } = chartBars(days, cw, ch - 40);
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(M, base); c.lineTo(M + cw, base); c.stroke();
    for (const b of bars) { c.fillStyle = b.peak ? "#7c3aed" : ACC; c.fillRect(M + b.x, base - b.h, b.w, b.h); }
    c.fillStyle = SOFT; font(20);
    const step = Math.max(1, Math.ceil(days.length / 8));
    bars.forEach((b, i) => { if (i % step === 0) c.fillText(shortDay(b.day), M + b.x, base + 28); });
    if (r.data.peak) { c.fillStyle = INK; font(22); c.fillText(`Busiest day (purple): ${shortDay(r.data.peak.day)}, ${r.data.peak.hits} page ${r.data.peak.hits === 1 ? "load" : "loads"}   (scale: 0 to ${max})`, M, base + 66); }
    y = base + 100;
  }

  // How counted
  y += 20; c.fillStyle = ACC; font(22, 700); c.fillText("HOW THESE NUMBERS ARE COUNTED", M, y); y += 14;
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(M, y); c.lineTo(M + cw, y); c.stroke(); y += 36;
  c.fillStyle = INK; font(22);
  for (const l of wrap(HOW_COUNTED, cw)) { c.fillText(l, M, y); y += 32; }

  c.fillStyle = SOFT; font(20); c.textAlign = "center"; c.fillText("Made with Esports Hub", W / 2, H - 60); c.textAlign = "left";

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  doc.addImage(cv.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, 210, 297);
  cv.width = cv.height = 0;
  return doc.output("blob");
}
