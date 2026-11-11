/** Pure logic for the email verification landing page (S6). */

export type VerifyFailure = { kind: "expired" } | { kind: "signin" } | { kind: "message"; text: string };

type Err = { status?: number; serverError?: string };

/** The verification token from ?t=..., or "" when missing. */
export function verifyTokenFromQuery(search: string): string {
  return (new URLSearchParams(search).get("t") ?? "").trim().slice(0, 512);
}

/** Plain words for a failed confirm. The server gives one answer for expired, used, unknown and someone else's token, so they read the same. */
export function verifyFailure(e: unknown): VerifyFailure {
  const x = e as Err;
  if (x?.status === 401) return { kind: "signin" };
  if (x?.status === 400 && x.serverError === "invalid_or_expired") return { kind: "expired" };
  if (x?.status === 429) return { kind: "message", text: "Too many tries. Wait a few minutes and open the link again." };
  return { kind: "message", text: "We could not reach the server. Check your connection and try again." };
}

/** Words for a failed request for a new link. */
export function startMessage(e: unknown): string {
  const x = e as Err;
  if (x?.status === 429) return "We cannot send any more emails right now. Try again tomorrow, or in a few minutes if you just asked.";
  return "We could not send the email. Check your connection and try again.";
}
