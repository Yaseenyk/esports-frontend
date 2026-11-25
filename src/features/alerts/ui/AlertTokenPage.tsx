"use client";

import Link from "next/link";
import { EmptyState } from "@/features/shared/ui/States";
import { box, btnPrimary, h1, link } from "@/features/shared/ui/styles";
import { useAlertToken } from "@/features/alerts/hooks/useAlerts";

/** The pages behind the links in alert emails. Confirm acts on open (it only turns on what the person asked for); unsubscribe takes one tap. */
export default function AlertTokenPage({ action }: { action: "confirm" | "unsubscribe" }) {
  const t = useAlertToken(action);
  const title = action === "confirm" ? "Confirm tournament alerts" : "Unsubscribe from tournament alerts";
  if (t.phase === "missing") return <EmptyState asPage title="This link is not complete" body="Open the link straight from the email, or manage alerts from your account." action={<Link href="/app/alerts/" className={btnPrimary}>Alert settings</Link>} />;
  if (t.phase === "notfound") {
    const body = action === "confirm" ? "It may have expired (links last 48 hours) or been used already. Send a new one from your alert settings." : "It may be from alerts you already deleted. Nothing more will be sent from it.";
    return <EmptyState asPage title="This link does not work any more" body={body} action={<Link href="/app/alerts/" className={btnPrimary}>Alert settings</Link>} />;
  }
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className={h1}>{title}</h1>
      <section className={box} aria-live="polite">
        {t.phase === "working" && <p className="text-zinc-300">One moment.</p>}
        {t.phase === "ask" && (
          <div className="space-y-4">
            <p className="text-zinc-300">Stop all tournament alert emails to this address. You can turn them on again from your account.</p>
            <button type="button" onClick={t.submit} className={btnPrimary}>Unsubscribe</button>
          </div>
        )}
        {t.phase === "done" && <p role="status" className="text-success"><span aria-hidden="true">+ </span>{action === "confirm" ? "Alerts are on. You get at most one email a day, only when a matching tournament is published or opens registration." : "You are unsubscribed. No more tournament alerts will be sent."}</p>}
        {t.phase === "error" && (
          <div className="space-y-3">
            <p role="alert" className="text-danger"><span aria-hidden="true">! </span>That did not work. Nothing changed. Check your connection and try again.</p>
            <button type="button" onClick={t.submit} className={btnPrimary}>Try again</button>
          </div>
        )}
      </section>
      <p><Link href="/app/alerts/" className={link}>Alert settings</Link></p>
    </div>
  );
}
