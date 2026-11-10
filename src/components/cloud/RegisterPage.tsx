"use client";

import { useEffect, useState } from "react";
import { explain, pub, type PublicReg, type RegPlayer } from "@/lib/api/cloud";
import { Waiting } from "@/components/skeleton/Scenes";
import { Sk, SkLines } from "@/components/skeleton/Sk";

const blank = (n: number): RegPlayer[] => Array.from({ length: n }, () => ({ name: "", ign: "", minor: false }));

/** The page a team captain opens from a registration link. Asks only for what the organiser needs. */
export default function RegisterPage() {
  const [token, setToken] = useState("");
  const [info, setInfo] = useState<PublicReg | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(""), [done, setDone] = useState(false), [busy, setBusy] = useState(false);
  const [team, setTeam] = useState(""), [captain, setCaptain] = useState(""), [contact, setContact] = useState(""), [notes, setNotes] = useState("");
  const [players, setPlayers] = useState<RegPlayer[]>([]);

  useEffect(() => {
    const tok = new URLSearchParams(location.search).get("t") ?? "";
    setToken(tok);
    if (!tok) { setErr("This registration link is incomplete. Ask the organiser to send it again."); setLoading(false); return; }
    pub.registration(tok).then((r) => { setInfo(r); setPlayers(blank(r.form.teamSize + r.form.subs)); }).catch((e) => setErr((e as { status?: number }).status === 404 ? "This registration link is not active. Ask the organiser for a new one." : explain(e))).finally(() => setLoading(false));
  }, []);

  const filled = players.filter((p) => p.name.trim());
  const need = info?.form.teamSize ?? 0;
  const setP = (i: number, patch: Partial<RegPlayer>) => setPlayers((l) => l.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { await pub.register(token, { teamName: team.trim(), captainName: captain.trim(), captainContact: contact.trim(), players: filled.map((p) => ({ name: p.name.trim(), ign: p.ign.trim(), minor: p.minor })), notes: notes.trim() }); setDone(true); }
    catch (x) { const s = (x as { status?: number }).status; setErr(s === 409 ? "That team name is already registered, or registration just closed or filled up. Check with the organiser." : s === 429 ? "Too many tries. Please wait a while and try again." : s === 400 ? `Please give ${need} players${info!.form.subs ? ` and up to ${info!.form.subs} substitute${info!.form.subs === 1 ? "" : "s"}` : ""}, and check every name.` : explain(x)); }
    finally { setBusy(false); }
  };

  const f = info?.form;
  return (
    <div className="mx-auto max-w-xl">
      <Waiting loading={loading} apiKey="/public/registration" label="Loading the registration form"><div className="space-y-3"><Sk className="!h-8" w="70%" /><SkLines n={2} /><Sk className="!h-11" /><Sk className="!h-11" i={1} /></div></Waiting>
      {err && !done && <p role="alert" className="mb-4 rounded-xl border border-red-400/40 bg-[#0a0b0d] p-4 text-red-100">{err}</p>}
      {done ? (
        <div role="status" className="space-y-2 rounded-2xl border border-emerald-400/40 bg-[#0a0b0d] p-5 text-center"><p className="font-display text-xl font-bold text-white">Registered. Thank you.</p><p className="text-sm text-emerald-100">The organiser will check your team and confirm it. Keep your captain&apos;s phone or email handy.</p></div>
      ) : info && f && (
        <form onSubmit={send} className="space-y-4">
          <div><h1 className="font-display text-2xl font-bold text-white">{f.title || `Register for ${info.event.name}`}</h1><p className="text-sm text-zinc-300">{[info.event.name, info.event.date, info.event.venue].filter(Boolean).join(" · ")}</p></div>
          {f.intro && <p className="rounded-xl border border-white/[0.14] bg-[#0a0b0d] p-3 text-sm text-zinc-200">{f.intro}</p>}
          {f.status !== "open" ? (
            <p role="status" className="rounded-xl border border-amber-500/30 bg-[#0a0b0d] p-4 text-amber-100">{f.status === "full" ? "All places are taken." : "Registration is closed."} Please contact the organiser.</p>
          ) : (
            <>
              {f.spotsLeft !== null && <p className="text-sm text-zinc-300">{f.spotsLeft} place{f.spotsLeft === 1 ? "" : "s"} left{f.closesAt ? `. Closes ${new Date(f.closesAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}` : ""}.</p>}
              <label className="block text-sm text-zinc-200">Team name<input className="field mt-1" value={team} onChange={(e) => setTeam(e.target.value)} minLength={2} maxLength={60} required /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-zinc-200">Captain&apos;s name<input className="field mt-1" value={captain} onChange={(e) => setCaptain(e.target.value)} maxLength={80} required autoComplete="name" /></label>
                <label className="block text-sm text-zinc-200">Captain&apos;s phone or email<input className="field mt-1" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={120} required autoComplete="tel" /></label>
              </div>
              <fieldset className="space-y-3"><legend className="font-display font-bold text-white">Players ({f.teamSize}{f.subs ? ` and up to ${f.subs} substitute${f.subs === 1 ? "" : "s"}` : ""})</legend>
                {players.map((p, i) => (
                  <div key={i} className="grid gap-2 rounded-xl border border-white/[0.14] bg-[#0f1013] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <label className="block text-xs text-zinc-300">{i < f.teamSize ? `Player ${i + 1}` : `Substitute ${i - f.teamSize + 1}`}, full name<input className="field mt-1 !min-h-10" value={p.name} onChange={(e) => setP(i, { name: e.target.value })} maxLength={80} required={i < f.teamSize} /></label>
                    <label className="block text-xs text-zinc-300">In-game name or ID<input className="field mt-1 !min-h-10" value={p.ign} onChange={(e) => setP(i, { ign: e.target.value })} maxLength={40} /></label>
                    <label className="flex items-center gap-2 pb-2 text-xs text-zinc-300"><input type="checkbox" className="h-5 w-5 accent-cyan" checked={p.minor} onChange={(e) => setP(i, { minor: e.target.checked })} />Under 18</label>
                  </div>
                ))}
              </fieldset>
              <label className="block text-sm text-zinc-200">Anything else the organiser should know (optional)<textarea className="field mt-1 min-h-20 py-2" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} /></label>
              <p className="text-xs text-zinc-400">Players under 18 need a parent or guardian&apos;s consent; the organiser will ask for it. We only pass these details to the organiser of this event.</p>
              <button className="btn w-full" disabled={busy || filled.length < need}>{busy ? "Sending…" : "Register my team"}</button>
            </>
          )}
        </form>
      )}
    </div>
  );
}
