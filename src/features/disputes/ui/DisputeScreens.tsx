"use client";

import Link from "next/link";
import { useState } from "react";
import { useDisputeView, useMyDisputes, useOrganiserQueue, useRaiseDispute } from "@/features/disputes/hooks/useDisputes";
import { FINAL_STATUSES, OUTCOMES, statusLabel, TYPES, typeLabel, type DisputeDetail } from "@/features/disputes/domain";
import { correctionsAllowed } from "@/features/disputes/corrections";
import { slugFromInput } from "@/features/disputes/validators";
import { useCorrections } from "@/features/disputes/hooks/useCorrections";
import { CorrectionsEditor } from "@/features/disputes/ui/CorrectionsEditor";
import { DisputeCard, DisputeStatusBadge, DisputeTimeline, EvidenceGrid, EvidenceUploader, OverdueBadge, ResolutionBox, when } from "@/features/disputes/ui/DisputeParts";
import { explainFailure } from "@/features/shared/failure";
import { SelectInput, TextArea, TextInput } from "@/features/shared/ui/Fields";
import { EmptyState, ErrorState, NotAvailable, SkeletonRows } from "@/features/shared/ui/States";
import { box, btnDanger, btnPrimary, btnSecondary, h1, h2, h3, link, section } from "@/features/shared/ui/styles";

const Loading = ({ show, label }: { show: boolean; label: string }) => (show ? <SkeletonRows n={2} label={label} /> : <p className="sr-only">{label}</p>);

export function MyDisputesScreen() {
  const res = useMyDisputes();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4"><h1 className={h1}>My disputes</h1><Link href="/app/disputes/new/" className={btnPrimary}>Raise a dispute</Link></header>
      {res.phase === "unavailable" && <NotAvailable what="The dispute portal" />}
      {res.phase === "loading" && <Loading show={res.showSkeleton} label="Loading your disputes" />}
      {res.phase === "error" && <ErrorState message={explainFailure(res.failure)} onRetry={res.reload} />}
      {res.phase === "ready" && (res.data.length === 0
        ? <EmptyState title="No disputes" body="You have not raised a dispute, and none names your team. Disputes open once a tournament's registration has closed." action={<Link href="/app/disputes/new/" className={btnSecondary}>Raise a dispute</Link>} />
        : <ul className="grid gap-4 sm:grid-cols-2">{res.data.map((d) => <DisputeCard key={d.id} d={d} href={`/app/disputes/view/?id=${encodeURIComponent(d.id)}`} />)}</ul>)}
    </div>
  );
}

export function NewDisputeScreen() {
  const r = useRaiseDispute();
  if (r.unavailable) return <div className="mx-auto max-w-3xl space-y-6"><h1 className={h1}>Raise a dispute</h1><NotAvailable what="The dispute portal" /></div>;
  if (r.done) {
    return (
      <div className="mx-auto max-w-3xl space-y-4"><h1 className={h1}>Dispute raised</h1>
        <p role="status" className="text-zinc-100">Your dispute was sent to the organiser. They have 72 hours to decide.</p>
        {r.done.failedFiles.length > 0 && <div role="alert" className="text-danger"><p><span aria-hidden="true">! </span>The dispute exists, but some images were not attached. Add them again on the dispute page.</p><ul className="mt-1 list-disc pl-5 text-sm">{r.done.failedFiles.map((f) => <li key={f}>{f}</li>)}</ul></div>}
        <p><Link href={`/app/disputes/view/?id=${encodeURIComponent(r.done.id)}`} className={btnPrimary}>Open the dispute</Link></p></div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className={h1}>Raise a dispute</h1>
      <p className="text-zinc-300">You can raise a dispute once a tournament&apos;s registration has closed. Only team captains and the organiser can raise one. Nobody decides a dispute they are part of.</p>
      {r.claimed.length === 0 && <p className={`${box} text-zinc-100`}>You need your team&apos;s captain link from your organiser first. Paste its token in the box below, once. Organisers can skip this.</p>}

      <section aria-labelledby="claim-h" className={`${box} space-y-3`}>
        <h2 id="claim-h" className={h3}>Are you a team captain? Prove it once</h2>
        <p className="text-sm text-zinc-300">Your organiser gives each captain a private link for their team: ask them to send you yours. Paste the token from that link below (the part after <span className="font-mono">t=</span>). We use it once to link this account to your team in this tournament and we do not keep it. Organisers can skip this step.</p>
        <TextInput id="c-slug" label="Tournament address" value={r.form.slug} onChange={(v) => r.set("slug", slugFromInput(v))} maxLength={200} error={r.errors.slug} help="The last part of the tournament page address, for example gokte-cup-2026. Pasting the whole link works too." />
        <TextInput id="c-token" label="Captain link token" value={r.token} onChange={r.setToken} type="password" autoComplete="off" error={r.claimError} />
        <button type="button" onClick={r.claim} disabled={r.busy === "claim"} className={btnSecondary}>{r.busy === "claim" ? "Checking" : "Link my team"}</button>
        {r.claimed.length > 0 && <p role="status" className="text-success"><span aria-hidden="true">+ </span>Linked as captain of {r.claimed.join(", ")}.</p>}
      </section>

      <form onSubmit={(e) => { e.preventDefault(); void r.submit(); }} noValidate className={`${box} space-y-5`}>
        <SelectInput id="d-type" label="What is it about?" value={r.form.type} onChange={(v) => r.set("type", v)} options={TYPES} blank="Choose a type" error={r.errors.type} />
        <TextArea id="d-sum" label="What happened?" value={r.form.summary} onChange={(v) => r.set("summary", v)} rows={5} max={1000} error={r.errors.summary} help="10 to 1000 characters. Be specific: which match, what the score should be." />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput id="d-team" label="Your team (optional)" value={r.form.team} onChange={(v) => r.set("team", v)} help="Needed only if you captain more than one team. Organisers leave it empty." />
          <TextInput id="d-against" label="Team you are disputing (optional)" value={r.form.againstTeam} onChange={(v) => r.set("againstTeam", v)} help="Must be a registered team." />
          <TextInput id="d-match" label="Match number (optional)" value={r.form.matchNo} onChange={(v) => r.set("matchNo", v.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" error={r.errors.matchNo} />
        </div>
        <EvidenceUploader items={r.picker.items} onPick={r.picker.add} onRemove={r.picker.remove} full={r.picker.full} busy={r.busy === "raise"} />
        {r.error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{r.error}</p>}
        <button type="submit" disabled={r.busy === "raise" || r.picker.items.some((i) => i.status === "working")} className={btnPrimary}>{r.busy === "raise" ? "Sending" : "Raise dispute"}</button>
      </form>
    </div>
  );
}

function ResolveForm({ d, eventId, onResolve, noteError, busy }: { d: DisputeDetail; eventId: string | null; onResolve: (status: string, outcome: string, note: string, corrections?: Record<string, unknown>[]) => void; noteError: string; busy: boolean }) {
  const [status, setStatus] = useState("resolved");
  const [outcome, setOutcome] = useState("upheld");
  const [text, setText] = useState("");
  const corr = useCorrections(eventId, d);
  const withCorrections = correctionsAllowed(status, outcome);
  const submit = () => {
    if (!withCorrections) { onResolve(status, outcome, text); return; }
    const payload = corr.submit();
    if (payload === null) return; // the problems are shown beside each correction
    onResolve(status, outcome, text, payload);
  };
  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate className={`${box} space-y-4`}>
      <h3 className={h3}>Decide this dispute</h3>
      <SelectInput id="r-status" label="Decision" value={status} onChange={(v) => { setStatus(v); setOutcome(OUTCOMES[v][0].value); }} options={[{ value: "resolved", label: "Resolve" }, { value: "rejected", label: "Reject" }]} />
      <SelectInput id="r-outcome" label="Outcome" value={outcome} onChange={setOutcome} options={OUTCOMES[status]} />
      <TextArea id="r-note" label="Reason, shown to both teams" value={text} onChange={setText} rows={4} max={1000} error={noteError} help="10 to 1000 characters." />
      {withCorrections
        ? <CorrectionsEditor drafts={corr.drafts} errors={corr.errors} general={corr.general} current={corr.current} state={corr.state} full={corr.full} onAdd={corr.add} onChange={corr.change} onRemove={corr.remove} />
        : <p className="text-xs text-zinc-400">Result corrections can be added when the decision is Resolve with Upheld or Partly upheld.</p>}
      <button type="submit" disabled={busy} className={btnPrimary}>Save decision</button>
    </form>
  );
}

export function DisputeViewScreen() {
  const v = useDisputeView();
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const d = v.detail;
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href="/app/disputes/" className="hover:text-zinc-100">My disputes</Link> / Dispute</nav>
      {v.res.phase === "unavailable" && <><h1 className={h1}>Dispute</h1><NotAvailable what="The dispute portal" /></>}
      {(v.id === null || v.res.phase === "loading") && <><h1 className={h1}>Dispute</h1><Loading show={v.res.phase === "loading" && v.res.showSkeleton} label="Loading the dispute" /></>}
      {v.res.phase === "error" && <><h1 className={h1}>Dispute</h1><ErrorState message={explainFailure(v.res.failure)} onRetry={v.res.reload} /></>}
      {v.id !== null && v.res.phase === "ready" && !d && <><h1 className={h1}>Dispute</h1><EmptyState title="Dispute not found" body="It does not exist, or you are not part of it." action={<Link href="/app/disputes/" className={btnSecondary}>My disputes</Link>} /></>}
      {d && (
        <>
          <header className="space-y-3">
            <h1 className={h1}>{typeLabel(d.type)}</h1>
            <p className="flex flex-wrap items-center gap-2"><DisputeStatusBadge status={d.status} /><OverdueBadge overdue={d.overdue} /><span className="text-sm text-zinc-300">{d.tournament.title}</span></p>
            <p className="max-w-3xl whitespace-pre-line text-zinc-100">{d.summary}</p>
            <p className="text-sm text-zinc-400">{[d.raisedByTeam && `Raised for ${d.raisedByTeam}`, d.againstTeam && `against ${d.againstTeam}`, d.matchNo !== null && `match ${d.matchNo}`].filter(Boolean).join(" · ")}{d.dueAt && !FINAL_STATUSES.includes(d.status) ? ` · decision due ${when(d.dueAt)}` : ""}</p>
          </header>
          <div aria-live="polite">
            {v.notice && <p role="status" className="text-success"><span aria-hidden="true">+ </span>{v.notice}</p>}
            {v.error && <p role="alert" className="text-danger"><span aria-hidden="true">! </span>{v.error}</p>}
          </div>
          <ResolutionBox d={d} />
          <DisputeTimeline events={d.events} corrections={d.corrections} />
          <EvidenceGrid disputeId={d.id} evidence={d.evidence} />

          {d.permissions.canUploadEvidence && (
            <section className={`${section} space-y-3`} aria-labelledby="add-ev-h">
              <h2 id="add-ev-h" className={h2}>Add evidence</h2>
              <EvidenceUploader items={v.picker.items} onPick={v.picker.add} onRemove={v.picker.remove} full={v.picker.full} busy={v.busy === "upload"} />
              {v.picker.ready.length > 0 && <button type="button" onClick={v.uploadAll} disabled={v.busy === "upload"} className={btnPrimary}>{v.busy === "upload" ? "Uploading" : `Upload ${v.picker.ready.length} image${v.picker.ready.length === 1 ? "" : "s"}`}</button>}
            </section>
          )}

          {d.permissions.canComment && (
            <section className={`${section} space-y-3`} aria-labelledby="cm-h">
              <h2 id="cm-h" className={h2}>Comment</h2>
              <form onSubmit={(e) => { e.preventDefault(); void v.sendComment(); }} noValidate className="space-y-3">
                <TextArea id="cm-note" label="Add a comment" value={v.note} onChange={v.setNote} rows={3} max={1000} error={v.noteError} help="Visible to everyone in this dispute. No phone numbers." />
                <button type="submit" disabled={v.busy === "comment"} className={btnSecondary}>Post comment</button>
              </form>
            </section>
          )}

          {(d.permissions.transitions.length > 0 || d.permissions.canWithdraw || d.permissions.canResolve) && (
            <section className={`${section} space-y-4`} aria-labelledby="act-h">
              <h2 id="act-h" className={h2}>Actions</h2>
              {d.permissions.transitions.length > 0 && <div className="flex flex-wrap gap-3">{d.permissions.transitions.filter((t) => t !== "withdrawn").map((t) => <button key={t} type="button" onClick={() => v.move(t)} disabled={!!v.busy} className={btnSecondary}>Move to: {statusLabel(t)}</button>)}</div>}
              {d.permissions.canResolve && <ResolveForm d={d} eventId={v.eventId} onResolve={v.resolveWith} noteError={v.noteError} busy={v.busy === "resolve"} />}
              {d.permissions.canWithdraw && (confirmWithdraw
                ? <div className="flex flex-wrap gap-3"><button type="button" onClick={() => { setConfirmWithdraw(false); void v.withdraw(); }} className={btnDanger}>Yes, withdraw this dispute</button><button type="button" onClick={() => setConfirmWithdraw(false)} className={btnSecondary}>Keep it open</button></div>
                : <button type="button" onClick={() => setConfirmWithdraw(true)} className={btnDanger}>Withdraw dispute</button>)}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export function OrganiserQueueScreen() {
  const { target, res } = useOrganiserQueue();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className={h1}>Disputes on my tournament</h1>
      {target && !target.slug && !target.eventId && <EmptyState title="Which tournament?" body="Open this page from your tournament, or add ?t=<tournament address> to the link." action={<Link href="/app/disputes/" className={btnSecondary}>My disputes</Link>} />}
      {res.phase === "unavailable" && <NotAvailable what="The dispute portal" />}
      {res.phase === "loading" && target && (target.slug || target.eventId) && <Loading show={res.showSkeleton} label="Loading disputes" />}
      {res.phase === "error" && <ErrorState message={explainFailure(res.failure)} onRetry={res.reload} />}
      {res.phase === "ready" && res.data.slug && (
        <>
          <p className="text-zinc-300">{res.data.title}. Disputes are listed with the soonest deadline first. Decide within 72 hours of the dispute being raised.</p>
          {res.data.items.length === 0 ? <EmptyState title="No disputes" body="Nobody has raised a dispute on this tournament." /> : (
            <ul className="grid gap-4 sm:grid-cols-2">{[...res.data.items].sort((a, b) => Number(FINAL_STATUSES.includes(a.status)) - Number(FINAL_STATUSES.includes(b.status)) || (a.dueAt ?? "").localeCompare(b.dueAt ?? "")).map((d) => <DisputeCard key={d.id} d={d} href={`/app/disputes/view/?id=${encodeURIComponent(d.id)}${res.data.eventId ? `&e=${encodeURIComponent(res.data.eventId)}` : ""}`} />)}</ul>
          )}
        </>
      )}
      <p className="text-sm text-zinc-400"><Link href="/app/disputes/" className={link}>Disputes I am part of</Link></p>
    </div>
  );
}
