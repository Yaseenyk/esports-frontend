"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_FILTERS, type BoardFilters, type Listing } from "@/features/lft/domain";
import { filtersToSearch, hasAnyFilter, parseFilters } from "@/features/lft/filters";
import { fetchBoard } from "@/features/lft/services/lft.api";
import type { V3Failure } from "@/features/shared/failure";

export type BoardPhase = "loading" | "ready" | "unavailable" | "error";

/** The board: filters live in the query string (shareable, back button friendly), the list is fetched by cursor. */
export function useLftBoard() {
  const [filters, setFiltersState] = useState<BoardFilters>(EMPTY_FILTERS);
  const [items, setItems] = useState<Listing[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [phase, setPhase] = useState<BoardPhase>("loading");
  const [skeleton, setSkeleton] = useState(false);
  const [failure, setFailure] = useState<V3Failure | null>(null);
  const [more, setMore] = useState(false);
  const [started, setStarted] = useState(false);
  const run = useRef(0);

  useEffect(() => { setFiltersState(parseFilters(window.location.search)); setStarted(true); }, []);

  const load = useCallback(async (f: BoardFilters) => {
    const id = ++run.current;
    setPhase("loading"); setSkeleton(false);
    const timer = setTimeout(() => id === run.current && setSkeleton(true), 180);
    const r = await fetchBoard(f);
    clearTimeout(timer);
    if (id !== run.current) return;
    if (r.ok) { setItems(r.data.items); setCursor(r.data.nextCursor); setPhase("ready"); setFailure(null); }
    else if (r.failure.kind === "unavailable") setPhase("unavailable");
    else { setFailure(r.failure); setPhase("error"); }
  }, []);

  useEffect(() => { if (started) void load(filters); }, [started, filters, load]);

  const setFilters = useCallback((next: BoardFilters) => {
    setFiltersState(next);
    window.history.replaceState(null, "", `${window.location.pathname}${filtersToSearch(next)}`);
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor || more) return;
    setMore(true);
    const r = await fetchBoard(filters, cursor);
    setMore(false);
    if (r.ok) { setItems((cur) => [...cur, ...r.data.items.filter((n) => !cur.some((c) => c.id === n.id))]); setCursor(r.data.nextCursor); }
    else setFailure(r.failure);
  }, [cursor, more, filters]);

  return { filters, setFilters, clear: () => setFilters(EMPTY_FILTERS), filtered: hasAnyFilter(filters), items, phase, skeleton, failure, hasMore: cursor !== null, loadMore, loadingMore: more, retry: () => load(filters) };
}
