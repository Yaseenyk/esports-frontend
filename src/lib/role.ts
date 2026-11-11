/** The role model. A missing or unknown role is never owner: it fails closed to the least power ("viewer"). */
export type Role = "owner" | "editor" | "viewer";

const ROLES: readonly string[] = ["owner", "editor", "viewer"];

/** True only for a role this app knows. */
export const isKnownRole = (r: unknown): r is Role => typeof r === "string" && ROLES.includes(r);

/** Maps whatever the server sent (undefined, null, a future role name) to a role the UI can trust. Unknown means viewer. */
export const safeRole = (r: unknown): Role => (isKnownRole(r) ? r : "viewer");

/** Owner-only controls need an explicit "owner". Missing or unknown is not owner. */
export const isOwner = (r: unknown): boolean => r === "owner";

/** Edit controls need an explicit owner or editor. Missing or unknown is read-only. */
export const canEditRole = (r: unknown): boolean => r === "owner" || r === "editor";
