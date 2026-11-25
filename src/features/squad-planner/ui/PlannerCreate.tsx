"use client";

import Link from "next/link";
import { GAMES } from "@/features/shared/games";
import { useCopy } from "@/features/shared/hooks/useCopy";
import { SelectInput, TextInput } from "@/features/shared/ui/Fields";
import { NotAvailable } from "@/features/shared/ui/States";
import { box, btnPrimary, btnSecondary, link } from "@/features/shared/ui/styles";
import { MAX_DAYS, ZONES } from "@/features/squad-planner/domain";
import { useCreatePlan } from "@/features/squad-planner/hooks/usePlanner";

const HOURS = Array.from({ length: 24 }, (_, h) => ({ value: String(h), label: `${h === 0 ? 12 : h > 12 ? h - 12 : h}:00 ${h < 12 ? "am" : "pm"}` }));
const END_HOURS = [...HOURS.slice(1), { value: "24", label: "12:00 am (midnight)" }, HOURS[0]!].filter((h, i, a) => a.findIndex((x) => x.value === h.value) === i);

/** The captain's form on /tools/scrim-time-planner/. No account: the plan and its link are made in one tap. */
export default function PlannerCreate() {
  const c = useCreatePlan();
  const copy = useCopy();
  if (c.unavailable) return <NotAvailable what="The scrim time planner" />;
  if (c.created) {
    const msg = `When can you play? Tap your free hours here: ${c.created.link}`;
    return (
      <section className={`${box} space-y-4`} aria-labelledby="pc-done" data-clarity-mask="true">
        <h3 id="pc-done" className="font-display text-lg font-semibold text-zinc-100">Your plan is ready</h3>
        <p className="text-zinc-300">Send this link to your squad. Anyone with the link can add their hours, so share it only in your team chat. It stops working after 30 days.</p>
        <p className="break-all rounded-lg border border-white/10 bg-ink p-3 font-mono text-sm text-zinc-100" translate="no">{c.created.link}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => void copy.copy("link", c.created!.link)} className={btnPrimary}>{copy.copied === "link" ? "Copied" : copy.copied === "failed" ? "Copy failed: select the link" : "Copy the link"}</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className={btnSecondary}>Share on WhatsApp</a>
          <Link href={`/squad/#t=${c.created.token}`} className={btnSecondary}>Open the plan</Link>
        </div>
        <p className="text-sm text-zinc-400">This browser remembers that you made the plan, so you can delete it from the plan page. On another device you cannot delete it; it deletes itself after 30 days.</p>
      </section>
    );
  }
  const f = c.form;
  return (
    <form onSubmit={(e) => { e.preventDefault(); void c.submit(); }} className={`${box} space-y-5`} noValidate aria-label="Make a scrim time plan" data-clarity-mask="true">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput id="pc-game" label="Game" value={f.game} onChange={(v) => c.set("game", v)} options={GAMES} />
        <TextInput id="pc-title" label="Name for the plan (optional)" value={f.title} onChange={(v) => c.set("title", v.slice(0, 60))} maxLength={60} error={c.titleProblem} help="For example: Week 2 scrims. Everyone with the link sees it." />
        <TextInput id="pc-day" type="date" label="First day" value={f.firstDay} onChange={(v) => c.set("firstDay", v)} />
        <SelectInput id="pc-days" label="How many days" value={f.days} onChange={(v) => c.set("days", v as typeof f.days)} options={Array.from({ length: MAX_DAYS }, (_, i) => ({ value: String(i + 1), label: `${i + 1} ${i ? "days" : "day"}` }))} />
        <SelectInput id="pc-from" label="From" value={f.fromHour} onChange={(v) => c.set("fromHour", v)} options={HOURS} />
        <SelectInput id="pc-to" label="Until" value={f.toHour} onChange={(v) => c.set("toHour", v)} options={END_HOURS} help="An end before the start runs past midnight, for late-night scrims." />
        <SelectInput id="pc-tz" label="Time zone of these hours" value={f.tz} onChange={(v) => c.set("tz", v)} options={ZONES} help="Teammates see every slot in their own time zone." />
        <SelectInput id="pc-step" label="Slot length" value={f.slotMinutes} onChange={(v) => c.set("slotMinutes", v === "30" ? "30" : "60")} options={[{ value: "60", label: "1 hour" }, { value: "30", label: "30 minutes" }]} />
      </div>
      <p className="text-sm text-zinc-300" aria-live="polite">{c.grid?.ok ? `${c.grid.slots.length} time slots for your squad to tap.` : c.grid ? c.grid.problem : ""}</p>
      {c.error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{c.error}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={c.busy || !c.grid?.ok} className={btnPrimary}>{c.busy ? "Making the plan" : "Make the plan and get a link"}</button>
        <span className="text-sm text-zinc-400">No account needed. <Link href="/privacy/" className={link}>What we keep</Link>: the game, the hours and the names your squad types, for 30 days.</span>
      </div>
    </form>
  );
}
