"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHANNEL, encode, type Payload } from "@/lib/display";

export interface ScreenOptions { theme: "dark" | "light" | "neon"; transparent: boolean }

/**
 * Lets a tool send what it shows to a display screen window. While the tool page stays open, every change goes straight to the screen
 * (same browser, no internet needed). A copied link is a snapshot that can be opened on another device or in OBS.
 */
export function useScreen(payload: Payload | null) {
  const latest = useRef(payload); latest.current = payload;
  const ch = useRef<BroadcastChannel | null>(null);
  const [opts, setOpts] = useState<ScreenOptions>({ theme: "dark", transparent: false });
  const key = useMemo(() => JSON.stringify(payload), [payload]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const c = new BroadcastChannel(CHANNEL);
    ch.current = c;
    c.onmessage = (e: MessageEvent) => { if (e.data?.ready && latest.current) c.postMessage({ payload: latest.current }); }; // a screen that has just opened asks for the current view
    return () => { c.close(); ch.current = null; };
  }, []);
  useEffect(() => { if (latest.current) ch.current?.postMessage({ payload: latest.current }); }, [key]);

  const query = useCallback(() => { const q = new URLSearchParams(); if (opts.theme !== "dark") q.set("theme", opts.theme); if (opts.transparent) q.set("bg", "transparent"); const s = q.toString(); return s ? `?${s}` : ""; }, [opts]);
  const link = useCallback(async () => (payload ? `${location.origin}/display/${query()}#d=${await encode(payload)}` : ""), [payload, query]);
  const open = useCallback(async () => { const url = await link(); if (url) window.open(url, "eh-screen"); }, [link]);
  const copy = useCallback(async () => { const url = await link(); if (url) { await navigator.clipboard?.writeText(url); return true; } return false; }, [link]);
  return { opts, setOpts, open, copy, link };
}
