"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_FILTERS, EMPTY_WANTS, type BoardFilters, type Listing, type MatchWants } from "@/features/lft/domain";
import { filtersToSearch, hasAnyFilter, parseFilters, parseWants } from "@/features/lft/filters";
import { fetchBoard } from "@/features/lft/services/lft.api";
import type { V3Failure } from "@/features/shared/failure";

/** "What I look for" stays in this browser only (it is never sent except as the ranking query of the board). */
const WANTS_KEY = "eh_lft_wants_v1";
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
  const [wants, setWantsState] = useState<MatchWants>(EMPTY_WANTS);

  useEffect(() => {
    setFiltersState(parseFilters(window.location.search));
    try { setWantsState(parseWants(localStorage.getItem(WANTS_KEY))); } catch { /* storage blocked: start empty */ }
    setStarted(true);
  }, []);

  const load = useCallback(async (f: BoardFilters, w: MatchWants) => {
    const id = ++run.current;
    setPhase("loading"); setSkeleton(false);
    const timer = setTimeout(() => id === run.current && setSkeleton(true), 180);
    const r = await fetchBoard(f, null, w);
    clearTimeout(timer);
    if (id !== run.current) return;
    if (r.ok) { setItems(r.data.items); setCursor(r.data.nextCursor); setPhase("ready"); setFailure(null); }
    else if (r.failure.kind === "unavailable") setPhase("unavailable");
    else { setFailure(r.failure); setPhase("error"); }
  }, []);

  useEffect(() => { if (started) void load(filters, wants); }, [started, filters, wants, load]);
  const setWants = useCallback((w: MatchWants) => { setWantsState(w); try { localStorage.setItem(WANTS_KEY, JSON.stringify(w)); } catch { /* not remembered */ } }, []);

  const setFilters = useCallback((next: BoardFilters) => {
    setFiltersState(next);
    window.history.replaceState(null, "", `${window.location.pathname}${filtersToSearch(next)}`);
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor || more) return;
    setMore(true);
    const r = await fetchBoard(filters, cursor, wants);
    setMore(false);
    if (r.ok) { setItems((cur) => [...cur, ...r.data.items.filter((n) => !cur.some((c) => c.id === n.id))]); setCursor(r.data.nextCursor); }
    else setFailure(r.failure);
  }, [cursor, more, filters, wants]);

  return { filters, setFilters, clear: () => setFilters(EMPTY_FILTERS), filtered: hasAnyFilter(filters), items, phase, skeleton, failure, hasMore: cursor !== null, loadMore, loadingMore: more, retry: () => load(filters, wants), wants, setWants };
}
