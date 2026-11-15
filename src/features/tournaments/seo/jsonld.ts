/**
 * The ONE place tournament structured data is built (CLAUDE.md: never hand-write JSON-LD in a page). Pure.
 * Returns null unless the page is indexable, so a thin, held-back, draft or cancelled page can never carry `SportsEvent`.
 */
import type { TournamentDetail } from "@/features/tournaments/domain";

export interface JsonLdContext {
  /** The verdict from `judgePages`: false for a thin page, a page the API did not mark ready, or one held back by the weekly cap. */
  indexable: boolean;
  /** Absolute canonical URL of the page. */
  url: string;
  /** Absolute URL of the Open Graph card. */
  image: string;
  siteUrl: string;
}

const ATTENDANCE = { online: "https://schema.org/OnlineEventAttendanceMode", offline: "https://schema.org/OfflineEventAttendanceMode", hybrid: "https://schema.org/MixedEventAttendanceMode" } as const;
const NOT_SCHEMA_STATUS = new Set(["draft", "cancelled"]);

export function sportsEventJsonLd(t: TournamentDetail, ctx: JsonLdContext): object | null {
  if (!ctx.indexable || NOT_SCHEMA_STATUS.has(t.status) || !t.startsAt || !t.venue || !t.description) return null;
  const virtual = { "@type": "VirtualLocation", url: ctx.url };
  const place = { "@type": "Place", name: t.city ?? "Venue", address: { "@type": "PostalAddress", ...(t.city ? { addressLocality: t.city } : {}), ...(t.state ? { addressRegion: t.state } : {}), addressCountry: "IN" } };
  const location = t.venue === "online" ? virtual : t.venue === "offline" ? place : [place, virtual];
  return {
    "@context": "https://schema.org", "@type": "SportsEvent",
    name: t.title, description: t.summary ?? t.description.slice(0, 300), startDate: t.startsAt, ...(t.endsAt ? { endDate: t.endsAt } : {}),
    eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: ATTENDANCE[t.venue], location,
    url: ctx.url, image: ctx.image, inLanguage: "en-IN",
    isAccessibleForFree: true,
  };
}

export function breadcrumbJsonLd(siteUrl: string, name: string, url: string): object {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Tournaments", item: `${siteUrl}/tournaments/` },
    { "@type": "ListItem", position: 3, name, item: url },
  ] };
}
