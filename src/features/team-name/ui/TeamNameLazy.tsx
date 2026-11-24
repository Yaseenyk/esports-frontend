"use client";

import dynamic from "next/dynamic";
import type { Preset } from "@/features/team-name/domain";

/**
 * The tool rendered in the browser only, like the points table: with no server HTML for the tool, a browser translator that rewrites the
 * page before React starts has nothing to change under React. The page text, FAQ and structured data stay in the static HTML.
 */
const Tool = dynamic(() => import("@/features/team-name/ui/TeamNameTool"), {
  ssr: false,
  loading: () => <div className="min-h-screen rounded-xl border border-white/10 bg-surface" data-ph="team-name" aria-busy="true" />,
});

/** `preset` and `stylish` set where the tool starts (the Free Fire guild page starts on the guild preset with stylish versions on). */
export default function TeamNameLazy(props: { preset?: Preset; stylish?: boolean }) {
  return <Tool {...props} />;
}
