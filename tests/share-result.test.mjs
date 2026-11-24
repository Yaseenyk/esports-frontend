// "Share result" (src/features/share-result): every picture and message names the tool page it came from. Also the COD Mobile example scale.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { TOOL_PATHS, resultShare } from "../src/features/share-result/domain.ts";
import { footerLine, SITE_HOST, toolLink, shareText, winnersText } from "../src/lib/share-cards.ts";
import { CODM_EXAMPLE_SCALE, CODM_SAMPLE_TEAMS, EXAMPLE_SCALE, matchPoints, standings } from "../src/lib/points.ts";
import { ALL_GAME_PAGES } from "../src/lib/game-pages.ts";
import { FREE_FIRE_PT } from "../src/lib/game-pages-pt.ts";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const table = { v: "table", d: { title: "Standings", head: ["#", "Team", "Total"], rows: [["1", "Alpha", "30"], ["2", "Bravo", "20"]], strong: 2 } };

test("the footer is the made-with line plus the tool page address, without https or the closing slash", () => {
  assert.equal(SITE_HOST, "esports.streamerosai.com");
  assert.equal(toolLink("/points-table/free-fire/"), "esports.streamerosai.com/points-table/free-fire");
  assert.equal(toolLink("/tools/brackets/?x=1#y"), "esports.streamerosai.com/tools/brackets");
  assert.equal(toolLink(), "esports.streamerosai.com");
  assert.equal(footerLine("/points-table/free-fire/"), "Made with Esports Hub · esports.streamerosai.com/points-table/free-fire");
  assert.equal(footerLine("/pt-br/points-table/free-fire/", "pt-BR"), "Feito com Esports Hub · esports.streamerosai.com/pt-br/points-table/free-fire");
  // Pictures made without a page still carry the site address.
  assert.ok(shareText(table).endsWith("Made with Esports Hub · esports.streamerosai.com"));
  assert.ok(winnersText({ title: "Winners", first: "A" }).endsWith("· esports.streamerosai.com"));
});

test("each tool's share message ends with that tool's own address", () => {
  const paths = [...Object.values(TOOL_PATHS), ...ALL_GAME_PAGES.map((g) => g.path), FREE_FIRE_PT.path];
  assert.ok(paths.includes("/points-table/cod-mobile/") && paths.includes("/points-table/valorant/") && paths.includes("/pt-br/points-table/free-fire/"));
  for (const path of paths) {
    const lang = path.startsWith("/pt-br/") ? "pt-BR" : "en";
    const s = resultShare(table, { path, what: "points table", format: "portrait", lang });
    const want = `esports.streamerosai.com${path.replace(/\/$/, "")}`;
    assert.ok(s.footer.endsWith(want), `${path}: ${s.footer}`);
    assert.equal(s.text.split("\n").at(-1), s.footer, `${path}: the message ends with the footer`);
    assert.ok(s.text.startsWith("🏆 *Standings*"));
    assert.equal(s.fileName, "standings-portrait.png");
    assert.ok(lang === "pt-BR" ? s.footer.startsWith("Feito com Esports Hub") : s.footer.startsWith("Made with Esports Hub"));
  }
});

test("every tool hands its page to Share result and the TV step", () => {
  const files = {
    "src/components/tools/PointsTable.tsx": 1, "src/components/tools/BracketMaker.tsx": 1, "src/components/tools/DoubleElimination.tsx": 1,
    "src/components/tools/RoundRobin.tsx": 1, "src/components/features/stages/GroupsTool.tsx": 2, "src/features/map-league/ui/MapLeagueTool.tsx": 1,
  };
  for (const [f, n] of Object.entries(files)) {
    const src = read(f);
    assert.equal((src.match(/<ShareResult /g) ?? []).length, n, `${f} has ${n} Share result button(s)`);
    assert.match(src, /<ScreenButtons [^>]*path=\{path\}/, `${f} passes its page to the TV step`);
  }
  for (const page of ["src/app/(site)/points-table/free-fire/page.tsx", "src/app/(site)/points-table/bgmi/page.tsx", "src/app/(site)/points-table/cod-mobile/page.tsx", "src/app/(pt)/pt-br/points-table/free-fire/page.tsx", "src/app/(site)/points-table/valorant/page.tsx"]) {
    assert.match(read(page), /path=\{t\.path\}/, `${page} passes its own path`);
  }
});

test("COD Mobile example scale: its own ten places, scored by the same engine, with the sample ranked and the tie marked", () => {
  assert.deepEqual(CODM_EXAMPLE_SCALE.placement, [15, 12, 10, 8, 6, 5, 4, 3, 2, 1]);
  assert.equal(CODM_EXAMPLE_SCALE.perKill, 1);
  assert.notDeepEqual(CODM_EXAMPLE_SCALE.placement, EXAMPLE_SCALE.placement);
  assert.equal(matchPoints({ placement: 1, kills: 4 }, CODM_EXAMPLE_SCALE), 19);
  assert.equal(matchPoints({ placement: 10, kills: 0 }, CODM_EXAMPLE_SCALE), 1);
  assert.equal(matchPoints({ placement: 11, kills: 2 }, CODM_EXAMPLE_SCALE), 2, "places past the list score only kills");
  const rows = standings(CODM_SAMPLE_TEAMS, CODM_EXAMPLE_SCALE);
  assert.deepEqual(rows.map((r) => [r.name, r.total]), [["Red Comets", 49], ["Night Ravens", 46], ["Iron Wolves", 46], ["Static Squad", 44]]);
  assert.deepEqual(rows.map((r) => r.tied), [false, true, true, false]);
  assert.deepEqual(rows[0].perMatch, [17, 14, 18]);
});

test("the COD Mobile page and tool say the scale is an example written for the page, not an official or common one", () => {
  const cod = ALL_GAME_PAGES.find((g) => g.path === "/points-table/cod-mobile/");
  assert.ok(/example written for this page, not an official one/.test(cod.lead));
  assert.ok(cod.table.rows.slice(0, 10).every(([, p], i) => Number(p) === CODM_EXAMPLE_SCALE.placement[i]), "the page table matches the tool's scale");
  const pt = read("src/components/tools/PointsTable.tsx"), copy = read("src/lib/tool-copy.ts");
  assert.match(pt, /"cod-mobile": \{[^\n]*own: true/);
  assert.match(copy, /written for this page as a starting point\. It is not \$\{game\}'s official scale/);
});
