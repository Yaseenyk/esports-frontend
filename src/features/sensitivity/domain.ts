/**
 * Mouse sensitivity maths for PC games. Pure, so every number on the page is unit tested.
 *
 * Every game here turns the view by (in-game sensitivity x yaw) degrees for each count the mouse reports, where the yaw is a fixed
 * number per game. Two games feel the same when the mouse travels the same distance for a full turn (cm/360), so a conversion keeps
 * sensitivity x yaw x DPI the same. Only games with a published or widely documented yaw are listed; see SOURCES and the page text.
 */

export const CHECKED = "24 Nov 2026";

export interface Source { label: string; url: string }
export interface Game {
  id: string;
  /** The game name as plain text. No logos or icons anywhere. */
  name: string;
  /** Degrees turned per mouse count at sensitivity 1. */
  yaw: number;
  /** How many decimals the game's own sensitivity box takes, for a sensible rounded answer. */
  decimals: number;
  /** Where the number comes from, and how reliable that is. */
  basis: string;
  sources: Source[];
}

const CSDB: Source = { label: "csdb.gg sensitivity converter (lists the yaw it uses for each game)", url: "https://csdb.gg/sensitivity-converter/" };

export const GAMES: readonly Game[] = [
  {
    id: "cs2", name: "Counter-Strike 2", yaw: 0.022, decimals: 2,
    basis: "Engine setting: the m_yaw console variable, default 0.022, multiplied by the sensitivity setting. Published by Valve as a console variable.",
    sources: [
      { label: "Valve Developer Community: Counter-Strike 2 console commands and variables (m_yaw)", url: "https://developer.valvesoftware.com/wiki/List_of_Counter-Strike_2_console_commands_and_variables" },
      { label: "csdb.gg: the m_yaw command", url: "https://csdb.gg/command/m-yaw/" },
    ],
  },
  {
    id: "valorant", name: "Valorant", yaw: 0.07, decimals: 3,
    basis: "Community-measured standard (Valorant sensitivity = CS2 sensitivity / 3.1818). Riot does not publish a degrees-per-count figure.",
    sources: [CSDB, { label: "csdb.gg: Valorant to CS2 converter", url: "https://csdb.gg/sensitivity-converter/valorant-to-cs2/" }],
  },
  {
    id: "apex", name: "Apex Legends", yaw: 0.022, decimals: 2,
    basis: "Source-engine value, the same 0.022 as Counter-Strike. Respawn does not publish it and the game has no m_yaw setting to read, so it is a community-documented figure.",
    sources: [CSDB],
  },
  {
    id: "ow2", name: "Overwatch 2", yaw: 0.0066, decimals: 2,
    basis: "Community-measured standard (Overwatch 2 sensitivity = CS2 sensitivity x 3.333). Blizzard does not publish it. Per-hero sensitivity settings override the general one.",
    sources: [CSDB],
  },
] as const;

export const gameById = (id: string): Game | undefined => GAMES.find((g) => g.id === id);

export const CM_PER_INCH = 2.54;
export const MIN_DPI = 50, MAX_DPI = 64000, MAX_SENS = 1000;

/** Degrees turned for each mouse count. */
export const degreesPerCount = (sens: number, yaw: number): number => sens * yaw;

/** Centimetres of mouse travel for a full 360 degree turn. Infinity when the inputs cannot turn at all. */
export function cmPer360(sens: number, yaw: number, dpi: number): number {
  const d = sens * yaw * dpi;
  return d > 0 ? (360 / d) * CM_PER_INCH : Infinity;
}

/** Inches of mouse travel for a full 360 degree turn. */
export function inchesPer360(sens: number, yaw: number, dpi: number): number {
  const d = sens * yaw * dpi;
  return d > 0 ? 360 / d : Infinity;
}

/** The sensitivity in the target game (and at the target DPI) that keeps the same distance for a full turn. */
export function convertSens(sens: number, from: Game, to: Game, dpiFrom: number, dpiTo = dpiFrom): number {
  if (!(sens > 0 && dpiFrom > 0 && dpiTo > 0)) return 0;
  return (sens * from.yaw * dpiFrom) / (to.yaw * dpiTo);
}

/** Rounds to the decimals the game's own box takes, without trailing zeros ("1.5", "0.318"). */
export function roundFor(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return "-";
  const r = Number(value.toFixed(decimals));
  return String(r);
}

export interface ConvertInput { fromId: string; toId: string; sens: number; dpiFrom: number; dpiTo: number }
export interface ConvertResult {
  from: Game; to: Game;
  /** The exact converted sensitivity and the value rounded for the target game's box. */
  sens: number; sensText: string;
  cm360: number; in360: number;
  /** cm/360 of the rounded value, to show that rounding moved it by a hair only. */
  cm360Rounded: number;
  edpiFrom: number; edpiTo: number;
}
export type ConvertCheck = { ok: true; result: ConvertResult } | { ok: false; error: string };

/** The reason a typed DPI cannot be used, or undefined when it is fine. */
export const dpiError = (v: string): string | undefined => { const n = Number(v); return v.trim() !== "" && Number.isFinite(n) && n >= MIN_DPI && n <= MAX_DPI ? undefined : `Type a DPI from ${MIN_DPI} to ${MAX_DPI}.`; };
/** The reason a typed sensitivity cannot be used, or undefined when it is fine. */
export const sensError = (v: string): string | undefined => { const n = Number(v); return v.trim() !== "" && Number.isFinite(n) && n > 0 && n <= MAX_SENS ? undefined : `Type a sensitivity above 0 and up to ${MAX_SENS}.`; };

/** Validates the input and returns the answer, or the reason there is none. */
export function convert(i: ConvertInput): ConvertCheck {
  const from = gameById(i.fromId), to = gameById(i.toId);
  if (!from || !to) return { ok: false, error: "Choose both games." };
  if (!(Number.isFinite(i.sens) && i.sens > 0 && i.sens <= MAX_SENS)) return { ok: false, error: `Type a sensitivity above 0 and up to ${MAX_SENS}.` };
  for (const d of [i.dpiFrom, i.dpiTo]) if (!(Number.isFinite(d) && d >= MIN_DPI && d <= MAX_DPI)) return { ok: false, error: `Type a DPI from ${MIN_DPI} to ${MAX_DPI}.` };
  const sens = convertSens(i.sens, from, to, i.dpiFrom, i.dpiTo);
  const sensText = roundFor(sens, to.decimals);
  return {
    ok: true,
    result: {
      from, to, sens, sensText,
      cm360: cmPer360(i.sens, from.yaw, i.dpiFrom), in360: inchesPer360(i.sens, from.yaw, i.dpiFrom),
      cm360Rounded: cmPer360(Number(sensText), to.yaw, i.dpiTo),
      edpiFrom: i.sens * i.dpiFrom, edpiTo: sens * i.dpiTo,
    },
  };
}

/** The same sensitivity in every listed game, at the target DPI: for the comparison table. */
export function allGames(sens: number, from: Game, dpiFrom: number, dpiTo: number): { game: Game; sens: number; text: string }[] {
  return GAMES.map((g) => { const s = convertSens(sens, from, g, dpiFrom, dpiTo); return { game: g, sens: s, text: roundFor(s, g.decimals) }; });
}

/** Mobile games use touch and gyro settings with no published per-count value, so they are named here only to say there is no conversion. */
export const MOBILE_NOT_CONVERTED = ["BGMI", "Free Fire", "Call of Duty: Mobile"] as const;
