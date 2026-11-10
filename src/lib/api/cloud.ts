/** Typed calls to the Esports Hub backend (Cloudflare Worker). Every call goes through the shared client, so it is cached, de-duplicated and batched where it can be. */
import { api, API_BASE, setToken } from "./index";
import { createBatchQueue } from "./queue";

export interface User { id: string; email: string; name: string }
export interface CloudEvent { id: string; key: string; name: string; game: string; organiser: string; date: string; venue: string; emergency: string; rules: string; settings: unknown; updatedAt: string }
export interface CloudTeam { id: string; name: string; logo?: string | null }
export interface CloudPerson { id: string; name: string; teamId: string; role: string; zones?: string | string[]; minor: boolean; guardian: boolean; photoUrl: string | null }
export interface CloudRoster { teams: CloudTeam[]; people: CloudPerson[] }
export interface Checkin { personId: string; name: string; team: string | null; role: string; at: string; door?: string | null }
export interface Live { checkins: Checkin[]; total: number; checkedIn: number }
export interface GateKey { id: string; label: string; expiresAt: string | null; revoked: boolean; createdAt: string }
export interface Invite { id: string; teamId: string; token: string; label: string; maxUses: number | null; uses: number; expiresAt: string | null; revoked: boolean; createdAt: string }
export interface Submission { id: string; teamId: string; team: string | null; name: string; role: string; minor: boolean; status: string; createdAt: string; photoUrl: string | null }
export interface PassData { event: { name: string; date: string; venue: string }; person: { name: string; team: string | null; role: string; zones: unknown }; code: string; photoUrl: string | null }
export type CheckResult = { status: "ok" | "again" | "bad"; reason?: string; person?: { id: string; name: string; team: string | null; role: string; zones: unknown; minor: boolean; guardian: boolean }; at?: string };

// ---- session: the sign-in token lives in this browser only ----
const TOKEN_KEY = "eh-session-v1";
type Listener = () => void;
const listeners = new Set<Listener>();
let session: { token: string; user: User } | null = null;
try { const raw = typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null; if (raw) { session = JSON.parse(raw); setToken(session!.token); } } catch { session = null; }
const emit = () => listeners.forEach((l) => l());
export const sessionStore = {
  get: () => session,
  subscribe: (l: Listener) => { listeners.add(l); return () => { listeners.delete(l); }; },
};
function setSession(s: typeof session) {
  session = s; setToken(s?.token ?? null); api.clear();
  try { if (s) localStorage.setItem(TOKEN_KEY, JSON.stringify(s)); else localStorage.removeItem(TOKEN_KEY); } catch { /* private mode: stay signed in for this tab only */ }
  emit();
}

export const auth = {
  async register(email: string, name: string, password: string) { const r = await api.post<{ token: string; user: User }>("/auth/register", { email, name, password }); setSession(r); return r.user; },
  async login(email: string, password: string) { const r = await api.post<{ token: string; user: User }>("/auth/login", { email, password }); setSession(r); return r.user; },
  logout() { setSession(null); },
  changePassword: (current: string, next: string) => api.post<{ ok: true }>("/auth/change-password", { current, next }),
  async deleteAccount(password: string) { await api.post<{ ok: true }>("/auth/delete-account", { password }); setSession(null); },
};

/** What the backend says when something is wrong, in words a person can act on. */
export function explain(e: unknown): string {
  const s = (e as { status?: number })?.status;
  if (s === 401) return "Your sign-in has expired or the details are wrong. Sign in again.";
  if (s === 409) return "That email already has an account. Sign in instead.";
  if (s === 429) return "Too many tries. Wait a few minutes and try again.";
  if (s === 404) return "That was not found. It may have been removed.";
  if (s && s >= 500) return "The server had a problem. Try again in a moment.";
  if (s) return "The server did not accept that. Check what you typed.";
  return "Could not reach the server. Check your connection.";
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
  /** One photo, sent as the raw image. The backend keeps it separate from the roster so the roster stays small. */
  async putPhoto(id: string, personId: string, blob: Blob) {
    const res = await fetch(`${API_BASE}/events/${id}/photos/${encodeURIComponent(personId)}`, { method: "PUT", headers: { "content-type": blob.type, authorization: `Bearer ${session?.token ?? ""}` }, body: blob });
    if (!res.ok) throw Object.assign(new Error("photo upload failed"), { status: res.status });
  },
  /** Fetches an image that needs the sign-in token, as a data URL the cards can use. */
  async photoAsDataUrl(path: string, gateKey?: string): Promise<string | null> {
    const res = await fetch(API_BASE + path, { headers: gateKey ? { "x-gate-key": gateKey } : { authorization: `Bearer ${session?.token ?? ""}` } });
    if (!res.ok) return null;
    const b = await res.blob();
    return new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.readAsDataURL(b); });
  },
};

// ---- public, no sign-in ----
export const pub = {
  pass: (token: string) => api.get<PassData>(`/public/pass/${encodeURIComponent(token)}`, { ttl: 60000, swr: 600000 }),
  invite: (token: string) => api.get<{ event: { name: string; date: string }; team: { name: string } }>(`/public/invite/${encodeURIComponent(token)}`, { ttl: 60000 }),
  submit: (token: string, b: { name: string; role?: string; minor?: boolean; photo?: string }) => api.post<{ ok: true }>(`/public/invite/${encodeURIComponent(token)}/submit`, b),
};

// ---- gate device (a gate key instead of a sign-in) ----
export function gateClient(key: string) {
  const call = async <T>(path: string, body?: unknown): Promise<T> => {
    const res = await fetch(API_BASE + path, { method: body === undefined ? "GET" : "POST", headers: { "x-gate-key": key, ...(body === undefined ? {} : { "content-type": "application/json" }) }, body: body === undefined ? undefined : JSON.stringify(body) });
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

/** Scans that could not be sent (no signal at the gate) wait here and go up together, 100 to a request. */
export function offlineScanQueue(gateKey: string, storage: Storage | null, onSent: (r: (CheckResult & { code: string })[]) => void) {
  const g = gateClient(gateKey);
  return createBatchQueue<string>({
    keyOf: (c) => c, storage, storageKey: "eh-gate-queue", maxBatch: 100, intervalMs: 8000,
    send: async (codes) => { const r = await g.batch(codes); onSent(r.results); },
  });
}
