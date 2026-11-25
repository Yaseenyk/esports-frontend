import { gameLabel, ROLE_LABELS } from "@/features/shared/games";
import { StatusBadge } from "@/features/shared/ui/States";
import { box, h1, h2, helper, link, section } from "@/features/shared/ui/styles";
import { linkLabel, type PlayerPage } from "@/features/profiles/domain";
import { CertificateList, ResultsSection, TeamsSection, dayText, type TourLink } from "@/features/profiles/ui/ProfileParts";

/** The tournaments behind the page's verified rows, newest first as the API orders them, each once. */
export function recentTournaments(p: Pick<PlayerPage, "certificates" | "matches" | "battleRoyale">): { slug: string; title: string }[] {
  const seen = new Map<string, string>();
  for (const t of [...p.certificates.map((c) => c.tournament), ...p.matches.map((m) => m.tournament), ...p.battleRoyale.map((b) => b.tournament)]) if (t.slug && !seen.has(t.slug)) seen.set(t.slug, t.title);
  return [...seen.entries()].slice(0, 10).map(([slug, title]) => ({ slug, title }));
}

/**
 * Everything the player chose to show, as plain text (React escapes every value; no HTML from the API is ever rendered).
 * Typed-by-the-player fields and verified results are labelled apart. Links open in a new tab with rel="nofollow ugc noopener noreferrer".
 * data-clarity-mask: session tools never record the profile's text (the same rule as the points table).
 * Presentation only: used by the shared page (/players/view/), the card page (/p/) and the pre-rendered page (/players/<slug>/).
 */
export function PlayerView({ p, footer, kicker = "Esports player profile", linkable = () => true }: { p: PlayerPage; footer?: React.ReactNode; kicker?: string; linkable?: TourLink }) {
  const place = [p.city, p.state].filter(Boolean).join(", ");
  const s = p.stats;
  const recent = recentTournaments(p);
  return (
    <article className="mx-auto max-w-3xl space-y-8" data-clarity-mask="true">
      <header className="space-y-2">
        <p className="text-sm text-zinc-400">{kicker}</p>
        <h1 className={h1}>{p.handle}</h1>
        {(place || p.languages.length > 0) && <p className="text-zinc-300">{place}{place && p.languages.length > 0 && " · "}{p.languages.length > 0 && `Speaks ${p.languages.join(", ")}`}</p>}
        {p.teamName && <p className="text-zinc-100">Current team: <span className="font-medium">{p.teamName}</span></p>}
        {p.bio && <p className="max-w-3xl whitespace-pre-line text-zinc-100">{p.bio}</p>}
        {p.visibility === "unlisted" && <p className="text-sm text-zinc-400">Link only: shared by its owner with people who have this link. It is not listed anywhere.</p>}
      </header>

      {p.links.length > 0 && (
        <section className={section} aria-labelledby="links-h">
          <h2 id="links-h" className={h2}>Links</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {p.links.map((l) => (
              <li key={l.url}><a href={l.url} target="_blank" rel="nofollow ugc noopener noreferrer" className={`${link} inline-flex min-h-11 items-center`}>{linkLabel(l.kind)}<span className="sr-only"> (opens in a new tab)</span></a></li>
            ))}
          </ul>
          <p className={helper}>Links are added by the player. Esports Hub checks the address format, not the account behind it.</p>
        </section>
      )}

      {p.games.length > 0 && (
        <section className={section} aria-labelledby="games-h">
          <h2 id="games-h" className={h2}>Games</h2>
          <ul className="mt-4 space-y-2">
            {p.games.map((g) => (
              <li key={g.game} className={box}>
                <span className="font-medium text-zinc-100">{gameLabel(g.game)}</span> <span className="text-zinc-300">· {g.inGameName}{g.roles.length > 0 && ` · ${g.roles.map((r) => ROLE_LABELS[r] ?? r).join(", ")}`}</span>
              </li>
            ))}
          </ul>
          <p className={helper}>Games, names and roles are typed by the player. Results below are not.</p>
        </section>
      )}

      {s && (s.tournaments > 0 || s.matches.played > 0 || s.battleRoyale.matches > 0) && (
        <section className={section} aria-labelledby="stats-h">
          <h2 id="stats-h" className={`${h2} flex flex-wrap items-center gap-3`}>Stats <StatusBadge label="Verified" tone="success" /></h2>
          <p className="mt-2 text-sm text-zinc-300">Counted by Esports Hub from results organisers recorded and verified. The player cannot type or change these numbers.</p>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div><dt className="text-xs text-zinc-400">Tournaments</dt><dd className="font-mono text-xl font-semibold tabular-nums text-zinc-100">{s.tournaments}</dd></div>
            {s.matches.played > 0 && <div><dt className="text-xs text-zinc-400">Matches won</dt><dd className="font-mono text-xl font-semibold tabular-nums text-zinc-100">{s.matches.wins} of {s.matches.played}</dd></div>}
            {s.battleRoyale.matches > 0 && <div><dt className="text-xs text-zinc-400">Battle royale wins</dt><dd className="font-mono text-xl font-semibold tabular-nums text-zinc-100">{s.battleRoyale.wins} of {s.battleRoyale.matches}</dd></div>}
            {s.battleRoyale.matches > 0 && <div><dt className="text-xs text-zinc-400">Team kills</dt><dd className="font-mono text-xl font-semibold tabular-nums text-zinc-100">{s.battleRoyale.kills}</dd></div>}
          </dl>
        </section>
      )}

      {p.achievements.length > 0 && (
        <section className={section} aria-labelledby="ach-h">
          <h2 id="ach-h" className={h2}>Achievements</h2>
          <ul className="mt-4 space-y-2">{p.achievements.map((a, i) => <li key={i} className={box}><span className="text-zinc-100">{a.title}</span>{a.year !== null && <span className="text-zinc-300"> · {a.year}</span>}</li>)}</ul>
          <p className={helper}>Added by the player and not checked by Esports Hub. Verified results are the ones marked Verified.</p>
        </section>
      )}

      {recent.length > 0 && (
        <section className={section} aria-labelledby="recent-h">
          <h2 id="recent-h" className={h2}>Recent tournaments</h2>
          <ul className="mt-4 space-y-2">{recent.map((t) => <li key={t.slug} className="text-zinc-100">{linkable(t.slug) ? <a href={`/tournaments/${encodeURIComponent(t.slug)}/`} className={link}>{t.title}</a> : t.title}</li>)}</ul>
        </section>
      )}
      {p.teams.length > 0 && <TeamsSection teams={p.teams} />}
      {p.certificates.length > 0 && <CertificateList items={p.certificates} empty="" linkable={linkable} />}
      {(p.matches.length > 0 || p.battleRoyale.length > 0) && <ResultsSection matches={p.matches} battleRoyale={p.battleRoyale} linkable={linkable} />}

      {p.updatedAt && <p className="text-xs text-zinc-400">Profile updated {dayText(p.updatedAt)}. It is {p.visibility === "public" ? "public" : "shared by link"} because its owner chose so, and they can make it private at any time.</p>}
      {footer}
    </article>
  );
}
