/**
 * The one place the site's entity ids and shared structured-data nodes are built. Pages call these helpers instead of writing
 * Organization, Person or SoftwareApplication objects by hand, so every page points at the same ids.
 *
 * - The Person (Yaseen Khatib) belongs to the portfolio, https://yk.streamerosai.com, which publishes the full node under PERSON_ID.
 *   This site only references it by @id (with the name and url as a label). It never repeats the job title, address or profiles, which would drift.
 * - The Organization is Esports Hub itself (ORG_ID). Its sameAs lists only profiles the owner really controls.
 */
import { SITE_DESCRIPTION } from "@/lib/facts";
import { ORG_ID, SITE_URL } from "@/lib/site";

export const PERSON_ID = "https://yk.streamerosai.com/#person";
export const PERSON_NAME = "Yaseen Khatib";
export const PERSON_URL = "https://yk.streamerosai.com/";

/** A reference to the portfolio's Person node: the @id plus a name and url label. Never a full Person. */
export const personRef = () => ({ "@type": "Person", "@id": PERSON_ID, name: PERSON_NAME, url: PERSON_URL });

/** Profiles that are the same thing as Esports Hub: the site's public source repository (it builds and deploys this site). */
export const ORG_SAME_AS = ["https://github.com/Yaseenyk/esports-frontend"] as const;

/** The Organization node, emitted once per page by the (site) and (pt) layouts. */
export const organizationJsonLd = () => ({
  "@context": "https://schema.org", "@type": "Organization", "@id": ORG_ID, name: "Esports Hub", url: SITE_URL, description: SITE_DESCRIPTION,
  logo: `${SITE_URL}/icon-512.png`, founder: { "@id": PERSON_ID }, sameAs: [...ORG_SAME_AS],
});

/** A free browser tool. Always carries @id (<url>#app), the Organization as publisher and the Person as author and creator. */
export function softwareAppJsonLd(a: { url: string; name: string; description: string; inLanguage: string; featureList?: string[]; category?: string }) {
  return {
    "@context": "https://schema.org", "@type": "SoftwareApplication", "@id": `${a.url}#app`, name: a.name, applicationCategory: a.category ?? "UtilitiesApplication",
    operatingSystem: "Web", url: a.url, description: a.description, inLanguage: a.inLanguage, isAccessibleForFree: true,
    browserRequirements: "Requires JavaScript. Works in any current browser.", ...(a.featureList?.length ? { featureList: a.featureList } : {}),
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    author: { "@id": PERSON_ID }, creator: { "@id": PERSON_ID }, publisher: { "@id": ORG_ID },
  };
}

/** What the root layout's title template appends to every page title. */
export const TITLE_SUFFIX = " · Esports Hub";
/** Google shows about 60 characters of a title. */
export const TITLE_MAX = 60;

/**
 * A page title that stays within TITLE_MAX: the brand suffix is added only when it fits, otherwise the title is used as it is
 * (`{ absolute }` skips the layout template). Use it in every `metadata.title` and `generateMetadata` on an indexable page.
 */
export const pageTitle = (t: string): string | { absolute: string } => (t.length + TITLE_SUFFIX.length > TITLE_MAX ? { absolute: t } : t);
