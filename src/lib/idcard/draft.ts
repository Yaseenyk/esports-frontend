/**
 * Keeps the people list across a page refresh, for this tab only (sessionStorage). Only the typed text fields are kept:
 * name, team, role, access zones and the card ID. Birth date, gender, Aadhaar digits and photos are never written anywhere.
 * Closing the tab removes it, so the privacy page ("people and photos are not saved" in local storage; closing the tab clears
 * what the page held) stays true.
 */
import type { Person } from "./types";
import { SAMPLE_PEOPLE, isSamplePerson } from "./samples";

export const DRAFT_KEY = "eh-idstudio-people-v1";
type Slim = Pick<Person, "id" | "name" | "teamId" | "role" | "zones">;

export const slimPeople = (people: Person[]): Slim[] => people.map((p) => ({ id: p.id, name: p.name, teamId: p.teamId, role: p.role, zones: p.zones || undefined }));

/** Parses a saved draft. Unknown shapes give null. Demo people get their demo picture back (it is a file on this site, not the visitor's data). */
export function readDraft(raw: string | null, roles: readonly string[]): Person[] | null {
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as { people?: unknown };
    if (!Array.isArray(j.people)) return null;
    const out: Person[] = [];
    for (const x of j.people as Partial<Slim>[]) {
      if (!x || typeof x.id !== "string" || typeof x.name !== "string" || typeof x.teamId !== "string") continue;
      const base: Person = { id: x.id, name: x.name, teamId: x.teamId, role: (roles.includes(x.role as string) ? x.role : "Player") as Person["role"], ...(typeof x.zones === "string" && x.zones ? { zones: x.zones } : {}) };
      out.push(isSamplePerson(base) ? { ...SAMPLE_PEOPLE.find((s) => s.id === base.id)!, ...base } : base);
    }
    return out;
  } catch { return null; }
}

/** The parts of a person a refresh would lose: an uploaded photo (data URL) and birth date, gender, Aadhaar digits typed or scanned by the user. Demo values do not count. */
export function lossy(p: Person): string {
  const demo = SAMPLE_PEOPLE.find((s) => s.id === p.id);
  const same = (k: "dob" | "gender" | "last4") => (demo ? demo[k] : undefined) === p[k];
  const photo = p.photo && p.photo.startsWith("data:") ? p.photo.length : 0;
  return [photo, same("dob") ? "" : p.dob ?? "", same("gender") ? "" : p.gender ?? "", same("last4") ? "" : p.last4 ?? ""].join("|");
}
export const hasLossy = (p: Person) => lossy(p) !== "0|||";
/** A fingerprint of everything a refresh would lose, to tell "same as the last saved file" from "changed since". Empty when there is nothing to lose. */
export const lossSignature = (people: Person[]): string => people.filter(hasLossy).map((p) => `${p.id}:${lossy(p)}`).join(";");
