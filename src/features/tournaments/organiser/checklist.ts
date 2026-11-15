/**
 * The thin-page guard as a live checklist. It runs the SAME pure function as the build and the backend (`seoVerdict`), on what is typed
 * in the form plus what the server already knows (status, publish click, whether results exist, whether the title is taken).
 * Pure. The server computes the real `seoReady` on every save; this is the preview of it.
 */
import { seoVerdict, toEpoch, SEO_DESCRIPTION_MIN, SEO_SUMMARY_MIN, SEO_TITLE_MIN } from "@/features/tournaments/seo/thin-page-guard";
import { localInputToIso, markdownToPlain, type TournamentForm } from "@/features/tournaments/organiser/form";
import type { OrganiserTournament } from "@/features/tournaments/organiser/domain";

export interface CheckItem { key: string; label: string; ok: boolean; /** What to do when it is not ok. */ hint: string }

const ORDER: { key: string; label: string; hint: (f: TournamentForm) => string }[] = [
  { key: "title_unique", label: "A unique title", hint: () => `Use at least ${SEO_TITLE_MIN} characters, and a title no other published tournament uses.` },
  { key: "summary_80", label: `A summary of ${SEO_SUMMARY_MIN}+ characters`, hint: (f) => `${f.summary.trim().length} of ${SEO_SUMMARY_MIN} so far. Say what the tournament is, who it is for and when.` },
  { key: "description_200", label: `A description of ${SEO_DESCRIPTION_MIN}+ characters written by you`, hint: (f) => `${markdownToPlain(f.description).length} of ${SEO_DESCRIPTION_MIN} so far. Write it yourself: format, schedule, who can join.` },
  { key: "start_date", label: "A start date", hint: () => "Add the date and time the tournament starts." },
  { key: "venue", label: "A venue or the online flag", hint: () => "Choose online, or add the city for an in-person or hybrid event." },
  { key: "registration_or_results", label: "Open registration or verified results", hint: () => "Registration has to be open (or results verified) once the page is published." },
  { key: "published", label: "Published by you", hint: () => "Publish the page. A draft or cancelled page is never indexed." },
];

/** The checklist for the current form. `saved` is the tournament as the server has it (null while creating). */
export function pageChecklist(f: TournamentForm, saved: OrganiserTournament | null): CheckItem[] {
  const failedBefore = new Set(saved?.seoFailures ?? []);
  const sameTitle = !!saved && f.title.trim() === saved.title;
  const status = saved?.status ?? "draft";
  const v = seoVerdict({
    title: f.title,
    // The browser cannot see other organisers' titles. Keep the server's "taken" answer while the title is unchanged; otherwise assume free.
    titleIsUnique: !(sameTitle && failedBefore.has("title_unique") && f.title.trim().length >= SEO_TITLE_MIN),
    summary: f.summary, description: markdownToPlain(f.description), startsAt: toEpoch(localInputToIso(f.startsAt)), venue: f.venue as "online" | "offline" | "hybrid", city: f.city, status,
    // Verified results exist when the server did not list that line and the page is not simply open for registration.
    hasVerifiedResults: !!saved && status !== "registration_open" && !failedBefore.has("registration_or_results"),
    publishedAt: saved?.publishedAt ? toEpoch(saved.publishedAt) : null,
  });
  return ORDER.map((o) => ({ key: o.key, label: o.label, ok: !v.failures.includes(o.key), hint: o.hint(f) }));
}

export const checklistReady = (items: readonly CheckItem[]): boolean => items.every((i) => i.ok);
