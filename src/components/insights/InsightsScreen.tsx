"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { insightsApi } from "@/lib/api/f-insights";
import { fillMonths, insightsError, isEmpty, monthLabel, type Analytics } from "@/lib/insights";
import { useOrg } from "@/components/org/OrgContext";
import { ListSkeleton } from "@/components/org/ui";

const EMPTY = "Nothing to show yet: create an event and share its link.";
const nf = (n: number) => n.toLocaleString("en-IN");
const label = (k: string) => k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, " ");

/** One hue, labelled bars, no axes to misread: the number sits on every bar. Months with no events show 0. */
function MonthChart({ rows }: { rows: { month: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const W = 360, H = 190, top = 22, bottom = 30, slot = W / rows.length, bw = Math.min(26, slot - 6);
  const summary = `Events created by month: ${rows.map((r) => `${monthLabel(r.month)} ${r.count}`).join(", ")}.`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="h-auto w-full max-w-xl">
      <line x1="0" x2={W} y1={H - bottom} y2={H - bottom} stroke="#3f3f46" />
      {rows.map((r, i) => {
        const h = Math.round(((H - top - bottom) * r.count) / max), x = i * slot + (slot - bw) / 2, y = H - bottom - h;
        return (
          <g key={r.month}>
            {r.count > 0 && <rect x={x} y={y} width={bw} height={h} rx="3" fill="#22d3ee" />}
            <text x={x + bw / 2} y={y - 5} textAnchor="middle" fontSize="11" fill="#e4e4e7">{r.count}</text>
            <text x={x + bw / 2} y={H - 14} textAnchor="middle" fontSize="10" fill="#a1a1aa">{monthLabel(r.month).slice(0, 3)}</text>
            {(r.month.endsWith("-01") || i === 0) && <text x={x + bw / 2} y={H - 3} textAnchor="middle" fontSize="9" fill="#71717a">{r.month.slice(0, 4)}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section aria-label={title} className="card space-y-3 !p-4"><h2 className="font-display text-lg font-bold text-white">{title}</h2>{children}</section>;
}

const Stat = ({ name, value, note }: { name: string; value: number; note?: string }) => (
  <div className="rounded-xl border border-white/10 p-3"><p className="text-sm text-zinc-300">{name}</p><p className="font-display text-2xl font-bold text-white">{nf(value)}</p>{note && <p className="text-xs text-zinc-400">{note}</p>}</div>
);

function Numbers({ a }: { a: Analytics }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const rows = useMemo(() => fillMonths(a.events.byMonth, a.window.months, a.window.to), [a]);
  const status = Object.entries(a.registrations.byStatus);
  const sources = Object.entries(a.liveViews.bySource);
  return (
    <div className="space-y-4">
      <Panel title="Events by month">
        {a.events.total === 0 ? <p className="text-zinc-300">{EMPTY}</p> : (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-zinc-300">{nf(a.events.total)} {a.events.total === 1 ? "event" : "events"} in the last {a.window.months} {a.window.months === 1 ? "month" : "months"}.</p>
              <div role="group" aria-label="Show as" className="flex gap-1">
                {(["chart", "table"] as const).map((v) => <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={`chip !min-h-11 px-4 ${view === v ? "!border-cyan !text-cyan" : ""}`}>{v === "chart" ? "Chart" : "Table"}</button>)}
              </div>
            </div>
            {view === "chart" ? <MonthChart rows={rows} /> : (
              <table className="w-full max-w-md text-left text-sm"><caption className="sr-only">Events created by month</caption>
                <thead><tr className="text-zinc-400"><th scope="col" className="py-1 pr-3 font-medium">Month</th><th scope="col" className="py-1 text-right font-medium">Events</th></tr></thead>
                <tbody>{rows.map((r) => <tr key={r.month} className="border-t border-white/10"><th scope="row" className="py-2 pr-3 font-normal text-zinc-200">{monthLabel(r.month)}</th><td className="py-2 text-right text-zinc-100">{r.count}</td></tr>)}</tbody>
              </table>
            )}
          </>
        )}
      </Panel>
      <Panel title="Registrations">
        {a.registrations.total === 0 ? <p className="text-zinc-300">{EMPTY}</p> : (
          <div className="grid gap-2 sm:grid-cols-3">
            <Stat name="Teams registered" value={a.registrations.total} />
            {status.map(([k, n]) => <Stat key={k} name={label(k)} value={n} />)}
          </div>
        )}
      </Panel>
      <Panel title="Check-ins">
        {a.checkIns.total === 0 ? <p className="text-zinc-300">{EMPTY}</p> : <Stat name="People checked in" value={a.checkIns.total} note="A count only. Nobody is named here." />}
      </Panel>
      <Panel title="Live page views">
        {a.liveViews.total === 0 ? <p className="text-zinc-300">{EMPTY}</p> : (
          <div className="grid gap-2 sm:grid-cols-3"><Stat name="Views in total" value={a.liveViews.total} />{sources.map(([k, n]) => <Stat key={k} name={k === "live" ? "On the live page" : k === "embed" ? "In an embed" : label(k)} value={n} />)}</div>
        )}
      </Panel>
      {a.perEvent.length > 0 && (
        <Panel title="Each event">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] text-left text-sm"><caption className="sr-only">Counts for each event, newest first</caption>
              <thead><tr className="text-zinc-400"><th scope="col" className="py-1 pr-3 font-medium">Event</th><th scope="col" className="px-2 text-right font-medium">Teams</th><th scope="col" className="px-2 text-right font-medium">Approved</th><th scope="col" className="px-2 text-right font-medium">Check-ins</th><th scope="col" className="pl-2 text-right font-medium">Views</th></tr></thead>
              <tbody>{a.perEvent.map((e) => <tr key={e.id} className="border-t border-white/10"><th scope="row" className="py-2 pr-3 font-normal text-zinc-100">{e.name}{e.game && <span className="text-zinc-400"> · {e.game}</span>}</th><td className="px-2 text-right">{e.registrations.total}</td><td className="px-2 text-right">{e.registrations.approved}</td><td className="px-2 text-right">{e.checkIns}</td><td className="pl-2 text-right">{e.liveViews}</td></tr>)}</tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}

/** Loads one set of numbers; a loading skeleton, a plain error with retry, then the panels. `scope` changes reload it. */
function Loader({ scope, load }: { scope: string; load: () => Promise<Analytics> }) {
  const [state, setState] = useState<{ a?: Analytics; err?: string; loading: boolean }>({ loading: true });
  const [tick, setTick] = useState(0);
  const run = useCallback(load, [scope]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let live = true;
    setState({ loading: true });
    run().then((a) => { if (live) setState({ a, loading: false }); }, (e) => { if (live) setState({ err: insightsError(e), loading: false }); });
    return () => { live = false; };
  }, [run, tick]);
  if (state.loading) return <ListSkeleton n={4} />;
  if (state.err) return <div className="card space-y-2"><p role="alert" className="text-sm text-red-300">{state.err}</p><button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => setTick((n) => n + 1)}>Try again</button></div>;
  if (state.a && isEmpty(state.a)) return <p className="card text-zinc-300">{EMPTY}</p>;
  return state.a ? <Numbers a={state.a} /> : null;
}

export default function InsightsScreen() {
  const s = useOrg();
  const teams = (s.teamOrgs && s.ctx ? s.ctx.orgs.filter((o) => o.kind === "team" && o.status !== "pending_deletion") : []);
  const [pick, setPick] = useState<string>("me");
  const chosen = pick === "me" ? "me" : teams.some((t) => t.id === pick) ? pick : "me";
  const org = teams.find((t) => t.id === chosen);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Insights</h1>
        <p className="mt-1 text-sm text-zinc-300">Counts for your events. They never show names, emails or photos.</p>
      </div>
      {teams.length > 0 && (
        <div className="space-y-1">
          <label htmlFor="insights-scope" className="block text-sm text-zinc-200">1. Choose what to look at</label>
          <select id="insights-scope" className="field !min-h-11 max-w-xs" value={chosen} onChange={(e) => setPick(e.target.value)}>
            <option value="me">My events</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name || "Your club"}</option>)}
          </select>
        </div>
      )}
      {org ? <Loader key={org.id} scope={org.id} load={() => insightsApi.org(org.id)} /> : <Loader key="me" scope="me" load={() => insightsApi.mine()} />}
      <p className="text-sm text-zinc-400">Want these numbers in your own tool? <Link href="/app/account/" className="text-cyan underline">Make an API key</Link>, then read <Link href="/developers/" className="text-cyan underline">how it works</Link>.</p>
    </div>
  );
}
