"use client";

import { useId, useMemo, useState } from "react";
import { explain, type CloudEvent, type CloudRoster, type Live } from "@/lib/api/cloud";
import { useQuery } from "@/lib/api/useQuery";
import { buildReport, type Report } from "@/lib/report";

/** Small bar chart of arrivals. A picture for sighted people, with the same numbers as text underneath for everyone else. */
function ArrivalsChart({ r }: { r: Report }) {
  const id = useId();
  const max = Math.max(1, ...r.buckets.map((b) => b.count)), n = r.buckets.length;
  const W = 600, H = 140, gap = n > 40 ? 1 : 3, bw = (W - gap * (n - 1)) / n;
  const desc = r.buckets.map((b) => `${b.label}: ${b.count}`).join(". ");
  const step = Math.max(1, Math.ceil(n / 6));
  return (
    <figure className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-labelledby={`${id}-t ${id}-d`} className="h-auto w-full">
        <title id={`${id}-t`}>Arrivals every 15 minutes</title>
        <desc id={`${id}-d`}>{`Check-ins in each quarter hour. ${desc}.`}</desc>
        <line x1="0" y1={H} x2={W} y2={H} stroke="#52525b" strokeWidth="1" />
        {r.buckets.map((b, i) => {
          const h = (b.count / max) * (H - 10);
          return <rect key={b.start} x={i * (bw + gap)} y={H - h} width={bw} height={h} rx="1" fill={r.peak && b.start === r.peak.start ? "#a78bfa" : "#22d3ee"} />;
        })}
        {r.buckets.map((b, i) => (i % step === 0 ? <text key={`l${b.start}`} x={i * (bw + gap)} y={H + 16} fontSize="11" fill="#a1a1aa">{b.label}</text> : null))}
      </svg>
      <figcaption className="text-xs text-zinc-400">Each bar is 15 minutes. The tallest bar (purple) is the busiest, with {max} {max === 1 ? "arrival" : "arrivals"}.</figcaption>
    </figure>
  );
}

/** One card on the event page: a one-page A4 report of who came and when. Counts only, so it is safe to forward. */
export default function EventReportPanel({ eventId, eventName }: { eventId: string; eventName: string }) {
  const roster = useQuery<CloudRoster>(`/events/${eventId}/roster`, { ttl: 20_000 });
  const live = useQuery<Live>(`/events/${eventId}/checkins`, { pollMs: 30_000, maxPollMs: 120_000 });
  const evs = useQuery<CloudEvent[]>("/events", { ttl: 0 });
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [done, setDone] = useState(false);
  const ev = evs.data?.find((e) => e.id === eventId);

  const report = useMemo(() => {
    if (!roster.data) return null;
    return buildReport({
      event: { name: eventName, date: ev?.date, venue: ev?.venue },
      people: roster.data.people, teams: roster.data.teams, checkins: live.data?.checkins ?? [],
      tzOffsetMin: -new Date().getTimezoneOffset(),
    });
  }, [roster.data, live.data, eventName, ev?.date, ev?.venue]);

  const loading = roster.loading || (live.loading && !live.data);
  const error = roster.error ?? (live.data ? null : live.error);
  const noData = !!report && report.total === 0;
  const missingTimes = !!report && !!live.data && live.data.checkedIn > report.present;
  const reason = loading ? "Loading the numbers…" : error ? "The numbers could not be loaded." : !report || noData ? "Add people to this event first. The report needs a list of people." : "";

  const download = async () => {
    if (!report || busy) return;
    setBusy(true); setErr(""); setDone(false);
    try {
      const [{ reportToPdf }, { downloadBlob }] = await Promise.all([import("@/lib/idcard/pdf"), import("@/lib/idcard/download")]);
      downloadBlob(await reportToPdf(report), `${(eventName || "event").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 40) || "event"}-report.pdf`);
      setDone(true);
    } catch { setErr("Could not make the PDF. Try again."); } finally { setBusy(false); }
  };

  return (
    <section aria-label="Event report" className="card space-y-4 !p-4">
      <div>
        <h3 className="font-display text-lg font-bold text-white">Event report</h3>
        <p className="mt-1 text-sm text-zinc-300">A one-page PDF with who came, when they arrived and how each role and team did. It shows counts only, no names, so you can forward it.</p>
      </div>

      {loading && <p role="status" className="text-sm text-zinc-300">Loading the numbers…</p>}
      {error && <p role="alert" className="text-sm text-red-300">{explain(error)}</p>}

      {report && !noData && (
        <div className="space-y-4" data-testid="report-preview">
          <p className="text-sm leading-6 text-zinc-200">{report.summary}</p>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {([["People", report.total], ["Checked in", report.present], ["Attendance", `${report.percent}%`], ["Did not arrive", report.noShows], ["Under 18", report.under18]] as const).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 px-3 py-2"><dt className="text-xs uppercase tracking-wider text-zinc-400">{k}</dt><dd className="font-display text-2xl font-bold text-white">{v}</dd></div>
            ))}
          </dl>
          <div className="grid gap-3 sm:grid-cols-2">
            {([["By role", report.byRole], ["By team", report.byTeam]] as const).map(([title, rows]) => (
              <div key={title}><h4 className="text-sm font-semibold text-white">{title}</h4><ul className="mt-1 space-y-1 text-sm">{rows.slice(0, 8).map((x) => <li key={x.label} className="flex justify-between gap-2 border-b border-white/10 py-1"><span className="truncate text-zinc-200">{x.label}</span><span className="text-zinc-400">{x.present} of {x.total}</span></li>)}</ul>{rows.length > 8 && <p className="mt-1 text-xs text-zinc-400">and {rows.length - 8} more in the PDF</p>}</div>
            ))}
          </div>
          {report.buckets.length > 0 ? <ArrivalsChart r={report} /> : <p className="text-sm text-zinc-400">No check-ins yet, so there is no arrivals chart.</p>}
          {missingTimes && <p className="text-xs text-zinc-400">Arrival times are known for {report.present} of {live.data!.checkedIn} check-ins. The rest are counted in the totals the gate shows, not in this chart.</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn !min-h-11 px-4 text-sm" disabled={!!reason || busy} aria-describedby={reason ? "report-reason" : undefined} onClick={download}>{busy ? "Making the PDF…" : "Download the report (PDF)"}</button>
        {reason && !loading && !error && <span id="report-reason" className="text-sm text-zinc-400">{reason}</span>}
        {done && <span role="status" className="text-sm text-emerald-300">Done. The PDF is in your downloads.</span>}
      </div>
      {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
    </section>
  );
}
