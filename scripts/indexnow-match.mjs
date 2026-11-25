// Which live pages a commit changed, from the list of files it touched. Pure, so tests/indexnow.test.mjs can run it.
// `all` is every URL in the live sitemap; only those are ever returned.

/** The address of a page file in any route group: src/app/(site)/tools/x/page.tsx -> /tools/x/, src/app/(pt)/pt-br/tools/y/page.tsx -> /pt-br/tools/y/. Dynamic routes give null. */
export function pagePath(file) {
  const m = /^src\/app\/(.+)\/page\.tsx$/.exec(file.replace(/\\/g, "/"));
  if (!m) return null;
  const segs = m[1].split("/").filter((s) => !/^\(.*\)$/.test(s));
  if (segs.some((s) => s.startsWith("["))) return null;
  return segs.length ? `/${segs.join("/")}/` : "/";
}

/** The sitemap URLs whose path has a segment named after a v3 feature folder (src/features/<name>/), e.g. team-name -> /tools/team-name-generator/. */
function featurePages(feature, all) {
  return all.filter((u) => new URL(u).pathname.split("/").some((seg) => seg === feature || seg.startsWith(`${feature}-`) || seg.endsWith(`-${feature}`)));
}

export function urlsForChanges(changed, all, site) {
  const set = new Set();
  const add = (urls) => urls.forEach((u) => set.add(u));
  for (const raw of changed) {
    const f = raw.replace(/\\/g, "/");
    if (f === "src/content/guides.ts" || f.startsWith("src/content/scheduled/")) add(all.filter((u) => u.includes("/guides/")));
    else if (f === "src/lib/tool-pages.ts" || f === "src/lib/tool-page-extra.ts" || f === "src/lib/data.ts" || f.startsWith("src/components/tools/") || f.startsWith("src/components/seo/ToolLanding")) add(all.filter((u) => u.includes("/tools/")));
    else if (f === "src/lib/pt-br.ts" || f === "src/lib/game-pages-pt.ts" || f.startsWith("src/content/pt-br/")) add(all.filter((u) => u.includes("/pt-br/")));
    else if (f === "src/lib/game-pages.ts") add(all.filter((u) => u.includes("/points-table/")));
    else if (f.startsWith("src/features/")) { const feature = f.split("/")[2]; if (feature && !feature.includes(".")) add(featurePages(feature, all)); }
    else { const p = pagePath(f); if (p) set.add(`${site}${p}`); }
  }
  return [...set].filter((u) => all.includes(u));
}
