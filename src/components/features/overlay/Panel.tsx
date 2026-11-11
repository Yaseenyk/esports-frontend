"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PanelProps } from "@/components/app/panels";
import ToolStep from "@/components/tools/ToolStep";
import { explain, live } from "@/lib/api/cloud";
import { matches as matchesApi } from "@/lib/api/matches";
import { DISPLAY_THEMES } from "@/lib/display-themes";
import { teamsOf, type LiveState } from "@/lib/live";
import { teamNames, type PublicMatch } from "@/lib/matches";
import { VIEW_HELP, VIEW_LABEL, buildOverlayUrl, viewAvailability, type OverlayView } from "@/lib/overlay";

const MAIN: OverlayView[] = ["standings", "bracket", "schedule", "matches", "nextmatch", "ticker"];
const MORE: OverlayView[] = ["league", "countdown", "sponsors"];
const SIZES: { v: number; label: string }[] = [{ v: 0.8, label: "Smaller" }, { v: 1, label: "Normal" }, { v: 1.25, label: "Bigger" }, { v: 1.5, label: "Biggest" }];
const NEEDS: Record<OverlayView, string> = {
  standings: "Publish a battle royale points table to the live page.", league: "Publish a league table to the live page.", schedule: "Publish a schedule to the live page.",
  bracket: "Publish a bracket to the live page.", countdown: "Publish a countdown to the live page.", matches: "Add matches to the event.", nextmatch: "Add matches to the event, or publish a schedule.",
  ticker: "Add ticker lines in the live page panel.", sponsors: "Add sponsors in the live page panel.",
};

/** Tiny drawings of each view, so a card says what you get before you pick it. Decorative only. */
function Mini({ v }: { v: OverlayView }) {
  const bar = "rounded-sm bg-zinc-500/70";
  const rows = (n: number, w = "w-full") => Array.from({ length: n }, (_, i) => <div key={i} className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cyan/80" /><div className={`h-1.5 ${bar} ${w}`} style={{ opacity: 1 - i * 0.15 }} /></div>);
  return (
    <div aria-hidden="true" className="flex h-16 w-full flex-col justify-center gap-1 rounded-md border border-white/10 bg-[#05070a] p-2">
      {(v === "standings" || v === "league") && rows(4)}
      {v === "bracket" && <div className="flex items-center justify-between gap-1"><div className="space-y-1"><div className={`h-2 w-6 ${bar}`} /><div className={`h-2 w-6 ${bar}`} /><div className={`h-2 w-6 ${bar}`} /><div className={`h-2 w-6 ${bar}`} /></div><div className="space-y-3"><div className={`h-2 w-6 ${bar}`} /><div className={`h-2 w-6 ${bar}`} /></div><div className="h-2 w-6 rounded-sm bg-cyan/80" /></div>}
      {v === "schedule" && <>{[0, 1, 2].map((i) => <div key={i} className={`flex gap-1 rounded-sm p-0.5 ${i === 1 ? "bg-cyan/30" : ""}`}><div className="h-1.5 w-5 rounded-sm bg-cyan/80" /><div className={`h-1.5 flex-1 ${bar}`} /></div>)}</>}
      {v === "matches" && <>{[0, 1].map((i) => <div key={i} className="flex items-center gap-1"><div className={`h-1.5 flex-1 ${bar}`} /><span className="rounded-sm bg-cyan/80 px-1 text-[8px] font-bold leading-3 text-ink">{i ? "2-1" : "7-5"}</span><div className={`h-1.5 flex-1 ${bar}`} /></div>)}</>}
      {v === "nextmatch" && <div className="mt-6 flex h-5 items-stretch overflow-hidden rounded-sm bg-zinc-800"><span className="grid place-items-center bg-cyan px-1.5 text-[8px] font-extrabold text-ink">NEXT</span><div className="m-auto h-1.5 w-16 rounded-sm bg-zinc-400/70" /></div>}
      {v === "ticker" && <div className="mt-8 flex h-4 items-center overflow-hidden rounded-sm bg-cyan px-2"><div className="h-1.5 w-full rounded-sm bg-ink/60" /></div>}
      {v === "countdown" && <div className="flex justify-center gap-1">{[0, 1, 2].map((i) => <span key={i} className="rounded-sm bg-zinc-800 px-1.5 text-sm font-extrabold text-white">{["03", "25", "10"][i]}</span>)}</div>}
      {v === "sponsors" && <div className="mt-8 flex gap-1.5">{[0, 1, 2].map((i) => <div key={i} className="h-4 w-8 rounded-sm bg-white/85" />)}</div>}
    </div>
  );
}

/** Opens the Live page panel of this event page and scrolls to it. */
function goToLivePanel() {
  const g = document.querySelector<HTMLDetailsElement>('details[data-group="share"]');
  const p = document.querySelector<HTMLDetailsElement>('details[data-panel="live"]');
  if (g) g.open = true;
  if (p) { p.open = true; p.scrollIntoView({ behavior: "smooth", block: "start" }); (p.querySelector("summary") as HTMLElement | null)?.focus(); }
}

const input = "min-h-11 w-full min-w-0 rounded-lg border border-zinc-700 bg-[#0a0b0d] px-3 text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan";

/** The stream overlay in three steps: pick what to show, pick the look, add the link to OBS. */
export default function Panel({ eventId }: PanelProps) {
  const [state, setState] = useState<LiveState | null>(null);
  const [err, setErr] = useState("");
  const [ms, setMs] = useState<PublicMatch[]>([]);
  const [view, setView] = useState<OverlayView>("standings");
  const [theme, setTheme] = useState("dark");
  const [bg, setBg] = useState<"transparent" | "solid">("transparent");
  const [scale, setScale] = useState(1);
  const [team, setTeam] = useState("");
  const [msg, setMsg] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    let alive = true;
    live.get(eventId).then((s) => { if (alive) setState(s); }).catch((e) => { if (alive) setErr(explain(e)); });
    matchesApi.list(eventId, { ttl: 0 }).then((r) => { if (alive) setMs(r.matches.map((m) => ({ id: m.id, stage: m.stage, round: m.round, slot: m.slot, a: m.a, b: m.b, status: m.status, scoreA: m.scoreA, scoreB: m.scoreB, startsAt: m.startsAt }))); }).catch(() => undefined);
    return () => { alive = false; };
  }, [eventId]);

  const published = !!(state?.published && state.slug);
  const snap = state?.snapshot ?? null;
  const avail = useMemo(() => viewAvailability(snap, ms), [snap, ms]);
  const teams = useMemo(() => { const a = teamsOf(snap), seen = new Set(a.map((t) => t.toLowerCase())); return [...a, ...teamNames(ms).filter((t) => !seen.has(t.toLowerCase()))]; }, [snap, ms]);
  const url = published && typeof location !== "undefined" ? buildOverlayUrl(location.origin, { e: state!.slug!, v: view, theme, bg, scale, team }) : "";
  const previewUrl = url ? `${url}&preview=1` : "";

  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el); setW(el.clientWidth);
    return () => ro.disconnect();
  }, [published]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setMsg("Link copied. Now paste it into OBS."); } catch { setMsg("Could not copy. Select the link and copy it yourself."); }
  };

  const card = (v: OverlayView) => (
    <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)} className={`flex min-h-11 flex-col gap-2 rounded-xl border p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan ${view === v ? "border-cyan bg-cyan/10" : "border-zinc-700 hover:border-zinc-500"}`}>
      <Mini v={v} />
      <span className="flex items-center justify-between gap-2"><span className="font-semibold text-white">{VIEW_LABEL[v]}</span>{view === v && <span className="text-xs font-bold text-cyan">Selected</span>}</span>
      <span className="text-sm leading-5 text-zinc-300">{VIEW_HELP[v]}</span>
      {!avail[v] && <span className="text-xs leading-5 text-amber-200">Nothing to show yet. {NEEDS[v]}</span>}
    </button>
  );

  return (
    <section aria-label="Stream overlay" className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold text-white">Live overlay for your stream</h3>
        <p className="mt-1 text-sm leading-6 text-zinc-300">Add standings, the bracket or the current match to your stream. It updates by itself every few seconds, with no page to reload. It shows what you published on the Live page.</p>
      </div>
      {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
      {!state && !err && <p role="status" className="text-sm text-zinc-400">Loading…</p>}

      {state && !published && (
        <div role="status" className="card space-y-3 !p-4">
          <p className="font-semibold text-white">The live page is not published yet</p>
          <p className="text-sm leading-6 text-zinc-300">The overlay reads the live page, so publish that first. Anyone with the link will be able to see it. It takes one click, and you can switch it off again.</p>
          <button type="button" onClick={goToLivePanel} className="inline-flex min-h-11 items-center rounded-lg bg-cyan px-5 font-bold text-ink outline-none focus-visible:ring-2 focus-visible:ring-white">Go to the Live page panel</button>
        </div>
      )}

      {published && (
        <>
          <ToolStep n={1} title="Pick what to show" hint="One overlay shows one thing. Make more links for more things, one per OBS source.">
            <div role="radiogroup" aria-label="What to show" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{MAIN.map(card)}</div>
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-zinc-100">More views</summary>
              <div role="radiogroup" aria-label="More views" className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{MORE.map(card)}</div>
            </details>
          </ToolStep>

          <ToolStep n={2} title="Pick the look" hint="The design sets colours and fonts. Transparent lets your game and camera show behind it.">
            <div role="radiogroup" aria-label="Design" className="flex flex-wrap gap-2">
              {DISPLAY_THEMES.map((t) => (
                <button key={t.id} type="button" role="radio" aria-checked={theme === t.id} onClick={() => setTheme(t.id)} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-cyan ${theme === t.id ? "border-cyan bg-cyan text-ink" : "border-zinc-700 text-zinc-100 hover:border-zinc-500"}`}>
                  <span aria-hidden="true" className="h-3 w-3 rounded-full border border-white/40" style={{ background: `linear-gradient(90deg, ${t.accent}, ${t.accent2})` }} />{t.name}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <fieldset><legend className="mb-1 text-sm font-semibold text-zinc-100">Background</legend>
                <div role="radiogroup" aria-label="Background" className="flex gap-2">
                  {([["transparent", "Transparent"], ["solid", "Solid colour"]] as const).map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={bg === k} onClick={() => setBg(k)} className={`min-h-11 flex-1 rounded-lg border px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-cyan ${bg === k ? "border-cyan bg-cyan text-ink" : "border-zinc-700 text-zinc-100 hover:border-zinc-500"}`}>{l}</button>)}
                </div>
              </fieldset>
              <label className="block text-sm font-semibold text-zinc-100">Size
                <select value={scale} onChange={(e) => setScale(Number(e.target.value))} className={`${input} mt-1 font-normal`}>{SIZES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}</select>
              </label>
            </div>
            <details>
              <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-zinc-100">More options</summary>
              <label className="mt-1 block text-sm font-semibold text-zinc-100">Highlight one team (optional)
                <input list="ov-teams" value={team} maxLength={60} onChange={(e) => setTeam(e.target.value)} placeholder="Type or pick a team name" className={`${input} mt-1 font-normal`} />
                <datalist id="ov-teams">{teams.map((t) => <option key={t} value={t} />)}</datalist>
              </label>
              <p className="mt-1 text-sm text-zinc-400">That team is lit up in tables, brackets and schedules. The scores and the next-match bar then show only that team&apos;s matches.</p>
            </details>
          </ToolStep>

          <ToolStep n={3} title="Add it to OBS" hint="Copy the link, then follow the numbered steps. This link only shows what you published. Anyone who has it can open the overlay, so keep it to your stream team.">
            <div className="flex flex-wrap gap-2">
              <input readOnly aria-label="Overlay link" value={url} onFocus={(e) => e.currentTarget.select()} className={`${input} flex-1 basis-60 font-mono text-sm`} />
              <button type="button" onClick={copy} className="inline-flex min-h-11 items-center rounded-lg bg-cyan px-5 font-bold text-ink outline-none focus-visible:ring-2 focus-visible:ring-white">Copy link</button>
            </div>
            <p role="status" aria-live="polite" className="min-h-5 text-sm text-emerald-300">{msg}</p>

            <div>
              <p className="mb-1 text-sm font-semibold text-zinc-100">Preview</p>
              <div ref={box} className="relative w-full overflow-hidden rounded-lg border border-white/10" style={{ aspectRatio: "16 / 9", backgroundColor: "#1c1f26", backgroundImage: "conic-gradient(#2a2e38 25%, #1c1f26 0 50%, #2a2e38 0 75%, #1c1f26 0)", backgroundSize: "24px 24px" }}>
                {w > 0 && <iframe key={previewUrl} title="Overlay preview" src={previewUrl} loading="lazy" tabIndex={-1} style={{ position: "absolute", top: 0, left: 0, width: 1920, height: 1080, border: 0, background: "transparent", transform: `scale(${w / 1920})`, transformOrigin: "0 0" }} />}
              </div>
              <p className="mt-1 text-sm text-zinc-400">The checkered pattern is what shows through when the background is transparent.</p>
            </div>

            <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-zinc-200">
              <li>In OBS, under Sources, press + and choose <strong>Browser</strong>.</li>
              <li>Paste the link into the <strong>URL</strong> box.</li>
              <li>Set <strong>Width</strong> to 1920 and <strong>Height</strong> to 1080.</li>
              <li>Make sure <strong>Shutdown source when not visible</strong> is ticked off (not ticked), so it keeps updating.</li>
              <li>Press OK. The overlay appears over your scene and updates by itself. Move or resize it like any other source.</li>
            </ol>
            <p className="text-sm leading-6 text-zinc-300">Using Streamlabs Desktop? Add a <strong>Browser Source</strong> and use the same link, width and height. YouTube Live has no place to paste a link, so stream from OBS or Streamlabs and add the overlay there.</p>
          </ToolStep>
        </>
      )}
    </section>
  );
}
