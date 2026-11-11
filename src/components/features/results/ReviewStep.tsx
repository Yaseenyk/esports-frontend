"use client";

import { useCallback, useEffect, useState } from "react";
import ToolStep from "@/components/tools/ToolStep";
import { results, type SubmissionItem } from "@/lib/api/f-results";
import { explain } from "@/lib/api/cloud";
import { MAX_NOTE, sortQueue, statusLabel } from "@/lib/results";

function Proof({ item, canSee }: { item: SubmissionItem; canSee: boolean }) {
  const [src, setSrc] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    if (!item.proofUrl || !canSee) { setSrc(null); return; }
    results.proof(item.proofUrl).then((d) => { if (live) setSrc(d); }).catch(() => { if (live) setSrc(null); });
    return () => { live = false; };
  }, [item.proofUrl, canSee]);
  if (!item.hasProof) return <p className="text-sm text-zinc-300">No screenshot was sent.</p>;
  if (!canSee) return <p className="text-sm text-zinc-300">Only the owner and editors can see screenshots.</p>;
  if (src === undefined) return <div className="sk h-40 w-full rounded-lg" role="status" aria-label="Loading the screenshot" />;
  if (src === null) return <p role="alert" className="text-sm text-rose-200">The screenshot could not be loaded. Try refreshing.</p>;
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="block" aria-label={`Open the screenshot from ${item.team} in full size`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`Screenshot sent by ${item.team}`} className="max-h-96 w-full rounded-lg border border-white/15 bg-black object-contain" />
    </a>
  );
}

function Claim({ item, matchLine, canEdit, canSee, busy, onApprove, onReject }: {
  item: SubmissionItem; matchLine: string; canEdit: boolean; canSee: boolean; busy: boolean;
  onApprove: (i: SubmissionItem) => void; onReject: (i: SubmissionItem, reason: string) => void;
}) {
  const [mode, setMode] = useState<"" | "approve" | "reject">("");
  const [reason, setReason] = useState("");
  const m = item.match;
  return (
    <div className="space-y-2 rounded-xl border border-white/15 bg-[#0a0b0d] p-3">
      <p className="break-words text-sm text-zinc-300">From <strong className="text-white">{item.team}</strong></p>
      <p className="font-display text-2xl font-bold text-white">{m ? `${m.a} ${item.scoreA} - ${item.scoreB} ${m.b}` : matchLine}</p>
      {item.note && <p className="break-words rounded-lg bg-zinc-900 p-2 text-sm text-zinc-200">Note: {item.note}</p>}
      <Proof item={item} canSee={canSee} />
      {canEdit && item.status === "pending" && mode === "" && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" disabled={busy} onClick={() => setMode("approve")}>Approve</button>
          <button type="button" className="btn-ghost" disabled={busy} onClick={() => setMode("reject")}>Reject</button>
        </div>
      )}
      {mode === "approve" && (
        <div role="alertdialog" aria-label="Confirm approval" className="space-y-2 rounded-lg border border-cyan/50 p-2">
          <p className="text-sm text-zinc-100">Record <strong>{m ? `${m.a} ${item.scoreA} - ${item.scoreB} ${m.b}` : "this score"}</strong> as the result? If the winner moves on in a bracket, that is done too. You can still change the result later in the scores.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" disabled={busy} onClick={() => onApprove(item)}>{busy ? "Saving..." : "Yes, record it"}</button>
            <button type="button" className="btn-ghost" disabled={busy} onClick={() => setMode("")}>Cancel</button>
          </div>
        </div>
      )}
      {mode === "reject" && (
        <div role="group" aria-label="Reject this score" className="space-y-2 rounded-lg border border-rose-400/40 p-2">
          <label className="block text-sm text-zinc-100" htmlFor={`rj-${item.id}`}>Why? The captain reads this (optional)</label>
          <input id={`rj-${item.id}`} className="field" maxLength={MAX_NOTE} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: the screenshot is not readable" />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" disabled={busy} onClick={() => onReject(item, reason)}>{busy ? "Saving..." : "Reject and tell the captain"}</button>
            <button type="button" className="btn-ghost" disabled={busy} onClick={() => setMode("")}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Step 2: the queue. Pending scores first; when both teams sent different scores their claims sit side by side. */
export default function ReviewStep({ eventId, canEdit, canSee, onChanged, refreshKey }: { eventId: string; canEdit: boolean; canSee: boolean; onChanged: () => void; refreshKey: number }) {
  const [items, setItems] = useState<SubmissionItem[] | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");
  const [showDone, setShowDone] = useState(false);

  const load = useCallback(async () => {
    try { const r = await results.submissions(eventId); setItems(r.submissions); setError(""); } catch (e) { setError(explain(e)); setItems((c) => c ?? []); }
  }, [eventId]);
  useEffect(() => { void load(); }, [load, refreshKey]);
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === "visible") void load(); }, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const decide = async (i: SubmissionItem, fn: () => Promise<unknown>, ok: string) => {
    setBusy(i.id); setMsg(""); setError("");
    try { await fn(); setMsg(ok); onChanged(); await load(); } catch (e) {
      const x = e as { status?: number; serverError?: string };
      setError(x.status === 409 ? (x.serverError ?? "That score was already handled or no longer fits the match. Refresh the list.") : explain(e));
      await load();
    } finally { setBusy(""); }
  };

  const pending = sortQueue((items ?? []).filter((i) => i.status === "pending"));
  const done = sortQueue((items ?? []).filter((i) => i.status !== "pending")).slice(0, 20);
  // One card per match: the first pending claim leads and its rivals are shown beside it.
  const seen = new Set<string>();
  const groups = pending.filter((p) => { if (seen.has(p.matchId)) return false; seen.add(p.matchId); return true; })
    .map((p) => ({ lead: p, claims: pending.filter((x) => x.matchId === p.matchId) }));

  return (
    <ToolStep n={2} title="Review the scores" done={items !== null && pending.length === 0 && items.length > 0}
      status={items === null ? undefined : pending.length ? `${pending.length} waiting` : "Nothing waiting"}
      hint="Check each score and screenshot. Approve puts the result into your event. Reject sends it back to the captain with your reason."
      actions={<button type="button" className="btn-ghost" onClick={() => void load()}>Refresh</button>}>
      <div aria-live="polite" className="space-y-2">
        {msg && <p role="status" className="rounded-lg border border-emerald-400/50 p-3 text-sm text-emerald-300">{msg}</p>}
        {error && <p role="alert" className="rounded-lg border border-rose-400/50 p-3 text-sm text-rose-200">{error}</p>}
      </div>
      {items === null && <div aria-busy="true"><p className="sr-only" role="status">Loading the scores</p><div className="sk h-24 w-full rounded-xl" /></div>}
      {items !== null && pending.length === 0 && (
        <div className="rounded-xl border border-white/10 p-4">
          <p className="font-semibold text-white">Nothing to review</p>
          <p className="mt-1 text-sm text-zinc-300">When a captain sends a score it shows up here. This list checks again every 30 seconds. If nothing has come in, make sure each captain has their link in step 1.</p>
        </div>
      )}
      {groups.map(({ lead, claims }) => {
        const disputed = claims.some((c) => c.disputed);
        const m = lead.match;
        return (
          <article key={lead.matchId} aria-label={`Scores for ${m ? `${m.a} against ${m.b}` : "a match"}`} className={`space-y-3 rounded-2xl border p-3 ${disputed ? "border-amber-300/60" : "border-white/10"}`}>
            <h4 className="break-words font-display text-lg font-bold text-white">{m ? `${m.a} vs ${m.b}` : "Match"}</h4>
            {disputed && <p role="status" className="rounded-lg border border-amber-300/50 p-2 text-sm text-amber-200"><strong>The two teams disagree.</strong> Compare the screenshots, approve the one that is right and reject the other.</p>}
            {claims.length === 1 && !disputed && <p className="text-sm text-zinc-300">Only {claims[0]!.team} has sent a score so far.</p>}
            <div className={claims.length > 1 ? "grid gap-3 sm:grid-cols-2" : ""}>
              {claims.map((c) => <Claim key={c.id} item={c} matchLine="" canEdit={canEdit} canSee={canSee} busy={busy === c.id}
                onApprove={(i) => void decide(i, () => results.approve(eventId, i.id), "Result recorded. The winner has moved on if this match feeds a bracket.")}
                onReject={(i, reason) => void decide(i, () => results.reject(eventId, i.id, reason.trim()), "Sent back to the captain.")} />)}
            </div>
          </article>
        );
      })}
      {done.length > 0 && (
        <div>
          <button type="button" className="btn-ghost" aria-expanded={showDone} onClick={() => setShowDone((v) => !v)}>{showDone ? "Hide" : "Show"} decided scores ({done.length})</button>
          {showDone && (
            <ul className="mt-2 divide-y divide-white/10 rounded-xl border border-white/10">
              {done.map((d) => (
                <li key={d.id} className="p-3 text-sm text-zinc-200">
                  <strong className="text-white">{statusLabel(d.status)}</strong>: {d.match ? `${d.match.a} ${d.scoreA} - ${d.scoreB} ${d.match.b}` : `${d.scoreA} - ${d.scoreB}`} from {d.team}
                  {d.rejectReason ? ` (${d.rejectReason})` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </ToolStep>
  );
}
