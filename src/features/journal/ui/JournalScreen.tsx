"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/components/cloud/useSession";
import { explainFailure } from "@/features/shared/failure";
import { gameLabel, GAMES } from "@/features/shared/games";
import { SelectInput, TextArea, TextInput } from "@/features/shared/ui/Fields";
import { EmptyState, ErrorState, NotAvailable, SignInPrompt, SkeletonRows, StatusBadge } from "@/features/shared/ui/States";
import { box, btnDanger, btnPrimary, btnSecondary, h1, h2, helper, link, section } from "@/features/shared/ui/styles";
import { LIMITS, type Period } from "@/features/journal/domain";
import { useJournal } from "@/features/journal/hooks/useJournal";
import { ProgressChart } from "@/features/journal/ui/ProgressChart";

const SELF = <StatusBadge label="Self-logged" tone="neutral" />;
const fmt = (v: number | null) => (v === null ? "-" : Number.isInteger(v) ? String(v) : v.toFixed(1));

/**
 * /app/journal/: the signed-in player's private match log. Everything here is typed by the player and labelled "Self-logged"; it is never shown on a
 * public page and never mixed with the Verified stats organisers' results produce. data-clarity-mask keeps it out of session tools.
 */
export function JournalScreen() {
  const session = useSession();
  const j = useJournal();
  const [table, setTable] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const header = (
    <header className="space-y-2">
      <h1 className={h1}>Match journal</h1>
      <p className="max-w-3xl text-zinc-300">A private log of your own matches, with weekly and monthly progress. Only you can see it. These numbers are what you type, so they are marked Self-logged and never appear as Verified stats or on your player page.</p>
    </header>
  );
  const wrap = (body: React.ReactNode) => <div className="mx-auto max-w-5xl space-y-6">{header}{body}</div>;
  if (j.res.phase === "unavailable") return wrap(<NotAvailable what="The match journal" />);
  if (j.res.phase === "signin") return wrap(!session && <SignInPrompt what="Sign in to keep your private match journal." next="/app/journal/" />);
  if (j.res.phase === "loading") return wrap(j.res.showSkeleton ? <SkeletonRows label="Loading your journal" /> : <p className="sr-only">Loading your journal</p>);
  if (j.res.phase === "error") return wrap(<ErrorState message={explainFailure(j.res.failure)} onRetry={j.res.reload} />);

  const d = j.draft, p = j.problems;
  const full = j.items.length >= j.cap && !j.editing;
  const t = j.totals;
  return (
    <div className="mx-auto max-w-5xl space-y-8" data-clarity-mask="true">
      {header}
      <div aria-live="polite">
        {j.notice && <p role="status" className="text-success"><span aria-hidden="true">+ </span>{j.notice}</p>}
        {j.error && <p role="alert" className="text-danger"><span aria-hidden="true">! </span>{j.error}</p>}
      </div>

      <form className={`${box} space-y-4`} aria-labelledby="jr-form-h" noValidate onSubmit={(e) => { e.preventDefault(); void j.save(); }}>
        <h2 id="jr-form-h" className="font-display text-lg font-semibold text-zinc-100">{j.editing ? "Edit this match" : "Log a match"}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput id="jr-date" type="date" label="Day played" value={d.playedOn} onChange={(v) => j.setField("playedOn", v)} error={p.playedOn} />
          <SelectInput id="jr-game" label="Game" value={d.game} onChange={(v) => j.setField("game", v)} options={GAMES} error={p.game} />
          <TextInput id="jr-mode" label="Mode (optional)" value={d.mode} onChange={(v) => j.setField("mode", v)} maxLength={LIMITS.MODE_MAX} help="For example Squad TPP or Clash Squad" error={p.mode} />
          <TextInput id="jr-map" label="Map (optional)" value={d.map} onChange={(v) => j.setField("map", v)} maxLength={LIMITS.MAP_MAX} error={p.map} />
          <TextInput id="jr-place" label="Placement (optional)" inputMode="numeric" value={d.placement} onChange={(v) => j.setField("placement", v)} help="1 means you won the match" error={p.placement} />
          <TextInput id="jr-kills" label="Kills" inputMode="numeric" value={d.kills} onChange={(v) => j.setField("kills", v)} error={p.kills} />
          <TextInput id="jr-dmg" label="Damage (optional)" inputMode="numeric" value={d.damage} onChange={(v) => j.setField("damage", v)} error={p.damage} />
        </div>
        <TextArea id="jr-notes" label="Notes (optional)" rows={3} value={d.notes} onChange={(v) => j.setField("notes", v)} max={LIMITS.NOTES_MAX} help="What went well, what to fix. Private to you." error={p.notes} />
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={j.busy !== "" || full} className={btnPrimary}>{j.busy === "save" ? "Saving" : j.editing ? "Save changes" : "Save match"}</button>
          {j.editing && <button type="button" onClick={j.cancelEdit} className={btnSecondary}>Cancel</button>}
        </div>
        {full && <p className="text-sm text-warning"><span aria-hidden="true">! </span>Your journal holds {j.cap} matches, the most it can. Export it, then delete old matches to add more.</p>}
      </form>

      {j.items.length === 0 ? (
        <EmptyState title="No matches yet" body="Log your first match above. Once you have a few, your weekly and monthly progress shows here." />
      ) : (
        <>
          <section className={`${section} space-y-4`} aria-labelledby="jr-prog-h">
            <h2 id="jr-prog-h" className={`${h2} flex flex-wrap items-center gap-3`}>Progress {SELF}</h2>
            <div className="flex flex-wrap items-end gap-4">
              <fieldset className="flex gap-2">
                <legend className="mb-1 text-sm font-medium text-zinc-100">Group by</legend>
                {(["week", "month"] as Period[]).map((x) => (
                  <button key={x} type="button" aria-pressed={j.period === x} onClick={() => j.setPeriod(x)} className={j.period === x ? btnPrimary : btnSecondary}>{x === "week" ? "Week" : "Month"}</button>
                ))}
              </fieldset>
              <div className="w-56"><SelectInput id="jr-filter" label="Game" value={j.game} onChange={j.setGame} blank="All games" options={GAMES} /></div>
              <button type="button" aria-pressed={table} onClick={() => setTable((v) => !v)} className={btnSecondary}>{table ? "Show charts" : "Show as a table"}</button>
            </div>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div><dt className="text-xs text-zinc-400">Matches</dt><dd className="font-mono text-xl font-semibold tabular-nums text-zinc-100">{t.matches}</dd></div>
              <div><dt className="text-xs text-zinc-400">Kills per match</dt><dd className="font-mono text-xl font-semibold tabular-nums text-zinc-100">{fmt(t.avgKills)}</dd></div>
              <div><dt className="text-xs text-zinc-400">Average placement</dt><dd className="font-mono text-xl font-semibold tabular-nums text-zinc-100">{fmt(t.avgPlacement)}</dd></div>
              <div><dt className="text-xs text-zinc-400">Matches won (placed 1st)</dt><dd className="font-mono text-xl font-semibold tabular-nums text-zinc-100">{t.wins}</dd></div>
            </dl>
            {j.progress.length === 0 ? <p className="text-zinc-300">No matches for this game yet.</p> : table ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Self-logged progress by {j.period}</caption>
                  <thead className="text-zinc-400"><tr><th scope="col" className="py-2 pr-4">{j.period === "week" ? "Week of" : "Month"}</th><th scope="col" className="py-2 pr-4">Matches</th><th scope="col" className="py-2 pr-4">Kills per match</th><th scope="col" className="py-2 pr-4">Average placement</th><th scope="col" className="py-2">Best placement</th></tr></thead>
                  <tbody className="font-mono tabular-nums text-zinc-100">
                    {j.progress.map((b) => <tr key={b.key} className="border-t border-white/10"><th scope="row" className="py-2 pr-4 font-sans font-normal">{b.label}</th><td className="py-2 pr-4">{b.matches}</td><td className="py-2 pr-4">{fmt(b.avgKills)}</td><td className="py-2 pr-4">{fmt(b.avgPlacement)}</td><td className="py-2">{fmt(b.bestPlacement)}</td></tr>)}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                <ProgressChart id="jr-c1" title={`Matches per ${j.period}`} buckets={j.progress} value={(b) => b.matches} kind="bar" unit="matches" />
                <ProgressChart id="jr-c2" title="Kills per match" buckets={j.progress} value={(b) => b.avgKills} kind="line" unit="kills per match" />
              </div>
            )}
            <p className={helper}>Self-logged: worked out from the matches you typed. Verified stats come only from results organisers record, and they are on your <Link href="/app/resume/" className={link}>profile</Link>.</p>
          </section>

          <section className={`${section} space-y-4`} aria-labelledby="jr-list-h">
            <h2 id="jr-list-h" className={h2}>Your matches</h2>
            <p className="text-sm text-zinc-300"><span className="font-mono tabular-nums">{j.items.length}</span> of {j.cap} matches.</p>
            <ul className="space-y-3">
              {j.items.slice(0, 200).map((e) => (
                <li key={e.id} className={`${box} flex flex-wrap items-start justify-between gap-3`}>
                  <div className="min-w-0 space-y-1">
                    <p className="text-zinc-100"><span className="font-medium">{gameLabel(e.game)}</span> · {e.playedOn}{e.mode && ` · ${e.mode}`}{e.map && ` · ${e.map}`}</p>
                    <p className="font-mono text-sm tabular-nums text-zinc-300">{e.placement !== null && `#${e.placement} · `}{e.kills} kills{e.damage !== null && ` · ${e.damage} damage`}</p>
                    {e.notes && <p className="whitespace-pre-line break-words text-sm text-zinc-300">{e.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => j.edit(e)} className={btnSecondary} aria-label={`Edit the ${gameLabel(e.game)} match of ${e.playedOn}`}>Edit</button>
                    <button type="button" onClick={() => void j.remove(e.id)} disabled={j.busy !== ""} className={btnDanger} aria-label={`Delete the ${gameLabel(e.game)} match of ${e.playedOn}`}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
            {j.items.length > 200 && <p className={helper}>Showing the newest 200. The charts and the export use every match.</p>}
          </section>
        </>
      )}

      <section className={`${section} space-y-3`} aria-labelledby="jr-data-h">
        <h2 id="jr-data-h" className={h2}>Your data</h2>
        <p className="max-w-3xl text-zinc-300">Download your journal as a CSV file (made on this device), or delete it. It is also part of Download my data and is deleted with your account.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={j.exportCsv} disabled={j.items.length === 0} className={btnSecondary}>Download CSV</button>
          {!confirmClear ? (
            <button type="button" onClick={() => setConfirmClear(true)} disabled={j.items.length === 0} className={btnDanger}>Delete all matches</button>
          ) : (
            <div role="group" aria-label="Confirm deleting every match" className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-warning"><span aria-hidden="true">! </span>This deletes all {j.items.length} matches and cannot be undone.</span>
              <button type="button" onClick={() => { setConfirmClear(false); void j.clearAll(); }} className={btnDanger}>Yes, delete all</button>
              <button type="button" onClick={() => setConfirmClear(false)} className={btnSecondary}>Keep them</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
