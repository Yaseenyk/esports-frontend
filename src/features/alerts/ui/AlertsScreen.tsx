"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdult } from "@/features/shared/hooks/useAdult";
import { SelectInput, TextInput } from "@/features/shared/ui/Fields";
import Modal from "@/features/shared/ui/Modal";
import { AdultGate, ErrorState, NotAvailable, SignInPrompt, SkeletonRows, StatusBadge } from "@/features/shared/ui/States";
import { box, btnDanger, btnPrimary, btnSecondary, h1, h2, link, section } from "@/features/shared/ui/styles";
import { explainFailure } from "@/features/shared/failure";
import { ALERT_GAMES, ALERT_KINDS, MAX_RULES, STATUS_WORDS } from "@/features/alerts/domain";
import { useAlerts } from "@/features/alerts/hooks/useAlerts";

/** /app/alerts/: tournament alert settings (the app area is noindex). */
export default function AlertsScreen() {
  const a = useAlerts();
  const adult = useAdult(a.adultNeeded);
  const [askDelete, setAskDelete] = useState(false);
  const wrap = (body: React.ReactNode) => <div className="mx-auto max-w-3xl space-y-6"><h1 className={h1}>Tournament alerts</h1>{body}</div>;
  if (a.res.phase === "unavailable") return wrap(<NotAvailable what="Tournament alerts" />);
  if (a.res.phase === "signin") return wrap(<SignInPrompt what="Sign in to choose which tournaments you hear about." next="/app/alerts/" />);
  if (a.res.phase === "error") return wrap(<ErrorState message={explainFailure(a.res.failure)} onRetry={a.res.reload} />);
  if (!a.settings) return wrap(a.res.phase === "loading" && a.res.showSkeleton ? <SkeletonRows n={2} label="Loading your alerts" /> : <p className="sr-only">Loading your alerts</p>);
  const s = a.settings, w = STATUS_WORDS[s.status];
  return wrap(
    <>
      <p className="text-zinc-300">Get an email when a free-entry tournament that fits you is published or opens registration. At most one email a day, and every email has a one-click unsubscribe link.</p>
      <section className={box} aria-labelledby="st-h">
        <h2 id="st-h" className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold text-zinc-100">Status <StatusBadge label={w.label} tone={w.tone} /></h2>
        <p className="mt-2 text-zinc-300">{w.body}</p>
        {s.email && <p className="mt-2 text-sm text-zinc-400">Emails go to your account address, <span className="font-mono" translate="no" data-clarity-mask="true">{s.email}</span>. Change it in <Link href="/app/account/" className={link}>your account</Link>.</p>}
        {!s.mailer && <p className="mt-2 text-sm text-warning">Email sending is not set up on the server yet, so alerts cannot be confirmed for now.</p>}
      </section>
      {a.adultNeeded && !adult.adult && <AdultGate busy={adult.busy} error={adult.error} onConfirm={() => { void adult.confirm().then(() => a.setAdultNeeded(false)); }} />}
      <form onSubmit={(e) => { e.preventDefault(); void a.save(); }} className="space-y-4" aria-labelledby="rules-h" noValidate data-clarity-mask="true">
        <h2 id="rules-h" className={h2}>What to tell you about</h2>
        <ol className="space-y-4">
          {a.rules.map((r, i) => (
            <li key={i} className={box}>
              <div className="grid gap-4 sm:grid-cols-3">
                <SelectInput id={`ar-game-${i}`} label="Game" value={r.game} onChange={(v) => a.setRule(i, { game: v })} options={ALERT_GAMES} />
                <TextInput id={`ar-place-${i}`} label="Where" value={r.place === "any" ? "" : r.place} onChange={(v) => a.setRule(i, { place: v || "any" })} maxLength={60} error={a.problems[i]} help="A city, or Online. Empty means anywhere." />
                <SelectInput id={`ar-kind-${i}`} label="Type" value={r.kind} onChange={(v) => a.setRule(i, { kind: v })} options={ALERT_KINDS} />
              </div>
              {a.rules.length > 1 && <button type="button" onClick={() => a.removeRule(i)} className={`${btnSecondary} mt-3`}>Remove this alert</button>}
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3">
          {a.rules.length < MAX_RULES && <button type="button" onClick={a.addRule} className={btnSecondary}>Add another alert</button>}
          <button type="submit" disabled={a.busy} className={btnSecondary}>Save alerts</button>
          {s.status !== "active" && <button type="button" onClick={() => void a.confirm()} disabled={a.busy || !s.mailer} className={btnPrimary}>{s.status === "pending" ? "Send the link again" : "Save and confirm my email"}</button>}
        </div>
      </form>
      <div aria-live="polite">
        {a.notice && <p role="status" className="text-success"><span aria-hidden="true">+ </span>{a.notice}</p>}
        {a.error && <p role="alert" className="text-danger"><span aria-hidden="true">! </span>{a.error}</p>}
      </div>
      <section className={`${section} space-y-3`} aria-labelledby="stop-h">
        <h2 id="stop-h" className={h2}>Stop or delete</h2>
        <p className="text-zinc-300">Stopping keeps your saved alerts. Deleting removes the alerts, the confirmation and the list of tournaments already sent to you.</p>
        <div className="flex flex-wrap gap-3">
          {s.status === "active" && <button type="button" onClick={() => void a.stop()} disabled={a.busy} className={btnSecondary}>Stop emails</button>}
          <button type="button" onClick={() => setAskDelete(true)} className={btnDanger}>Delete my alerts</button>
        </div>
        <Modal open={askDelete} onClose={() => setAskDelete(false)} title="Delete your alerts?">
          <p className="text-zinc-300">Your alerts and their history are deleted, and no more emails are sent.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => { void a.remove().then(() => setAskDelete(false)); }} className={btnDanger}>Delete</button>
            <button type="button" onClick={() => setAskDelete(false)} className={btnSecondary}>Keep them</button>
          </div>
        </Modal>
      </section>
    </>,
  );
}
