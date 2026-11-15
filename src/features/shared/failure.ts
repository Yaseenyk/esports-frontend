/** One way to read a failed v3 call, so every screen says the same thing. Pure: no network, no React. */
export type FailureKind = "unavailable" | "unauthorized" | "forbidden" | "conflict" | "limited" | "disabled" | "too_large" | "bad_input" | "error";

export interface V3Failure {
  kind: FailureKind;
  status: number;
  /** The server's machine code (`message_has_link`, `listing_cap`...), when it sent one. */
  code?: string;
  /** The server's own words, already safe to show. */
  message?: string;
}

export type V3Result<T> = { ok: true; data: T } | { ok: false; failure: V3Failure };

interface ErrLike { status?: unknown; serverError?: unknown; detail?: { code?: unknown } }

/** Maps whatever a call threw to a failure. A 404 on a v3 call means the feature is switched off (API.md); an unknown error is `error`. */
export function toFailure(e: unknown): V3Failure {
  const x = (e ?? {}) as ErrLike;
  const status = typeof x.status === "number" ? x.status : 0;
  const code = typeof x.detail?.code === "string" ? x.detail.code : undefined;
  const message = typeof x.serverError === "string" ? x.serverError : undefined;
  const kind: FailureKind = status === 404 ? "unavailable" : status === 401 ? "unauthorized" : status === 403 ? "forbidden" : status === 409 ? "conflict" : status === 429 ? "limited"
    : status === 503 ? "disabled" : status === 413 ? "too_large" : status === 400 || status === 415 || status === 410 ? "bad_input" : "error";
  return { kind, status, ...(code ? { code } : {}), ...(message ? { message } : {}) };
}

export async function attempt<T>(run: () => Promise<T>): Promise<V3Result<T>> {
  try { return { ok: true, data: await run() }; } catch (e) { return { ok: false, failure: toFailure(e) }; }
}

/** Plain words for the server's codes (API.md). A code we do not know falls back to the server's message, then to a generic line. */
const WORDS: Record<string, string> = {
  message_has_link: "Links are not allowed here. Say it in words and share contact details after the other person accepts.",
  message_has_phone: "Phone numbers are not allowed here. Contact details are only shown after an application is accepted.",
  message_too_long: "That message is too long.",
  message_empty: "That message is too short. Write at least 10 characters.",
  message_has_markup: "Plain text only: please remove the < and > characters.",
  contact_bad_contact: "The contact must be 2 to 40 characters: letters, digits and . _ # @ - only.",
  contact_has_link: "The contact cannot be a link.",
  contact_has_phone: "The contact cannot be a phone number.",
  adult_required: "You need to confirm you are 18 or older first.",
  consent_required: "Public profiles need your consent first.",
  profile_required: "Create your profile first.",
  slug_taken: "That address is already taken. Try another.",
  slug_format: "Use 3 to 60 letters, digits and single hyphens.",
  slug_reserved: "That address is reserved. Try another.",
  slug_double_hyphen: "Use single hyphens only.",
  slug_and_handle_required: "A profile needs an address and a handle.",
  listing_cap: "You already have 3 open listings. Close one first.",
  bump_too_soon: "You can bump a listing once every 24 hours.",
  already_applied: "You already applied to this listing.",
  own_listing: "That is your own listing.",
  not_team_owner: "You can only post for a team page you own.",
  team_required: "Pick the team page you are recruiting for.",
  file_too_large: "That image is still over 400 KB after shrinking. Try a smaller screenshot.",
  bad_image: "Only PNG, JPEG or WebP images are accepted.",
  evidence_cap: "A dispute can hold at most 4 images.",
  duplicate_evidence: "That image is already attached.",
  dispute_final: "This dispute is closed, so nothing can be added.",
  evidence_purged: "This image was deleted after the retention period.",
  conflict_of_interest: "You cannot decide a dispute you are part of.",
  tournament_not_started: "Disputes open once registration has closed.",
  dispute_cap: "You already have 3 open disputes on this tournament.",
  tournament_exists: "This event already has a tournament page. Opening it instead.",
  slug_locked: "The address cannot change once the page has been published, so existing share links keep working.",
  tournament_final: "A finished tournament cannot be changed.",
  needs_description_and_start: "A description and a start date are needed first. Add them, save, and try again.",
  disputes_open: "Decide every open dispute before the tournament is completed.",
  correction_target_missing: "One of the corrections points at a result that does not exist. Check the match, match number and team.",
  temporarily_disabled: "This is switched off for a few minutes. Try again shortly.",
};

export function explainFailure(f: V3Failure): string {
  if (f.code && WORDS[f.code]) return WORDS[f.code];
  switch (f.kind) {
    case "unavailable": return "This is not available yet.";
    case "unauthorized": return "Please sign in again.";
    case "limited": return "Too many requests. Wait a little and try again.";
    case "disabled": return WORDS.temporarily_disabled;
    case "too_large": return WORDS.file_too_large;
    case "forbidden": return f.message ?? "You are not allowed to do that.";
    case "conflict": case "bad_input": return f.message ?? "That was not accepted. Check the details and try again.";
    default: return "Something went wrong and nothing was changed. Try again.";
  }
}
