"use client";

import Link from "next/link";
import type { OwnPlayerPage } from "@/features/profiles/domain";
import { box, btnPrimary, btnSecondary, h2, helper, link, section } from "@/features/shared/ui/styles";
import { useStatsStory } from "@/features/player-card/hooks/useStatsStory";

/**
 * "Stats for your story": a 1080x1920 story or 1080x1350 post picture of the player's shared page with a QR to it. Drawn in this browser; nothing is
 * uploaded. Verified numbers only, plus the player's journal numbers if they tick the box (labelled Self-logged on the picture).
 */
export function StatsStoryCard({ page, game, role }: { page: OwnPlayerPage | null; game: string; role: string }) {
  const s = useStatsStory(page, game, role);
  const shared = !!page && page.visibility !== "private" && (page.visibility === "public" || !!page.cardPath);
  return (
    <section className={`${section} space-y-4`} aria-labelledby="ss-h" data-clarity-mask="true">
      <h2 id="ss-h" className={h2}>Stats for your Instagram or WhatsApp story</h2>
      <p className="max-w-3xl text-zinc-300">A picture of your player page with a QR code to it. Numbers marked Verified come from results organisers recorded; you cannot type them. Top and bottom are left clear for the app&apos;s own bars.</p>
      {!shared ? (
        <p className="text-zinc-300">Share your player page first (Link only with a card link, or Public), so the QR opens something. <Link href="/app/resume/#pp-h" className={link}>Choose who can see my page</Link></p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <fieldset className="flex flex-wrap gap-2">
              <legend className="mb-1 text-sm font-medium text-zinc-100">Picture size</legend>
              <button type="button" aria-pressed={s.format === "story"} onClick={() => s.setFormat("story")} className={s.format === "story" ? btnPrimary : btnSecondary}>Story 1080 x 1920</button>
              <button type="button" aria-pressed={s.format === "portrait"} onClick={() => s.setFormat("portrait")} className={s.format === "portrait" ? btnPrimary : btnSecondary}>Post 1080 x 1350</button>
            </fieldset>
            {s.journalOn && (
              <label className={`${box} flex min-h-11 items-start gap-3 text-zinc-100`}>
                <input type="checkbox" checked={s.withSelf} onChange={(e) => s.setWithSelf(e.target.checked)} className="mt-1 h-5 w-5 accent-cyan-400" disabled={s.journalCount === 0} />
                <span>Add my match journal numbers<span className="block text-sm text-zinc-300">They are labelled Self-logged on the picture, apart from the Verified ones. Off unless you tick it.{s.journalCount === 0 && " Your journal is empty."}</span></span>
              </label>
            )}
            {s.input && s.input.verified.length === 0 && <p className="text-sm text-zinc-300">No verified stats to show yet (or you hid them on your page). The picture shows your name, badges and QR.</p>}
            <button type="button" onClick={() => void s.download()} disabled={!s.ready || s.busy} className={btnPrimary}>{s.busy ? "Preparing" : "Download picture"}</button>
            {s.error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{s.error}</p>}
            {s.pub.phase === "error" && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>Your page could not be loaded for the picture. Try again in a moment.</p>}
            <p className={helper}>Made on this device. The QR opens the same page visitors see; reset your card link to stop old pictures working.</p>
          </div>
          <div className="mx-auto w-full max-w-xs">
            {s.preview ? <img src={s.preview} alt="Preview of your stats picture" width={1080} height={s.format === "story" ? 1920 : 1350} className="h-auto w-full rounded-xl border border-white/10" data-testid="story-preview" /> : <p className="text-sm text-zinc-400">Preparing the preview</p>}
          </div>
        </div>
      )}
    </section>
  );
}
