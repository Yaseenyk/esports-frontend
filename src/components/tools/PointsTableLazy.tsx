"use client";

import dynamic from "next/dynamic";
import type { PointsPreset } from "./PointsTable";
import type { UiLang } from "@/lib/pt-br";

/**
 * The points table tool, rendered in the browser only.
 *
 * Why: Brazilian visitors use the Free Fire page with Chrome's Google Translate on. On a slow phone the translator rewrites the page
 * before React starts, and React then finds the tool's server HTML changed (minified errors 418, 423, 425, sometimes 329 and a lost
 * click). With no server HTML for the tool there is nothing for the translator to change under React. The page's headings, text, FAQ
 * and structured data around the tool stay in the static HTML for search engines; only the interactive part waits for JavaScript.
 *
 * The placeholder keeps the tool's usual height (the `pt-slot` rule in globals.css) so nothing below it jumps when the tool arrives.
 * Its code, and the share and screen code it pulls in, are a separate chunk loaded after the page's own scripts.
 */
const PointsTable = dynamic(() => import("./PointsTable"), { ssr: false, loading: () => <Placeholder /> });

function Placeholder() {
  return (
    <div className="pt-slot card" data-ph="points-table" aria-busy="true" />
  );
}

export default function PointsTableLazy({ preset, lang, path }: { preset?: PointsPreset; lang?: UiLang; /** The page the tool is on, for the address on share pictures. */ path?: string }) {
  return <PointsTable preset={preset} lang={lang} path={path} />;
}
