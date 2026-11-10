export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esports.streamerosai.com";
/** The website is open to search engines. Set NEXT_PUBLIC_INDEXABLE=0 at build time to close it again. */
export const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE !== "0";
