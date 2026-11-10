import { DEFAULT_INFO, FORMATS, type EventInfo, type Fmt, type Person, type Team, type Template } from "./types";

/**
 * A project file: everything about one event in a single JSON file the organiser keeps (event details, teams, people, photos and card designs).
 * It is the organiser's own copy. People and photos are not kept in the browser between visits, so this is how work is saved and moved.
 * The signing passphrase is left out unless asked for, since anyone holding it can make valid passes.
 */
export interface ProjectFile {
  v: 1;
  app: "esports-hub-idcards";
  savedAt: string;
  event: { name: string; game: string; organiser: string; fmt: Fmt };
  info: Omit<EventInfo, "passphrase"> & { passphrase?: string };
  teams: Team[];
  templates: Record<string, Template>;
  people: Person[];
}

export function buildProject(s: { event: string; game: string; organiser: string; fmt: Fmt; info: EventInfo; teams: Team[]; templates: Record<string, Template>; people: Person[] }, includePassphrase: boolean): ProjectFile {
  const { passphrase, ...info } = s.info;
  return {
    v: 1, app: "esports-hub-idcards", savedAt: new Date().toISOString(),
    event: { name: s.event, game: s.game, organiser: s.organiser, fmt: s.fmt },
    info: includePassphrase ? { ...info, passphrase } : info,
    teams: s.teams, templates: s.templates, people: s.people,
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Reads and checks a project file. Returns an error message instead of throwing, so the page can show it. */
export function parseProject(text: string): { project: ProjectFile } | { error: string } {
  let j: unknown;
  try { j = JSON.parse(text); } catch { return { error: "That file is not valid JSON." }; }
  if (!isObj(j) || j.app !== "esports-hub-idcards" || j.v !== 1) return { error: "That is not a project file from this tool." };
  if (!isObj(j.event) || typeof j.event.name !== "string") return { error: "The project file has no event details." };
  if (!Array.isArray(j.teams) || j.teams.length === 0 || !j.teams.every((t) => isObj(t) && typeof t.id === "string" && typeof t.name === "string")) return { error: "The project file has no valid teams." };
  if (!Array.isArray(j.people) || !j.people.every((p) => isObj(p) && typeof p.id === "string" && typeof p.name === "string" && typeof p.teamId === "string")) return { error: "The people in the project file look damaged." };
  const fmt = (j.event.fmt as Fmt) in FORMATS ? (j.event.fmt as Fmt) : "wallet";
  const info = { ...DEFAULT_INFO, ...(isObj(j.info) ? (j.info as Partial<EventInfo>) : {}) };
  return {
    project: {
      v: 1, app: "esports-hub-idcards", savedAt: String(j.savedAt ?? ""),
      event: { name: String(j.event.name), game: String(j.event.game ?? "Multi-game"), organiser: String(j.event.organiser ?? ""), fmt },
      info, teams: j.teams as Team[], templates: isObj(j.templates) ? (j.templates as Record<string, Template>) : {}, people: j.people as Person[],
    },
  };
}

/** A single team's design as a file, so designs can be shared between events or organisers. */
export const designToJson = (t: Template) => JSON.stringify({ app: "esports-hub-design", v: 1, design: t });
export function parseDesign(text: string): { design: Template } | { error: string } {
  try {
    const j = JSON.parse(text);
    if (j?.app !== "esports-hub-design" || !j.design || !Array.isArray(j.design.els) || !j.design.bg) return { error: "That is not a design file from this tool." };
    return { design: j.design as Template };
  } catch { return { error: "That file is not valid JSON." }; }
}
