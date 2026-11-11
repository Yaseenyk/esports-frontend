"use client";

import { useCallback, useEffect, useState } from "react";
import { profiles, type PublicTeam } from "@/lib/api/f-profiles";
import { dateText, entryLines, isSlug, linkLabel, summarize } from "@/lib/profiles";

type Status = "loading" | "ready" | "missing" | "error";

/** The numbers and timeline of a team page. Shared by the public page and the live preview in the panel. Everything is plain text. */
export function TeamView({ team, preview = false }: { team: PublicTeam; preview?: boolean }) {
  const s = summarize(team.history);
  const tiles: [string, string][] = [["Events", String(s.events)], ["Matches", String(s.played)], ["Wins", String(s.wins)]];
  if (s.bestPlacement !== null) tiles.push(["Best finish", `#${s.bestPlacement}`]);
  const H = preview ? "h3" : "h1";
  return (
    <article aria-label={`Team page for ${team.name}`} className="space-y-5">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan">Team page</p>
        <H className="break-words font-display text-3xl font-extrabold leading-tight text-white">{team.name}</H>
        {team.blurb && <p className="break-words text-base leading-7 text-zinc-200">{team.blurb}</p>}
        {team.links.length > 0 && (
          <ul aria-label="Team links" className="flex flex-wrap gap-2 pt-1">
            {team.links.map((u) => (
              <li key={u}><a href={u} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-sm font-semibold text-zinc-100 hover:border-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan">{linkLabel(u)}<span className="sr-only"> (opens in a new tab)</span></a></li>
            ))}
          </ul>
        )}
      </header>

      <section aria-label="Record" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {tiles.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-white/10 bg-[#0a0b0d] p-3 text-center">
            <p className="font-display text-2xl font-extrabold text-white">{v}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{k}</p>
          </div>
        ))}
      </section>

      <section aria-label="Results history" className="space-y-3">
        <h2 className="font-display text-xl font-bold text-white">Results history</h2>
        {team.history.length === 0
          ? <p className="rounded-xl border border-white/10 bg-[#0a0b0d] p-4 text-base text-zinc-300">No events on this page yet. Results appear here once this team has played.</p>
          : (
            <ol className="space-y-3 border-l-2 border-white/15 pl-4">
              {team.history.map((h, i) => (
                <li key={`${h.eventName}-${i}`} className="relative">
                  <span aria-hidden="true" className="absolute -left-[22px] top-2 h-3 w-3 rounded-full bg-cyan" />
                  <p className="text-sm text-zinc-300"><time dateTime={h.date}>{dateText(h.date)}</time></p>
                  <p className="break-words text-lg font-semibold text-white">{h.eventName}</p>
                  {entryLines(h).map((l) => <p key={l} className="text-base text-zinc-200">{l}</p>)}
                </li>
              ))}
            </ol>
          )}
      </section>

      <p className="rounded-xl border border-white/10 bg-[#0a0b0d] p-3 text-sm leading-6 text-zinc-300">This page is about the team only. It shows no player names, photos or contact details, and the team agreed to publish it.</p>
    </article>
  );
}

/** The public team page: /team/?s=<slug>. Phone first, noindex, no sign-in. */
export default function TeamPage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [team, setTeam] = useState<PublicTeam | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => { const s = new URLSearchParams(location.search).get("s") ?? ""; if (isSlug(s)) setSlug(s); else { setSlug(""); setStatus("missing"); } }, []);

  const load = useCallback(() => {
    if (!slug) return;
    setStatus("loading");
    profiles.public(slug).then((t) => { setTeam(t); setStatus("ready"); }).catch((e) => setStatus((e as { status?: number }).status === 404 ? "missing" : "error"));
  }, [slug]);
  useEffect(load, [load]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(""), 4000); return () => clearTimeout(t); }, [msg]);

  const share = async () => {
    const url = location.href, title = team?.name ?? "Team page";
    try { if (navigator.share) { await navigator.share({ title, url }); return; } } catch (e) { if ((e as Error).name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); setMsg("Link copied."); } catch { setMsg("Could not copy. Copy the address from your browser instead."); }
  };

  const style = <style>{`footer.no-print{display:none}main:has(.tp-root){padding-top:0}`}</style>;
  if (status === "missing") return (
    <section aria-label="Team page" className="tp-root mx-auto max-w-xl py-16 text-center">{style}
      <h1 className="font-display text-2xl font-bold text-white">This team page is not available</h1>
      <p role="status" className="mt-3 text-base text-zinc-300">The team has not published it, has taken it down, or the link is not right. Check the link, or ask the team.</p>
    </section>
  );
  if (status === "loading" || slug === null) return (
    <section aria-label="Team page" aria-busy="true" className="tp-root mx-auto max-w-2xl space-y-4 py-6">{style}
      <p className="sr-only" role="status">Loading the team page</p>
      <div className="sk h-9 w-2/3 rounded-lg" /><div className="sk h-5 w-full rounded-lg" /><div className="sk h-20 w-full rounded-xl" /><div className="sk h-48 w-full rounded-2xl" />
    </section>
  );
  if (status === "error" || !team) return (
    <section aria-label="Team page" className="tp-root mx-auto max-w-xl py-16 text-center">{style}
      <h1 className="font-display text-2xl font-bold text-white">Could not load this page</h1>
      <p role="alert" className="mt-3 text-base text-zinc-300">Check your connection and try again.</p>
      <button type="button" onClick={load} className="btn mt-4 min-h-11 px-6">Try again</button>
    </section>
  );
  return (
    <section aria-label="Team profile" className="tp-root mx-auto max-w-2xl space-y-4 py-6">{style}
      <TeamView team={team} />
      <div role="status" aria-live="polite" className="empty:hidden">{msg && <p className="rounded-lg border border-white/15 bg-[#0a0b0d] px-3 py-2 text-sm text-zinc-100">{msg}</p>}</div>
      <button type="button" onClick={share} className="btn min-h-12 w-full text-base font-semibold">Share this page</button>
    </section>
  );
}
