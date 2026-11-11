"use client";

import { LIMITS, STATUSES, STATUS_LABEL, dayText, type RosItem, type RosStatus } from "@/lib/runofshow";

export const field = "min-h-11 w-full min-w-0 rounded-lg border border-zinc-700 bg-[#0a0b0d] px-3 text-base text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan";

const chip = (on: boolean) => `min-h-11 rounded-full border px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-cyan ${on ? "border-cyan bg-cyan text-ink" : "border-zinc-700 text-zinc-100 hover:border-zinc-500"}`;

/** Three status buttons. The chosen one is marked by a tick and by colour, so colour is never the only signal. */
export function StatusChips({ value, onPick, label }: { value: RosStatus; onPick: (s: RosStatus) => void; label: string }) {
  return (
    <div role="group" aria-label={`Status of ${label}`} className="flex flex-wrap gap-2">
      {STATUSES.map((s) => <button key={s} type="button" aria-pressed={value === s} onClick={() => onPick(s)} className={chip(value === s)}>{value === s ? "✓ " : ""}{STATUS_LABEL[s]}</button>)}
    </div>
  );
}

/** One editable line of the timeline. */
export default function ItemRow({ item, index, count, onChange, onStatus, onMove, onDelete }: {
  item: RosItem; index: number; count: number;
  onChange: (patch: Partial<RosItem>) => void; onStatus: (s: RosStatus) => void; onMove: (dir: -1 | 1) => void; onDelete: () => void;
}) {
  const n = index + 1, name = item.title.trim() || `item ${n}`;
  return (
    <li className="space-y-2 rounded-xl border border-white/10 bg-[#0a0b0d] p-3">
      <div className="flex flex-wrap gap-2">
        <label className="w-32 shrink-0"><span className="mb-1 block text-xs font-semibold text-zinc-300">Time</span><input type="time" value={item.atTime} onChange={(e) => onChange({ atTime: e.target.value })} className={field} aria-label={`Time of ${name}`} /></label>
        <label className="min-w-[10rem] flex-1"><span className="mb-1 block text-xs font-semibold text-zinc-300">What happens</span><input value={item.title} maxLength={LIMITS.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="For example: Captains' briefing" className={field} aria-label={`What happens at item ${n}`} /></label>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="min-w-[10rem] flex-1"><span className="mb-1 block text-xs font-semibold text-zinc-300">Who is responsible</span><input value={item.ownerName} maxLength={LIMITS.owner} onChange={(e) => onChange({ ownerName: e.target.value })} placeholder="A name. They need no account." className={field} aria-label={`Owner of ${name}`} /></label>
        <label className="w-28 shrink-0"><span className="mb-1 block text-xs font-semibold text-zinc-300">Day</span>
          <select value={item.dayOffset} onChange={(e) => onChange({ dayOffset: Number(e.target.value) })} className={field} aria-label={`Day of ${name}`}>
            {Array.from({ length: Math.max(3, item.dayOffset + 1) }, (_, d) => <option key={d} value={d}>{d === 0 ? "Event day" : dayText(d)}</option>)}
          </select>
        </label>
      </div>
      <StatusChips value={item.status} onPick={onStatus} label={name} />
      <label className="block"><span className="mb-1 block text-xs font-semibold text-zinc-300">Notes (optional)</span><input value={item.notes} maxLength={LIMITS.notes} onChange={(e) => onChange({ notes: e.target.value })} placeholder="Anything the owner should know" className={field} aria-label={`Notes for ${name}`} /></label>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-ghost !min-h-11 px-3 text-sm" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move ${name} up`}>↑ Up</button>
        <button type="button" className="btn-ghost !min-h-11 px-3 text-sm" disabled={index === count - 1} onClick={() => onMove(1)} aria-label={`Move ${name} down`}>↓ Down</button>
        <button type="button" className="btn-ghost !min-h-11 px-3 text-sm" onClick={onDelete} aria-label={`Delete ${name}`}>Delete</button>
      </div>
    </li>
  );
}
