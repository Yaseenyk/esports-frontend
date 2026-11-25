"use client";

import { useState } from "react";
import { type FeedbackItem, type FeedbackStatus, admin } from "@/lib/admin/client";
import { ago } from "@/lib/admin/labels";
import { Empty, Failed, H1, Loading, Success, say, useLoad } from "./ui";

const TABS: [FeedbackStatus, string][] = [["new", "New"], ["triaged", "Looked at"], ["fixed", "Fixed"], ["wontfix", "Won't fix"]];
const KIND: Record<string, string> = { bug: "Bug", idea: "Idea", confusing: "Confusing", other: "Other" };

function Card({ f, onDone }: { f: FeedbackItem; onDone: (m: string) => void }) {
  const [note, setNote] = useState(f.staffNote ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function save(status?: FeedbackStatus) {
    setBusy(true); setErr("");
    try { await admin.triageFeedback(f.id, { ...(status ? { status } : {}), staffNote: note.trim() || null }); onDone(status ? `Moved to "${TABS.find((t) => t[0] === status)?.[1]}".` : "Note saved."); } catch (e) { setErr(say(e)); }
    setBusy(false);
  }
  return (
    <li className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-zinc-300"><span className="tag mr-2">{KIND[f.kind] ?? f.kind}</span>{f.pagePath && <span className="font-mono">{f.pagePath}</span>}{f.createdAt ? ` · ${ago(f.createdAt)}` : ""}</p>
        <span className="text-xs text-zinc-400">{[f.deviceClass, f.attachmentCount ? `${f.attachmentCount} screenshot${f.attachmentCount === 1 ? "" : "s"}` : "", f.hasContact ? "left a contact" : ""].filter(Boolean).join(" · ")}</span>
      </div>
      <p className="mt-2 whitespace-pre-line break-words text-sm text-zinc-100">{f.message}</p>
      <label htmlFor={`fb-${f.id}`} className="mt-3 block text-sm font-medium text-zinc-100">Staff note (only staff see it)</label>
      <textarea id={`fb-${f.id}`} className="field mt-1 min-h-20" maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
      {err && <p role="alert" className="mt-2 text-sm text-red-300">{err}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {TABS.filter(([k]) => k !== f.status).map(([k, l]) => <button key={k} type="button" disabled={busy} className="btn-ghost disabled:opacity-60" onClick={() => save(k)}>Mark: {l}</button>)}
        <button type="button" disabled={busy} className="btn-ghost disabled:opacity-60" onClick={() => save()}>Save note</button>
      </div>
    </li>
  );
}

/** The on-page feedback bot's inbox (the existing staff feedback routes). Answers "switched off" while feedback.enabled is off. */
export default function Feedback() {
  const [tab, setTab] = useState<FeedbackStatus>("new");
  const [done, setDone] = useState("");
  const [more, setMore] = useState<FeedbackItem[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [moreErr, setMoreErr] = useState("");
  const r = useLoad(async () => { const p = await admin.feedback(tab); setMore([]); setNext(p?.next ?? null); return p; }, [tab]);
  async function loadMore() {
    if (!next) return;
    setBusy(true); setMoreErr("");
    try { const p = await admin.feedback(tab, next); if (p) { setMore((m) => [...m, ...p.items]); setNext(p.next); } } catch (e) { setMoreErr(say(e)); }
    setBusy(false);
  }
  const rows = [...(r.data?.items ?? []), ...more];
  return (
    <>
      <H1 sub="What visitors sent with the feedback button. Contact details are not shown here.">Feedback</H1>
      <div role="group" aria-label="Which feedback" className="mb-4 flex flex-wrap gap-2">
        {TABS.map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={tab === k} onClick={() => { setTab(k); setDone(""); }}>{l}</button>)}
      </div>
      {done && <div className="mb-4"><Success>{done}</Success></div>}
      {r.status === "loading" && <Loading what="feedback" />}
      {r.status === "error" && <Failed error={r.error} onRetry={r.reload} />}
      {r.status === "ready" && (r.data === null ? <Empty>The feedback button is switched off (flag feedback.enabled), so there is no inbox to show.</Empty> : rows.length === 0 ? <Empty>Nothing here.</Empty> : (
        <>
          <ul className="space-y-3">{rows.map((f) => <Card key={f.id} f={f} onDone={(m) => { setDone(m); r.reload(); }} />)}</ul>
          {moreErr && <p role="alert" className="mt-3 text-sm text-red-300">{moreErr}</p>}
          {next && <button type="button" disabled={busy} className="btn-ghost mt-4" onClick={loadMore}>{busy ? "Loading..." : "Show more"}</button>}
        </>
      ))}
    </>
  );
}
