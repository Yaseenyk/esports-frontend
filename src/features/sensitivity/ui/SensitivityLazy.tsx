"use client";

import dynamic from "next/dynamic";

/**
 * The tool rendered in the browser only, like the points table: with no server HTML for the tool, a browser translator that rewrites the
 * page before React starts has nothing to change under React. The page text, FAQ and structured data stay in the static HTML.
 */
const Tool = dynamic(() => import("@/features/sensitivity/ui/SensitivityTool"), {
  ssr: false,
  loading: () => <div className="min-h-screen rounded-xl border border-white/10 bg-surface" data-ph="sensitivity" aria-busy="true" />,
});

export default function SensitivityLazy() {
  return <Tool />;
}
