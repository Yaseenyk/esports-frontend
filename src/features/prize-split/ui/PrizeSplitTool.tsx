"use client";

import { Field, describedBy } from "@/features/shared/ui/Fields";
import { btnSecondary, input } from "@/features/shared/ui/styles";
import { RULES, grouped, ordinal, type Rule, type SlotMode } from "@/features/prize-split/domain";
import { usePrizeSplit } from "@/features/prize-split/hooks/usePrizeSplit";
import ShareResult from "@/features/share-result/ui/ShareResult";

const PATH = "/tools/prize-split/";
const numBox = `${input} font-mono tabular-nums`;

/** Counts get the digits keypad (numeric); only percentages, which can have a decimal point, get the decimal keypad. */
function Num({ id, label, value, onChange, help, small, decimal = false }: { id: string; label: string; value: string; onChange: (v: string) => void; help?: string; small?: boolean; decimal?: boolean }) {
  return (
    <Field id={id} label={label} help={help}>
      <input id={id} type="text" inputMode={decimal ? "decimal" : "numeric"} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={describedBy(id, help)} className={small ? `${numBox} w-24` : numBox} />
    </Field>
  );
}

function Problem({ text }: { text: string }) {
  return <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span><span key={text}>{text}</span></p>;
}

/** Slot and prize split calculator: two small calculators, maths only. Nothing is stored and no money is handled. */
export default function PrizeSplitTool() {
  const s = usePrizeSplit();
  return (
    <div className="space-y-8">
      <section aria-labelledby="ps-slots" className="space-y-4">
        <h3 id="ps-slots" className="font-display text-lg text-zinc-100">Split qualification slots across groups</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Num id="ps-slot-n" label="Slots to give out" value={s.slots} onChange={s.setSlots} help="For example 16 places in the final." />
          <Num id="ps-groups" label="Number of groups or lobbies" value={s.groups} onChange={s.setGroups} help="Up to 64." />
        </div>
        <div role="group" aria-label="How to split" className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-100">Split:</span>
          {([["even", "As evenly as possible"], ["bySize", "By group size"]] as [SlotMode, string][]).map(([id, label]) => <button key={id} type="button" className="chip" aria-pressed={s.mode === id} onClick={() => s.setMode(id)}>{label}</button>)}
        </div>
        {s.mode === "bySize" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {s.sizeList.map((v, i) => <Num key={i} id={`ps-size-${i}`} label={`Teams in group ${i < 26 ? String.fromCharCode(65 + i) : i + 1}`} value={v} onChange={(x) => s.setSize(i, x)} small />)}
          </div>
        )}
        <div aria-live="polite" className="space-y-3">
          {!s.slotCheck.ok ? <Problem text={s.slotCheck.error} /> : (
            <>
              <div role="region" aria-label="Slots per group" tabIndex={0} className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full border-collapse text-left text-sm">
                  <thead><tr className="text-zinc-300"><th scope="col" className="px-3 py-2">Group</th>{s.mode === "bySize" && <th scope="col" className="px-3 py-2">Teams</th>}<th scope="col" className="px-3 py-2">Slots</th></tr></thead>
                  <tbody>
                    {s.slotCheck.groups.map((g) => (
                      <tr key={g.group} className="border-t border-white/10">
                        <th scope="row" className="px-3 py-2 font-medium text-zinc-100">{g.group}</th>
                        {s.mode === "bySize" && <td className="px-3 py-2 font-mono text-zinc-300 tabular-nums">{g.teams}</td>}
                        <td className="px-3 py-2 font-mono text-cyan-400 tabular-nums" data-testid="ps-slot"><span key={g.slots}>{g.slots}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-zinc-300">Total: <strong className="font-mono text-zinc-100 tabular-nums" data-testid="ps-slot-total"><span key={s.slotCheck.groups.length}>{s.slotCheck.groups.reduce((a, g) => a + g.slots, 0)}</span></strong> slots.</p>
              {s.slotCheck.note && <p className="text-xs leading-5 text-zinc-400"><span key={s.slotCheck.note}>{s.slotCheck.note}</span></p>}
            </>
          )}
          <div className="flex flex-wrap gap-3"><button type="button" className={btnSecondary} disabled={!s.slotCheck.ok} onClick={s.csvSlots}>Download slots (CSV)</button></div>
          <ShareResult payload={s.slotPayload} what="slot split" path={PATH} label="Share the slot split" />
        </div>
      </section>

      <section aria-labelledby="ps-pool" className="space-y-4 border-t border-white/10 pt-6">
        <h3 id="ps-pool" className="font-display text-lg text-zinc-100">If your event has a prize pool, split it across places</h3>
        <p className="text-sm text-zinc-300">This only does the maths on a number you type. It does not collect, hold or send any money, and the figure has no currency attached.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Num id="ps-pool-n" label="Figure to split" value={s.pool} onChange={s.setPool} help="Digits only, for example 10000." />
          <Num id="ps-places" label="Places that get a share" value={s.places} onChange={s.setPlaces} help="1 to 32." />
          <Field id="ps-unit" label="Round each share to">
            <select id="ps-unit" value={s.unit} onChange={(e) => s.setUnit(e.target.value)} className={input}>
              {["1", "5", "10", "50", "100", "500", "1000"].map((u) => <option key={u} value={u}>{u === "1" ? "Whole numbers" : `Multiples of ${u}`}</option>)}
            </select>
          </Field>
        </div>
        <div role="group" aria-label="Split rule" className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-100">Rule:</span>
          {RULES.map((r) => <button key={r.id} type="button" className="chip" aria-pressed={s.rule === r.id} onClick={() => s.setRule(r.id as Rule)}>{r.label}</button>)}
        </div>
        <p className="text-xs text-zinc-400"><span key={s.rule}>{RULES.find((r) => r.id === s.rule)?.help}</span></p>
        {s.rule === "custom" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {s.percentList.map((v, i) => <Num key={i} id={`ps-pct-${i}`} label={`${ordinal(i + 1)} place (%)`} value={v} onChange={(x) => s.setPercent(i, x)} small decimal />)}
            </div>
            <p className="text-xs text-zinc-400">Adds up to <span className="font-mono tabular-nums" key={s.percentSum}>{Math.round(s.percentSum * 1000) / 1000}</span>%.</p>
          </div>
        )}
        <div aria-live="polite" className="space-y-3">
          {!s.poolCheck.ok ? <Problem text={s.poolCheck.error} /> : (
            <>
              <div role="region" aria-label="Share per place" tabIndex={0} className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full border-collapse text-left text-sm">
                  <thead><tr className="text-zinc-300"><th scope="col" className="px-3 py-2">Place</th><th scope="col" className="px-3 py-2">Percent</th><th scope="col" className="px-3 py-2">Share</th></tr></thead>
                  <tbody>
                    {s.poolCheck.places.map((x) => (
                      <tr key={x.place} className="border-t border-white/10">
                        <th scope="row" className="px-3 py-2 font-medium text-zinc-100">{ordinal(x.place)}</th>
                        <td className="px-3 py-2 font-mono text-zinc-300 tabular-nums"><span key={x.percent}>{x.percent}</span>%</td>
                        <td className="px-3 py-2 font-mono text-cyan-400 tabular-nums" data-testid="ps-share"><span key={x.share}>{grouped(x.share)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-zinc-300">Total: <strong className="font-mono text-zinc-100 tabular-nums" data-testid="ps-pool-total"><span key={s.poolCheck.total}>{grouped(s.poolCheck.total)}</span></strong>, the same as the figure you typed.</p>
              {s.poolCheck.note && <p className="text-xs leading-5 text-zinc-400"><span key={s.poolCheck.note}>{s.poolCheck.note}</span></p>}
            </>
          )}
          <div className="flex flex-wrap gap-3"><button type="button" className={btnSecondary} disabled={!s.poolCheck.ok} onClick={s.csvPool}>Download split (CSV)</button></div>
          <ShareResult payload={s.poolPayload} what="prize split" path={PATH} label="Share the prize split" />
        </div>
      </section>
    </div>
  );
}
