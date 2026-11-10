"use client";

import { Fragment, useMemo, useState } from "react";
import { downloadBlob } from "@/lib/idcard/download";
import { buildSchedule, summary, type ScheduleInput } from "@/lib/schedule";

const toInt = (v: string, min: number, max: number) => Math.min(max, Math.max(min, Math.floor(Number(v) || 0)));

/** Free match schedule and run-sheet maker. Everything is worked out in the browser. */
export default function ScheduleMaker() {
  const [i, setI] = useState<ScheduleInput>({ start: "10:00", matches: 19, duration: 40, gap: 10, lobbies: 4, breakEvery: 3, breakLength: 30 });
  const slots = useMemo(() => buildSchedule(i), [i]);
  const sum = slots ? summary(i, slots) : null;
  const field = (k: keyof ScheduleInput, label: string, min: number, max: number, hint?: string) => (
    <label className="block text-sm text-zinc-200">{label}<input className="field mt-1" type="number" min={min} max={max} value={i[k] as number} onChange={(e) => setI({ ...i, [k]: toInt(e.target.value, min, max) })} />{hint && <span className="mt-1 block text-xs text-zinc-400">{hint}</span>}</label>
  );
  const csv = () => {
    if (!slots) return;
    const q = (c: unknown) => `"${String(c).replace(/"/g, '""')}"`;
    const rows = [["Slot", "Start", "End", "Matches", "Break after (min)"], ...slots.map((s) => [s.slot, s.start, s.end, s.matches.map((m) => `M${m}`).join(" "), s.breakAfter || ""])];
    downloadBlob(new Blob([rows.map((r) => r.map(q).join(",")).join("\r\n")], { type: "text/csv" }), "schedule.csv");
  };

  return (
    <div className="space-y-6">
      <section className="card space-y-4" aria-label="Schedule settings">
        <h3 className="font-display text-lg font-bold text-white">1. Your event</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm text-zinc-200">First match starts at<input className="field mt-1" type="time" value={i.start} onChange={(e) => setI({ ...i, start: e.target.value })} /></label>
          {field("matches", "Number of matches", 1, 500)}
          {field("lobbies", "Matches at the same time", 1, 100, "Lobbies, rooms or stations")}
          {field("duration", "Minutes per match", 1, 600)}
          {field("gap", "Minutes between rounds", 0, 120, "Joining, results, resetting")}
          {field("breakEvery", "Longer break after every", 0, 50, "Rounds. 0 for none")}
          {field("breakLength", "Longer break (minutes)", 0, 240)}
        </div>
      </section>

      <section className="card space-y-3" aria-label="Schedule" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-white">2. Your schedule</h3>
          <div className="flex gap-2"><button type="button" className="btn-ghost !min-h-9 px-3 text-sm" disabled={!slots} onClick={csv}>Download (CSV)</button></div>
        </div>
        {!slots || !sum ? <p role="alert" className="text-sm text-red-300">Check the start time and make sure every number is a whole number of at least 1 (gaps and breaks can be 0).</p> : (
          <>
            <p className="text-sm text-zinc-200"><strong className="text-white">{sum.slots} rounds</strong>, finishing at <strong className="text-white">{sum.finish}</strong>. That is {Math.floor(sum.totalMinutes / 60)} h {sum.totalMinutes % 60} min from the first start.</p>
            <div>
              
              <div role="region" aria-label="Schedule table" tabIndex={0} className="overflow-x-auto rounded-xl border border-white/[0.14] outline-none focus-visible:ring-2 focus-visible:ring-cyan">
                <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                  <thead><tr className="bg-[#0f1013] text-zinc-200"><th scope="col" className="px-3 py-2">Round</th><th scope="col" className="px-3 py-2">Start</th><th scope="col" className="px-3 py-2">End</th><th scope="col" className="px-3 py-2">Matches</th></tr></thead>
                  <tbody>
                    {slots.map((s) => (
                      <Fragment key={s.slot}>
                        <tr className="border-t border-white/[0.08]"><th scope="row" className="px-3 py-2 font-bold text-cyan">{s.slot}</th><td className="px-3 py-2 text-white">{s.start}</td><td className="px-3 py-2 text-zinc-300">{s.end}</td><td className="px-3 py-2 text-zinc-300">{s.matches.map((m) => `M${m}`).join(", ")}</td></tr>
                        {s.breakAfter > 0 && <tr className="border-t border-white/[0.08] bg-[#0c0d10]"><td colSpan={4} className="px-3 py-2 text-xs text-amber-200">Break: {s.breakAfter} minutes</td></tr>}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-zinc-400">Matches are numbered M1, M2 and so on. Match them to your bracket, groups or lobbies. Leave slack: matches nearly always run longer than planned.</p>
          </>
        )}
      </section>
    </div>
  );
}
