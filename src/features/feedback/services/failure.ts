import type { FeedbackCode, FeedbackFailure } from "@/features/feedback/domain";

const KNOWN: FeedbackCode[] = ["rate_limited", "daily_cap", "too_short", "invalid", "too_big", "bad_image", "unsupported_type", "too_many", "bad_token"];

interface ErrLike { status?: unknown; detail?: { code?: unknown } }

/** Reads whatever a call threw into one of the contract's codes. No status at all means the network failed. */
export function toFeedbackFailure(e: unknown, call: "create" | "upload" | "withdraw" | "status" = "create"): FeedbackFailure {
  const x = (e ?? {}) as ErrLike;
  const status = typeof x.status === "number" ? x.status : 0;
  const code = typeof x.detail?.code === "string" ? x.detail.code : "";
  if (!status) return { code: "network", status: 0 };
  if ((KNOWN as string[]).includes(code)) return { code: code as FeedbackCode, status };
  if (status === 404) return { code: "not_found", status };
  if (status === 413) return { code: call === "upload" ? "too_big" : "payload", status };
  if (status === 429) return { code: "rate_limited", status };
  if (status === 401) return { code: "bad_token", status };
  if (status === 409) return { code: "too_many", status };
  if (status === 415) return { code: "unsupported_type", status };
  if (status === 400) return { code: call === "upload" ? "bad_image" : "invalid", status };
  return { code: "unknown", status };
}
