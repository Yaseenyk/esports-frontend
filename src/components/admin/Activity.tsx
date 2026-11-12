"use client";

import { useState } from "react";
import { type AuditRow, admin, reasonLabel } from "@/lib/admin/client";
import { actionLabel, ago, targetLabel } from "@/lib/admin/labels";
import { Empty, Failed, H1, Loading, say, useLoad } from "./ui";

export default function Activity() {
  const [org, setOrg] = useState("");
  const [applied, setApplied] = useState("");
  const [more, setMore] = useState<AuditRow[]>([]);
  const [next, setNext] = useState<string | null | undefined>(undefined);
  const [moreErr, setMoreErr] = useState("");
  const [busy, setBusy] = useState(false);
  const r = useLoad(async () => { const p = await admin.audit(undefined, applied || undefined); setMore([]); setNext(p.next); return p; }, [applied]);

  async function loadMore() {
    if (!next) return;
    setBusy(true); setMoreErr("");
    try { const p = await admin.audit(next, applied || undefined); setMore((m) => [...m, ...p.items]); setNext(p.next); } catch (e) { setMoreErr(say(e)); }
    setBusy(false);
  }

  const rows = [...(r.data?.items ?? []), ...more];
  return (
    <>
      <H1 sub="Every staff action, newest first. Reading this is logged too.">Activity</H1>
      <form className="mb-4 flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); setApplied(org.trim()); }}>
        <div className="min-w-0 flex-1"><label htmlFor="a-org" className="block text-sm font-medium text-zinc-100">Only one organisation (optional id)</label><input id="a-org" className="field mt-1" value={org} onChange={(e) => setOrg(e.target.value)} autoComplete="off" /></div>
        <button type="submit" className="btn-ghost">Filter</button>
        {applied && <button type="button" className="btn-ghost" onClick={() => { setOrg(""); setApplied(""); }}>Show all</button>}
      </form>
      {r.status === "loading" && <Loading what="activity" />}
      {r.status === "error" && <Failed error={r.error} onRetry={r.reload} />}
      {r.status === "ready" && (rows.length === 0 ? <Empty>No activity to show.</Empty> : (
        <>
          <ul className="space-y-2">
            {rows.map((a) => (
              <li key={a.id} className="card !p-4">
                <p className="font-medium text-white">{actionLabel(a.action)}</p>
                <p className="mt-0.5 text-sm text-zinc-300">
                  {a.actorType === "staff" ? "Platform staff" : a.actorType === "system" ? "The system" : "A member"}
                  {a.targetType ? ` on ${targetLabel(a.targetType).toLowerCase()}` : ""}
                  {a.reasonCode ? `. Reason: ${reasonLabel(a.reasonCode)}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400"><time dateTime={a.at}>{a.at ? `${ago(a.at)} (${new Date(a.at).toLocaleString("en-IN")})` : ""}</time></p>
              </li>
            ))}
          </ul>
          {moreErr && <p role="alert" className="mt-3 text-sm text-red-300">{moreErr}</p>}
          {next && <button type="button" disabled={busy} className="btn-ghost mt-4" onClick={loadMore}>{busy ? "Loading..." : "Show older"}</button>}
        </>
      ))}
    </>
  );
}
