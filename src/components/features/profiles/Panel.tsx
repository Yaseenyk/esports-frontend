"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PanelProps } from "@/components/app/panels";
import ToolStep from "@/components/tools/ToolStep";
import { events } from "@/lib/api/cloud";
import { matches as matchesApi } from "@/lib/api/matches";
import { explain, profiles, type PublicTeam, type TeamProfile } from "@/lib/api/f-profiles";
import { BLURB_MAX, CONSENT_STATEMENT, MAX_LINKS, NAME_MAX, checkLinks, personalProblem, teamResults, teamUrl, type HistoryEntry } from "@/lib/profiles";
import { teamNames } from "@/lib/matches";
import { TeamView } from "./TeamPage";

type Note = { kind: "ok" | "error"; text: string } | null;
type Confirm = { id: string; what: "unpublish" | "delete" } | null;
const field = "block min-h-11 w-full rounded-lg border border-zinc-700 bg-[#05070a] px-3 text-base text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan";

export default function Panel({ eventId, eventName, role }: PanelProps) {
  const canEdit = role !== "viewer";
  const [list, setList] = useState<TeamProfile[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [teams, setTeams] = useState<string[]>([]);
  const [rows, setRows] = useState<{ ms: Awaited<ReturnType<typeof matchesApi.list>> | null; date: string }>({ ms: null, date: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [team, setTeam] = useState("");
  const [name, setName] = useState("");
  const [blurb, setBlurb] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [copied, setCopied] = useState("");

  const load = useCallback(() => {
    setLoadError("");
    profiles.list().then(setList).catch((e) => setLoadError(explain(e)));
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    let live = true;
    Promise.allSettled([matchesApi.list(eventId), events.roster(eventId), events.list()]).then(([m, r, e]) => {
      if (!live) return;
      const ms = m.status === "fulfilled" ? m.value : null;
      const fromRoster = r.status === "fulfilled" ? (r.value.teams ?? []).map((t) => t.name) : [];
      const fromMatches = ms ? [...teamNames(ms.matches), ...ms.br.map((b) => b.team)] : [];
      const seen = new Set<string>();
      setTeams([...fromRoster, ...fromMatches].map((t) => t.trim()).filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase())).sort((a, b) => a.localeCompare(b)));
      setRows({ ms, date: e.status === "fulfilled" ? (e.value.find((x) => x.id === eventId)?.date ?? "") : "" });
    });
    return () => { live = false; };
  }, [eventId]);

  const linkCheck = useMemo(() => checkLinks(links), [links]);
  const problem = personalProblem(name) || personalProblem(blurb);
  const nameOk = name.trim().length >= 2 && name.trim().length <= NAME_MAX;
  const preview = useMemo<PublicTeam>(() => {
    const history: HistoryEntry[] = team && rows.ms ? [{ eventName, date: rows.date, ...teamResults(team, rows.ms.matches, rows.ms.br) }] : [];
    return { name: name.trim() || "Your team name", blurb: blurb.trim(), links: linkCheck.error ? [] : linkCheck.urls, history, updatedAt: "" };
  }, [name, blurb, linkCheck, team, rows, eventName]);

  const reset = () => { setEditing(null); setTeam(""); setName(""); setBlurb(""); setLinks([""]); setConsent(false); };
  const edit = (p: TeamProfile) => { setEditing(p.id); setName(p.name); setBlurb(p.blurb); setLinks(p.links.length ? p.links : [""]); setTeam(""); setConsent(false); setNote(null); };

  const save = async (publish: boolean) => {
    setNote(null);
    if (!nameOk) return setNote({ kind: "error", text: `Give the team a name of 2 to ${NAME_MAX} characters (step 2).` });
    if (problem) return setNote({ kind: "error", text: problem });
    if (linkCheck.error) return setNote({ kind: "error", text: linkCheck.error });
    if (publish && !consent) return setNote({ kind: "error", text: "Tick the permission box in step 3 first. Nothing is public without it." });
    setBusy(true);
    try {
      const body = { name: name.trim(), blurb: blurb.trim(), links: linkCheck.urls };
      let p = editing ? await profiles.update(editing, body) : await profiles.create(body);
      if (team && !p.events.some((e) => e.eventId === eventId && e.teamName.toLowerCase() === team.toLowerCase())) p = await profiles.link(p.id, { eventId, teamName: team });
      if (publish) p = await profiles.update(p.id, { published: true, consent: true });
      setNote({ kind: "ok", text: publish ? `Published. Anyone with the link can now see ${p.name}'s page.` : "Saved as a draft. Nobody can see it yet." });
      reset();
      load();
    } catch (e) { setNote({ kind: "error", text: explain(e) }); }
    setBusy(false);
  };

  const act = async (p: TeamProfile, what: "unpublish" | "delete") => {
    setBusy(true); setNote(null);
    try {
      if (what === "delete") { await profiles.remove(p.id); if (editing === p.id) reset(); } else await profiles.update(p.id, { published: false });
      setConfirm(null);
      setNote({ kind: "ok", text: what === "delete" ? `${p.name} was deleted. Its link no longer works.` : `${p.name} is no longer public. Its link shows "not available" right now.` });
      load();
    } catch (e) { setNote({ kind: "error", text: explain(e) }); }
    setBusy(false);
  };

  const copy = async (p: TeamProfile) => {
    try { await navigator.clipboard.writeText(teamUrl(location.origin, p.slug)); setCopied(p.id); setTimeout(() => setCopied(""), 3000); } catch { setNote({ kind: "error", text: "Could not copy. Select the address and copy it yourself." }); }
  };

  if (!canEdit) return (
    <section aria-label="Team pages" className="card space-y-1 !p-4">
      <h3 className="font-display text-lg font-bold text-white">Team pages</h3>
      <p className="text-sm text-zinc-300">You can view this event but not change it, so you cannot make team pages here. Ask the owner to make you an editor.</p>
    </section>
  );

  return (
    <section aria-label="Team pages" className="space-y-4">
      <div className="card space-y-2 !p-4">
        <h3 className="font-display text-lg font-bold text-white">Team pages</h3>
        <p className="text-sm leading-6 text-zinc-300">A team page is a public page for one team: its name, a short line about it, optional social links and its results across your events. It is for teams only. There are no player pages, and a team page never shows player names, photos or contact details. A page stays hidden until you publish it, and only with the team captain&apos;s permission.</p>
      </div>

      <div role="status" aria-live="polite" className="empty:hidden">
        {note && <p className={`rounded-lg border px-3 py-2 text-sm ${note.kind === "ok" ? "border-emerald-400/40 text-emerald-200" : "border-red-400/50 text-red-200"} bg-[#0a0b0d]`} role={note.kind === "error" ? "alert" : undefined}>{note.text}</p>}
      </div>

      <div className="card space-y-3 !p-4">
        <h4 className="font-display text-base font-bold text-white">Your team pages</h4>
        {loadError ? (
          <div className="space-y-2"><p role="alert" className="text-sm text-red-200">{loadError}</p><button type="button" className="btn px-5" onClick={load}>Try again</button></div>
        ) : list === null ? (
          <div aria-busy="true"><p className="sr-only" role="status">Loading your team pages</p><div className="sk h-16 w-full rounded-xl" /></div>
        ) : list.length === 0 ? (
          <p className="text-sm text-zinc-300">You have no team pages yet. Follow the three steps below to make the first one.</p>
        ) : (
          <ul className="space-y-3">
            {list.map((p) => (
              <li key={p.id} className="space-y-2 rounded-xl border border-white/10 bg-[#0a0b0d] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="min-w-0 flex-1 break-words font-semibold text-white">{p.name}</p>
                  <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-zinc-100">{p.published ? "Public" : "Draft, hidden"}</span>
                </div>
                <p className="text-xs text-zinc-300">{p.events.length ? `Covers: ${p.events.map((e) => `${e.teamName} at ${e.eventName}`).join("; ")}` : "No events linked yet. Pick a team in step 1 to add results."}</p>
                {p.published && <p className="break-all text-xs text-zinc-300">Link: <a className="text-cyan underline" href={teamUrl(location.origin, p.slug)} target="_blank" rel="noopener noreferrer">{teamUrl(location.origin, p.slug)}<span className="sr-only"> (opens in a new tab)</span></a>. Taking the page down switches this link off straight away.</p>}
                {confirm?.id === p.id ? (
                  <div role="group" aria-label={`Confirm ${confirm.what} for ${p.name}`} className="space-y-2 rounded-lg border border-amber-300/40 p-3">
                    <p className="text-sm text-amber-100">{confirm.what === "delete" ? `Delete ${p.name} for good? The page and its link are removed and cannot be brought back.` : `Take ${p.name} down? The link stops working at once. You can publish again later.`}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn px-5" disabled={busy} onClick={() => act(p, confirm.what)}>{confirm.what === "delete" ? "Yes, delete it" : "Yes, take it down"}</button>
                      <button type="button" className="btn-ghost px-5" onClick={() => setConfirm(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {p.published && <button type="button" className="btn-ghost px-4 text-sm" onClick={() => copy(p)}>{copied === p.id ? "Link copied" : "Copy link"}<span className="sr-only"> for {p.name}</span></button>}
                    <button type="button" className="btn-ghost px-4 text-sm" onClick={() => edit(p)}>Edit<span className="sr-only"> {p.name}</span></button>
                    {p.published && <button type="button" className="btn-ghost px-4 text-sm" onClick={() => setConfirm({ id: p.id, what: "unpublish" })}>Take down<span className="sr-only"> {p.name}</span></button>}
                    <button type="button" className="btn-ghost px-4 text-sm" onClick={() => setConfirm({ id: p.id, what: "delete" })}>Delete<span className="sr-only"> {p.name}</span></button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && <p className="flex flex-wrap items-center gap-2 text-sm text-zinc-200">You are editing an existing page. <button type="button" className="btn-ghost px-4 text-sm" onClick={reset}>Start a new page instead</button></p>}

      <ToolStep n={1} title="Pick a team from this event" hint={`The results of this team at ${eventName} go on the page. You can add more events later by opening the same page from another event.`} done={!!team} status={team || "optional"}>
        {teams.length > 0 ? (
          <label className="block space-y-1"><span className="text-sm font-semibold text-zinc-100">Team</span>
            <select className={field} value={team} onChange={(e) => { setTeam(e.target.value); if (!editing && !name.trim() && e.target.value) setName(e.target.value); }}>
              <option value="">No team yet (add one later)</option>
              {teams.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        ) : (
          <label className="block space-y-1"><span className="text-sm font-semibold text-zinc-100">Team name as it appears in this event</span>
            <input className={field} value={team} maxLength={60} onChange={(e) => setTeam(e.target.value)} placeholder="Add teams and matches first, or type the name" />
            <span className="block text-xs text-zinc-300">This event has no teams listed yet, so type the name exactly as it appears in the results.</span>
          </label>
        )}
      </ToolStep>

      <ToolStep n={2} title="Name, blurb and links" hint="This is what visitors see. Keep it about the team: no player names, phone numbers or emails." done={nameOk}>
        <label className="block space-y-1"><span className="text-sm font-semibold text-zinc-100">Team name</span>
          <input className={field} value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block space-y-1"><span className="text-sm font-semibold text-zinc-100">Short blurb (optional)</span>
          <textarea className={`${field} min-h-24 py-2`} value={blurb} maxLength={BLURB_MAX} onChange={(e) => setBlurb(e.target.value)} />
          <span className="block text-xs text-zinc-300">{blurb.length} of {BLURB_MAX} characters</span>
        </label>
        {problem && <p role="alert" className="text-sm text-red-200">{problem}</p>}
        <fieldset className="space-y-2"><legend className="text-sm font-semibold text-zinc-100">Social links (optional)</legend>
          <p className="text-xs text-zinc-300">Only https links to Instagram, YouTube, Discord (discord.gg), X, Twitter or Facebook.</p>
          {links.map((l, i) => (
            <input key={i} aria-label={`Social link ${i + 1}`} className={field} inputMode="url" value={l} maxLength={200} placeholder="https://instagram.com/yourteam" onChange={(e) => setLinks(links.map((x, j) => (j === i ? e.target.value : x)))} />
          ))}
          {linkCheck.error && <p role="alert" className="text-sm text-red-200">{linkCheck.error}</p>}
          {links.length < MAX_LINKS && <button type="button" className="btn-ghost px-4 text-sm" onClick={() => setLinks([...links, ""])}>Add another link</button>}
        </fieldset>
        <div className="space-y-2" aria-label="Live preview">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">Live preview{team ? "" : " (pick a team in step 1 to see results)"}</p>
          <div className="rounded-2xl border border-white/10 bg-[#05070a] p-4"><TeamView team={preview} preview /></div>
        </div>
      </ToolStep>

      <ToolStep n={3} title="Consent and publish" hint="A team page is public to anyone with its link. Many players are under 18, so nothing goes live without the captain's permission.">
        <label className="flex min-h-11 items-start gap-3 text-sm text-zinc-100">
          <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-cyan" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>{CONSENT_STATEMENT}. <span className="text-zinc-300">The time you tick this is saved, and you are asked again each time you publish.</span></span>
        </label>
        <p className="text-sm text-zinc-300">What happens next: pressing Publish saves the page, adds the team&apos;s results from this event and makes the page public. You can take it down at any time and the link stops working at once.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn px-6" disabled={busy || !consent} onClick={() => save(true)}>{busy ? "Working..." : editing ? "Save and publish" : "Publish page"}</button>
          <button type="button" className="btn-ghost px-5" disabled={busy} onClick={() => save(false)}>Save as hidden draft</button>
        </div>
      </ToolStep>
    </section>
  );
}
