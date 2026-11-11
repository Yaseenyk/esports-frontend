"use client";

import { useCallback, useEffect, useState } from "react";
import type { PanelProps } from "@/components/app/panels";
import ToolStep from "@/components/tools/ToolStep";
import { explain } from "@/lib/api/cloud";
import { directory, type DirectoryOwnerState } from "@/lib/api/f-directory";
import { cleanText, formatDay, LIMITS, MODES, modeLabel, normaliseDraft, validateBasics, validateBlurb, type DirectoryDraft, type Mode, type Problems } from "@/lib/directory";

const blank: DirectoryDraft = { title: "", game: "", city: "", mode: "in-person", startsOn: "", blurb: "" };

/** List this event on the public page /tournaments/, in three steps. Nothing is public until the last button is pressed. */
export default function Panel({ eventId, eventName, role }: PanelProps) {
  const [state, setState] = useState<DirectoryOwnerState | null>(null);
  const [draft, setDraft] = useState<DirectoryDraft>(blank);
  const [step, setStep] = useState(1);
  const [problems, setProblems] = useState<Problems>({});
  const [blurbErr, setBlurbErr] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);
  const [editing, setEditing] = useState(false);
  const canEdit = role !== "viewer";

  const load = useCallback(() => {
    setLoadErr("");
    directory.get(eventId).then((s) => {
      setState(s);
      setDraft(s.entry ? { title: s.entry.title, game: s.entry.game, city: s.entry.city, mode: s.entry.mode, startsOn: s.entry.startsOn, blurb: s.entry.blurb } : { ...blank, ...s.defaults, blurb: "" });
    }).catch((e) => setLoadErr(explain(e)));
  }, [eventId]);
  useEffect(load, [load]);

  const up = (patch: Partial<DirectoryDraft>) => { setDraft((d) => ({ ...d, ...patch })); setMsg(""); };

  const next1 = () => {
    const p = validateBasics(draft);
    setProblems(p);
    if (Object.keys(p).length === 0) setStep(2);
  };
  const next2 = () => {
    const e = validateBlurb(draft.blurb);
    setBlurbErr(e);
    if (!e) setStep(3);
  };

  const list = async () => {
    setBusy(true); setErr(""); setMsg("");
    try {
      const r = await directory.put(eventId, { listed: true, ...normaliseDraft(draft) });
      setState((s) => (s ? { ...s, entry: r.entry, reports: r.reports, hidden: r.hidden } : s));
      setEditing(false); setStep(1);
      setMsg("Done. Your event is now on the public list at /tournaments/. Players press Register and land on your registration page.");
    } catch (e) {
      const s = (e as { status?: number }).status;
      setErr(s === 409 ? "Set up your team registration link first (in the registration section of this event). The listing sends players there." : s === 400 ? ((e as { serverError?: string }).serverError ?? explain(e)) : explain(e));
    } finally { setBusy(false); }
  };

  const unlist = async () => {
    setBusy(true); setErr(""); setMsg("");
    try {
      const r = await directory.put(eventId, { listed: false });
      setState((s) => (s ? { ...s, entry: r.entry, reports: 0, hidden: false } : s));
      setConfirmOff(false);
      setMsg("Removed from the public list. You can list it again any time.");
    } catch (e) { setErr(explain(e)); } finally { setBusy(false); }
  };

  if (loadErr) return <div role="alert" className="card space-y-3 !p-4"><p className="text-sm text-zinc-100">{loadErr}</p><button type="button" className="btn !min-h-11 px-4 text-sm" onClick={load}>Try again</button></div>;
  if (!state) return <p role="status" className="card !p-4 text-sm text-zinc-300">Loading…</p>;

  const live = !!state.entry?.listed;
  const showFlow = canEdit && (!live || editing);

  return (
    <section aria-label="Public events listing" className="space-y-4">
      <div role="status" aria-live="polite" className="min-h-5 text-sm text-emerald-300">{msg}</div>
      {err && <p role="alert" className="rounded-lg border border-zinc-600 p-3 text-sm text-zinc-100">{err}</p>}

      <div className="card space-y-2 !p-4">
        <h3 className="font-display text-lg font-bold text-white">{live ? (state.hidden ? "Listed, but hidden for now" : "Listed publicly") : "Not listed"}</h3>
        {live && state.entry && <p className="text-sm text-zinc-300">{state.entry.title} · {state.entry.game} · {formatDay(state.entry.startsOn)} · {modeLabel(state.entry.mode)}{state.entry.city ? ` · ${state.entry.city}` : ""}</p>}
        {live && state.hidden && <p className="text-sm text-zinc-200">Several people reported this listing, so it is hidden from the public list. Edit it (button below) and it comes back.</p>}
        {!live && <p className="text-sm leading-6 text-zinc-300">Listing puts {eventName} on a public page, /tournaments/, where any player can find it. Only the details you type here are shown: the name, game, city, date, a short description and the Register button. Not your name or email.</p>}
        <p className="text-sm leading-6 text-zinc-300">Anyone can report a listing. When three different people report one, it is hidden until you edit it. The event disappears from the list a week after its start date.</p>
        {!state.hasRegistration && canEdit && !live && <p className="text-sm text-zinc-100">First set up the team registration link for this event. The Register button needs it.</p>}
        {!canEdit && <p className="text-sm text-zinc-300">You can see this but not change it. Ask the owner or an editor.</p>}
        {canEdit && live && !editing && (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => { setEditing(true); setStep(1); setMsg(""); }}>Edit the listing</button>
            {!confirmOff && <button type="button" className="chip !min-h-11" onClick={() => setConfirmOff(true)}>Remove from the list</button>}
          </div>
        )}
        {confirmOff && (
          <div className="space-y-2 rounded-lg border border-zinc-600 p-3">
            <p className="text-sm text-zinc-100">Remove this event from the public list? Players will no longer find it there. Your registration link keeps working for anyone who has it.</p>
            <div className="flex flex-wrap gap-2"><button type="button" className="btn !min-h-11 px-4 text-sm" disabled={busy} onClick={unlist}>{busy ? "Removing…" : "Yes, remove it"}</button><button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => setConfirmOff(false)}>Keep it listed</button></div>
          </div>
        )}
      </div>

      {showFlow && (
        <>
          <ToolStep n={1} title="What is it?" hint="We filled this in from your event. Change anything that is not right." done={step > 1}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-zinc-200 sm:col-span-2">Event name
                <input className="field mt-1 text-base" maxLength={LIMITS.title} value={draft.title} onChange={(e) => up({ title: e.target.value })} aria-invalid={!!problems.title} aria-describedby={problems.title ? "dir-title-e" : undefined} />
                {problems.title && <span id="dir-title-e" role="alert" className="mt-1 block text-sm text-zinc-100">{problems.title}</span>}
              </label>
              <label className="block text-sm font-semibold text-zinc-200">Game
                <input className="field mt-1 text-base" maxLength={LIMITS.game} value={draft.game} onChange={(e) => up({ game: e.target.value })} aria-invalid={!!problems.game} aria-describedby={problems.game ? "dir-game-e" : undefined} />
                {problems.game && <span id="dir-game-e" role="alert" className="mt-1 block text-sm text-zinc-100">{problems.game}</span>}
              </label>
              <label className="block text-sm font-semibold text-zinc-200">Start date
                <input type="date" className="field mt-1 text-base" value={draft.startsOn} onChange={(e) => up({ startsOn: e.target.value })} aria-invalid={!!problems.startsOn} aria-describedby={problems.startsOn ? "dir-date-e" : undefined} />
                {problems.startsOn && <span id="dir-date-e" role="alert" className="mt-1 block text-sm text-zinc-100">{problems.startsOn}</span>}
              </label>
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-semibold text-zinc-200">How is it played?</legend>
                <div className="mt-1 flex flex-wrap gap-2">{MODES.map((m) => <button key={m.id} type="button" className="chip" aria-pressed={draft.mode === m.id} onClick={() => up({ mode: m.id as Mode })}>{m.label}</button>)}</div>
              </fieldset>
              {draft.mode !== "online" && (
                <label className="block text-sm font-semibold text-zinc-200 sm:col-span-2">City
                  <input className="field mt-1 text-base" maxLength={LIMITS.city} value={draft.city} onChange={(e) => up({ city: e.target.value })} aria-invalid={!!problems.city} aria-describedby={problems.city ? "dir-city-e" : undefined} />
                  {problems.city && <span id="dir-city-e" role="alert" className="mt-1 block text-sm text-zinc-100">{problems.city}</span>}
                </label>
              )}
            </div>
            <button type="button" className="btn !min-h-11 px-5" onClick={next1}>Next: describe it</button>
          </ToolStep>

          {step >= 2 && (
            <ToolStep n={2} title="One line about it" hint="Optional. Entry fee, prize, team size: whatever a player wants to know. Do not add phone numbers, emails or links: players register through the button." done={step > 2}>
              <label className="block text-sm font-semibold text-zinc-200">Description
                <textarea className="field mt-1 min-h-24 text-base" maxLength={LIMITS.blurb} value={draft.blurb} onChange={(e) => up({ blurb: e.target.value })} aria-invalid={!!blurbErr} aria-describedby="dir-blurb-h" />
                <span id="dir-blurb-h" className="mt-1 block text-xs text-zinc-300">{cleanText(draft.blurb).length} of {LIMITS.blurb} characters</span>
                {blurbErr && <span role="alert" className="mt-1 block text-sm text-zinc-100">{blurbErr}</span>}
              </label>
              <div className="flex flex-wrap gap-2"><button type="button" className="btn !min-h-11 px-5" onClick={next2}>Next: preview</button><button type="button" className="btn-ghost !min-h-11 px-4" onClick={() => setStep(1)}>Back</button></div>
            </ToolStep>
          )}

          {step >= 3 && (
            <ToolStep n={3} title="Preview and list it" hint="This is what players will see. Pressing the button makes it public straight away.">
              {(() => {
                const n = normaliseDraft(draft);
                return (
                  <div className="card space-y-2 !bg-zinc-950 !p-4">
                    <p className="font-display text-lg font-bold text-white">{n.title}</p>
                    <p className="text-sm text-zinc-200">{n.game} · {formatDay(n.startsOn)} · {modeLabel(n.mode)}{n.city ? ` · ${n.city}` : ""}</p>
                    {n.blurb && <p className="break-words text-sm text-zinc-300">{n.blurb}</p>}
                    <span className="inline-flex min-h-9 items-center rounded-lg bg-cyan px-4 text-sm font-semibold text-ink">Register your team</span>
                  </div>
                );
              })()}
              <p className="text-sm leading-6 text-zinc-300">Anyone on the internet can see this. The Register button opens your registration page, the one you already set up for this event.</p>
              <div className="flex flex-wrap gap-2"><button type="button" className="btn !min-h-11 px-5" disabled={busy} onClick={list}>{busy ? "Listing…" : "List this event publicly"}</button><button type="button" className="btn-ghost !min-h-11 px-4" disabled={busy} onClick={() => setStep(2)}>Back</button>{editing && <button type="button" className="btn-ghost !min-h-11 px-4" onClick={() => { setEditing(false); setStep(1); }}>Cancel</button>}</div>
            </ToolStep>
          )}
        </>
      )}
    </section>
  );
}
