"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_SETTINGS, KILLS_MAX, exampleFeed, kitUrl, pickFeed, sanitizePlayers,
  type KitArea, type KitPlayer, type KitSettings, type KitSource, type KitView,
} from "@/features/overlay-kit/domain";
import { clearPlayers, publishPlayers } from "@/features/overlay-kit/services/kit-store";
import { useKitFeed } from "@/features/overlay-kit/hooks/useKitFeed";

export interface Look { theme: string; safe: number; scale: number; src: KitSource | "auto" }
export interface ViewConfig { n: number; area: KitArea; team: string }
const START: Record<KitView, ViewConfig> = { points: { n: 0, area: "full", team: "" }, fraggers: { n: 0, area: "right", team: "" }, cards: { n: 0, area: "bottom", team: "" } };
const killsOf = (v: string) => { const n = Math.floor(Number(v.replace(/\D/g, "").slice(0, 4))); return Number.isFinite(n) ? Math.min(n, KILLS_MAX) : 0; };

/**
 * State for the overlay kit page: the shared look, each overlay's own options, the OBS links, the live preview and the player kill list.
 * The player kills are saved in this browser and sent to the overlay as they are typed.
 */
export function useKitPanel() {
  const { feed, players, feeds, ready } = useKitFeed("auto");
  const [look, setLook] = useState<Look>({ theme: DEFAULT_SETTINGS.theme, safe: DEFAULT_SETTINGS.safe, scale: 1, src: "auto" });
  const [views, setViews] = useState<Record<KitView, ViewConfig>>(START);
  const [withData, setWithData] = useState(true);
  const [origin, setOrigin] = useState("");
  const [preview, setPreview] = useState<KitView>("points");
  const [rows, setRows] = useState<KitPlayer[]>([]);
  const loaded = useRef(false);

  useEffect(() => { setOrigin(location.origin); }, []);
  // The saved player list fills the editor once; after that the editor is the source.
  useEffect(() => { if (ready && !loaded.current) { loaded.current = true; if (players?.players.length) setRows(players.players); } }, [ready, players]);

  const chosen = useMemo(() => pickFeed(feeds, look.src), [feeds, look.src]);
  const settingsFor = useCallback((view: KitView): KitSettings => ({ ...DEFAULT_SETTINGS, ...look, view, ...views[view] }), [look, views]);
  const urlFor = useCallback((view: KitView) => (origin ? kitUrl(origin, settingsFor(view), withData ? { feed: chosen, players } : undefined) : ""), [origin, settingsFor, withData, chosen, players]);
  /**
   * The preview follows the live data, so it carries settings only. With no table in this browser yet it carries the labelled example
   * instead, so the frame is never an empty box. The example lives only in this preview link: it is not saved, not broadcast to the
   * overlay channel and never part of a copied OBS link (urlFor uses the real table only).
   */
  const example = ready && !chosen;
  const previewUrl = origin ? kitUrl(origin, settingsFor(preview), example ? { feed: exampleFeed(look.src === "auto" ? "points-table" : look.src), players: null } : undefined) : "";

  const setView = (view: KitView, patch: Partial<ViewConfig>) => setViews((o) => ({ ...o, [view]: { ...o[view], ...patch } }));
  const copy = useCallback(async (view: KitView): Promise<boolean> => {
    try {
      const u = urlFor(view);
      if (!u || !navigator.clipboard) return false;
      // A browser that waits on a permission prompt must not leave the button hanging: give up after 3 seconds (the URL box stays selectable).
      await Promise.race([navigator.clipboard.writeText(u), new Promise((_, no) => setTimeout(() => no(new Error("timeout")), 3000))]);
      return true;
    } catch { return false; }
  }, [urlFor]);

  const savePlayers = (next: KitPlayer[]) => {
    setRows(next);
    const clean = sanitizePlayers({ v: 1, players: next, at: Date.now() });
    if (clean && clean.players.length) publishPlayers(clean); else clearPlayers();
  };
  const addPlayer = () => savePlayers([...rows, { name: "", team: "", kills: 0 }]);
  const setPlayer = (i: number, patch: { name?: string; team?: string; kills?: string }) =>
    savePlayers(rows.map((r, j) => (j === i ? { ...r, ...(patch.name !== undefined ? { name: patch.name } : null), ...(patch.team !== undefined ? { team: patch.team } : null), ...(patch.kills !== undefined ? { kills: killsOf(patch.kills) } : null) } : r)));
  const removePlayer = (i: number) => savePlayers(rows.filter((_, j) => j !== i));

  return { feed, chosen, feeds, ready, look, setLook, views, setView, withData, setWithData, urlFor, copy, preview, setPreview, previewUrl, example, rows, addPlayer, setPlayer, removePlayer, clearAll: () => savePlayers([]) };
}
