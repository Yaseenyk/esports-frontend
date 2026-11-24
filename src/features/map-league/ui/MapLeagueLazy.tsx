"use client";

import dynamic from "next/dynamic";

/**
 * The map league tool, rendered in the browser only, like the points table (see PointsTableLazy): with no server HTML for the tool,
 * a browser translator that rewrites the page before React starts has nothing to change under React. The page text, FAQ and structured
 * data around it stay in the static HTML. The placeholder holds the tool's usual height so nothing below it jumps.
 */
const MapLeagueTool = dynamic(() => import("@/features/map-league/ui/MapLeagueTool"), {
  ssr: false,
  loading: () => <div className="card min-h-screen" data-ph="map-league" aria-busy="true" />,
});

export default function MapLeagueLazy({ path, game }: { path: string; game?: string }) {
  return <MapLeagueTool path={path} game={game} />;
}
