"use client";

import Link from "next/link";
import { sendEvent } from "@/lib/track";
import { useEffect, useMemo, useRef, useState } from "react";
import { CODM_EXAMPLE_SCALE, CODM_SAMPLE_TEAMS, EXAMPLE_SCALE, parsePlacement, standings, type Scale, type TeamEntry } from "@/lib/points";
import ScreenButtons from "@/components/display/ScreenButtons";
import WinnersBlock from "@/components/display/WinnersBlock";
import { pointsView } from "@/lib/display-views";
import { downloadBlob } from "@/lib/idcard/download";
import NumberField from "./NumberField";
import ToolStep from "./ToolStep";
import { toolCopy } from "@/lib/tool-copy";
import type { UiLang } from "@/lib/pt-br";
import ShareResult from "@/features/share-result/ui/ShareResult";
import { TOOL_PATHS } from "@/features/share-result/domain";
import { OVERLAY_KIT } from "@/features/overlay-kit/flag";
import { feedFromStandings } from "@/features/overlay-kit/domain";
import OverlayKitConnect from "@/features/overlay-kit/ui/OverlayKitConnect";

const EXAMPLE: TeamEntry[] = [
  { name: "Alpha", matches: [{ placement: 1, kills: 5 }, { placement: 4, kills: 2 }, { placement: 2, kills: 3 }] },
  { name: "Bravo", matches: [{ placement: 2, kills: 6 }, { placement: 1, kills: 4 }, { placement: 5, kills: 1 }] },
  { name: "Charlie", matches: [{ placement: 3, kills: 2 }, { placement: 2, kills: 7 }, { placement: 1, kills: 4 }] },
  { name: "Delta", matches: [{ placement: 4, kills: 3 }, { placement: 3, kills: 1 }, { placement: 3, kills: 6 }] },
];
const num = (v: string) => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n >= 0 ? Math.min(n, 9999) : 0; };

export type PointsPreset = "bgmi" | "free-fire" | "cod-mobile";
/** Each game page's note and starting numbers. `own` marks a scale written for this site (not one seen in custom rooms), which the note says. */
const PRESETS: Record<PointsPreset, { game: string; guide: string; scale: Scale; sample: TeamEntry[]; own?: boolean }> = {
  bgmi: { game: "BGMI", guide: "/guides/bgmi-custom-room-tournament/", scale: EXAMPLE_SCALE, sample: EXAMPLE },
  "free-fire": { game: "Free Fire", guide: "/guides/free-fire-tournament-organiser/", scale: EXAMPLE_SCALE, sample: EXAMPLE },
  "cod-mobile": { game: "COD Mobile", guide: "/guides/cod-mobile-tournament-rules-template/", scale: CODM_EXAMPLE_SCALE, sample: CODM_SAMPLE_TEAMS, own: true },
};

/**
 * Four steps: set the points, enter each team's results, read the standings, optionally show them on a TV. Nothing is sent anywhere.
 * Rendered in the browser only (see PointsTableLazy), so Google Translate finishing before React starts has no server HTML here to clash with.
 */
export default function PointsTable({ preset, lang = "en", path = TOOL_PATHS["points-table"] }: { /** A game landing page: the same tool, with a note that the starting scale is only an example. */ preset?: PointsPreset; /** The words on screen; numbers and rules are the same in every language. */ lang?: UiLang; /** The page the tool is on, for the address on share pictures. */ path?: string } = {}) {
  const pre = preset ? PRESETS[preset] : null;
  const START = pre?.scale ?? EXAMPLE_SCALE, SAMPLE = pre?.sample ?? EXAMPLE;
  const T = toolCopy(lang), c = T.points;
  const [scaleText, setScaleText] = useState(START.placement.join(", "));
  const [kill, setKill] = useState(START.perKill);
  const [matches, setMatches] = useState(3);
  const [teams, setTeams] = useState<TeamEntry[]>(SAMPLE);
  // What was typed in a box, so a 0 stays "0" (the stored number 0 means "empty" for a place). It is used only while it still matches the stored number.
  const [typed, setTyped] = useState<Record<string, string>>({});
  const shown = (key: string, n: number, blankZero: boolean) => { const t = typed[key]; return t !== undefined && num(t) === n ? t : n || !blankZero ? String(n) : ""; };
  const tableBox = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);

  const placement = parsePlacement(scaleText);
  const normalised = useMemo(() => teams.map((t) => ({ ...t, matches: Array.from({ length: matches }, (_, i) => t.matches[i] ?? { placement: 0, kills: 0 }) })), [teams, matches]);
  const table = useMemo(() => (placement ? standings(normalised.filter((t) => t.name.trim()), { placement, perKill: kill }) : []), [normalised, placement, kill]);

  // On a game page the picture says which game ("Free Fire standings"), never a bare "Standings".
  const screen = useMemo(() => (table.length ? pointsView(table, matches, pre ? c.view.gameTitle(pre.game) : c.view.title, c.view) : null), [table, matches, c, pre]);
  // The OBS overlay kit (behind its flag): the same ranked rows, sent to an overlay in this browser when the organiser switches it on.
  const kitFeed = useMemo(() => (OVERLAY_KIT && table.length ? feedFromStandings(table, { source: preset ?? "points-table", matches }) : null), [table, matches, preset]);
  const cells = normalised.length * matches;
  const filled = normalised.reduce((n, t) => n + t.matches.filter((m) => m.placement > 0).length, 0);
  const setCell = (ti: number, mi: number, key: "placement" | "kills", v: string) => {
    setTyped((o) => ({ ...o, [`${ti}:${mi}:${key}`]: v.replace(/\D/g, "").slice(0, 4) }));
    setTeams(normalised.map((t, i) => (i === ti ? { ...t, matches: t.matches.map((m, j) => (j === mi ? { ...m, [key]: num(v) } : m)) } : t)));
  };
  useEffect(() => {
    const el = tableBox.current; if (!el) return;
    const check = () => setScrolls(el.scrollWidth > el.clientWidth + 2);
    check();
    const ro = new ResizeObserver(check); ro.observe(el); return () => ro.disconnect();
  }, [table.length, matches]);
  const csv = () => {
    const h = c.csvHead, head = [h.rank, h.team, ...Array.from({ length: matches }, (_, i) => h.match(i + 1)), h.placement, h.kill, h.total];
    const rows = table.map((s) => [s.rank, s.name, ...s.perMatch, s.placementPoints, s.killPoints, s.total]);
    downloadBlob(new Blob([[head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n")], { type: "text/csv" }), c.csvFile); sendEvent("tool_complete", "points-table");
  };
  // The button used to give no sign when the example was already in the boxes (the default), so people pressed it again and again.
  const [scaleNote, setScaleNote] = useState("");
  const loadExampleScale = () => { setScaleText(START.placement.join(", ")); setKill(START.perKill); };
  const exampleButton = () => {
    const already = placement?.join(", ") === START.placement.join(", ") && kill === START.perKill;
    loadExampleScale();
    setScaleNote((already ? c.already : c.filled)(START.placement.join(", "), START.perKill));
  };
  const scaleSample = placement ? placement.slice(0, 3).map((p, i) => c.sampleItem(c.ord(i + 1), p)).join(", ") : "";

  // data-clarity-mask: Microsoft Clarity (loaded on these pages) never records team names or scores. data-pulse-label: the Pulse visit counter
  // reads a clicked control's label, and these labels hold team names, so the counter gets a fixed word instead. The "Safe to use" box relies on both.
  return (
    <div className="space-y-5" data-clarity-mask="true">
      <ToolStep n={1} id="pt-scale" title={c.s1Title} done={Boolean(placement)} stepWord={T.stepWord}
        hint={c.s1Hint}
        status={placement ? c.s1Status(placement.length) : undefined}>
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem_9rem]">
          <label className="block text-sm text-zinc-200">{c.scaleLabel}<input className="field mt-1 font-mono" value={scaleText} onChange={(e) => { setScaleText(e.target.value); setScaleNote(""); }} aria-invalid={!placement} aria-describedby="scale-help" /></label>
          <NumberField label={c.perKill} value={kill} min={0} max={1000} decimal onChange={setKill} />
          <NumberField label={c.matchesPlayed} value={matches} min={1} max={12} onChange={setMatches} />
        </div>
        <p id="scale-help" className={`text-sm leading-6 ${placement ? "text-zinc-300" : "text-red-300"}`} role={placement ? undefined : "alert"}>{placement ? c.help(scaleSample, placement.length > 3) : c.helpBad}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-ghost !min-h-10 px-4 text-sm" onClick={exampleButton}>{pre?.own ? c.exampleBtnOwn : c.exampleBtn}</button>
          <span className="text-xs text-zinc-400">{c.exampleNote}</span>
        </div>
        <p role="status" aria-live="polite" className="empty:hidden text-sm text-emerald-200" data-testid="scale-note">{scaleNote && <span key={scaleNote}>{scaleNote}</span>}</p>
        {pre && <p className="rounded-lg border border-amber-300/30 bg-amber-300/5 p-3 text-sm leading-6 text-amber-100" data-testid="preset-note">{pre.own ? c.presetOwn(pre.game) : c.presetA(pre.game)}<Link href={pre.guide} className="underline">{c.guideLabel[preset!]}</Link>{c.presetAnd}<Link href="/guides/esports-tournament-rules-template/" className="underline">{c.rulesTemplate}</Link>{c.presetEnd}</p>}
      </ToolStep>

      <ToolStep n={2} id="pt-results" title={c.s2Title} done={cells > 0 && filled >= cells} stepWord={T.stepWord}
        hint={c.s2Hint}
        status={normalised.length ? c.s2Status(filled, cells) : undefined}
        actions={<>
          <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" onClick={() => setTeams([...normalised, { name: c.teamN(normalised.length + 1), matches: [] }])}>{c.addTeam}</button>
          <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" onClick={() => { setTeams(SAMPLE); setMatches(3); loadExampleScale(); }}>{c.useExample}</button>
          {filled > 0 && <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" onClick={() => setTeams(normalised.map((t) => ({ ...t, matches: t.matches.map(() => ({ placement: 0, kills: 0 })) })))}>{c.clear}</button>}
        </>}>
        {normalised.length === 0 ? <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-zinc-300">{c.noTeams}</p> : (
          <ul className="space-y-3">
            {normalised.map((t, ti) => (
              <li key={ti} className="rounded-xl border border-white/[0.14] bg-[#0f1013] p-3">
                <div className="flex items-center gap-2">
                  <input aria-label={c.teamName(ti + 1)} className="field !min-h-11 min-w-0 flex-1 font-semibold" value={t.name} onChange={(e) => setTeams(normalised.map((x, i) => (i === ti ? { ...x, name: e.target.value } : x)))} />
                  <button type="button" className="chip !min-h-11 shrink-0" data-pulse-label="remove team" aria-label={c.removeTeam(t.name || c.removeTeamN(ti + 1))} onClick={() => setTeams(normalised.filter((_, i) => i !== ti))}>{c.remove}</button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {t.matches.map((m, mi) => (
                    <fieldset key={mi} className="min-w-0 rounded-lg border border-white/[0.1] p-2">
                      <legend className="px-1 text-xs font-medium text-zinc-300">{c.match(mi + 1)}</legend>
                      <div className="flex gap-2">
                        <label className="block min-w-0 flex-1 text-[11px] text-zinc-300">{c.place}<input data-pulse-label="placement" aria-label={c.cellPlace(t.name || c.teamN(ti + 1), mi + 1)} className="field !min-h-11 mt-0.5 !px-2 text-center" inputMode="numeric" value={shown(`${ti}:${mi}:placement`, m.placement, true)} onChange={(e) => setCell(ti, mi, "placement", e.target.value)} /></label>
                        <label className="block min-w-0 flex-1 text-[11px] text-zinc-300">{c.kills}<input data-pulse-label="kills" aria-label={c.cellKills(t.name || c.teamN(ti + 1), mi + 1)} className="field !min-h-11 mt-0.5 !px-2 text-center" inputMode="numeric" value={shown(`${ti}:${mi}:kills`, m.kills, true)} onChange={(e) => setCell(ti, mi, "kills", e.target.value)} /></label>
                      </div>
                    </fieldset>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </ToolStep>

      <ToolStep n={3} id="pt-standings" title={c.s3Title} done={table.length > 0 && filled > 0} stepWord={T.stepWord}
        hint={c.s3Hint}
        status={table.length && filled > 0 ? c.leading(table[0]!.name, table[0]!.total) : undefined}
        actions={<button type="button" className="btn-ghost !min-h-10 px-3 text-sm" disabled={!table.length} onClick={csv}>{c.csvBtn}</button>}>
        <section aria-label={c.standings} aria-live="polite" className="space-y-3">
          {table.length === 0 ? <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-zinc-300" role={placement ? undefined : "alert"}>{placement ? c.noStandings : c.fixScale}</p> : (
            <>
              {filled === 0 && <p className="text-sm text-zinc-300">{c.noResults}</p>}
              {scrolls && <p className="text-xs text-zinc-300">{c.swipe}</p>}
              <div ref={tableBox} role="region" aria-label={c.tableLabel} tabIndex={0} className="overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-cyan">
                <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
                  <thead><tr className="bg-[#0f1013] text-zinc-200"><th scope="col" className="px-3 py-2">{c.th.rank}</th><th scope="col" className="px-3 py-2">{c.th.team}</th>{Array.from({ length: matches }, (_, i) => <th key={i} scope="col" className="px-3 py-2">{c.th.m(i + 1)}</th>)}<th scope="col" className="px-3 py-2">{c.th.kills}</th><th scope="col" className="px-3 py-2">{c.th.wins}</th><th scope="col" className="sticky right-0 bg-[#0f1013] px-3 py-2 shadow-[-6px_0_6px_-6px_rgba(0,0,0,0.8)]">{c.th.total}</th></tr></thead>
                  <tbody>{table.map((s) => <tr key={s.name + s.rank} className="border-t border-white/[0.08]"><th scope="row" className="px-3 py-2 font-bold text-cyan">{s.rank}</th><td className="px-3 py-2 font-medium text-white"><span>{s.name}</span>{s.tied && <span className="ml-2 text-xs text-amber-300" title={c.tieTitle}>{c.tie}</span>}</td>{s.perMatch.map((p, i) => <td key={i} className="px-3 py-2 text-zinc-300">{p}</td>)}<td className="px-3 py-2 text-zinc-300">{s.kills}</td><td className="px-3 py-2 text-zinc-300">{s.wins}</td><td className="sticky right-0 bg-[#0a0b0d] px-3 py-2 font-bold text-white shadow-[-6px_0_6px_-6px_rgba(0,0,0,0.8)]">{s.total}</td></tr>)}</tbody>
                </table>
              </div>
              <p className="text-xs leading-5 text-zinc-400">{c.footnote}</p>
            </>
          )}
        </section>
        {table.length > 0 && filled > 0 && <ShareResult payload={screen} what={c.what} path={path} lang={lang} />}
      </ToolStep>

      {table.length > 0 && filled > 0 && <WinnersBlock first={table[0]!.name} second={table[1]?.name} third={table[2]?.name} title={c.winnersTitle(matches)} lang={lang} path={path} />}

      <ScreenButtons payload={screen} what={c.what} step={4} lang={lang} path={path} />
      {OVERLAY_KIT && lang === "en" && <OverlayKitConnect feed={kitFeed} />}
    </div>
  );
}
