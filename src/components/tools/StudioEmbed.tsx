"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { StudioSkeleton } from "@/components/skeleton/Scenes";
import { cardFontVars } from "@/components/idcard/fonts";

// The card maker is a large program, so it downloads only when someone asks for it. The page itself is plain, fast HTML for readers and search engines.
const IdCardStudio = dynamic(() => import("@/components/idcard/IdCardStudio"), { loading: () => <StudioSkeleton /> });

export default function StudioEmbed() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <div className="card flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-display text-lg font-bold text-white">Free ID card maker</p><p className="text-sm text-zinc-300">Works in your browser. No account needed. Demo people are loaded so you can see how it works.</p></div>
        <button type="button" className="btn shrink-0" onMouseEnter={() => void import("@/components/idcard/IdCardStudio")} onClick={() => setOpen(true)}>Open the ID card maker</button>
      </div>
    );
  }
  return <div className={cardFontVars}><IdCardStudio /></div>;
}
