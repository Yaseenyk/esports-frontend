import Link from "next/link";
import GameBadge from "@/components/GameBadge";
import { Counter, Item, Marquee, Reveal, Stagger } from "@/components/Motion";
import SearchBox from "@/components/SearchBox";
import { COMMUNITIES, EVENTS, GAMES, POSTS, TOOLS, gameBySlug } from "@/lib/data";

const AUDIENCES = [
  { t: "Players", d: "Find a game, a team and an event you can enter.", href: "/events/", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" },
  { t: "Organisers", d: "Registration, ID cards, schedule and points table in one flow.", href: "/tools/", icon: "M4 6h16M4 12h16M4 18h10" },
  { t: "Communities", d: "One profile for every game your club or organisation plays.", href: "/communities/", icon: "M3 20v-2a5 5 0 015-5h2M17 11a3 3 0 100-6 3 3 0 000 6zM21 20v-1a4 4 0 00-3-3.9M9 9a3 3 0 100-6 3 3 0 000 6z" },
  { t: "Streamers", d: "List your events, share your run-sheet and find casters.", href: "/guides/", icon: "M4 6h12a2 2 0 012 2v8a2 2 0 01-2 2H4zM18 10l4-2v8l-4-2" },
];

function Icon({ d }: { d: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}

export default function Home() {
  const hero = GAMES.filter((g) => ["bgmi", "cod-mobile", "fortnite", "clash-royale"].includes(g.slug));
  return (
    <div className="space-y-24">
      <section className="relative grid items-center gap-12 pt-4 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" /> All games · one hub
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            Run every game, every event, <span className="text-sheen">one hub</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            Gaming communities play several games, from BGMI and Valorant to Minecraft and Roblox, and run several events. Search them all, manage teams together and print the passes on the day.
          </p>
          <div className="mt-8 max-w-xl"><SearchBox large /></div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/tools/id-cards/" className="btn">Make ID cards</Link>
            <Link href="/events/" className="btn-ghost">Browse events</Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-4 gap-4">
            {[["Games", GAMES.length], ["Events", EVENTS.length], ["Communities", COMMUNITIES.length], ["Tools", TOOLS.length]].map(([k, v]) => (
              <div key={k as string}><dd className="font-display text-3xl font-bold text-white"><Counter to={v as number} /></dd><dt className="text-xs text-zinc-500">{k}</dt></div>
            ))}
          </dl>
          <p className="mt-2 text-[11px] text-zinc-600">Counts of sample entries in this prototype.</p>
        </div>
        <div className="relative mx-auto hidden h-[26rem] w-full max-w-md lg:block" aria-hidden="true">
          <div className="absolute inset-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent" />
          {hero.map((g, i) => (
            <div key={g.slug} className="absolute animate-float" style={{ top: ["4%", "16%", "52%", "62%"][i], left: ["8%", "52%", "2%", "46%"][i], animationDelay: `${i * -1.4}s` }}>
              <div className="rounded-3xl border border-white/10 bg-ink/80 p-3 shadow-2xl shadow-black/60 backdrop-blur"><GameBadge game={g} size="xl" /><p className="mt-2 text-center font-display text-sm font-semibold text-zinc-200">{g.short}</p></div>
            </div>
          ))}
        </div>
      </section>

      <Reveal>
        <Marquee>
          {GAMES.map((g) => (
            <Link key={g.slug} href={`/games/${g.slug}/`} className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] py-2 pe-5 ps-2 transition-colors hover:border-cyan/50">
              <GameBadge game={g} size="sm" /><span className="font-display font-semibold text-zinc-200">{g.name}</span>
            </Link>
          ))}
        </Marquee>
      </Reveal>

      <section aria-labelledby="who">
        <h2 id="who" className="sr-only">Who it is for</h2>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a) => (
            <Item key={a.t}>
              <Link href={a.href} className="card group block h-full">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan/20 to-purple/20 text-cyan ring-1 ring-white/10"><Icon d={a.icon} /></span>
                <h3 className="mt-4 text-lg font-semibold text-white">{a.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{a.d}</p>
              </Link>
            </Item>
          ))}
        </Stagger>
      </section>

      <section aria-labelledby="games">
        <Reveal className="mb-6 flex items-end justify-between"><h2 id="games" className="text-3xl font-bold text-white">Browse by game</h2><Link href="/games/" className="text-sm font-medium text-cyan hover:underline">All games →</Link></Reveal>
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" step={0.04}>
          {GAMES.slice(0, 15).map((g) => (
            <Item key={g.slug}>
              <Link href={`/games/${g.slug}/`} className="card flex items-center gap-3 !p-3">
                <GameBadge game={g} />
                <span className="min-w-0"><span className="block truncate font-display font-semibold text-white">{g.short}</span><span className="block truncate text-xs text-zinc-500">{g.platform}</span></span>
              </Link>
            </Item>
          ))}
        </Stagger>
      </section>

      <section aria-labelledby="events">
        <Reveal className="mb-6 flex items-end justify-between"><h2 id="events" className="text-3xl font-bold text-white">Upcoming events</h2><Link href="/events/" className="text-sm font-medium text-cyan hover:underline">All events →</Link></Reveal>
        <Stagger className="grid gap-4 md:grid-cols-3">
          {EVENTS.slice(0, 3).map((e) => {
            const g = gameBySlug(e.game)!;
            return (
              <Item key={e.slug}>
                <Link href={`/events/${e.slug}/`} className="card block h-full">
                  <div className="flex items-center gap-3"><GameBadge game={g} size="sm" /><div className="flex gap-2"><span className="tag">{e.mode}</span><span className="tag">{e.level}</span></div></div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{e.name}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{e.format}</p>
                  <p className="mt-4 text-xs text-zinc-500">{e.organiser}</p>
                </Link>
              </Item>
            );
          })}
        </Stagger>
      </section>

      <Reveal>
        <section aria-labelledby="tools" className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan/10 via-white/[0.02] to-purple/10 p-6 sm:p-10">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">Organiser tools</p>
              <h2 id="tools" className="mt-2 text-3xl font-bold text-white sm:text-4xl">Print player ID cards in a minute</h2>
              <p className="mt-3 leading-relaxed text-zinc-400">Add players, pick roles and print credit-card-size cards on A4. It runs in your browser, so photos never leave your device.</p>
              <div className="mt-6 flex flex-wrap gap-3"><Link href="/tools/id-cards/" className="btn">Make ID cards</Link><Link href="/tools/" className="btn-ghost">All {TOOLS.length} tools</Link></div>
            </div>
            <ul className="grid grid-cols-2 gap-2 text-sm text-zinc-300">
              {TOOLS.map((t) => (<li key={t.slug} className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink/40 px-3 py-2.5"><span className={`h-2 w-2 rounded-full ${t.href ? "bg-cyan" : "bg-zinc-600"}`} />{t.name}</li>))}
            </ul>
          </div>
        </section>
      </Reveal>

      <section aria-labelledby="comm" className="grid gap-10 lg:grid-cols-2">
        <div>
          <Reveal className="mb-6 flex items-end justify-between"><h2 id="comm" className="text-3xl font-bold text-white">Communities</h2><Link href="/communities/" className="text-sm font-medium text-cyan hover:underline">See all →</Link></Reveal>
          <Stagger className="space-y-3">
            {COMMUNITIES.slice(0, 3).map((c) => (
              <Item key={c.slug}>
                <Link href={`/communities/${c.slug}/`} className="card block !p-4">
                  <div className="flex items-center justify-between gap-2"><h3 className="font-semibold text-white">{c.name}</h3><span className="tag">{c.kind}</span></div>
                  <div className="mt-3 flex -space-x-2">{c.games.map((s) => <GameBadge key={s} game={gameBySlug(s)!} size="sm" />)}</div>
                </Link>
              </Item>
            ))}
          </Stagger>
        </div>
        <div>
          <Reveal className="mb-6 flex items-end justify-between"><h2 className="text-3xl font-bold text-white">Guides</h2><Link href="/guides/" className="text-sm font-medium text-cyan hover:underline">All guides →</Link></Reveal>
          <Stagger className="space-y-3">
            {POSTS.slice(0, 3).map((p) => (
              <Item key={p.slug}>
                <Link href="/guides/" className="card block !p-4"><span className="tag">{p.tag}</span><h3 className="mt-2 font-semibold text-white">{p.title}</h3><p className="mt-1 text-xs text-zinc-500">{p.minutes} min read</p></Link>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>
    </div>
  );
}
