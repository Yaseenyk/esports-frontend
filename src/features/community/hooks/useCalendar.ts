"use client";

import { useEffect, useMemo, useState } from "react";
import { addMonths, citiesOf, filterEntries, inMonth, monthOf, NO_FILTERS, type CalendarEntry, type CalendarFilters } from "@/features/community/domain";
import { fetchCalendar } from "@/features/community/services/community.api";
import { explainFailure } from "@/features/shared/failure";

export type CalendarView = "list" | "month";

/**
 * The public calendar: starts from the entries the build shipped (visible at first paint, no skeleton), then refreshes once from the API.
 * Filters (game, city) and the month are local state; the API returns every upcoming entry in one read.
 */
export function useCalendar(initial: readonly CalendarEntry[], today: string) {
  const [items, setItems] = useState<CalendarEntry[]>([...initial]);
  const [filters, setFilters] = useState<CalendarFilters>(NO_FILTERS);
  const [view, setView] = useState<CalendarView>("list");
  const [month, setMonth] = useState<string>(monthOf(today));
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    let live = true;
    fetchCalendar().then((r) => {
      if (!live) return;
      setRefreshing(false);
      if (r.ok) { setItems(r.data.items); setError(""); }
      else if (r.failure.kind !== "unavailable") setError(explainFailure(r.failure));
    });
    return () => { live = false; };
  }, []);

  const filtered = useMemo(() => filterEntries(items, filters), [items, filters]);
  const cities = useMemo(() => citiesOf(items), [items]);
  const monthItems = useMemo(() => inMonth(filtered, month), [filtered, month]);
  const thisMonth = monthOf(today);

  return {
    items, filtered, cities, filters, view, month, monthItems, error, refreshing,
    setGame: (game: string) => setFilters((f) => ({ ...f, game })),
    setCity: (city: string) => setFilters((f) => ({ ...f, city })),
    clear: () => setFilters(NO_FILTERS),
    setView,
    canGoBack: month > thisMonth,
    prevMonth: () => setMonth((m) => (m > thisMonth ? addMonths(m, -1) : m)),
    nextMonth: () => setMonth((m) => addMonths(m, 1)),
  };
}
