"use client";

/** An event's brand kit: a logo and two colours, set once and shown across the product. */
import { useSyncExternalStore } from "react";
import { brandApi, type BrandKit, type BrandSource, type BrandState, type PublicBrandKit } from "./api/f-brand";
import { sessionStore } from "./api/cloud";
import { useQuery } from "./api/useQuery";

export interface Brand { name?: string; logo?: string; primary: string; secondary: string }

const HEX = /^#[0-9a-fA-F]{6}$/;
const LOGO = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
export const LOGO_MAX_CHARS = 60000;
/** The dark page colour the live page, screens and overlays sit on. */
export const INK = "#05070a";
export const WHITE = "#ffffff";
export const BLACK = "#000000";
export const MIN_CONTRAST = 4.5;

export const isHex = (s: unknown): s is string => typeof s === "string" && HEX.test(s);

/** "#abc" and "ABC123" become "#aabbcc" and "#abc123"; anything that is not a colour gives null. */
export function normaliseHex(s: unknown): string | null {
  if (typeof s !== "string") return null;
  let t = s.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(t)) t = t.split("").map((c) => c + c).join("");
  return /^[0-9a-fA-F]{6}$/.test(t) ? `#${t.toLowerCase()}` : null;
}

const rgb = (hex: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
const toHex = (c: number[]) => `#${c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours, 1 to 21. */
export function contrast(a: string, b: string): number {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** The text colour to put on `color`: white or black, whichever reads better. */
export function readableOn(color: string): string {
  if (!isHex(color)) return WHITE;
  return contrast(color, WHITE) >= contrast(color, BLACK) ? WHITE : BLACK;
}

/**
 * Nudges `color` until it reaches `min` contrast against `against` (the colour of the text or page it sits on), keeping its hue as far as it can:
 * it is mixed towards white when `against` is dark, towards black when `against` is light. Returns the colour unchanged when it already passes.
 */
export function fixContrast(color: string, against: string = INK, min: number = MIN_CONTRAST): string {
  const c = normaliseHex(color), a = normaliseHex(against);
  if (!c) return "#22d3ee";
  if (!a || contrast(c, a) >= min) return c;
  const target = luminance(a) < 0.18 ? [255, 255, 255] : [0, 0, 0];
  const base = rgb(c);
  for (let i = 1; i <= 50; i++) {
    const k = i / 50;
    const next = toHex(base.map((v, j) => v + (target[j]! - v) * k));
    if (contrast(next, a) >= min) return next;
  }
  return toHex(target);
}

/** Plain-words problems with a pair of colours, for the panel. */
export interface ColourWarning { which: "primary" | "secondary" | "pair"; text: string }
export function colourWarnings(primary: string, secondary: string): ColourWarning[] {
  const out: ColourWarning[] = [];
  const p = normaliseHex(primary), s = normaliseHex(secondary);
  if (p && contrast(p, INK) < MIN_CONTRAST) out.push({ which: "primary", text: "Your main colour is too dark to read as text on the dark live page." });
  if (s && contrast(s, INK) < MIN_CONTRAST) out.push({ which: "secondary", text: "Your second colour is too dark to read as text on the dark live page." });
  if (p && s && contrast(p, s) < 1.5) out.push({ which: "pair", text: "The two colours are very close, so they are hard to tell apart. Pick colours that differ more." });
  return out;
}

/** Turns a saved kit into the shape the screens use. Anything that is not a safe colour or logo is dropped. */
export function toBrand(k: Partial<BrandKit | PublicBrandKit> | null | undefined): Brand | null {
  if (!k) return null;
  const primary = normaliseHex(k.primaryColor), secondary = normaliseHex(k.secondaryColor);
  if (!primary || !secondary) return null;
  const name = typeof k.name === "string" && k.name.trim() ? k.name.trim().slice(0, 60) : undefined;
  const logo = typeof k.logo === "string" && k.logo.length <= LOGO_MAX_CHARS && LOGO.test(k.logo) ? k.logo : undefined;
  return { ...(name ? { name } : null), ...(logo ? { logo } : null), primary, secondary };
}

export interface BrandHook { brand: Brand | null; source: BrandSource; loading: boolean; error: Error | null; refetch: () => void }

/**
 * For signed-in screens: the kit in force for an event (its own, else the account kit), or the account kit when no event is given.
 * Null while loading, when nothing is saved, or when signed out.
 */
export function useBrandState(eventId?: string): BrandHook {
  const signedIn = !!useSyncExternalStore(sessionStore.subscribe, sessionStore.get, () => null);
  const path = !signedIn ? null : eventId ? `/events/${encodeURIComponent(eventId)}/brand` : "/brand";
  const q = useQuery<BrandState>(path, { ttl: 0, swr: 0 });
  return { brand: toBrand(q.data?.brand), source: q.data?.source ?? "none", loading: q.loading, error: q.error, refetch: q.refetch };
}

export function useBrand(eventId?: string): Brand | null {
  return useBrandState(eventId).brand;
}

/** For public pages (live page, overlay, embeds): the kit by live page slug. Null when there is none, the page is not published, or the call fails: pages must look right without it. */
export async function fetchPublicBrand(slug: string): Promise<Brand | null> {
  try { return toBrand((await brandApi.public(slug))?.brand); } catch { return null; }
}

/** CSS variables for a brand, to spread into a style prop. Unsafe colours are dropped, so nothing from the server can inject CSS. Empty when there is no brand. */
export function brandCss(brand: Brand | null | undefined): Record<string, string> {
  if (!brand) return {};
  const out: Record<string, string> = {};
  if (HEX.test(brand.primary)) out["--brand-primary"] = brand.primary;
  if (HEX.test(brand.secondary)) out["--brand-secondary"] = brand.secondary;
  return out;
}

/** brandCss plus two derived colours: `--brand-primary-fg` (readable text on the primary colour) and `--brand-accent` (the primary colour lifted until it reads as text on the dark page). */
export function brandTheme(brand: Brand | null | undefined): Record<string, string> {
  const out = brandCss(brand);
  if (brand && out["--brand-primary"]) {
    out["--brand-primary-fg"] = readableOn(brand.primary);
    out["--brand-accent"] = fixContrast(brand.primary, INK);
  }
  return out;
}
