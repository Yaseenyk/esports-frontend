"use client";

import { useCallback, useEffect, useState } from "react";
import { events, explain, type Invite, type Submission } from "@/lib/api/cloud";
import type { Person, Team } from "@/lib/idcard/types";

const linkFor = (path: string, token: string) => `${location.origin}${path}?t=${encodeURIComponent(token)}`;

/** Invite links so players add their own details and photo, and a queue of what they sent for the organiser to approve. */
export default function InvitesPanel({ eventId, teams, people, onApproved }: { eventId: string; teams: Team[]; people: Person[]; onApproved: () => void | Promise<void> }) {
  const [invites, setInvites] = useState<Invite[] | null>(null);
  const [subs, setSubs] = useState<Submission[] | null>(null);
  const [team, setTeam] = useState(teams[0]?.id ?? ""), [uses, setUses] = useState(10);
  const [fresh, setFresh] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState("");
  const [who, setWho] = useState(people[0]?.id ?? ""), [pass, setPass] = useState("");

  const load = useCallback(() => {
    api.invalidate(`/events/${eventId}/submissions`); api.invalidate(`/events/${eventId}/invites`); // opening this tab or pressing Refresh always asks the server
    events.invites(eventId).then(setInvites).catch((e) => setErr(explain(e)));
    events.submissions(eventId).then(setSubs).catch((e) => setErr(explain(e)));
  }, [eventId]);
  useEffect(load, [load]);

  const make = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    const t = teams.find((x) => x.id === team);
    try { const r = await events.newInvite(eventId, { teamId: team, label: t?.name ?? "Team", maxUses: uses, expiresInHours: 24 * 14 }); setFresh(linkFor("/join/", r.token)); load(); } catch (x) { setErr(explain(x)); }
  };
  const act = async (s: Submission, ok: boolean) => {
    setBusy(s.id); setErr("");
    try { if (ok) { await events.approve(eventId, s.id); await onApproved(); } else await events.reject(eventId, s.id); events_invalidate(); load(); } catch (x) { setErr(explain(x)); } finally { setBusy(""); }
  };
  const share = async () => { setErr(""); try { const r = await events.share(eventId, who); setPass(linkFor("/pass/", r.token)); } catch (x) { setErr(explain(x)); } };
  const copy = (t: string) => { void navigator.clipboard?.writeText(t); };

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-xl border border-white/10 p-3">
        <h3 className="font-display font-bold text-white">Invite players</h3>
        <p className="text-sm text-zinc-300">Send a team one link. Each player opens it, types their name and adds a photo. Nothing reaches the roster until you approve it below. No Aadhaar details are asked for.</p>
        <form onSubmit={make} className="flex flex-wrap items-end gap-2">
          <label className="text-sm text-zinc-300">Team<select className="field mt-1" value={team} onChange={(e) => setTeam(e.target.value)}>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
          <label className="text-sm text-zinc-300">Up to<input className="field mt-1 w-24" type="number" min={1} max={200} value={uses} onChange={(e) => setUses(Math.max(1, Number(e.target.value) || 1))} /></label>
          <button className="btn !min-h-11 px-4 text-sm">Make link (14 days)</button>
        </form>
        {fresh && <div role="status" className="space-y-2 rounded-xl border border-cyan/40 bg-cyan/10 p-3 text-sm"><p className="break-all font-mono text-xs text-cyan">{fresh}</p><button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => copy(fresh)}>Copy link</button></div>}
        {invites && invites.length > 0 && <ul className="space-y-1.5 text-sm">{invites.map((i) => <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"><span className="text-zinc-200">{i.label} <span className="text-xs text-zinc-400">· used {i.uses}{i.maxUses ? ` of ${i.maxUses}` : ""}{i.revoked ? " · revoked" : ""}</span></span>{!i.revoked && <span className="flex gap-2"><button type="button" className="chip !min-h-8" onClick={() => copy(linkFor("/join/", i.token))}>Copy link</button><button type="button" className="chip !min-h-8" onClick={() => events.revokeInvite(eventId, i.id).then(load).catch((x) => setErr(explain(x)))}>Revoke</button></span>}</li>)}</ul>}
      </section>

      <section className="space-y-2 rounded-xl border border-white/10 p-3">
        <div className="flex items-center justify-between gap-2"><h3 className="font-display font-bold text-white">Waiting for approval {subs && subs.length > 0 ? `(${subs.length})` : ""}</h3><button type="button" className="chip !min-h-8" onClick={load}>Refresh</button></div>
        {subs === null ? <p className="text-sm text-zinc-400">Loading…</p> : subs.length === 0 ? <p className="text-sm text-zinc-400">Nobody is waiting.</p> : (
          <ul className="space-y-1.5 text-sm">{subs.map((s) => <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"><span className="text-zinc-200">{s.name} <span className="text-xs text-zinc-400">· {s.team ?? "No team"} · {s.role}{s.minor ? " · minor" : ""}</span></span><span className="flex gap-2"><button type="button" className="btn !min-h-8 px-3 text-xs" disabled={busy === s.id} onClick={() => act(s, true)}>Approve</button><button type="button" className="chip !min-h-8" disabled={busy === s.id} onClick={() => act(s, false)}>Reject</button></span></li>)}</ul>
        )}
        <p className="text-xs text-zinc-400">A minor needs a guardian&apos;s consent recorded on the person&apos;s details before their card is printed.</p>
      </section>

      <section className="space-y-2 rounded-xl border border-white/10 p-3">
        <h3 className="font-display font-bold text-white">Send someone their pass</h3>
        <p className="text-sm text-zinc-300">A private link that shows one person their own pass and QR code on their phone. They need no account. You can switch it off any time.</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm text-zinc-300">Person<select className="field mt-1 max-w-[16rem]" value={who} onChange={(e) => { setWho(e.target.value); setPass(""); }}>{people.map((p) => <option key={p.id} value={p.id}>{p.name || p.id}</option>)}</select></label>
          <button type="button" className="btn !min-h-11 px-4 text-sm" onClick={share} disabled={!who}>Get link</button>
          {pass && <button type="button" className="chip" onClick={() => events.unshare(eventId, who).then(() => setPass("")).catch((x) => setErr(explain(x)))}>Switch link off</button>}
        </div>
        {pass && <div role="status" className="space-y-2 rounded-xl border border-cyan/40 bg-cyan/10 p-3 text-sm"><p className="break-all font-mono text-xs text-cyan">{pass}</p><button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => copy(pass)}>Copy link</button></div>}
        <p className="text-xs text-zinc-400">Save changes online first so the person exists on the server.</p>
      </section>
      {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
    </div>
  );
}

import { api } from "@/lib/api";
function events_invalidate() { api.invalidate("/events"); }
