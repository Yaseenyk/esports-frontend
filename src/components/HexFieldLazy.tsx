"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HexField = dynamic(() => import("./HexField"), { ssr: false });

/** The honeycomb behind the site is decoration, so it is fetched and drawn only once the browser is idle (or the visitor first moves), never during the page's first seconds. */
export default function HexFieldLazy() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (n: number) => void };
    const start = () => setGo(true);
    const idle = typeof w.requestIdleCallback === "function";
    const id = idle ? w.requestIdleCallback!(start, { timeout: 3000 }) : window.setTimeout(start, 1500);
    window.addEventListener("pointermove", start, { once: true, passive: true });
    return () => { window.removeEventListener("pointermove", start); if (idle) w.cancelIdleCallback?.(id); else window.clearTimeout(id); };
  }, []);
  return go ? <HexField /> : null;
}
