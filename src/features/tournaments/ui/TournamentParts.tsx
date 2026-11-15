import Link from "next/link";
import { dateText, dateTimeText, whereText } from "@/features/tournaments/ui/format";
import { formatName, gameName, statusName, type BrResult, type MatchResult, type ScheduleRow, type TournamentCard, type TournamentDetail } from "@/features/tournaments/domain";
import { StatusBadge } from "@/features/shared/ui/States";
import { box, h1, h2, h3, link, section } from "@/features/shared/ui/styles";

const TONE = { registration_open: "success", live: "accent", completed: "neutral", registration_closed: "warning", published: "neutral" } as const;
const tone = (s: string) => (TONE as Record<string, "success" | "accent" | "neutral" | "warning">)[s] ?? "neutral";

export function TournamentHeader({ t }: { t: TournamentDetail }) {
  return (
    <header className="space-y-3">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href="/tournaments/" className="hover:text-zinc-100">Tournaments</Link> / {gameName(t.game)}</nav>
      <h1 className={h1}>{t.title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge label={statusName(t.status)} tone={tone(t.status)} />
        <span className="text-sm text-zinc-300">{gameName(t.game)} · {formatName(t.format)}</span>
      </div>
      <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
        <div><dt className="text-zinc-400">Starts</dt><dd className="text-zinc-100">{dateText(t.startsAt)}</dd></div>
        {t.endsAt && <div><dt className="text-zinc-400">Ends</dt><dd className="text-zinc-100">{dateText(t.endsAt)}</dd></div>}
        <div><dt className="text-zinc-400">Where</dt><dd className="text-zinc-100">{whereText(t.venue, t.city, t.state)}</dd></div>
        {t.maxTeams && <div><dt className="text-zinc-400">Team limit</dt><dd className="text-zinc-100">{t.maxTeams} teams</dd></div>}
      </dl>
    </header>
  );
}

/** Presentation only: the numbers come in as props (the build's numbers first, the live ones once they arrive). */
export function RegistrationPanel({ open, registered, spotsLeft, live, status }: { open: boolean; registered: number; spotsLeft: number | null; live: boolean; status: string }) {
  return (
    <section aria-labelledby="reg-h" className={box}>
      <h2 id="reg-h" className={h3}>Registration</h2>
      <p className="mt-2 text-zinc-100"><StatusBadge label={open ? "Open" : status === "completed" ? "Finished" : "Closed"} tone={open ? "success" : "neutral"} /></p>
      <p className="mt-3 text-sm text-zinc-300"><span className="font-mono tabular-nums">{registered}</span> {registered === 1 ? "team has" : "teams have"} registered{spotsLeft !== null && open ? <>, <span className="font-mono tabular-nums">{spotsLeft}</span> {spotsLeft === 1 ? "spot" : "spots"} left</> : ""}.</p>
      <p className="mt-2 text-xs text-zinc-400">{live ? "Updated just now." : "Counts as of the last site update."} Teams register through the link the organiser shares.</p>
    </section>
  );
}

export function RulesAccordion({ rules }: { rules: string | null }) {
  if (!rules) return null;
  return (
    <details className={`group ${section}`}>
      <summary className="min-h-11 cursor-pointer py-2 font-display text-2xl text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">Rules</summary>
      <p className="mt-3 max-w-3xl whitespace-pre-line text-zinc-300">{rules}</p>
    </details>
  );
}

export function ScheduleList({ rows }: { rows: ScheduleRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="sched-h" className={section}>
      <h2 id="sched-h" className={h2}>Schedule</h2>
      <ol className="mt-4 divide-y divide-white/10">
        {rows.map((r, i) => (
          <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <span className="text-zinc-100">{r.teamA} <span className="text-zinc-400">vs</span> {r.teamB}</span>
            <span className="text-sm text-zinc-300">{r.stage}{r.round ? `, round ${r.round}` : ""} · {dateTimeText(r.startsAt)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TeamList({ teams }: { teams: { name: string; teamSlug: string }[] }) {
  if (teams.length === 0) return null;
  return (
    <section aria-labelledby="teams-h" className={section}>
      <h2 id="teams-h" className={h2}>Approved teams</h2>
      <p className="mt-1 text-sm text-zinc-400">Only teams that chose to be public are listed.</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">{teams.map((x) => <li key={x.teamSlug} className="text-zinc-100">{x.name}</li>)}</ul>
    </section>
  );
}

const Corrected = ({ was }: { was?: string }) => <span className="ml-2 rounded-full border border-white/10 px-2 text-xs text-warning" title={was}>Corrected{was ? ` (was ${was})` : ""}</span>;

function MatchTable({ rows }: { rows: MatchResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Match results</caption>
        <thead className="text-zinc-400"><tr><th scope="col" className="py-2 pr-4 font-medium">Match</th><th scope="col" className="py-2 pr-4 font-medium">Team A</th><th scope="col" className="py-2 pr-4 font-medium">Score</th><th scope="col" className="py-2 font-medium">Team B</th></tr></thead>
        <tbody className="divide-y divide-white/10 text-zinc-100">
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="py-2 pr-4 text-zinc-300">{r.stage}{r.round ? ` r${r.round}` : ""}</td>
              <td className="py-2 pr-4">{r.teamA}{r.winner === "a" && <span className="ml-2 text-xs text-success">Winner</span>}</td>
              <td className="py-2 pr-4 font-mono tabular-nums">{r.scoreA ?? "-"} : {r.scoreB ?? "-"}{r.corrected && <Corrected />}</td>
              <td className="py-2">{r.teamB}{r.winner === "b" && <span className="ml-2 text-xs text-success">Winner</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BrTable({ rows }: { rows: BrResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Battle royale results</caption>
        <thead className="text-zinc-400"><tr><th scope="col" className="py-2 pr-4 font-medium">Match</th><th scope="col" className="py-2 pr-4 font-medium">Team</th><th scope="col" className="py-2 pr-4 font-medium">Placement</th><th scope="col" className="py-2 font-medium">Kills</th></tr></thead>
        <tbody className="divide-y divide-white/10 text-zinc-100">
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="py-2 pr-4 font-mono tabular-nums">{r.matchNo}</td>
              <td className="py-2 pr-4">{r.team}</td>
              <td className="py-2 pr-4 font-mono tabular-nums">{r.placement}{r.corrected && r.original && <Corrected was={`${r.original.placement}`} />}</td>
              <td className="py-2 font-mono tabular-nums">{r.kills}{r.corrected && r.original && r.original.kills !== r.kills && <Corrected was={`${r.original.kills}`} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ResultsSection({ matches, battleRoyale }: { matches: MatchResult[]; battleRoyale: BrResult[] }) {
  if (matches.length === 0 && battleRoyale.length === 0) return null;
  const anyCorrected = matches.some((m) => m.corrected) || battleRoyale.some((b) => b.corrected);
  return (
    <section aria-labelledby="res-h" className={section}>
      <h2 id="res-h" className={h2}>Verified results</h2>
      {anyCorrected && <p className="mt-1 text-sm text-zinc-400">A result marked Corrected was changed after a dispute was resolved. The original value is shown next to it.</p>}
      <div className="mt-4 space-y-6">{matches.length > 0 && <MatchTable rows={matches} />}{battleRoyale.length > 0 && <BrTable rows={battleRoyale} />}</div>
    </section>
  );
}

export function TournamentCardLink({ t }: { t: TournamentCard }) {
  return (
    <li>
      <Link href={`/tournaments/${t.slug}/`} className={`block ${box} transition-colors hover:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400`}>
        <span className="flex flex-wrap items-center gap-2"><StatusBadge label={statusName(t.status)} tone={tone(t.status)} /><span className="text-sm text-zinc-300">{gameName(t.game)}</span></span>
        <span className="mt-2 block font-display text-lg text-zinc-100">{t.title}</span>
        <span className="mt-1 block text-sm text-zinc-300">{dateText(t.startsAt)} · {whereText(t.venue, t.city, t.state)}</span>
        {t.summary && <span className="mt-2 block text-sm text-zinc-300">{t.summary}</span>}
      </Link>
    </li>
  );
}

export function TournamentList({ items, heading }: { items: TournamentCard[]; heading: string }) {
  return (
    <section aria-labelledby="list-h">
      <h2 id="list-h" className="sr-only">{heading}</h2>
      <ul className="grid gap-4 sm:grid-cols-2">{items.map((t) => <TournamentCardLink key={t.slug} t={t} />)}</ul>
    </section>
  );
}

export const AboutSection = ({ description }: { description: string | null }) => description ? (
  <section aria-labelledby="about-h" className={section}><h2 id="about-h" className={h2}>About this tournament</h2><p className="mt-3 max-w-3xl whitespace-pre-line text-zinc-300">{description}</p></section>
) : null;

export const FooterNote = () => <p className={`${section} text-sm text-zinc-400`}>This page is built from what the organiser published on <Link href="/" className={link}>Esports Hub</Link>. Results are only shown once they are verified.</p>;
