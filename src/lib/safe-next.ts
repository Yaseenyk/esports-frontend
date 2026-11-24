/** After sign-in only a path inside the app is accepted as the return address, so a crafted link cannot send someone to another site. */
export const safeNext = (n: string | null): string => (n && /^\/app\/[A-Za-z0-9\-_/?=&%.]*$/.test(n) && !n.includes("//") && !n.includes("..") ? n : "/app/");

/**
 * The return address for a screen: its path plus its query (`/app/recap/?id=1`), so an event id survives the trip through sign-in.
 * Anything safeNext would refuse falls back to the app home, so the link never carries an address it would later drop.
 */
export const returnTo = (path: string, search = ""): string => safeNext(`${path}${search && search !== "?" ? (search.startsWith("?") ? search : `?${search}`) : ""}`);

/** The sign-in (or free sign-up) page that brings someone back to `next` afterwards. */
export const authHref = (page: "login" | "signup", next: string, expired = false): string =>
  `/${page}/?next=${encodeURIComponent(safeNext(next))}${expired ? "&expired=1" : ""}`;
