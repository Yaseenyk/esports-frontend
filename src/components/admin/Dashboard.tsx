"use client";

import Link from "next/link";
import { admin, isMailItem } from "@/lib/admin/client";
import { ago } from "@/lib/admin/labels";
import { Failed, H1, Loading, Stat, useLoad } from "./ui";

/** Counts only: no names, no emails, nothing about a person. Each number loads on its own, so one failure does not blank the page. */
export default function Dashboard() {
  const r = useLoad(async () => {
    const [reports, flags, usage] = await Promise.allSettled([admin.reports("open"), admin.flags(), admin.usage()]);
    return { reports, flags, usage };
  });
  if (r.status === "loading") return <><H1>Home</H1><Loading what="the numbers" /></>;
  if (r.status === "error" || !r.data) return <><H1>Home</H1><Failed error={r.error} onRetry={r.reload} /></>;
  const { reports, flags, usage } = r.data;
  const rep = reports.status === "fulfilled" ? reports.value : null;
  const open = rep ? rep.items.length : null;
  const urgent = rep ? rep.items.filter((x) => x.priority >= 3).length : null;
  const oldest = rep && rep.items.length ? rep.items.map((x) => x.createdAt).filter(Boolean).sort()[0] : null;
  const stopped = flags.status === "fulfilled" ? flags.value.filter((f) => f.key.startsWith("kill.") && f.value).length : null;
  const mail = usage.status === "fulfilled" ? usage.value.items.find((i) => isMailItem(i.key)) : undefined;
  const failed = [reports, flags, usage].some((x) => x.status === "rejected");
  return (
    <>
      <H1 sub="What needs you today.">Home</H1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Reports waiting" value={open === null ? "Not available" : rep?.next ? `${open}+` : String(open)} hint={oldest ? `Oldest was sent ${ago(oldest)}` : open === 0 ? "Nothing waiting" : undefined} />
        <Stat label="Urgent reports" value={urgent === null ? "Not available" : String(urgent)} hint="A child is shown, or many people reported it" />
        <Stat label="Switches stopped" value={stopped === null ? "Not available" : String(stopped)} hint={stopped ? "Part of the site is switched off" : "Everything is running"} />
        <Stat label="Emails sent today" value={mail?.value == null ? "Not available" : mail.limit ? `${mail.value} of ${mail.limit}` : String(mail.value)} />
      </div>
      {failed && <div className="mt-4"><button type="button" className="btn-ghost" onClick={r.reload}>Some numbers did not load. Try again</button></div>}
      <p className="mt-6">
        <Link href="/admin/reports/" className="btn">{open ? "Review reports" : "Open the report queue"}</Link>
      </p>
    </>
  );
}
