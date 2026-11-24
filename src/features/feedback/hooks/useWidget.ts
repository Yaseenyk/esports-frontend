"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { isFullscreenNow } from "@/features/feedback/config";
import { armNudge, markDismissed, type PromptEnv } from "@/features/feedback/hooks/prompt";
import { startErrorCapture } from "@/features/feedback/hooks/error-capture";
import type { Probe } from "@/features/feedback/services/feedback.api";
import { probeStatus } from "@/features/feedback/services/feedback.api";

const safe = <T,>(f: () => T): T | undefined => { try { return f(); } catch { return undefined; } };
const browserEnv = (): PromptEnv => ({ now: Date.now, local: safe(() => localStorage), session: safe(() => sessionStorage) });

/** Asks the API once whether feedback is on, and starts the in-memory error capture. `null` until known; the widget draws nothing for `null` or off. */
export function useProbe(pathname = ""): Probe | null {
  const [probe, setProbe] = useState<Probe | null>(null);
  // Asked again on the next page while the answer was not a definite one (see probeStatus): a bad connection must not hide the bubble for the whole visit.
  useEffect(() => { if (probe?.on) return; let live = true; probeStatus().then((p) => { if (live) setProbe(p); }); return () => { live = false; }; }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => startErrorCapture(), []);
  return probe;
}

/** True while something is fullscreen (a video, the display screen): the widget steps aside. */
export function useFullscreen(): boolean {
  const [full, setFull] = useState(false);
  useEffect(() => {
    const on = () => setFull(isFullscreenNow());
    on();
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  return full;
}

/** The nudge line: appears once after about 20 s on a page, only while the panel has not been opened, never in the next 7 days after a dismissal. */
export function useNudge(pathname: string, opened: boolean) {
  const [line, setLine] = useState<string | null>(null);
  useEffect(() => {
    if (opened) { setLine(null); return; }
    return armNudge(browserEnv(), () => opened, setLine);
  }, [pathname, opened]);
  const dismiss = useCallback(() => { markDismissed(browserEnv()); setLine(null); }, []);
  return { line, dismiss };
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([tabindex="-1"]):not([type="hidden"]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Focus trap for the dialog: Tab cycles inside, Escape closes, focus goes in on open and back to the bubble on close. */
export function useDialogFocus(panel: RefObject<HTMLElement>, bubble: RefObject<HTMLElement>, open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const root = panel.current;
    if (!root) return;
    const first = root.querySelector<HTMLElement>("[data-autofocus]") ?? root.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); return; }
      if (e.key !== "Tab") return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) { e.preventDefault(); return; }
      const a = document.activeElement as HTMLElement | null;
      const i = a ? items.indexOf(a) : -1;
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && (i === items.length - 1 || i < 0)) { e.preventDefault(); items[0].focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    const back = bubble.current;
    return () => { document.removeEventListener("keydown", onKey, true); back?.focus(); };
  }, [open, panel, bubble, onClose]);
}

/** After each step change, move focus to the new step's main control (so a keyboard user lands on the next question). */
export function useStepFocus(panel: RefObject<HTMLElement>, step: string, open: boolean) {
  useEffect(() => {
    if (!open) return;
    const el = panel.current?.querySelector<HTMLElement>("[data-autofocus]");
    el?.focus();
  }, [step, open, panel]);
}

const FIELD = "input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=range]):not([type=file]), select, textarea, [contenteditable=true]";
/**
 * True while someone is typing in a field on the page (not in the feedback dialog). On phones the bubble then steps aside, so it
 * never sits over a select chevron, an input or a radio label while the on-screen keyboard is up.
 */
export function useFieldFocus(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const check = () => {
      const el = document.activeElement;
      setOn(!!el && el instanceof HTMLElement && el.matches(FIELD) && !el.closest("[data-feedback-panel]"));
    };
    // focusout fires before the next field gets focus; wait a frame so moving between fields does not flash the bubble.
    const later = () => requestAnimationFrame(check);
    document.addEventListener("focusin", check);
    document.addEventListener("focusout", later);
    return () => { document.removeEventListener("focusin", check); document.removeEventListener("focusout", later); };
  }, []);
  return on;
}
