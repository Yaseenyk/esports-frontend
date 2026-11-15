import { CONSENT_VERSION, CONTACT_MAX, ERRORS_MAX, ERROR_LEN } from "@/features/feedback/config";
import type { ReportBody, ReportInput } from "@/features/feedback/domain";
import { cleanPath } from "@/features/feedback/hooks/path";

/**
 * Builds the exact JSON of `POST /feedback` (the fixed contract). Pure. The path is cut to path only (no query, no hash) here AND in the
 * hook, the honeypot is always the empty string, and optional keys are left out when empty, never sent as null.
 */
export function buildReportBody(i: ReportInput, consentVersion: string = CONSENT_VERSION): ReportBody {
  const title = i.title?.trim().slice(0, 120);
  const contact = i.contact?.trim().slice(0, CONTACT_MAX);
  const errors = (i.errors ?? []).filter(Boolean).slice(-ERRORS_MAX).map((e) => e.slice(0, ERROR_LEN));
  return {
    kind: i.kind,
    message: i.message.trim(),
    page: { path: cleanPath(i.path), ...(title ? { title } : {}) },
    client: {
      viewport: { w: Math.max(0, Math.round(i.viewport.w)), h: Math.max(0, Math.round(i.viewport.h)) },
      ...(i.locale ? { locale: i.locale.slice(0, 20) } : {}),
      ...(i.buildId ? { buildId: i.buildId.slice(0, 40) } : {}),
      ...(errors.length ? { errors } : {}),
    },
    ...(contact ? { contact } : {}),
    ...(i.includeAccount ? { includeAccount: true } : {}),
    consent: true,
    consentVersion,
    website: "",
  };
}
