"use client";

import Link from "next/link";
import { GAMES, gameLabel } from "@/features/shared/games";
import { explainFailure } from "@/features/shared/failure";
import { SelectInput } from "@/features/shared/ui/Fields";
import { EmptyState, ErrorState, StatusBadge } from "@/features/shared/ui/States";
import { box, btnPrimary, btnSecondary, h1, h2, h3, link, section } from "@/features/shared/ui/styles";
import type { DirectoryData, DirectoryItem } from "@/features/directory/domain";
import { useDirectory, useDirectorySetting } from "@/features/directory/hooks/useDirectory";

const dateText = (iso: string | null): string => {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? new Date(t).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) + " IST" : "Date to be announced";
};
const VENUE: Record<string, string> = { online: "Online", offline: "In person", hybrid: "In person and online" };

function Card({ t }: { t: DirectoryItem }) {
  return (
    <li className={`${box} flex flex-col gap-3`}>
      <div className="flex flex-wrap items-center gap-2"><StatusBadge label={gameLabel(t.game)} tone="accent" /><StatusBadge label={t.registration.open ? "Registration open" : t.status === "live" ? "Live now" : "Registration closed"} tone={t.registration.open ? "success" : "neutral"} /></div>
      <h3 className={h3}><Link href={t.pagePath} className="hover:underline">{t.title}</Link></h3>
      <p className="text-sm text-zinc-100">{dateText(t.startsAt)}</p>
      <p className="text-sm text-zinc-300">{VENUE[t.venue] ?? "Online"}{t.city ? ` · ${[t.city, t.state].filter(Boolean).join(", ")}` : ""} · <span className="font-mono tabular-nums">{t.registration.registered}</span> {t.registration.registered === 1 ? "team" : "teams"} registered{t.registration.spotsLeft !== null && t.registration.open ? <>, <span className="font-mono tabular-nums">{t.registration.spotsLeft}</span> left</> : ""}</p>
      {t.summary && <p className="text-sm text-zinc-300">{t.summary}</p>}
      <div className="mt-auto flex flex-wrap gap-3">
        {t.registerUrl && t.registration.open ? <a href={t.registerUrl} rel="nofollow" className={btnPrimary}>Register your team</a> : null}
        <Link href={t.pagePath} className={t.registerUrl && t.registration.open ? btnSecondary : btnPrimary}>{t.registration.open && !t.registerUrl ? "How to register" : "Details"}</Link>
      </div>
    </li>
  );
}

/**
 * /tournaments/ when v3.directory is on: upcoming public tournaments with game and city filters. The list is in the static HTML (build time) and then
 * refreshed live. Robots and the sitemap are decided at build time by the index rule (domain.ts), not here.
 */
export function DirectoryScreen({ initial, indexable }: { initial: DirectoryData; indexable: boolean }) {
  const d = useDirectory(initial);
  const gameOptions = GAMES.filter((g) => d.games.some((x) => x.game === g.value) || d.filters.game === g.value);
  const cityOptions = d.cities.map((c) => ({ value: c.city, label: `${c.city} (${c.count})` }));
  if (d.filters.city && !cityOptions.some((c) => c.value.toLowerCase() === d.filters.city.toLowerCase())) cityOptions.push({ value: d.filters.city, label: d.filters.city });
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-3">
        <h1 className={h1}>Upcoming esports tournaments</h1>
        <p className="max-w-3xl text-zinc-300">Public tournaments organisers created and published on Esports Hub, soonest first. Times are India time. We list only tournaments with a real organiser behind them, and never invent dates or prizes.</p>
      </header>
      {initial.total === 0 && d.items.length === 0 && !d.filtered ? (
        <EmptyState title="No public tournaments yet — create one" body="Nobody has published an upcoming public tournament here yet. Organisers can create one for free: it gets a shareable page and a team sign-up form." action={<Link href="/app/tournaments/" className={btnPrimary}>Create a tournament</Link>} />
      ) : (
        <>
          <form role="search" aria-label="Filter tournaments" onSubmit={(e) => e.preventDefault()} className={`${box} grid gap-4 sm:grid-cols-3`}>
            <SelectInput id="dir-game" label="Game" value={d.filters.game} onChange={(v) => d.setFilters({ ...d.filters, game: v })} options={gameOptions.length ? gameOptions : GAMES} blank="Any game" />
            <SelectInput id="dir-city" label="City" value={d.filters.city} onChange={(v) => d.setFilters({ ...d.filters, city: v })} options={cityOptions} blank="Any city" />
            {d.filtered && <div className="flex items-end"><button type="button" onClick={d.clear} className={btnSecondary}>Clear filters</button></div>}
          </form>
          <div aria-live="polite">
            {d.items.length === 0 ? <EmptyState title="Nothing matches these filters" body="Try another game or city, or clear the filters." action={<button type="button" onClick={d.clear} className={btnSecondary}>Clear filters</button>} /> : <ul className="grid gap-4 sm:grid-cols-2">{d.items.map((t) => <Card key={t.slug} t={t} />)}</ul>}
          </div>
        </>
      )}
      <section className={section} aria-labelledby="dir-how-h">
        <h2 id="dir-how-h" className={h2}>Run a tournament?</h2>
        <p className="mt-3 max-w-3xl text-zinc-300">Create the event, publish its tournament page and open registration. It appears here while it is upcoming. You decide whether the Register button opens your sign-up form directly. <Link href="/app/tournaments/" className={link}>Create a tournament</Link>.</p>
        {!indexable && <p className="mt-2 text-xs text-zinc-400">This list is kept out of search results until it holds at least five upcoming tournaments.</p>}
      </section>
    </div>
  );
}

/** In the organiser's tournament screen: show or hide the team sign-up link on the public directory. Nothing while v3.directory is off. */
export function DirectoryOptIn({ eventId }: { eventId: string }) {
  const s = useDirectorySetting(eventId);
  if (s.res.phase === "unavailable" || s.res.phase === "loading" || s.res.phase === "signin") return null;
  if (s.res.phase === "error") return <ErrorState message={explainFailure(s.res.failure)} onRetry={s.res.reload} />;
  const v = s.res.data;
  return (
    <section aria-labelledby="dir-opt-h" className={`${section} space-y-3`}>
      <h2 id="dir-opt-h" className={h2}>Public tournament directory</h2>
      <p className="max-w-3xl text-zinc-300">{v.listed ? "Your tournament is listed on /tournaments/ while it is upcoming." : "Your tournament is listed on /tournaments/ once it is published, has a start date and has not ended."}</p>
      <label className="flex min-h-11 items-start gap-3 text-zinc-100">
        <input type="checkbox" checked={v.signupPublic} disabled={s.busy} onChange={(e) => void s.toggle(e.target.checked)} className="mt-1 h-5 w-5 accent-cyan-400" />
        <span>Show my team sign-up link on the directory<span className="block text-sm text-zinc-400">Off by default. When on, the Register button opens your sign-up form directly while registration and the form are open. Anyone can then see the link.</span></span>
      </label>
      <p className="text-sm text-zinc-300">Right now: {v.linkShown ? "the Register button opens your sign-up form." : !v.signupPublic ? "the card opens your tournament page." : !v.registrationOpen ? "registration is not open, so no link is shown." : "your sign-up form is closed or full, so no link is shown."}</p>
      {s.error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{s.error}</p>}
    </section>
  );
}
