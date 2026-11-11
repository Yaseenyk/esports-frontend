import { fitBlock, fitText, INCIDENT_COLUMNS, INCIDENT_WEIGHTS, REFEREE_NOTE, REFEREE_SECTIONS, unitOf, wrapLines, type KitPage } from "@/lib/printkits";

/** Fonts that are already on the device. Nothing is downloaded, and Devanagari falls back to the system font. */
const FAMILY = `system-ui, "Segoe UI", "Noto Sans", "Noto Sans Devanagari", "Nirmala UI", Mangal, sans-serif`;
const INK = "#111111", SOFT = "#444444", LINE = "#9a9a9a", ACC = "#0e5f73";

/**
 * Draws one page onto a canvas. `scale` is pixels per millimetre (2 for the preview, 6 for the PDF).
 * Always black on white so it prints well on any printer. User text is drawn as text only.
 */
export function drawKitPage(canvas: HTMLCanvasElement, p: KitPage, scale: number) {
  canvas.width = Math.round(p.w * scale); canvas.height = Math.round(p.h * scale);
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#ffffff"; c.fillRect(0, 0, canvas.width, canvas.height);
  c.textBaseline = "alphabetic";
  const u = unitOf(p.w, p.h), M = 12 * u;
  const font = (size: number, bold = false) => { c.font = `${bold ? 700 : 400} ${size * scale}px ${FAMILY}`; };
  const meas = (bold = false) => (t: string, s: number) => { font(s, bold); return c.measureText(t).width / scale; };
  const text = (t: string, x: number, y: number, size: number, o: { bold?: boolean; align?: CanvasTextAlign; color?: string; maxW?: number; min?: number } = {}) => {
    let s = size, out = t;
    if (o.maxW) { const f = fitText(meas(!!o.bold), t, o.maxW, size, o.min ?? size * 0.5); s = f.size; out = f.text; }
    font(s, o.bold); c.fillStyle = o.color ?? INK; c.textAlign = o.align ?? "left"; c.fillText(out, x * scale, y * scale);
  };
  const line = (x1: number, y1: number, x2: number, y2: number, w = 0.4, color = LINE) => { c.strokeStyle = color; c.lineWidth = w * scale; c.beginPath(); c.moveTo(x1 * scale, y1 * scale); c.lineTo(x2 * scale, y2 * scale); c.stroke(); };
  const rect = (x: number, y: number, w: number, h: number, lw = 0.5, color = INK) => { c.strokeStyle = color; c.lineWidth = lw * scale; c.strokeRect(x * scale, y * scale, w * scale, h * scale); };

  const header = (title: string, sub?: string) => {
    text(p.event || "Event name", M, M + 9 * u, 9 * u, { bold: true, maxW: p.w - 2 * M - (p.date ? 60 * u : 0), min: 5 * u });
    if (p.date) text(p.date, p.w - M, M + 9 * u, 6 * u, { align: "right", color: SOFT, maxW: 56 * u, min: 3.5 * u });
    text(sub ? `${title}  ·  ${sub}` : title, M, M + 20 * u, 6.5 * u, { bold: true, color: ACC, maxW: p.w - 2 * M });
    line(M, M + 25 * u, p.w - M, M + 25 * u, 0.8 * u, INK);
  };
  const footer = () => text("Made with Esports Hub (free printable kits)", p.w / 2, p.h - 6 * u, 3.2 * u, { align: "center", color: SOFT });

  if (p.type === "match") {
    header(p.label);
    const top = M + 38 * u, rowH = 24 * u, left = M, right = p.w - M;
    const boxW = 22 * u, noW = 12 * u, mid = (left + noW + right) / 2, nameW = (right - left - noW - 2 * boxW - 12 * u) / 2;
    text("Team A", left + noW, top - 3 * u, 3.6 * u, { bold: true, color: SOFT });
    text("Score", left + noW + nameW + 2 * u, top - 3 * u, 3.6 * u, { bold: true, color: SOFT });
    text("Score", right - nameW - boxW - 2 * u, top - 3 * u, 3.6 * u, { bold: true, color: SOFT });
    text("Team B", right - nameW, top - 3 * u, 3.6 * u, { bold: true, color: SOFT });
    p.rows.forEach((r, i) => {
      const y = top + i * rowH, base = y + rowH * 0.62;
      text(String(r.no), left + 2 * u, base, 8 * u, { bold: true });
      line(left + noW, base + 3 * u, left + noW + nameW, base + 3 * u);
      if (r.a) text(r.a, left + noW + 1 * u, base, 6.5 * u, { bold: true, maxW: nameW - 2 * u, min: 3 * u });
      rect(left + noW + nameW + 2 * u, y + 3 * u, boxW, rowH - 6 * u, 0.7 * u);
      text("vs", mid + 0, base, 4 * u, { align: "center", color: SOFT });
      rect(right - nameW - boxW - 2 * u, y + 3 * u, boxW, rowH - 6 * u, 0.7 * u);
      line(right - nameW, base + 3 * u, right, base + 3 * u);
      if (r.b) text(r.b, right - nameW + 1 * u, base, 6.5 * u, { bold: true, maxW: nameW - 2 * u, min: 3 * u });
    });
    const fy = p.h - M - 12 * u;
    text("Referee name", M, fy, 3.6 * u, { color: SOFT }); line(M + 26 * u, fy, M + 26 * u + (p.w - 2 * M) * 0.35, fy);
    const sx = M + 26 * u + (p.w - 2 * M) * 0.35 + 8 * u;
    text("Signature", sx, fy, 3.6 * u, { color: SOFT }); line(sx + 20 * u, fy, p.w - M, fy);
    footer();
  } else if (p.type === "br") {
    header(p.label, p.games > 1 ? `Match ${p.game} of ${p.games}` : undefined);
    const top = M + 38 * u, tw = p.w - 2 * M;
    const cols = [0.07, 0.5, 0.15, 0.13, 0.15].map((f) => f * tw);
    const xs = cols.map((_, i) => M + cols.slice(0, i).reduce((a, b) => a + b, 0));
    ["No.", "Team", "Placement", "Kills", "Total"].forEach((t, i) => text(t, xs[i]! + 2 * u, top + 6 * u, 4 * u, { bold: true }));
    const head = top + 9 * u;
    line(M, head, M + tw, head, 0.8 * u, INK);
    p.rows.forEach((r, i) => {
      const y = head + i * p.rowH;
      text(String(r.no), xs[0]! + 2 * u, y + p.rowH * 0.66, Math.min(5.5 * u, p.rowH * 0.5), { color: SOFT });
      if (r.team) text(r.team, xs[1]! + 2 * u, y + p.rowH * 0.66, Math.min(6.5 * u, p.rowH * 0.55), { bold: true, maxW: cols[1]! - 4 * u, min: 3 * u });
      line(M, y + p.rowH, M + tw, y + p.rowH);
    });
    const bottom = head + p.rows.length * p.rowH;
    xs.slice(1).forEach((x) => line(x, head - 9 * u, x, bottom, 0.4 * u));
    line(M, head - 9 * u, M + tw, head - 9 * u, 0.8 * u, INK); line(M + tw, head - 9 * u, M + tw, bottom, 0.4 * u);
    text("Total is the placement points plus the kills. Use the points table of your own event.", M, p.h - M - 3 * u, 3.4 * u, { color: SOFT, maxW: tw, min: 2.4 * u });
    footer();
  } else if (p.type === "referee") {
    header(p.label);
    const tw = p.w - 2 * M, top = M + 32 * u, avail = p.h - top - M - 18 * u;
    const own = 6 * 10 * u * 0.6 + 14 * u; // room for own rules at the bottom
    const bodyH = avail - own;
    const need = (s: number) => REFEREE_SECTIONS.reduce((a, sec) => a + s * 1.9 + sec.items.reduce((b, it) => b + wrapLines(meas(), it, tw - 9 * s, s).length * s * 1.35 + s * 0.45, 0) + s * 0.6, 0);
    let s = 5.2 * u;
    while (s > 2.8 * u && need(s) > bodyH) s -= 0.2 * u;
    let y = top;
    for (const sec of REFEREE_SECTIONS) {
      text(sec.title, M, y + s * 1.2, s * 1.25, { bold: true, color: ACC }); y += s * 1.9;
      for (const it of sec.items) {
        rect(M, y + s * 0.1, s * 0.85, s * 0.85, 0.5 * u);
        const ls = wrapLines(meas(), it, tw - 9 * s, s);
        ls.forEach((l, i) => text(l, M + s * 1.6, y + s * 0.95 + i * s * 1.35, s));
        y += ls.length * s * 1.35 + s * 0.45;
      }
      y += s * 0.6;
    }
    const noteY = Math.max(y + 2 * u, p.h - M - 18 * u - own + 4 * u);
    wrapLines(meas(), REFEREE_NOTE, tw, 3.6 * u).forEach((l, i) => text(l, M, noteY + i * 4.8 * u, 3.6 * u, { color: SOFT }));
    for (let ly = noteY + 14 * u; ly < p.h - M - 14 * u; ly += 9 * u) line(M, ly, M + tw, ly);
    footer();
  } else if (p.type === "incident") {
    header(p.label);
    const tw = p.w - 2 * M, top = M + 32 * u;
    const widths = INCIDENT_WEIGHTS.map((f) => f * tw), xs = widths.map((_, i) => M + widths.slice(0, i).reduce((a, b) => a + b, 0));
    INCIDENT_COLUMNS.forEach((t, i) => text(t, xs[i]! + 1.5 * u, top + 6 * u, 3.8 * u, { bold: true, maxW: widths[i]! - 2 * u, min: 2.6 * u }));
    const head = top + 9 * u;
    line(M, head, M + tw, head, 0.8 * u, INK);
    for (let i = 0; i < p.rows; i++) { const y = head + (i + 1) * p.rowH; text(String(p.start + i), xs[0]! + 1.5 * u, y - p.rowH * 0.3, 4 * u, { color: SOFT }); line(M, y, M + tw, y); }
    const bottom = head + p.rows * p.rowH;
    xs.forEach((x) => line(x, top, x, bottom, 0.4 * u)); line(M + tw, top, M + tw, bottom, 0.4 * u); line(M, top, M + tw, top, 0.8 * u, INK);
    footer();
  } else if (p.type === "sign") {
    const bw = 5 * u;
    rect(M / 2, M / 2, p.w - M, p.h - M, bw, INK);
    const extras = [p.sign.hi, p.sign.mr].filter((t): t is string => !!t);
    const innerW = p.w - 2 * M - 10 * u, availH = p.h - 2 * M - 24 * u;
    const en = fitBlock(meas(true), p.sign.en, innerW, availH * (extras.length ? 0.5 : 0.9), availH * 0.34, 12 * u, 1.1);
    const blocks = [{ lines: en.lines, size: en.size }];
    for (const t of extras) { const b = fitBlock(meas(true), t, innerW, availH * 0.2, en.size * 0.6, 8 * u, 1.25); blocks.push({ lines: b.lines, size: b.size }); }
    const gap = 8 * u, heights = blocks.map((b) => b.lines.length * b.size * 1.12);
    let y = (p.h - (heights.reduce((a, b) => a + b, 0) + gap * (blocks.length - 1))) / 2;
    blocks.forEach((b, bi) => {
      b.lines.forEach((l, i) => text(l, p.w / 2, y + b.size * 0.88 + i * b.size * 1.12, b.size, { bold: true, align: "center" }));
      y += heights[bi]! + gap;
    });
    text(p.event, p.w / 2, p.h - M - 2 * u, 4.5 * u, { align: "center", color: SOFT, maxW: p.w - 4 * M, min: 3 * u });
  } else {
    header(p.label, p.date || undefined);
    if (!p.geo) { text("Add at least 2 teams to draw the bracket.", p.w / 2, p.h / 2, 7 * u, { align: "center", color: SOFT }); footer(); return; }
    const g = p.geo, bs = Math.min(g.boxes[0]!.h / 2.4, 6 * u);
    g.roundNames.forEach((r) => text(r.name, r.x + r.w / 2, p.area.y - 3 * u, Math.min(4.6 * u, r.w / 7), { bold: true, align: "center", color: ACC, maxW: r.w, min: 2.6 * u }));
    g.links.forEach((l) => { line(l.x1, l.y1, l.xm, l.y1, 0.5 * u, INK); line(l.xm, l.y1, l.xm, l.y2, 0.5 * u, INK); line(l.xm, l.y2, l.x2, l.y2, 0.5 * u, INK); });
    const row = (x: number, y: number, w: number, h: number, t: string, bye: boolean, auto: boolean, withScore: boolean) => {
      const sw = withScore ? Math.min(w * 0.22, 12 * u) : 0;
      if (withScore) rect(x + w - sw, y, sw, h, 0.4 * u, LINE);
      const label = t || "";
      if (label) text(label, x + 1.5 * u, y + h * 0.7, bs, { bold: !bye, color: bye ? SOFT : INK, maxW: w - sw - 3 * u, min: 2 * u });
      if (auto && !bye) text("▸", x + w - sw - 1.2 * u, y + h * 0.7, bs * 0.7, { align: "right", color: SOFT });
    };
    g.boxes.forEach((b) => {
      rect(b.x, b.y, b.w, b.h, 0.6 * u);
      line(b.x, b.y + b.h / 2, b.x + b.w, b.y + b.h / 2, 0.4 * u, LINE);
      row(b.x, b.y, b.w, b.h / 2, b.a, b.aBye, b.aAuto, !b.aBye);
      row(b.x, b.y + b.h / 2, b.w, b.h / 2, b.b, b.bBye, b.bAuto, !b.bBye);
    });
    const ch = g.champion;
    rect(ch.x, ch.y, ch.w, ch.h, 1 * u);
    text("Champion", ch.x + ch.w / 2, ch.y - 3 * u, Math.min(4.6 * u, ch.w / 7), { bold: true, align: "center", color: ACC });
    if (g.byes > 0) text("A bye means no opponent: the team goes straight to the next round.", M, p.h - M, 3.2 * u, { color: SOFT });
    footer();
  }
}

/** Draws a page to a fresh canvas and returns it. The caller frees it by setting width and height to 0. */
export function pageCanvas(p: KitPage, scale: number): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  drawKitPage(cv, p, scale);
  return cv;
}
