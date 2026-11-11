"use client";

import { useCallback, useEffect, useState } from "react";
import { events, explain, type RegForm, type Registration } from "@/lib/api/cloud";
import { api } from "@/lib/api";

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "No closing date");
const toLocalInput = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

/** For one saved event: set up the team registration link, and approve or reject the teams that register. */
export default function RegistrationPanel({ eventId, onApproved }: { eventId: string; onApproved?: () => void }) {
  const [form, setForm] = useState<RegForm | null>(null);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [list, setList] = useState<Registration[]>([]);
  const [draft, setDraft] = useState({ title: "", intro: "", teamSize: 4, subs: 1, maxTeams: "", closes: "" });
  const [err, setErr] = useState(""), [msg, setMsg] = useState(""), [busy, setBusy] = useState("");

  // `fill` copies the saved form into the edit boxes. It is only done on first load and after a save, so a refresh or an approval never wipes what is being typed.
  const load = useCallback((fill = false) => {
    api.invalidate(`/events/${eventId}/registration`); api.invalidate(`/events/${eventId}/registrations`);
    events.registration(eventId).then((r) => {
      setForm(r.form); setCounts(r.counts);
      if (r.form && fill) setDraft({ title: r.form.title, intro: r.form.intro, teamSize: r.form.teamSize, subs: r.form.subs, maxTeams: r.form.maxTeams ? String(r.form.maxTeams) : "", closes: toLocalInput(r.form.closesAt) });
      if (r.form) events.registrations(eventId).then(setList).catch((e) => setErr(explain(e)));
    }).catch((e) => setErr(explain(e)));
  }, [eventId]);
  useEffect(() => load(true), [load]);

  const link = form ? `${location.origin}/register/?t=${encodeURIComponent(form.token)}` : "";
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setMsg(""); setBusy("save");
    try {
      await events.saveRegistration(eventId, { title: draft.title, intro: draft.intro, teamSize: draft.teamSize, subs: draft.subs, maxTeams: draft.maxTeams ? Number(draft.maxTeams) : null, closesAt: draft.closes ? new Date(draft.closes).toISOString() : null });
      setMsg(form ? "Saved. Your changes are on the link already." : "Registration link created. Next: copy it and send it to team captains."); load(true);
    } catch (x) { setErr(explain(x)); } finally { setBusy(""); }
  };
  const toggle = async () => {
    if (!form || busy) return;
    setBusy("toggle"); setErr(""); setMsg("");
    try { await events.saveRegistration(eventId, { open: !form.open }); setMsg(form.open ? "Registration is closed." : "Registration is open again."); load(); } catch (x) { setErr(explain(x)); } finally { setBusy(""); }
  };
  const act = async (r: Registration, ok: boolean) => {
    if (!ok && !confirm(`Reject ${r.teamName}? Their registration is deleted, they are not told, and this cannot be undone.`)) return;
    setBusy(r.id); setErr(""); setMsg("");
    try { if (ok) { const res = await events.approveRegistration(eventId, r.id); setMsg(`${r.teamName} added to the roster (${res.people} people). Next: open the cards to design and print theirs.`); onApproved?.(); } else await events.rejectRegistration(eventId, r.id); load(); }
    catch (x) { setErr((x as { status?: number }).status === 409 ? "That could not be approved: the team name is already on the roster, or it was already handled." : explain(x)); } finally { setBusy(""); }
  };

  return (
    <section aria-label="Team registration" className="space-y-4">
      <div className="card space-y-3 !p-4">
        <h3 className="font-display text-lg font-bold text-white">Let teams sign themselves up (optional)</h3>
        <p className="text-sm text-zinc-300">{form ? "Your link is ready below. Copy it and send it to team captains. Each team they send appears under Waiting for approval." : "1. Choose how many players a team has. 2. Press the button to make a link. 3. Send the link to team captains. You approve each team before it joins your event."}</p>
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-zinc-200">Players per team<input className="field mt-1" type="number" min={1} max={20} value={draft.teamSize} onChange={(e) => setDraft({ ...draft, teamSize: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })} /></label>
          <label className="block text-sm text-zinc-200">Substitutes allowed per team<input className="field mt-1" type="number" min={0} max={10} value={draft.subs} onChange={(e) => setDraft({ ...draft, subs: Math.max(0, Math.min(10, Number(e.target.value) || 0)) })} /></label>
          <details className="rounded-xl border border-white/10 sm:col-span-2">
            <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm text-cyan outline-none focus-visible:ring-2 focus-visible:ring-cyan">More options: title, message, team limit, closing time</summary>
            <div className="grid gap-3 border-t border-white/10 p-3 sm:grid-cols-2">
          <label className="block text-sm text-zinc-200 sm:col-span-2">Form title<input className="field mt-1" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={120} placeholder="Spring Cup team registration" /></label>
          <label className="block text-sm text-zinc-200 sm:col-span-2">Message for captains (optional)<textarea className="field mt-1 min-h-16 py-2" value={draft.intro} onChange={(e) => setDraft({ ...draft, intro: e.target.value })} maxLength={1000} /></label>
          <label className="block text-sm text-zinc-200">Maximum teams (leave empty for no limit)<input className="field mt-1" type="number" min={1} max={500} value={draft.maxTeams} onChange={(e) => setDraft({ ...draft, maxTeams: e.target.value })} /></label>
          <label className="block text-sm text-zinc-200">Closes at (optional)<input className="field mt-1" type="datetime-local" value={draft.closes} onChange={(e) => setDraft({ ...draft, closes: e.target.value })} /></label>
            </div>
          </details>
          <div className="sm:col-span-2"><button className="btn !min-h-11 px-4 text-sm" disabled={busy === "save"}>{form ? "Save changes" : "Create the registration link"}</button></div>
        </form>
        {form && (
          <div role="status" className="space-y-2 rounded-xl border border-cyan/40 bg-[#0a0b0d] p-3 text-sm">
            <p className="text-zinc-200">Share this link with team captains. {form.open ? "Registration is open." : "Registration is closed."} {when(form.closesAt)}.</p>
            <p className="break-all font-mono text-xs text-cyan">{link}</p>
            <div className="flex flex-wrap gap-2"><button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => { if (!navigator.clipboard) { setErr("Copying is not available here. Select the link and copy it by hand."); return; } navigator.clipboard.writeText(link).then(() => { setErr(""); setMsg("Link copied."); }, () => setErr("Could not copy. Select the link and copy it by hand.")); }}>Copy link</button><button type="button" className="chip" disabled={busy === "toggle"} onClick={toggle}>{form.open ? "Close registration" : "Reopen registration"}</button></div>
          </div>
        )}
      </div>

      {form && (
        <div className="card space-y-3 !p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-display text-lg font-bold text-white">Waiting for approval {counts.pending ? `(${counts.pending})` : ""}</h3><button type="button" className="chip !min-h-8" onClick={() => load()}>Refresh</button></div>
          <p className="text-xs text-zinc-400">{counts.approved} approved, {counts.rejected} rejected. Approving adds the team and its players to your event. A player marked under 18 needs a guardian&apos;s consent recorded before their card is printed.</p>
          {list.length === 0 ? <p className="text-sm text-zinc-400">Nobody is waiting. When a captain sends the form, their team shows up here with Approve and Reject buttons.</p> : (
            <ul className="space-y-2">
              {list.map((r) => (
                <li key={r.id} className="rounded-xl border border-white/10 p-3 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><p className="font-semibold text-white">{r.teamName}</p><p className="text-xs text-zinc-400">Captain {r.captainName} · {r.captainContact}</p></div><div className="flex gap-2"><button type="button" className="btn !min-h-11 px-3 text-sm" disabled={busy === r.id} onClick={() => act(r, true)}>Approve</button><button type="button" className="chip !min-h-11" disabled={busy === r.id} onClick={() => act(r, false)}>Reject</button></div></div>
                  <ul className="mt-2 grid gap-1 text-xs text-zinc-300 sm:grid-cols-2">{r.players.map((p, i) => <li key={i}>{p.name}{p.ign ? ` (${p.ign})` : ""}{p.minor ? " · under 18" : ""}{form && i >= form.teamSize ? " · substitute" : ""}</li>)}</ul>
                  {r.notes && <p className="mt-2 text-xs text-zinc-400">Note: {r.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div aria-live="polite">{msg && <p className="text-sm text-emerald-300">{msg}</p>}{err && <p role="alert" className="text-sm text-red-300">{err}</p>}</div>
    </section>
  );
}
