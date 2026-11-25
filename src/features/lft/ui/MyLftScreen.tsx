"use client";

import Link from "next/link";
import { useState } from "react";
import { useInbox, useLftBlocks, useMyLft } from "@/features/lft/hooks/useMyLft";
import { gameLabel, kindLabel, REPORT_REASONS, type InboxApplication, type MyListing, type SentApplication } from "@/features/lft/domain";
import { ContactList } from "@/features/lft/ui/LftParts";
import { v3Enabled } from "@/features/shared/flags";
import { SelectInput, TextArea } from "@/features/shared/ui/Fields";
import Modal from "@/features/shared/ui/Modal";
import { explainFailure } from "@/features/shared/failure";
import { EmptyState, ErrorState, NotAvailable, SkeletonRows, StatusBadge } from "@/features/shared/ui/States";
import { box, btnDanger, btnPrimary, btnSecondary, h1, h2, section } from "@/features/shared/ui/styles";

const TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = { accepted: "success", declined: "danger", sent: "warning", withdrawn: "neutral", open: "success", closed: "neutral", filled: "neutral" };
const word = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function ReportRequestDialog({ open, onClose, onSend }: { open: boolean; onClose: () => void; onSend: (reason: string, note: string) => Promise<string> }) {
  const [reason, setReason] = useState("spam");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"" | "busy" | "done">("");
  const [error, setError] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Report this request">
      {state === "done" ? <div role="status" className="space-y-4"><p className="text-zinc-100">Thank you. A moderator will look at it. You can also block this player.</p><button type="button" onClick={onClose} className={btnPrimary}>Done</button></div> : (
        <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setState("busy"); const err = await onSend(reason, note); setError(err); setState(err ? "" : "done"); }}>
          <SelectInput id="rq-reason" label="What is wrong?" value={reason} onChange={setReason} options={REPORT_REASONS} />
          <TextArea id="rq-note" label="Anything we should know? (optional)" value={note} onChange={setNote} rows={3} />
          {error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{error}</p>}
          <div className="flex flex-wrap gap-3"><button type="submit" disabled={state === "busy"} className={btnPrimary}>Send report</button><button type="button" onClick={onClose} className={btnSecondary}>Cancel</button></div>
        </form>
      )}
    </Modal>
  );
}

function ApplicationRow({ a, busy, onDecide, onBlock, onReport }: { a: InboxApplication; busy: boolean; onDecide: (d: "accept" | "decline") => void; onBlock?: () => void; onReport?: (reason: string, note: string) => Promise<string> }) {
  const [reporting, setReporting] = useState(false);
  return (
    <li className="border-t border-white/10 py-3">
      <p className="flex flex-wrap items-center gap-2"><StatusBadge label={word(a.status)} tone={TONE[a.status] ?? "neutral"} />{a.profileSlug && <Link href={`/players/view/?s=${encodeURIComponent(a.profileSlug)}`} className="text-sm text-cyan-400 underline underline-offset-2">Public resume</Link>}</p>
      {a.message && <p className="mt-2 whitespace-pre-line text-zinc-100">{a.message}</p>}
      {a.status === "accepted" && <ContactList contacts={a.contacts} legacy={a.contact} />}
      {a.status === "sent" && (
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" disabled={busy} onClick={() => onDecide("accept")} className={btnPrimary}>Accept</button>
          <button type="button" disabled={busy} onClick={() => onDecide("decline")} className={btnDanger}>Decline</button>
        </div>
      )}
      {a.status === "sent" && <p className="mt-2 text-xs text-zinc-400">Their contact is shown only after you accept.</p>}
      {(onBlock || onReport) && (
        <div className="mt-2 flex flex-wrap gap-3">
          {onReport && <button type="button" onClick={() => setReporting(true)} className={btnSecondary}>Report</button>}
          {onBlock && <button type="button" disabled={busy} onClick={onBlock} className={btnDanger}>Block this player</button>}
        </div>
      )}
      {onReport && <ReportRequestDialog open={reporting} onClose={() => setReporting(false)} onSend={onReport} />}
    </li>
  );
}

function Inbox({ listingId, onChanged }: { listingId: string; onChanged: () => void }) {
  const { inbox, decide, block, report, error, busyId } = useInbox(listingId, onChanged);
  const match = v3Enabled("lftmatch");
  if (inbox.phase === "loading") return <p className="text-sm text-zinc-400">Loading applications</p>;
  if (inbox.phase === "error") return <ErrorState message={explainFailure(inbox.failure)} onRetry={inbox.reload} />;
  if (inbox.phase !== "ready") return null;
  return (
    <div>
      {error && <p role="alert" className="mb-2 text-sm text-danger"><span aria-hidden="true">! </span>{error}</p>}
      {inbox.data.length === 0 ? <p className="text-sm text-zinc-300">No applications yet.</p> : <ul>{inbox.data.map((a) => <ApplicationRow key={a.id} a={a} busy={busyId === a.id} onDecide={(d) => decide(a.id, d)} {...(match ? { onBlock: () => void block(a.id), onReport: (r: string, n: string) => report(a.id, r, n) } : {})} />)}</ul>}
    </div>
  );
}

function ListingRow({ l, busy, onBump, onClose, onChanged }: { l: MyListing; busy: boolean; onBump: () => void; onClose: (s: "closed" | "filled") => void; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const live = l.status === "open";
  return (
    <li className={box}>
      <p className="flex flex-wrap items-center gap-2"><StatusBadge label={word(l.status)} tone={TONE[l.status] ?? "neutral"} />{l.hidden && <StatusBadge label="Hidden pending review" tone="danger" />}<span className="text-sm text-zinc-300">{gameLabel(l.game)} · {kindLabel(l.kind)}</span></p>
      <p className="mt-2 text-zinc-100">{l.message}</p>
      <p className="mt-1 text-xs text-zinc-400">Contact on file: {l.contact || "none"} (never public) · {l.reportCount} {l.reportCount === 1 ? "report" : "reports"}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={btnSecondary}>Applications ({l.applications})</button>
        {live && <button type="button" disabled={busy} onClick={onBump} className={btnSecondary}>Bump</button>}
        {live && <button type="button" disabled={busy} onClick={() => onClose("filled")} className={btnSecondary}>Mark filled</button>}
        {live && <button type="button" disabled={busy} onClick={() => onClose("closed")} className={btnDanger}>Close</button>}
      </div>
      {open && <div className="mt-4"><Inbox listingId={l.id} onChanged={onChanged} /></div>}
    </li>
  );
}

function SentRow({ a, busy, onWithdraw, onBlock }: { a: SentApplication; busy: boolean; onWithdraw: () => void; onBlock?: () => void }) {
  return (
    <li className={box}>
      <p className="flex flex-wrap items-center gap-2"><StatusBadge label={word(a.status)} tone={TONE[a.status] ?? "neutral"} /><span className="text-sm text-zinc-300">{gameLabel(a.game)} · {kindLabel(a.kind)}{a.teamName ? ` · ${a.teamName}` : ""}</span></p>
      {a.status === "accepted" && <ContactList contacts={a.contacts} legacy={a.contact} />}
      <div className="mt-3 flex flex-wrap gap-3">
        {a.status === "sent" && <button type="button" disabled={busy} onClick={onWithdraw} className={btnSecondary}>Withdraw</button>}
        {onBlock && <button type="button" disabled={busy} onClick={onBlock} className={btnDanger}>Block</button>}
      </div>
    </li>
  );
}

export default function MyLftScreen() {
  const m = useMyLft();
  if (m.listings.phase === "unavailable") return <div className="mx-auto max-w-3xl space-y-6"><h1 className={h1}>My listings</h1><NotAvailable what="The board" /></div>;
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4"><h1 className={h1}>My listings</h1><Link href="/lft/new/" className={btnPrimary}>Post a listing</Link></header>
      <div aria-live="polite">
        {m.notice && <p role="status" className="text-success"><span aria-hidden="true">+ </span>{m.notice}</p>}
        {m.error && <p role="alert" className="text-danger"><span aria-hidden="true">! </span>{m.error}</p>}
      </div>
      <section aria-labelledby="mine-h" className="space-y-4">
        <h2 id="mine-h" className={h2}>Listings I posted</h2>
        {m.listings.phase === "loading" && (m.listings.showSkeleton ? <SkeletonRows n={2} label="Loading your listings" /> : <p className="sr-only">Loading your listings</p>)}
        {m.listings.phase === "error" && <ErrorState message={explainFailure(m.listings.failure)} onRetry={m.listings.reload} />}
        {m.listings.phase === "signin" && <ErrorState message="Please sign in again." />}
        {m.listings.phase === "ready" && (m.listings.data.length === 0
          ? <EmptyState title="No listings yet" body="You have not posted anything. A listing stays open for up to 30 days." action={<Link href="/lft/new/" className={btnPrimary}>Post a listing</Link>} />
          : <ul className="space-y-4">{m.listings.data.map((l) => <ListingRow key={l.id} l={l} busy={m.busyId === l.id} onBump={() => m.bump(l.id)} onClose={(s) => m.close(l.id, s)} onChanged={m.listings.reload} />)}</ul>)}
      </section>
      <section aria-labelledby="sent-h" className={`${section} space-y-4`}>
        <h2 id="sent-h" className={h2}>Applications I sent</h2>
        {m.sent.phase === "loading" && <p className="text-sm text-zinc-400">Loading</p>}
        {m.sent.phase === "error" && <ErrorState message={explainFailure(m.sent.failure)} onRetry={m.sent.reload} />}
        {m.sent.phase === "ready" && (m.sent.data.length === 0
          ? <EmptyState title="No applications" body="Find a listing on the board and apply to it." action={<Link href="/lft/" className={btnSecondary}>See the board</Link>} />
          : <ul className="space-y-4">{m.sent.data.map((a) => <SentRow key={a.id} a={a} busy={m.busyId === a.id} onWithdraw={() => m.withdraw(a.id)} {...(v3Enabled("lftmatch") ? { onBlock: () => void m.blockPoster(a.id) } : {})} />)}</ul>)}
      </section>
      {v3Enabled("lftmatch") && <BlockedSection />}
    </div>
  );
}

function BlockedSection() {
  const b = useLftBlocks();
  return (
    <section aria-labelledby="blk-h" className={`${section} space-y-4`}>
      <h2 id="blk-h" className={h2}>People you blocked</h2>
      {b.error && <p role="alert" className="text-danger"><span aria-hidden="true">! </span>{b.error}</p>}
      {b.list.phase === "ready" && (b.list.data.length === 0 ? <p className="text-zinc-300">Nobody. Blocking someone from a request stops requests both ways.</p> : (
        <ul className="space-y-2">{b.list.data.map((x) => <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-2"><span className="text-zinc-100">{x.label || "Blocked account"}</span><button type="button" onClick={() => void b.remove(x.id)} className={btnSecondary}>Unblock</button></li>)}</ul>
      ))}
    </section>
  );
}
