"use client";

import { useMemo, useState } from "react";
import type { PanelProps } from "@/components/app/panels";
import TeamsInput from "@/components/tools/TeamsInput";
import ToolStep from "@/components/tools/ToolStep";
import { events as eventsApi, explain } from "@/lib/api/cloud";
import { matches as matchesApi, useMatches, type MatchInput } from "@/lib/api/matches";
import { uniqueTeams } from "@/lib/seeding";
import {
  KNOCKOUT_STAGE, MAX_TEAMS, MIN_TEAMS, buildKnockout, clampSettings, defaultSettings, groupMatchCount, groupMatches, groupsFromMatches, qualifiers, splitGroups, type StageSettings,
} from "@/lib/stages";
import SettingsFields from "./SettingsFields";

const MAX_MATCHES = 512;
const ownStage = (s: string) => s === KNOCKOUT_STAGE || /^group\s*:/i.test(s.trim());
const shortId = () => { const b = new Uint8Array(6); crypto.getRandomValues(b); return Array.from(b, (x) => x.toString(36).padStart(2, "0")).join("").slice(0, 10); };

/**
 * Groups, then knockout, for a signed-in event. Four steps: pick the teams, choose groups and how many go through, create the group matches,
 * and (once results are in) make the knockout. The matches are the shared match model, so the scorer links and captain results fill them in.
 */
export default function Panel({ eventId, eventName, role }: PanelProps) {
  const canEdit = role !== "viewer";
  const { matches, loaded, loading, error, refetch } = useMatches(eventId);
  const [text, setText] = useState("");
  const [custom, setCustom] = useState<StageSettings | null>(null);
  const [koCustom, setKoCustom] = useState<{ advance: number; thirds: number } | null>(null);
  const [busy, setBusy] = useState<"" | "roster" | "groups" | "knockout">("");
  const [confirm, setConfirm] = useState<"" | "groups" | "knockout">("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const teams = useMemo(() => uniqueTeams(text.split(/\r?\n/)).slice(0, MAX_TEAMS), [text]);
  const ready = teams.length >= MIN_TEAMS;
  const settings = useMemo(() => (custom ? clampSettings(teams.length, custom) : defaultSettings(teams.length)), [custom, teams.length]);
  const plan = useMemo(() => (ready ? splitGroups(teams, settings.groups, settings.mode) : []), [ready, teams, settings]);
  const planTotal = plan.reduce((n, g) => n + groupMatchCount(g.teams.length), 0);

  const existing = matches.filter((m) => ownStage(m.stage));
  const others = matches.length - existing.length;
  const tooMany = others + planTotal > MAX_MATCHES;
  const states = useMemo(() => groupsFromMatches(matches), [matches]);
  const groupTeams = states.reduce((n, s) => n + s.group.teams.length, 0);
  const groupTotal = states.reduce((n, s) => n + s.total, 0);
  const groupDone = states.reduce((n, s) => n + s.done, 0);
  const koExisting = matches.filter((m) => m.stage === KNOCKOUT_STAGE);
  const koSettings = useMemo(() => {
    const base = defaultSettings(groupTeams || MIN_TEAMS);
    return { advance: koCustom?.advance ?? 2, thirds: koCustom?.thirds ?? 0, groups: Math.max(2, states.length), mode: base.mode } as StageSettings;
  }, [koCustom, groupTeams, states.length]);
  const koPreview = useMemo(() => (states.length ? qualifiers(states.map((s) => ({ name: s.group.name, rows: s.rows })), koSettings.advance, koSettings.thirds) : []), [states, koSettings]);

  const fail = (e: unknown) => setMsg({ kind: "err", text: explain(e) });

  const loadRoster = async () => {
    setBusy("roster"); setMsg(null);
    try {
      const r = await eventsApi.roster(eventId);
      const names = r.teams.map((t) => t.name);
      if (names.length === 0) setMsg({ kind: "err", text: "This event has no teams on its roster yet. Type the team names below instead." });
      else { setText(names.join("\n")); setMsg({ kind: "ok", text: `Added ${names.length} team${names.length === 1 ? "" : "s"} from the roster.` }); }
    } catch (e) { fail(e); } finally { setBusy(""); }
  };

  const createGroups = async () => {
    setConfirm(""); setBusy("groups"); setMsg(null);
    try {
      const body: MatchInput[] = groupMatches(plan);
      // Write each new stage in one step that replaces the old matches of that stage, and only then remove stages that are no longer used,
      // so a failure part-way never leaves the event with nothing.
      const newStages = [...new Set(body.map((m) => m.stage))];
      for (const stage of newStages) await matchesApi.put(eventId, { matches: body.filter((m) => m.stage === stage), replaceStage: stage });
      for (const stage of new Set(existing.map((m) => m.stage))) if (!newStages.includes(stage)) await matchesApi.clear(eventId, stage);
      await refetch();
      setMsg({ kind: "ok", text: `Created ${body.length} group matches in ${plan.length} groups. Next, enter the results in the Scorer links or Results from captains boxes, then come back to make the knockout.` });
    } catch (e) { setMsg({ kind: "err", text: `${explain(e)} Some groups may already be replaced. Press the button again to finish.` }); void refetch(); }
    finally { setBusy(""); }
  };

  const makeKnockout = async () => {
    setConfirm(""); setBusy("knockout"); setMsg(null);
    try {
      const fresh = await matchesApi.list(eventId, { force: true });
      const st = groupsFromMatches(fresh.matches);
      if (st.length === 0) { setMsg({ kind: "err", text: "There are no group matches yet. Create them in step 3 first." }); return; }
      const q = qualifiers(st.map((s) => ({ name: s.group.name, rows: s.rows })), koSettings.advance, koSettings.thirds);
      const ko = buildKnockout(q, `k${shortId()}`);
      if (ko.matches.length === 0) { setMsg({ kind: "err", text: "At least two teams need to go through to make a knockout." }); return; }
      const body: MatchInput[] = ko.matches.map((m) => ({ id: m.id, stage: m.stage, round: m.round, slot: m.slot, a: m.a, b: m.b, nextId: m.nextId, nextSide: m.nextSide }));
      await matchesApi.put(eventId, { matches: body, replaceStage: KNOCKOUT_STAGE });
      await refetch();
      setMsg({ kind: "ok", text: `Created the knockout: ${q.length} teams, ${ko.matches.length} matches${ko.byes ? `, ${ko.byes} bye${ko.byes === 1 ? "" : "s"}` : ""}. When a knockout result is entered, the winner moves on by itself.` });
    } catch (e) { fail(e); } finally { setBusy(""); }
  };

  const askGroups = () => (existing.length > 0 ? setConfirm("groups") : void createGroups());
  const askKnockout = () => (koExisting.length > 0 || groupDone < groupTotal ? setConfirm("knockout") : void makeKnockout());

  if (error && !loaded) return <p role="alert" className="rounded-xl border border-amber-400/40 p-4 text-sm text-amber-200">Could not load the matches of {eventName}. {explain(error)} <button type="button" className="underline" onClick={() => void refetch()}>Try again</button></p>;
  if (!loaded && loading) return <p role="status" className="text-sm text-zinc-300">Loading the matches of {eventName}…</p>;

  if (!canEdit) {
    return (
      <section aria-label="Groups, then knockout" className="space-y-2 text-sm text-zinc-200">
        <p>You can look at this event but not change it, so the buttons to create groups and a knockout are hidden. Ask the owner to make you an editor.</p>
        <p>{states.length ? `${states.length} groups, ${groupDone} of ${groupTotal} group matches have a result.` : "No groups have been created yet."}{koExisting.length ? ` The knockout has ${koExisting.length} matches.` : ""}</p>
      </section>
    );
  }

  return (
    <section aria-label="Groups, then knockout" className="space-y-4">
      <p className="text-sm text-zinc-300">Create the stages for this event in four steps. Teams play in groups first. Then the best teams go to a knockout, and winners move on by themselves when a result is entered.</p>

      <ToolStep n={1} id="st-teams" title="Pick the teams" done={ready} hint="Use the teams already on this event's roster, or type them. One per line, between 4 and 64." status={ready ? `${teams.length} teams` : undefined}
        actions={<button type="button" className="btn-ghost !min-h-10 px-3 text-sm" disabled={busy !== ""} onClick={() => void loadRoster()}>{busy === "roster" ? "Loading…" : "Use the roster teams"}</button>}>
        <TeamsInput value={text} onChange={setText} min={MIN_TEAMS} max={MAX_TEAMS} example={["Team A", "Team B", "Team C", "Team D", "Team E", "Team F", "Team G", "Team H"]} label="One team per line" />
      </ToolStep>

      <ToolStep n={2} id="st-settings" title="Choose the groups and how many go through" done={ready} hint="Good numbers are filled in already. You can skip this step.">
        {!ready ? <p className="rounded-xl border border-dashed border-white/15 p-5 text-center text-sm text-zinc-300">Add at least {MIN_TEAMS} teams in step 1 to choose your groups.</p> : <SettingsFields n={teams.length} value={settings} onChange={setCustom} />}
      </ToolStep>

      <ToolStep n={3} id="st-create" title="Create the group matches" done={groupTotal > 0}
        hint="This writes every group match to the event, so the scorer links and captain results can fill them in. Nothing is sent until you press the button."
        status={groupTotal > 0 ? `${groupTotal} group matches exist` : undefined}>
        {!ready ? <p className="rounded-xl border border-dashed border-white/15 p-5 text-center text-sm text-zinc-300">Your groups appear here once you have four teams.</p> : <>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Preview of the groups">
            {plan.map((g) => (
              <li key={g.name} className="rounded-xl border border-white/[0.14] bg-[#0f1013] p-3">
                <p className="font-display text-sm font-bold text-white">Group {g.name} <span className="font-normal text-zinc-300">({groupMatchCount(g.teams.length)} matches)</span></p>
                <ol className="mt-1 list-inside list-decimal space-y-0.5 text-sm text-zinc-200">{g.teams.map((t) => <li key={t} className="truncate">{t}</li>)}</ol>
              </li>
            ))}
          </ul>
          <p className="text-sm text-zinc-200">That makes <b className="text-white">{planTotal} group matches</b>.</p>
          {tooMany && <p role="alert" className="text-sm text-amber-200">An event can hold {MAX_MATCHES} matches and {others} are already used by other stages. Use more groups or fewer teams.</p>}
          {confirm === "groups" ? (
            <div role="alertdialog" aria-label="Replace the existing matches" className="space-y-3 rounded-xl border border-amber-400/40 p-4">
              <p className="text-sm text-amber-100">This event already has {existing.length} group or knockout matches. Creating new groups removes them, and any results already entered for them are lost. This cannot be undone.</p>
              <div className="flex flex-wrap gap-3"><button type="button" className="btn px-5" onClick={() => void createGroups()}>Yes, replace them</button><button type="button" className="btn-ghost px-4 text-sm" onClick={() => setConfirm("")}>Cancel</button></div>
            </div>
          ) : <button type="button" className="btn px-5" disabled={busy !== "" || tooMany} onClick={askGroups}>{busy === "groups" ? "Creating…" : "Create the group matches"}</button>}
        </>}
      </ToolStep>

      <ToolStep n={4} id="st-knockout" title="Make the knockout from the group results" done={koExisting.length > 0}
        hint="Press this when the group results are in. It reads the group tables, takes the teams that go through and writes the knockout matches."
        status={groupTotal > 0 ? `${groupDone} of ${groupTotal} group matches have a result` : undefined}>
        {groupTotal === 0 ? <p className="rounded-xl border border-dashed border-white/15 p-5 text-center text-sm text-zinc-300">No group matches yet. Create them in step 3 first.</p> : <>
          <SettingsFields n={groupTeams} value={koSettings} showGroups={false} onChange={(s) => setKoCustom({ advance: s.advance, thirds: s.thirds })} />
          <div>
            <p className="text-sm font-semibold text-white">Going through now ({koPreview.length} teams)</p>
            <ul className="mt-1 grid gap-1 text-sm text-zinc-200 sm:grid-cols-2">{koPreview.map((q) => <li key={q.team} className="truncate">{q.team} <span className="text-zinc-400">(Group {q.group}, place {q.place})</span></li>)}</ul>
            <p className="mt-1 text-xs text-zinc-400">This is how the tables stand now. It can change until the last group match is played.</p>
          </div>
          {confirm === "knockout" ? (
            <div role="alertdialog" aria-label="Make the knockout now" className="space-y-3 rounded-xl border border-amber-400/40 p-4">
              <p className="text-sm text-amber-100">{groupDone < groupTotal ? `${groupTotal - groupDone} group matches have no result yet, so the teams going through may change. ` : ""}{koExisting.length > 0 ? `The event already has a knockout with ${koExisting.length} matches. Making it again replaces it and removes any knockout results. ` : ""}This cannot be undone.</p>
              <div className="flex flex-wrap gap-3"><button type="button" className="btn px-5" onClick={() => void makeKnockout()}>Yes, make the knockout</button><button type="button" className="btn-ghost px-4 text-sm" onClick={() => setConfirm("")}>Cancel</button></div>
            </div>
          ) : <button type="button" className="btn px-5" disabled={busy !== "" || koPreview.length < 2} onClick={askKnockout}>{busy === "knockout" ? "Making the knockout…" : koExisting.length ? "Make the knockout again" : "Make the knockout"}</button>}
        </>}
      </ToolStep>

      <p role="status" aria-live="polite" className={`min-h-5 text-sm ${msg?.kind === "err" ? "text-amber-200" : "text-emerald-300"}`}>{msg?.text}</p>
      {(groupTotal > 0 || koExisting.length > 0) && <p className="text-sm text-zinc-300">To enter results, open <b className="text-white">Scorer links</b> (a referee types the score) or <b className="text-white">Results from captains</b> (teams send a score with proof, you approve) in the list above. The tables and the bracket follow the results.</p>}
    </section>
  );
}
