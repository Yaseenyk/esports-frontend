"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { doNotTrack } from "@/lib/hits";
import { gtmAllowed, GTM_ID } from "@/lib/gtm";

/**
 * Google Tag Manager (the Google Analytics 4 tag lives in the container).
 * Rules, because many visitors are young and many pages carry private links:
 *  - only on public marketing pages (see lib/gtm.ts); never in the app, sign-in, or any page whose address holds a private link;
 *  - never when the visitor sends Do Not Track or Global Privacy Control;
 *  - if someone walks from a marketing page into a page that is not allowed, the page is reloaded so the tag is gone.
 */
export default function GoogleTag() {
  const path = usePathname() || "/";
  useEffect(() => {
    try {
      const w = window as unknown as { dataLayer?: unknown[]; __gtmOn?: boolean; globalPrivacyControl?: boolean };
      const optedOut = doNotTrack() || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
      if (!gtmAllowed(path) || optedOut) {
        if (w.__gtmOn) window.location.reload(); // the tag is already running: a fresh page load without it
        return;
      }
      if (w.__gtmOn) return;
      w.__gtmOn = true;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      document.head.appendChild(s);
    } catch { /* analytics must never break a page */ }
  }, [path]);
  return null;
}
