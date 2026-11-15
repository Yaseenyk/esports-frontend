import type { Metadata } from "next";
import Link from "next/link";
import { Item, Stagger } from "@/components/Motion";
import TiltLink from "@/components/TiltLink";
import JsonLd from "@/components/seo/JsonLd";
import { TOOLS } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free tournament tools: bracket, points table, ID card",
  description: "Free tools for running esports and gaming events: ID card maker, tournament bracket maker, battle royale points table calculator and a QR gate check-in scanner.",
  alternates: { canonical: "/tools/" },
};

/** Each tool, said as the job a person has in mind. Order follows a first event: people, teams, matches, the day, afterwards. */
const TASKS: { slug: string; task: string; line: string; button: string }[] = [
  { slug: "plan", task: "plan a whole tournament", line: "Say how many teams, rooms and hours you have. Get the format, the timed schedule, draft rules and a sign-up form in one pack.", button: "Plan my tournament" },
  { slug: "id-cards", task: "make ID cards", line: "Free, no sign-up, built for tournaments: print a card with a photo and a QR code for every player and volunteer.", button: "Make ID cards" },
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
      <section className="max-w-3xl space-y-3 text-zinc-300">
        <h2 className="font-display text-2xl font-bold text-white">How the tools fit together in a first event</h2>
        <p>Most small events follow the same order. First decide the shape: how many teams, how many rooms, how many hours. The planner turns those three numbers into a format and a timed day. Next collect the teams with a registration form, so that every team name, captain and player list is in one place before match day.</p>
        <p>Once teams are in, pick the match format. A knockout bracket is quickest but sends half the teams home after one match. Double elimination gives every team a second life. A round robin lets every team play every other team and suits small groups. For battle royale games such as BGMI and Free Fire there are no head-to-head matches, so the points table adds placement points and kill points across several matches and ranks the teams. Each tool page explains its own rules and limits, and each has a guide with a worked example that you can check by hand.</p>
        <p>On the day, ID cards and QR passes let the gate check people in, the display screen puts the schedule and standings on a TV, and afterwards certificates and the poster tool cover the paperwork. The tools run in your browser and keep what you type on your device, which is why the privacy policy can say that names and photos from the card maker are not sent to our servers.</p>
      </section>
      <p className="text-sm text-zinc-400">An account is optional. It adds saving events online, invite links for players and live check-in across several doors. Looking for one game? See the <Link href="/points-table/bgmi/" className="text-cyan underline">BGMI points table</Link> and the <Link href="/points-table/free-fire/" className="text-cyan underline">Free Fire points table</Link>, or <Link href="/compare/free-tournament-software-india/" className="text-cyan underline">how free tournament software for India compares</Link>. New to running an event? Start with the <Link href="/guides/run-a-campus-tournament/" className="text-cyan underline">college tournament guide</Link>. Making ID cards for a tournament? See the <Link href="/id-card-maker/esports/" className="text-cyan underline">esports ID card maker</Link> and the <Link href="/guides/best-free-esports-id-card-makers/" className="text-cyan underline">free esports ID card makers compared</Link>.</p>
    </div>
  );
}
