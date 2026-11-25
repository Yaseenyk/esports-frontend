"use client";

import Link from "next/link";
import { type AuditRow, admin, isMailItem, reasonLabel } from "@/lib/admin/client";
import { actionLabel, ago, targetLabel } from "@/lib/admin/labels";
import { Failed, H1, Loading, useLoad } from "./ui";

type Counts = Record<string, number | null>;

/** One number that opens its queue. A null count is "not available here", never shown as zero. */
function Tile({ label, value, hint, href, alert }: { label: string; value: number | null | undefined; hint?: string; href: string; alert?: boolean }) {
  return (
    <Link href={href} className={`card block min-h-11 outline-none transition-colors hover:border-white/30 focus-visible:ring-2 focus-visible:ring-cyan ${alert ? "!border-amber-400/60" : ""}`}>
      <span className="block text-sm text-zinc-300">{label}</span>
      <span className="mt-1 block font-display text-3xl font-bold text-white">{value == null ? "–" : value.toLocaleString("en-IN")}</span>
      {value == null ? <span className="mt-1 block text-xs text-zinc-400">Not available yet</span> : hint && <span className="mt-1 block text-xs text-zinc-400">{hint}</span>}
    </Link>
  );
}

function Recent({ rows }: { rows: AuditRow[] }) {
  if (!rows.length) return <p className="card text-sm text-zinc-300">No activity yet.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((a) => (
        <li key={a.id} className="card !p-3 text-sm">
          <span className="font-medium text-white">{actionLabel(a.action)}</span>
          <span className="text-zinc-300">{a.targetType ? ` on ${targetLabel(a.targetType).toLowerCase()}` : ""}{a.reasonCode ? `. ${reasonLabel(a.reasonCode)}` : ""}</span>
          <span className="block text-xs text-zinc-400">{a.actorType === "staff" ? "Platform staff" : a.actorType === "system" ? "The system" : "A member"}{a.at ? `, ${ago(a.at)}` : ""}</span>
        </li>
      ))}
    </ul>
  );
}

/** Counts only: no names, no emails. Each number links to the queue where it can be acted on. */
export default function Dashboard() {
  const r = useLoad(async () => {
    const [overview, flags, usage] = await Promise.allSettled([admin.overview(), admin.flags(), admin.usage()]);
    return { overview, flags, usage };
  });
  if (r.status === "loading") return <><H1>Home</H1><Loading what="the numbers" /></>;
  if (r.status === "error" || !r.data) return <><H1>Home</H1><Failed error={r.error} onRetry={r.reload} /></>;
  const { overview, flags, usage } = r.data;
  const c: Counts = overview.status === "fulfilled" ? overview.value.counts : {};
  const stopped = flags.status === "fulfilled" ? flags.value.filter((f) => f.key.startsWith("kill.") && f.value).length : null;
  const mail = usage.status === "fulfilled" ? usage.value.items.find((i) => isMailItem(i.key)) : undefined;
  const failed = [overview, flags, usage].some((x) => x.status === "rejected");
  const hiddenHint = (n: number | null | undefined) => (n ? `${n} hidden` : undefined);
  return (
    <>
      <H1 sub="What needs you today. Every number opens its queue.">Home</H1>
      <h2 className="mb-2 font-display text-lg font-semibold text-white">Needs a decision</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Open reports" value={c.openReports} href="/admin/reports/" alert={!!c.openReports} />
        <Tile label="Organisations to approve" value={c.orgsPending} href="/admin/orgs/" alert={!!c.orgsPending} hint="Working already, not yet verified" />
        <Tile label="Reported reviews" value={c.openRatingReports} href="/admin/content/?kind=ratings" alert={!!c.openRatingReports} />
        <Tile label="New feedback" value={c.feedbackNew} href="/admin/feedback/" />
      </div>
      <h2 className="mb-2 mt-6 font-display text-lg font-semibold text-white">People and organisations</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Accounts" value={c.users} href="/admin/users/" hint={c.usersSuspended ? `${c.usersSuspended} suspended` : undefined} />
        <Tile label="Accounts with a checked email" value={c.usersVerified} href="/admin/users/" />
        <Tile label="Clubs and colleges" value={c.orgs} href="/admin/orgs/?status=all" />
        <Tile label="Verified organisations" value={c.orgsVerified} href="/admin/orgs/?status=verified" />
      </div>
      <h2 className="mb-2 mt-6 font-display text-lg font-semibold text-white">Public content</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Events" value={c.events} href="/admin/content/?kind=results" />
        <Tile label="Tournament pages" value={c.tournaments} href="/admin/content/?kind=results" />
        <Tile label="Open scrim slots" value={c.scrims} href="/admin/content/?kind=scrims" hint={hiddenHint(c.scrimsHidden)} />
        <Tile label="Open LFT posts" value={c.lft} href="/admin/content/?kind=lft" hint={hiddenHint(c.lftHidden)} />
        <Tile label="Directory listings" value={c.directory} href="/admin/content/?kind=directory" hint={hiddenHint(c.directoryHidden)} />
        <Tile label="Calendar entries" value={c.calendar} href="/admin/content/?kind=calendar" hint={hiddenHint(c.calendarHidden)} />
        <Tile label="Ratings" value={c.ratings} href="/admin/content/?kind=ratings" hint={hiddenHint(c.ratingsHidden)} />
        <Tile label="Switches stopped" value={stopped} href="/admin/switches/" alert={!!stopped} hint={stopped ? "Part of the site is off" : "Everything is running"} />
      </div>
      <p className="mt-3 text-sm text-zinc-300">Emails sent today: {mail?.value == null ? "not available" : mail.limit ? `${mail.value} of ${mail.limit}` : String(mail.value)}. <Link href="/admin/usage/" className="text-cyan underline underline-offset-2">Usage</Link></p>
      {failed && <div className="mt-4"><button type="button" className="btn-ghost" onClick={r.reload}>Some numbers did not load. Try again</button></div>}
      <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-white">Recent activity</h2>
      <Recent rows={overview.status === "fulfilled" ? overview.value.recent : []} />
      <p className="mt-3"><Link href="/admin/activity/" className="btn-ghost">All activity</Link></p>
    </>
  );
}
