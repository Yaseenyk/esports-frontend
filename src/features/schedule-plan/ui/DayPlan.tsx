"use client";

import { Fragment } from "react";
import NumberField from "@/components/tools/NumberField";
import { Field } from "@/features/shared/ui/Fields";
import { btnSecondary, input } from "@/features/shared/ui/styles";
import { MAX_COUNT, MAX_DAYS, MAX_STATIONS, MAX_TEAMS, SOURCES, type Source } from "@/features/schedule-plan/domain";
import { useDayPlan } from "@/features/schedule-plan/hooks/useDayPlan";
import ShareResult from "@/features/share-result/ui/ShareResult";
import { display12 } from "@/lib/schedule";

const PATH = "/tools/schedule/";

/**
 * The day-wise plan for college fests and multi-day events: matches from a bracket (or a plain count) placed on stations, day by day,
 * so no match starts before the matches that feed it are over. Changing values sit in their own elements for translated pages.
 */
export default function DayPlan() {
  const p = useDayPlan();
  const plan = p.check.ok ? p.check.plan : null;
  return (
    <div className="space-y-6">
      <section aria-labelledby="dp-src" className="space-y-4 rounded-xl border border-white/10 bg-surface p-4">
        <h3 id="dp-src" className="font-display text-lg text-zinc-100">Where do the matches come from?</h3>
        <Field id="dp-source" label="Matches">
          <select id="dp-source" value={p.source} onChange={(e) => p.setSource(e.target.value as Source)} className={input}>
            {SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.source === "count"
            ? <NumberField label="Number of matches" value={p.count} min={1} max={MAX_COUNT} onChange={p.setCount} hint="With no order between them." />
            : <NumberField label="Number of teams" value={p.teams} min={p.source === "double" ? 3 : 2} max={MAX_TEAMS} onChange={p.setTeams} hint={`Up to ${MAX_TEAMS}. Byes are added for you.`} />}
          <NumberField label="Minutes per match" value={p.duration} min={1} max={600} onChange={p.setDuration} />
          <NumberField label="Minutes between matches" value={p.gap} min={0} max={240} onChange={p.setGap} hint="Reset time on a station, and rest before a team plays again." />
          <NumberField label="Stations or lobbies" value={p.stations} min={1} max={MAX_STATIONS} onChange={p.setStations} hint="Matches that can run at the same time." />
        </div>
      </section>

      <section aria-labelledby="dp-days" className="space-y-4 rounded-xl border border-white/10 bg-surface p-4">
        <h3 id="dp-days" className="font-display text-lg text-zinc-100">Days and hours</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField label="Number of days" value={p.days.length} min={1} max={MAX_DAYS} onChange={p.setDayCount} />
          <Field id="dp-break" label="Daily break starts at"><input id="dp-break" type="time" value={p.breakAt} onChange={(e) => p.setBreakAt(e.target.value)} className={input} /></Field>
          <NumberField label="Break length (minutes)" value={p.breakMinutes} min={0} max={480} onChange={p.setBreakMinutes} hint="0 for no break." />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {p.days.map((d, i) => (
            <fieldset key={i} className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
              <legend className="text-sm font-medium text-zinc-100">Day {i + 1}</legend>
              <Field id={`dp-d${i}-s`} label="Starts"><input id={`dp-d${i}-s`} type="time" value={d.start} onChange={(e) => p.setDay(i, "start", e.target.value)} className={input} /></Field>
              <Field id={`dp-d${i}-e`} label="Ends by"><input id={`dp-d${i}-e`} type="time" value={d.end} onChange={(e) => p.setDay(i, "end", e.target.value)} className={input} /></Field>
            </fieldset>
          ))}
        </div>
      </section>

      <section aria-labelledby="dp-out" aria-live="polite" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="dp-out" className="font-display text-lg text-zinc-100">Day-wise schedule</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnSecondary} disabled={!plan || plan.placed.length === 0} onClick={p.csv}>Download (CSV)</button>
            <button type="button" className={btnSecondary} disabled={!plan} onClick={() => window.print()}>Print</button>
          </div>
        </div>
        {!p.check.ok ? (
          <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span><span key={p.check.error}>{p.check.error}</span></p>
        ) : plan && (
          <>
            <p className="text-sm text-zinc-300" data-testid="dp-summary">
              <span key={`${plan.placed.length}-${p.matches.length}`}><strong className="text-zinc-100">{plan.placed.length}</strong> of {p.matches.length} matches placed</span>
              {plan.days.filter((d) => d.matches > 0).map((d) => <span key={`${d.day}-${d.last}`}> · Day {d.day}: {d.matches} matches, {d.first} to {d.last}</span>)}
            </p>
            {plan.unplaced.length > 0 && (
              <p role="alert" className="text-sm text-warning"><span aria-hidden="true">! </span><span key={plan.unplaced.length}>{plan.unplaced.length} {plan.unplaced.length === 1 ? "match does" : "matches do"} not fit in the days given ({plan.unplaced.map((m) => m.id).join(", ")}). Add a day, a station or longer hours, or shorten the matches.</span></p>
            )}
            {/* One region, two layouts: a five-column table from the sm breakpoint, a stacked list on phones so "Who plays" has room. */}
            <div role="region" aria-label="Day-wise schedule table" tabIndex={0} className="rounded-xl border border-white/10">
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead><tr className="text-zinc-300"><th scope="col" className="px-3 py-2">Start</th><th scope="col" className="px-3 py-2">End</th><th scope="col" className="px-3 py-2">Station</th><th scope="col" className="px-3 py-2">Match</th><th scope="col" className="px-3 py-2">Who plays</th></tr></thead>
                  <tbody>
                    {plan.placed.map((x, k) => (
                      <Fragment key={x.match.id}>
                        {(k === 0 || plan.placed[k - 1]!.day !== x.day) && <tr className="border-t border-white/10"><th colSpan={5} scope="colgroup" className="px-3 py-2 text-left font-display text-cyan-400">Day {x.day}</th></tr>}
                        <tr className="border-t border-white/10" data-match={x.match.id} data-start={x.startText} data-end={x.endText} data-stage={x.match.stage}>
                          <td className="whitespace-nowrap px-3 py-2 font-mono text-zinc-100 tabular-nums"><time dateTime={x.startText}>{display12(x.startText)}</time></td>
                          <td className="whitespace-nowrap px-3 py-2 font-mono text-zinc-300 tabular-nums"><time dateTime={x.endText}>{display12(x.endText)}</time></td>
                          <td className="px-3 py-2 text-zinc-300">{x.station}</td>
                          <th scope="row" className="px-3 py-2 font-medium text-zinc-100">{x.match.id}{x.match.stage && <span className="block text-xs font-normal text-zinc-400">{x.match.stage}</span>}</th>
                          <td className="px-3 py-2 text-zinc-300">{x.match.label}</td>
                        </tr>
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              <ol className="divide-y divide-white/10 sm:hidden">
                {plan.placed.map((x, k) => (
                  <Fragment key={x.match.id}>
                    {(k === 0 || plan.placed[k - 1]!.day !== x.day) && <li className="px-3 py-2 font-display text-cyan-400">Day {x.day}</li>}
                    <li className="space-y-1 px-3 py-3" data-match={x.match.id} data-start={x.startText} data-end={x.endText} data-stage={x.match.stage}>
                      <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                        <span className="font-mono text-zinc-100 tabular-nums"><time dateTime={x.startText}>{display12(x.startText)}</time> to <time dateTime={x.endText}>{display12(x.endText)}</time></span>
                        <span className="text-xs text-zinc-400">Station {x.station}</span>
                      </p>
                      <p className="text-sm font-medium text-zinc-100">{x.match.id}{x.match.stage && <span className="font-normal text-zinc-400"> · {x.match.stage}</span>}</p>
                      <p className="text-sm text-zinc-300">{x.match.label}</p>
                    </li>
                  </Fragment>
                ))}
              </ol>
            </div>
            <p className="text-xs leading-5 text-zinc-400">A match never starts before the matches it waits for are over, plus the gap. Seeds and team numbers are placeholders: write in your teams after the draw. A grand final reset is planned in case it is needed.</p>
          </>
        )}
        <ShareResult payload={p.payload} what="schedule" path={PATH} />
      </section>
    </div>
  );
}
