import { COPY, KINDS, fill } from "@/features/feedback/copy";
import { CONTACT_MAX, MESSAGE_MAX, MESSAGE_MIN, WITHDRAW_SECONDS } from "@/features/feedback/config";
import type { FeedbackCode, FeedbackKind } from "@/features/feedback/domain";
import { cleanPath, validatePathInput } from "@/features/feedback/hooks/path";

/**
 * The scripted conversation as a pure state machine (no React, no network). The hook feeds it actions; the screen only draws `state`.
 * Order: greeting > kind > message > page > shots > contact > review > sending > done | partial. `withdrawn` ends a withdrawn report.
 */
export type Step = "greeting" | "kind" | "message" | "page" | "shots" | "contact" | "review" | "sending" | "done" | "partial" | "withdrawn";

export const FORM_STEPS: Step[] = ["greeting", "kind", "message", "page", "shots", "contact", "review"];

export interface ShotMeta { id: string; name: string; status: "working" | "ready" | "error"; size?: number; error?: string }

export interface ConvState {
  step: Step;
  kind: FeedbackKind | null;
  message: string;
  /** The path the visitor is on (auto) and the one that will be sent (editable). */
  detectedPath: string;
  path: string;
  shots: ShotMeta[];
  contact: string;
  includeAccount: boolean;
  includeErrors: boolean;
  consent: boolean;
  /** Field-level problems for the current step, shown only after the visitor tried to move on. */
  errors: Partial<Record<"kind" | "message" | "path" | "shots" | "contact" | "consent", string>>;
  /** A problem from the server or the network, in plain words. */
  notice: string;
  /** Set once the report exists on the server. `uploadFailed` lists the screenshot ids that did not upload. */
  report: { id: string; token: string; expiresAt: number } | null;
  uploadFailed: string[];
  uploadedIds: string[];
  withdrawing: boolean;
}

export const initialState = (path = "/"): ConvState => ({
  step: "greeting", kind: null, message: "", detectedPath: cleanPath(path), path: cleanPath(path), shots: [], contact: "", includeAccount: false, includeErrors: true,
  consent: false, errors: {}, notice: "", report: null, uploadFailed: [], uploadedIds: [], withdrawing: false,
});

export type Action =
  | { type: "start"; path: string }
  | { type: "kind"; kind: FeedbackKind }
  | { type: "message"; text: string }
  | { type: "path"; text: string }
  | { type: "contact"; text: string }
  | { type: "account"; on: boolean }
  | { type: "errorsTick"; on: boolean }
  | { type: "consent"; on: boolean }
  | { type: "shotAdd"; shot: ShotMeta }
  | { type: "shotPatch"; id: string; patch: Partial<ShotMeta> }
  | { type: "shotRemove"; id: string }
  | { type: "next"; maxShots?: number }
  | { type: "skip" }
  | { type: "back" }
  | { type: "goto"; step: Step }
  | { type: "sendStart" }
  | { type: "created"; id: string; token: string; expiresInSeconds?: number; now: number }
  | { type: "sendFailed"; code: FeedbackCode; max?: number }
  | { type: "uploadResult"; uploaded: string[]; failed: string[]; code?: FeedbackCode; max?: number }
  | { type: "retryStart" }
  | { type: "finishWithout" }
  | { type: "withdrawStart" }
  | { type: "withdrawn" }
  | { type: "withdrawFailed"; code: FeedbackCode }
  | { type: "reset"; path: string };

// ---- validation, one rule per field ----
export const messageLength = (s: string): number => s.trim().length;

export function validateKind(k: FeedbackKind | null): string { return k ? "" : COPY.kindRequired; }
export function validateMessage(s: string): string {
  const n = messageLength(s);
  if (n < MESSAGE_MIN) return fill(COPY.tooShort, { min: MESSAGE_MIN });
  if (s.length > MESSAGE_MAX) return fill(COPY.tooLong, { max: MESSAGE_MAX });
  return "";
}
export function validatePath(s: string, origin?: string): string { return validatePathInput(s, origin) ? "" : COPY.pathBad; }
export function validateContact(s: string): string { return s.trim().length > CONTACT_MAX ? fill(COPY.contactBad, { max: CONTACT_MAX }) : ""; }
export function validateShots(shots: ShotMeta[]): string { return shots.some((x) => x.status === "working") ? COPY.shotBusy : ""; }

/** The first error of a step ("" when the visitor may move on). */
export function stepErrors(s: ConvState, origin?: string): ConvState["errors"] {
  const e: ConvState["errors"] = {};
  const put = (k: keyof ConvState["errors"], v: string) => { if (v) e[k] = v; };
  switch (s.step) {
    case "kind": put("kind", validateKind(s.kind)); break;
    case "message": put("message", validateMessage(s.message)); break;
    case "page": put("path", validatePath(s.path, origin)); break;
    case "shots": put("shots", validateShots(s.shots)); break;
    case "contact": put("contact", validateContact(s.contact)); break;
    case "review":
      put("kind", validateKind(s.kind)); put("message", validateMessage(s.message)); put("path", validatePath(s.path, origin)); put("contact", validateContact(s.contact));
      if (!s.consent) e.consent = COPY.consentRequired;
      break;
    default: break;
  }
  return e;
}

const NEXT: Partial<Record<Step, Step>> = { greeting: "kind", kind: "message", message: "page", page: "shots", shots: "contact", contact: "review" };
const PREV: Partial<Record<Step, Step>> = { kind: "greeting", message: "kind", page: "message", shots: "page", contact: "shots", review: "contact" };

/** Where a failed send puts the visitor back: the field that needs fixing, otherwise the summary. */
function stepFor(code: FeedbackCode): Step { return code === "too_short" ? "message" : code === "invalid" ? "page" : "review"; }

export function errorText(code: FeedbackCode, max = 2): string {
  const t: Record<FeedbackCode, string> = {
    rate_limited: COPY.errors.rate_limited, daily_cap: COPY.errors.daily_cap, too_short: COPY.errors.too_short, invalid: COPY.errors.invalid, not_found: COPY.errors.not_found,
    too_big: COPY.errors.too_big, bad_image: COPY.errors.bad_image, unsupported_type: COPY.errors.unsupported_type, too_many: fill(COPY.errors.too_many, { max }),
    bad_token: COPY.errors.bad_token, payload: COPY.errors.payload, network: COPY.errors.network, unknown: COPY.errors.unknown,
  };
  return t[code];
}

export function reduce(s: ConvState, a: Action, origin?: string): ConvState {
  switch (a.type) {
    case "start": return s.step === "greeting" ? { ...s, detectedPath: cleanPath(a.path), path: cleanPath(a.path) } : s;
    case "kind": return { ...s, kind: a.kind, errors: { ...s.errors, kind: undefined } };
    case "message": return { ...s, message: a.text.slice(0, MESSAGE_MAX + 200), errors: { ...s.errors, message: undefined } };
    case "path": return { ...s, path: a.text.slice(0, 400), errors: { ...s.errors, path: undefined } };
    case "contact": return { ...s, contact: a.text.slice(0, CONTACT_MAX + 80), errors: { ...s.errors, contact: undefined } };
    case "account": return { ...s, includeAccount: a.on };
    case "errorsTick": return { ...s, includeErrors: a.on };
    case "consent": return { ...s, consent: a.on, errors: { ...s.errors, consent: undefined } };
    case "shotAdd": return { ...s, shots: [...s.shots, a.shot], errors: { ...s.errors, shots: undefined } };
    case "shotPatch": return { ...s, shots: s.shots.map((x) => (x.id === a.id ? { ...x, ...a.patch } : x)) };
    case "shotRemove": return { ...s, shots: s.shots.filter((x) => x.id !== a.id) };
    case "next": {
      const to = NEXT[s.step];
      if (!to) return s;
      if (s.step === "greeting") return { ...s, step: to, notice: "", errors: {} };
      const errors = stepErrors(s, origin);
      if (Object.keys(errors).length) return { ...s, errors };
      return { ...s, step: to, errors: {}, notice: "" };
    }
    case "skip": { // only the optional steps can be skipped
      if (s.step === "shots") return { ...s, shots: [], step: "contact", errors: {} };
      if (s.step === "contact") return { ...s, contact: "", step: "review", errors: {} };
      return s;
    }
    case "back": { const to = PREV[s.step]; return to ? { ...s, step: to, errors: {}, notice: "" } : s; }
    case "goto": return FORM_STEPS.includes(a.step) && s.step === "review" ? { ...s, step: a.step, errors: {}, notice: "" } : s;
    case "sendStart": {
      if (s.step !== "review") return s;
      const errors = stepErrors(s, origin);
      if (Object.keys(errors).length) return { ...s, errors };
      return { ...s, step: "sending", errors: {}, notice: "" };
    }
    case "created": return { ...s, report: { id: a.id, token: a.token, expiresAt: a.now + (a.expiresInSeconds ?? WITHDRAW_SECONDS) * 1000 } };
    case "sendFailed": return { ...s, step: stepFor(a.code), notice: errorText(a.code, a.max) };
    case "uploadResult": {
      const uploadedIds = [...s.uploadedIds, ...a.uploaded];
      if (a.failed.length) return { ...s, step: "partial", uploadedIds, uploadFailed: a.failed, notice: a.code ? errorText(a.code, a.max) : "" };
      return { ...s, step: "done", uploadedIds, uploadFailed: [], notice: "" };
    }
    case "retryStart": return s.step === "partial" ? { ...s, step: "sending", notice: "" } : s;
    case "finishWithout": return { ...s, step: "done", uploadFailed: [], notice: "" };
    case "withdrawStart": return s.report ? { ...s, withdrawing: true, notice: "" } : s;
    case "withdrawn": return { ...s, step: "withdrawn", withdrawing: false, notice: "" };
    case "withdrawFailed": return { ...s, withdrawing: false, notice: a.code === "bad_token" ? COPY.errors.withdrawExpired : errorText(a.code) };
    case "reset": return initialState(a.path);
    default: return s;
  }
}

/** True while the withdraw button may be shown. */
export const canWithdraw = (s: ConvState, now: number): boolean => !!s.report && (s.step === "done" || s.step === "partial") && now < s.report.expiresAt;

export interface Line { from: "bot" | "you"; text: string }

/** The chat transcript above the current question: what the bot asked and what the visitor answered. Pure, for the screen to draw. */
export function transcript(s: ConvState): Line[] {
  const out: Line[] = [{ from: "bot", text: COPY.greeting }];
  const idx = FORM_STEPS.indexOf(s.step);
  const passed = (st: Step) => idx > FORM_STEPS.indexOf(st) || idx < 0;
  if (passed("kind") && s.kind) { out.push({ from: "bot", text: COPY.kindQuestion }, { from: "you", text: KINDS.find((k) => k.id === s.kind)?.label ?? s.kind }); }
  if (passed("message")) { out.push({ from: "bot", text: COPY.messageQuestion }, { from: "you", text: s.message.trim().length > 140 ? `${s.message.trim().slice(0, 140)}...` : s.message.trim() }); }
  if (passed("page")) out.push({ from: "bot", text: `${COPY.pageIntro} ${s.path}` });
  if (passed("shots")) out.push({ from: "bot", text: COPY.shotsQuestion }, { from: "you", text: s.shots.filter((x) => x.status === "ready").length ? `${s.shots.filter((x) => x.status === "ready").length} image(s)` : "Skipped" });
  if (passed("contact")) out.push({ from: "bot", text: COPY.contactQuestion }, { from: "you", text: s.contact.trim() || "Skipped" });
  return idx < 0 ? [] : out; // sending, thank-you and withdrawn screens do not repeat the intro line
}

/** The bot line for the current step, the one a screen reader announces (aria-live). */
export function currentPrompt(s: ConvState): string {
  switch (s.step) {
    case "greeting": return COPY.greeting;
    case "kind": return COPY.kindQuestion;
    case "message": return COPY.messageQuestion;
    case "page": return `${COPY.pageIntro} ${s.path}`;
    case "shots": return COPY.shotsQuestion;
    case "contact": return COPY.contactQuestion;
    case "review": return COPY.reviewQuestion;
    case "sending": return COPY.sending;
    case "done": return COPY.thanksTitle;
    case "partial": return COPY.partialTitle;
    case "withdrawn": return COPY.withdrawn;
  }
}
