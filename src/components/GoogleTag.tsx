"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { doNotTrack } from "@/lib/hits";
import { gtmAllowed, tagHostAllowed } from "@/lib/gtm";

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
      const w = window as unknown as { __gtmOn?: boolean };
      if (!tagHostAllowed(window.location.hostname)) return; // local runs, previews and automated tests must never send hits to the owner's analytics
      const optedOut = doNotTrack() || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
      if (!gtmAllowed(path) || optedOut) {
        if (w.__gtmOn) window.location.reload(); // the tag is already running: a fresh page load without it
        return;
      }
      // Starts the same wait as the loader in the page head (first scroll, tap or key press, or 4 s after load); a no-op if the tags are already on.
      (window as unknown as { __gtmArm?: () => void }).__gtmArm?.();
    } catch { /* analytics must never break a page */ }
  }, [path]);
  return null;
}
