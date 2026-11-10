import Link from "next/link";
import GameBadge from "@/components/GameBadge";
import SearchBox from "@/components/SearchBox";
import { COMMUNITIES, EVENTS, GAMES, POSTS, TOOLS, gameBySlug } from "@/lib/data";

const AUDIENCES = [
  { t: "Players", d: "Find a game, a team and an event you can enter.", href: "/events/" },
  { t: "Organisers", d: "Run a tournament: registration, ID cards, schedule, points table.", href: "/tools/" },
  { t: "Communities", d: "One profile for every game your club or organisation plays.", href: "/communities/" },
  { t: "Streamers", d: "List your events, share your run-sheet and find casters.", href: "/guides/" },
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan">All games · one hub</p>
        <h1 className="text-4xl font-black tracking-tight text-zinc-50 sm:text-6xl">
          Everything your esports community needs, <span className="bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">in one place</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
          Most communities play several games and run several events. Search them all, manage them together, and print the passes on the day.
        </p>
        <div className="mx-auto mt-8 max-w-xl"><SearchBox large /></div>
        <p className="mt-3 text-xs text-zinc-500">Press <kbd className="rounded border border-zinc-700 px-1.5">/</kbd> to search from anywhere</p>
      </section>

      <section aria-labelledby="who" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <h2 id="who" className="sr-only">Who it is for</h2>
        {AUDIENCES.map((a) => (
          <Link key={a.t} href={a.href} className="card block">
            <h3 className="text-lg font-bold text-zinc-50">{a.t}</h3>
            <p className="mt-1 text-sm text-zinc-400">{a.d}</p>
          </Link>
        ))}
      </section>

      <section aria-labelledby="games">
        <div className="mb-4 flex items-end justify-between"><h2 id="games" className="text-2xl font-bold text-zinc-50">Browse by game</h2><Link href="/games/" className="text-sm text-cyan hover:underline">All games</Link></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {GAMES.map((g) => (
            <Link key={g.slug} href={`/games/${g.slug}/`} className="card flex items-center gap-3 !p-3">
              <GameBadge game={g} />
              <span className="min-w-0"><span className="block truncate font-semibold text-zinc-50">{g.short}</span><span className="block truncate text-xs text-zinc-500">{g.platform}</span></span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="events">
        <div className="mb-4 flex items-end justify-between"><h2 id="events" className="text-2xl font-bold text-zinc-50">Events</h2><Link href="/events/" className="text-sm text-cyan hover:underline">All events</Link></div>
        <div className="grid gap-4 md:grid-cols-3">
          {EVENTS.slice(0, 3).map((e) => (
            <Link key={e.slug} href={`/events/${e.slug}/`} className="card block">
              <div className="flex items-center gap-2"><span className="tag">{gameBySlug(e.game)?.short}</span><span className="tag">{e.mode}</span><span className="tag">{e.level}</span></div>
              <h3 className="mt-3 font-bold text-zinc-50">{e.name}</h3>
              <p className="mt-1 text-sm text-zinc-400">{e.format}</p>
              <p className="mt-3 text-xs text-zinc-500">{e.organiser}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="tools" className="card !p-6 sm:!p-8">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">Organiser tools</p>
            <h2 id="tools" className="mt-2 text-2xl font-bold text-zinc-50 sm:text-3xl">Print player ID cards in a minute</h2>
            <p className="mt-3 text-zinc-400">Add players, pick roles, and print credit-card-size cards on A4. It runs in your browser, so photos never leave your device.</p>
            <div className="mt-5 flex flex-wrap gap-3"><Link href="/tools/id-cards/" className="btn">Make ID cards</Link><Link href="/tools/" className="btn-ghost">All {TOOLS.length} tools</Link></div>
          </div>
          <ul className="grid grid-cols-2 gap-2 text-sm text-zinc-300">
            {TOOLS.map((t) => (<li key={t.slug} className="rounded-lg border border-zinc-800 px-3 py-2">{t.name}</li>))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="comm" className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-end justify-between"><h2 id="comm" className="text-2xl font-bold text-zinc-50">Communities</h2><Link href="/communities/" className="text-sm text-cyan hover:underline">See all</Link></div>
          <div className="space-y-3">
            {COMMUNITIES.slice(0, 3).map((c) => (
              <Link key={c.slug} href={`/communities/${c.slug}/`} className="card block !p-4">
                <div className="flex items-center justify-between gap-2"><h3 className="font-semibold text-zinc-50">{c.name}</h3><span className="tag">{c.kind}</span></div>
                <p className="mt-1 text-sm text-zinc-400">{c.games.map((s) => gameBySlug(s)?.short).join(" · ")}</p>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-4 flex items-end justify-between"><h2 className="text-2xl font-bold text-zinc-50">Guides</h2><Link href="/guides/" className="text-sm text-cyan hover:underline">All guides</Link></div>
          <div className="space-y-3">
            {POSTS.slice(0, 3).map((p) => (
              <Link key={p.slug} href="/guides/" className="card block !p-4">
                <span className="tag">{p.tag}</span>
                <h3 className="mt-2 font-semibold text-zinc-50">{p.title}</h3>
                <p className="mt-1 text-xs text-zinc-500">{p.minutes} min read</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
