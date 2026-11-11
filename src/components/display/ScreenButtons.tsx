"use client";

import { useState } from "react";
import type { Payload } from "@/lib/display";
import { themeById } from "@/lib/display-themes";
import ToolStep from "@/components/tools/ToolStep";
import PublishToLive from "./PublishToLive";
import ShareCardButtons from "./ShareCardButtons";
import SponsorEditor from "./SponsorEditor";
import ThemePicker from "./ThemePicker";
import { useScreen } from "./useScreen";

/**
 * "Show it on a TV or stream" for a tool, as the last, optional step. The main button opens a clean full-screen view; the look
 * (14 designs) and the OBS options are tucked away until someone wants them, so the step stays simple for a first-time visitor.
 */
export default function ScreenButtons({ payload, what, step }: { payload: Payload | null; what: string; step: number }) {
  const s = useScreen(payload);
  const [msg, setMsg] = useState("");
  return (
    <div role="group" aria-label="Show on a screen">
      <ToolStep n={step} title={`Show the ${what} on a TV or stream (optional)`} hint="Opens a big, clean full-screen view for a venue TV, a projector or your live stream. Keep both windows open and the screen updates whenever you change something here.">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn px-5" disabled={!payload} onClick={async () => setMsg((await s.open()) ? "" : "The screen window was blocked. Allow pop-ups for this site, or use the link button instead.")}>Open the screen</button>
          <button type="button" className="btn-ghost px-4 text-sm" disabled={!payload} onClick={async () => setMsg((await s.copy()) ? "Link copied. It shows what is on screen right now." : "Could not copy. Use Open the screen instead, then copy the address from that window.")}>Copy a link for another device or OBS</button>
        </div>
        <details className="group rounded-xl border border-white/10 bg-[#0a0b0d]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan [&::-webkit-details-marker]:hidden">
            <span>Change the look <span className="font-normal text-zinc-300">· now: {themeById(s.opts.theme).name}</span></span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 fill-none stroke-current text-zinc-400 transition-transform group-open:rotate-180" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5" /></svg>
          </summary>
          <div className="space-y-4 border-t border-white/10 p-4">
            <ThemePicker value={s.opts.theme} onChange={(theme) => s.setOpts({ ...s.opts, theme })} />
            <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-200"><input type="checkbox" className="h-5 w-5 accent-cyan" checked={s.opts.transparent} onChange={(e) => s.setOpts({ ...s.opts, transparent: e.target.checked })} />Transparent background (for streaming software such as OBS)</label>
            <p className="text-xs leading-5 text-zinc-400">A copied link is a snapshot of right now. To keep a stream updating, capture the open screen window in OBS instead of using the link.</p>
          </div>
        </details>
        <SponsorEditor value={s.extras} onChange={s.setExtras} />
        <ShareCardButtons payload={s.payload} what={what} theme={s.opts.theme} extras={s.extras} />
        <PublishToLive payload={payload} what={what} />
        <p role="status" aria-live="polite" className={`min-h-5 text-xs ${msg.startsWith("Link") ? "text-emerald-300" : "text-amber-200"}`}>{msg}</p>
      </ToolStep>
    </div>
  );
}
