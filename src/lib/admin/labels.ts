/** Plain-word copy for the staff console. Kept apart from the screens so wording is one edit. */

export interface KillCopy { title: string; stops: string; warn: string }

export const KILL_COPY: Record<string, KillCopy> = {
  "kill.public_forms": { title: "Registration and invite forms", stops: "Teams cannot send a registration and people cannot answer an invite.", warn: "Anyone trying to register will see that the form is temporarily unavailable." },
  "kill.directory": { title: "Public directory", stops: "Adding to and reporting on the public directory stops.", warn: "Organisers cannot list new events until you turn this back on." },
  "kill.team_pages": { title: "Team pages", stops: "Changes to public team pages stop.", warn: "Teams cannot update their page while this is stopped. Pages already public stay up." },
  "kill.uploads": { title: "Photo and file uploads", stops: "No new photos or files can be uploaded.", warn: "ID card photos and logos cannot be added until you turn this back on." },
  "kill.mail": { title: "Emails (reminders and password resets)", stops: "The site stops sending email.", warn: "People who ask for a password reset will not get an email while this is stopped." },
  "kill.tracking": { title: "Usage counting", stops: "The site stops counting how it is used.", warn: "Counts will have a gap for the time this is stopped. Nothing else changes." },
  "kill.public_writes": { title: "Everything the public can save", stops: "Every public form and action that saves something stops.", warn: "This is the big switch for a database emergency. Check-ins, forms and reports from the public all stop working." },
};

export const killCopy = (key: string): KillCopy => KILL_COPY[key] ?? { title: key.replace(/^kill\./, "").replace(/_/g, " "), stops: "Part of the site stops.", warn: "People will see that this is temporarily unavailable." };

export const TARGET_LABEL: Record<string, string> = {
  directory: "Directory listing", directory_entry: "Directory listing", team: "Team page", team_profile: "Team page", live: "Live page", live_page: "Live page", league: "League page", league_page: "League page",
  registration: "Registration form", registration_form: "Registration form", pass: "ID pass", results: "Results page", event: "Event", org: "Organisation", user: "Account",
};
export const targetLabel = (t: string) => TARGET_LABEL[t] ?? "Public page";

export const PRIORITY_LABEL = (p: number) => (p >= 3 ? "Urgent" : p === 2 ? "High" : "Normal");

/** "report.decided" -> "Report decided". */
export const actionLabel = (a: string) => { const s = a.replace(/[._]/g, " ").trim(); return s ? s[0].toUpperCase() + s.slice(1) : "Action"; };

export function ago(iso: string, now = Date.now()): string {
  const t = Date.parse(iso); if (!Number.isFinite(t)) return "";
  const m = Math.max(0, Math.round((now - t) / 60000));
  if (m < 1) return "just now"; if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60); if (h < 48) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24); return `${d} days ago`;
}

export const fmtBytes = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(2)} GB` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`);
