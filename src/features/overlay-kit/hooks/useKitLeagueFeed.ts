"use client";

import { useMemo } from "react";
import type { MapLeagueRow } from "@/features/map-league/domain";
import { feedFromMapLeague, type KitFeed } from "@/features/overlay-kit/domain";

/** The Valorant league table as an overlay kit feed. Null rows (tool not ready, or the kit flag off) give no feed. */
export function useKitLeagueFeed(rows: MapLeagueRow[] | null): KitFeed | null {
  return useMemo(() => (rows && rows.length ? feedFromMapLeague(rows, { source: "valorant" }) : null), [rows]);
}
