"use client";

import { useEffect, useMemo, useState } from "react";
import { brFormFor, nextBrMatchNo, parseScore, validateBr, type BrBody, type BrRowInput } from "@/lib/scorer";
import type { BrRow } from "@/lib/api/f-scorer";
import type { SheetAsk } from "./ConfirmSheet";

/** Battle royale entry: pick the match number, then a placement and kills for each team that played. Duplicate placements are caught before anything is sent. */
export default function BrEntry({ teams, saved, pendingNos, onSend, onAsk }: {
  teams: string[];
  saved: BrRow[];
  pendingNos: number[];
  onSend: (body: BrBody, label: string) => void;
  onAsk: (a: SheetAsk) => void;
}) {
  const [no, setNo] = useState(() => nextBrMatchNo(saved));
  const [rows, setRows] = useState<BrRowInput[]>(() => brFormFor(teams, saved, no));
  const [dirty, setDirty] = useState(false);
  const [tried, setTried] = useState(false);
  const teamKey = teams.join("|");
  const savedKey = saved.map((s) => `${s.matchNo}:${s.team}:${s.placement}:${s.kills}`).join(",");
  useEffect(() => { if (!dirty) setRows(brFormFor(teams, saved, no)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [no, teamKey, savedKey, dirty]);

  const check = useMemo(() => validateBr(rows, teams.length), [rows, teams.length]);
  const hasSaved = saved.some((s) => s.matchNo === no);
  const move = (n: number) => { setNo(Math.min(9999, Math.max(1, n))); setDirty(false); setTried(false); };
  const set = (team: string, patch: Partial<BrRowInput>) => { setRows((r) => r.map((x) => (x.team === team ? { ...x, ...patch } : x))); setDirty(true); };

  if (teams.length === 0) return (
    <section className="card space-y-2 !p-4" aria-label="Battle royale">
      <h2 className="font-display text-xl font-bold text-white">Battle royale results</h2>
      <p className="text-base text-zinc-300">There are no teams in this event yet, so there is nothing to enter. Ask the organiser to add the teams first.</p>
    </section>
  );

  const save = () => {
    setTried(true);
    if (!check.ok) return;
    onAsk({
      title: `Match ${no}: ${check.rows.length} team${check.rows.length === 1 ? "" : "s"}, save?`,
      detail: `${check.rows.slice(0, 3).map((r) => `${r.placement}. ${r.team} (${r.kills} kills)`).join(", ")}${check.rows.length > 3 ? ", and more" : ""}. ${hasSaved ? "This replaces what was saved for this match number." : ""}`.trim(),
      confirmLabel: "Save results",
      run: () => { onSend({ matchNo: no, rows: check.rows }, `Battle royale match ${no}, ${check.rows.length} teams`); setDirty(false); setTried(false); },
    });
  };

  return (
    <section aria-label="Battle royale" className="space-y-4">
      <div className="card space-y-3 !p-4">
        <h2 className="font-display text-xl font-bold text-white">Battle royale results</h2>
        <p className="text-base leading-6 text-zinc-300">Pick the match number, then give each team that played its finishing place (1 is the winner) and its kills. Leave a team empty if it did not play.</p>
        <div className="flex items-center gap-2">
          <span id="br-no" className="flex-1 text-lg font-bold text-white">Match number</span>
          <button type="button" aria-label="Previous match number" className="btn-ghost !min-h-14 !w-14 !px-0 text-3xl" onClick={() => move(no - 1)}>−</button>
          <output aria-labelledby="br-no" className="w-14 text-center text-3xl font-extrabold text-white">{no}</output>
          <button type="button" aria-label="Next match number" className="btn !min-h-14 !w-14 !px-0 text-3xl" onClick={() => move(no + 1)}>+</button>
        </div>
        {hasSaved && <p className="text-sm text-emerald-300">✓ Results for match {no} are saved. You can change them below.</p>}
        {pendingNos.includes(no) && <p role="status" className="rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">Saved on this phone, will send when online.</p>}
      </div>

      <ul className="space-y-2">
        {rows.map((r) => {
          const err = tried ? check.errors[r.team] : undefined;
          return (
            <li key={r.team} className={`rounded-xl border p-3 ${err ? "border-amber-300/70 bg-amber-300/5" : "border-zinc-800 bg-zinc-900/50"}`}>
              <p className="break-words text-base font-bold text-white">{r.team}</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <label className="block text-sm font-semibold text-zinc-200">Place
                  <input inputMode="numeric" pattern="[0-9]*" maxLength={3} value={r.placement} onChange={(e) => set(r.team, { placement: parseScore(e.target.value)?.toString() ?? "" })} onFocus={(e) => e.target.select()} aria-label={`${r.team} placement`} aria-invalid={!!err} className="mt-1 h-12 w-full rounded-lg border border-zinc-600 bg-zinc-900 text-center text-2xl font-extrabold text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan" />
                </label>
                <label className="block text-sm font-semibold text-zinc-200">Kills
                  <input inputMode="numeric" pattern="[0-9]*" maxLength={2} value={r.kills} onChange={(e) => set(r.team, { kills: parseScore(e.target.value)?.toString() ?? "" })} onFocus={(e) => e.target.select()} aria-label={`${r.team} kills`} aria-invalid={!!err} className="mt-1 h-12 w-full rounded-lg border border-zinc-600 bg-zinc-900 text-center text-2xl font-extrabold text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan" />
                </label>
              </div>
              {err && <p role="alert" className="mt-2 text-sm font-semibold text-amber-200">{err}</p>}
            </li>
          );
        })}
      </ul>

      {tried && check.message && <p role="alert" className="text-base font-semibold text-amber-200">{check.message}</p>}
      <button type="button" className="btn w-full !min-h-14 text-lg" onClick={save}>Save match {no}</button>
      <p className="text-sm text-zinc-300">Nothing is sent until you confirm.</p>
    </section>
  );
}
