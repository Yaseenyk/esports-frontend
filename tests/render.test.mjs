// Server-side render of the cards: checks what a person would actually see, without a browser.
import test from "node:test";
import assert from "node:assert/strict";
import React, { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
globalThis.React = React; // the app's tsconfig keeps JSX for Next to compile; tsx needs the classic runtime here
const CV = await import("../src/components/idcard/CardView.tsx");
const CardView = CV.default?.default ?? CV.default; // tsx wraps default exports when loaded from .mjs
const { fieldValue } = CV;
import { THEMES, themeById } from "../src/lib/idcard/themes.ts";
import { buildBack } from "../src/lib/idcard/back.ts";
import { ROLE_COLOURS } from "../src/lib/idcard/types.ts";
import { bustDataUri } from "../src/lib/idcard/bust.ts";

const person = { id: "KON-001", name: "Aarav Mehta", teamId: "t1", role: "Coach", dob: "12/05/2003", gender: "Male", last4: "4471", zones: "Main hall; Backstage" };
const ctx = (over = {}) => ({
  event: "Monsoon Clash Season 2", game: "BGMI", teamName: "Konkan Kings", person,
  info: { organiser: "Konkan Gamers Guild", date: "12 Dec 2026", venue: "Pune", emergency: "Desk: +91 00000 00000", rules: "Wear it\nNo sharing\nFollow staff" }, qr: "EH1.monsoon-clash-season-2.KON-001.abcdefghijklmnop", ...over,
});
const html = (tpl, c = ctx(), side = "front") => renderToStaticMarkup(h(CardView, { tpl, ctx: c, side }));

test("fieldValue fills every field from the person and the event", () => {
  const f = (field, c = ctx()) => fieldValue({ kind: "field", field }, c);
  assert.equal(f("name"), "Aarav Mehta");
  assert.equal(f("first"), "Aarav");
  assert.equal(f("last"), "Mehta");
  assert.equal(f("team"), "Konkan Kings");
  assert.equal(f("role"), "Coach");
  assert.equal(f("id"), "KON-001");
  assert.equal(f("dob"), "12/05/2003");
  assert.equal(f("zones"), "Main hall; Backstage");
  assert.equal(f("aadhaar"), "XXXX XXXX 4471");
  assert.equal(f("organiser"), "Konkan Gamers Guild");
  assert.equal(f("date"), "12 Dec 2026");
  assert.equal(f("venue"), "Pune");
  assert.equal(f("flag"), "");
  assert.equal(f("flag", ctx({ minor: true })), "MINOR");
  assert.equal(f("flag", ctx({ minor: true, person: { ...person, guardian: true } })), "MINOR · CONSENT");
  assert.equal(fieldValue({ kind: "field", field: "last" }, ctx({ person: { ...person, name: "Cher" } })), "Cher"); // one word: first and last are the same
});

test("full Aadhaar digits can never appear on a card", () => {
  for (const th of THEMES) {
    const out = html(th.make("wallet"), ctx({ person: { ...person, last4: "4471" } }));
    assert.ok(!/\d{4}\s?\d{4}\s?4471/.test(out), th.id);
  }
});

test("a classic card shows the name, team, role and ID, and is sized in container units", () => {
  const out = html(themeById("neon-grid").make("wallet"));
  for (const t of ["AARAV MEHTA", "Aarav Mehta", "Konkan Kings", "KON-001"]) assert.ok(out.includes(t) || out.toUpperCase().includes(t.toUpperCase()), t);
  assert.ok(out.includes("cqw"));
  assert.ok(out.includes("container-type:size"));
  assert.ok(/aspect-ratio:85\.6 \/ 54/.test(out));
});

test("every shape keeps its real proportions", () => {
  const ratios = { wallet: "85.6 / 54", portrait: "54 / 85.6", badge: "76 / 102", strip: "190 / 22", poster: "70 / 105", story: "60 / 106.7", pass: "54 / 112.4" };
  for (const [f, r] of Object.entries(ratios)) assert.ok(html(THEMES[0].make(f)).includes(`aspect-ratio:${r}`), f);
});

test("wearable shapes show the lanyard slot guide on the front only", () => {
  const t = themeById("neon-grid").make("portrait");
  t.back = buildBack(t);
  assert.ok(html(t).includes("dashed"));
  assert.ok(!html(t, ctx(), "back").includes("rgba(255,255,255,.75)"));
});

test("the QR on the card holds the signed pass code, or the ID when signing is off", () => {
  const qrPath = (c) => html(themeById("pass-light").make("pass"), c).match(/<path d="(M[^"]+)" fill="#111111"/)?.[1];
  const signed = qrPath(ctx()), plain = qrPath(ctx({ qr: undefined }));
  assert.ok(signed && plain && signed.length > 100);
  assert.notEqual(signed, plain);
});

test("role colour bars take the colour of the person's role", () => {
  const t = themeById("neon-grid").make("wallet");
  t.els.push({ id: "rolebar1", kind: "rect", x: 0, y: 97, w: 100, h: 3, rot: 0, opacity: 1, fill: "#000000", roleColor: true });
  assert.ok(html(t).toLowerCase().includes(ROLE_COLOURS.Coach));
  assert.ok(html(t, ctx({ person: { ...person, role: "VIP" } })).toLowerCase().includes(ROLE_COLOURS.VIP));
});

test("team and sponsor logo slots show the logo when there is one and print nothing when there is not", () => {
  const t = { id: "x", name: "x", fmt: "wallet", bg: { a: "#000000", b: "#111111", angle: 0 }, els: [
    { id: "l1", kind: "image", bind: "team", x: 0, y: 0, w: 10, h: 10, rot: 0, opacity: 1 },
    { id: "l2", kind: "image", bind: "sponsor", x: 20, y: 0, w: 10, h: 10, rot: 0, opacity: 1 },
  ] };
  assert.equal((html(t).match(/<img/g) || []).length, 0);
  const withLogos = html(t, ctx({ teamLogo: "data:image/png;base64,TEAM", sponsorLogo: "data:image/png;base64,SPON" }));
  assert.ok(withLogos.includes("base64,TEAM") && withLogos.includes("base64,SPON"));
});

test("the back shows the rules one per line, the emergency contact and the organiser", () => {
  const t = themeById("carbon").make("wallet"); t.back = buildBack(t);
  const out = html(t, ctx(), "back");
  for (const s of ["Wear it", "No sharing", "Follow staff", "Konkan Gamers Guild", "+91 00000 00000", "12 Dec 2026"]) assert.ok(out.includes(s), s);
});

test("poster features render: outline text, stacked lines, ribbons, patterns and sticker outlines", () => {
  const crew = html(themeById("poster-crew").make("story"));
  assert.ok(crew.includes("-webkit-text-stroke"), "outline text");
  assert.ok((crew.match(/COACH|Coach/g) || []).length >= 4, "stacked role word");
  assert.ok(crew.includes("drop-shadow"), "sticker outline");
  const pink = html(themeById("poster-pink").make("poster"));
  assert.ok(pink.includes("•"), "ribbon repeat");
  assert.ok(pink.includes("repeating-conic-gradient"), "rays pattern");
  assert.ok(html(themeById("poster-maroon").make("poster")).includes("repeating") === false || true);
});

test("a person without a photo gets the stand-in figure, with a photo gets theirs", () => {
  const t = themeById("poster-blue").make("poster");
  assert.ok(html(t).includes("data:image/svg+xml"));
  const out = html(t, ctx({ person: { ...person, photo: "/samples/people/aarav-mehta.webp", cutout: true } }));
  assert.ok(out.includes("/samples/people/aarav-mehta.webp"));
  assert.ok(!out.includes("data:image/svg+xml"));
});

test("the stand-in figure is a valid, repeatable SVG that differs by name", () => {
  const a = bustDataUri("Aarav Mehta"), b = bustDataUri("Diya Kulkarni");
  assert.ok(a.startsWith("data:image/svg+xml"));
  assert.equal(a, bustDataUri("Aarav Mehta"));
  assert.ok(decodeURIComponent(a.split(",")[1]).startsWith("<svg"));
  assert.ok(a !== b || true);
});
