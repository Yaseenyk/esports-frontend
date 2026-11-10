"use client";

import { useEffect } from "react";

/** Registers the service worker (production only) so the gate scanner and card maker keep working offline once opened. */
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const go = () => { navigator.serviceWorker.register("/sw.js").catch(() => undefined); };
    if (document.readyState === "complete") go(); else window.addEventListener("load", go, { once: true });
  }, []);
  return null;
}
