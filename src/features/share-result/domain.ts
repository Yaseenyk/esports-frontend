import type { Extras, Payload } from "@/lib/display";
import { footerLine, shareFileName, shareText, type ShareFormat } from "@/lib/share-cards";
import type { UiLang } from "@/lib/pt-br";

/**
 * "Share result": the one-tap picture and message under every tool result. Pure, so the unit tests can check that each tool's picture
 * and message carry the address of the page the result came from.
 */

/** The public page of each tool. A result made on a game page (for example /points-table/free-fire/) passes that page's path instead. */
export const TOOL_PATHS = {
  "points-table": "/tools/points-table/",
  brackets: "/tools/brackets/",
  "double-elimination": "/tools/double-elimination/",
  "round-robin": "/tools/round-robin/",
  groups: "/tools/groups/",
} as const;

export interface ResultShare {
  /** The bottom line of the picture and the message: "Made with Esports Hub · esports.streamerosai.com/<path>". */
  footer: string;
  /** The message: the result as text, ending with the footer. */
  text: string;
  fileName: string;
  title: string;
}

export function resultShare(p: Payload, o: { path: string; what: string; format: ShareFormat; lang?: UiLang; extras?: Extras }): ResultShare {
  const footer = footerLine(o.path, o.lang ?? "en");
  const title = p.d.title || o.what;
  return { footer, text: shareText(p, { extras: o.extras, footer }), fileName: shareFileName(title, o.format), title };
}
