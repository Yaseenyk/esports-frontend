/**
 * Saving an event to the backend as cheaply as possible, and bringing one back.
 * - Only what the server stores is sent: names, teams, roles, zones, flags and photos. Birth dates and Aadhaar digits never leave the browser.
 * - If nothing changed since the last save, no request is made. Photos upload one at a time, and only the ones that changed.
 */
import { events, type CloudEvent, type CloudPerson, type CloudTeam } from "../api/cloud";
import type { EventInfo, Person, Role, Team } from "../idcard/types";
import { ROLES } from "../idcard/types";

export interface Snapshot { event: string; game: string; organiser: string; info: EventInfo; teams: Team[]; people: Person[] }

/** The fields the server accepts for a person. Deliberately leaves out dob, gender and last4. */
export function rosterPayload(teams: { id: string; name: string; logo?: string | null }[], people: Person[], minorOf: (p: Person) => boolean) {
  return {
    teams: teams.map((t) => (t.logo ? { id: t.id, name: t.name, logo: t.logo } : { id: t.id, name: t.name })),
    people: people.map((p) => ({
      id: p.id, name: p.name || "Unnamed", teamId: p.teamId, role: p.role, zones: p.zones ?? "",
      minor: minorOf(p), guardian: !!p.guardian,
    })),
  };
}

/** A short fingerprint, enough to tell "same as last time" without keeping the data. */
export function fingerprint(x: unknown): string {
  const s = typeof x === "string" ? x : JSON.stringify(x);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `${s.length}:${(h >>> 0).toString(36)}`;
}

const MEM = "eh-cloud-sync-v1";
type Memo = Record<string, { details?: string; roster?: string; photos?: Record<string, string> }>;
const readMemo = (): Memo => { try { return JSON.parse(localStorage.getItem(MEM) || "{}"); } catch { return {}; } };
const writeMemo = (m: Memo) => { try { localStorage.setItem(MEM, JSON.stringify(m)); } catch { /* ignore */ } };

/** Shrinks a photo until it fits the server's 400 KB limit. */
export async function fitPhoto(dataUrl: string, limit = 380_000): Promise<Blob | null> {
  const src = await (await fetch(dataUrl)).blob();
  if (src.size <= limit && /^image\/(png|jpeg|webp)$/.test(src.type)) return src;
  let bmp: ImageBitmap;
  try { bmp = await createImageBitmap(src); } catch { return null; } // a format the browser cannot read (for example a HEIC photo)
  for (const [max, q] of [[700, 0.86], [560, 0.78], [420, 0.7], [320, 0.6]] as const) {
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const cv = document.createElement("canvas"); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
    cv.getContext("2d")!.drawImage(bmp, 0, 0, cv.width, cv.height);
    const blob: Blob | null = await new Promise((ok) => cv.toBlob(ok, "image/webp", q));
    if (blob && blob.size <= limit) { bmp.close(); return blob; }
  }
  bmp.close();
  return null;
}

/** The server keeps a team logo of at most 60 KB as a data URL, so a bigger one is shrunk first. */
export async function fitLogo(dataUrl: string, limit = 58_000): Promise<string | null> {
  if (dataUrl.length <= limit && /^data:image\/(png|jpeg|webp);base64,/.test(dataUrl)) return dataUrl;
  let bmp: ImageBitmap;
  try { bmp = await createImageBitmap(await (await fetch(dataUrl)).blob()); } catch { return null; }
  for (const [max, q] of [[192, 0.85], [128, 0.8], [96, 0.7]] as const) {
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const cv = document.createElement("canvas"); cv.width = Math.max(1, Math.round(bmp.width * k)); cv.height = Math.max(1, Math.round(bmp.height * k));
    cv.getContext("2d")!.drawImage(bmp, 0, 0, cv.width, cv.height);
    const out = cv.toDataURL("image/webp", q);
    if (out.length <= limit) { bmp.close(); return out; }
  }
  bmp.close();
  return null;
}

/** True when a picture has see-through areas, i.e. it is a background-removed cut-out. */
export async function hasAlpha(dataUrl: string): Promise<boolean> {
  try {
    const bmp = await createImageBitmap(await (await fetch(dataUrl)).blob());
    const k = Math.min(1, 64 / Math.max(bmp.width, bmp.height));
    const cv = document.createElement("canvas"); cv.width = Math.max(1, Math.round(bmp.width * k)); cv.height = Math.max(1, Math.round(bmp.height * k));
    const ctx = cv.getContext("2d", { willReadFrequently: true })!; ctx.drawImage(bmp, 0, 0, cv.width, cv.height); bmp.close();
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data; let clear = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i]! < 200) clear++;
    return clear / (d.length / 4) > 0.06;
  } catch { return false; }
}

export interface SaveResult { id: string; key: string; codes: Record<string, string>; sentRoster: boolean; photosSent: number; photosSkipped: string[] }

/** `onCreated` fires as soon as a new event exists on the server, so a failure later in the save does not leave an unlinked event behind and a retry makes a second one. */
export async function saveToCloud(s: Snapshot, existingId: string | null, minorOf: (p: Person) => boolean, say: (t: string) => void, onCreated?: (id: string, key: string) => void): Promise<SaveResult> {
  const memo = readMemo();
  const details = { name: s.event, game: s.game, organiser: s.organiser, date: s.info.date, venue: s.info.venue, emergency: s.info.emergency, rules: s.info.rules };
  let ev: CloudEvent;
  say(existingId ? "Updating the event…" : "Creating the event…");
  if (!existingId) { ev = await events.create(details); onCreated?.(ev.id, ev.key); }
  else {
    ev = { id: existingId } as CloudEvent;
    if (memo[existingId]?.details !== fingerprint(details)) ev = await events.update(existingId, details);
  }
  const id = ev.id;
  const m = (memo[id] ??= {});
  m.details = fingerprint(details);

  const teams: { id: string; name: string; logo?: string | null }[] = [];
  for (const t of s.teams) teams.push({ id: t.id, name: t.name, logo: t.logo ? await fitLogo(t.logo) : null });
  const body = rosterPayload(teams, s.people, minorOf);
  const rf = fingerprint(body);
  let sentRoster = false;
  if (m.roster !== rf) { say(`Saving ${s.people.length} people…`); await events.saveRoster(id, body); m.roster = rf; sentRoster = true; writeMemo(memo); }

  const photos = (m.photos ??= {});
  const skipped: string[] = [];
  let sent = 0;
  const todo = s.people.filter((p) => p.photo && photos[p.id] !== fingerprint(p.photo));
  for (const [i, p] of todo.entries()) {
    say(`Uploading photo ${i + 1} of ${todo.length}…`);
    const blob = await fitPhoto(p.photo!);
    if (!blob) { skipped.push(p.name || p.id); continue; }
    await events.putPhoto(id, p.id, blob);
    photos[p.id] = fingerprint(p.photo!); sent++; writeMemo(memo);
  }
  writeMemo(memo);

  say("Getting the signed passes…");
  const list = await events.passes(id);
  const codes: Record<string, string> = {};
  for (const x of list) codes[x.personId] = x.code;
  return { id, key: (ev as CloudEvent).key, codes, sentRoster, photosSent: sent, photosSkipped: skipped };
}

const isRole = (r: string): r is Role => (ROLES as readonly string[]).includes(r);

export interface Loaded { details: CloudEvent; teams: Team[]; people: Person[] }

/** Brings an event back. Photos come down four at a time, since each is its own request. */
export async function loadFromCloud(ev: CloudEvent, say: (t: string) => void): Promise<Loaded> {
  say("Getting the roster…");
  const r = await events.roster(ev.id);
  const teams: Team[] = (r.teams as CloudTeam[]).map((t) => ({ id: t.id, name: t.name, logo: t.logo ?? undefined }));
  const people: Person[] = (r.people as CloudPerson[]).map((p) => ({
    id: p.id, name: p.name, teamId: p.teamId, role: isRole(p.role) ? p.role : "Player",
    zones: Array.isArray(p.zones) ? p.zones.join("; ") : p.zones || undefined, guardian: p.guardian || undefined,
  }));
  const withPhoto = (r.people as CloudPerson[]).filter((p) => p.photoUrl);
  let done = 0;
  const queue = [...withPhoto];
  await Promise.all(Array.from({ length: 4 }, async () => {
    for (let p = queue.shift(); p; p = queue.shift()) {
      const url = await events.photoAsDataUrl(p.photoUrl!);
      const t = people.find((x) => x.id === p.id);
      if (t && url) { t.photo = url; if (await hasAlpha(url)) t.cutout = true; }
      say(`Photos ${++done} of ${withPhoto.length}…`);
    }
  }));
  return { details: ev, teams, people };
}

export const LINK_KEY = "eh-cloud-link-v1";
export const readLink = (): { id: string; key: string } | null => { try { return JSON.parse(localStorage.getItem(LINK_KEY) || "null"); } catch { return null; } };
export const writeLink = (l: { id: string; key: string } | null) => { try { if (l) localStorage.setItem(LINK_KEY, JSON.stringify(l)); else localStorage.removeItem(LINK_KEY); } catch { /* ignore */ } };
