/**
 * Draws the stats story card on a canvas in the browser and returns a PNG Blob. Nothing is uploaded. Flat brand style: ink background, matte boxes,
 * cyan accent, green "Verified" label, a neutral "Self-logged" label; no gradients, glow or photos. Text is drawn as text (never parsed as markup).
 */
import QRCode from "qrcode";
import { fitText, type ShareFormat } from "@/lib/share-cards";
import { H, storyLayout, type StoryInput, type StoryStat } from "@/features/player-card/story";

const C = { ink: "#05070A", surface: "#0A0B0D", line: "rgba(255,255,255,0.12)", text: "#F4F4F5", sub: "#D4D4D8", muted: "#A1A1AA", cyan: "#22D3EE", success: "#4ADE80" };
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const PAD = 72;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, colour: string) {
  ctx.font = `700 28px ${FONT}`;
  const w = ctx.measureText(text).width + 32;
  ctx.strokeStyle = colour; ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, 40, 20); ctx.stroke();
  ctx.fillStyle = colour; ctx.textBaseline = "middle"; ctx.fillText(text, x + 16, y + 21);
}

function tiles(ctx: CanvasRenderingContext2D, stats: StoryStat[], y: number, w: number) {
  const colW = (w - PAD * 2 - 24) / 2;
  stats.slice(0, 4).forEach((s, i) => {
    const x = PAD + (i % 2) * (colW + 24), ty = y + Math.floor(i / 2) * H.statRow;
    ctx.fillStyle = C.surface; ctx.strokeStyle = C.line; ctx.lineWidth = 2;
    roundRect(ctx, x, ty, colW, H.statRow - 16, 20); ctx.fill(); ctx.stroke();
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = C.text; ctx.font = `700 48px ${FONT}`;
    ctx.fillText(fitText(s.value, colW - 40, (t) => ctx.measureText(t).width), x + 20, ty + 58);
    ctx.fillStyle = C.muted; ctx.font = `400 26px ${FONT}`;
    ctx.fillText(fitText(s.label, colW - 40, (t) => ctx.measureText(t).width), x + 20, ty + 92);
  });
}

function drawQr(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number) {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const n = qr.modules.size, quiet = 3, cell = Math.floor(size / (n + quiet * 2));
  const real = cell * (n + quiet * 2), ox = x + Math.floor((size - real) / 2), oy = y + Math.floor((size - real) / 2);
  ctx.fillStyle = "#FFFFFF"; roundRect(ctx, ox, oy, real, real, 16); ctx.fill();
  ctx.fillStyle = "#000000";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.modules.get(r, c)) ctx.fillRect(ox + (c + quiet) * cell, oy + (r + quiet) * cell, cell, cell);
}

export async function renderStory(input: StoryInput, format: ShareFormat): Promise<Blob> {
  const { blocks, w, h } = storyLayout(input, format);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, w, h);
  const measure = (t: string) => ctx.measureText(t).width;
  for (const b of blocks) {
    ctx.textBaseline = "alphabetic";
    if (b.kind === "kicker") { ctx.fillStyle = C.cyan; ctx.font = `700 30px ${FONT}`; ctx.fillText("ESPORTS PLAYER", PAD, b.y + 32); }
    if (b.kind === "handle") { ctx.fillStyle = C.text; ctx.font = `800 100px ${FONT}`; ctx.fillText(fitText(input.handle, w - PAD * 2, measure), PAD, b.y + 100); }
    if (b.kind === "subtitle") { ctx.fillStyle = C.sub; ctx.font = `400 36px ${FONT}`; ctx.fillText(fitText(input.subtitle, w - PAD * 2, measure), PAD, b.y + 38); }
    if (b.kind === "verified") { label(ctx, "VERIFIED", PAD, b.y, C.success); tiles(ctx, input.verified, b.y + H.label + 8, w); }
    if (b.kind === "self" && input.selfLogged) { label(ctx, "SELF-LOGGED (typed by the player)", PAD, b.y, C.muted); tiles(ctx, input.selfLogged, b.y + H.label + 8, w); }
    if (b.kind === "badges") {
      label(ctx, "BADGES", PAD, b.y, C.cyan);
      ctx.fillStyle = C.text; ctx.font = `600 32px ${FONT}`;
      ctx.fillText(fitText(input.badges.join("  ·  "), w - PAD * 2, measure), PAD, b.y + H.label + 40);
    }
    if (b.kind === "qr" && input.qr) {
      const size = b.h - H.qrCaption;
      drawQr(ctx, input.qr, Math.floor((w - size) / 2), b.y, size);
      ctx.fillStyle = C.sub; ctx.font = `400 30px ${FONT}`; ctx.textAlign = "center";
      ctx.fillText(fitText(input.qrCaption, w - PAD * 2, measure), w / 2, b.y + size + 40);
      ctx.textAlign = "left";
    }
    if (b.kind === "footer") { ctx.fillStyle = C.muted; ctx.font = `400 28px ${FONT}`; ctx.textAlign = "center"; ctx.fillText(fitText(input.footer, w - PAD * 2, measure), w / 2, b.y + 30); ctx.textAlign = "left"; }
  }
  return new Promise((resolve, reject) => canvas.toBlob((bl) => (bl ? resolve(bl) : reject(new Error("png failed"))), "image/png"));
}
