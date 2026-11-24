"use client";

import { useMemo } from "react";
import { monthLabel, type CalendarEntry } from "@/features/community/domain";
import { useCalendar } from "@/features/community/hooks/useCalendar";
import { CalendarFiltersBar, EntryList, MonthTable, ViewSwitch } from "@/features/community/ui/CalendarParts";
import { EmptyState } from "@/features/shared/ui/States";
import { btnPrimary, btnSecondary, h2, section } from "@/features/shared/ui/styles";

/**
 * The interactive part of /calendar/. `initial` is what the build fetched (rendered in the HTML, so the list is there at first paint);
 * `known` holds the tournament slugs (and `college:<slug>` keys) that have a page in this build, so the calendar never links to a missing page.
 */
export default function CalendarScreen({ initial, today, known }: { initial: CalendarEntry[]; today: string; known: string[] }) {
  const c = useCalendar(initial, today);
  const knownSet = useMemo(() => new Set(known), [known]);
  return (
    <section className={section} aria-labelledby="cal-h">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="cal-h" className={h2}>Upcoming events</h2>
        <ViewSwitch view={c.view} onView={c.setView} />
      </div>
      <div className="mt-4"><CalendarFiltersBar game={c.filters.game} city={c.filters.city} cities={c.cities} onGame={c.setGame} onCity={c.setCity} onClear={c.clear} /></div>
      {c.error && <p role="alert" className="mt-4 text-sm text-danger"><span aria-hidden="true">! </span>Could not refresh the calendar: {c.error} The list below is from the last update.</p>}
      <p className="sr-only" aria-live="polite">{c.refreshing ? "" : `${c.filtered.length} ${c.filtered.length === 1 ? "event" : "events"} shown`}</p>
      {c.view === "list" ? (
        <div className="mt-4">{c.items.length === 0
          ? <EmptyState title="Nothing listed yet" body="No upcoming events are listed yet. Running a college or fest tournament? Verified organisers list events here for free."
              action={<a href="#list-cal" className={btnPrimary}>List your college event</a>} />
          : <EntryList items={c.filtered} known={knownSet} empty="No event matches these filters. Clear them to see every event." />}</div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={c.prevMonth} disabled={!c.canGoBack} className={btnSecondary}>Previous<span className="sr-only"> month</span></button>
            <p className="font-display text-lg text-zinc-100" aria-live="polite">{monthLabel(c.month)}</p>
            <button type="button" onClick={c.nextMonth} className={btnSecondary}>Next<span className="sr-only"> month</span></button>
          </div>
          <MonthTable ym={c.month} items={c.monthItems} />
          <EntryList items={c.monthItems} known={knownSet} empty={`No event is listed for ${monthLabel(c.month)}.`} />
        </div>
      )}
    </section>
  );
}
