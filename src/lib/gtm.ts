/** Google Tag Manager container for the public site (it holds the Google Analytics 4 tag). */
export const GTM_ID = "GTM-MD3J4FKT";

/** Microsoft Clarity project (page heat maps and session replays). Loaded by the same gated loader as Tag Manager, so only on public marketing pages and never for Do Not Track or Global Privacy Control. */
export const CLARITY_ID = "zc6l88ze13";

/** The tags load only on the real website. Local runs, previews and automated tests must never send hits to the owner's analytics (a test run once added 2,800 fake page views). */
export const TAG_HOSTS = ["esports.streamerosai.com"];

/** Public marketing pages only. Everything else (the app, sign-in, live/score/report/ready/run/overlay/embed/display, passes, unsubscribe, join, register, teams, leagues) is excluded because those addresses can hold private links or belong to signed-in people. */
const ALLOWED = ["/", "/tools", "/guides", "/compare", "/about", "/contact", "/privacy", "/terms", "/points-table"];

/** True only on the real website. The page-header loader checks this inline; the React loader (GoogleTag) must check it too, or local runs and tests count as visitors. */
export function tagHostAllowed(hostname: string): boolean {
  return TAG_HOSTS.includes((hostname || "").toLowerCase());
}

export function gtmAllowed(pathname: string): boolean {
  const p = (pathname || "/").replace(/\/+$/, "") || "/";
  return ALLOWED.some((a) => (a === "/" ? p === "/" : p === a || p.startsWith(a + "/")));
}

/**
 * The loader, written into the page head at build time so Google's tag checker can see it in the HTML.
 * It applies the same rules as gtmAllowed() and the privacy opt-outs, and it checks them again at the moment it loads.
 *
 * Speed: Tag Manager and Clarity are about 230 KB and a second of work for a phone, so they no longer compete with the
 * page for its first seconds. They load on the visitor's first scroll, tap, key press or pointer press, or 4 seconds after
 * the page has finished loading, whichever comes first. window.__gtmArm() starts that wait (the React loader, GoogleTag,
 * calls it after a move into a public page); window.__gtmOn is true once the tags have really been requested.
 */
export const GTM_BOOT = `(function(){try{var H=${JSON.stringify(TAG_HOSTS)},A=${JSON.stringify(ALLOWED)},n=navigator,w=window,d=document,E=["pointerdown","keydown","scroll","touchstart"],armed=false;function ok(){var p=location.pathname.replace(/[/]+$/,"")||"/";return H.indexOf(location.hostname)>=0&&A.some(function(x){return x==="/"?p==="/":p===x||p.indexOf(x+"/")===0})&&n.doNotTrack!=="1"&&w.doNotTrack!=="1"&&n.msDoNotTrack!=="1"&&n.globalPrivacyControl!==true}function go(){E.forEach(function(e){w.removeEventListener(e,go)});armed=false;if(w.__gtmOn||!ok())return;w.__gtmOn=true;w.dataLayer=w.dataLayer||[];w.dataLayer.push({"gtm.start":Date.now(),event:"gtm.js"});var s=d.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtm.js?id=${GTM_ID}";d.head.appendChild(s);w.clarity=w.clarity||function(){(w.clarity.q=w.clarity.q||[]).push(arguments)};var c=d.createElement("script");c.async=true;c.src="https://www.clarity.ms/tag/${CLARITY_ID}?ref=bwt";d.head.appendChild(c)}function arm(){if(armed||w.__gtmOn||!ok())return;armed=true;E.forEach(function(e){w.addEventListener(e,go,{passive:true,once:true})});function t(){setTimeout(go,4000)}if(d.readyState==="complete")t();else w.addEventListener("load",t,{once:true})}w.__gtmArm=arm;arm()}catch(e){}})();`;
