import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { gtmAllowed } from "../src/lib/gtm.ts";

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = [...walk("src/components/admin"), ...walk("src/lib/admin"), ...walk("src/app/(admin)")];
const src = (f) => fs.readFileSync(f, "utf8");
const noComments = (s) => s.replace(/\/\*\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

test("the staff console never touches localStorage, cookies or analytics", () => {
  for (const f of files) assert.ok(!/localStorage|document\.cookie|dataLayer|gtag\(|clarity\(|\btrack\(/.test(noComments(src(f))), f);
});

test("the staff token is kept with sessionStorage", () => {
  assert.match(src("src/lib/admin/client.ts"), /sessionStorage/);
});

test("the console does not import the blog bundle, the shared cached client or the app session store", () => {
  for (const f of files) assert.ok(!/lib\/blog|api\/cloud|useSession/.test(src(f)), f);
});

test("admin pages are noindex and carry the title a missing page would have", () => {
  const l = src("src/app/(admin)/admin/layout.tsx");
  assert.match(l, /index: false/);
  assert.match(l, /follow: false/);
  assert.match(l, /Page not found/);
});

test("robots, the SEO check and the tag loader all treat /admin/ as private", () => {
  assert.match(src("src/app/robots.ts"), /"\/admin\/"/);
  assert.match(src("scripts/verify-seo.mjs"), /\^\\\/admin\\\//);
  assert.equal(gtmAllowed("/admin/"), false);
  assert.equal(gtmAllowed("/admin/reports/"), false);
  assert.ok(!/admin/.test(src("src/app/sitemap.ts")));
});

test("the not-found view says nothing about an admin area", () => {
  assert.ok(!/admin|staff|sign.?in/i.test(noComments(src("src/components/admin/NotFoundView.tsx"))));
});

test("no staff-creation screen exists", () => {
  for (const f of files) assert.ok(!/create staff|add staff|new staff|invite staff/i.test(src(f)), f);
});

test("every admin screen is a static page", () => {
  for (const f of walk("src/app/(admin)").filter((x) => x.endsWith("page.tsx"))) assert.ok(!/generateStaticParams|dynamic\s*=|cookies\(|headers\(/.test(src(f)), f);
});
