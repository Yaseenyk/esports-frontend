import type { Person, Role, Team } from "./types";

/**
 * Roster helpers: read a pasted or uploaded sheet (CSV, or text copied from Excel), write one back out, and check people for problems
 * (minors, duplicates, missing details). Nothing here talks to a server.
 *
 * Privacy: if a sheet contains a full 12-digit Aadhaar number it is cut down to the last 4 digits on the way in, so the full number is never kept.
 */
export interface RosterRow { name: string; team: string; role?: Role; dob?: string; gender?: string; id?: string; zones?: string; last4?: string }

const ROLE_ALIASES: Record<string, Role> = {
  player: "Player", sub: "Substitute", substitute: "Substitute", reserve: "Substitute", coach: "Coach", manager: "Manager", captain: "Player", staff: "Staff",
  guest: "Guest", caster: "Caster", commentator: "Caster", media: "Media", press: "Media", vip: "VIP", organiser: "Organiser", organizer: "Organiser", volunteer: "Volunteer",
};
const COLS: Record<string, keyof RosterRow> = {
  name: "name", "full name": "name", player: "name", "player name": "name", team: "team", "team name": "team", squad: "team", role: "role", position: "role",
  dob: "dob", "date of birth": "dob", birthday: "dob", birth: "dob", gender: "gender", sex: "gender", id: "id", "id number": "id", zones: "zones", zone: "zones", access: "zones",
  aadhaar: "last4", "aadhaar number": "last4", "aadhar": "last4", uid: "last4", last4: "last4", "last 4": "last4",
};

/** Splits one line of CSV, handling quotes. Tabs (pasted from Excel) work too. */
function splitLine(line: string, sep: string): string[] {
  const out: string[] = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === sep) { out.push(cur.trim()); cur = ""; }
    else cur += c;
  }
  out.push(cur.trim());
  return out;
}

export function normaliseDob(v: string): string | undefined {
  const s = v.trim();
  let m = s.match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})$/);
  if (m) return `${m[1].padStart(2, "0")}/${m[2].padStart(2, "0")}/${m[3]}`;
  m = s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (m) return `${m[3].padStart(2, "0")}/${m[2].padStart(2, "0")}/${m[1]}`;
  return /^\d{4}$/.test(s) ? `Year ${s}` : undefined;
}

export function parseRoster(text: string): { rows: RosterRow[]; skipped: number; trimmedAadhaar: number } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { rows: [], skipped: 0, trimmedAadhaar: 0 };
  const sep = lines[0].includes("\t") ? "\t" : lines[0].split(";").length > lines[0].split(",").length ? ";" : ",";
  const first = splitLine(lines[0], sep);
  const mapped = first.map((h) => COLS[h.toLowerCase().replace(/[_.]/g, " ").trim()]);
  const hasHeader = mapped.filter(Boolean).length >= 2 && mapped.includes("name");
  // Without a header we assume the plain order: name, team, role, dob, gender.
  const cols: (keyof RosterRow | undefined)[] = hasHeader ? mapped : ["name", "team", "role", "dob", "gender", "id", "zones"];
  const rows: RosterRow[] = []; let skipped = 0, trimmedAadhaar = 0;
  for (const line of lines.slice(hasHeader ? 1 : 0)) {
    const cells = splitLine(line, sep), r: Partial<RosterRow> = {};
    cols.forEach((k, i) => {
      const v = (cells[i] ?? "").trim();
      if (!k || !v) return;
      if (k === "role") r.role = ROLE_ALIASES[v.toLowerCase()] ?? "Player";
      else if (k === "dob") r.dob = normaliseDob(v);
      else if (k === "last4") {
        const digits = v.replace(/\D/g, "");
        if (digits.length >= 4) { r.last4 = digits.slice(-4); if (digits.length >= 8) trimmedAadhaar++; }
      } else (r as Record<string, string>)[k] = v;
    });
    if (!r.name) { skipped++; continue; }
    rows.push({ name: r.name, team: r.team ?? "", ...r });
  }
  return { rows, skipped, trimmedAadhaar };
}

/** A cell starting with = + - or @ runs as a formula when the file is opened in Excel, so a name like "=HYPERLINK(...)" gets a leading apostrophe. Plain numbers are left alone. */
export const safeCell = (v: string): string => (/^[=+\-@\t\r]/.test(v) && !/^[-+]?[\d.]+$/.test(v) ? `'${v}` : v);
const q = (raw: string) => { const v = safeCell(raw); return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };

export function toCsv(people: Person[], teams: Team[], minorOf: (p: Person) => boolean): string {
  const head = ["id", "name", "team", "role", "dob", "gender", "zones", "aadhaar_last4", "photo", "minor", "guardian_consent"];
  const rows = people.map((p) => [p.id, p.name, teams.find((t) => t.id === p.teamId)?.name ?? "", p.role, p.dob ?? "", p.gender ?? "", p.zones ?? "", p.last4 ?? "", p.photo ? "yes" : "no", minorOf(p) ? "yes" : "no", p.guardian ? "yes" : "no"]);
  return [head, ...rows].map((r) => r.map(q).join(",")).join("\r\n") + "\r\n";
}
export const csvTemplate = () => "name,team,role,dob,gender,zones\r\nAarav Mehta,Konkan Kings,Player,12/05/2003,Male,Main hall\r\nKabir Sheikh,Konkan Kings,Coach,30/07/1995,Male,Main hall; Backstage\r\n";

/** Age in whole years on a given date. A date given only as a year counts the person as turning that age at the end of the year, so unsure cases are not hidden. */
export function ageOn(dob: string | undefined, on: Date): number | null {
  if (!dob) return null;
  const y = dob.match(/^Year (\d{4})$/);
  if (y) return on.getFullYear() - Number(y[1]) - 1;
  const m = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = Number(m[1]), mo = Number(m[2]), yr = Number(m[3]);
  let age = on.getFullYear() - yr;
  if (on.getMonth() + 1 < mo || (on.getMonth() + 1 === mo && on.getDate() < d)) age--;
  return age;
}
export const isMinor = (dob: string | undefined, on: Date) => { const a = ageOn(dob, on); return a !== null && a < 18; };

/** People who look like the same person: the same last 4 digits and birth date, or the same name and birth date. */
export function findDuplicates(people: Person[]): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const add = (a: Person, b: Person) => { out.set(a.id, [...(out.get(a.id) ?? []), b.id]); };
  for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) {
    const a = people[i], b = people[j];
    const sameDob = !!a.dob && a.dob === b.dob;
    const sameName = a.name.trim().toLowerCase() === b.name.trim().toLowerCase() && !!a.name.trim();
    const sameCard = !!a.last4 && a.last4 === b.last4 && sameDob;
    if (sameCard || (sameName && sameDob)) { add(a, b); add(b, a); }
  }
  return out;
}
