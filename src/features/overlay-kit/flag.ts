/**
 * THE SWITCH for the OBS overlay kit. Read at build time from NEXT_PUBLIC_OVERLAY_KIT ("1" = on). Unset or anything else = off, which is
 * the production default until the owner switches it on (planned for February 2027).
 *
 * Off: the kit pages are deleted from ./out after the build (scripts/prune-v3.mjs), left out of the sitemap, and no tool links to them.
 * On:  the kit page and its OBS guide are public pages, the browser source page is noindex, and the points table tools show a
 *      "Send to the OBS overlay" box.
 * To switch on in production: set the repository variable NEXT_PUBLIC_OVERLAY_KIT to 1 (GitHub, Settings, Variables), then rerun the deploy.
 */
export const overlayKitOn = (v: string | undefined = process.env.NEXT_PUBLIC_OVERLAY_KIT): boolean => v === "1" || v === "true" || v === "on";
export const OVERLAY_KIT: boolean = overlayKitOn();

export const KIT_PATH = "/overlay-kit/";
export const KIT_GUIDE_PATH = "/overlay-kit/obs-setup/";
export const KIT_LIVE_PATH = "/overlay-kit/live/";
/** The streamerOS waitlist (pre-registration) on the root site. streamerOS is not released yet. */
export const STREAMEROS_WAITLIST = "https://streamerosai.com/download/";
