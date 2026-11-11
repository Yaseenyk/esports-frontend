"use client";

import { useState } from "react";
import type { Extras } from "@/lib/display";
import { logoFromFile } from "@/lib/extras-store";

type Sponsor = { name: string; logo?: string };
const MAX_SPONSORS = 4;

/**
 * "Sponsors and announcements": up to 5 lines for a scrolling ticker and up to 4 sponsors (name and a small logo). Saved in this browser,
 * so they are set once and appear on every screen, link and share card.
 */
export default function SponsorEditor({ value, onChange }: { value: Extras | undefined; onChange: (x: Extras | undefined) => boolean }) {
  const [draft, setDraft] = useState<Sponsor[] | null>(null); // the rows as typed, so a sponsor whose name is being retyped is not dropped
  const ticker = value?.ticker ?? [], sponsors = draft ?? value?.sponsors ?? [];
  const [lines, setLines] = useState<string | null>(null); // the text as typed, so a blank line is not removed under the cursor
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const push = (next: Extras) => { const ok = onChange(next); if (!ok) setMsg({ ok: false, text: "This browser would not save them, so they last only until you close the page." }); };
  const setSponsors = (list: Sponsor[]) => { setDraft(list); push({ ticker, sponsors: list }); };

  const typed = lines ?? ticker.join("\n");
  const count = (value?.ticker?.length ?? 0) + (value?.sponsors?.length ?? 0);

  return (
    <details className="group rounded-xl border border-white/10 bg-[#0a0b0d]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan [&::-webkit-details-marker]:hidden">
        <span>Sponsors and announcements <span className="font-normal text-zinc-300">· {count ? `${ticker.length} line${ticker.length === 1 ? "" : "s"}, ${value?.sponsors?.length ?? 0} sponsor${value?.sponsors?.length === 1 ? "" : "s"}` : "none yet"}</span></span>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 fill-none stroke-current text-zinc-400 transition-transform group-open:rotate-180" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5" /></svg>
      </summary>
      <div className="space-y-5 border-t border-white/10 p-4">
        <label className="block text-sm text-zinc-200">Announcement lines (one per line, up to 5)
          <textarea className="field mt-1 min-h-24 w-full" rows={4} value={typed} placeholder={"Finals start at 6 PM\nFree entry for students"}
            onChange={(e) => { const raw = e.target.value.split("\n").slice(0, 5).map((l) => l.slice(0, 80)).join("\n"); setLines(raw); push({ ticker: raw.split("\n").map((l) => l.trim()).filter(Boolean), sponsors }); }}
            onBlur={() => setLines(null)} />
          <span className="mt-1 block text-xs text-zinc-400">They scroll along the bottom of the screen. Each line can be up to 80 characters. Leave empty to show no ticker.</span>
        </label>

        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-200">Sponsors (up to {MAX_SPONSORS})</p>
          {sponsors.length === 0 && <p className="text-xs text-zinc-400">No sponsors yet.</p>}
          <ul className="space-y-3">
            {sponsors.map((s, i) => (
              <li key={i} className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 p-3">
                <span className="grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-md bg-white/90 p-1">
                  {s.logo
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={s.logo} alt={`${s.name || "Sponsor"} logo preview`} className="max-h-full max-w-full object-contain" />
                    : <span className="px-1 text-center text-[10px] font-semibold leading-tight text-zinc-700">No logo</span>}
                </span>
                <label className="min-w-0 flex-1 basis-40 text-xs text-zinc-300">Name
                  <input className="field !min-h-11 mt-0.5 w-full" maxLength={40} value={s.name} onChange={(e) => setSponsors(sponsors.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} />
                </label>
                <label className="basis-48 text-xs text-zinc-300">Logo (PNG or JPEG)
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="field !min-h-11 mt-0.5 w-full text-xs"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]; e.target.value = "";
                      if (!file) return;
                      try { const logo = await logoFromFile(file); setSponsors(sponsors.map((x, k) => (k === i ? { ...x, logo } : x))); setMsg({ ok: true, text: `Logo added for ${s.name || `sponsor ${i + 1}`}.` }); }
                      catch (err) { setMsg({ ok: false, text: err instanceof Error ? err.message : "That logo could not be used." }); }
                    }} />
                </label>
                <button type="button" className="chip shrink-0" aria-label={`Remove sponsor ${s.name || i + 1}`} onClick={() => setSponsors(sponsors.filter((_, k) => k !== i))}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn-ghost !min-h-10 px-4 text-sm" disabled={sponsors.length >= MAX_SPONSORS} onClick={() => setSponsors([...sponsors, { name: `Sponsor ${sponsors.length + 1}` }])}>Add a sponsor</button>
            {count > 0 && <button type="button" className="btn-ghost !min-h-10 px-4 text-sm" onClick={() => { setLines(null); setDraft(null); onChange(undefined); setMsg({ ok: true, text: "Removed all sponsors and announcements." }); }}>Remove everything</button>}
          </div>
          <p className="text-xs leading-5 text-zinc-400">Logos are shrunk to fit in your browser (no more than 240 pixels wide and 60 KB). Nothing is uploaded: they are saved in this browser and travel inside the screen link. A very long link may carry names only.</p>
        </div>
        <p role="status" aria-live="polite" className={`min-h-5 text-xs ${msg?.ok ? "text-emerald-300" : "text-amber-200"}`}>{msg?.text ?? ""}</p>
      </div>
    </details>
  );
}
