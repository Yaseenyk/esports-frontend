"use client";

import { useState } from "react";
import type { Payload } from "@/lib/display";
import { useScreen } from "./useScreen";

/** "Show on a screen" for a tool: opens a clean fullscreen view for a TV, a projector, or OBS and YouTube. */
export default function ScreenButtons({ payload, what }: { payload: Payload | null; what: string }) {
  const s = useScreen(payload);
  const [msg, setMsg] = useState("");
  return (
    <div className="card space-y-3" aria-label="Show on a screen" role="group">
      <div>
        <h3 className="font-display text-lg font-bold text-white">Show the {what} on a screen</h3>
        <p className="text-sm text-zinc-300">Opens a clean, big-text view for a TV, a projector or your stream. It follows this page: change a result here and the screen updates at once, as long as both stay open in the same browser.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <button type="button" className="btn px-4 text-sm" disabled={!payload} onClick={async () => setMsg((await s.open()) ? "" : "The screen window was blocked. Allow pop-ups for this site, or use the link button instead.")}>Open the screen</button>
        <button type="button" className="btn-ghost px-4 text-sm" disabled={!payload} onClick={async () => setMsg((await s.copy()) ? "Link copied. It shows what is on screen right now." : "Could not copy. Use Open the screen instead, then copy the address from that window.")}>Copy a link for OBS or another device</button>
        <label className="text-sm text-zinc-200">Style<select className="field mt-1" value={s.opts.theme} onChange={(e) => s.setOpts({ ...s.opts, theme: e.target.value as "dark" | "light" | "neon" })}><option value="dark">Dark</option><option value="neon">Neon</option><option value="light">Light</option></select></label>
        <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-200"><input type="checkbox" className="h-5 w-5 accent-cyan" checked={s.opts.transparent} onChange={(e) => s.setOpts({ ...s.opts, transparent: e.target.checked })} />Transparent background (for OBS)</label>
      </div>
      <p role="status" aria-live="polite" className={`min-h-5 text-xs ${msg.startsWith("Link") ? "text-emerald-300" : "text-amber-200"}`}>{msg}</p>
      <p className="text-xs text-zinc-400">A copied link is a snapshot: paste it into an OBS browser source and it shows that moment. To keep a stream updating, capture the open screen window in OBS instead.</p>
    </div>
  );
}
