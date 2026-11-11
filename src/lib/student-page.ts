import type { ToolPage } from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "./tool-pages";

/**
 * A landing page for people searching for a student ID card maker. It is the same working ID card maker with a student and college club framing.
 * It says plainly what the cards are for: clubs, fests and events, never official school or government ID.
 */
export const STUDENT_PATH = "/id-card-maker/student/";
const base = TOOL_PAGES["id-cards"]!;

export const STUDENT_PAGE: ToolPage & { title: string; description: string; path: string } = {
  slug: "student-id-card-maker", path: STUDENT_PATH, name: "Student ID card maker", shortName: "student ID card maker", updated: "2026-11-12",
  crumb: { name: "ID card maker", href: "/tools/id-cards/" },
  title: "Student ID card maker online, free, print on A4",
  description: "Free student and college club ID card maker: add names and photos, pick a design, add a QR code and print at real size on A4. No sign-up, runs in your browser.",
  h1: "Student ID card maker online: free, with photo and QR code",
  lead: "This makes ID cards for clubs, fests and events. It does not issue official school or government ID. Add the students or members, pick a design, add a photo and a signed QR code if you want one, and print at real size on A4 or download pictures. It runs in your browser and needs no account.",
  useHeading: "Make your student ID cards",
  benefits: base.benefits,
  steps: base.steps,
  guides: ["student-id-card-format", "print-pvc-id-cards", "player-id-cards", "event-gate-checkin", "run-a-campus-tournament", "employee-id-card-format"],
  related: [
    { href: "/tools/id-cards/", label: "ID card maker for events and teams", blurb: "The same maker, framed for tournaments, teams and event staff." },
    { href: "/tools/check-in/", label: "Gate check-in scanner", blurb: "Scan the signed QR on a printed card at the door." },
  ],
  faq: [
    ...base.faq,
    { q: "Can I print ID cards for students at a PVC card shop?", a: "Yes, for cards your club or fest issues. Download the print-ready PDF, which is at real size with crop marks, optional 3 mm bleed and mirrored backs, or the PNG pictures, one for each card, and take the file to a local shop that prints on PVC cards. Ask what file they need, ask for one proof card before they print the full set, and go at least a week ahead of the event. Prices and turnaround differ from shop to shop, so ask for a quote. The guide on printing ID cards on PVC or paper has the checklist." },
  ],
};
