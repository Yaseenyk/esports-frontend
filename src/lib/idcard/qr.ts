import jsQR from "jsqr";
import type { AadhaarRead } from "./aadhaar";

/**
 * Reads the QR code printed on an Aadhaar (e-Aadhaar letter, PVC card, mAadhaar screenshot or an older card).
 * A QR gives the exact name, date of birth and gender with no OCR guessing, so it is tried first.
 *
 * Two formats exist:
 *  - Secure QR (current): a very long decimal number. Convert it to bytes, gunzip, and split on the byte 255.
 *    Fields: 0 version (V2..V5), 1 e-mail/mobile flag, 2 reference id (its first 4 digits are the LAST 4 of the Aadhaar number),
 *    3 name, 4 date of birth (DD-MM-YYYY), 5 gender (M/F/T), then address fields and a photo, which are ignored.
 *  - Old XML QR: <PrintLetterBarcodeData uid=".." name=".." gender=".." dob=".." />. It carries the full number, of which only the last 4 digits are kept.
 * The full number is never returned. The signature is not verified here, so a QR proves what the card says, not that it is genuine.
 */
const GENDER: Record<string, AadhaarRead["gender"]> = { M: "Male", F: "Female", T: "Transgender", MALE: "Male", FEMALE: "Female", TRANSGENDER: "Transgender" };

function decimalToBytes(s: string): Uint8Array {
  let hex = BigInt(s).toString(16);
  if (hex.length % 2) hex = "0" + hex;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function gunzip(b: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("gzip");
  const w = ds.writable.getWriter();
  // Not gzip? The stream errors on both ends; swallow the writer side so only the read below reports it.
  w.write(b as unknown as BufferSource).catch(() => {});
  w.close().catch(() => {});
  return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}

const fixDob = (d: string) => d.replace(/-/g, "/");

export async function parseQrPayload(payload: string): Promise<AadhaarRead | null> {
  const p = payload.trim();
  // Secure QR
  if (/^\d{120,}$/.test(p)) {
    try {
      const raw = await gunzip(decimalToBytes(p));
      const fields: string[] = [];
      let start = 0;
      for (let i = 0; i < raw.length && fields.length < 6; i++) {
        if (raw[i] === 255) { fields.push(new TextDecoder("iso-8859-1").decode(raw.subarray(start, i))); start = i + 1; }
      }
      const [ver, , ref, name, dob, gender] = fields;
      if (!/^V\d+$/.test(ver ?? "") || !/^\d{4,}$/.test(ref ?? "") || !name?.trim()) return null;
      const out: AadhaarRead = { name: name.trim(), last4: ref.slice(0, 4), gender: GENDER[(gender ?? "").toUpperCase()] };
      if (/^\d{2}-\d{2}-\d{4}$/.test(dob ?? "")) out.dob = fixDob(dob);
      else if (/^\d{4}$/.test(dob ?? "")) out.yob = dob;
      return out;
    } catch { return null; }
  }
  // Old XML QR
  if (/<\s*PrintLetterBarcodeData/i.test(p) || /\buid\s*=\s*"/i.test(p)) {
    const attr = (k: string) => p.match(new RegExp(`\\b${k}\\s*=\\s*"([^"]*)"`, "i"))?.[1]?.trim();
    const name = attr("name");
    if (!name) return null;
    const uid = attr("uid") ?? "";
    const dob = attr("dob"), yob = attr("yob");
    const out: AadhaarRead = { name, gender: GENDER[(attr("gender") ?? "").toUpperCase()] };
    if (/^\d{12}$/.test(uid)) out.last4 = uid.slice(-4); // the other eight digits are dropped here
    if (dob && /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(dob)) out.dob = fixDob(dob).replace(/-/g, "/");
    else if (yob) out.yob = yob;
    return out;
  }
  return null;
}

function tryDecode(src: CanvasImageSource, sw: number, sh: number, sx: number, sy: number, cw: number, ch: number, scale: number): string | null {
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.round(cw * scale)); cv.height = Math.max(1, Math.round(ch * scale));
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = scale < 1;
  ctx.drawImage(src, sx, sy, cw, ch, 0, 0, cv.width, cv.height);
  const d = ctx.getImageData(0, 0, cv.width, cv.height);
  const r = jsQR(d.data, d.width, d.height, { inversionAttempts: "attemptBoth" });
  cv.width = cv.height = 0;
  void sw; void sh;
  return r?.data ?? null;
}

/** Looks for a QR in the whole picture, then in overlapping tiles at a few zoom levels, since a QR is often small and in a corner. */
export async function findQr(file: File | Blob): Promise<string | null> {
  const bmp = await createImageBitmap(file);
  try {
    const W = bmp.width, H = bmp.height;
    for (const s of [1, 2, 0.6, 3]) {
      if (W * s > 6000 || H * s > 9000) continue;
      const hit = tryDecode(bmp, W, H, 0, 0, W, H, s);
      if (hit) return hit;
    }
    // Overlapping tiles: halves and quarters.
    const tiles: [number, number, number, number][] = [];
    for (const [cols, rows] of [[1, 2], [2, 1], [2, 2], [3, 3]]) {
      const tw = W / cols, th = H / rows;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const padX = tw * 0.2, padY = th * 0.2;
        const x = Math.max(0, c * tw - padX), y = Math.max(0, r * th - padY);
        tiles.push([x, y, Math.min(W - x, tw + 2 * padX), Math.min(H - y, th + 2 * padY)]);
      }
    }
    for (const s of [2, 3, 1]) for (const [x, y, w, h] of tiles) {
      if (w * s > 5000 || h * s > 5000) continue;
      const hit = tryDecode(bmp, W, H, x, y, w, h, s);
      if (hit) return hit;
    }
    return null;
  } finally { bmp.close(); }
}

export async function scanQr(file: File | Blob): Promise<AadhaarRead | null> {
  const payload = await findQr(file);
  return payload ? parseQrPayload(payload) : null;
}
