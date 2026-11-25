import type { Metadata } from "next";
import { loadBuildColleges } from "@/features/colleges/college";
import { loadBuildCalendar, PRUNE_MARKER_ID } from "@/features/community/services/build-data";
import { calendarIndexable, countUpcoming, MIN_UPCOMING_FOR_INDEX, todayIst } from "@/features/community/seo";
import type { CalendarEntry } from "@/features/community/domain";
import CalendarScreen from "@/features/community/ui/CalendarScreen";
import { loadBuildTournaments } from "@/features/tournaments/services/build-data";
import { h1, h2, link, section } from "@/features/shared/ui/styles";
import { pageTitle } from "@/lib/schema";

/**
 * /calendar/: college and fest esports events listed by VERIFIED organisations. Built from the public API at build time and refreshed in the
 * browser. With flag v3.calendar off the page renders only the prune marker and scripts/prune-community.mjs deletes it (nothing emitted).
 * Index rule (src/features/community/seo.ts, re-checked by scripts/verify-seo.mjs): noindex and out of the sitemap until at least
 * MIN_UPCOMING_FOR_INDEX upcoming entries from verified organisations exist.
 */
const indexInput = (items: readonly CalendarEntry[]) => items.map((e) => ({ startsOn: e.startsOn, endsOn: e.endsOn, status: e.status, verified: e.organiser.verified }));
const TITLE = "College esports calendar for India";
const DESCRIPTION = "Upcoming college and fest esports events in India, listed by verified organisers: game, city, dates and the link to register.";

export async function generateMetadata(): Promise<Metadata> {
  const cal = await loadBuildCalendar();
  if (!cal) return { robots: { index: false, follow: false } };
  const indexable = calendarIndexable(indexInput(cal.items), todayIst());
  return {
    title: pageTitle(TITLE), description: DESCRIPTION, alternates: { canonical: "/calendar/" },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: "/calendar/", images: ["/og.png"] },
    twitter: { card: "summary_large_image", images: ["/og.png"] },
  };
}

export default async function CalendarPage() {
  const cal = await loadBuildCalendar();
  if (!cal) return <script type="application/json" id={PRUNE_MARKER_ID} dangerouslySetInnerHTML={{ __html: '{"route":"calendar"}' }} />;
  const today = todayIst();
  const input = indexInput(cal.items);
  const upcoming = countUpcoming(input, today);
  const [tournaments, colleges] = await Promise.all([loadBuildTournaments(), loadBuildColleges()]);
  const known = [...tournaments.map((t) => t.detail.slug), ...colleges.map((c) => `college:${c.slug}`)];
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* What the index rule saw at build time, so scripts/verify-seo.mjs can re-check the shipped page. Public data only. */}
      <script type="application/json" id="eh-calendar" dangerouslySetInnerHTML={{ __html: JSON.stringify({ today, minimum: MIN_UPCOMING_FOR_INDEX, upcoming, entries: input }).replace(/</g, "\\u003c") }} />
      <header className="space-y-3">
        <h1 className={h1}>College esports calendar</h1>
        <p className="max-w-3xl text-zinc-300">
          Esports events run by colleges and college fests in India, in one place. Every entry is listed by an organisation that Esports Hub staff have
          verified, with the game, the city, the dates and where to register. Pick a game or a city, or switch to the month view to plan ahead.
        </p>
      </header>
      <CalendarScreen initial={cal.items} today={today} known={known} />
      <section className={section} aria-labelledby="how-cal-h">
        <h2 id="how-cal-h" className={h2}>How the calendar works</h2>
        <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 text-zinc-300">
          <li>Only verified organisations can list an event. Staff check that a college or fest organising team is real before they verify it.</li>
          <li>The organiser writes each entry and keeps it up to date. If an event is cancelled it stays here marked Cancelled until its date passes.</li>
          <li>Registration happens on the tournament page or on the organiser&apos;s own page. Esports Hub takes no fee and handles no money.</li>
          <li>Something wrong with an entry? Tell us from the <a href="/contact/" className={link}>contact page</a> and a moderator will check it.</li>
        </ul>
      </section>
      <section id="list-cal" className={section} aria-labelledby="list-cal-h">
        <h2 id="list-cal-h" className={h2}>List your college event</h2>
        <p className="mt-3 max-w-3xl text-zinc-300">
          Organising a college or fest tournament? Ask us to verify your organisation from the <a href="/contact/" className={link}>contact page</a>.
          Once verified, any member can list events from <a href="/app/calendar/" className={link}>the app</a>, and link each one to its tournament page or registration form.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-zinc-400">
          Final-year student who wants to build an esports app or tournament site as your college project? Our sister site{" "}
          <a href="https://campus.streamerosai.com/" className={link} rel="noopener">campus.streamerosai.com</a> helps final-year students with their projects.
        </p>
      </section>
    </div>
  );
}
