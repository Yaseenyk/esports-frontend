"use client";

import { useEffect, useMemo, useState } from "react";
import { pickFeed, pickPlayers, type KitFeed, type KitPlayers, type KitSnapshot, type KitSource } from "@/features/overlay-kit/domain";
import { readFeeds, readPlayers, subscribe } from "@/features/overlay-kit/services/kit-store";

const EMPTY: KitSnapshot = { feed: null, players: null };

/**
 * The overlay side: the newest standings and player kills in this browser, followed live. A snapshot from the link (for an OBS that runs
 * in another browser than the tool) is used until newer live data arrives.
 */
export function useKitFeed(src: KitSource | "auto" = "auto", snapshot: KitSnapshot = EMPTY) {
  const [feeds, setFeeds] = useState<Partial<Record<KitSource, KitFeed>>>({});
  const [live, setLive] = useState<KitPlayers | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const putFeed = (f: KitFeed) => setFeeds((o) => { const was = o[f.source]; return was && was.at >= f.at ? o : { ...o, [f.source]: f }; });
    const putPlayers = (p: KitPlayers) => setLive((o) => (o && o.at >= p.at ? o : p));
    readFeeds().forEach(putFeed);
    const p = readPlayers(); if (p) putPlayers(p);
    setReady(true);
    return subscribe({ feed: putFeed, players: putPlayers });
  }, []);

  const all = useMemo(() => Object.values(feeds).filter((f): f is KitFeed => !!f).sort((a, b) => b.at - a.at), [feeds]);
  const feed = useMemo(() => pickFeed([...all, snapshot.feed], src), [all, snapshot.feed, src]);
  const players = useMemo(() => pickPlayers([live, snapshot.players]), [live, snapshot.players]);
  return { feed, players, feeds: all, ready };
}
