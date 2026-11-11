"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { live } from "@/lib/api/cloud";
import { createPoller } from "@/lib/api/poller";
import { KIND_LABEL, agoText, formatLocalTime, isLogo, nextMatches, orderedViews, teamsOf, type LiveKind, type PublicLive } from "@/lib/live";
import { nextMatchFor, opponentText, stageLabel, teamNames } from "@/lib/matches";
import { sendHit } from "@/lib/hits";
import { brandTheme, fetchPublicBrand, readableOn, type Brand } from "@/lib/brand";
import ViewRenderer from "./ViewRenderer";
import MatchesView from "./MatchesView";

type Status = "loading" | "ready" | "missing" | "error";
const SLUG = /^[a-z0-9-]{3,40}$/;
const teamKey = (slug: string) => `eh-live-team-${slug}`;

function readTeam(slug: string) { try { return localStorage.getItem(teamKey(slug)) ?? ""; } catch { return ""; } }
function saveTeam(slug: string, t: string) { try { if (t) localStorage.setItem(teamKey(slug), t); else localStorage.removeItem(teamKey(slug)); } catch { /* private mode */ } }

/** Which team are you? Prominent on a first visit, a slim card once chosen. */
function TeamPicker({ mine, teams, pick }: { mine: string; teams: string[]; pick: (t: string) => void }) {
  return (
    <label className={`block rounded-2xl bg-[#0a0b0d] p-4 ${mine ? "border border-white/10" : "border-2 border-cyan"}`}>
      {mine
        ? <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">My team</span>
        : <><span className="block font-display text-xl font-bold text-white">Which team are you?</span><span className="mt-1 block text-sm text-zinc-300">We will highlight it for you. <span className="sr-only">My team</span></span></>}
      <select value={mine} onChange={(e) => pick(e.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-zinc-700 bg-[#05070a] px-3 text-base text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan"><option value="">{mine ? "Not chosen" : "Pick your team"}</option>{teams.map((t) => <option key={t} value={t}>{t}</option>)}</select>
    </label>
  );
}

/** The page players and visitors open from a poster or a link, built for a phone first. Everything is shown as plain text and images. */
export default function LivePage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [data, setData] = useState<PublicLive | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [okAt, setOkAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [offline, setOffline] = useState(false);
  const [tab, setTab] = useState<LiveKind | "matches" | "">("");
  const [team, setTeam] = useState("");
  const [msg, setMsg] = useState("");
  const tabs = useRef<HTMLDivElement>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  useEffect(() => { if (!slug) return; let on = true; void fetchPublicBrand(slug).then((b) => { if (on) setBrand(b); }); return () => { on = false; }; }, [slug]); // the organiser's logo and colours; the page looks right without them

  useEffect(() => { const e = new URLSearchParams(location.search).get("e") ?? ""; if (SLUG.test(e)) { setSlug(e); setTeam(readTeam(e)); } else { setSlug(""); setStatus("missing"); } }, []);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  useEffect(() => {
    if (!slug) return;
    const p = createPoller<PublicLive>({
      fetch: () => live.public(slug),
      same: (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b),
      onData: (d) => { setData(d); setStatus("ready"); setOkAt(Date.now()); setOffline(false); },
      onError: (e) => { const s = (e as { status?: number }).status; if (s === 404) { setStatus("missing"); setData(null); } else { setOffline(true); setStatus((cur) => (cur === "loading" ? "error" : cur)); } },
      minMs: 20_000, maxMs: 60_000, staleMs: 15_000,
    });
    const wake = () => { setOffline(!navigator.onLine); p.resume(); };
    document.addEventListener("visibilitychange", wake); window.addEventListener("online", wake); window.addEventListener("offline", wake); window.addEventListener("focus", wake);
    p.start();
    return () => { p.stop(); document.removeEventListener("visibilitychange", wake); window.removeEventListener("online", wake); window.removeEventListener("offline", wake); window.removeEventListener("focus", wake); };
  }, [slug]);

  useEffect(() => { if (slug && status === "ready") sendHit(slug, "live"); }, [slug, status]); // sponsor report: one page-load count, once per load
  const snap = data?.snapshot ?? null;
  const views = useMemo(() => (snap ? orderedViews(snap) : []), [snap]);
  const matchList = useMemo(() => (Array.isArray(data?.matches) ? data!.matches! : []), [data]);
  const teams = useMemo(() => { const base = teamsOf(snap), seen = new Set(base.map((t) => t.toLowerCase())); return [...base, ...teamNames(matchList).filter((t) => !seen.has(t.toLowerCase()))]; }, [snap, matchList]);
  const tabKeys = useMemo<(LiveKind | "matches")[]>(() => [...views.map((v) => v.kind), ...(matchList.length ? (["matches"] as const) : [])], [views, matchList]);
  const tabKey = tabKeys.includes(tab as LiveKind | "matches") ? (tab as LiveKind | "matches") : tabKeys[0];
  const current = tabKey === "matches" ? undefined : views.find((v) => v.kind === tabKey);
  const mine = useMemo(() => (team && teams.some((t) => t.toLowerCase() === team.toLowerCase()) ? team : ""), [team, teams]);
  const nowMin = Math.floor(now / 60_000);
  const next = useMemo(() => {
    const n = nextMatches(snap, mine, new Date(nowMin * 60_000));
    const m = n.length === 0 && mine ? nextMatchFor(matchList, mine) : null;
    return m ? [{ source: "schedule" as const, title: "Your next match", detail: `${stageLabel(m.stage)}, round ${m.round}: ${opponentText(m, mine)}${m.status === "live" ? " (on now)" : ""}.` }] : n;
  }, [snap, mine, nowMin, matchList]);
  const news = useMemo(() => [...(snap?.announcements ?? [])].sort((x, y) => Date.parse(y.at) - Date.parse(x.at)), [snap]);

  const pick = (t: string) => { setTeam(t); if (slug) saveTeam(slug, t); };
  const share = useCallback(async () => {
    const url = location.href, title = data?.event.name ?? "Live event page";
    try { if (navigator.share) { await navigator.share({ title, url }); return; } } catch (e) { if ((e as Error).name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); setMsg("Link copied."); } catch { setMsg("Could not copy. Copy the address from your browser instead."); }
  }, [data]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(""), 4000); return () => clearTimeout(t); }, [msg]);

  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = tabKeys.findIndex((k) => k === tabKey), n = tabKeys.length;
    if (!n) return;
    const j = (i + (e.key === "ArrowRight" ? 1 : n - 1)) % n;
    setTab(tabKeys[j]!);
    requestAnimationFrame(() => tabs.current?.querySelectorAll<HTMLElement>('[role="tab"]')[j]?.focus());
  };

  if (status === "missing") return (
    <section className="mx-auto max-w-xl py-16 text-center" aria-label="Live page">
      <h1 className="font-display text-2xl font-bold text-white">This event page is not live yet</h1>
      <p role="status" className="mt-3 text-zinc-300">The organiser has not published it, or the link is not right. Check the link, or ask the organiser.</p>
    </section>
  );
  if (status === "loading" || slug === null) return (
    <section aria-label="Live page" aria-busy="true" className="space-y-4">
      <p className="sr-only" role="status">Loading the live page</p>
      <div className="sk h-9 w-2/3 rounded-lg" /><div className="sk h-5 w-1/2 rounded-lg" /><div className="sk h-12 w-full rounded-xl" /><div className="sk h-72 w-full rounded-2xl" />
    </section>
  );
  if (status === "error" || !data || !snap) return (
    <section className="mx-auto max-w-xl py-16 text-center" aria-label="Live page">
      <h1 className="font-display text-2xl font-bold text-white">Could not load this page</h1>
      <p role="alert" className="mt-3 text-zinc-300">Check your connection. It tries again by itself.</p>
    </section>
  );

  const ev = data.event;
  const bar = snap.ticker;
  const when = (at: string) => <time dateTime={at}>{agoText(Math.max(0, now - Date.parse(at)))} · {formatLocalTime(at, now)}</time>;
  return (
    <section aria-label={`Live page for ${ev.name}`} className={`lv-root mx-auto max-w-3xl space-y-4 ${bar.length ? "pb-20" : "pb-6"}`} style={brandTheme(brand) as React.CSSProperties}>
      <style>{`@keyframes lvRun{from{transform:translateX(100%)}to{transform:translateX(-100%)}}.lv-run{animation:lvRun var(--lv-dur,30s) linear infinite;white-space:nowrap;display:inline-block}@media (prefers-reduced-motion:reduce){.lv-run{animation:none;white-space:normal}}footer.no-print{display:none}div.no-print.sticky.top-3{display:none}main:has(.lv-root){padding-top:0}`}</style>
      <header className="sticky top-0 z-30 -mx-4 flex h-14 items-center gap-3 border-b border-white/10 bg-[#05070a]/95 px-4 backdrop-blur" style={brand ? { borderBottomColor: brand.secondary } : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {brand?.logo && <img src={brand.logo} alt={brand.name ? `${brand.name} logo` : "Organiser logo"} className="h-9 w-auto max-w-[96px] shrink-0 object-contain" />}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-base font-bold leading-tight text-white">{ev.name}</h1>
          <p className="flex items-center gap-2 text-xs leading-tight text-zinc-300">
            <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-300"><span aria-hidden="true" className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span><span>Live</span></span>
            <span className="truncate">{okAt ? `Updated ${agoText(now - okAt)}` : ""}</span>
          </p>
        </div>
        <button type="button" onClick={share} className="btn-ghost shrink-0 px-4 text-sm font-semibold" style={brand ? { background: brand.primary, color: readableOn(brand.primary), borderColor: brand.primary } : undefined}>Share</button>
      </header>
      <p className="text-sm text-zinc-300">{[ev.date, ev.venue].filter(Boolean).join(" · ")}</p>
      <div role="status" aria-live="polite" className="empty:hidden">
        {msg ? <p className="rounded-lg border border-white/15 bg-[#0a0b0d] px-3 py-2 text-sm text-zinc-100">{msg}</p> : offline ? <p className="rounded-lg border border-amber-300/40 bg-[#0a0b0d] px-3 py-2 text-sm text-amber-200">You are offline. Showing the last update.</p> : null}
      </div>

      {!mine && teams.length > 0 && <TeamPicker mine={mine} teams={teams} pick={pick} />}

      {news.length > 0 && (
        <section aria-label="Announcements" className="rounded-2xl border-2 border-cyan/60 bg-[#0a0b0d] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan" style={brand ? { color: "var(--brand-accent)" } : undefined}>Announcement</p>
          <p className="mt-2 break-words text-lg font-semibold leading-snug text-white">{news[0]!.text}</p>
          <p className="mt-2 text-sm text-zinc-300">{when(news[0]!.at)}</p>
          {news.length > 1 && (
            <details className="mt-3 border-t border-white/10 pt-1">
              <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-zinc-100">Earlier announcements ({news.length - 1})</summary>
              <ul className="space-y-3 pt-2">{news.slice(1).map((a, i) => <li key={`${a.at}-${i}`}><p className="break-words text-base text-zinc-100">{a.text}</p><p className="text-sm text-zinc-400">{when(a.at)}</p></li>)}</ul>
            </details>
          )}
        </section>
      )}

      {mine && teams.length > 0 && <TeamPicker mine={mine} teams={teams} pick={pick} />}
      {mine && next.map((n, i) => <div key={i} className="rounded-2xl border-2 border-cyan/60 bg-[#0a0b0d] p-4" role="note"><p className="text-xs font-bold uppercase tracking-widest text-cyan">{n.title}</p><p className="mt-1 text-lg font-semibold leading-snug text-white">{n.detail}</p></div>)}
      {mine && next.length === 0 && <p className="text-sm text-zinc-300">{mine} is highlighted below. The published pages do not say when its next match is yet.</p>}

      {tabKeys.length === 0 ? <p role="status" className="card text-zinc-300">Nothing has been added to this page yet. Check back soon.</p> : (
        <>
          <div ref={tabs} role="tablist" aria-label="Views" onKeyDown={onTabKey} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {tabKeys.map((k) => <button key={k} type="button" role="tab" id={`lv-tab-${k}`} aria-selected={tabKey === k} aria-controls="lv-panel" tabIndex={tabKey === k ? 0 : -1} onClick={() => setTab(k)} className={`min-h-11 shrink-0 rounded-full border px-5 text-[15px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-cyan ${tabKey === k ? "border-cyan bg-cyan text-ink" : "border-zinc-700 text-zinc-100 hover:border-zinc-500"}`}>{k === "matches" ? "Matches" : KIND_LABEL[k]}</button>)}
          </div>
          {tabKey && <div role="tabpanel" id="lv-panel" aria-labelledby={`lv-tab-${tabKey}`}>{tabKey === "matches" ? <MatchesView matches={matchList} team={mine} /> : current && <ViewRenderer key={current.kind} payload={current.payload} team={mine} />}</div>}
        </>
      )}

      {snap.sponsors.length > 0 && (
        <section aria-label="Sponsors" className="rounded-2xl border border-white/10 bg-[#0a0b0d] p-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Sponsors</h2>
          <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">{snap.sponsors.map((s, i) => <li key={i} className="flex items-center">{isLogo(s.logo) ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.logo} alt={s.name} className="max-h-10 w-auto max-w-[140px] object-contain" /> : <span className="font-semibold text-zinc-100">{s.name}</span>}</li>)}</ul>
        </section>
      )}

      <p className="pt-2 text-center text-sm text-zinc-400"><Link href="/tools/" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-white">Made with Esports Hub, free tools for event organisers</Link></p>

      {bar.length > 0 && (
        <div role="region" aria-label="News ticker" className="fixed inset-x-0 bottom-0 z-30 overflow-hidden border-t border-white/10 bg-[#0a0b0d] py-3 text-sm text-zinc-100">
          <div className="lv-run px-4" style={{ ["--lv-dur" as string]: `${Math.max(20, bar.join("   ").length * 0.35)}s` }}>{bar.join("   ·   ")}</div>
        </div>
      )}
    </section>
  );
}
