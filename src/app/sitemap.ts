import type { MetadataRoute } from "next";
import { COMMUNITIES, EVENTS, GAMES } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** Every public page, for search engines. The app (/app), the gate scanner (/gate) and the invite and pass pages are left out on purpose. */
export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string, priority: number) => ({ url: `${SITE_URL}${path}`, priority });
  return [
    at("/", 1), at("/games/", 0.8), at("/events/", 0.8), at("/communities/", 0.7), at("/guides/", 0.7), at("/tools/", 0.8),
    at("/tools/id-cards/", 0.9), at("/tools/check-in/", 0.9), at("/tools/brackets/", 0.7), at("/signup/", 0.5), at("/login/", 0.3),
    ...GAMES.map((g) => at(`/games/${g.slug}/`, 0.6)),
    ...EVENTS.map((e) => at(`/events/${e.slug}/`, 0.5)),
    ...COMMUNITIES.map((c) => at(`/communities/${c.slug}/`, 0.5)),
  ];
}
