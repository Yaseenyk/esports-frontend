"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { hasBackend } from "@/lib/api";
import { isHiddenPath } from "@/features/feedback/config";

/**
 * The only thing the root layout loads for feedback: a few lines. It does nothing on hidden routes (no probe, no chunk) and when the site has
 * no backend. Otherwise the widget's code is fetched only after the page's load event plus an idle moment, so it cannot touch LCP or CLS.
 */
export default function FeedbackLoader() {
  const pathname = usePathname() ?? "/";
  const hidden = isHiddenPath(pathname);
  const [Root, setRoot] = useState<ComponentType<{ pathname: string }> | null>(null);

  useEffect(() => {
    if (hidden || !hasBackend || Root) return;
    let gone = false;
    let idle: number | ReturnType<typeof setTimeout> | undefined;
    const go = () => { void import("@/features/feedback/FeedbackRoot").then((m) => { if (!gone) setRoot(() => m.default); }); };
    const afterLoad = () => {
      const ric = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      idle = ric ? ric(go, { timeout: 4000 }) : setTimeout(go, 2000);
    };
    if (document.readyState === "complete") afterLoad(); else window.addEventListener("load", afterLoad, { once: true });
    return () => { gone = true; window.removeEventListener("load", afterLoad); if (idle !== undefined && typeof idle !== "number") clearTimeout(idle); };
  }, [hidden, Root]);

  if (hidden || !Root) return null;
  return <Root pathname={pathname} />;
}
