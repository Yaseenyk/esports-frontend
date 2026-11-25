"use client";

import dynamic from "next/dynamic";

/** Browser only (it reads ?c= and this browser's favourites); the page text, FAQ and structured data stay in the static HTML. */
const Tool = dynamic(() => import("@/features/crosshair/ui/CrosshairTool"), {
  ssr: false,
  loading: () => <div className="min-h-screen rounded-xl border border-white/10 bg-surface" data-ph="crosshair" aria-busy="true" />,
});

export default function CrosshairLazy() {
  return <Tool />;
}
