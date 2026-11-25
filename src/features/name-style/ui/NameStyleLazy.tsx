"use client";

import dynamic from "next/dynamic";
import type { Game, Lang } from "@/features/name-style/domain";

/** The generator in the browser only (like the team name tool): the ready-made lists, symbols and FAQ around it are static HTML. */
const Tool = dynamic(() => import("@/features/name-style/ui/NameStyleTool"), {
  ssr: false,
  loading: () => <div className="min-h-96 rounded-xl border border-white/10 bg-surface" data-ph="name-style" aria-busy="true" />,
});

export default function NameStyleLazy(props: { game: Game; lang?: Lang }) {
  return <Tool {...props} />;
}
