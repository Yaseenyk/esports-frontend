/**
 * Everything a display screen needs to show is packed into the link itself (after the # sign), so a screen can be opened on any TV, laptop,
 * OBS browser source or YouTube stream without an account and without anything being uploaded. The # part never leaves the browser.
 * Live updates between a tool and its screen window use BroadcastChannel (same browser); a link is a snapshot.
 */
export interface TableData { title: string; subtitle?: string; head: string[]; rows: string[][]; /** Which column holds the highlighted figure (for example the total). */ strong?: number }
export interface ScheduleData { title: string; /** The day the times are on, yyyy-mm-dd. Defaults to today. */ date?: string; slots: { n: number; start: string; end: string; label: string; breakAfter?: number }[] }
export interface CountdownData { title: string; subtitle?: string; /** ISO date and time. */ at: string }
export type Payload = { v: "table"; d: TableData } | { v: "schedule"; d: ScheduleData } | { v: "countdown"; d: CountdownData };

export interface Look { theme: "dark" | "light" | "neon"; /** "transparent" for OBS, or a hex colour. */ bg: string; /** Margin as a percentage of the screen, for TV overscan. */ safe: number; /** Text size multiplier. */ scale: number; names: boolean }
export const DEFAULT_LOOK: Look = { theme: "dark", bg: "#05070a", safe: 3, scale: 1, names: false };

const b64 = (bytes: Uint8Array) => { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const unb64 = (s: string) => { const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)); return Uint8Array.from(bin, (c) => c.charCodeAt(0)); };

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const w = stream.writable.getWriter();
  // A damaged input makes these reject; the read below reports that, so they must not also surface as unhandled errors.
  w.write(bytes as unknown as BufferSource).catch(() => undefined); w.close().catch(() => undefined);
  return new Uint8Array(await new Response(stream.readable).arrayBuffer());
}

/** Turns a payload into the text that goes after # in a display link. Compressed when the browser can, plain otherwise. */
export async function encode(p: Payload): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify(p));
  if (typeof CompressionStream !== "undefined") { try { return "z." + b64(await pipe(raw, new CompressionStream("gzip"))); } catch { /* fall through */ } }
  return "p." + b64(raw);
}

/** The reverse. Returns null for anything that is not a valid payload (a damaged or hand-edited link never crashes a screen). */
export async function decode(text: string): Promise<Payload | null> {
  try {
    const [kind, body] = [text.slice(0, 2), text.slice(2)];
    if (!body || body.length > 200_000) return null;
    const bytes = kind === "z." ? await pipe(unb64(body), new DecompressionStream("gzip")) : kind === "p." ? unb64(body) : null;
    if (!bytes) return null;
    return validate(JSON.parse(new TextDecoder().decode(bytes)));
  } catch { return null; }
}

const str = (x: unknown, max: number) => (typeof x === "string" ? x.slice(0, max) : "");
const rows = (x: unknown, cols: number): string[][] | null => (Array.isArray(x) && x.length <= 200 ? x.map((r) => (Array.isArray(r) ? r.slice(0, cols).map((c) => str(String(c ?? ""), 80)) : [])) : null);

/** Checks the shape and trims everything, so whatever is in a link can only ever be shown as plain text. */
export function validate(x: unknown): Payload | null {
  if (!x || typeof x !== "object") return null;
  const p = x as { v?: unknown; d?: Record<string, unknown> };
  const d = p.d;
  if (!d || typeof d !== "object") return null;
  if (p.v === "table") {
    const head = Array.isArray(d.head) ? d.head.slice(0, 14).map((h) => str(String(h ?? ""), 40)) : null;
    const body = head ? rows(d.rows, head.length) : null;
    if (!head || !body) return null;
    return { v: "table", d: { title: str(d.title, 100), subtitle: str(d.subtitle, 140), head, rows: body, strong: typeof d.strong === "number" && d.strong >= 0 && d.strong < head.length ? d.strong : undefined } };
  }
  if (p.v === "schedule") {
    if (!Array.isArray(d.slots) || d.slots.length > 300) return null;
    const slots = d.slots.map((s: Record<string, unknown>) => ({ n: Number(s.n) || 0, start: str(s.start, 12), end: str(s.end, 12), label: str(s.label, 80), breakAfter: Number(s.breakAfter) || 0 }));
    return { v: "schedule", d: { title: str(d.title, 100), date: /^\d{4}-\d{2}-\d{2}$/.test(str(d.date, 10)) ? str(d.date, 10) : undefined, slots } };
  }
  if (p.v === "countdown") {
    const at = str(d.at, 40);
    return Number.isNaN(Date.parse(at)) ? null : { v: "countdown", d: { title: str(d.title, 100), subtitle: str(d.subtitle, 140), at } };
  }
  return null;
}

/** The look settings from the query string: ?theme=neon&bg=transparent&safe=5&scale=1.2&names=1 */
export function lookFrom(params: URLSearchParams): Look {
  const theme = params.get("theme");
  const bg = params.get("bg") ?? DEFAULT_LOOK.bg;
  const safe = Number(params.get("safe") ?? DEFAULT_LOOK.safe), scale = Number(params.get("scale") ?? 1);
  return {
    theme: theme === "light" || theme === "neon" ? theme : "dark",
    bg: bg === "transparent" || /^[0-9a-fA-F]{6}$/.test(bg) ? (bg === "transparent" ? bg : `#${bg}`) : /^#[0-9a-fA-F]{6}$/.test(bg) ? bg : DEFAULT_LOOK.bg,
    safe: Number.isFinite(safe) ? Math.min(15, Math.max(0, safe)) : DEFAULT_LOOK.safe,
    scale: Number.isFinite(scale) ? Math.min(2.5, Math.max(0.5, scale)) : 1,
    names: params.get("names") === "1",
  };
}

/** Time left until `at`, split for a countdown. Never negative. */
export function remaining(at: string, now = Date.now()) {
  const ms = Math.max(0, Date.parse(at) - now);
  return { ms, days: Math.floor(ms / 86_400_000), hours: Math.floor(ms / 3_600_000) % 24, minutes: Math.floor(ms / 60_000) % 60, seconds: Math.floor(ms / 1000) % 60, done: ms === 0 };
}

/** Which schedule slot is on now and which is next, from clock times on a given day. */
export function slotNow(d: ScheduleData, now = new Date()): { current: number; next: number } {
  const day = d.date ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const at = (t: string) => { const m = /^(\d{2}):(\d{2})/.exec(t); return m ? new Date(`${day}T${m[1]}:${m[2]}:00`).getTime() : NaN; };
  const t = now.getTime();
  let current = -1, next = -1;
  d.slots.forEach((s, i) => { const a = at(s.start), b = at(s.end); if (t >= a && t < b) current = i; else if (a > t && next === -1) next = i; });
  return { current, next };
}

export const CHANNEL = "eh-display";
