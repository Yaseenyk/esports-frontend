"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHANNEL, encode, sanitizeExtras, type Extras, type Payload } from "@/lib/display";
import { loadExtras, saveExtras } from "@/lib/extras-store";

export interface ScreenOptions { theme: string; transparent: boolean }

/**
 * Lets a tool send what it shows to a display screen window. While the tool page stays open, every change goes straight to the screen
 * (same browser, no internet needed). A copied link is a snapshot that can be opened on another device or in OBS.
 */
export function useScreen(base: Payload | null) {
  // Sponsors and announcements are saved once in this browser and ride along with every view, so every tool's screen and link carries them.
  const [extras, setExtrasState] = useState<Extras | undefined>(undefined);
  useEffect(() => { setExtrasState(loadExtras()); }, []);
  const setExtras = useCallback((x: Extras | undefined) => { const clean = sanitizeExtras(x); setExtrasState(clean); return saveExtras(clean); }, []);
  const payload = useMemo<Payload | null>(() => (base ? (extras ? { ...base, x: extras } : base) : null), [base, extras]);
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
  const link = useCallback(async () => {
    if (!payload) return "";
    let code = await encode(payload);
    // Logos are the bulk of a link. A screen refuses links over 200,000 characters, so if the logos make it too long, the link carries names only.
    if (code.length > 150_000 && payload.x?.sponsors) code = await encode({ ...payload, x: { ...payload.x, sponsors: payload.x.sponsors.map((s) => ({ name: s.name })) } });
    return `${location.origin}/display/${query()}#d=${code}`;
  }, [payload, query]);
  /**
   * Opens (or reuses) the screen window. The window is opened first, in the click itself, because browsers block a pop-up that is opened after
   * waiting; the link is worked out afterwards and sent to it. Returns false when the browser blocked the window or the link could not be made.
   */
  const open = useCallback(async (): Promise<boolean> => {
    const w = window.open("", "eh-screen");
    if (!w) return false;
    try {
      const url = await link();
      if (!url) { w.close(); return false; }
      w.location.href = url;
      w.focus();
      return true;
    } catch { w.close(); return false; }
  }, [link]);
  /** Copies the link. Returns false when the browser would not allow it (for example on a page that is not secure). */
  const copy = useCallback(async (): Promise<boolean> => {
    try {
      const url = await link();
      if (!url || !navigator.clipboard) return false;
      await navigator.clipboard.writeText(url);
      return true;
    } catch { return false; }
  }, [link]);
  return { opts, setOpts, open, copy, link, extras, setExtras, payload };
}
