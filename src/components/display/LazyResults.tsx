"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import type ScreenButtonsType from "./ScreenButtons";
import type OverlayKitConnectType from "@/features/overlay-kit/ui/OverlayKitConnect";

/**
 * The share, winners, TV-screen and overlay blocks of the tools, as separate chunks (about 40 KB of script together) so a tool page's
 * first load carries only the tool itself.
 *
 * - ShareResult and WinnersBlock appear only once there is a result, so their code loads when they first render.
 * - ScreenButtons (the optional last step) and OverlayKitConnect are always on the page, low down. They mount once the browser is idle
 *   after load, when they come near the screen, or on the first tap or key press, whichever is first.
 *
 * Each placeholder holds the block's usual height (the `lr-*` rules in globals.css), so nothing below it jumps when the block arrives.
 */
const slot = (cls: string) => function Slot() { return <div className={cls} aria-busy="true" />; };

export const ShareResult = dynamic(() => import("@/features/share-result/ui/ShareResult"), { ssr: false, loading: slot("lr-share") });
export const WinnersBlock = dynamic(() => import("./WinnersBlock"), { ssr: false, loading: slot("lr-winners") });
const ScreenButtonsChunk = dynamic(() => import("./ScreenButtons"), { ssr: false, loading: slot("lr-screen") });
const OverlayKitChunk = dynamic(() => import("@/features/overlay-kit/ui/OverlayKitConnect"), { ssr: false, loading: slot("lr-kit") });

type IdleWindow = Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (n: number) => void };

/** Renders the placeholder until the browser is idle after load, the box nears the screen, or the visitor first taps or types. */
function Deferred({ cls, children }: { cls: string; children: ReactNode }) {
  const [go, setGo] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (go) return;
    const w = window as IdleWindow;
    const start = () => setGo(true);
    let idle = 0, timer = 0;
    const whenIdle = () => { if (w.requestIdleCallback) idle = w.requestIdleCallback(start, { timeout: 2000 }); else timer = window.setTimeout(start, 600); };
    if (document.readyState === "complete") whenIdle(); else window.addEventListener("load", whenIdle, { once: true });
    const io = typeof IntersectionObserver !== "undefined" && box.current ? new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) start(); }, { rootMargin: "600px 0px" }) : null;
    if (io && box.current) io.observe(box.current);
    const opts = { once: true, passive: true, capture: true } as const;
    window.addEventListener("pointerdown", start, opts);
    window.addEventListener("keydown", start, opts);
    return () => {
      window.removeEventListener("load", whenIdle);
      if (idle) w.cancelIdleCallback?.(idle);
      if (timer) window.clearTimeout(timer);
      io?.disconnect();
      window.removeEventListener("pointerdown", start, opts);
      window.removeEventListener("keydown", start, opts);
    };
  }, [go]);
  return go ? <>{children}</> : <div ref={box} className={cls} aria-busy="true" />;
}

export function ScreenButtons(props: ComponentProps<typeof ScreenButtonsType>) {
  return <Deferred cls="lr-screen"><ScreenButtonsChunk {...props} /></Deferred>;
}

export function OverlayKitConnect(props: ComponentProps<typeof OverlayKitConnectType>) {
  return <Deferred cls="lr-kit"><OverlayKitChunk {...props} /></Deferred>;
}
