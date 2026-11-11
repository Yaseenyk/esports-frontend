"use client";

import NumberField from "@/components/tools/NumberField";
import { clampSettings, maxGroups, type StageSettings } from "@/lib/stages";

/**
 * The choices for groups then knockout: how many groups and how many teams go through from each. Plain defaults are already set, so a first-time
 * visitor can skip straight on. Pots and "best third-placed teams" are tucked under More options.
 */
export default function SettingsFields({ n, value, onChange, showGroups = true }: { n: number; value: StageSettings; onChange: (s: StageSettings) => void; showGroups?: boolean }) {
  const v = clampSettings(n, value);
  const set = (p: Partial<StageSettings>) => onChange(clampSettings(n, { ...v, ...p }));
  const smallest = Math.floor(n / v.groups);
  const biggest = Math.ceil(n / v.groups);
  const sizeText = smallest === biggest ? `${smallest} teams in each group` : `${smallest} or ${biggest} teams in each group`;
  const total = v.groups * v.advance + v.thirds;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        {showGroups && <NumberField className="block text-sm text-zinc-200" inputClassName="!w-28" label="How many groups?" value={v.groups} min={2} max={Math.max(2, maxGroups(n))} onChange={(groups) => set({ groups })} hint={`2 to ${Math.max(2, maxGroups(n))} for your teams`} />}
        <NumberField className="block text-sm text-zinc-200" inputClassName="!w-28" label="How many go through from each group?" value={v.advance} min={1} max={Math.max(1, Math.min(4, smallest))} onChange={(advance) => set({ advance })} hint="1 to 4" />
      </div>
      <p className="text-sm text-zinc-200" aria-live="polite">
        {showGroups ? <>{v.groups} groups, {sizeText}. In a group every team plays every other team once. </> : null}
        The top {v.advance} of each group go to the knockout{v.thirds > 0 ? `, plus the ${v.thirds} best of the teams just below` : ""}: <b className="text-white">{total} teams in the knockout</b>. In a knockout, lose once and you are out.
      </p>
      <details className="group rounded-xl border border-white/10 bg-[#0a0b0d]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan [&::-webkit-details-marker]:hidden">
          <span>More options</span>
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 fill-none stroke-current text-zinc-400 transition-transform group-open:rotate-180" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5" /></svg>
        </summary>
        <div className="space-y-4 border-t border-white/10 p-4">
          {showGroups && (
            <div>
              <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-200"><input type="checkbox" checked={v.mode === "snake"} onChange={(e) => set({ mode: e.target.checked ? "snake" : "deal" })} className="h-5 w-5 accent-cyan" />Use pots (list your best teams first)</label>
              <p className="mt-1 text-xs leading-5 text-zinc-400">With pots, the best teams in your list are spread out: the first {v.groups} teams go one into each group, the next {v.groups} go one into each group the other way round, and so on. Leave it off to deal the teams out in the order you typed them.</p>
            </div>
          )}
          <NumberField className="block text-sm text-zinc-200" inputClassName="!w-28" label="Extra teams: best of those just below" value={v.thirds} min={0} max={Math.max(0, Math.min(v.groups - 1, smallest > v.advance ? v.groups - 1 : 0))} onChange={(thirds) => set({ thirds })}
            hint={smallest > v.advance ? "Best third-placed teams: the teams that finished just below the cut are compared across groups, and the best few also go through." : "Groups are too small for this."} />
        </div>
      </details>
    </div>
  );
}
