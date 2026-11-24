import Link from "next/link";
import { gameLabel } from "@/features/shared/games";
import { StatusBadge } from "@/features/shared/ui/States";
import { box, h2, link, section } from "@/features/shared/ui/styles";
import { VISIBILITY_CHOICES, type BrRow, type Certificate, type MatchRow, type TeamOnProfile, type Visibility } from "@/features/profiles/domain";

/** Dates on profiles: India time, day month year. */
export const dayText = (iso: string | null): string => {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }) : "";
};
const tourHref = (slug: string) => `/tournaments/${encodeURIComponent(slug)}/`;
const RESULT_WORD = { win: "Won", loss: "Lost", draw: "Draw" } as const;
const RESULT_TONE = { win: "success", loss: "neutral", draw: "neutral" } as const;

/** A certificate is a verified result the platform recorded: a completed tournament, an approved team, at least one result. Nothing typed by the player. */
export function CertificateCard({ c, action }: { c: Certificate; action?: React.ReactNode }) {
  return (
    <li id={`cert-${c.id.replace(/[^a-z0-9-]/gi, "-")}`} className={box}>
      <p className="text-xs uppercase tracking-wide text-zinc-400">Verified result · {gameLabel(c.tournament.game)}</p>
      <h3 className="mt-1 font-display text-lg text-zinc-100"><Link href={tourHref(c.tournament.slug)} className="hover:underline">{c.tournament.title}</Link></h3>
      <p className="mt-1 text-zinc-300">Team <span className="text-zinc-100">{c.team}</span>{c.completedOn && <> · completed {dayText(c.completedOn)}</>}</p>
      <ul className="mt-3 space-y-1 text-sm text-zinc-300">
        {c.record && <li>Matches: <span className="font-mono tabular-nums text-zinc-100">{c.record.wins}</span> won, <span className="font-mono tabular-nums">{c.record.losses}</span> lost{c.record.draws > 0 && <>, <span className="font-mono tabular-nums">{c.record.draws}</span> drawn</>}</li>}
        {c.battleRoyale && <li>Battle royale: best placement <span className="font-mono tabular-nums text-zinc-100">#{c.battleRoyale.bestPlacement}</span> in <span className="font-mono tabular-nums">{c.battleRoyale.matches}</span> {c.battleRoyale.matches === 1 ? "match" : "matches"}, <span className="font-mono tabular-nums">{c.battleRoyale.kills}</span> team kills</li>}
      </ul>
      <p className="mt-3 text-xs text-zinc-400">Recorded by the organiser on Esports Hub. The player cannot edit it.</p>
      {action && <div className="mt-3">{action}</div>}
    </li>
  );
}

export function CertificateList({ items, empty }: { items: Certificate[]; empty: string }) {
  return (
    <section className={section} aria-labelledby="certs-h">
      <h2 id="certs-h" className={h2}>Certificates</h2>
      {items.length === 0 ? <p className="mt-3 text-zinc-300">{empty}</p> : <ul className="mt-4 grid gap-4 sm:grid-cols-2">{items.map((c) => <CertificateCard key={c.id} c={c} />)}</ul>}
    </section>
  );
}

export function MatchTable({ rows }: { rows: MatchRow[] }) {
  if (rows.length === 0) return null;
  return (
    <ul className="mt-4 divide-y divide-white/10">
      {rows.map((m, i) => (
        <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
          <span className="text-zinc-100">{m.team} <span className="text-zinc-400">vs</span> {m.opponent || "Unlisted team"}</span>
          <span className="flex items-center gap-2 text-sm text-zinc-300">
            <span className="font-mono tabular-nums">{m.scoreFor ?? "-"} : {m.scoreAgainst ?? "-"}</span>
            <StatusBadge label={RESULT_WORD[m.result]} tone={RESULT_TONE[m.result]} />
            {m.corrected && <StatusBadge label="Corrected" tone="warning" />}
          </span>
          <span className="w-full text-xs text-zinc-400"><Link href={tourHref(m.tournament.slug)} className="hover:underline">{m.tournament.title}</Link>{m.stage ? ` · ${m.stage}` : ""}{m.round ? `, round ${m.round}` : ""}</span>
        </li>
      ))}
    </ul>
  );
}

export function BrTable({ rows }: { rows: BrRow[] }) {
  if (rows.length === 0) return null;
  return (
    <ul className="mt-4 divide-y divide-white/10">
      {rows.map((r, i) => (
        <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
          <span className="text-zinc-100">Match {r.matchNo} · {r.team}</span>
          <span className="flex items-center gap-2 text-sm text-zinc-300">#<span className="font-mono tabular-nums text-zinc-100">{r.placement}</span> · <span className="font-mono tabular-nums">{r.kills}</span> kills{r.corrected && <StatusBadge label="Corrected" tone="warning" />}</span>
          <span className="w-full text-xs text-zinc-400"><Link href={tourHref(r.tournament.slug)} className="hover:underline">{r.tournament.title}</Link></span>
        </li>
      ))}
    </ul>
  );
}

export function ResultsSection({ matches, battleRoyale }: { matches: MatchRow[]; battleRoyale: BrRow[] }) {
  return (
    <section className={section} aria-labelledby="results-h">
      <h2 id="results-h" className={h2}>Matches</h2>
      <p className="mt-2 text-sm text-zinc-400">Verified results from tournaments on Esports Hub. Opponents that did not choose a public team page show as Unlisted team.</p>
      {matches.length === 0 && battleRoyale.length === 0 ? <p className="mt-3 text-zinc-300">No verified results yet.</p> : <><MatchTable rows={matches} /><BrTable rows={battleRoyale} /></>}
    </section>
  );
}

export function TeamsSection({ teams }: { teams: TeamOnProfile[] }) {
  return (
    <section className={section} aria-labelledby="teams-h">
      <h2 id="teams-h" className={h2}>Teams</h2>
      {teams.length === 0 ? <p className="mt-3 text-zinc-300">No teams yet. A team shows here after its captain claims it in a tournament.</p> : (
        <ul className="mt-4 space-y-2">
          {teams.map((t) => (
            <li key={t.name} className={box}>
              <span className="text-zinc-100">{t.teamPageSlug ? <Link href={`/teams/view/?s=${encodeURIComponent(t.teamPageSlug)}`} className={link}>{t.name}</Link> : t.name}</span>
              <span className="block text-sm text-zinc-300">{t.games.map(gameLabel).join(", ")} · {t.tournaments} {t.tournaments === 1 ? "tournament" : "tournaments"} as captain</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Private / Link only / Public as three radios. `disabledReason` explains why the shared choices are off. */
export function VisibilityPicker({ name, value, busy, onPick, disabledReason }: { name: string; value: Visibility; busy: string; onPick: (v: Visibility) => void; disabledReason?: string }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-medium text-zinc-100">Who can see it</legend>
      {VISIBILITY_CHOICES.map((c) => {
        const off = !!disabledReason && c.value !== "private" && c.value !== value;
        return (
          <label key={c.value} className={`flex min-h-11 items-start gap-3 rounded-lg border border-white/10 p-3 ${off ? "text-zinc-400" : "text-zinc-100"}`}>
            <input type="radio" name={name} value={c.value} checked={value === c.value} disabled={off || busy !== ""} onChange={() => onPick(c.value)} className="mt-1 h-5 w-5 accent-cyan-400" />
            <span><span className="font-medium">{c.label}</span><span className="block text-sm text-zinc-300">{c.help}</span></span>
          </label>
        );
      })}
      {disabledReason && <p className="text-sm text-zinc-400">{disabledReason}</p>}
    </fieldset>
  );
}
