/**
 * "Plan my tournament": answer a few questions and get a format, match counts, a timed schedule and a text pack.
 * Everything is worked out with the same libraries the other tools use (schedule, round robin, double elimination, seeding, points),
 * so the plan and the tools can never disagree. Pure functions: no DOM, no network.
 */
import { build, isPlayable, slots as slotsOf } from "./doubleelim";
import { EXAMPLE_SCALE } from "./points";
import { regPreset, registrationText, type RegPresetId } from "./regform";
import { BYE, DEFAULT_POINTS, fixtures } from "./roundrobin";
import { buildSchedule, formatTime, parseTime, summary, type ScheduleInput } from "./schedule";
import { seedOrder } from "./seeding";
import { SITE_URL } from "./site";

export type GameKind = "br" | "h2h";
export type FormatId = "single" | "double" | "roundrobin";

export interface PlanInput {
  kind: GameKind;
  teams: number;
  /** Matches that can run at the same time (rooms, lobbies or stations). */
  rooms: number;
  /** Hours available, from the first start to the latest finish. Half hours are fine. */
  hours: number;
  /** "HH:MM", 24 hour. */
  start: string;
  /** Battle royale only: teams in one lobby. */
  perLobby?: number;
  /** Minutes one match takes. */
  matchLength?: number;
  gap?: number;
  breakEvery?: number;
  breakLength?: number;
  /** Head to head only: force a format instead of the recommended one. */
  format?: FormatId;
}

/** The defaults the wizard starts from. The match length is the usual planning length, not a rule: change it to fit your game. */
export const PLAN_DEFAULTS = { perLobby: 12, brMatchLength: 35, h2hMatchLength: 30, gap: 10, breakEvery: 3, breakLength: 30, brMaxRecommended: 6 } as const;
export const MAX_TEAMS = { br: 500, h2h: 64 } as const;

export interface PlanRow { n: number; start: string; end: string; items: string[]; breakAfter: number }
export interface Verdict { fits: boolean; /** Minutes from the first start to the last finish. */ needMinutes: number; haveMinutes: number; finish: string; text: string }

export interface FormatOption {
  id: FormatId;
  name: string;
  /** Matches that are certainly played. */
  matches: number;
  /** Extra matches that are only played if needed (the double elimination reset). */
  extra: number;
  /** Stages that must be played one after the other. */
  rounds: number;
  /** Time slots once the rooms are used in parallel. */
  slots: number;
  minutes: number;
  finish: string;
  fits: boolean;
}

interface Common {
  ok: true;
  kind: GameKind;
  teams: number;
  rooms: number;
  hours: number;
  start: string;
  matchLength: number;
  gap: number;
  breakEvery: number;
  breakLength: number;
  rows: PlanRow[];
  verdict: Verdict;
  /** Plain-language lines that describe the plan. */
  summary: string[];
}
export interface BrPlan extends Common {
  kind: "br";
  perLobby: number;
  lobbies: number;
  teamsPerLobby: number;
  /** Rooms really in use: never more than there are lobbies. */
  roomsUsed: number;
  /** The most matches per lobby that fit the hours (0 when not even one fits). */
  fitMax: number;
  matchesPerLobby: number;
  totalMatches: number;
  finals: { teams: number; ends: string } | null;
  scale: typeof EXAMPLE_SCALE;
  scaleLines: string[];
}
export interface H2hPlan extends Common {
  kind: "h2h";
  options: FormatOption[];
  chosen: FormatId;
  /** The format the planner recommends for your time, which may differ from `chosen` when you picked another one. */
  recommended: FormatId;
  alternative: FormatId | null;
  /** One sentence: why this format. */
  reason: string;
  /** How to seed or number the teams for the chosen format. */
  seedingLines: string[];
}
export type Plan = BrPlan | H2hPlan;
export type PlanResult = Plan | { ok: false; error: string };

export const FORMAT_NAMES: Record<FormatId, string> = { single: "Single elimination", double: "Double elimination", roundrobin: "Round robin" };

/** "7 h 20 min", "5 h", "45 min". */
export function fmtDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60), r = m % 60;
  return h && r ? `${h} h ${r} min` : h ? `${h} h` : `${r} min`;
}

const isInt = (n: unknown, min: number, max: number): n is number => typeof n === "number" && Number.isInteger(n) && n >= min && n <= max;

function totalMinutes(slotCount: number, duration: number, gap: number, breakEvery: number, breakLength: number): number {
  const breaks = breakEvery > 0 ? Math.floor((slotCount - 1) / breakEvery) * breakLength : 0;
  return slotCount * duration + (slotCount - 1) * gap + breaks;
}

interface Cfg { start: string; duration: number; gap: number; breakEvery: number; breakLength: number }

/** Time for `slotCount` slots run one after another. Uses buildSchedule; past its 500 slot limit it falls back to the same arithmetic. */
function timing(slotCount: number, c: Cfg): { slots: ReturnType<typeof buildSchedule>; minutes: number; finish: string } {
  const input: ScheduleInput = { start: c.start, matches: slotCount, duration: c.duration, gap: c.gap, lobbies: 1, breakEvery: c.breakEvery, breakLength: c.breakLength };
  const slots = buildSchedule(input);
  const minutes = slots ? summary(input, slots).totalMinutes : totalMinutes(slotCount, c.duration, c.gap, c.breakEvery, c.breakLength);
  return { slots, minutes, finish: formatTime(parseTime(c.start)! + minutes) };
}

function verdictFor(minutes: number, haveMinutes: number, finish: string, options: string): Verdict {
  const fits = minutes <= haveMinutes;
  return { fits, needMinutes: minutes, haveMinutes, finish, text: fits ? `Fits in your time: ends ${finish}` : `Does not fit: needs ${fmtDuration(minutes)}, you have ${fmtDuration(haveMinutes)}. Options: ${options}` };
}

function rowsFrom(slotLists: string[][], t: ReturnType<typeof timing>, c: Cfg): PlanRow[] {
  if (t.slots) return t.slots.map((s, i) => ({ n: s.slot, start: s.start, end: s.end, items: slotLists[i] ?? [], breakAfter: s.breakAfter }));
  // More slots than buildSchedule accepts (500): lay them out with the same rules.
  let at = parseTime(c.start)!;
  return slotLists.map((items, i) => {
    const n = i + 1, end = at + c.duration;
    const breakAfter = c.breakEvery > 0 && n % c.breakEvery === 0 && n < slotLists.length ? c.breakLength : 0;
    const row = { n, start: formatTime(at), end: formatTime(end), items, breakAfter };
    at = end + c.gap + breakAfter;
    return row;
  });
}

/** Splits waves of matches (each wave must be played after the one before it) into slots of at most `rooms` matches. */
function waveSlots(waves: string[][], rooms: number): string[][] {
  const out: string[][] = [];
  for (const w of waves) for (let i = 0; i < w.length; i += rooms) out.push(w.slice(i, i + rooms));
  return out;
}

/* ---------- Head to head ---------- */

const roundName = (r: number, rounds: number) => (r === rounds ? "Final" : r === rounds - 1 ? "Semi-finals" : r === rounds - 2 ? "Quarter-finals" : `Round ${r}`);

/** Single elimination: n - 1 matches in ceil(log2 n) rounds. Round 1 holds only the real matches; byes skip it. */
export function singleWaves(n: number): { waves: string[][]; size: number; byes: number } {
  let size = 2;
  while (size < n) size *= 2;
  const rounds = Math.log2(size);
  const order = seedOrder(size);
  const waves: string[][] = [];
  const first: string[] = [];
  for (let i = 0; i < size / 2; i++) {
    const a = order[2 * i]!, b = order[2 * i + 1]!;
    if (a <= n && b <= n) first.push(`${rounds === 1 ? "Final" : `${roundName(1, rounds)} match ${first.length + 1}`}: seed ${Math.min(a, b)} v seed ${Math.max(a, b)}`);
  }
  if (first.length) waves.push(first);
  for (let r = 2; r <= rounds; r++) {
    const count = size / 2 ** r;
    waves.push(Array.from({ length: count }, (_, i) => (count === 1 ? roundName(r, rounds) : `${roundName(r, rounds)} match ${i + 1}`)));
  }
  return { waves, size, byes: size - n };
}

/** Double elimination played out with the real bracket (the first-named team always wins): the waves of matches that can be played together. The reset final is separate. */
export function doubleWaves(n: number): { waves: string[][] } | null {
  const names = Array.from({ length: n }, (_, i) => `Seed ${i + 1}`);
  const b = build(names);
  if (!b) return null;
  const picks: Record<string, 0 | 1 | undefined> = {};
  const waves: string[][] = [];
  for (let guard = 0; guard < 200; guard++) {
    const ready = b.matches.filter((m) => m.id !== "GF2" && picks[m.id] === undefined && isPlayable(slotsOf(b, m, picks)));
    if (!ready.length) break;
    waves.push(ready.map((m) => m.id));
    for (const m of ready) picks[m.id] = 0;
  }
  waves.push(["GF2"]);
  return { waves };
}

/** Round robin fixtures packed into slots: no team plays twice in a slot and no more than `rooms` matches share one. */
export function roundRobinSlots(n: number, rooms: number): { slots: string[][]; matches: number; rounds: number } {
  const rounds = fixtures(Array.from({ length: n }, (_, i) => String(i + 1)));
  const slotTeams: Set<string>[] = [];
  const slots: string[][] = [];
  let matches = 0;
  for (const rd of rounds) for (const f of rd) {
    if (f.a === BYE || f.b === BYE) continue;
    matches++;
    let k = 0;
    while (k < slots.length && (slots[k]!.length >= rooms || slotTeams[k]!.has(f.a) || slotTeams[k]!.has(f.b))) k++;
    if (k === slots.length) { slots.push([]); slotTeams.push(new Set()); }
    slots[k]!.push(`${f.a} v ${f.b}`); slotTeams[k]!.add(f.a); slotTeams[k]!.add(f.b);
  }
  return { slots, matches, rounds: rounds.length };
}

interface Built { option: FormatOption; slotLists: string[][] }

function buildFormat(id: FormatId, n: number, rooms: number, c: Cfg, haveMinutes: number): Built | null {
  let slotLists: string[][], matches: number, extra = 0, rounds: number;
  if (id === "single") {
    const s = singleWaves(n);
    slotLists = waveSlots(s.waves, rooms); matches = n - 1; rounds = s.waves.length;
  } else if (id === "double") {
    const d = doubleWaves(n);
    if (!d) return null;
    slotLists = waveSlots(d.waves, rooms);
    // The last wave is the reset final, played only if the losers-bracket team wins the first final.
    slotLists = slotLists.map((s) => s.map((x) => (x === "GF2" ? "GF2 (only if needed)" : x)));
    matches = 2 * n - 2; extra = 1; rounds = d.waves.length;
  } else {
    if (n < 3) return null;
    const r = roundRobinSlots(n, rooms);
    slotLists = r.slots; matches = r.matches; rounds = r.rounds;
  }
  const t = timing(slotLists.length, c);
  return { option: { id, name: FORMAT_NAMES[id], matches, extra, rounds, slots: slotLists.length, minutes: t.minutes, finish: t.finish, fits: t.minutes <= haveMinutes }, slotLists };
}

function seedingFor(id: FormatId, n: number): string[] {
  if (id === "roundrobin") {
    return [
      `Number your teams 1 to ${n} in any order (a draw is fine). Every team plays every other team once.`,
      n % 2 ? `With ${n} teams one team sits out each round (a bye), so everyone plays ${n - 1} matches.` : `Each team plays ${n - 1} matches, one per round.`,
      `The round robin tool ranks teams by points, then score difference, then scores for, then wins, then team name. The usual example is ${DEFAULT_POINTS.win} points for a win, ${DEFAULT_POINTS.draw} for a draw and ${DEFAULT_POINTS.loss} for a loss: that is an example, so write your own in your rules.`,
    ];
  }
  const { size, byes } = singleWaves(n);
  const lines = [
    `Rank your teams from best (seed 1) to weakest (seed ${n}). If you do not know, draw the order by lot. Seed 1 meets the lowest seed first, so the strongest teams can only meet in the later rounds.`,
    byes ? `The bracket holds ${size} places, so ${byes === 1 ? "seed 1 gets a bye" : `seeds 1 to ${byes} get byes`}: ${byes === 1 ? "that team goes" : "those teams go"} straight to round 2 without playing.` : `${n} is a full bracket, so nobody gets a bye.`,
  ];
  if (id === "double") lines.push("A team is out after two losses. Losers drop into the losers bracket. The winners-bracket champion meets the losers-bracket champion in the grand final; the reset match is played only if the losers-bracket team wins the first final.");
  return lines;
}

function planH2h(i: PlanInput, c: Cfg, haveMinutes: number): PlanResult {
  const n = i.teams;
  const ids: FormatId[] = n >= 3 ? ["single", "double", "roundrobin"] : ["single"];
  const built = ids.map((id) => buildFormat(id, n, i.rooms, c, haveMinutes)).filter((b): b is Built => !!b);
  const options = built.map((b) => b.option);
  const by = (id: FormatId) => options.find((o) => o.id === id);
  // Most games per team that still fits: round robin for small fields, then double, then single. If nothing fits, show the shortest.
  const order: FormatId[] = [...(n <= 8 ? (["roundrobin"] as const) : []), "double", "single", "roundrobin"];
  const recommended: FormatId = order.find((id) => by(id)?.fits) ?? "single";
  const chosen: FormatId = i.format && by(i.format) ? i.format : recommended;
  const pick = built.find((b) => b.option.id === chosen)!;
  const o = pick.option;
  const alternative = ((): FormatId | null => {
    // The nearest other format: a quicker one if this one is tight, otherwise the one with more games that also fits, else any fitting one.
    const others = options.filter((x) => x.id !== chosen);
    return (others.filter((x) => x.fits).sort((a, b) => Math.abs(a.minutes - o.minutes) - Math.abs(b.minutes - o.minutes))[0] ?? others.sort((a, b) => a.minutes - b.minutes)[0])?.id ?? null;
  })();
  const t = timing(pick.slotLists.length, c);
  const rows = rowsFrom(pick.slotLists, t, c);
  const verdict = verdictFor(o.minutes, haveMinutes, o.finish, "fewer teams, more rooms, a shorter format or shorter matches");
  const matchText = o.extra ? `${o.matches} matches (${o.matches + o.extra} if the reset final is needed)` : `${o.matches} matches`;
  const reasons: Record<FormatId, string> = {
    roundrobin: n <= 8 ? `Round robin fits your time and, with only ${n} teams, it gives every team the most games and the fairest table.` : `Round robin fits your time and gives every team the same number of games.`,
    double: `Double elimination fits your time and gives every team a second life, so one bad match does not end a team's day.`,
    single: o.fits ? `Single elimination is the shortest format (${n - 1} matches) and it fits your time.` : `Single elimination is the shortest format (${n - 1} matches), and it is the one with the best chance of fitting.`,
  };
  const reason = chosen === recommended ? reasons[chosen] : `You picked ${FORMAT_NAMES[chosen].toLowerCase()}. The recommended format for your time is ${FORMAT_NAMES[recommended].toLowerCase()}.`;
  const summaryLines = [
    `${n} teams, head to head, ${i.rooms} room${i.rooms === 1 ? "" : "s"} at the same time, ${fmtDuration(haveMinutes)} available, starting ${i.start}.`,
    `Format: ${o.name}: ${matchText} in ${o.rounds} stage${o.rounds === 1 ? "" : "s"} (${o.slots} time slot${o.slots === 1 ? "" : "s"} with your rooms).`,
    `Each match is planned for ${c.duration} minutes with ${c.gap} minutes between rounds${c.breakEvery > 0 && c.breakLength > 0 ? ` and a ${c.breakLength} minute break after every ${c.breakEvery} round${c.breakEvery === 1 ? "" : "s"}` : ""}.`,
  ];
  return { ok: true, kind: "h2h", teams: n, rooms: i.rooms, hours: i.hours, start: i.start, matchLength: c.duration, gap: c.gap, breakEvery: c.breakEvery, breakLength: c.breakLength, rows, verdict, summary: summaryLines, options, chosen, recommended, alternative, reason, seedingLines: seedingFor(chosen, n) };
}

/* ---------- Battle royale ---------- */

function planBr(i: PlanInput, c: Cfg, haveMinutes: number): PlanResult {
  const perLobby = i.perLobby ?? PLAN_DEFAULTS.perLobby;
  const lobbies = Math.ceil(i.teams / perLobby);
  const teamsPerLobby = Math.ceil(i.teams / lobbies);
  const roomsUsed = Math.min(i.rooms, lobbies);
  const slotsFor = (m: number) => Math.ceil((lobbies * m) / roomsUsed);
  let fitMax = 0;
  for (let m = 1; m <= 40; m++) { if (timing(slotsFor(m), c).minutes <= haveMinutes) fitMax = m; else break; }
  const matchesPerLobby = Math.max(1, Math.min(fitMax, PLAN_DEFAULTS.brMaxRecommended));
  const totalMatches = lobbies * matchesPerLobby;
  const slotCount = slotsFor(matchesPerLobby);
  // Match k is game floor((k-1)/lobbies)+1 of lobby ((k-1) % lobbies)+1; with rooms <= lobbies no lobby is in two rooms at once.
  const label = (k: number) => (lobbies === 1 ? `Match ${Math.floor((k - 1) / lobbies) + 1}` : `Lobby ${((k - 1) % lobbies) + 1}, game ${Math.floor((k - 1) / lobbies) + 1}`);
  const lists: string[][] = [];
  for (let s = 0; s < slotCount; s++) lists.push(Array.from({ length: Math.min(roomsUsed, totalMatches - s * roomsUsed) }, (_, j) => label(s * roomsUsed + j + 1)));
  const t = timing(slotCount, c);
  const rows = rowsFrom(lists, t, c);
  const verdict = verdictFor(t.minutes, haveMinutes, t.finish, "fewer teams, more rooms, more teams in each lobby or shorter matches");
  // A final match for the best teams is only a suggestion, and only if there is time left after the league.
  let finals: BrPlan["finals"] = null;
  if (lobbies > 1 && verdict.fits) {
    const endMin = parseTime(c.start)! + t.minutes + c.gap + c.duration;
    if (endMin - parseTime(c.start)! <= haveMinutes) finals = { teams: Math.min(perLobby, i.teams), ends: formatTime(endMin) };
  }
  const scale = EXAMPLE_SCALE;
  const ord = (n: number) => (n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`);
  const scaleLines = [`Example points (not an official scale): ${scale.placement.map((p, k) => `${ord(k + 1)} ${p}`).join(", ")}, other places 0; ${scale.perKill} point${scale.perKill === 1 ? "" : "s"} per kill.`];
  const summaryLines = [
    `${i.teams} teams, battle royale, ${i.rooms} room${i.rooms === 1 ? "" : "s"} at the same time, ${fmtDuration(haveMinutes)} available, starting ${i.start}.`,
    `Format: points league. ${lobbies} lobb${lobbies === 1 ? "y" : "ies"} (${lobbies === 1 ? `${i.teams} teams` : `up to ${teamsPerLobby} teams each, at most ${perLobby}`}), ${matchesPerLobby} match${matchesPerLobby === 1 ? "" : "es"} per lobby, ${totalMatches} matches in all.`,
    fitMax > 0 ? `Up to ${fitMax} match${fitMax === 1 ? "" : "es"} per lobby fit${fitMax === 1 ? "s" : ""} your time${fitMax > matchesPerLobby ? `; the plan uses ${matchesPerLobby} and keeps the rest as slack, because matches nearly always run long` : ""}.` : "Not even one match per lobby fits your time.",
    `Each match is planned for ${c.duration} minutes with ${c.gap} minutes between rounds${c.breakEvery > 0 && c.breakLength > 0 ? ` and a ${c.breakLength} minute break after every ${c.breakEvery} round${c.breakEvery === 1 ? "" : "s"}` : ""}.`,
  ];
  return { ok: true, kind: "br", teams: i.teams, rooms: i.rooms, hours: i.hours, start: i.start, matchLength: c.duration, gap: c.gap, breakEvery: c.breakEvery, breakLength: c.breakLength, rows, verdict, summary: summaryLines, perLobby, lobbies, teamsPerLobby, roomsUsed, fitMax, matchesPerLobby, totalMatches, finals, scale, scaleLines };
}

/** The whole plan, or an error sentence in plain words. */
export function planTournament(i: PlanInput): PlanResult {
  const max = MAX_TEAMS[i.kind] ?? 0;
  if (i.kind !== "br" && i.kind !== "h2h") return { ok: false, error: "Choose the kind of game first." };
  if (!isInt(i.teams, 2, max)) return { ok: false, error: `Enter between 2 and ${max} teams.${i.kind === "h2h" ? " For more than 64 teams, split them into groups and plan each group." : ""}` };
  if (!isInt(i.rooms, 1, 100)) return { ok: false, error: "Enter between 1 and 100 rooms." };
  if (!(typeof i.hours === "number" && i.hours >= 0.5 && i.hours <= 24)) return { ok: false, error: "Enter between half an hour and 24 hours." };
  if (parseTime(i.start) === null) return { ok: false, error: "Choose a start time." };
  const perLobby = i.perLobby ?? PLAN_DEFAULTS.perLobby;
  if (i.kind === "br" && !isInt(perLobby, 2, 100)) return { ok: false, error: "Teams per lobby must be between 2 and 100." };
  const c: Cfg = {
    start: i.start, duration: i.matchLength ?? (i.kind === "br" ? PLAN_DEFAULTS.brMatchLength : PLAN_DEFAULTS.h2hMatchLength),
    gap: i.gap ?? PLAN_DEFAULTS.gap, breakEvery: i.breakEvery ?? PLAN_DEFAULTS.breakEvery, breakLength: i.breakLength ?? PLAN_DEFAULTS.breakLength,
  };
  if (!isInt(c.duration, 1, 600) || !isInt(c.gap, 0, 120) || !isInt(c.breakEvery, 0, 50) || !isInt(c.breakLength, 0, 240)) return { ok: false, error: "Check the match length, the gap and the break times: they must be whole numbers." };
  const haveMinutes = Math.round(i.hours * 60);
  return i.kind === "br" ? planBr(i, c, haveMinutes) : planH2h(i, c, haveMinutes);
}

/* ---------- The text pack ---------- */

export interface PackOptions { event: string; preset: RegPresetId }

export interface NextStep { label: string; href: string; why: string }

/** The tools to open next, in the order an organiser needs them. */
export function nextSteps(p: Plan): NextStep[] {
  const out: NextStep[] = [{ label: "Registration form", href: "/tools/registration/", why: "Copy the sign-up form or collect teams online." }];
  if (p.kind === "br") out.push({ label: "Points table calculator", href: "/tools/points-table/", why: "Enter placements and kills after each match; it ranks the teams with tie-breakers." });
  else if (p.chosen === "single") out.push({ label: "Bracket maker", href: "/tools/brackets/", why: "Type the teams in seed order and click the winners forward." });
  else if (p.chosen === "double") out.push({ label: "Double elimination bracket", href: "/tools/double-elimination/", why: "Winners and losers brackets with the grand final and reset." });
  else out.push({ label: "Round robin generator", href: "/tools/round-robin/", why: "Fixtures for every pairing and a league table that fills in as you enter scores." });
  out.push(
    { label: "Match schedule maker", href: "/tools/schedule/", why: "Fine-tune the timetable and download it as a CSV file." },
    { label: "Display screen", href: "/tools/display-screen/", why: "Show standings, the schedule or a countdown on a TV or in OBS." },
    { label: "ID card maker", href: "/tools/id-cards/", why: "Print player passes with a signed QR code." },
    { label: "Certificate maker", href: "/tools/certificates/", why: "Print winner and participation certificates afterwards." },
  );
  return out;
}

/** The rules, from the wording of the rules template guide, with this plan's numbers filled in. Anything only the organiser can decide stays in [brackets]. */
export function rulesLines(p: Plan, o: PackOptions): string[] {
  const reg = regPreset(o.preset);
  const subs = reg.subs ? `up to ${reg.subs} substitute${reg.subs === 1 ? "" : "s"}` : "no substitutes";
  const formatLine = p.kind === "br"
    ? `Points league: ${p.matchesPerLobby} match${p.matchesPerLobby === 1 ? "" : "es"} per lobby${p.lobbies > 1 ? `, ${p.lobbies} lobbies of up to ${p.teamsPerLobby} teams` : ""}. Matches are played on [map or mode]. Teams are ranked by total points: placement points plus kill points, using the points table published with these rules. Ties are broken by [order of tie-breakers].`
    : `${FORMAT_NAMES[(p as H2hPlan).chosen]}. Each match is [best of 1, 3 or 5] on [map or mode]. A tie is settled by [how a tied match is decided].`;
  return [
    `Rules: ${o.event.trim() || "[Event name]"}`,
    "Draft from the tournament rules template. Replace every [bracket] with a real value before you publish. This is a general template, not legal advice.",
    "",
    "1. Eligibility",
    "Players must be [age rule] on [date]. Players under 18 need a parent or guardian's written consent. Each player may play for one team in this tournament.",
    "",
    "2. Teams",
    `A team has ${reg.size} player${reg.size === 1 ? "" : "s"} and ${subs}, all listed at registration. The tournament has room for ${p.teams} teams. The captain is the only contact for the organisers. A roster change after [deadline] needs written approval from the organisers.`,
    "",
    "3. Registration",
    "Registration closes on [date and time]. Only complete registrations count. The organisers may refuse an entry and will say why.",
    "",
    "4. Format",
    formatLine,
    "",
    "5. Schedule and check-in",
    `The first match starts at ${p.start}. Each match is planned for ${p.matchLength} minutes. Teams must be present [number] minutes before their match. A team more than [number] minutes late forfeits the match. Each player shows a pass or ID at the gate.`,
    "",
    "6. Devices and settings",
    "Each player uses their own device. Emulators and modified game clients are not allowed in mobile events. Required game version: [version].",
    "",
    "7. Conduct",
    "Respect other players, officials and spectators. Insults, threats or harassment lead to a warning, then removal from the event.",
    "",
    "8. Cheating",
    "Using hacks or exploits, teaming with other teams, and intentionally losing a match are cheating. A confirmed case leads to disqualification of the player and may lead to disqualification of the team. The organisers review the evidence and decide.",
    "",
    "9. Disputes",
    "Raise a dispute with an official straight after the match, through the captain only. Decisions are made by [name or committee] and are final.",
    "",
    "10. Prizes",
    "[Prizes and how they are paid, or write that there are no prizes].",
    "",
    "11. Changes",
    "The organisers may change these rules for fairness or safety and will tell all captains in writing before the change applies.",
  ];
}

interface Section { title: string; lines: string[]; style: "bullets" | "numbered" | "rules" | "code"; table?: { head: string[]; rows: string[][] } }

function sections(p: Plan, o: PackOptions): Section[] {
  const base = SITE_URL;
  const event = o.event.trim() || "[Event name]";
  const scheduleRows = p.rows.map((r) => [String(r.n), r.start, r.end, r.items.join("; ") + (r.breakAfter ? ` (then a ${r.breakAfter} minute break)` : "")]);
  const format: string[] = p.kind === "br"
    ? [`Points league (battle royale). ${p.lobbies} lobb${p.lobbies === 1 ? "y" : "ies"}, ${p.matchesPerLobby} match${p.matchesPerLobby === 1 ? "" : "es"} per lobby, ${p.totalMatches} matches in all.`,
      ...(p.lobbies > 1 ? [`Teams are split into ${p.lobbies} lobbies of up to ${p.teamsPerLobby}. [Decide how teams are placed in lobbies: draw, seeding or registration order.]`] : []),
      ...(p.finals ? [`Suggestion, only if you want it: the top ${p.finals.teams} teams by points play one extra final match, which would end about ${p.finals.ends}. [Decide how finalists are chosen and whether points carry over.]`] : [])]
    : [`${FORMAT_NAMES[p.chosen]}: ${p.options.find((x) => x.id === p.chosen)!.matches} matches.`, p.reason, ...(p.alternative ? [`Alternative: ${FORMAT_NAMES[p.alternative]} (${p.options.find((x) => x.id === p.alternative)!.matches} matches, ends ${p.options.find((x) => x.id === p.alternative)!.finish}).`] : [])];
  const third: Section = p.kind === "br"
    ? { title: "Points scale", lines: [...p.scaleLines, "This is only an example. Replace it with the scale in your own rulebook.", `Calculate standings with the points table calculator: ${base}/tools/points-table/`], style: "bullets" }
    : { title: p.chosen === "roundrobin" ? "Team numbers and fixtures" : "Seeding", lines: p.seedingLines, style: "bullets" };
  const steps = nextSteps(p);
  return [
    { title: "Summary", lines: [`Event: ${event}`, ...p.summary, `Verdict: ${p.verdict.text}`], style: "bullets" },
    { title: "Format", lines: format, style: "bullets" },
    { title: "Schedule", lines: [`Times are planned, not promised: matches nearly always run longer, so keep some slack. ${p.kind === "h2h" && p.chosen === "double" ? "W = winners bracket, L = losers bracket, GF = grand final." : ""}`.trim()], style: "bullets", table: { head: ["Round", "Start", "End", "Matches"], rows: scheduleRows } },
    third,
    { title: "Rules (draft)", lines: rulesLines(p, o).slice(3), style: "rules" },
    { title: "Sign-up form", lines: registrationText(o.preset, event).split("\n"), style: "code" },
    { title: "Next steps", lines: steps.map((s, k) => `${k + 1}. ${s.label}: ${base}${s.href} (${s.why})`), style: "numbered" },
  ];
}

/** The whole pack as plain text, or as Markdown. */
export function buildPack(p: Plan, o: PackOptions, as: "text" | "md" = "text"): string {
  const event = o.event.trim() || "[Event name]";
  const md = as === "md";
  const out: string[] = [md ? `# Tournament plan: ${event}` : `TOURNAMENT PLAN: ${event}`, ""];
  sections(p, o).forEach((s, k) => {
    out.push(md ? `## ${k + 1}. ${s.title}` : `${k + 1}. ${s.title.toUpperCase()}`, "");
    if (!md || s.style === "numbered") out.push(...s.lines);
    else if (s.style === "bullets") out.push(...s.lines.filter(Boolean).map((l) => `- ${l}`));
    else if (s.style === "code") out.push("```", ...s.lines, "```");
    else for (const l of s.lines) out.push(/^\d+\. [^.]{1,40}$/.test(l) ? `**${l}**` : l, ...(l ? [""] : []));
    if (s.table) {
      out.push("");
      if (md) out.push(`| ${s.table.head.join(" | ")} |`, `| ${s.table.head.map(() => "---").join(" | ")} |`, ...s.table.rows.map((r) => `| ${r.map((c) => c.replace(/\|/g, "/")).join(" | ")} |`));
      else {
        const w = s.table.head.map((h, c) => Math.min(40, Math.max(h.length, ...s.table!.rows.map((r) => r[c]!.length))));
        const line = (r: string[]) => r.map((c, i) => (i === r.length - 1 ? c : c.padEnd(w[i]!))).join("  ");
        out.push(line(s.table.head), ...s.table.rows.map(line));
      }
    }
    out.push("");
  });
  out.push(md ? "---" : "----", `Made with the free tournament planner: ${SITE_URL}/tools/plan/`);
  return out.join("\n");
}
