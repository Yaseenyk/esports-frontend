"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import type { PanelProps } from "@/components/app/panels";
import ToolStep from "@/components/tools/ToolStep";
import { explain } from "@/lib/api/cloud";
import { league } from "@/lib/api/f-leaderboard";
import { matches as matchesApi, type MatchesState } from "@/lib/api/matches";
import { parsePlacement } from "@/lib/points";
import { COMMON_SCALE, MAX_DAYS, MAX_MATCH_NO, addDay, buildLeague, dayRangeText, daysProblem, leagueUrl, parseSettings, pointsText, removeDay, scoringText, tableFor, tieBreakText, updateDay, type LeagueDay, type LeagueState } from "@/lib/league";

const input = "min-h-11 w-full min-w-0 rounded-lg border border-zinc-700 bg-[#0a0b0d] px-3 text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan disabled:opacity-60";
const small = "btn-ghost !min-h-11 px-4 text-sm disabled:opacity-60";

/** A number typed by a person: blank, words, negatives where not allowed and more than 2 decimals are refused with a reason. */
function readNumber(text: string, what: string, min: number, max: number): { ok: true; n: number } | { ok: false; why: string } {
  const t = text.trim();
  const n = Number(t);
  if (!t || !Number.isFinite(n) || Math.round(n * 100) / 100 !== n) return { ok: false, why: `${what} must be a number such as 3 or 0.5.` };
  if (n < min || n > max) return { ok: false, why: `${what} must be between ${min} and ${max}.` };
  return { ok: true, n };
}

function Stepper({ label, value, set, min, max, disabled }: { label: string; value: number; set: (n: number) => void; min: number; max: number; disabled: boolean }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <button type="button" className="btn-ghost !min-h-11 !min-w-11 !px-0 text-lg" aria-label={`${label}: one less`} disabled={disabled || value <= min} onClick={() => set(value - 1)}>−</button>
      <output aria-label={label} className="min-w-12 text-center text-base font-semibold text-white">{value}</output>
      <button type="button" className="btn-ghost !min-h-11 !min-w-11 !px-0 text-lg" aria-label={`${label}: one more`} disabled={disabled || value >= max} onClick={() => set(value + 1)}>+</button>
    </div>
  );
}

/** Publish a season leaderboard: the points rules, optional day boundaries, and one link and QR code for players. */
export default function Panel({ eventId, eventName, role }: PanelProps) {
  const canEdit = role !== "viewer";
  const [state, setState] = useState<LeagueState | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [data, setData] = useState<MatchesState | null>(null);
  const [title, setTitle] = useState("");
  const [scaleText, setScaleText] = useState("");
  const [perKill, setPerKill] = useState("1");
  const [win, setWin] = useState("3");
  const [draw, setDraw] = useState("1");
  const [loss, setLoss] = useState("0");
  const [days, setDays] = useState<LeagueDay[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const adopt = (s: LeagueState) => {
    setState(s);
    const p = parseSettings(s);
    setTitle(p.title); setScaleText(p.scale.join(", ")); setPerKill(String(p.perKill)); setWin(String(p.winPts)); setDraw(String(p.drawPts)); setLoss(String(p.lossPts)); setDays(p.days);
  };
  useEffect(() => {
    let alive = true;
    league.get(eventId).then((s) => { if (alive) adopt(s); }).catch((e) => { if (alive) setLoadErr(explain(e)); });
    matchesApi.list(eventId, { ttl: 0 }).then((d) => { if (alive) setData(d); }).catch(() => { /* the counts are a nicety, the panel works without them */ });
    return () => { alive = false; };
  }, [eventId]);

  const url = state?.slug && typeof location !== "undefined" ? leagueUrl(location.origin, state.slug) : "";
  useEffect(() => { if (url && canvas.current) QRCode.toCanvas(canvas.current, url, { width: 192, margin: 2 }).catch(() => undefined); }, [url]);

  // The draft, checked. `problem` is the first thing to fix, in plain words.
  const draft = useMemo(() => {
    const placement = scaleText.trim() ? parsePlacement(scaleText) : [];
    const pk = readNumber(perKill, "Points per kill", 0, 1000);
    const w = readNumber(win, "Points for a win", -1000, 1000), d = readNumber(draw, "Points for a draw", -1000, 1000), l = readNumber(loss, "Points for a loss", -1000, 1000);
    let problem = "";
    if (!placement) problem = "Placement points must be numbers separated by commas, for example 10, 6, 5, 4. Zero or more, no negatives.";
    else if (placement.length > 100 || placement.some((n) => Math.round(n * 100) / 100 !== n || n > 10000)) problem = "Placement points can have at most 2 decimals and be up to 10000.";
    else if (!pk.ok) problem = pk.why;
    else if (!w.ok) problem = w.why;
    else if (!d.ok) problem = d.why;
    else if (!l.ok) problem = l.why;
    else if (title.trim().length > 80) problem = "The title can have at most 80 characters.";
    else problem = daysProblem(days) ?? "";
    const ok = !problem && placement && pk.ok && w.ok && d.ok && l.ok;
    return { problem, body: ok ? { title: title.trim(), scale: placement as number[], perKill: (pk as { n: number }).n, winPts: (w as { n: number }).n, drawPts: (d as { n: number }).n, lossPts: (l as { n: number }).n, days } : null };
  }, [title, scaleText, perKill, win, draw, loss, days]);

  const saved = state ? JSON.stringify(parseSettings(state)) : "";
  const dirty = !!draft.body && JSON.stringify(parseSettings(draft.body)) !== saved;

  const preview = useMemo(() => {
    if (!draft.body || !data) return null;
    const lg = buildLeague({ matches: data.matches, br: data.br, settings: draft.body });
    return { lg, table: tableFor(lg, lg.latest) };
  }, [draft.body, data]);

  const run = async (go: () => Promise<LeagueState>, done: (s: LeagueState) => string) => {
    if (busy || !canEdit) return;
    setBusy(true); setMsg(null);
    try { const s = await go(); adopt(s); setMsg({ ok: true, text: done(s) }); }
    catch (e) { setMsg({ ok: false, text: explain(e) }); } finally { setBusy(false); }
  };
  const save = () => { if (!draft.body) { setMsg({ ok: false, text: draft.problem }); return; } void run(() => league.put(eventId, draft.body!), () => "Saved. Anyone who already has the link sees the new points within a minute."); };
  const togglePublish = () => {
    if (!state || busy || !canEdit) return;
    if (!draft.body) { setMsg({ ok: false, text: draft.problem }); return; }
    const on = !state.published;
    if (!confirm(on ? "Publish the leaderboard? Anyone with the link will be able to see team names, points and results." : "Unpublish the leaderboard? The link will stop working until you publish again.")) return;
    void run(() => league.put(eventId, { ...draft.body!, published: on }), (s) => (s.published ? "The leaderboard is on. Anyone with the link can see it." : "The leaderboard is off. The link now says it is not live."));
  };

  const copy = async () => { try { await navigator.clipboard.writeText(url); setMsg({ ok: true, text: "Link copied." }); } catch { setMsg({ ok: false, text: "Could not copy. Select the link and copy it." }); } };
  const downloadQr = async () => {
    try { const a = document.createElement("a"); a.href = await QRCode.toDataURL(url, { width: 1024, margin: 4 }); a.download = "leaderboard-qr.png"; a.click(); }
    catch { setMsg({ ok: false, text: "Could not make the picture. Try again." }); }
  };

  const matchCount = data?.matches.length ?? 0, brGames = new Set(data?.br.map((r) => r.matchNo)).size;
  const noResults = !!data && matchCount === 0 && data.br.length === 0;
  const settingsForText = parseSettings(draft.body ?? state ?? {});

  return (
    <section aria-label="Season leaderboard" className="space-y-4">
      <div className="card space-y-2 !p-4">
        <h3 className="font-display text-lg font-bold text-white">One ranking for the whole season</h3>
        <p className="text-sm leading-6 text-zinc-300">Players and fans open one link on their phone and see every team ranked, how many points each team scored on each day, and whether it moved up or down. It is worked out from the results you record for {eventName}, so there is nothing to type twice, and it updates by itself.</p>
        {!canEdit && <p className="text-sm text-amber-200">You can look but not change this. Ask the owner or an editor of the event.</p>}
      </div>

      {loadErr && <p role="alert" className="text-sm text-red-300">{loadErr}</p>}
      {!state && !loadErr && <p role="status" className="text-sm text-zinc-400">Loading…</p>}

      {state && (
        <>
          {noResults && (
            <p role="status" className="rounded-lg border border-white/15 bg-[#0a0b0d] px-3 py-2 text-sm text-zinc-200">No results are recorded yet. Record them under Run the day, then come back. You can still set the points now.</p>
          )}

          <ToolStep n={1} title="Choose how points are scored" hint="Match this to your rulebook before you publish. Teams are ranked by total points." done={!!state.updatedAt && !dirty}>
            <label className="block"><span className="text-sm font-semibold text-zinc-100">Title of the leaderboard</span><input value={title} maxLength={80} disabled={!canEdit} onChange={(e) => setTitle(e.target.value)} placeholder={eventName} className={`${input} mt-1`} /></label>
            <p className="-mt-2 text-xs text-zinc-400">Leave it empty to use the name of the event.</p>

            <div className="space-y-2">
              <label className="block"><span className="text-sm font-semibold text-zinc-100">Battle royale: points for each place</span><input value={scaleText} inputMode="decimal" disabled={!canEdit} onChange={(e) => setScaleText(e.target.value)} placeholder="10, 6, 5, 4, 3, 2, 1, 1" className={`${input} mt-1`} aria-describedby="lg-scale-help" /></label>
              <p id="lg-scale-help" className="text-xs text-zinc-400">First number is for 1st place, the next for 2nd, and so on. Any place not listed scores 0. Only needed if you run battle royale games.</p>
              <button type="button" className={small} disabled={!canEdit} onClick={() => { setScaleText(COMMON_SCALE.join(", ")); setMsg(null); }}>Use a common example scale</button>
              <p className="text-xs text-zinc-400">The example is only a starting point; official events publish their own numbers.</p>
            </div>

            <label className="block"><span className="text-sm font-semibold text-zinc-100">Battle royale: points for each kill</span><input value={perKill} inputMode="decimal" disabled={!canEdit} onChange={(e) => setPerKill(e.target.value)} className={`${input} mt-1 sm:max-w-40`} /></label>

            <details className="rounded-lg border border-white/10 px-3">
              <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-zinc-100">More options: win, draw and loss points, and days</summary>
              <div className="space-y-5 pb-3 pt-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">Head-to-head matches (like football or a bracket)</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <label className="block"><span className="text-xs text-zinc-300">Win</span><input value={win} inputMode="decimal" disabled={!canEdit} onChange={(e) => setWin(e.target.value)} className={input} /></label>
                    <label className="block"><span className="text-xs text-zinc-300">Draw</span><input value={draw} inputMode="decimal" disabled={!canEdit} onChange={(e) => setDraw(e.target.value)} className={input} /></label>
                    <label className="block"><span className="text-xs text-zinc-300">Loss</span><input value={loss} inputMode="decimal" disabled={!canEdit} onChange={(e) => setLoss(e.target.value)} className={input} /></label>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-zinc-100">Days</p>
                  <p className="text-xs leading-5 text-zinc-400">Split the season into days so the page can show the table after each day and who moved up or down. Matches are counted in the order of your match list, round by round, starting at 1. A battle royale game uses its own game number. With no days, the page shows one table for the whole season.</p>
                  {days.length > 0 && (
                    <ul className="space-y-3">
                      {days.map((d, i) => (
                        <li key={i} className="space-y-2 rounded-lg border border-white/10 p-3">
                          <label className="block"><span className="text-xs text-zinc-300">Name of day {i + 1}</span><input value={d.label} maxLength={40} disabled={!canEdit} onChange={(e) => setDays(updateDay(days, i, { label: e.target.value }))} className={input} /></label>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                            <div><p className="text-xs text-zinc-300">First match</p><Stepper label={`Day ${i + 1} first match`} value={d.fromMatch} set={(n) => setDays(updateDay(days, i, { fromMatch: n, toMatch: Math.max(d.toMatch, n) }))} min={(days[i - 1]?.toMatch ?? 0) + 1} max={MAX_MATCH_NO} disabled={!canEdit} /></div>
                            <div><p className="text-xs text-zinc-300">Last match</p><Stepper label={`Day ${i + 1} last match`} value={d.toMatch} set={(n) => setDays(updateDay(days, i, { toMatch: n }))} min={d.fromMatch} max={MAX_MATCH_NO} disabled={!canEdit} /></div>
                          </div>
                          <p className="text-sm text-zinc-200">{dayRangeText(d)}</p>
                          <button type="button" className={small} disabled={!canEdit} aria-label={`Remove day ${i + 1}`} onClick={() => { if (confirm(`Remove ${d.label || `day ${i + 1}`}? You can add it again before you save.`)) setDays(removeDay(days, i)); }}>Remove this day</button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {days.length < MAX_DAYS && <button type="button" className={small} disabled={!canEdit} onClick={() => setDays(addDay(days))}>{days.length ? "Add another day" : "Add the first day"}</button>}
                </div>
              </div>
            </details>

            <div className="rounded-lg border border-white/10 bg-[#0a0b0d] p-3 text-sm leading-6 text-zinc-200" aria-label="How the points will read on the page">
              {scoringText(settingsForText).map((t, i) => <p key={i}>{t}</p>)}
              <p className="mt-1 text-zinc-300">{tieBreakText()}</p>
            </div>

            {draft.problem && <p role="alert" className="text-sm text-red-300">{draft.problem}</p>}
            {canEdit && <button type="button" className="btn" disabled={busy || !dirty || !draft.body} onClick={save}>{busy ? "Saving…" : dirty ? "Save the points" : "Saved"}</button>}
          </ToolStep>

          <ToolStep n={2} title="Publish and share" hint="Publishing makes one link work. Anyone with it can see team names, points and results, nothing else. You can switch it off at any time." done={state.published}>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" role="switch" aria-checked={state.published} aria-label="Leaderboard is published" disabled={busy || !canEdit} onClick={togglePublish} className={`relative h-11 w-20 shrink-0 rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-cyan disabled:opacity-60 ${state.published ? "border-cyan bg-cyan" : "border-zinc-600 bg-zinc-800"}`}><span aria-hidden="true" className={`absolute top-1.5 h-7 w-7 rounded-full bg-[#05070a] transition-all ${state.published ? "left-11" : "left-1.5 !bg-zinc-300"}`} /></button>
              <p className="text-sm font-semibold text-zinc-100">{state.published ? "Published: anyone with the link can see it" : "Not published: nobody can see it yet"}</p>
            </div>

            {url ? (
              <div className="space-y-3">
                <p className="break-all rounded-lg border border-white/10 bg-[#0a0b0d] px-3 py-2 font-mono text-xs text-zinc-200" aria-label="Public link">{url}</p>
                {!state.published && <p className="text-sm text-amber-200">The link will not work until you switch publishing on.</p>}
                <div className="flex flex-wrap items-start gap-4">
                  <canvas ref={canvas} width={192} height={192} role="img" aria-label="QR code for the leaderboard link" className="h-48 w-48 rounded-lg bg-white" />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={small} onClick={copy}>Copy link</button>
                    <a href={url} target="_blank" rel="noreferrer" className={small}>Open the page</a>
                    <button type="button" className={small} onClick={downloadQr}>Download QR for a poster</button>
                  </div>
                </div>
                <p className="text-xs text-zinc-400">The link is a long random code that nobody can guess, and it never changes while you keep this event. To stop sharing it, switch publishing off.</p>
              </div>
            ) : <p className="text-sm text-zinc-400">The link appears here after you save the points or publish for the first time.</p>}
          </ToolStep>

          {preview && (
            <div className="card space-y-2 !p-4" aria-label="Preview">
              <h4 className="font-semibold text-white">Preview of the table</h4>
              {preview.lg.empty || !preview.table ? <p className="text-sm text-zinc-300">Nothing to show yet. {matchCount} {matchCount === 1 ? "match" : "matches"} and {brGames} battle royale {brGames === 1 ? "game" : "games"} recorded, none with a result.</p> : (
                <>
                  <p className="text-sm text-zinc-300">Top of the table{preview.lg.days.length > 1 ? ` after ${preview.table.day.label}` : ""}, with the points you have set above:</p>
                  <ol className="space-y-1">{preview.table.rows.slice(0, 3).map((r) => <li key={r.team} className="text-sm text-zinc-100"><span className="font-semibold">{r.rank}.</span> {r.team}, {pointsText(r.points)} {r.points === 1 ? "point" : "points"}</li>)}</ol>
                </>
              )}
            </div>
          )}
        </>
      )}

      <div role="status" aria-live="polite" className="empty:hidden">
        {msg && <p className={`rounded-lg border px-3 py-2 text-sm ${msg.ok ? "border-emerald-300/40 text-emerald-200" : "border-red-300/40 text-red-200"}`}>{msg.text}</p>}
      </div>
    </section>
  );
}
