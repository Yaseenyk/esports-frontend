/** Dispute form rules (API.md section 5). Pure. The server is the authority. */
export interface RaiseForm { slug: string; type: string; summary: string; team: string; againstTeam: string; matchNo: string }
export type RaiseErrors = Partial<Record<keyof RaiseForm, string>>;

export const SUMMARY_MIN = 10, SUMMARY_MAX = 1000, NOTE_MAX = 1000;

/** A pasted tournament link (.../tournaments/<address>/) becomes just the address; anything else is only lower-cased. */
export function slugFromInput(v: string): string {
  const m = /\/tournaments\/([a-z0-9-]+)/i.exec(v);
  return (m ? m[1]! : v).toLowerCase().slice(0, 60);
}

const hasPhone = (t: string): boolean => (t.match(/[+(]?\d[\d\s().-]{5,}\d/g) ?? []).some((r) => r.replace(/\D/g, "").length >= 7) || t.replace(/\D/g, "").length >= 10;

export function validateRaise(f: RaiseForm): RaiseErrors {
  const e: RaiseErrors = {};
  if (!/^[a-z0-9-]{3,60}$/.test(f.slug.trim().toLowerCase())) e.slug = "Enter the tournament address, for example gokte-cup-2026.";
  if (!f.type) e.type = "Choose what the dispute is about.";
  const s = f.summary.trim();
  if (s.length < SUMMARY_MIN) e.summary = `Write at least ${SUMMARY_MIN} characters.`;
  else if (Array.from(s).length > SUMMARY_MAX) e.summary = `At most ${SUMMARY_MAX} characters.`;
  else if (/[<>]/.test(s)) e.summary = "Plain text only: remove the < and > characters.";
  else if (hasPhone(s)) e.summary = "Please remove phone numbers. Use the dispute comments for details.";
  if (f.matchNo !== "" && !/^\d{1,3}$/.test(f.matchNo)) e.matchNo = "A match number, for example 2.";
  return e;
}

export const raiseBody = (f: RaiseForm): Record<string, unknown> => ({
  type: f.type, summary: f.summary.trim(), ...(f.team.trim() ? { team: f.team.trim() } : {}), ...(f.againstTeam.trim() ? { againstTeam: f.againstTeam.trim() } : {}), ...(f.matchNo !== "" ? { matchNo: Number(f.matchNo) } : {}),
});

export function validateNote(note: string, min = 1): string {
  const t = note.trim();
  if (t.length < min) return min > 1 ? `Write at least ${min} characters.` : "Write something first.";
  if (Array.from(t).length > NOTE_MAX) return `At most ${NOTE_MAX} characters.`;
  if (/[<>]/.test(t)) return "Plain text only: remove the < and > characters.";
  if (hasPhone(t)) return "Please remove phone numbers.";
  return "";
}

/** The captain token is a long random string. Trim it, and refuse a pasted whole URL so the secret is not mangled. */
export function cleanToken(raw: string): { token: string; error: string } {
  const t = raw.trim();
  if (!t) return { token: "", error: "Paste the token from your captain link." };
  const fromUrl = /[?&]t=([A-Za-z0-9_-]{8,200})/.exec(t);
  const token = fromUrl ? fromUrl[1] : t;
  if (!/^[A-Za-z0-9_-]{8,200}$/.test(token)) return { token: "", error: "That does not look like a captain token. Copy the part after t= in your captain link." };
  return { token, error: "" };
}
