"use client";

import { matchLabel, MAX_CORRECTIONS, oldValueText, type CorrectionDraft, type CurrentResults, type DraftErrors, type DraftKind } from "@/features/disputes/corrections";
import type { CurrentState } from "@/features/disputes/hooks/useCorrections";
import { SelectInput, TextInput } from "@/features/shared/ui/Fields";
import { btnSecondary, h3 } from "@/features/shared/ui/styles";

interface Props {
  drafts: readonly CorrectionDraft[]; errors: Record<string, DraftErrors>; general: string; current: CurrentResults | null; state: CurrentState; full: boolean;
  onAdd: (kind: DraftKind) => void; onChange: (key: string, patch: Partial<CorrectionDraft>) => void; onRemove: (key: string) => void;
}

const digits = (v: string): string => v.replace(/\D/g, "").slice(0, 6);

function Row({ d, n, e, current, onChange, onRemove }: { d: CorrectionDraft; n: number; e: DraftErrors; current: CurrentResults | null; onChange: (patch: Partial<CorrectionDraft>) => void; onRemove: () => void }) {
  const id = `c-${d.key}`;
  const old = oldValueText(d, current);
  const m = current?.matches.find((x) => x.id === d.matchId);
  const teams = current ? Array.from(new Set(current.br.filter((r) => String(r.matchNo) === d.matchNo.trim()).map((r) => r.team))) : [];
  const winners = [{ value: "a", label: m ? `${m.a} (side A)` : "Side A" }, { value: "b", label: m ? `${m.b} (side B)` : "Side B" }, { value: "draw", label: "Draw" }];
  return (
    <fieldset className="space-y-3 rounded-lg border border-white/10 p-3">
      <legend className="px-1 text-sm font-medium text-zinc-100">Correction {n}: {d.kind === "match" ? "head-to-head match" : "battle royale result"}</legend>
      {d.kind === "match" ? (
        <>
          {current && current.matches.length > 0
            ? <SelectInput id={`${id}-match`} label={`Match (correction ${n})`} value={d.matchId} onChange={(v) => onChange({ matchId: v })} options={current.matches.map((x) => ({ value: x.id, label: matchLabel(x) }))} blank="Choose the match" error={e.matchId} />
            : <TextInput id={`${id}-match`} label={`Match id (correction ${n})`} value={d.matchId} onChange={(v) => onChange({ matchId: v.trim() })} error={e.matchId} help="The id of the match in the event's results." />}
          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput id={`${id}-sa`} label={`New score, side A (correction ${n})`} value={d.scoreA} onChange={(v) => onChange({ scoreA: digits(v) })} inputMode="numeric" error={e.scoreA} />
            <TextInput id={`${id}-sb`} label={`New score, side B (correction ${n})`} value={d.scoreB} onChange={(v) => onChange({ scoreB: digits(v) })} inputMode="numeric" error={e.scoreB} />
            <SelectInput id={`${id}-win`} label={`New winner (correction ${n})`} value={d.winner} onChange={(v) => onChange({ winner: v as CorrectionDraft["winner"] })} options={winners} blank="Choose" error={e.winner} />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput id={`${id}-no`} label={`Match number (correction ${n})`} value={d.matchNo} onChange={(v) => onChange({ matchNo: digits(v).slice(0, 5) })} inputMode="numeric" error={e.matchNo} />
            {teams.length > 0
              ? <SelectInput id={`${id}-team`} label={`Team (correction ${n})`} value={d.team} onChange={(v) => onChange({ team: v })} options={teams.map((t) => ({ value: t, label: t }))} blank="Choose the team" error={e.team} />
              : <TextInput id={`${id}-team`} label={`Team (correction ${n})`} value={d.team} onChange={(v) => onChange({ team: v })} error={e.team} help="Exactly as written in the results." />}
            <TextInput id={`${id}-pl`} label={`New placement (correction ${n})`} value={d.placement} onChange={(v) => onChange({ placement: digits(v).slice(0, 3) })} inputMode="numeric" error={e.placement} help="1 to 100." />
            <TextInput id={`${id}-k`} label={`New kills (correction ${n})`} value={d.kills} onChange={(v) => onChange({ kills: digits(v).slice(0, 3) })} inputMode="numeric" error={e.kills} help="0 to 200." />
          </div>
        </>
      )}
      <p className="text-sm text-zinc-300"><span className="font-medium text-zinc-100">Current value:</span> {old ?? "not shown here. The server records the value being replaced when you save."}</p>
      <button type="button" onClick={onRemove} className={btnSecondary}>Remove correction {n}</button>
    </fieldset>
  );
}

/** Presentation only. The drafts, their errors and the current results come in as props. */
export function CorrectionsEditor({ drafts, errors, general, current, state, full, onAdd, onChange, onRemove }: Props) {
  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <h3 className={h3}>Result corrections (optional)</h3>
      <p className="text-sm text-zinc-300">If this decision changes a score or a placement, enter the new value here. The old result is never overwritten: both values are kept and the public page marks the result as corrected.</p>
      {state === "loading" && <p role="status" className="text-sm text-zinc-400">Loading the current results.</p>}
      {state === "error" && <p role="status" className="text-sm text-warning"><span aria-hidden="true">! </span>The current results could not be loaded, so old values are not shown. You can still enter corrections.</p>}
      {state === "none" && <p className="text-sm text-zinc-400">Open this dispute from your tournament&apos;s disputes queue to see the current results beside each correction.</p>}
      {drafts.map((d, i) => <Row key={d.key} d={d} n={i + 1} e={errors[d.key] ?? {}} current={current} onChange={(p) => onChange(d.key, p)} onRemove={() => onRemove(d.key)} />)}
      {general && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{general}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => onAdd("match")} disabled={full} className={btnSecondary}>Add a head-to-head correction</button>
        <button type="button" onClick={() => onAdd("br")} disabled={full} className={btnSecondary}>Add a battle royale correction</button>
      </div>
      {full && <p className="text-xs text-zinc-400">At most {MAX_CORRECTIONS} corrections in one decision.</p>}
    </div>
  );
}
