/** Board filters in the query string and the "post a scrim" form checks. Pure: shared by the hooks and the unit tests. */
import { EMPTY_FILTERS, SCRIM_WORDS, type BoardFilters } from "@/features/scrims/domain";
import { toUtcIso, type Zone } from "@/features/scrims/time";

export const BOARD_KEYS: (keyof BoardFilters)[] = ["game", "region", "day"];
export function parseBoardFilters(search: string): BoardFilters {
  const p = new URLSearchParams(search);
  const f = { ...EMPTY_FILTERS };
  for (const k of BOARD_KEYS) f[k] = (p.get(k) ?? "").slice(0, 20);
  if (f.day && !/^\d{4}-\d{2}-\d{2}$/.test(f.day)) f.day = "";
  return f;
}
export function boardSearch(f: BoardFilters): string {
  const p = new URLSearchParams();
  for (const k of BOARD_KEYS) if (f[k]) p.set(k, f[k]);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export interface SlotForm { teamProfileId: string; game: string; day: string; time: string; zone: Zone; region: string; server: string; skillNote: string; slots: string; contact: string }
export const EMPTY_FORM: SlotForm = { teamProfileId: "", game: "", day: "", time: "", zone: "ist", region: "india", server: "", skillNote: "", slots: "1", contact: "" };

/** "?starts=<UTC ISO>&game=<game>" (the squad planner's "Post a scrim at this time" link) to India-time form fields. Unknown or bad values are dropped. */
export function prefillFromSearch(search: string): Partial<SlotForm> {
  const p = new URLSearchParams(search);
  const out: Partial<SlotForm> = {};
  const game = p.get("game") ?? "";
  if (["bgmi", "free_fire", "valorant", "cod_mobile", "cs2", "other"].includes(game)) out.game = game;
  const ms = Date.parse(p.get("starts") ?? "");
  if (Number.isFinite(ms)) {
    const d = new Date(ms + 330 * 60_000);
    const pad = (n: number) => String(n).padStart(2, "0");
    out.day = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    out.time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
    out.zone = "ist";
  }
  return out;
}

/** Client-side checks mirror the server's (the server decides). Returns field -> message. */
export function validateSlotForm(f: SlotForm, now: number = Date.now()): Partial<Record<keyof SlotForm, string>> {
  const e: Partial<Record<keyof SlotForm, string>> = {};
  if (!f.teamProfileId) e.teamProfileId = "Pick your team page.";
  if (!f.game) e.game = "Choose a game.";
  const iso = toUtcIso(f.zone, f.day, f.time);
  if (!iso) e.day = "Pick a date and a time.";
  else if (Date.parse(iso) < now + 15 * 60_000) e.day = SCRIM_WORDS.starts_too_soon;
  else if (Date.parse(iso) > now + 30 * 86_400_000) e.day = SCRIM_WORDS.starts_too_late;
  const n = Number(f.slots);
  if (!Number.isInteger(n) || n < 1 || n > 24) e.slots = "1 to 24 teams.";
  if (f.contact.trim().length < 2 || f.contact.trim().length > 40) e.contact = "2 to 40 characters.";
  else if (/[^\s@]+@[^\s@]+\.[^\s@]{2,}/.test(f.contact)) e.contact = SCRIM_WORDS.contact_has_email;
  if (f.skillNote.length > 200) e.skillNote = "At most 200 characters.";
  return e;
}

