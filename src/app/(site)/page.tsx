import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { GUIDES } from "@/content/guides";
import { TOOLS } from "@/lib/data";

export const metadata: Metadata = {
  title: { absolute: "Esports Hub: free tools and guides for esports event organisers" },
  description: "Free ID card maker, bracket maker, points table calculator and gate check-in scanner, plus practical guides for running college and community esports events in India.",
  alternates: { canonical: "/" },
};

const FAQ = [
  { q: "What is Esports Hub?", a: "Esports Hub is a set of free tools and written guides for people who organise esports and gaming events: college tournaments, club cups and community game nights." },
  { q: "Is it free?", a: "Yes. The ID card maker, bracket maker, points table calculator and gate scanner are free and work in your browser without an account. A free account adds saving events online, invite links for players and live check-in across several doors." },
  { q: "Do I need to install anything?", a: "No. Everything runs in a web browser on a phone or computer. You can add the gate scanner to your phone's home screen." },
  { q: "What happens to players' personal details?", a: "Cards are made in your browser. Scanning an Aadhaar card happens on your own device and only the last four digits are kept. If you save an event online, only names, teams, roles, access zones, photos and logos are stored; birth dates and Aadhaar digits stay in your browser." },
  { q: "Who makes it?", a: "Esports Hub is an independent project and is not affiliated with any game publisher. See the about page for how the guides are written and kept up to date." },
];

export default function Home() {
  const latest = GUIDES.slice(0, 6);
  return (
    <div className="space-y-16">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />

      <section className="max-w-3xl pt-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan">For organisers of esports and gaming events</p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.1] text-white sm:text-6xl">Free tools and guides for running esports events</h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-200">Make player ID cards with QR passes, build a tournament bracket, work out a battle royale points table and check guests in at the gate. Then read the plain, practical guides that explain how to run the whole event, from the first idea to the results.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/tools/id-cards/" className="btn">Make ID cards</Link>
          <Link href="/guides/run-a-campus-tournament/" className="btn-ghost">How to run a college tournament</Link>
        </div>
        <p className="mt-4 text-sm text-zinc-400">Free. Works in your browser. No account needed to use the tools.</p>
      </section>

      <section aria-labelledby="tools">
        <div className="mb-6 flex items-end justify-between gap-3"><h2 id="tools" className="text-3xl font-bold text-white">Free tools</h2><Link href="/tools/" className="text-sm font-medium text-cyan hover:underline">All tools</Link></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((t) => (
            <Link key={t.slug} href={t.href} className="card block h-full outline-none focus-visible:ring-2 focus-visible:ring-cyan">
              <h3 className="font-display text-lg font-bold text-white">{t.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{t.blurb}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-cyan">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="how">
        <h2 id="how" className="text-3xl font-bold text-white">How an event comes together</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Plan", "Choose the game and the format, write the rules, and set the schedule.", "/guides/run-a-campus-tournament/"],
            ["Register", "Collect teams and players, and make a card for each person.", "/tools/id-cards/"],
            ["Run the day", "Check guests in at the gate and keep the points table or bracket up to date.", "/guides/event-gate-checkin/"],
            ["Finish", "Publish results, thank sponsors and keep the roster for next time.", "/guides/sponsor-pitch/"],
          ].map(([t, d, href], i) => (
            <li key={t} className="card"><span className="grid h-8 w-8 place-items-center rounded-full bg-cyan text-sm font-bold text-ink">{i + 1}</span><h3 className="mt-3 font-display font-bold text-white">{t}</h3><p className="mt-1 text-sm text-zinc-300">{d}</p><Link href={href as string} className="mt-2 inline-block text-sm text-cyan hover:underline">Read more</Link></li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="guides">
        <div className="mb-6 flex items-end justify-between gap-3"><h2 id="guides" className="text-3xl font-bold text-white">Guides</h2><Link href="/guides/" className="text-sm font-medium text-cyan hover:underline">All guides</Link></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}/`} className="card block h-full outline-none focus-visible:ring-2 focus-visible:ring-cyan">
              <div className="flex items-center justify-between"><span className="tag">{g.tag}</span><span className="text-xs text-zinc-400">{g.minutes} min read</span></div>
              <h3 className="mt-3 font-display font-bold text-white">{g.title}</h3>
              <p className="mt-1 text-sm text-zinc-300">{g.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq" className="max-w-3xl">
        <h2 id="faq" className="text-3xl font-bold text-white">Questions</h2>
        <div className="mt-6 space-y-3">{FAQ.map((f) => <details key={f.q} className="card !p-4"><summary className="cursor-pointer font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan">{f.q}</summary><p className="mt-2 text-sm leading-relaxed text-zinc-300">{f.a}</p></details>)}</div>
      </section>
    </div>
  );
}
