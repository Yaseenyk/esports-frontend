// IndexNow: a commit submits the pages it changed, including Portuguese pages under src/app/(pt)/ and v3 feature folders.
import test from "node:test";
import assert from "node:assert/strict";
import { pagePath, urlsForChanges } from "../scripts/indexnow-match.mjs";

const S = "https://esports.streamerosai.com";
const all = ["/", "/tools/", "/tools/team-name-generator/", "/tools/free-fire-guild-name/", "/tools/sensitivity-converter/", "/pt-br/points-table/free-fire/", "/pt-br/guides/free-fire-team-names-ideas/", "/points-table/bgmi/", "/guides/points-table/", "/about/"].map((p) => S + p);

test("page files in any route group map to their address; dynamic routes do not", () => {
  assert.equal(pagePath("src/app/(site)/tools/brackets/page.tsx"), "/tools/brackets/");
  assert.equal(pagePath("src/app/(pt)/pt-br/tools/nick-free-fire/page.tsx"), "/pt-br/tools/nick-free-fire/");
  assert.equal(pagePath("src/app/(site)/page.tsx"), "/");
  assert.equal(pagePath("src/app/(site)/guides/[slug]/page.tsx"), null);
  assert.equal(pagePath("src/lib/data.ts"), null);
});

test("a commit submits only live pages it changed", () => {
  assert.deepEqual(urlsForChanges(["src/app/(pt)/pt-br/points-table/free-fire/page.tsx"], all, S), [`${S}/pt-br/points-table/free-fire/`]);
  assert.deepEqual(urlsForChanges(["src/app/(pt)/pt-br/tools/not-live-yet/page.tsx"], all, S), []);
  assert.deepEqual(urlsForChanges(["src/lib/pt-br.ts"], all, S).sort(), [`${S}/pt-br/guides/free-fire-team-names-ideas/`, `${S}/pt-br/points-table/free-fire/`]);
  assert.deepEqual(urlsForChanges(["src/features/team-name/domain.ts"], all, S), [`${S}/tools/team-name-generator/`]);
  assert.deepEqual(urlsForChanges(["src/app/(site)/about/page.tsx"], all, S), [`${S}/about/`]);
  assert.ok(urlsForChanges(["src/lib/tool-page-extra.ts"], all, S).includes(`${S}/tools/sensitivity-converter/`));
});
