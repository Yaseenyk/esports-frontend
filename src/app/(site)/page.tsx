import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/seo/Faq";
import GameBadge from "@/components/GameBadge";
import HeroArtLazy from "@/components/home/HeroArtLazy";
import { Counter, Item, Marquee, Reveal, Stagger } from "@/components/Motion";
import JsonLd from "@/components/seo/JsonLd";
import TiltLink from "@/components/TiltLink";
import { GUIDES } from "@/content/guides";
import { HOME_FAQ } from "@/content/home-faq";
import { GAMES, TOOLS } from "@/lib/data";
import { CARD_DESIGNS, CARD_SHAPES, LANGUAGES_COUNT } from "@/lib/facts";

export const metadata: Metadata = {
  title: { absolute: "Esports Hub: free tools and guides for esports event organisers" },
  description: "Free ID card maker, bracket maker, points table calculator and gate check-in scanner, plus practical guides for running college and community esports events in India.",
  alternates: { canonical: "/" },
};

const FAQ = HOME_FAQ;

// Small line icons for the tool cards. Decorative: the words next to them carry the meaning.
const ICON: Record<string, string> = {
  "id-cards": "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM8 11a2 2 0 100-4 2 2 0 000 4zM5.5 16c.5-1.7 1.5-2.5 2.5-2.5s2 .8 2.5 2.5M14 9h4M14 13h3",
  brackets: "M4 5h5v4H4zM4 15h5v4H4zM15 10h5v4h-5zM9 7h3v10H9M12 12h3",
  "double-elimination": "M3 4h5v3H3zM3 10h5v3H3zM10 7h4v3h-4zM10 13h4v3h-4zM16 10h5v4h-5zM8 5.5h2M8 11.5h2M14 8.5h2M14 14.5h2",
  "points-table": "M4 20V10M10 20V4M16 20v-7M22 20H2",
  registration: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5",
  "round-robin": "M12 4a8 8 0 018 8M20 12l-2.5-2.5M12 20a8 8 0 01-8-8M4 12l2.5 2.5M12 8v4l3 2",
  schedule: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h3M13 14h3M8 17h3",
  certificates: "M5 4h14v12H5zM9 20l3-3 3 3V16M8 8h8M8 12h5",
  "check-in": "M4 7V5h3M17 5h3v2M20 17v2h-3M7 19H4v-2M8 12l3 3 5-6",
};
const STEP_ICON = ["M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z", "M4 6h16M4 12h16M4 18h10", "M4 7V5h3M17 5h3v2M20 17v2h-3M7 19H4v-2M8 12l3 3 5-6", "M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0z"];

function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}

export default function Home() {
  const latest = GUIDES.slice(0, 6);
  const badges = GAMES.filter((g) => ["bgmi", "free-fire-max", "valorant", "cs2", "cod-mobile", "mobile-legends", "minecraft", "roblox", "fortnite", "clash-royale", "ea-fc", "gta-v"].includes(g.slug));
  return (
    <div className="space-y-20">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />

      <section className="relative grid items-center gap-12 pt-4 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0a0b0d] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" /> For organisers of esports and gaming events
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.08] text-white sm:text-6xl">Free tools and guides for running <span className="text-sheen">esports events</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-200">Make player ID cards with QR passes, build a tournament bracket, work out a battle royale points table and check guests in at the gate. Then read the plain, practical guides that explain how to run the whole event, from the first idea to the results.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tools/id-cards/" className="btn">Make ID cards</Link>
            <Link href="/guides/run-a-campus-tournament/" className="btn-ghost">How to run a college tournament</Link>
          </div>
          <p className="mt-4 text-sm text-zinc-400">Free. Works in your browser. No account needed to use the tools.</p>
          <dl className="mt-10 grid max-w-lg grid-cols-4 gap-4">
            {([["Free tools", TOOLS.length], ["Guides", GUIDES.length], ["Card designs", CARD_DESIGNS], ["Languages", LANGUAGES_COUNT]] as const).map(([k, v]) => (
              <div key={k}><dd className="font-display text-3xl font-bold text-white"><Counter to={v} /></dd><dt className="text-xs text-zinc-400">{k}</dt></div>
            ))}
          </dl>
        </div>
        <HeroArtLazy />
      </section>

      <Reveal>
        <div aria-hidden="true">
          <Marquee>
            <div className="marquee-fade flex gap-4">
              {GAMES.map((g) => (
                <span key={g.slug} className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0b0d] py-2 pe-5 ps-2"><GameBadge game={g} size="sm" /><span className="font-display font-semibold text-zinc-200">{g.name}</span></span>
              ))}
            </div>
          </Marquee>
        </div>
      </Reveal>

      <section aria-labelledby="tools">
        <Reveal className="mb-6 flex items-end justify-between gap-3"><h2 id="tools" className="text-3xl font-bold text-white">Free tools</h2><Link href="/tools/" className="text-sm font-medium text-cyan hover:underline">All tools</Link></Reveal>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <Item key={t.slug} className="h-full">
              <TiltLink href={t.href} className="h-full">
                <span className="tool-icon grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan/20 to-purple/20 text-cyan ring-1 ring-white/10"><Icon d={ICON[t.slug] ?? ICON["id-cards"]!} /></span>
                <h3 className="mt-3 font-display text-lg font-bold text-white">{t.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{t.blurb}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-cyan">Open →</span>
              </TiltLink>
            </Item>
          ))}
        </Stagger>
      </section>

      <section aria-labelledby="how">
        <Reveal><h2 id="how" className="text-3xl font-bold text-white">How an event comes together</h2></Reveal>
        <Stagger className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Plan", "Choose the game and the format, write the rules, and set the schedule.", "/guides/run-a-campus-tournament/"],
            ["Register", "Collect teams and players, and make a card for each person.", "/tools/registration/"],
            ["Run the day", "Check guests in at the gate and keep the points table or bracket up to date.", "/guides/event-gate-checkin/"],
            ["Finish", "Publish results, thank sponsors and keep the roster for next time.", "/guides/sponsor-pitch/"],
          ].map(([t, d, href], i) => (
            <Item key={t} className="h-full"><div className="card h-full"><span className="grid h-10 w-10 place-items-center rounded-full bg-cyan text-ink"><Icon d={STEP_ICON[i]!} /></span><h3 className="mt-3 font-display font-bold text-white">{i + 1}. {t}</h3><p className="mt-1 text-sm text-zinc-300">{d}</p><Link href={href as string} className="mt-2 inline-block text-sm text-cyan hover:underline">Read more</Link></div></Item>
          ))}
        </Stagger>
      </section>

      <Reveal>
        <section aria-labelledby="games" className="relative overflow-hidden rounded-3xl border border-white/[0.14] bg-[#0a0b0d] p-6 sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <h2 id="games" className="text-3xl font-bold text-white">Made for any game</h2>
              <p className="mt-3 leading-relaxed text-zinc-300">ID cards, brackets, points tables and the gate scanner do not depend on the game. Use them for mobile battle royales, PC shooters, sandbox worlds or party games: you set the team size, the roles and the rules.</p>
              <div className="mt-5 flex flex-wrap gap-3"><Link href="/guides/choosing-a-tournament-format/" className="btn-ghost">Choosing a format</Link><Link href="/guides/points-table/" className="btn-ghost">Points tables</Link></div>
            </div>
            <div aria-hidden="true" className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {badges.map((g, i) => (<div key={g.slug} className="animate-float justify-self-center" style={{ animationDelay: `${(i % 6) * -0.9}s` }}><GameBadge game={g} size="lg" /></div>))}
            </div>
          </div>
        </section>
      </Reveal>

      <section aria-labelledby="guides">
        <Reveal className="mb-6 flex items-end justify-between gap-3"><h2 id="guides" className="text-3xl font-bold text-white">Guides</h2><Link href="/guides/" className="text-sm font-medium text-cyan hover:underline">All guides</Link></Reveal>
        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((g) => (
            <Item key={g.slug} className="h-full">
              <TiltLink href={`/guides/${g.slug}/`} className="h-full">
                <div className="flex items-center justify-between"><span className="tag">{g.tag}</span><span className="text-xs text-zinc-400">{g.minutes} min read</span></div>
                <h3 className="mt-3 font-display font-bold text-white">{g.title}</h3>
                <p className="mt-1 text-sm text-zinc-300">{g.description}</p>
              </TiltLink>
            </Item>
          ))}
        </Stagger>
      </section>

      <section aria-labelledby="faq" className="grid gap-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Good to know</p>
            <h2 id="faq" className="mt-2 text-3xl font-bold text-white">Questions</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300">What the tools do, what they cost, and what happens to your players&apos; details. Not here? Ask us.</p>
            <Link href="/contact/" className="mt-4 inline-flex items-center gap-2 text-sm text-cyan hover:text-white">Contact us <span aria-hidden="true">→</span></Link>
          </Reveal>
        </div>
        <Faq items={FAQ} className="max-w-3xl" />
      </section>
    </div>
  );
}
