import Link from "next/link";
import { dateRange, monthGrid, monthLabel, type CalendarEntry } from "@/features/community/domain";
import { gameLabel, GAMES } from "@/features/shared/games";
import { SelectInput } from "@/features/shared/ui/Fields";
import { StatusBadge } from "@/features/shared/ui/States";
import { btnSecondary, focus, h3, link } from "@/features/shared/ui/styles";

/** Where an entry leads: its tournament page when that page is part of this build, otherwise the organiser's registration link. */
export function EntryLink({ e, known }: { e: CalendarEntry; known: ReadonlySet<string> }) {
  if (e.status === "cancelled") return null;
  if (e.tournamentSlug && known.has(e.tournamentSlug)) return <Link href={`/tournaments/${e.tournamentSlug}/`} className={link}>Tournament page and registration</Link>;
  if (e.registrationUrl) return <a href={e.registrationUrl} target="_blank" rel="nofollow ugc noopener noreferrer" className={link}>Register on the organiser&apos;s page<span className="sr-only"> (opens in a new tab)</span></a>;
  return <span className="text-sm text-zinc-400">Registration details come from the organiser.</span>;
}

export function EntryCard({ e, known }: { e: CalendarEntry; known: ReadonlySet<string> }) {
  return (
    <li className="border-t border-white/10 py-4">
      <p className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm tabular-nums text-zinc-300">{dateRange(e.startsOn, e.endsOn)}</span>
        <StatusBadge label={gameLabel(e.game)} tone="accent" />
        {e.status === "cancelled" && <StatusBadge label="Cancelled" tone="danger" />}
      </p>
      <h3 className={`${h3} mt-2`}>{e.title}</h3>
      <p className="mt-1 text-sm text-zinc-300">
        {e.online ? "Online" : e.city} · by{" "}
        {e.organiser.slug && known.has(`college:${e.organiser.slug}`) ? <Link href={`/colleges/${e.organiser.slug}/`} className={link}>{e.organiser.name}</Link> : e.organiser.name}
        {e.organiser.verified && <span className="text-success"> · Verified organiser</span>}
      </p>
      <p className="mt-2"><EntryLink e={e} known={known} /></p>
    </li>
  );
}

export function EntryList({ items, known, empty }: { items: readonly CalendarEntry[]; known: ReadonlySet<string>; empty: string }) {
  if (items.length === 0) return <p className="py-4 text-zinc-300">{empty}</p>;
  return <ul>{items.map((e) => <EntryCard key={e.id} e={e} known={known} />)}</ul>;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Month view: a real table (screen readers announce the day), titles on wider screens, a count on phones. The list below it carries the details. */
export function MonthTable({ ym, items }: { ym: string; items: readonly CalendarEntry[] }) {
  const weeks = monthGrid(ym, items);
  return (
    <table className="w-full table-fixed border-collapse text-left">
      <caption className="sr-only">Events in {monthLabel(ym)}</caption>
      <thead>
        <tr>{WEEKDAYS.map((d) => <th key={d} scope="col" className="pb-2 text-xs font-medium text-zinc-400">{d}</th>)}</tr>
      </thead>
      <tbody>
        {weeks.map((w, i) => (
          <tr key={i}>
            {w.map((c, j) => (
              <td key={j} className="h-20 border border-white/10 p-1 align-top">
                {c.day && (
                  <>
                    <span className="font-mono text-xs tabular-nums text-zinc-400">{Number(c.day.slice(8, 10))}</span>
                    {c.entries.length > 0 && <span className="mt-1 block text-xs font-semibold text-cyan-400 sm:hidden">{c.entries.length}<span className="sr-only"> {c.entries.length === 1 ? "event" : "events"}</span></span>}
                    <ul className="mt-1 hidden space-y-1 sm:block">
                      {c.entries.slice(0, 2).map((e) => <li key={e.id} className={`truncate text-xs ${e.status === "cancelled" ? "text-zinc-400 line-through" : "text-zinc-100"}`}>{e.title}</li>)}
                      {c.entries.length > 2 && <li className="text-xs text-zinc-400">+{c.entries.length - 2} more</li>}
                    </ul>
                  </>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function CalendarFiltersBar({ game, city, cities, onGame, onCity, onClear }: { game: string; city: string; cities: readonly string[]; onGame: (v: string) => void; onCity: (v: string) => void; onClear: () => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
      <SelectInput id="cal-game" label="Game" value={game} onChange={onGame} options={GAMES} blank="All games" />
      <SelectInput id="cal-city" label="City" value={city} onChange={onCity} options={cities.map((c) => ({ value: c, label: c }))} blank="All cities" />
      <div>{(game || city) && <button type="button" onClick={onClear} className={btnSecondary}>Clear filters</button>}</div>
    </div>
  );
}

export function ViewSwitch({ view, onView }: { view: "list" | "month"; onView: (v: "list" | "month") => void }) {
  const b = (v: "list" | "month", text: string) => (
    <button type="button" aria-pressed={view === v} onClick={() => onView(v)} className={`min-h-11 rounded-lg border px-4 text-sm ${view === v ? "border-cyan-400 text-cyan-400" : "border-white/10 text-zinc-300 hover:border-white/30"} ${focus}`}>{text}</button>
  );
  return <div role="group" aria-label="Calendar view" className="flex gap-2">{b("list", "List")}{b("month", "Month")}</div>;
}
