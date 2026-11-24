"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { explainFailure } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import { filterItems, type DirectoryData, type DirectoryFilters } from "@/features/directory/domain";
import { fetchDirectory, fetchSetting, putSetting } from "@/features/directory/services/directory.api";

const EMPTY: DirectoryFilters = { game: "", city: "" };

/** The directory island: starts from the build-time list (visible at first paint), filters in the query string, then refreshes from the live API. */
export function useDirectory(initial: DirectoryData) {
  const [filters, setFiltersState] = useState<DirectoryFilters>(EMPTY);
  const [data, setData] = useState<DirectoryData>(initial);
  const [live, setLive] = useState(false);
  const run = useRef(0);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setFiltersState({ game: (p.get("game") ?? "").slice(0, 20), city: (p.get("city") ?? "").slice(0, 60) });
  }, []);
  const load = useCallback(async (f: DirectoryFilters) => {
    const id = ++run.current;
    const r = await fetchDirectory(f);
    if (id !== run.current) return;
    if (r.ok) { setData(r.data); setLive(true); } // an error keeps the build-time list: it is still true as of the last site update
  }, []);
  useEffect(() => { void load(filters); }, [filters, load]);
  const setFilters = useCallback((f: DirectoryFilters) => {
    setFiltersState(f);
    const p = new URLSearchParams();
    if (f.game) p.set("game", f.game);
    if (f.city.trim()) p.set("city", f.city.trim());
    const s = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${s ? `?${s}` : ""}`);
  }, []);
  // Until the live answer arrives, filter the build-time list in place so a shared link opens already filtered.
  const items = live ? data.items : filterItems(data.items, filters);
  return { filters, setFilters, clear: () => setFilters(EMPTY), filtered: !!(filters.game || filters.city.trim()), items, cities: data.cities, games: data.games, live };
}

/** The organiser's "show the sign-up link on the directory" switch. Renders nothing while v3.directory is off (404). */
export function useDirectorySetting(eventId: string) {
  const res = useResource(() => fetchSetting(eventId), [eventId]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const toggle = async (on: boolean) => {
    setBusy(true); setError("");
    const r = await putSetting(eventId, on);
    setBusy(false);
    if (r.ok) res.reload(); else setError(explainFailure(r.failure));
  };
  return { res, busy, error, toggle };
}
