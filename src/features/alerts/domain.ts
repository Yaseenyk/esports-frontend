/** Tournament alerts: plain types, constants and pure rules. No React, no network. */
export type AlertStatus = "off" | "pending" | "expired" | "active" | "stopped";
export interface AlertRule { game: string; place: string; kind: string }
export interface AlertSettings { status: AlertStatus; email: string | null; confirmedAt: string | null; rules: AlertRule[]; maxRules: number; mailer: boolean }

export const MAX_RULES = 5;
export const ALERT_GAMES: { value: string; label: string }[] = [
  { value: "any", label: "Any game" }, { value: "bgmi", label: "BGMI" }, { value: "free_fire", label: "Free Fire" }, { value: "valorant", label: "Valorant" },
  { value: "cod_mobile", label: "COD Mobile" }, { value: "cs2", label: "CS2" }, { value: "other", label: "Other games" },
];
export const ALERT_KINDS: { value: string; label: string }[] = [
  { value: "any", label: "Tournaments and college events" }, { value: "tournament", label: "Tournaments only" }, { value: "college", label: "College calendar events only" },
];
export const BLANK_RULE: AlertRule = { game: "any", place: "any", kind: "any" };

/** Where: "any", "online", or a city name (2 to 60 letters, spaces, dots, apostrophes and hyphens). "" when fine, else the problem. */
export function placeProblem(v: string): string {
  const t = v.trim().toLowerCase();
  if (t === "any" || t === "online") return "";
  if (t.length < 2 || t.length > 60 || !/^[\p{L}][\p{L} .'-]*$/u.test(t)) return "Type a city name, or choose Anywhere or Online.";
  return "";
}

export const STATUS_WORDS: Record<AlertStatus, { label: string; tone: "success" | "warning" | "danger" | "neutral"; body: string }> = {
  off: { label: "Off", tone: "neutral", body: "Save at least one alert, then confirm your email to turn alerts on." },
  pending: { label: "Waiting for you", tone: "warning", body: "We sent a confirmation link to your email. Nothing is sent until you click it. Cannot find it? Check your spam folder." },
  expired: { label: "Link expired", tone: "warning", body: "The confirmation link was not used within 48 hours. Send a new one." },
  active: { label: "On", tone: "success", body: "You get at most one email a day, only when a matching tournament is published or opens registration." },
  stopped: { label: "Stopped", tone: "neutral", body: "You unsubscribed. Your saved alerts are kept until you delete them; confirm your email again to restart." },
};
