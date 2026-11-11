/** Pure logic for the forgot-password and reset-password screens. */

export const RESEND_SECONDS = 60;
export const PASSWORD_HINT = "At least 8 characters.";
export const FORGOT_NEUTRAL = "If an account exists for that email, we have sent a link. It works for 30 minutes. Check spam too.";

/** Whole seconds left until `until` (ms timestamp); never negative. */
export const secondsLeft = (until: number, now: number) => Math.max(0, Math.ceil((until - now) / 1000));

/** The same password rule as sign-up: at least 8 characters. Returns a sentence, or "" when fine. */
export function passwordProblem(pw: string): string {
  return pw.length < 8 ? "Use a password of at least 8 characters." : "";
}

/** "" when the two match, otherwise a sentence. */
export function mismatchProblem(pw: string, confirm: string): string {
  return pw === confirm ? "" : "The two passwords do not match.";
}

/** Cheap shape check so an obviously wrong email never costs a request. The server has the final say. */
export const looksLikeEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

/** The email carried in /forgot-password/?email=..., trimmed and capped; "" if absent. */
export function emailFromQuery(search: string): string {
  const v = new URLSearchParams(search).get("email") ?? "";
  return v.trim().slice(0, 254);
}

/** The reset token from ?t=..., or "" when missing. */
export function tokenFromQuery(search: string): string {
  return (new URLSearchParams(search).get("t") ?? "").trim().slice(0, 512);
}

type Err = { status?: number; serverError?: string };

/** Words for a failed reset-link request. */
export function forgotMessage(e: unknown): string {
  const s = (e as Err)?.status;
  if (s === 429) return "Too many tries. Wait a few minutes.";
  if (s === 400) return "That does not look like an email address. Check it and try again.";
  if (s && s >= 500) return "The server had a problem. Try again in a moment.";
  return "Could not reach the server. Check your connection and try again.";
}

export type ResetFailure = { kind: "expired" } | { kind: "message"; text: string };

/** Sorts a failed reset into "link is dead" or a message the person can act on. */
export function resetFailure(e: unknown): ResetFailure {
  const { status: s, serverError } = (e as Err) ?? {};
  if (s === 400 && serverError === "invalid_or_expired") return { kind: "expired" };
  if (s === 400) return { kind: "message", text: serverError || "That password is not accepted. Use at least 8 characters." };
  if (s === 429) return { kind: "message", text: "Too many tries. Wait a few minutes." };
  if (s && s >= 500) return { kind: "message", text: "The server had a problem. Try again in a moment." };
  return { kind: "message", text: "Could not reach the server. Check your connection and try again." };
}
