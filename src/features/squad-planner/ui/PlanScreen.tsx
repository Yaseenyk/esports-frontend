"use client";

import Link from "next/link";
import { useState } from "react";
import { gameLabel } from "@/features/shared/games";
import { useCopy } from "@/features/shared/hooks/useCopy";
import { TextInput } from "@/features/shared/ui/Fields";
import Modal from "@/features/shared/ui/Modal";
import { EmptyState, ErrorState, SkeletonRows } from "@/features/shared/ui/States";
import { box, btnDanger, btnPrimary, btnSecondary, focus, h1, h2, link, section } from "@/features/shared/ui/styles";
import { dayLabel, groupByDay, scrimLink, timeLabel } from "@/features/squad-planner/domain";
import { usePlan } from "@/features/squad-planner/hooks/usePlanner";

/** Shade by how many are free: a word and a number carry the meaning, the shade only supports it. */
const shade = (n: number, of: number): string => (n === 0 || of === 0 ? "" : n === of ? "bg-cyan-400/20" : n / of >= 0.5 ? "bg-cyan-400/10" : "bg-cyan-400/5");

/** The shared plan page (/squad/#t=...): tap your free hours, see the best times, post a scrim. noindex, token in the fragment only. */
export default function PlanScreen() {
  const p = usePlan();
  const copy = useCopy();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const zone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";

  if (p.phase === "nolink") return <EmptyState asPage title="This link is not complete" body="A plan link ends with #t= and a long code. Ask your captain to send it again, or make your own plan." action={<Link href="/tools/scrim-time-planner/" className={btnPrimary}>Make a plan</Link>} />;
  if (p.phase === "gone") return <EmptyState asPage title={p.notice || "This plan is gone"} body={p.notice ? "Nothing is left on our side." : "Plans delete themselves 30 days after they are made, and a captain can delete one sooner. Or the link was copied wrongly."} action={<Link href="/tools/scrim-time-planner/" className={btnPrimary}>Make a new plan</Link>} />;
  if (p.phase === "loading" || !p.plan) {
    return (
      <div className="mx-auto max-w-3xl space-y-6"><h1 className={h1}>Squad plan</h1>
        {p.phase === "error" ? <ErrorState message={p.error} onRetry={() => void p.reload()} /> : <SkeletonRows n={3} label="Loading the plan" />}
      </div>
    );
  }
  const plan = p.plan;
  const days = groupByDay(plan.slots);
  const people = plan.people.length;
  return (
    <div className="mx-auto max-w-3xl space-y-8" data-clarity-mask="true">
      <header className="space-y-2">
        <h1 className={h1}>{plan.title || `${gameLabel(plan.game)} squad plan`}</h1>
        <p className="text-zinc-300">{gameLabel(plan.game)} · {people} {people === 1 ? "person has" : "people have"} answered · times shown in your time zone{zone ? ` (${zone})` : ""}.</p>
      </header>

      <section aria-labelledby="best-h" className="space-y-4">
        <h2 id="best-h" className={h2}>Best times</h2>
        <label className="flex flex-wrap items-center gap-2 text-zinc-100">
          <span>Session length</span>
          <select value={p.length} onChange={(e) => p.setLength(Number(e.target.value))} className={`min-h-11 rounded-lg border border-white/10 bg-surface px-3 text-zinc-100 ${focus}`}>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{(n * plan.slotMinutes) / 60} {n * plan.slotMinutes === 60 ? "hour" : "hours"}</option>)}
          </select>
        </label>
        {p.windows.length === 0 ? <p className="text-zinc-300">{people === 0 ? "Nobody has answered yet. Add your hours below and share the link." : "No time works for anyone for that long yet. Try a shorter session."}</p> : (
          <ol className="space-y-3">
            {p.windows.map((w) => (
              <li key={w.start} className={box}>
                <p className="font-display text-lg font-semibold text-zinc-100">{dayLabel(w.start)}, {timeLabel(w.start)} to {timeLabel(w.start + w.slots * plan.slotMinutes * 60)}</p>
                <p className="mt-1 text-zinc-300"><span className="font-mono tabular-nums">{w.free}</span> of <span className="font-mono tabular-nums">{people}</span> free{w.free === people ? " (everyone)" : ""}: {w.names.join(", ")}</p>
                <Link href={scrimLink(w.start, plan.game)} className={`${link} mt-2 inline-flex min-h-11 items-center`}>Post a scrim at this time</Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="mine-h" className={`${section} space-y-4`}>
        <h2 id="mine-h" className={h2}>Your free hours</h2>
        <TextInput id="pl-name" label="Your name" value={p.name} onChange={p.setName} maxLength={24} error={p.nameError} help="The name your squad knows you by. Everyone with the link sees it." autoComplete="nickname" />
        <p className="text-sm text-zinc-400">Tap every slot you can play. The number is how many teammates are free then.</p>
        <div className="space-y-5">
          {days.map((d) => (
            <fieldset key={d.key}>
              <legend className="mb-2 text-sm font-medium text-zinc-100">{d.label}</legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {d.items.map((s) => {
                  const on = p.picks.has(s.index);
                  return (
                    <button key={s.index} type="button" aria-pressed={on} onClick={() => p.toggle(s.index)}
                      className={`min-h-11 rounded-lg border px-2 text-sm transition-colors ${focus} ${on ? "border-cyan-400 text-zinc-100" : "border-white/10 text-zinc-300 hover:border-white/30"} ${shade(plan.counts[s.index] ?? 0, people)}`}>
                      <span className="block">{timeLabel(s.start)}</span>
                      <span className="block text-xs text-zinc-300">{on ? "You: free" : "Tap if free"} · <span className="font-mono tabular-nums">{plan.counts[s.index] ?? 0}</span></span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
        <div aria-live="polite">
          {p.notice && <p role="status" className="text-success"><span aria-hidden="true">+ </span>{p.notice}</p>}
          {p.error && <p role="alert" className="text-danger"><span aria-hidden="true">! </span>{p.error}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => void p.save()} disabled={p.busy || !p.name.trim()} className={btnPrimary}>{p.busy ? "Saving" : p.hasMine ? "Save my changes" : "Save my hours"}</button>
          {p.hasMine && <button type="button" onClick={() => void p.remove()} disabled={p.busy} className={btnSecondary}>Remove my answers</button>}
        </div>
        <p className="text-xs text-zinc-400">This browser keeps a private key so only you can change your answers. Clearing site data loses it.</p>
      </section>

      <section aria-labelledby="share-h" className={`${section} space-y-3`}>
        <h2 id="share-h" className={h2}>Share</h2>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => void copy.copy("link", window.location.href)} className={btnSecondary}>{copy.copied === "link" ? "Link copied" : "Copy the link"}</button>
          {p.windows[0] && <button type="button" onClick={() => void copy.copy("best", `Best time for ${plan.title || "our scrims"}: ${dayLabel(p.windows[0]!.start)}, ${timeLabel(p.windows[0]!.start)} (${p.windows[0]!.free} of ${people} free). Add your hours: ${window.location.href}`)} className={btnSecondary}>{copy.copied === "best" ? "Copied" : "Copy the best time"}</button>}
        </div>
        <p className="text-sm text-zinc-400">Need players, not a time? Try the <Link href="/lft/" className={link}>team finder</Link>. Planning a whole tournament? Use the <Link href="/tools/schedule/" className={link}>match schedule maker</Link>.</p>
      </section>

      {p.isCaptain && (
        <section aria-labelledby="cap-h" className={`${section} space-y-3`}>
          <h2 id="cap-h" className={h2}>Captain</h2>
          <p className="text-zinc-300">You made this plan in this browser. Deleting it removes the plan and every answer at once. It deletes itself on {new Date(plan.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} anyway.</p>
          <button type="button" onClick={() => setConfirmDelete(true)} className={btnDanger}>Delete plan</button>
          <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this plan?">
            <p className="text-zinc-300">Everyone's names and hours are deleted. The link stops working. This cannot be undone.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={async () => { if (await p.destroy()) setConfirmDelete(false); }} disabled={p.busy} className={btnDanger}>Delete plan</button>
              <button type="button" onClick={() => setConfirmDelete(false)} className={btnSecondary}>Keep it</button>
            </div>
          </Modal>
        </section>
      )}
    </div>
  );
}
