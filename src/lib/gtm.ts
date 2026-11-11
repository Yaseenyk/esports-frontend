/** Google Tag Manager container for the public site (it holds the Google Analytics 4 tag). */
export const GTM_ID = "GTM-MD3J4FKT";

/** Public marketing pages only. Everything else (the app, sign-in, live/score/report/ready/run/overlay/embed/display, passes, unsubscribe, join, register, teams, leagues) is excluded because those addresses can hold private links or belong to signed-in people. */
const ALLOWED = ["/", "/tools", "/guides", "/compare", "/about", "/contact", "/privacy", "/terms", "/points-table"];

export function gtmAllowed(pathname: string): boolean {
  const p = (pathname || "/").replace(/\/+$/, "") || "/";
  return ALLOWED.some((a) => (a === "/" ? p === "/" : p === a || p.startsWith(a + "/")));
}
