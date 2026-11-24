"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, decodeSettings, type KitSettings, type KitSnapshot } from "@/features/overlay-kit/domain";

/** The overlay's settings and optional data snapshot, read from the link's # part, and again whenever it changes (OBS or the preview). */
export function useOverlaySettings(): { settings: KitSettings; snapshot: KitSnapshot; ready: boolean } {
  const [state, setState] = useState<{ settings: KitSettings; snapshot: KitSnapshot; ready: boolean }>({ settings: DEFAULT_SETTINGS, snapshot: { feed: null, players: null }, ready: false });
  useEffect(() => {
    const read = () => setState({ ...decodeSettings(location.hash), ready: true });
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return state;
}
