// Community checks for scripts/verify-seo.mjs (college esports calendar, organiser trust pages). Imported by verify-seo; not run on its own.
//  - /trust/ is user reviews behind a query string: always noindex and out of the sitemap.
//  - /calendar/ is indexable ONLY when the index rule in src/features/community/seo.ts passes on the entries the page shipped in its
//    <script id="eh-calendar"> (at least 5 upcoming entries, every one from a verified organisation). The rule is re-run here from the TypeScript source.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

export const COMMUNITY_NOINDEX = [/^\/trust\//];

const src = fs.readFileSync(path.resolve("src/features/community/seo.ts"), "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const rule = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

/** What the shipped /calendar/ page says and what the rule says it should be. `present: false` when the page was not emitted (flag off). */
export function calendarVerdict(outDir) {
  const file = path.join(outDir, "calendar", "index.html");
  if (!fs.existsSync(file)) return { present: false, expectIndexable: false, problems: [] };
  const html = fs.readFileSync(file, "utf8");
  const problems = [];
  const m = /<script type="application\/json" id="eh-calendar">([\s\S]*?)<\/script>/.exec(html);
  let info = null;
  try { info = m ? JSON.parse(m[1]) : null; } catch { /* reported below */ }
  if (!info || !Array.isArray(info.entries) || typeof info.today !== "string") return { present: true, expectIndexable: false, problems: ["calendar page without valid eh-calendar data"] };
  const count = rule.countUpcoming(info.entries, info.today);
  const expectIndexable = rule.calendarIndexable(info.entries, info.today);
  if (info.minimum !== rule.MIN_UPCOMING_FOR_INDEX) problems.push(`calendar minimum is ${info.minimum}, the rule says ${rule.MIN_UPCOMING_FOR_INDEX}`);
  if (info.upcoming !== count) problems.push(`calendar says ${info.upcoming} upcoming entries, the rule counts ${count}`);
  if (info.entries.some((e) => e.verified !== true)) problems.push("calendar lists an entry from an organisation that is not verified");
  if (expectIndexable && count < rule.MIN_UPCOMING_FOR_INDEX) problems.push("calendar indexable with too few upcoming entries");
  return { present: true, expectIndexable, count, problems };
}
