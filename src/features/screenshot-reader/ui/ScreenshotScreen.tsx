"use client";

import Link from "next/link";
import { useId } from "react";
import { explainFailure } from "@/features/shared/failure";
import { EmptyState, ErrorState, NotAvailable, SignInPrompt, SkeletonRows, StatusBadge } from "@/features/shared/ui/States";
import { box, btnDanger, btnPrimary, btnSecondary, h1, h2, h3, helper, input, label, link, section } from "@/features/shared/ui/styles";
import { reviewSummary, rowProblems, type ReviewRow } from "@/features/screenshot-reader/review";
import { useScreenshotReader } from "@/features/screenshot-reader/hooks/useScreenshotReader";

const WHAT = "Reading results from a screenshot";

export function ScreenshotScreen() {
  const v = useScreenshotReader();
  const { ctx } = v;
  const fileId = useId();
  const sum = reviewSummary(v.rows);
  return (
    <div className="mx-auto max-w-5xl space-y-8" data-testid="screenshot-screen">
      <header className="space-y-2">
        <h1 className={h1}>Results from a screenshot</h1>
        {ctx.phase === "ready" && <p className="text-zinc-300"><span key={ctx.data.event.name}>{ctx.data.event.name}</span></p>}
      </header>
      {v.eventId === "" && <EmptyState title="Open this from an event" body="Results belong to one event. Open the event first, then choose Results from a screenshot." action={<Link href="/app/events/" className={btnSecondary}>My events</Link>} />}
      {v.eventId !== "" && ctx.phase === "unavailable" && <NotAvailable what={WHAT} />}
      {ctx.phase === "signin" && <SignInPrompt what="Sign in to enter results." next="/app/events/" />}
      {ctx.phase === "loading" && (ctx.showSkeleton ? <SkeletonRows n={2} label="Loading the event" /> : <p className="sr-only">Loading the event</p>)}
      {ctx.phase === "error" && <ErrorState message={explainFailure(ctx.failure)} onRetry={ctx.reload} />}
      {ctx.phase === "ready" && !ctx.data.canEdit && <p role="note" className={box}>You have view-only access to this event, so you cannot enter results.</p>}
      {ctx.phase === "ready" && ctx.data.canEdit && (
        <>
          <section role="note" aria-labelledby="warn-h" className={`${box} space-y-2`}>
            <h2 id="warn-h" className={`${h3} text-warning`}>Reading can be wrong</h2>
            <p className="text-zinc-300">The screenshot is read by your browser, on this device. It is not uploaded anywhere. Text recognition often misreads names and numbers, so check every value against the screenshot. Nothing is saved until you confirm every row and press Save.</p>
          </section>

          <section aria-labelledby="pick-h" className="space-y-3">
            <h2 id="pick-h" className={h2}>1. Pick the screenshot</h2>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor={fileId} className={label}>Results screenshot (PNG, JPEG or WebP)</label>
                <input id={fileId} type="file" accept="image/png,image/jpeg,image/webp" className={input} onChange={(e) => v.pick(e.target.files?.[0] ?? null)} />
              </div>
              <button type="button" className={btnPrimary} disabled={!v.file || v.phase === "reading"} onClick={() => void v.read()}>Read the screenshot</button>
              <button type="button" className={btnSecondary} onClick={v.add}>Add a row by hand</button>
            </div>
            <p className={helper}>The first read downloads the English text-recognition data once (from the same public source as the ID card scanner).</p>
            {v.phase === "reading" && <p role="status" className="text-sm text-zinc-300">Reading <span key={Math.round(v.progress * 100)}>{Math.round(v.progress * 100)}</span>%</p>}
          </section>

          <p role="status" aria-live="polite" className={`min-h-5 text-sm ${v.msg?.ok === false ? "text-danger" : "text-success"}`}>{v.msg && <span key={v.msg.text}>{v.msg.text}</span>}</p>

          {(v.rows.length > 0 || v.phase === "review") && (
            <section aria-labelledby="review-h" className={`${section} space-y-4`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="review-h" className={h2}>2. Check every row</h2>
                <p className="text-sm text-zinc-300" data-testid="review-summary"><span key={`${sum.confirmed}/${sum.total}`}>{sum.confirmed} of {sum.total} confirmed</span></p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {v.preview && (
                  <figure className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.preview} alt="The screenshot you picked, to compare with the rows" className="max-h-screen w-full rounded-lg border border-white/10 object-contain" />
                    <figcaption className={helper}>Only on this device.</figcaption>
                  </figure>
                )}
                <ul className="space-y-3" aria-label="Rows read from the screenshot">
                  {v.rows.map((r, i) => <RowEditor key={r.id} r={r} n={i + 1} problems={rowProblems(v.rows, r.id)} v={v} />)}
                </ul>
              </div>
              <button type="button" className={btnSecondary} onClick={v.add}>Add a row</button>
            </section>
          )}

          {v.rows.length > 0 && (
            <section aria-labelledby="save-h" className={`${section} space-y-3`}>
              <h2 id="save-h" className={h2}>3. Save</h2>
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-40">
                  <label htmlFor="shot-match" className={label}>Match number</label>
                  <input id="shot-match" inputMode="numeric" value={v.matchNo} onChange={(e) => v.setMatchNo(e.target.value.replace(/\D/g, "").slice(0, 4))} className={input} />
                </div>
                {v.existing && (
                  <label className="flex min-h-11 items-center gap-3 text-zinc-100"><input type="checkbox" checked={v.replace} onChange={(e) => v.setReplace(e.target.checked)} className="h-5 w-5" /> Replace the saved results of this match</label>
                )}
              </div>
              {v.blocker && <p className="text-sm text-warning" data-testid="save-blocker"><span key={v.blocker}>{v.blocker}</span></p>}
              <button type="button" className={btnPrimary} disabled={!!v.blocker || v.busy} onClick={() => void v.save()}>Save confirmed results</button>
            </section>
          )}
          <p className="text-sm text-zinc-400"><Link href="/app/events/" className={link}>Back to my events</Link></p>
        </>
      )}
    </div>
  );
}

function RowEditor({ r, n, problems, v }: { r: ReviewRow; n: number; problems: string[]; v: ReturnType<typeof useScreenshotReader> }) {
  const id = `row-${r.id}`;
  return (
    <li className={`${box} space-y-3`} data-testid="review-row" aria-label={`Row ${n}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-zinc-400">Row {n}{r.raw ? <> · read as <span className="font-mono text-zinc-300" translate="no">{r.raw}</span></> : null}</span>
        <StatusBadge label={r.confirmed ? "Confirmed" : "Not checked"} tone={r.confirmed ? "success" : "warning"} />
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-team`} className={label}>Team</label>
          <input id={`${id}-team`} value={r.team} maxLength={60} onChange={(e) => v.edit(r.id, { team: e.target.value })} className={input} />
        </div>
        <div>
          <label htmlFor={`${id}-place`} className={label}>Placement</label>
          <input id={`${id}-place`} inputMode="numeric" value={r.placement} onChange={(e) => v.edit(r.id, { placement: e.target.value.replace(/\D/g, "").slice(0, 3) })} className={input} />
        </div>
        <div>
          <label htmlFor={`${id}-kills`} className={label}>Kills</label>
          <input id={`${id}-kills`} inputMode="numeric" value={r.kills} onChange={(e) => v.edit(r.id, { kills: e.target.value.replace(/\D/g, "").slice(0, 3) })} className={input} />
        </div>
      </div>
      {r.suggestion && <p className="text-sm text-zinc-300">Did you mean <strong className="text-zinc-100">{r.suggestion}</strong>? <button type="button" className={link} onClick={() => v.suggest(r.id)}>Use this name</button></p>}
      {problems.length > 0 && <ul className="space-y-1 text-sm text-danger">{problems.map((p) => <li key={p}><span aria-hidden="true">! </span>{p}</li>)}</ul>}
      <div className="flex flex-wrap gap-2">
        {r.confirmed
          ? <button type="button" className={btnSecondary} onClick={() => v.unconfirm(r.id)}>Undo confirm</button>
          : <button type="button" className={btnPrimary} disabled={problems.length > 0} onClick={() => v.confirm(r.id)}>Confirm row {n}</button>}
        <button type="button" className={btnDanger} onClick={() => v.remove(r.id)}>Remove row {n}</button>
      </div>
    </li>
  );
}
