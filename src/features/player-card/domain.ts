/**
 * The personal player card (a player makes a card of themselves, with a QR that opens their player page). Pure: shapes and rules, no I/O.
 * The organisers' ID card studio (/app/id-cards/) is unchanged; this reuses its card renderer and themes for ONE card, the player's own.
 */
import { uid, type El, type Fmt, type Template } from "@/lib/idcard/types";

/** What the QR on the card holds. "page": the player's card link (/p/?k=..., revocable). "none": no QR on the card. */
export type QrMode = "page" | "none";
export const QR_MODES: { value: QrMode; label: string; help: string }[] = [
  { value: "page", label: "My player page", help: "Scanning it opens your shared player page. You can reset it at any time, which stops old cards working." },
  { value: "none", label: "No QR code", help: "The card shows no code." },
];

export const CARD_FORMATS: { value: Fmt; label: string }[] = [
  { value: "portrait", label: "Lanyard badge (upright)" }, { value: "wallet", label: "Wallet card" }, { value: "pass", label: "Phone pass" }, { value: "story", label: "Story card" },
];
/** Themes that read well for one person (poster themes draw a QR slot already; classic ones get one added). */
export const CARD_THEMES = ["neon-grid", "midnight-gold", "crimson-strike", "arctic", "carbon", "royal-violet"];

export interface CardForm { name: string; team: string; game: string; role: string; photo: string | null; theme: string; fmt: Fmt; qr: QrMode }

/** The absolute address the QR encodes. Only a well-formed card path is accepted, so the code can never point anywhere else. */
export function qrValue(siteUrl: string, cardPath: string | null): string | null {
  if (!cardPath || !/^\/p\/\?k=[A-Za-z0-9_-]{22}$/.test(cardPath)) return null;
  return `${siteUrl.replace(/\/+$/, "")}${cardPath}`;
}

/** The template with the QR element added (when the theme has none and a QR is wanted) or removed (no QR wanted). */
export function withQr(t: Template, want: boolean, fmt: Fmt): Template {
  const has = t.els.some((e) => e.kind === "qr");
  if (!want) return { ...t, els: t.els.filter((e) => e.kind !== "qr") };
  if (has) return t;
  const tall = fmt === "portrait" || fmt === "pass" || fmt === "story" || fmt === "poster" || fmt === "badge";
  const w = tall ? 30 : 20;
  const h = tall ? (fmt === "portrait" ? 19 : 15) : 32;
  const qr: El = { id: uid(), kind: "qr", x: 100 - w - 5, y: 100 - h - 4, w, h, rot: 0, opacity: 1, color: "#111111", fill: "#ffffff", radius: 3 };
  return { ...t, els: [...t.els, qr] };
}

/** Photos stay in this browser: only png, jpeg or webp (never SVG), at most 5 MB in, redrawn to at most 640 px (which also drops the file's metadata). */
export const PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export function photoProblem(f: { type: string; size: number }): string {
  if (!(PHOTO_TYPES as readonly string[]).includes(f.type)) return "Use a PNG, JPEG or WebP photo.";
  if (f.size > PHOTO_MAX_BYTES) return "That photo is over 5 MB. Pick a smaller one.";
  return "";
}
