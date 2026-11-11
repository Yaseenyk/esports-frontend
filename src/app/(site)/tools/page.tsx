import type { Metadata } from "next";
import Link from "next/link";
import { Item, Stagger } from "@/components/Motion";
import TiltLink from "@/components/TiltLink";
import JsonLd from "@/components/seo/JsonLd";
import { TOOLS } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free tools for esports and gaming event organisers",
  description: "Free tools for running esports and gaming events: ID card maker, tournament bracket maker, battle royale points table calculator and a QR gate check-in scanner.",
  alternates: { canonical: "/tools/" },
};

/** Each tool, said as the job a person has in mind. Order follows a first event: people, teams, matches, the day, afterwards. */
const TASKS: { slug: string; task: string; line: string; button: string }[] = [
  { slug: "plan", task: "plan a whole tournament", line: "Say how many teams, rooms and hours you have. Get the format, the timed schedule, draft rules and a sign-up form in one pack.", button: "Plan my tournament" },
  { slug: "id-cards", task: "make ID cards", line: "Print a card with a photo and a QR code for every player and volunteer.", button: "Make ID cards" },
  { slug: "registration", task: "collect team sign-ups", line: "Get a ready-made registration form to copy, or an online link that gathers teams for you.", button: "Get a sign-up form" },
  { slug: "brackets", task: "draw a bracket", line: "Type your teams and get a knockout bracket. Tap the winners to move them forward.", button: "Draw a bracket" },
  { slug: "double-elimination", task: "give every team a second chance", line: "A bracket where a team is only out after losing twice.", button: "Draw a two-life bracket" },
  { slug: "round-robin", task: "make every team play every other team", line: "Get the list of fixtures and a league table that fills in as you enter scores.", button: "Make the fixtures" },
  { slug: "points-table", task: "work out standings", line: "Enter placements and kills for battle royale games and get a ranked table.", button: "Work out standings" },
  { slug: "schedule", task: "schedule matches", line: "Say when you start and how many matches there are, and get a timed plan for the day.", button: "Plan the day" },
  { slug: "display-screen", task: "show scores on a TV", line: "Put standings, the schedule or a countdown full screen on a TV, projector or live stream.", button: "Set up a screen" },
  { slug: "check-in", task: "check people in at the gate", line: "Scan QR passes on a phone. Fake and copied passes are rejected.", button: "Open the scanner" },
  { slug: "poster", task: "make a tournament poster", line: "Type the event name, date, venue and prize, add sponsor logos, and download a poster, story or square post for WhatsApp and Instagram.", button: "Make a poster" },
  { slug: "certificates", task: "print certificates", line: "Type the names and get one certificate for each, in a single PDF.", button: "Make certificates" },
];

export default function Tools() {
  const byTool = new Map(TOOLS.map((t) => [t.slug, t]));
  return (
    <div className="space-y-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: "Free tools for event organisers", itemListElement: TOOLS.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `${SITE_URL}${t.href}` })) }} />
      <header>
        <h1 className="text-3xl font-black text-zinc-50 sm:text-5xl">Free tools for event organisers</h1>
        <p className="mt-3 max-w-2xl text-lg text-zinc-300">What do you need to do? Pick the job below. Everything is free and works in your browser, with no account.</p>
      </header>
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TASKS.filter((k) => byTool.has(k.slug)).map((k) => (
          <Item key={k.slug} className="h-full"><TiltLink href={byTool.get(k.slug)!.href} className="h-full">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">I need to</p>
            <h2 className="mt-1 font-display text-xl font-bold text-white">{k.task}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{k.line}</p>
            <span className="mt-4 inline-flex min-h-11 items-center rounded-full bg-cyan px-5 text-sm font-bold text-ink">{k.button} →</span>
          </TiltLink></Item>
        ))}
      </Stagger>
      <p className="text-sm text-zinc-400">An account is optional. It adds saving events online, invite links for players and live check-in across several doors. New to running an event? Start with the <Link href="/guides/run-a-campus-tournament/" className="text-cyan underline">college tournament guide</Link>.</p>
    </div>
  );
}
