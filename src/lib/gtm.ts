/** Google Tag Manager container for the public site (it holds the Google Analytics 4 tag). */
export const GTM_ID = "GTM-MD3J4FKT";

/** Microsoft Clarity project (page heat maps and session replays). Loaded by the same gated loader as Tag Manager, so only on public marketing pages and never for Do Not Track or Global Privacy Control. */
export const CLARITY_ID = "zc6l88ze13";

/** Public marketing pages only. Everything else (the app, sign-in, live/score/report/ready/run/overlay/embed/display, passes, unsubscribe, join, register, teams, leagues) is excluded because those addresses can hold private links or belong to signed-in people. */
const ALLOWED = ["/", "/tools", "/guides", "/compare", "/about", "/contact", "/privacy", "/terms", "/points-table"];

export function gtmAllowed(pathname: string): boolean {
  const p = (pathname || "/").replace(/\/+$/, "") || "/";
  return ALLOWED.some((a) => (a === "/" ? p === "/" : p === a || p.startsWith(a + "/")));
}

/**
 * The loader, written into the page head at build time so Google's tag checker can see it in the HTML.
 * It applies the same rules as gtmAllowed() and the privacy opt-outs before it loads anything.
 */
export const GTM_BOOT = `(function(){try{var a=${JSON.stringify(ALLOWED)},p=location.pathname.replace(/[/]+$/,"")||"/";var ok=a.some(function(x){return x==="/"?p==="/":p===x||p.indexOf(x+"/")===0});var n=navigator;if(!ok||n.doNotTrack==="1"||window.doNotTrack==="1"||n.msDoNotTrack==="1"||n.globalPrivacyControl===true)return;window.__gtmOn=true;window.dataLayer=window.dataLayer||[];window.dataLayer.push({"gtm.start":Date.now(),event:"gtm.js"});var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtm.js?id=${GTM_ID}";document.head.appendChild(s);window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments)};var c=document.createElement("script");c.async=true;c.src="https://www.clarity.ms/tag/${CLARITY_ID}?ref=bwt";document.head.appendChild(c)}catch(e){}})();`;
