"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const HeroArt = dynamic(() => import("./HeroArt"), { ssr: false });

/** Reserves the space, then loads the animated hero picture once the browser is idle, so it can never delay the text. */
export default function HeroArtLazy() {
  const [go, setGo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (n: number) => void };
    const start = () => setGo(true);
    if (w.requestIdleCallback) { const id = w.requestIdleCallback(start, { timeout: 2500 }); return () => w.cancelIdleCallback?.(id); }
    const id = window.setTimeout(start, 1200);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <div ref={ref} className="relative mx-auto hidden h-[26rem] w-full max-w-md lg:block" aria-hidden="true">
      <div className="absolute inset-8 rounded-[2.5rem] border border-white/[0.14] bg-[#0a0b0d]" />
      {go && <div className="absolute inset-0 hero-fade-in"><HeroArt /></div>}
    </div>
  );
}
