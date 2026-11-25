"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const HeroArt = dynamic(() => import("./HeroArt"), { ssr: false });

/**
 * Reserves the space, then loads the animated hero picture once the browser is idle, so it can never delay the text.
 * The box shows from 1024 px only (`hidden lg:block`), so a phone never loads the picture's code; a window widened past 1024 px loads it then.
 */
const WIDE = "(min-width: 1024px)";

export default function HeroArtLazy() {
  const [go, setGo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (go) return;
    const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (n: number) => void };
    const mq = window.matchMedia(WIDE);
    let idle = 0, timer = 0;
    const start = () => setGo(true);
    const schedule = () => {
      if (!mq.matches || idle || timer) return;
      if (w.requestIdleCallback) idle = w.requestIdleCallback(start, { timeout: 2500 }); else timer = window.setTimeout(start, 1200);
    };
    schedule();
    mq.addEventListener?.("change", schedule);
    return () => {
      mq.removeEventListener?.("change", schedule);
      if (idle) w.cancelIdleCallback?.(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, [go]);
  return (
    <div ref={ref} className="relative mx-auto hidden h-[26rem] w-full max-w-md lg:block" aria-hidden="true">
      <div className="absolute inset-8 rounded-[2.5rem] border border-white/[0.14] bg-[#0a0b0d]" />
      {go && <div className="absolute inset-0 hero-fade-in"><HeroArt /></div>}
    </div>
  );
}
