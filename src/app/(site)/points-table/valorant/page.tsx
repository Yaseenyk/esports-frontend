import type { Metadata } from "next";
import ToolLanding from "@/components/seo/ToolLanding";
import { leagueRules } from "@/features/tool-trust/domain";
import MapLeague from "@/features/map-league/ui/MapLeagueLazy";
import { VALORANT_PAGE as t } from "@/lib/game-pages";
import { pageTitle } from "@/lib/schema";

export const metadata: Metadata = {
  title: pageTitle(t.title), description: t.description, alternates: { canonical: t.path },
  openGraph: { title: t.title, description: t.description, url: t.path, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

/** /points-table/valorant/: a league table (wins, maps, rounds), because Valorant is 5v5 match play, not a battle royale. */
export default function Page() {
  return <ToolLanding t={t} trust={{ rules: leagueRules("Valorant") }}><MapLeague path={t.path} game="Valorant" /></ToolLanding>;
}
