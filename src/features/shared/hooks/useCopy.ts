"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copy a value to the clipboard and say so for a few seconds. `copied` is the key of the last value copied (for an aria-live "Copied"),
 * or "failed" when the browser refused. Nothing is kept: the value goes from the screen to the clipboard only.
 */
export function useCopy(ms = 2500) {
  const [copied, setCopied] = useState("");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = useCallback(async (key: string, text: string) => {
    let ok = false;
    try { if (navigator.clipboard) { await navigator.clipboard.writeText(text); ok = true; } } catch { ok = false; }
    setCopied(ok ? key : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(""), ms);
    return ok;
  }, [ms]);
  return { copied, copy };
}
