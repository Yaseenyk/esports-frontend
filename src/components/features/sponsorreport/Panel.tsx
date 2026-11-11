"use client";

import { useId, useMemo, useState } from "react";
import type { PanelProps } from "@/components/app/panels";
import ToolStep from "@/components/tools/ToolStep";
import { explain, type CloudEvent } from "@/lib/api/cloud";
import { useQuery } from "@/lib/api/useQuery";
import { isLogo, type LiveState } from "@/lib/live";
import {
  LOADS_NOT_PEOPLE, PERIODS, SPONSORS_SHOWN, chartBars, chartText, fillDays, pdfFileName, percentOf, periodLabel, rangeFor, reportPath,
  shortDay, sourceRows, summaryText, viewLabel, type PeriodId, type SponsorReportData,
} from "@/lib/sponsorreport";

function DayChart({ data }: { data: SponsorReportData }) {
  const id = useId();
  const days = useMemo(() => fillDays(data.days, data.from, data.to), [data]);
  const W = 600, H = 150, { bars, max } = chartBars(days, W, H - 10);
  const step = Math.max(1, Math.ceil(days.length / 6));
  return (
    <figure className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-labelledby={`${id}-t ${id}-d`} className="h-auto w-full" data-testid="day-chart">
        <title id={`${id}-t`}>Page loads by day</title>
        <desc id={`${id}-d`}>{chartText(days)}</desc>
        <line x1="0" y1={H} x2={W} y2={H} stroke="#52525b" strokeWidth="1" />
        {bars.map((b) => <rect key={b.day} x={b.x} y={b.y + 10} width={b.w} height={b.h} rx="1" fill={b.peak ? "#a78bfa" : "#22d3ee"} />)}
        {bars.map((b, i) => (i % step === 0 ? <text key={`l${b.day}`} x={b.x} y={H + 16} fontSize="11" fill="#a1a1aa">{shortDay(b.day)}</text> : null))}
      </svg>
      <figcaption className="text-xs text-zinc-400">Each bar is one day (UTC). The tallest bar{data.peak ? " (purple)" : ""} is the busiest day{data.peak ? `, ${data.peak.hits} page ${data.peak.hits === 1 ? "load" : "loads"}` : ""}. Scale: 0 to {max}.</figcaption>
      <details className="text-sm text-zinc-300"><summary className="min-h-[44px] cursor-pointer py-3 font-semibold text-cyan">Show the same numbers as a list</summary>
        <ul className="grid grid-cols-2 gap-x-4 sm:grid-cols-3">{days.map((d) => <li key={d.day}>{shortDay(d.day)}: <strong className="text-white">{d.hits}</strong></li>)}</ul>
      </details>
    </figure>
  );
}

/** Sponsor report: how many times the live page, stream overlay and embeds were opened. Counts only; loads, never people. */
export default function Panel({ eventId, eventName }: PanelProps) {
  const [period, setPeriod] = useState<PeriodId>("30d");
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [done, setDone] = useState(false);
  const evs = useQuery<CloudEvent[]>("/events", { ttl: 20_000 });
  const eventDate = evs.data?.find((e) => e.id === eventId)?.date;
  const range = useMemo(() => rangeFor(period, Date.now(), eventDate), [period, eventDate]);
  const report = useQuery<SponsorReportData>(reportPath(eventId, range.from, range.to), { ttl: 15_000 });
  const liveState = useQuery<LiveState>(`/events/${encodeURIComponent(eventId)}/live`, { ttl: 15_000 });
  const data = report.data;
  const sponsors = (liveState.data?.snapshot?.sponsors ?? []);
  const periodName = periodLabel(period, range);
  const name = PERIODS.find((p) => p.id === period)!.label;
  const empty = !!data && data.total === 0;

  const download = async () => {
    if (!data || busy) return;
    setBusy(true); setErr(""); setDone(false);
    try {
      const [{ sponsorReportToPdf }, { downloadBlob }] = await Promise.all([import("./pdf"), import("@/lib/idcard/download")]);
      downloadBlob(await sponsorReportToPdf({ eventName, periodName, data, sponsors }), pdfFileName(eventName));
      setDone(true);
    } catch { setErr("Could not make the PDF. Try again."); } finally { setBusy(false); }
  };

  return (
    <section aria-label="Sponsor report" className="space-y-4">
      <p className="text-sm leading-6 text-zinc-300">Show a sponsor how often the live page, your stream overlay and embedded widgets were opened. Only counts are kept: no names, no addresses, no cookies.</p>

      <ToolStep n={1} title="Pick the period" hint="Which days should the numbers cover?" done>
        <div role="radiogroup" aria-label="Period" className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <label key={p.id} className={`inline-flex min-h-[44px] cursor-pointer items-center rounded-full border px-4 text-sm font-semibold focus-within:ring-2 focus-within:ring-cyan ${period === p.id ? "border-cyan bg-cyan text-ink" : "border-white/20 text-zinc-100"}`}>
              <input type="radio" name="sr-period" value={p.id} checked={period === p.id} onChange={() => { setPeriod(p.id); setDone(false); }} className="sr-only" />
              {p.label}
            </label>
          ))}
        </div>
        <p className="text-xs text-zinc-400">{range.from} to {range.to}, in UTC days.{range.capped ? " The report holds at most the last 90 days, so the start was moved forward." : ""}</p>
      </ToolStep>

      <ToolStep n={2} title="See the numbers" hint="Page loads, counted since the live page was published." done={!!data && !empty}
        status={data ? `${data.total} page ${data.total === 1 ? "load" : "loads"}` : undefined}>
        {report.loading && <p role="status" className="text-sm text-zinc-300">Loading the numbers…</p>}
        {report.error && (
          <div role="alert" className="space-y-2 text-sm text-red-300">
            <p>{explain(report.error)}</p>
            <button type="button" onClick={report.refetch} className="min-h-[44px] rounded-full bg-cyan px-5 font-bold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Try again</button>
          </div>
        )}
        {empty && (
          <div className="space-y-2" data-testid="sr-empty">
            <p className="text-sm leading-6 text-zinc-200">Nothing has been counted in this period yet. Publish the live page (in the Live page tool), share its link, and each time it is opened one page load is added here.</p>
            <button type="button" onClick={report.refetch} className="min-h-[44px] rounded-full bg-cyan px-5 font-bold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Check again</button>
          </div>
        )}
        {data && !empty && (
          <div className="space-y-5" data-testid="sr-numbers">
            <p aria-live="polite" className="text-sm leading-6 text-zinc-200">{summaryText(data, name)}</p>
            <dl className="rounded-xl border border-white/10 px-4 py-3"><dt className="text-xs uppercase tracking-wider text-zinc-400">Total page loads</dt><dd className="font-display text-4xl font-bold text-white">{data.total}</dd></dl>
            <DayChart data={data} />
            <div>
              <h4 className="text-sm font-bold text-white">Where it was seen</h4>
              <ul className="mt-2 divide-y divide-white/10 text-sm">
                {sourceRows(data.bySource).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2"><span className="text-zinc-200">{s.label}</span><span className="text-white"><strong>{s.hits}</strong> <span className="text-zinc-400">({percentOf(s.hits, data.total)}%)</span></span></li>
                ))}
              </ul>
              {data.byView.length > 0 && (
                <details className="mt-2 text-sm text-zinc-300"><summary className="min-h-[44px] cursor-pointer py-3 font-semibold text-cyan">More options: split by screen</summary>
                  <ul className="divide-y divide-white/10">{data.byView.map((v) => <li key={`${v.source}|${v.view}`} className="flex justify-between gap-3 py-2"><span>{viewLabel(v.source, v.view)} <span className="text-zinc-400">({v.source})</span></span><strong className="text-white">{v.hits}</strong></li>)}</ul>
                </details>
              )}
            </div>
            <p className="rounded-xl border border-white/10 px-3 py-2 text-xs leading-5 text-zinc-300">{LOADS_NOT_PEOPLE} One person opening the page twice is two loads.</p>
          </div>
        )}
        <div>
          <h4 className="text-sm font-bold text-white">Sponsors on the live page</h4>
          {liveState.loading ? <p role="status" className="mt-1 text-sm text-zinc-300">Loading…</p> : sponsors.length === 0 ? (
            <p className="mt-1 text-sm text-zinc-300">No sponsors are set on the live page yet. Add them in the Live page tool and they will be named in the report.</p>
          ) : (
            <>
              <ul className="mt-2 flex flex-wrap gap-2">{sponsors.map((s) => (
                <li key={s.name} className="flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 px-3 py-1 text-sm text-zinc-100">
                  {isLogo(s.logo) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.logo} alt="" className="h-8 w-auto max-w-[80px] object-contain" />}
                  <span>{s.name}</span>
                </li>))}
              </ul>
              <p className="mt-2 text-xs text-zinc-400">{SPONSORS_SHOWN}</p>
            </>
          )}
          {liveState.data && !liveState.data.published && <p className="mt-2 text-xs text-amber-200">The live page is not published right now, so new visits are not being counted.</p>}
        </div>
      </ToolStep>

      <ToolStep n={3} title="Share it" hint="The PDF is the thing you send. It is one page: event, period, sponsors, the numbers and how they were counted. There is no public link to this report.">
        <button type="button" onClick={download} disabled={!data || busy} aria-describedby="sr-dl-note"
          className="min-h-[44px] rounded-full bg-cyan px-6 font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          {busy ? "Making the PDF…" : "Download the report (PDF)"}
        </button>
        <p id="sr-dl-note" className="text-xs text-zinc-400">{!data ? "Available once the numbers have loaded." : "Saves a PDF to your device. Nothing is uploaded."}</p>
        <p role="status" className="text-sm text-emerald-300">{done ? "Saved. Check your downloads." : ""}</p>
        {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
      </ToolStep>
    </section>
  );
}
