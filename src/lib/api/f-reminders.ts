/** Typed calls for the email reminders feature. Written against the backend routes in esports-backend/src/features/reminders.ts. */
import { api } from "./index";
import type { RegPlayer } from "./cloud";
import type { Audience, JobStatus, Limits, TemplateId } from "../reminders";

export interface ReminderJob { id: string; kind: TemplateId; subject: string; body: string; audience: Audience; sendAt: string; status: JobStatus; recipientsSnapshotCount: number; sentCount: number; note: string; createdAt: string; sentAt: string | null }
export interface ReminderList { jobs: ReminderJob[]; limits: Limits; mailer: boolean }
export interface RecipientGroup { count: number; unsubscribed: number }
export interface Recipients { organisers: RecipientGroup; captains: RecipientGroup; limits: Limits; items?: { kind: "organiser" | "captain"; email: string; unsubscribed: boolean }[] }
export interface UnsubscribeInfo { event: string; email: string; unsubscribed: boolean }

const base = (eventId: string) => `/events/${encodeURIComponent(eventId)}/reminders`;

export const reminders = {
  list: (eventId: string) => api.get<ReminderList>(base(eventId), { ttl: 0, swr: 0 }),
  recipients: (eventId: string) => api.get<Recipients>(`${base(eventId)}/recipients`, { ttl: 0, swr: 0 }),
  /** `sendAt` null means as soon as the next send run picks it up (within about 15 minutes). */
  create: (eventId: string, b: { kind: TemplateId; subject: string; body: string; audience: Audience; sendAt: string | null }) => api.post<ReminderJob>(base(eventId), b),
  cancel: (eventId: string, id: string) => api.del<{ ok: true }>(`${base(eventId)}/${encodeURIComponent(id)}`),
  /** Sends one email to the signed-in organiser only. */
  test: (eventId: string, b: { subject: string; body: string }) => api.post<{ ok: true; sentTo: string }>(`${base(eventId)}/test`, b),
};

/** No sign-in. A GET never changes anything; only the POST unsubscribes. */
export const unsubscribe = {
  info: (token: string) => api.get<UnsubscribeInfo>(`/public/unsubscribe/${encodeURIComponent(token)}`, { ttl: 0, swr: 0, retries: 1 }),
  confirm: (token: string) => api.post<{ ok: true; event: string; email: string; unsubscribed: true }>(`/public/unsubscribe/${encodeURIComponent(token)}`, {}),
};

/** The public registration submit, with the optional email-updates fields. Same route as `pub.register` in cloud.ts, which has no email fields. */
export const submitRegistration = (token: string, b: { teamName: string; captainName: string; captainContact: string; players: RegPlayer[]; notes?: string; captainEmail?: string; emailConsent?: boolean; emailConsentText?: string }) =>
  api.post<{ ok: true }>(`/public/registration/${encodeURIComponent(token)}/submit`, b);

/** Plain-words explanation of a reminders error. Falls back to the server's own sentence for 400 and 409, which are written for people. */
export function explainReminder(e: unknown, fallback: string): string {
  const x = e as { status?: number; serverError?: string };
  if ((x?.status === 400 || x?.status === 409) && x.serverError) return x.serverError;
  if (x?.status === 429) return "Too many tries. Wait a few minutes and try again.";
  if (x?.status === 403) return "Only the owner or an editor can send reminders.";
  if (x?.status === 404) return "That was not found. It may have been removed.";
  return fallback;
}
