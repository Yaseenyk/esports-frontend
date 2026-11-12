"use client";

/**
 * The signed-in person's context (GET /me/context, blueprint 11.2): who they are, which organisations they belong to and with what
 * role, and feature flags. UNUSED for now: nothing in the shell calls it until the e2e mock factory with the aborting catch-all is in.
 * Roles are normalised here so a missing or unknown role never reads as owner.
 */
import { useQuery, type Query } from "./useQuery";
import { safeRole, type Role } from "../role";

export const CONTEXT_PATH = "/me/context";

/** A person's part in a club. Unknown or missing is "member", the least power (the event role in `role` is a different thing). */
export type OrgRole = "admin" | "member";
export const safeOrgRole = (r: unknown): OrgRole => (r === "admin" ? "admin" : "member");

export interface AppContext {
  user: { id: string; email: string; name: string; emailVerified: boolean };
  /** `role` is the legacy event role (admin/member read as viewer there); use `orgRole` for club screens. */
  orgs: { id: string; name: string; kind: string; role: Role; orgRole: OrgRole; status: string; caps: string[] }[];
  staff: { role: string } | null;
  features: { teamOrgs: boolean };
}

/** Defensive read of the server's answer: every missing piece gets its safest value. */
export function normaliseContext(raw: unknown): AppContext {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const u = (r.user && typeof r.user === "object" ? r.user : {}) as Record<string, unknown>;
  const f = (r.features && typeof r.features === "object" ? r.features : {}) as Record<string, unknown>;
  const st = r.staff && typeof r.staff === "object" ? (r.staff as Record<string, unknown>) : null;
  return {
    user: { id: String(u.id ?? ""), email: String(u.email ?? ""), name: String(u.name ?? ""), emailVerified: u.emailVerified === true },
    orgs: (Array.isArray(r.orgs) ? r.orgs : []).filter((o): o is Record<string, unknown> => !!o && typeof o === "object").map((o) => ({
      id: String(o.id ?? ""), name: String(o.name ?? ""), kind: String(o.kind ?? ""), role: safeRole(o.role), orgRole: safeOrgRole(o.role), status: typeof o.status === "string" ? o.status : "active",
      caps: Array.isArray(o.caps) ? o.caps.filter((c): c is string => typeof c === "string") : [],
    })),
    staff: st && typeof st.role === "string" ? { role: st.role } : null,
    features: { teamOrgs: f.teamOrgs === true },
  };
}

/** Reads the context. Pass `enabled: false` to skip the request. It is read once and kept for 5 minutes; a failure is never retried in a loop. */
export function useAppContext(enabled = true): Query<AppContext> {
  const q = useQuery<unknown>(enabled ? CONTEXT_PATH : null, { ttl: 300_000, retries: 1, timeout: 8000 });
  return { ...q, data: q.data === undefined ? undefined : normaliseContext(q.data) };
}
