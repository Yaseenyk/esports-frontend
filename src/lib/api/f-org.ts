import { api } from "./index";
import { CONTEXT_PATH } from "./context";
import type { AuditEntry, ConvertPreview, CreatedInvitation, DeletionPreview, OrgDetail, OrgEvents, OrgInvitation, OrgMembers } from "../org";
import type { OrgRole } from "./context";

/** Club calls (docs/ecosystem/org-api.md). Every `/orgs` and `/me/invitations` route answers 404 while the server's flag is off, so nothing here is called unless /me/context said teamOrgs is true. */
const o = (id: string) => `/orgs/${encodeURIComponent(id)}`;

export const orgApi = {
  detail: (id: string) => api.get<OrgDetail>(o(id), { ttl: 10_000 }),
  members: (id: string) => api.get<OrgMembers>(`${o(id)}/members`, { ttl: 5_000 }),
  setRole: (id: string, userId: string, role: OrgRole) => api.put<{ ok: true; role: OrgRole }>(`${o(id)}/members/${encodeURIComponent(userId)}`, { role }),
  /** Removing someone else, or yourself (leaving). */
  removeMember: (id: string, userId: string) => api.del<{ ok: true }>(`${o(id)}/members/${encodeURIComponent(userId)}`),
  invitations: (id: string) => api.get<{ invitations: OrgInvitation[] }>(`${o(id)}/invitations`, { ttl: 5_000 }),
  /** The link and token come back once and are never stored by the server in readable form. Not retried, not cached. */
  invite: (id: string, email: string, role: OrgRole) => api.post<CreatedInvitation>(`${o(id)}/invitations`, { email, role }),
  revokeInvitation: (id: string, iid: string) => api.del<{ ok: true }>(`${o(id)}/invitations/${encodeURIComponent(iid)}`),
  events: (id: string, today: string, after?: string | null) => api.get<OrgEvents>(`${o(id)}/events?today=${encodeURIComponent(today)}&limit=20${after ? `&after=${encodeURIComponent(after)}` : ""}`, { ttl: 10_000 }),
  audit: (id: string, after?: string | null) => api.get<{ entries: AuditEntry[]; next: string | null }>(`${o(id)}/audit?limit=30${after ? `&after=${encodeURIComponent(after)}` : ""}`, { ttl: 5_000 }),
  convertPreview: () => api.get<ConvertPreview>("/orgs/convert/preview", { ttl: 0, retries: 0 }),
  convert: async (name: string) => {
    const r = await api.post<{ id: string; name: string; kind: "team"; role: "admin"; eventCount: number }>("/orgs/convert", { name });
    api.invalidate(CONTEXT_PATH); api.invalidate("/orgs"); api.invalidate("/events"); // the shell learns about the club on its next read
    return r;
  },
  accept: async (token: string) => {
    const r = await api.post<{ ok: true; kind: "org" | "event"; orgId?: string; eventId?: string; role?: string }>("/me/invitations/accept", { token });
    api.invalidate(CONTEXT_PATH); api.invalidate("/orgs"); api.invalidate("/events");
    return r;
  },
};

export const meApi = {
  /** The person's own data, as JSON. Five a hour, then 429. The answer is the file's content. */
  exportData: () => api.post<Record<string, unknown>>("/me/export", undefined, { timeout: 30_000 }),
  deletionPreview: () => api.get<DeletionPreview>("/me/deletion-preview", { ttl: 0, retries: 1 }),
};
