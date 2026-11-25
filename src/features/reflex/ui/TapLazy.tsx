"use client";

import dynamic from "next/dynamic";

/** Browser only (timing needs the browser); the page text, FAQ and structured data stay in the static HTML. */
const Tool = dynamic(() => import("@/features/reflex/ui/TapTool"), {
  ssr: false,
  loading: () => <div className="h-96 rounded-xl border border-white/10 bg-surface" data-ph="tap" aria-busy="true" />,
});

export default function TapLazy() {
  return <Tool />;
}
