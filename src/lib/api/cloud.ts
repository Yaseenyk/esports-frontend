/** Typed calls to the Esports Hub backend (Cloudflare Worker). Every call goes through the shared client, so it is cached, de-duplicated and batched where it can be. */
import { api, API_BASE, setAuthFailHandler, setToken } from "./index";
import { createBatchQueue } from "./queue";
import type { LiveSnapshot, LiveState, PublicLive } from "../live";

export interface User { id: string; email: string; name: string }
export interface CloudEvent { role?: "owner" | "editor" | "viewer"; id: string; key: string; name: string; game: string; organiser: string; date: string; venue: string; emergency: string; rules: string; settings: unknown; updatedAt: string }
export interface CloudTeam { id: string; name: string; logo?: string | null }
export interface CloudPerson { id: string; name: string; teamId: string; role: string; zones?: string | string[]; minor: boolean; guardian: boolean; photoUrl: string | null }
export interface CloudRoster { teams: CloudTeam[]; people: CloudPerson[] }
export interface Checkin { personId: string; name: string; team: string | null; role: string; at: string; door?: string | null }
export interface Live { checkins: Checkin[]; total: number; checkedIn: number }
export interface GateKey { id: string; label: string; expiresAt: string | null; revoked: boolean; createdAt: string }
export interface Invite { id: string; teamId: string; token: string; label: string; maxUses: number | null; uses: number; expiresAt: string | null; revoked: boolean; createdAt: string }
export interface Submission { id: string; teamId: string; team: string | null; name: string; role: string; minor: boolean; status: string; createdAt: string; photoUrl: string | null }
export interface PassData { event: { name: string; date: string; venue: string }; person: { name: string; team: string | null; role: string; zones: unknown }; code: string; photoUrl: string | null }
export interface RegForm { token: string; title: string; intro: string; closesAt: string | null; maxTeams: number | null; teamSize: number; subs: number; open: boolean; createdAt: string }
export interface RegPlayer { name: string; ign: string; minor: boolean }
export interface Registration { id: string; teamName: string; captainName: string; captainContact: string; players: RegPlayer[]; notes: string; status: "pending" | "approved" | "rejected"; createdAt: string }
export interface PublicReg { event: { name: string; date: string; venue: string }; form: { title: string; intro: string; teamSize: number; subs: number; closesAt: string | null; spotsLeft: number | null; status: "open" | "closed" | "full" } }
export interface Members { owner: { userId: string; name: string; email: string } | null; members: { userId: string; name: string; email: string; role: "editor" | "viewer"; addedAt: string }[] }
export type CheckResult = { status: "ok" | "again" | "bad"; reason?: string; person?: { id: string; name: string; team: string | null; role: string; zones: unknown; minor: boolean; guardian: boolean }; at?: string };

// ---- session: the sign-in token lives in this browser only ----
const TOKEN_KEY = "eh-session-v1";
type Listener = () => void;
export type SessionEnd = "signed-out" | "expired" | "deleted";
export type Session = { token: string; user: User };
const listeners = new Set<Listener>();
let session: Session | null = null;
let endedBy: SessionEnd | null = null;

/** Accepts only a saved sign-in that has the shape the app relies on, so a damaged or hand-edited entry cannot crash a screen. */
export function parseSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Partial<Session> | null;
    if (!s || typeof s.token !== "string" || !s.token || !s.user || typeof s.user.id !== "string" || typeof s.user.email !== "string") return null;
    return { token: s.token, user: { id: s.user.id, email: s.user.email, name: typeof s.user.name === "string" && s.user.name ? s.user.name : s.user.email } };
  } catch { return null; }
}
const readStored = () => { try { return typeof localStorage !== "undefined" ? parseSession(localStorage.getItem(TOKEN_KEY)) : null; } catch { return null; } };
session = readStored();
if (session) setToken(session.token);
const emit = () => listeners.forEach((l) => l());
export const sessionStore = {
  get: () => session,
  /** Why the last sign-in ended, so the app can say "your sign-in expired" instead of silently showing the sign-in page. */
  endedBy: () => endedBy,
  subscribe: (l: Listener) => { listeners.add(l); return () => { listeners.delete(l); }; },
};
function setSession(s: Session | null, why: SessionEnd = "signed-out", persist = true) {
  session = s; setToken(s?.token ?? null); api.clear();
  endedBy = s ? null : why;
  if (persist) { try { if (s) localStorage.setItem(TOKEN_KEY, JSON.stringify(s)); else localStorage.removeItem(TOKEN_KEY); } catch { /* private mode: stay signed in for this tab only */ } }
  emit();
}
// Signing in or out in another tab of this browser is followed here too, so two tabs never disagree about who is signed in.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== TOKEN_KEY) return;
    const next = parseSession(e.newValue);
    if ((next?.token ?? null) === (session?.token ?? null)) return;
    setSession(next, "signed-out", false);
  });
}

// An expired or revoked sign-in on any request signs the person out; the app shell then sends them to the sign-in page.
setAuthFailHandler(() => { if (session) setSession(null, "expired"); });

export const auth = {
  async register(email: string, name: string, password: string) { const r = await api.post<{ token: string; user: User }>("/auth/register", { email, name, password }); setSession(r); return r.user; },
  async login(email: string, password: string) { const r = await api.post<{ token: string; user: User }>("/auth/login", { email, password }); setSession(r); return r.user; },
  logout() { setSession(null); },
  /** Asks for a reset link. The server answers the same whether or not the account exists. Sent once, never retried. */
  async forgot(email: string) { await api.post<{ ok: true }>("/auth/forgot", { email }); return { ok: true as const }; },
  /** Sets a new password with the emailed token. No session is returned; the person signs in again. */
  async reset(token: string, password: string) { await api.post<{ ok: true }>("/auth/reset", { token, password }); return { ok: true as const }; },
  async changePassword(current: string, next: string) {
    const r = await api.post<{ ok: true; token?: string }>("/auth/change-password", { current, next });
    // The server issues a fresh sign-in because every older one stops working when the password changes.
    if (r.token && session) setSession({ token: r.token, user: session.user });
    return { ok: true as const };
  },
  async deleteAccount(password: string) { await api.post<{ ok: true }>("/auth/delete-account", { password }); setSession(null, "deleted"); },
};

/** What the backend says when something is wrong, in words a person can act on. */
export function explain(e: unknown): string {
  const s = (e as { status?: number })?.status;
  if (s === 401) return "Your sign-in has expired or the details are wrong. Sign in again.";
  if (s === 409) return "That email already has an account. Sign in instead.";
  if (s === 429) return "Too many tries. Wait a few minutes and try again.";
  if (s === 403) return "You do not have permission to do that. Ask the owner of the event.";
  if (s === 413) return "That file is too large. Try a smaller one.";
  if (s === 404) return "That was not found. It may have been removed.";
  if (s && s >= 500) return "The server had a problem. Try again in a moment.";
  if (s) return "The server did not accept that. Check what you typed.";
  return "Could not reach the server. Check your connection.";
}

/** fetch that gives up after `ms`, so a dead connection ends in an error the screen can show instead of waiting for ever. */
export async function fetchWithin(input: string, init: RequestInit = {}, ms = 15000): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(input, { ...init, signal: ctl.signal }); } finally { clearTimeout(timer); }
}

/** The sentence shown when signing in or creating an account fails. A 401 here means a wrong password, not an expired session. */
export function authMessage(e: unknown, mode: "login" | "register"): string {
  const s = (e as { status?: number })?.status;
  if (mode === "login" && (s === 401 || s === 400)) return "That email or password is not right. Check both and try again.";
  if (mode === "register" && s === 400) return "The server did not accept those details. Use a real email and a password of at least 8 characters.";
  return explain(e);
}

// ---- owner calls ----
export const events = {
  list: () => api.get<CloudEvent[]>("/events", { ttl: 30000 }),
  create: (b: Partial<CloudEvent>) => api.post<CloudEvent>("/events", b),
  update: (id: string, b: Partial<CloudEvent>) => api.put<CloudEvent>(`/events/${id}`, b),
  remove: (id: string) => api.del<{ ok: true }>(`/events/${id}`),
  roster: (id: string) => api.get<CloudRoster>(`/events/${id}/roster`, { ttl: 20000 }),
  saveRoster: (id: string, body: { teams: CloudTeam[]; people: Omit<CloudPerson, "photoUrl">[] }) => api.put<{ ok: true; teams: number; people: number }>(`/events/${id}/roster`, body),
  passes: (id: string) => api.get<{ personId: string; code: string }[]>(`/events/${id}/passes`, { ttl: 60000 }),
  gateKeys: (id: string) => api.get<GateKey[]>(`/events/${id}/gate-keys`, { ttl: 10000 }),
  newGateKey: (id: string, label: string, expiresInHours?: number) => api.post<{ id: string; key: string; label: string; expiresAt: string | null }>(`/events/${id}/gate-keys`, { label, expiresInHours }),
  revokeGateKey: (id: string, keyId: string) => api.del<{ ok: true }>(`/events/${id}/gate-keys/${keyId}`),
  checkins: (id: string, since?: string) => api.get<Live>(`/events/${id}/checkins${since ? `?since=${encodeURIComponent(since)}` : ""}`, { ttl: 4000, swr: 0 }),
  resetCheckins: (id: string) => api.del<{ ok: true }>(`/events/${id}/checkins`),
  share: (id: string, personId: string) => api.post<{ token: string }>(`/events/${id}/people/${encodeURIComponent(personId)}/share`),
  unshare: (id: string, personId: string) => api.del<{ ok: true }>(`/events/${id}/people/${encodeURIComponent(personId)}/share`),
  invites: (id: string) => api.get<Invite[]>(`/events/${id}/invites`, { ttl: 10000 }),
  newInvite: (id: string, b: { teamId: string; label: string; maxUses?: number; expiresInHours?: number }) => api.post<{ id: string; token: string }>(`/events/${id}/invites`, b),
  revokeInvite: (id: string, inviteId: string) => api.del<{ ok: true }>(`/events/${id}/invites/${inviteId}`),
  submissions: (id: string, status = "pending") => api.get<Submission[]>(`/events/${id}/submissions?status=${status}`, { ttl: 8000 }),
  approve: (id: string, sid: string) => api.post<{ ok: true; personId: string }>(`/events/${id}/submissions/${sid}/approve`, {}),
  reject: (id: string, sid: string) => api.post<{ ok: true }>(`/events/${id}/submissions/${sid}/reject`, {}),
  members: (id: string) => api.get<Members>(`/events/${id}/members`, { ttl: 3000 }),
  addMember: (id: string, email: string, role: "editor" | "viewer") => api.post<{ userId: string; name: string; email: string; role: string }>(`/events/${id}/members`, { email, role }),
  removeMember: (id: string, userId: string) => api.del<{ ok: true }>(`/events/${id}/members/${userId}`),
  registration: (id: string) => api.get<{ form: RegForm | null; counts: { pending: number; approved: number; rejected: number } }>(`/events/${id}/registration`, { ttl: 5000 }),
  saveRegistration: (id: string, b: Partial<Pick<RegForm, "title" | "intro" | "closesAt" | "maxTeams" | "teamSize" | "subs" | "open">>) => api.put<RegForm>(`/events/${id}/registration`, b),
  registrations: (id: string, status = "pending") => api.get<Registration[]>(`/events/${id}/registrations?status=${status}`, { ttl: 5000 }),
  approveRegistration: (id: string, rid: string) => api.post<{ ok: true; teamId: string; people: number }>(`/events/${id}/registrations/${rid}/approve`, {}),
  rejectRegistration: (id: string, rid: string) => api.post<{ ok: true }>(`/events/${id}/registrations/${rid}/reject`, {}),
  /** One photo, sent as the raw image. The backend keeps it separate from the roster so the roster stays small. */
  async putPhoto(id: string, personId: string, blob: Blob) {
    const res = await fetchWithin(`${API_BASE}/events/${id}/photos/${encodeURIComponent(personId)}`, { method: "PUT", headers: { "content-type": blob.type, authorization: `Bearer ${session?.token ?? ""}` }, body: blob }, 30000);
    if (res.status === 401) setSession(null, "expired");
    if (!res.ok) throw Object.assign(new Error("photo upload failed"), { status: res.status });
  },
  /** Fetches an image that needs the sign-in token, as a data URL the cards can use. */
  async photoAsDataUrl(path: string, gateKey?: string): Promise<string | null> {
    if (!gateKey && !session) return null;
    try {
      const res = await fetchWithin(API_BASE + path, { headers: gateKey ? { "x-gate-key": gateKey } : { authorization: `Bearer ${session!.token}` } }, 15000);
      if (!res.ok) return null;
      const b = await res.blob();
      return await new Promise<string | null>((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => ok(null); r.readAsDataURL(b); });
    } catch { return null; }
  },
};

// ---- public, no sign-in ----
export const pub = {
  registration: (token: string) => api.get<PublicReg>(`/public/registration/${encodeURIComponent(token)}`, { ttl: 20000 }),
  register: (token: string, b: { teamName: string; captainName: string; captainContact: string; players: RegPlayer[]; notes?: string }) => api.post<{ ok: true }>(`/public/registration/${encodeURIComponent(token)}/submit`, b),
  pass: (token: string) => api.get<PassData>(`/public/pass/${encodeURIComponent(token)}`, { ttl: 60000, swr: 600000 }),
  invite: (token: string) => api.get<{ event: { name: string; date: string }; team: { name: string } }>(`/public/invite/${encodeURIComponent(token)}`, { ttl: 60000 }),
  submit: (token: string, b: { name: string; role?: string; minor?: boolean; photo?: string }) => api.post<{ ok: true }>(`/public/invite/${encodeURIComponent(token)}/submit`, b),
};

// ---- live page ----
export const live = {
  /** Owner, editor or viewer. Never cached: the panel must show what is really published. */
  get: (eventId: string) => api.get<LiveState>(`/events/${encodeURIComponent(eventId)}/live`, { ttl: 0, swr: 0 }),
  /** Owner or editor. Either part is optional; a snapshot replaces the old one whole. */
  put: (eventId: string, body: { published?: boolean; snapshot?: LiveSnapshot }) => api.put<LiveState>(`/events/${encodeURIComponent(eventId)}/live`, body),
  /** No sign-in. The shared client sends the saved ETag, so an unchanged page costs one tiny 304 answer. */
  public: (slug: string) => api.get<PublicLive>(`/public/live/${encodeURIComponent(slug)}`, { ttl: 0, swr: 0, retries: 1 }),
};

// ---- gate device (a gate key instead of a sign-in) ----
export function gateClient(key: string) {
  const call = async <T>(path: string, body?: unknown): Promise<T> => {
    // A gate phone on a bad signal must get an answer or an error within seconds: a request that hangs would freeze the scan queue.
    const res = await fetchWithin(API_BASE + path, { method: body === undefined ? "GET" : "POST", headers: { "x-gate-key": key, ...(body === undefined ? {} : { "content-type": "application/json" }) }, body: body === undefined ? undefined : JSON.stringify(body) }, body === undefined ? 15000 : 10000);
    if (!res.ok) throw Object.assign(new Error(`gate ${res.status}`), { status: res.status });
    return res.json() as Promise<T>;
  };
  return {
    roster: () => call<{ event: { name: string; date: string; venue: string }; people: { id: string; name: string; team: string | null; role: string; zones: unknown; minor: boolean; guardian: boolean; photoUrl: string | null; checkedInAt: string | null }[] }>("/gate/roster"),
    checkin: (code: string) => call<CheckResult>("/gate/checkin", { code }),
    batch: (codes: string[]) => call<{ results: (CheckResult & { code: string })[] }>("/gate/checkin/batch", { codes }),
    photo: (path: string) => events.photoAsDataUrl(path, key),
  };
}

/** Where a gate key's waiting scans are kept. Only a short fingerprint of the key goes into the name, never the key itself. */
export function gateQueueKey(gateKey: string): string {
  let h = 5381;
  for (let i = 0; i < gateKey.length; i++) h = ((h << 5) + h + gateKey.charCodeAt(i)) | 0;
  return `eh-gate-queue-${(h >>> 0).toString(36)}`;
}

/** Scans that could not be sent (no signal at the gate) wait here and go up together, 100 to a request. */
export function offlineScanQueue(gateKey: string, storage: Storage | null, onSent: (r: (CheckResult & { code: string })[]) => void) {
  const g = gateClient(gateKey);
  return createBatchQueue<string>({
    // One saved queue per gate key: scans waiting for one door are never sent with another door's key.
    keyOf: (c) => c, storage, storageKey: gateQueueKey(gateKey), maxBatch: 100, intervalMs: 8000,
    send: async (codes) => { const r = await g.batch(codes); onSent(r.results); },
  });
}
