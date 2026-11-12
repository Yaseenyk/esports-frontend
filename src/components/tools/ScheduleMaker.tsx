"use client";

import { Fragment, useMemo, useState } from "react";
import { sendEvent } from "@/lib/track";
import ToolStep from "./ToolStep";
import ScreenButtons from "@/components/display/ScreenButtons";
import NumberField from "./NumberField";
import { scheduleView } from "@/lib/display-views";
import { downloadBlob } from "@/lib/idcard/download";
import { buildSchedule, summary, type ScheduleInput } from "@/lib/schedule";

/** Free match schedule and run-sheet maker. Everything is worked out in the browser. */
export default function ScheduleMaker() {
  const [i, setI] = useState<ScheduleInput>({ start: "10:00", matches: 19, duration: 40, gap: 10, lobbies: 4, breakEvery: 3, breakLength: 30 });
  const slots = useMemo(() => buildSchedule(i), [i]);
  const sum = slots ? summary(i, slots) : null;
  const screen = useMemo(() => (slots ? scheduleView(slots) : null), [slots]);
  const field = (k: keyof ScheduleInput, label: string, min: number, max: number, hint?: string) => (
    <NumberField label={label} value={i[k] as number} min={min} max={max} hint={hint} onChange={(n) => setI((x) => ({ ...x, [k]: n }))} />
  );
  const csv = () => {
    if (!slots) return;
    const q = (c: unknown) => `"${String(c).replace(/"/g, '""')}"`;
    const rows = [["Slot", "Start", "End", "Matches", "Break after (min)"], ...slots.map((s) => [s.slot, s.start, s.end, s.matches.map((m) => `M${m}`).join(" "), s.breakAfter || ""])];
    downloadBlob(new Blob([rows.map((r) => r.map(q).join(",")).join("\r\n")], { type: "text/csv" }), "schedule.csv"); sendEvent("tool_complete", "schedule");
  };

  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const defaultsNote = `Right now: ${i.lobbies} match${i.lobbies === 1 ? "" : "es"} at a time, ${plural(i.gap, "minute")} between rounds, ${i.breakEvery > 0 && i.breakLength > 0 ? `and a ${i.breakLength}-minute break after every ${i.breakEvery === 1 ? "round" : `${i.breakEvery} rounds`}` : "and no longer breaks"}.`;

  return (
    <div className="space-y-5">
      <ToolStep n={1} id="sc-when" title="When does it start, and how many matches?" done={!!slots}
        hint="Type the time the first match begins, how many matches you will play in total, and how long one match takes."
        status={sum ? `${i.matches} match${i.matches === 1 ? "" : "es"}` : undefined}>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm text-zinc-200">First match starts at<input className="field mt-1" type="time" value={i.start} onChange={(e) => setI((x) => ({ ...x, start: e.target.value }))} /></label>
          {field("matches", "Number of matches", 1, 500, "In total, across the whole event")}
          {field("duration", "Minutes per match", 1, 600, "How long one match usually lasts")}
        </div>
      </ToolStep>

      <ToolStep n={2} id="sc-more" title="Rooms and breaks" hint="Already sensible. Open this only if you play several matches at once, or want longer breaks.">
        <details className="group rounded-xl border border-white/10 bg-[#0a0b0d]">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan [&::-webkit-details-marker]:hidden">
            <span>More options <span className="font-normal text-zinc-300">· {defaultsNote}</span></span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 fill-none stroke-current text-zinc-400 transition-transform group-open:rotate-180" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5" /></svg>
          </summary>
          <div className="grid gap-4 border-t border-white/10 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {field("lobbies", "Matches at the same time", 1, 100, "Rooms, lobbies or game stations used together. 1 means one match at a time.")}
            {field("gap", "Minutes between rounds", 0, 120, "Time to join, report results and reset")}
            {field("breakEvery", "Longer break after every", 0, 50, "Rounds. Type 0 for no longer breaks")}
            {field("breakLength", "Longer break (minutes)", 0, 240, "For food or a rest")}
          </div>
        </details>
      </ToolStep>

      <ToolStep n={3} id="sc-sheet" title="Your run-sheet"
        hint="This is your timetable: each round, when it starts and ends, and which matches are played. Download it or print it and share it with the teams."
        status={sum ? `Ends ${sum.finish}` : undefined}
        actions={<><button type="button" className="btn-ghost !min-h-11 px-3 text-sm" disabled={!slots} onClick={csv}>Download (CSV)</button><button type="button" className="btn-ghost !min-h-11 px-3 text-sm no-print" disabled={!slots} onClick={() => window.print()}>Print</button></>}
        printHeader>
        <div aria-label="Schedule" aria-live="polite" role="group" className="space-y-3">
        {!slots || !sum ? <p role="alert" className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-red-300">Choose a start time to see the schedule.</p> : (
          <>
            <p className="text-sm text-zinc-200"><strong className="text-white">{sum.slots} rounds</strong>, finishing at <strong className="text-white">{sum.finish}</strong>. That is {Math.floor(sum.totalMinutes / 60)} h {sum.totalMinutes % 60} min from the first start.{sum.finish.includes("(+") ? " A time marked (+1d) is after midnight, on the next day (+2d is the day after that)." : ""}</p>
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
            <p className="text-xs text-zinc-400 print:hidden">Matches are numbered M1, M2 and so on. Match them to your bracket, groups or rooms. Leave slack: matches nearly always run longer than planned.</p>
          </>
        )}
        </div>
      </ToolStep>
      <div className="no-print"><ScreenButtons payload={screen} what="schedule" step={4} /></div>
    </div>
  );
}
