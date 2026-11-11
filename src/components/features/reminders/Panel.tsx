"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PanelProps } from "@/components/app/panels";
import ToolStep from "@/components/tools/ToolStep";
import { events } from "@/lib/api/cloud";
import { explainReminder, reminders, type Recipients, type ReminderList } from "@/lib/api/f-reminders";
import {
  TEMPLATES, audienceCount, audienceLabel, audienceOf, audienceWarning, checkMessage, checkSendAt, limitWords, localInputToIso, localTimeText, maskEmail, nowLocalInput, previewText,
  remainingToday, statusLabel, templateById, type TemplateId,
} from "@/lib/reminders";

const when = (iso: string) => localTimeText(iso);

export default function Panel({ eventId, eventName, role }: PanelProps) {
  const canEdit = role !== "viewer";
  const [list, setList] = useState<ReminderList | null>(null);
  const [rec, setRec] = useState<Recipients | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<{ date?: string; venue?: string }>({});

  const [tpl, setTpl] = useState<TemplateId>("tomorrow");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"now" | "later">("later");
  const [local, setLocal] = useState("");
  const [who, setWho] = useState({ organisers: true, captains: true });

  const [busy, setBusy] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [cancelId, setCancelId] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = useCallback(async () => {
    setLoadErr("");
    try {
      if (canEdit) {
        const [l, r] = await Promise.all([reminders.list(eventId), reminders.recipients(eventId)]);
        setList(l); setRec(r);
      } else setRec(await reminders.recipients(eventId));
    } catch (e) { setLoadErr(explainReminder(e, "Could not load reminders. Check your connection and try again.")); }
    finally { setLoading(false); }
  }, [eventId, canEdit]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { events.list().then((l) => { const e = l.find((x) => x.id === eventId); if (e) setInfo({ date: e.date, venue: e.venue }); }).catch(() => undefined); }, [eventId]);

  // Choosing a card fills the subject and message; the person may then change them.
  const pick = (id: TemplateId) => {
    setTpl(id);
    const r = templateById(id).render({ eventName, ...info });
    setSubject(r.subject); setBody(r.body); setConfirming(false); setOk(""); setErr("");
  };
  useEffect(() => { if (!subject && !body) pick("tomorrow"); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [info.date, info.venue]);

  const limits = list?.limits ?? rec?.limits;
  const counts = rec ? { organisers: rec.organisers.count, captains: rec.captains.count } : { organisers: 0, captains: 0 };
  const total = audienceCount(counts, who);
  const audience = audienceOf(who);
  const iso = mode === "now" ? new Date().toISOString() : localInputToIso(local);
  const problem = useMemo(() => checkMessage(subject, body) ?? (mode === "later" ? checkSendAt(iso) : null) ?? (audience === null ? "Choose who should get it." : null) ?? (limits ? audienceWarning(total, limits) : null), [subject, body, mode, iso, audience, limits, total]);

  const sendTest = async () => {
    const m = checkMessage(subject, body); if (m) { setErr(m); return; }
    setBusy("test"); setErr(""); setOk("");
    try { const r = await reminders.test(eventId, { subject, body }); setOk(`A test email was sent to ${r.sentTo}. It went to you only. Check your inbox, and your spam folder if it is not there.`); await load(); }
    catch (e) { setErr(explainReminder(e, "The test could not be sent. Try again in a moment.")); }
    finally { setBusy(""); }
  };
  const schedule = async () => {
    if (problem || !audience) { setErr(problem ?? ""); return; }
    setBusy("schedule"); setErr(""); setOk("");
    try {
      await reminders.create(eventId, { kind: tpl, subject: subject.trim(), body: body.trim(), audience, sendAt: mode === "now" ? null : iso });
      setOk(mode === "now" ? "Done. It goes out within about 15 minutes, in small batches." : `Done. It is scheduled for ${when(iso!)}. You can cancel it below until it starts going out.`);
      setConfirming(false); await load();
    } catch (e) { setErr(explainReminder(e, "The reminder could not be scheduled. Try again in a moment.")); setConfirming(false); }
    finally { setBusy(""); }
  };
  const cancel = async (id: string) => {
    setBusy(`c${id}`); setErr(""); setOk("");
    try { await reminders.cancel(eventId, id); setOk("Cancelled. Nothing was sent."); setCancelId(""); await load(); }
    catch (e) { setErr(explainReminder(e, "Could not cancel it. Try again.")); }
    finally { setBusy(""); }
  };

  if (loading) return <section aria-label="Email reminders" className="card !p-4"><p role="status" className="text-sm text-zinc-300">Loading reminders...</p></section>;
  if (loadErr) return <section aria-label="Email reminders" className="card space-y-3 !p-4"><p role="alert" className="text-sm text-red-200">{loadErr}</p><button type="button" className="btn-ghost px-4 text-sm" onClick={() => { setLoading(true); void load(); }}>Try again</button></section>;

  if (!canEdit) {
    return (
      <section aria-label="Email reminders" className="card space-y-2 !p-4">
        <h3 className="font-display text-lg font-bold text-white">Email reminders</h3>
        <p className="text-sm text-zinc-300">You can view this event but not send emails. Ask the owner or an editor to send a reminder.</p>
        {rec && <p className="text-sm text-zinc-200">{rec.organisers.count} organiser{rec.organisers.count === 1 ? "" : "s"} and {rec.captains.count} captain{rec.captains.count === 1 ? "" : "s"} who agreed to emails.</p>}
      </section>
    );
  }

  const jobs = list?.jobs ?? [];
  const noMailer = list && !list.mailer;
  return (
    <section aria-label="Email reminders" className="space-y-4">
      <p className="text-sm leading-6 text-zinc-300">Send a short email before or after your event. Emails go only to organisers and to captains who gave an address and agreed when they registered. Every email has an unsubscribe link.</p>
      {noMailer && <p role="status" className="rounded-xl border border-amber-500/30 bg-[#0a0b0d] p-3 text-sm text-amber-100">Email sending is not switched on for this server yet, so reminders will wait until it is.</p>}
      {limits && <p className="rounded-xl border border-white/[0.14] bg-[#0a0b0d] p-3 text-sm text-zinc-200" data-testid="limit-words">{limitWords(limits)}</p>}

      <ToolStep n={1} title="Pick what to send" hint="Choose a ready-made message. You can change the words in the boxes below.">
        <div role="group" aria-label="Message templates" className="grid gap-2 sm:grid-cols-2">
          {TEMPLATES.map((t) => (
            <button key={t.id} type="button" aria-pressed={tpl === t.id} onClick={() => pick(t.id)} className={`min-h-11 rounded-xl border p-3 text-left ${tpl === t.id ? "border-cyan bg-cyan/10" : "border-white/[0.14] bg-[#0a0b0d] hover:border-zinc-500"}`}>
              <span className="block font-display font-bold text-white">{t.title}{tpl === t.id ? " (selected)" : ""}</span>
              <span className="block text-sm text-zinc-300">{t.blurb}</span>
            </button>
          ))}
        </div>
        <label className="block text-sm text-zinc-200">Subject<input className="field mt-1" value={subject} maxLength={120} onChange={(e) => { setSubject(e.target.value); setConfirming(false); }} /></label>
        <label className="block text-sm text-zinc-200">Message<textarea className="field mt-1 min-h-40 py-2" value={body} maxLength={2000} onChange={(e) => { setBody(e.target.value); setConfirming(false); }} aria-describedby="rem-msg-help" /></label>
        <p id="rem-msg-help" className="text-xs text-zinc-400">Plain text only. Links are not allowed, so every email stays safe to open.</p>
      </ToolStep>

      <ToolStep n={2} title="When, and who gets it" hint="Pick a time and the people. You can send yourself a test first.">
        <fieldset className="space-y-2"><legend className="text-sm font-semibold text-white">When</legend>
          <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-200"><input type="radio" name="rem-when" className="h-5 w-5 accent-cyan" checked={mode === "now"} onChange={() => { setMode("now"); setConfirming(false); }} />Send now (goes out within about 15 minutes)</label>
          <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-200"><input type="radio" name="rem-when" className="h-5 w-5 accent-cyan" checked={mode === "later"} onChange={() => { setMode("later"); setConfirming(false); }} />At a date and time</label>
          {mode === "later" && (
            <div className="space-y-1 pl-7">
              <label className="block text-sm text-zinc-200">Date and time<input type="datetime-local" className="field mt-1 max-w-xs" value={local} min={nowLocalInput()} onChange={(e) => { setLocal(e.target.value); setConfirming(false); }} /></label>
              <p className="text-sm text-zinc-300" aria-live="polite">{iso ? `That is ${when(iso)}, your local time.` : "Choose a date and time."}</p>
            </div>
          )}
        </fieldset>
        <fieldset className="space-y-2"><legend className="text-sm font-semibold text-white">Who</legend>
          <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-200"><input type="checkbox" className="h-5 w-5 accent-cyan" checked={who.organisers} onChange={(e) => { setWho({ ...who, organisers: e.target.checked }); setConfirming(false); }} />Organisers ({counts.organisers})</label>
          <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-200"><input type="checkbox" className="h-5 w-5 accent-cyan" checked={who.captains} onChange={(e) => { setWho({ ...who, captains: e.target.checked }); setConfirming(false); }} />Captains who agreed to emails ({counts.captains})</label>
          {counts.captains === 0 && <p className="pl-7 text-xs text-zinc-400">No captain has agreed yet. The registration form asks for an optional email and consent.</p>}
          {rec?.items && rec.items.length > 0 && (
            <details className="pl-7 text-sm text-zinc-300"><summary className="min-h-11 cursor-pointer py-2">See the addresses (some letters hidden)</summary>
              <ul className="space-y-1">{rec.items.map((i, n) => <li key={n}>{maskEmail(i.email)} - {i.kind === "organiser" ? "organiser" : "captain"}{i.unsubscribed ? " (unsubscribed)" : ""}</li>)}</ul>
            </details>
          )}
        </fieldset>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-ghost px-4 text-sm" onClick={sendTest} disabled={busy === "test"}>{busy === "test" ? "Sending..." : "Send me a test"}</button>
          <span className="text-xs text-zinc-400">Goes to your own address only.</span>
        </div>
      </ToolStep>

      <ToolStep n={3} title="Preview and schedule" hint="Check the email, then schedule it. Nothing is sent until you confirm.">
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/[0.14] bg-[#0a0b0d] p-3 text-sm text-zinc-100" aria-label="Email preview">{previewText(subject, body, eventName)}</pre>
        <p className="text-sm text-zinc-200">{audience ? `${audienceLabel(audience)}: ${total} ${total === 1 ? "person" : "people"}. ` : ""}{mode === "now" ? "Goes out within about 15 minutes." : iso ? `Goes out ${when(iso)}.` : ""}</p>
        {problem && <p className="text-sm text-amber-200" aria-live="polite">{problem}</p>}
        {confirming ? (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Confirm">
            <p className="w-full text-sm text-zinc-100">This will email {total} {total === 1 ? "person" : "people"}. Emails cannot be taken back once they go out.</p>
            <button type="button" className="btn px-5" onClick={schedule} disabled={busy === "schedule"}>{busy === "schedule" ? "Scheduling..." : "Yes, schedule it"}</button>
            <button type="button" className="btn-ghost px-4 text-sm" onClick={() => setConfirming(false)}>Go back</button>
          </div>
        ) : (
          <button type="button" className="btn px-5" disabled={!!problem} onClick={() => { setErr(""); setOk(""); setConfirming(true); }}>{mode === "now" ? "Review and send" : "Review and schedule"}</button>
        )}
        {limits && remainingToday(limits) < total && mode === "now" && !problem && <p className="text-xs text-amber-200">Only {remainingToday(limits)} more can go out today. The rest will go out after midnight UTC.</p>}
      </ToolStep>

      <div aria-live="polite" className="space-y-2">
        {err && <p role="alert" className="rounded-xl border border-red-400/40 bg-[#0a0b0d] p-3 text-sm text-red-100">{err}</p>}
        {ok && <p role="status" className="rounded-xl border border-emerald-400/40 bg-[#0a0b0d] p-3 text-sm text-emerald-100">{ok}</p>}
      </div>

      <section aria-label="Scheduled and sent reminders" className="card space-y-3 !p-4">
        <h3 className="font-display text-lg font-bold text-white">Scheduled and sent</h3>
        {jobs.length === 0 ? (
          <p className="text-sm text-zinc-300">Nothing yet. Pick a message in step 1 and schedule it.</p>
        ) : (
          <ul className="space-y-2">
            {jobs.map((j) => (
              <li key={j.id} className="space-y-1 rounded-xl border border-white/[0.14] bg-[#0a0b0d] p-3">
                <p className="font-semibold text-white">{j.subject}</p>
                <p className="text-sm text-zinc-300">{statusLabel(j.status)}{j.status === "pending" ? `, goes out ${when(j.sendAt)}` : j.sentAt ? `, ${when(j.sentAt)}` : ""} - {audienceLabel(j.audience)}</p>
                {j.status !== "pending" && j.status !== "cancelled" && <p className="text-sm text-zinc-300">{j.sentCount} of {j.recipientsSnapshotCount} sent so far.</p>}
                {j.note && <p className="text-sm text-zinc-300">{j.note}</p>}
                {j.status === "pending" && (cancelId === j.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" className="btn px-4 text-sm" onClick={() => cancel(j.id)} disabled={busy === `c${j.id}`}>Yes, cancel it</button>
                    <button type="button" className="btn-ghost px-4 text-sm" onClick={() => setCancelId("")}>Keep it</button>
                  </div>
                ) : <button type="button" className="btn-ghost px-4 text-sm" onClick={() => setCancelId(j.id)}>Cancel this reminder</button>)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
