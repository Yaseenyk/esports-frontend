"use client";

import Link from "next/link";
import { useState } from "react";
import { type Decision, type Report, type ReportTab, type Takedown, REPORT_REASONS, admin, reasonLabel } from "@/lib/admin/client";
import { PRIORITY_LABEL, ago, targetLabel } from "@/lib/admin/labels";
import { ConfirmPanel, Empty, Failed, H1, Loading, Success, say, useLoad } from "./ui";

type Action = "hide" | "restore" | "dismiss" | "takedown";

const COPY: Record<Action, { button: string; title: string; body: string; confirm: string; done: string; danger?: boolean }> = {
  hide: { button: "Hide it", title: "Hide this from the public?", body: "People will no longer see it. The owner is told it was hidden. You can restore it later.", confirm: "Hide it", done: "Hidden. It is no longer public.", danger: true },
  restore: { button: "Restore it", title: "Make this public again?", body: "It will be visible to the public again and the reports about it are closed.", confirm: "Restore it", done: "Restored. It is public again." },
  dismiss: { button: "Dismiss report", title: "Dismiss this report?", body: "Nothing is hidden. The report is closed as not a problem.", confirm: "Dismiss report", done: "Report dismissed." },
  takedown: { button: "Take down", title: "Take this down?", body: "It is removed from the public site and stays removed even if the owner edits it. Only staff can bring it back, and you can do that later.", confirm: "Take it down", done: "Taken down. Only staff can restore it.", danger: true },
};

function Card({ r, onDone }: { r: Report; onDone: (msg: string) => void }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const actions: Action[] = r.hidden ? ["restore", "takedown"] : ["hide", "dismiss", "takedown"];
  const panelId = `rep-${r.id}`;

  async function run(a: Action, reasonCode: string) {
    if (a === "takedown") await admin.takedown(r.targetType, r.targetId, reasonCode);
    else await admin.decide(r.id, a as Decision, reasonCode, r.source);
    setAction(null);
    onDone(COPY[a].done);
  }

  return (
    <li className="card !p-0">
      <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)} className="flex min-h-14 w-full items-start justify-between gap-3 rounded-2xl p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan">
        <span className="min-w-0">
          <span className="block font-medium text-white">{targetLabel(r.targetType)}: {REPORT_REASONS[r.reasonCode] ?? reasonLabel(r.reasonCode)}</span>
          <span className="mt-0.5 block text-sm text-zinc-300">{r.reporters} {r.reporters === 1 ? "person" : "people"} reported it{r.createdAt ? `, ${ago(r.createdAt)}` : ""}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className={`tag ${r.priority >= 3 ? "!bg-amber-400/20 !text-amber-200" : ""}`}>{PRIORITY_LABEL(r.priority)}</span>
          {r.hidden && <span className="tag">Hidden</span>}
        </span>
      </button>
      {open && (
        <div id={panelId} className="border-t border-zinc-800 p-4">
          {r.note && <p className="text-sm text-zinc-200"><span className="text-zinc-400">What they wrote: </span>{r.note}</p>}
          {r.link && <p className="mt-2 text-sm"><Link href={r.link} target="_blank" rel="noopener noreferrer" className="text-cyan underline underline-offset-2">Open the public page (new tab)</Link></p>}
          {r.status === "needs_other_staff" && <p className="mt-2 text-sm text-amber-200">This is about your own organisation, so another staff member has to decide it.</p>}
          {r.status === "open" || r.status === "needs_other_staff" || r.hidden ? (
            action ? (
              <ConfirmPanel title={COPY[action].title} confirmLabel={COPY[action].confirm} danger={COPY[action].danger} onCancel={() => setAction(null)} onConfirm={(code) => run(action, code)}>
                <p>{COPY[action].body}</p>
              </ConfirmPanel>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {actions.map((a) => <button key={a} type="button" className={a === actions[0] ? "btn" : "btn-ghost"} onClick={() => setAction(a)}>{COPY[a].button}</button>)}
              </div>
            )
          ) : <p className="mt-2 text-sm text-zinc-400">This report is closed.</p>}
        </div>
      )}
    </li>
  );
}

/** One hidden page, with the "Lift takedown" button: confirm, give a reason, and it is public again. */
function TakedownCard({ t, onDone }: { t: Takedown; onDone: (msg: string) => void }) {
  const [asking, setAsking] = useState(false);
  async function lift(reasonCode: string) {
    await admin.liftTakedown(t.targetType, t.targetId, reasonCode);
    setAsking(false);
    onDone("Takedown lifted. It is public again.");
  }
  return (
    <li className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-white">{targetLabel(t.targetType)}: {reasonLabel(t.reasonCode)}</p>
          <p className="mt-0.5 text-sm text-zinc-300">{t.at ? `Hidden ${ago(t.at)}` : "Hidden"}</p>
        </div>
        {!asking && <button type="button" className="btn-ghost" onClick={() => setAsking(true)} aria-label={`Lift takedown: ${targetLabel(t.targetType)}`}>Lift takedown</button>}
      </div>
      {asking && (
        <ConfirmPanel title="Lift this takedown?" confirmLabel="Lift takedown" onCancel={() => setAsking(false)} onConfirm={lift}>
          <p>It becomes visible to the public again, and the reports about it are closed. You can take it down again later.</p>
        </ConfirmPanel>
      )}
    </li>
  );
}

const TABS: [Tab, string][] = [["open", "Waiting"], ["needs_other_staff", "Needs another staff member"], ["actioned", "Hidden"], ["dismissed", "Dismissed"], ["takedowns", "Taken down"]];
type Tab = ReportTab | "takedowns";

function Takedowns({ done, onDone }: { done: string; onDone: (m: string) => void }) {
  const [more, setMore] = useState<Takedown[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [moreErr, setMoreErr] = useState("");
  const [busy, setBusy] = useState(false);
  const r = useLoad(async () => { const p = await admin.takedowns(); setMore([]); setNext(p.next); return p; }, []);
  async function loadMore() {
    if (!next) return;
    setBusy(true); setMoreErr("");
    try { const p = await admin.takedowns(next); setMore((m) => [...m, ...p.items]); setNext(p.next); } catch (e) { setMoreErr(say(e)); }
    setBusy(false);
  }
  const rows = [...(r.data?.items ?? []), ...more];
  return (
    <>
      {done && <div className="mb-4"><Success>{done}</Success></div>}
      {r.status === "loading" && <Loading what="takedowns" />}
      {r.status === "error" && <Failed error={r.error} onRetry={r.reload} />}
      {r.status === "ready" && (rows.length === 0 ? <Empty>Nothing is taken down right now.</Empty> : (
        <>
          <ul className="space-y-3">{rows.map((t) => <TakedownCard key={`${t.targetType}:${t.targetId}`} t={t} onDone={(m) => { onDone(m); r.reload(); }} />)}</ul>
          {moreErr && <p role="alert" className="mt-3 text-sm text-red-300">{moreErr}</p>}
          {next && <button type="button" disabled={busy} className="btn-ghost mt-4" onClick={loadMore}>{busy ? "Loading..." : "Show more"}</button>}
        </>
      ))}
    </>
  );
}

export default function Reports() {
  const [tab, setTab] = useState<Tab>("open");
  const [more, setMore] = useState<Report[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [moreErr, setMoreErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");
  const r = useLoad(async () => { if (tab === "takedowns") return { items: [], next: null }; const p = await admin.reports(tab); setMore([]); setNext(p.next); return p; }, [tab]);

  async function loadMore() {
    if (!next) return;
    setBusy(true); setMoreErr("");
    try { if (tab === "takedowns") return; const p = await admin.reports(tab, next); setMore((m) => [...m, ...p.items]); setNext(p.next); } catch (e) { setMoreErr(say(e)); }
    setBusy(false);
  }
  const rows = [...(r.data?.items ?? []), ...more];

  return (
    <>
      <H1 sub="Most urgent first. Open a report to see what you can do.">Reports</H1>
      <div role="group" aria-label="Which reports" className="mb-4 flex flex-wrap gap-2">
        {TABS.map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={tab === k} onClick={() => { setTab(k); setDone(""); }}>{l}</button>)}
      </div>
      {tab === "takedowns" && <Takedowns done={done} onDone={setDone} />}
      {tab !== "takedowns" && done && <div className="mb-4"><Success>{done}</Success></div>}
      {tab !== "takedowns" && r.status === "loading" && <Loading what="reports" />}
      {tab !== "takedowns" && r.status === "error" && <Failed error={r.error} onRetry={r.reload} />}
      {tab !== "takedowns" && r.status === "ready" && (rows.length === 0 ? <Empty>{tab === "open" ? "No reports are waiting. Nothing needs you." : "No reports here."}</Empty> : (
        <>
          <ul className="space-y-3">{rows.map((x) => <Card key={x.id} r={x} onDone={(m) => { setDone(m); r.reload(); }} />)}</ul>
          {moreErr && <p role="alert" className="mt-3 text-sm text-red-300">{moreErr}</p>}
          {next && <button type="button" disabled={busy} className="btn-ghost mt-4" onClick={loadMore}>{busy ? "Loading..." : "Show more"}</button>}
        </>
      ))}
    </>
  );
}
