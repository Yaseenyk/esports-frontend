/** Shapes shared by the three layers. No logic here. */
export type FeedbackKind = "bug" | "idea" | "confusing" | "other";

/** What `GET /feedback/status` answers while the backend flag is on. */
export interface FeedbackStatus { enabled: true; consentVersion: string; maxAttachments: number; maxAttachmentBytes: number }

export interface ReportInput {
  kind: FeedbackKind;
  message: string;
  path: string;
  /** The page title; left out when the visitor edited the path (it would describe a different page). */
  title?: string;
  viewport: { w: number; h: number };
  locale?: string;
  buildId?: string;
  errors?: string[];
  contact?: string;
  includeAccount?: boolean;
}

/** The exact JSON the contract expects for `POST /feedback`. */
export interface ReportBody {
  kind: FeedbackKind;
  message: string;
  page: { path: string; title?: string };
  client: { viewport: { w: number; h: number }; locale?: string; buildId?: string; errors?: string[] };
  contact?: string;
  includeAccount?: boolean;
  consent: true;
  consentVersion: string;
  website: "";
}

export interface Created { id: string; attachToken: string; attachExpiresIn: number }

/** Why a call failed, in the contract's words. `network` = no answer at all. */
export type FeedbackCode =
  | "rate_limited" | "daily_cap" | "too_short" | "invalid" | "not_found" | "too_big" | "bad_image" | "unsupported_type" | "too_many" | "bad_token" | "payload" | "network" | "unknown";

export interface FeedbackFailure { code: FeedbackCode; status: number }
export type FeedbackResult<T> = { ok: true; data: T } | { ok: false; failure: FeedbackFailure };
