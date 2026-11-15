/** The demo event the public tool opens with. Invented names, dates and card numbers, so a visitor can try every step. */
import { DEFAULT_INFO, type EventInfo, type Person, type Team } from "./types";

export const SAMPLE_EVENT = "Monsoon Clash Season 2";
export const SAMPLE_ORGANISER = "Konkan Gamers Guild";
export const SAMPLE_PHONE = "+91 00000 00000";

export const SAMPLE_TEAMS: Team[] = [{ id: "t1", name: "Konkan Kings" }, { id: "t2", name: "Deadly Duos" }, { id: "t3", name: "Pune Phantoms" }];
/** Demo roster: invented names, dates and card numbers. */
export const SAMPLE_PEOPLE: Person[] = [
  { id: "KON-001", name: "Aarav Mehta", teamId: "t1", role: "Player", dob: "12/05/2003", gender: "Male", last4: "4471", photo: "/samples/people/aarav-mehta.webp", cutout: true },
  { id: "KON-002", name: "Diya Kulkarni", teamId: "t1", role: "Player", dob: "23/09/2004", gender: "Female", last4: "8802", photo: "/samples/people/diya-kulkarni.webp", cutout: true },
  { id: "KON-003", name: "Rohan Deshmukh", teamId: "t1", role: "Player", dob: "02/11/2002", gender: "Male", last4: "1936", photo: "/samples/people/rohan-deshmukh.webp", cutout: true },
  { id: "KON-004", name: "Sneha Iyer", teamId: "t1", role: "Substitute", dob: "14/01/2005", gender: "Female", last4: "5520", photo: "/samples/people/sneha-iyer.webp", cutout: true },
  { id: "KON-005", name: "Kabir Sheikh", teamId: "t1", role: "Coach", dob: "30/07/1995", gender: "Male", last4: "7714", photo: "/samples/people/kabir-sheikh.webp", cutout: true },
  { id: "DEA-001", name: "Vihaan Patil", teamId: "t2", role: "Player", dob: "08/03/2003", gender: "Male", last4: "3068", photo: "/samples/people/vihaan-patil.webp", cutout: true },
  { id: "DEA-002", name: "Ananya Nair", teamId: "t2", role: "Player", dob: "19/12/2003", gender: "Female", last4: "9245", photo: "/samples/people/ananya-nair.webp", cutout: true },
  { id: "DEA-003", name: "Ishita Joshi", teamId: "t2", role: "Substitute", dob: "27/06/2004", gender: "Female", last4: "6183", photo: "/samples/people/ishita-joshi.webp", cutout: true },
  { id: "DEA-004", name: "Arjun Reddy", teamId: "t2", role: "Manager", dob: "11/10/1992", gender: "Male", last4: "2857", photo: "/samples/people/arjun-reddy.webp", cutout: true },
  { id: "PUN-001", name: "Meera Pawar", teamId: "t3", role: "Player", dob: "05/04/2002", gender: "Female", last4: "4096", photo: "/samples/people/meera-pawar.webp", cutout: true },
  { id: "PUN-002", name: "Zoya Khan", teamId: "t3", role: "Player", dob: "21/08/2003", gender: "Female", last4: "7731", photo: "/samples/people/zoya-khan.webp", cutout: true },
  { id: "PUN-003", name: "Aditya Chavan", teamId: "t3", role: "Coach", dob: "16/02/1994", gender: "Male", last4: "1259", photo: "/samples/people/aditya-chavan.webp", cutout: true },
];

const SAMPLE_BY_ID = new Map(SAMPLE_PEOPLE.map((p) => [p.id, p]));
/** A sample person is one who still has a demo ID AND the demo name: rename them and they are yours. */
export const isSamplePerson = (p: Pick<Person, "id" | "name">): boolean => SAMPLE_BY_ID.get(p.id)?.name === p.name;
export const samplePeopleIn = (people: Person[]): Person[] => people.filter(isSamplePerson);

/** Which demo details are still in the event. Empty means the organiser has replaced everything. */
export function sampleDetails(d: { event: string; organiser: string; info: Pick<EventInfo, "emergency" | "venue" | "rules">; people: Person[] }): string[] {
  const out: string[] = [];
  if (d.event.trim() === SAMPLE_EVENT) out.push(`the event name "${SAMPLE_EVENT}"`);
  if (d.organiser.trim() === SAMPLE_ORGANISER) out.push(`the organiser "${SAMPLE_ORGANISER}"`);
  if (d.info.emergency.includes(SAMPLE_PHONE)) out.push(`the emergency phone placeholder ${SAMPLE_PHONE}`);
  const n = samplePeopleIn(d.people).length;
  if (n > 0) out.push(`${n} sample ${n === 1 ? "person" : "people"}`);
  return out;
}

/** The details a "create MY event" link starts with: nothing from the demo. */
export const BLANK_INFO: EventInfo = { ...DEFAULT_INFO, venue: "", emergency: "" };
export const BLANK_TEAMS: Team[] = [{ id: "t1", name: "Team 1" }];

export { DEFAULT_INFO };
