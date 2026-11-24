import { STREAMEROS_WAITLIST } from "@/features/overlay-kit/flag";

/**
 * An honest pointer to streamerOS where stream highlights come up. streamerOS is a separate Windows app from the same maker; it is NOT
 * released yet, so the card says so, shows no screenshot and links only to the waitlist on streamerosai.com.
 */
export default function StreamerOsCard() {
  return (
    <aside aria-labelledby="streameros-card" className="rounded-xl border border-white/10 bg-surface p-4" data-testid="streameros-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Not part of this kit</p>
      <h3 id="streameros-card" className="mt-1 font-display text-lg text-zinc-100">Coming in streamerOS, February 2027</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-300">
        Highlight clips: streamerOS marks the hype moments while you are live and ranks your recordings by chat hype afterwards. It is a
        separate Windows app from the same maker, it is not released yet, and nothing on this page needs it.
      </p>
      <a href={STREAMEROS_WAITLIST} rel="noopener" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-cyan-400 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
        Join the streamerOS waitlist
      </a>
    </aside>
  );
}
