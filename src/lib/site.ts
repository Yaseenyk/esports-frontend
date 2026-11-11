export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esports.streamerosai.com";
/** The website is open to search engines. Set NEXT_PUBLIC_INDEXABLE=0 at build time to close it again. */
export const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE !== "0";
/** The one Organization entity. Pages point at it by id instead of repeating the whole object. */
export const ORG_ID = `${SITE_URL}/#org`;
