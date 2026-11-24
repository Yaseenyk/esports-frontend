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
import { toolCopy } from "@/lib/tool-copy";
import type { UiLang } from "@/lib/pt-br";

/**
 * "Show it on a TV or stream" for a tool, as the last, optional step. The main button opens a clean full-screen view; the look
 * (14 designs) and the OBS options are tucked away until someone wants them, so the step stays simple for a first-time visitor.
 */
export default function ScreenButtons({ payload, what, step, lang = "en", path }: { payload: Payload | null; what: string; step: number; lang?: UiLang; /** The tool page, for the address on share pictures. */ path?: string }) {
  const s = useScreen(payload);
  const [msg, setMsg] = useState("");
  const T = toolCopy(lang), c = T.screen;
  return (
    <div role="group" aria-label={c.group}>
      <ToolStep n={step} title={c.title(what)} hint={c.hint} stepWord={T.stepWord}>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn px-5" disabled={!payload} onClick={async () => setMsg((await s.open()) ? "" : c.blocked)}>{c.open}</button>
          <button type="button" className="btn-ghost px-4 text-sm" disabled={!payload} onClick={async () => setMsg((await s.copy()) ? c.copied : c.copyFail)}>{c.copyLink}</button>
        </div>
        <details className="group rounded-xl border border-white/10 bg-[#0a0b0d]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan [&::-webkit-details-marker]:hidden">
            <span>{c.look} <span className="font-normal text-zinc-300">· {c.now} <span>{themeById(s.opts.theme).name}</span></span></span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 fill-none stroke-current text-zinc-400 transition-transform group-open:rotate-180" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5" /></svg>
          </summary>
          <div className="space-y-4 border-t border-white/10 p-4">
            <ThemePicker value={s.opts.theme} onChange={(theme) => s.setOpts({ ...s.opts, theme })} lang={lang} />
            <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-200"><input type="checkbox" className="h-5 w-5 accent-cyan" checked={s.opts.transparent} onChange={(e) => s.setOpts({ ...s.opts, transparent: e.target.checked })} />{c.transparent}</label>
            <p className="text-xs leading-5 text-zinc-400">{c.snapshot}</p>
          </div>
        </details>
        <SponsorEditor value={s.extras} onChange={s.setExtras} lang={lang} />
        {/* The main share block sits under the result (ShareResult). This copy, drawn in the screen's design with sponsors, stays folded away. */}
        <details className="group rounded-xl border border-white/10 bg-[#0a0b0d]" data-testid="more-share">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan [&::-webkit-details-marker]:hidden">
            <span>{c.moreShare}</span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 fill-none stroke-current text-zinc-400 transition-transform group-open:rotate-180" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5" /></svg>
          </summary>
          <div className="border-t border-white/10 p-3">
            <ShareCardButtons payload={s.payload} what={what} theme={s.opts.theme} extras={s.extras} lang={lang} path={path} />
          </div>
        </details>
        <PublishToLive payload={payload} what={what} lang={lang} />
        <p role="status" aria-live="polite" className={`min-h-5 text-xs ${msg === c.copied ? "text-emerald-300" : "text-amber-200"}`}>{msg}</p>
      </ToolStep>
    </div>
  );
}
