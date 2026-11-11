"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import ToolStep from "@/components/tools/ToolStep";
import { events, explain, type CloudEvent } from "@/lib/api/cloud";
import { duplicate } from "@/lib/api/f-duplicate";
import { safeRole } from "@/lib/role";
import {
  DEFAULT_INCLUDE, NAME_MAX, NEVER_COPIED, OPTIONS, buildRequest, dateProblem, defaultName, eventHref, includeProblem, nameProblem, nextWeekName, sameTimeNextWeek, summaryLines,
  type DuplicateInclude, type Role,
} from "@/lib/duplicate";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Header action next to the event title (owner and editors): "Run this event again" opens a two-step dialog and makes a new event. */
export default function DuplicateEventButton({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => { setOpen(false); window.setTimeout(() => opener.current?.focus(), 0); }, []);
  return (
    <>
      <button ref={opener} type="button" className="btn-ghost !min-h-11 px-4 text-sm" aria-haspopup="dialog" onClick={() => setOpen(true)}>Run this event again</button>
      {open && <DuplicateDialog eventId={eventId} eventName={eventName} onClose={close} />}
    </>
  );
}

function DuplicateDialog({ eventId, eventName, onClose }: { eventId: string; eventName: string; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>("viewer"); // until the list says otherwise, nothing owner-only is offered
  const [srcDate, setSrcDate] = useState("");
  const [name, setName] = useState(defaultName(eventName));
  const [date, setDate] = useState("");
  const [inc, setInc] = useState<DuplicateInclude>(DEFAULT_INCLUDE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<CloudEvent | null>(null);
  const [weekNote, setWeekNote] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const nameId = useId();
  const dateId = useId();

  // The source event's date and the caller's role come from the (cached) events list.
  useEffect(() => {
    let live = true;
    events.list().then((l) => {
      const me = l.find((e) => e.id === eventId);
      if (!live || !me) return;
      setRole(safeRole(me.role));
      setSrcDate(me.date ?? "");
      setDate((d) => d || me.date || "");
    }).catch(() => undefined);
    return () => { live = false; };
  }, [eventId]);

  // Focus moves into the dialog; Tab stays inside; Escape closes (unless a copy is being made); the page behind does not scroll.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => box.current?.querySelector<HTMLElement>("input")?.focus(), 0);
    return () => { window.clearTimeout(id); document.body.style.overflow = prev; };
  }, []);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !busy) { e.stopPropagation(); onClose(); return; }
    if (e.key !== "Tab" || !box.current) return;
    const items = [...box.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (!items.length) return;
    const first = items[0]!, last = items[items.length - 1]!;
    if (e.shiftKey && (document.activeElement === first || document.activeElement === box.current)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const nextWeek = () => {
    const nd = sameTimeNextWeek(srcDate || date);
    if (!nd) { setWeekNote("This event's date is not in year-month-day form, so type the new date yourself."); return; }
    setWeekNote("");
    setName(nextWeekName(eventName, srcDate || date, nd));
    setDate(nd);
  };

  const problem = nameProblem(name) ?? dateProblem(date);
  const choiceProblem = includeProblem(inc, role);
  const toggle = (k: keyof DuplicateInclude) => setInc((s) => {
    const next = { ...s, [k]: !s[k] } as DuplicateInclude;
    if (k === "teams" && !next.teams) next.people = false; // people only come with their teams
    return next;
  });

  const go = async () => {
    setBusy(true); setError("");
    try { setCreated(await duplicate.run(eventId, buildRequest(name, date, inc, role))); }
    catch (e) { setError(explain(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="no-print fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onKeyDown={onKey} className="w-full max-w-xl space-y-4 rounded-2xl border border-white/15 bg-ink p-4 outline-none sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-display text-xl font-bold text-white">Run this event again</h2>
          <button type="button" className="btn-ghost !min-h-11 px-3 text-sm" onClick={onClose} disabled={busy} aria-label="Close without making a copy">Close</button>
        </div>

        {created ? (
          <div className="space-y-4">
            <p role="status" aria-live="polite" className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-3 text-sm text-emerald-100">Created. <strong>{created.name}</strong> is ready, and {eventName} is unchanged.</p>
            <p className="text-sm text-zinc-300">Check the date, the venue and your teams, then open the registration form when you are ready. Nothing in the new event is public yet.</p>
            <div className="flex flex-wrap gap-2">
              <Link href={eventHref(created.id)} className="btn !min-h-11 px-4 text-sm" onClick={onClose}>Open the new event</Link>
              <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={onClose}>Stay here</button>
            </div>
          </div>
        ) : step === 1 ? (
          <ToolStep n={1} title="Name and date" hint="This is what the new event is called and when it happens. You can change both later.">
            <div className="space-y-3">
              <div>
                <label htmlFor={nameId} className="text-sm font-semibold text-zinc-200">Name of the new event</label>
                <input id={nameId} className="field mt-1 w-full" value={name} maxLength={NAME_MAX + 20} onChange={(e) => setName(e.target.value)} aria-invalid={nameProblem(name) ? true : undefined} />
              </div>
              <div>
                <label htmlFor={dateId} className="text-sm font-semibold text-zinc-200">Date</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  <input id={dateId} className="field min-w-0 flex-1" value={date} maxLength={40} placeholder="2026-12-08" onChange={(e) => setDate(e.target.value)} />
                  <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={nextWeek}>Same time next week</button>
                </div>
                <p className="mt-1 text-xs text-zinc-400">Leave it as it is to keep the old date. &ldquo;Same time next week&rdquo; adds 7 days to the old date.</p>
                {weekNote && <p role="status" className="mt-1 text-xs text-amber-200">{weekNote}</p>}
              </div>
              {problem && <p role="alert" className="text-sm text-red-300">{problem}</p>}
              <div className="flex justify-end"><button type="button" className="btn !min-h-11 px-5 text-sm" disabled={!!problem} onClick={() => setStep(2)}>Next: what to bring over</button></div>
            </div>
          </ToolStep>
        ) : (
          <ToolStep n={2} title="What to bring over" hint="Tick what the new event should start with. You can add or change anything later.">
            <fieldset className="space-y-2" disabled={busy}>
              <legend className="sr-only">What to bring over</legend>
              {OPTIONS.filter((o) => !o.ownerOnly || role === "owner").map((o) => (
                <label key={o.key} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3">
                  <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-cyan" checked={inc[o.key]} disabled={o.key === "people" && !inc.teams} onChange={() => toggle(o.key)} />
                  <span className="text-sm">
                    <span className="block font-semibold text-white">{o.label}</span>
                    <span className="block text-zinc-300">{o.hint}</span>
                    {o.warning && <span className="mt-1 block font-medium text-amber-200">{o.warning}</span>}
                    {o.key === "people" && !inc.teams && <span className="mt-1 block text-zinc-400">Tick Teams first: people come over with their teams.</span>}
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="space-y-1 rounded-xl bg-white/5 p-3 text-sm text-zinc-200" role="group" aria-label="Summary">
              <p className="font-semibold text-white">Summary</p>
              {summaryLines(name, date, inc).map((l) => <p key={l} className={l === NEVER_COPIED ? "text-zinc-400" : undefined}>{l}</p>)}
            </div>
            <p className="text-xs text-zinc-400">Pressing the button below makes a new event that you own. The old event is not changed.</p>
            {(choiceProblem || error) && <p role="alert" className="text-sm text-red-300">{choiceProblem ?? error}</p>}
            <p role="status" aria-live="polite" className="text-sm text-cyan">{busy ? "Making the new event…" : ""}</p>
            <div className="flex flex-wrap justify-between gap-2">
              <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" disabled={busy} onClick={() => { setError(""); setStep(1); }}>Back</button>
              <button type="button" className="btn !min-h-11 px-5 text-sm" disabled={busy || !!choiceProblem} onClick={go}>{busy ? "Making…" : error ? "Try again" : "Make the new event"}</button>
            </div>
          </ToolStep>
        )}
      </div>
    </div>
  );
}
