"use client";

import Link from "next/link";
import type { KitFeed } from "@/features/overlay-kit/domain";
import { KIT_GUIDE_PATH, KIT_PATH } from "@/features/overlay-kit/flag";
import { useKitPublisher } from "@/features/overlay-kit/hooks/useKitPublisher";

const link = "text-cyan-400 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400";

/**
 * The box under a points table tool: one switch that sends the standings to the OBS overlay kit in this browser. Shown only while the
 * overlay kit flag is on (the tool renders it behind OVERLAY_KIT).
 */
export default function OverlayKitConnect({ feed }: { feed: KitFeed | null }) {
  const k = useKitPublisher(feed);
  const status = !k.sending ? "Off. Nothing is sent to the overlay."
    : !k.teams ? "On. Add teams and results to see them on the overlay."
    : `On. ${k.teams} ${k.teams === 1 ? "team" : "teams"} sent${k.sentAt ? ` at ${new Date(k.sentAt).toLocaleTimeString()}` : ""}.${k.stored ? "" : " This browser blocks saved data, so an overlay opened later will not see it; keep the overlay open."}`;
  return (
    <section aria-labelledby="okc-title" className="space-y-3 rounded-xl border border-white/10 bg-surface p-4" data-testid="overlay-kit-connect">
      <h2 id="okc-title" className="font-display text-lg text-zinc-100">Live OBS overlay</h2>
      <p className="text-sm leading-6 text-zinc-300">
        Show this table on your stream: a live points table, top fraggers and team cards as OBS browser sources. The data stays in this
        browser and goes to the overlay without any upload.
      </p>
      <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-zinc-100">
        <input type="checkbox" className="h-5 w-5 accent-cyan-400" checked={k.sending} onChange={(e) => k.setSending(e.target.checked)} />
        Send to the OBS overlay
      </label>
      <p role="status" aria-live="polite" className="text-xs leading-5 text-zinc-400" data-testid="overlay-kit-status">{status}</p>
      <p className="text-sm text-zinc-300">
        <Link href={KIT_PATH} className={link}>Open the overlay kit</Link> to copy the OBS links, or read the <Link href={KIT_GUIDE_PATH} className={link}>OBS setup guide</Link>.
      </p>
    </section>
  );
}
