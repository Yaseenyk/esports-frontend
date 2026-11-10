"use client";

import { useCallback, useEffect, useState } from "react";
import { events, explain, type Members } from "@/lib/api/cloud";

/** Give other organisers access to one event. Owner only. */
export default function MembersPanel({ eventId }: { eventId: string }) {
  const [data, setData] = useState<Members | null>(null);
  const [email, setEmail] = useState(""), [role, setRole] = useState<"editor" | "viewer">("editor");
  const [err, setErr] = useState(""), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);

  const load = useCallback(() => { events.members(eventId).then(setData).catch((e) => setErr(explain(e))); }, [eventId]);
  useEffect(load, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setMsg(""); setBusy(true);
    try { const m = await events.addMember(eventId, email.trim(), role); setMsg(`${m.name} now has ${m.role === "editor" ? "edit" : "view-only"} access.`); setEmail(""); load(); }
    catch (x) { setErr((x as { status?: number }).status === 404 ? "There is no account with that email. Ask them to create a free account first, then add them." : (x as { status?: number }).status === 409 ? "That is the owner of this event." : explain(x)); }
    finally { setBusy(false); }
  };
  const remove = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name}'s access to this event?`)) return;
    try { await events.removeMember(eventId, userId); load(); } catch (x) { setErr(explain(x)); }
  };

  return (
    <section aria-label="Organisers" className="card space-y-3 !p-4">
      <h3 className="font-display text-lg font-bold text-white">Organisers on this event</h3>
      <p className="text-sm text-zinc-300">Add other organisers by the email they signed up with. <strong className="text-zinc-100">Editors</strong> can change the roster, registration, gate keys and check-ins. <strong className="text-zinc-100">Viewers</strong> can only look, and do not see the pass codes. Only you can delete the event or change who has access.</p>
      {data && (
        <ul className="space-y-1.5 text-sm">
          <li className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"><span className="min-w-0 truncate text-zinc-100">{data.owner?.name ?? "Owner"} <span className="text-zinc-400">({data.owner?.email})</span></span><span className="tag">Owner</span></li>
          {data.members.map((m) => (
            <li key={m.userId} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"><span className="min-w-0 truncate text-zinc-100">{m.name} <span className="text-zinc-400">({m.email})</span></span><span className="flex shrink-0 items-center gap-2"><span className="tag">{m.role === "editor" ? "Editor" : "Viewer"}</span><button type="button" className="chip !min-h-8" aria-label={`Remove ${m.name}`} onClick={() => remove(m.userId, m.name)}>Remove</button></span></li>
          ))}
        </ul>
      )}
      <form onSubmit={add} className="flex flex-wrap items-end gap-2">
        <label className="min-w-[12rem] flex-1 text-sm text-zinc-200">Their email<input className="field mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" /></label>
        <label className="text-sm text-zinc-200">Access<select className="field mt-1" value={role} onChange={(e) => setRole(e.target.value as "editor" | "viewer")}><option value="editor">Editor</option><option value="viewer">Viewer (view only)</option></select></label>
        <button className="btn !min-h-11 px-4 text-sm" disabled={busy || !email.trim()}>Add</button>
      </form>
      <div aria-live="polite">{msg && <p className="text-sm text-emerald-300">{msg}</p>}{err && <p role="alert" className="text-sm text-red-300">{err}</p>}</div>
    </section>
  );
}
