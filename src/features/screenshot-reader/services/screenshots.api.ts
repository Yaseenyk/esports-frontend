import type { V3Failure, V3Result } from "@/features/shared/failure";
import { v3Get, v3Post } from "@/features/shared/services/v3-api";

/**
 * Data layer of the screenshot reader (flag v3.screenshots).
 *  - The screenshot is read ON THIS DEVICE with Tesseract.js (the same loader and language data source as the ID card scanner). It is never uploaded:
 *    the only network calls are the language data download (first use) and the JSON below.
 *  - Saving sends only the rows the person confirmed, as JSON.
 */
export interface ShotContext { event: { id: string; name: string }; canEdit: boolean; teams: string[]; matchNumbers: number[]; nextMatchNo: number }

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
export function toShotContext(v: unknown): ShotContext | null {
  const r = obj(v);
  const ev = obj(r.event);
  if (typeof ev.id !== "string") return null;
  const nums = arr(r.matchNumbers).filter((x): x is number => typeof x === "number" && Number.isInteger(x));
  return {
    event: { id: ev.id, name: typeof ev.name === "string" ? ev.name.slice(0, 120) : "" }, canEdit: r.canEdit === true,
    teams: arr(r.teams).filter((x): x is string => typeof x === "string").map((x) => x.slice(0, 60)).slice(0, 300),
    matchNumbers: nums, nextMatchNo: typeof r.nextMatchNo === "number" && Number.isInteger(r.nextMatchNo) ? r.nextMatchNo : (nums[nums.length - 1] ?? 0) + 1,
  };
}

const unreadable: V3Failure = { kind: "error", status: 200 };
const path = (eventId: string) => `/v3/events/${encodeURIComponent(eventId)}/screenshot-results`;
export async function fetchShotContext(eventId: string): Promise<V3Result<ShotContext>> {
  const r = await v3Get<unknown>(path(eventId), { force: true, ttl: 0 });
  if (!r.ok) return r;
  const c = toShotContext(r.data);
  return c ? { ok: true, data: c } : { ok: false, failure: unreadable };
}
export const saveShotRows = (eventId: string, body: { matchNo: number; replace: boolean; rows: { team: string; placement: number; kills: number; confirmed: true }[] }) =>
  v3Post<{ matchNo: number; saved: number }>(path(eventId), body);

export const ACCEPTED = ["image/png", "image/jpeg", "image/webp"] as const;
export const MAX_FILE_BYTES = 15 * 1024 * 1024;

/** Reads the picture's text in the browser. The end-to-end tests set `__EH_OCR_TEXT__` so they need no language download; nothing else does. */
export async function readScreenshotText(file: File, progress?: (p: number) => void): Promise<string> {
  const fake = (globalThis as { __EH_OCR_TEXT__?: unknown }).__EH_OCR_TEXT__;
  if (typeof fake === "string") { progress?.(1); return fake; }
  const { recognizeText } = await import("@/lib/idcard/ocr");
  return recognizeText(file, progress);
}
