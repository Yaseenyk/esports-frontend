"use client";

import Link from "next/link";
import { sendEvent } from "@/lib/track";
import { Fragment, useMemo, useState } from "react";
import ToolStep from "./ToolStep";
import NumberField from "./NumberField";
import { downloadBlob } from "@/lib/idcard/download";
import { buildPack, fmtDuration, nextSteps, planTournament, FORMAT_NAMES, MAX_TEAMS, PLAN_DEFAULTS, type GameKind, type PlanInput } from "@/lib/plan";
import { REG_PRESETS, type RegPresetId } from "@/lib/regform";

const KINDS: { id: GameKind; title: string; line: string }[] = [
  { id: "br", title: "Battle royale", line: "Many teams in one match, like BGMI or Free Fire" },
  { id: "h2h", title: "Head to head", line: "Two teams per match, like Valorant or football" },
];

const START: Record<GameKind, Pick<PlanInput, "teams" | "rooms" | "hours">> = { br: { teams: 24, rooms: 2, hours: 6 }, h2h: { teams: 8, rooms: 1, hours: 6 } };

/** Four steps: what kind of game, how big, your plan, the pack. Everything is worked out in the browser from the same libraries the other tools use. */
export default function PlanWizard() {
  const [kind, setKind] = useState<GameKind | null>(null);
  const [i, setI] = useState<Omit<PlanInput, "kind">>({ ...START.br, start: "10:00" });
  const [event, setEvent] = useState("");
  const [preset, setPreset] = useState<RegPresetId>("squad");
  const [copied, setCopied] = useState<"" | "yes" | "no">("");

  const input: PlanInput | null = kind ? { kind, ...i } : null;
  const plan = useMemo(() => (input ? planTournament(input) : null), [input?.kind, i]); // eslint-disable-line react-hooks/exhaustive-deps
  const ok = plan && plan.ok ? plan : null;
  const pack = useMemo(() => (ok ? buildPack(ok, { event, preset }, "text") : ""), [ok, event, preset]);

  const choose = (k: GameKind) => {
    setKind(k);
    setI((x) => ({ ...x, ...START[k], format: undefined, perLobby: undefined }));
    setPreset(k === "br" ? "squad" : "five");
    setCopied("");
  };
  const num = (k: "teams" | "rooms" | "hours" | "perLobby" | "matchLength" | "gap" | "breakEvery" | "breakLength", label: string, min: number, max: number, hint?: string, shown?: number, decimal = false) => (
    <NumberField label={label} value={shown ?? (i[k] as number)} min={min} max={max} decimal={decimal} hint={hint} onChange={(n) => setI((x) => ({ ...x, [k]: n }))} />
  );
  const copy = async () => { try { await navigator.clipboard.writeText(pack); setCopied("yes"); sendEvent("tool_complete", "plan"); } catch { setCopied("no"); } setTimeout(() => setCopied(""), 2500); };
  const slug = (event.trim() || "tournament-plan").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "tournament-plan";

  return (
    <div className="space-y-5">
      <ToolStep n={1} id="pl-kind" title="What kind of game?" done={!!kind} hint="This decides the format: a points league for battle royale, or a bracket or league for head to head games.">
        <div role="group" aria-label="Kind of game" className="grid gap-3 sm:grid-cols-2">
          {KINDS.map((k) => (
            <button key={k.id} type="button" aria-pressed={kind === k.id} onClick={() => choose(k.id)}
              className={`min-h-11 rounded-xl border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${kind === k.id ? "border-cyan bg-[#0c1822]" : "border-white/[0.14] bg-[#0a0b0d] hover:border-white/30"}`}>
              <span className="block font-display text-lg font-bold text-white">{k.title}</span>
              <span className="mt-1 block text-sm text-zinc-300">{k.line}</span>
            </button>
          ))}
        </div>
      </ToolStep>

      {kind && (
        <ToolStep n={2} id="pl-size" title="How big?" done={!!ok} hint="Type how many teams you expect, how many matches you can run at the same time, how many hours you have and when you start. The plan updates as you type."
          status={ok ? `${ok.teams} teams` : undefined}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {num("teams", "Number of teams", 2, MAX_TEAMS[kind], kind === "br" ? "Up to 500. A team is a squad, duo or solo player." : "Up to 64. A team is one side of a match.")}
            {num("rooms", "Rooms at the same time", 1, 100, kind === "br" ? "Lobbies or custom rooms you can host together. 1 means one match at a time." : "Matches you can run together: rooms, pitches or stations.")}
            {num("hours", "Hours available", 0.5, 24, "From the first match to the latest finish. Half hours are fine.", undefined, true)}
            <label className="block text-sm text-zinc-200">Start time<input className="field mt-1" type="time" value={i.start} onChange={(e) => setI((x) => ({ ...x, start: e.target.value }))} /><span className="mt-1 block text-xs text-zinc-400">When the first match begins</span></label>
          </div>
          <details className="group rounded-xl border border-white/10 bg-[#0a0b0d]">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan [&::-webkit-details-marker]:hidden">
              <span>More options <span className="font-normal text-zinc-300">· {kind === "br" ? `${i.perLobby ?? PLAN_DEFAULTS.perLobby} teams per lobby, ` : ""}{i.matchLength ?? (kind === "br" ? PLAN_DEFAULTS.brMatchLength : PLAN_DEFAULTS.h2hMatchLength)} minute matches, {i.gap ?? PLAN_DEFAULTS.gap} minutes between rounds</span></span>
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 fill-none stroke-current text-zinc-400 transition-transform group-open:rotate-180" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5" /></svg>
            </summary>
            <div className="grid gap-4 border-t border-white/10 p-4 sm:grid-cols-2 lg:grid-cols-4">
              {kind === "br" && num("perLobby", "Teams per lobby", 2, 100, "Most squad lobbies hold up to 12 teams. Check your game.", i.perLobby ?? PLAN_DEFAULTS.perLobby)}
              {num("matchLength", "Minutes per match", 1, 600, "How long one match usually lasts", i.matchLength ?? (kind === "br" ? PLAN_DEFAULTS.brMatchLength : PLAN_DEFAULTS.h2hMatchLength))}
              {num("gap", "Minutes between rounds", 0, 120, "Time to join, report results and reset", i.gap ?? PLAN_DEFAULTS.gap)}
              {num("breakEvery", "Longer break after every", 0, 50, "Rounds. Type 0 for none", i.breakEvery ?? PLAN_DEFAULTS.breakEvery)}
              {num("breakLength", "Longer break (minutes)", 0, 240, "For food or a rest", i.breakLength ?? PLAN_DEFAULTS.breakLength)}
            </div>
          </details>
        </ToolStep>
      )}

      {kind && (
        <ToolStep n={3} id="pl-plan" title="Your plan" done={!!ok?.verdict.fits}
          hint="The recommended format, how many matches it needs, and whether it fits the hours you have. Change a number above if it does not fit."
          status={ok ? (ok.verdict.fits ? `Ends ${ok.verdict.finish}` : "Does not fit") : undefined} printHeader>
          <div aria-label="Plan" role="group" className="space-y-4">
            {!plan || !plan.ok ? <p role="alert" className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-red-300">{plan && !plan.ok ? plan.error : ""}</p> : (
              <>
                <p role="status" aria-live="polite" data-testid="verdict" className={`rounded-xl border p-4 text-base font-bold ${plan.verdict.fits ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" : "border-red-400/40 bg-red-400/10 text-red-200"}`}>{plan.verdict.text}</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-200">{plan.summary.map((l) => <li key={l}>{l}</li>)}</ul>

                {plan.kind === "h2h" && (
                  <div className="space-y-3">
                    <p className="text-sm text-zinc-200"><strong className="text-white">Recommended: {FORMAT_NAMES[plan.recommended]}.</strong> {plan.reason}{plan.alternative ? ` The alternative is ${FORMAT_NAMES[plan.alternative].toLowerCase()}.` : ""}</p>
                    <div role="group" aria-label="Format" className="grid gap-3 sm:grid-cols-3">
                      {plan.options.map((o) => (
                        <button key={o.id} type="button" aria-pressed={plan.chosen === o.id} onClick={() => setI((x) => ({ ...x, format: o.id }))}
                          className={`rounded-xl border p-3 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${plan.chosen === o.id ? "border-cyan bg-[#0c1822]" : "border-white/[0.14] bg-[#0a0b0d] hover:border-white/30"}`}>
                          <span className="block font-bold text-white">{o.name}{o.id === plan.recommended ? " (recommended)" : ""}</span>
                          <span className="mt-1 block text-zinc-300">{o.matches} matches{o.extra ? ` (+${o.extra} if needed)` : ""}, {o.rounds} stage{o.rounds === 1 ? "" : "s"}</span>
                          <span className={`mt-1 block ${o.fits ? "text-emerald-300" : "text-red-300"}`}>{fmtDuration(o.minutes)}, {o.fits ? `ends ${o.finish}` : "does not fit"}</span>
                        </button>
                      ))}
                    </div>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">{plan.seedingLines.map((l) => <li key={l}>{l}</li>)}</ul>
                  </div>
                )}

                {plan.kind === "br" && (
                  <div className="space-y-2 text-sm text-zinc-200">
                    <p><strong className="text-white">Points league.</strong> Every team plays {plan.matchesPerLobby} match{plan.matchesPerLobby === 1 ? "" : "es"}, ranked by placement points plus kill points.{plan.lobbies > 1 ? " Teams are split into lobbies; decide how in your rules (draw, seeding or order of registration)." : ""}</p>
                    {plan.finals && <p className="rounded-lg border border-white/10 p-3 text-zinc-300"><strong className="text-white">A suggestion, if you want it:</strong> there is time for one extra final match for the top {plan.finals.teams} teams, ending about {plan.finals.ends}. How finalists are chosen and whether points carry over is for you to decide in your rules.</p>}
                    <p className="text-zinc-300">{plan.scaleLines[0]} It is only an example: use your own rulebook&apos;s scale. Work out the table with the <Link href="/tools/points-table/" className="text-cyan underline">points table calculator</Link>.</p>
                  </div>
                )}

                <div role="region" aria-label="Schedule table" tabIndex={0} className="overflow-x-auto rounded-xl border border-white/[0.14] outline-none focus-visible:ring-2 focus-visible:ring-cyan">
                  <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                    <thead><tr className="bg-[#0f1013] text-zinc-200"><th scope="col" className="px-3 py-2">Round</th><th scope="col" className="px-3 py-2">Start</th><th scope="col" className="px-3 py-2">End</th><th scope="col" className="px-3 py-2">Matches</th></tr></thead>
                    <tbody>
                      {plan.rows.map((r) => (
                        <Fragment key={r.n}>
                          <tr className="border-t border-white/[0.08]"><th scope="row" className="px-3 py-2 font-bold text-cyan">{r.n}</th><td className="px-3 py-2 text-white">{r.start}</td><td className="px-3 py-2 text-zinc-300">{r.end}</td><td className="px-3 py-2 text-zinc-300">{r.items.join("; ")}</td></tr>
                          {r.breakAfter > 0 && <tr className="border-t border-white/[0.08] bg-[#0c0d10]"><td colSpan={4} className="px-3 py-2 text-xs text-amber-200">Break: {r.breakAfter} minutes</td></tr>}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-zinc-400">Times are planned, not promised. Matches nearly always run longer, so keep some slack. A time marked (+1d) is after midnight.</p>
              </>
            )}
          </div>
        </ToolStep>
      )}

      {kind && (
        <ToolStep n={4} id="pl-pack" title="Copy or download the pack" done={copied === "yes"}
          hint="One file with the summary, format, schedule, points scale or seeding, draft rules, the sign-up form and your next steps. Anything only you can decide is left in [brackets].">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm text-zinc-200">Event name (optional)<input className="field mt-1" value={event} onChange={(e) => setEvent(e.target.value)} maxLength={80} placeholder="For example, Monsoon Clash" /></label>
            <label className="block text-sm text-zinc-200">Team size (for the rules and sign-up form)<select className="field mt-1" value={preset} onChange={(e) => setPreset(e.target.value as RegPresetId)}>{REG_PRESETS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
          </div>
          {ok ? (
            <>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-white/[0.14] bg-[#0f1013] p-3 text-sm text-zinc-200" tabIndex={0} aria-label="Tournament pack text">{pack}</pre>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="btn px-4 text-sm" onClick={copy}>{copied === "yes" ? "Copied" : "Copy the pack"}</button>
                <button type="button" className="btn-ghost px-4 text-sm" onClick={() => { downloadBlob(new Blob([pack], { type: "text/plain" }), `${slug}.txt`); sendEvent("tool_complete", "plan"); }}>Download as text</button>
                <button type="button" className="btn-ghost px-4 text-sm" onClick={() => downloadBlob(new Blob([buildPack(ok, { event, preset }, "md")], { type: "text/markdown" }), `${slug}.md`)}>Download as Markdown</button>
                <span role="status" aria-live="polite" className={`text-sm ${copied === "yes" ? "text-emerald-300" : "text-amber-200"}`}>{copied === "yes" ? "Copied. Now paste it where you want it." : copied === "no" ? "Your browser did not allow copying. Select the text above and copy it yourself." : ""}</span>
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-white">Next, open the tool</h4>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">{nextSteps(ok).map((s) => <li key={s.href}><Link href={s.href} className="block rounded-xl border border-white/10 bg-[#0a0b0d] p-3 text-sm outline-none hover:border-cyan focus-visible:ring-2 focus-visible:ring-cyan"><span className="font-semibold text-white">Open in the {s.label}</span><span className="mt-1 block text-zinc-400">{s.why}</span></Link></li>)}</ul>
              </div>
            </>
          ) : <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-zinc-300">Fix the numbers in step 2 to see your pack.</p>}
        </ToolStep>
      )}
      {!kind && <p className="text-sm text-zinc-400">Choose a kind of game to continue.</p>}
    </div>
  );
}
