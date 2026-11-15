/** Title and description for a tournament page. Pure, so the length rules can be tested. */
import { gameName, type TournamentDetail } from "@/features/tournaments/domain";

export const TITLE_MAX = 65;
const SUFFIX = " | Esports Hub";

/** `"<Title> | <Game> tournament | Esports Hub"`, 65 characters at most: the game part goes first when it is too long, then the title is cut. */
export function tournamentTitle(t: Pick<TournamentDetail, "title" | "game">): string {
  const full = `${t.title} | ${gameName(t.game)} tournament${SUFFIX}`;
  if (full.length <= TITLE_MAX) return full;
  const short = `${t.title}${SUFFIX}`;
  if (short.length <= TITLE_MAX) return short;
  return `${t.title.slice(0, TITLE_MAX - SUFFIX.length - 1).trimEnd()}…${SUFFIX}`;
}

/** The organiser's own summary (never templated), cut to 160 characters on a word boundary. Falls back to the description. */
export function tournamentDescription(t: Pick<TournamentDetail, "summary" | "description">): string {
  const text = (t.summary ?? t.description ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= 160) return text;
  const cut = text.slice(0, 159);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 100)).trimEnd()}…`;
}
