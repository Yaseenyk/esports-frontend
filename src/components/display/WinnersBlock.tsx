"use client";

import { useState } from "react";
import { cardFontVars } from "@/components/idcard/fonts";
import { DISPLAY_THEMES } from "@/lib/display-themes";
import { certificatesHref, footerLine, renderWinnersCard, shareFileName, type ShareFormat } from "@/lib/share-cards";
import { shareOrDownload } from "./shareFile";
import { toolCopy } from "@/lib/tool-copy";
import type { UiLang } from "@/lib/pt-br";

/**
 * Shown by a tool when its results are complete: the winners, a poster to share, and a link that fills the certificate maker.
 * A plain block, not a numbered step, because it only appears once there is something to celebrate.
 */
export default function WinnersBlock({ first, second, third, event, title = "Winners", lang = "en", path }: { first: string; second?: string; third?: string; event?: string; title?: string; lang?: UiLang; /** The tool page, for the address on the poster. */ path?: string }) {
  const c = toolCopy(lang).winners;
  const [format, setFormat] = useState<ShareFormat>("square");
  const [theme, setTheme] = useState("dark");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const share = async () => {
    if (busy) return;
    setBusy(true); setMsg(null);
    try {
      const blob = await renderWinnersCard({ title, first, second, third, event }, { format, theme, fontClass: cardFontVars, footer: footerLine(path, lang) });
      const r = await shareOrDownload(blob, shareFileName(title, format), title);
      setMsg(r === "cancelled" ? null : { ok: true, text: r === "shared" ? c.shared : c.saved });
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : c.failed }); }
    setBusy(false);
  };
  const places: [string, string | undefined][] = [[c.places[0]!, first], [c.places[1]!, second], [c.places[2]!, third]];
  return (
    <section aria-label={c.section} className="card space-y-4 no-print">
      <div>
        <h3 className="font-display text-lg font-bold leading-tight text-white">{c.heading}</h3>
        <p className="mt-1 text-sm leading-6 text-zinc-300">{c.body}</p>
      </div>
      <ol className="grid gap-2 sm:grid-cols-3">
        {places.filter(([, n]) => n).map(([label, n]) => <li key={label} className="rounded-lg border border-white/[0.14] bg-[#0f1013] p-3 text-sm"><span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</span><span className="block truncate font-semibold text-white">{n}</span></li>)}
      </ol>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={c.shapeGroup}>
        <span className="text-sm text-zinc-200">{c.shape}</span>
        <button type="button" className="chip" aria-pressed={format === "square"} onClick={() => setFormat("square")}>{c.square}</button>
        <button type="button" className="chip" aria-pressed={format === "story"} onClick={() => setFormat("story")}>{c.story}</button>
        <label className="ml-auto flex items-center gap-2 text-sm text-zinc-200">{c.design}
          <select className="field !min-h-10" value={theme} onChange={(e) => setTheme(e.target.value)}>{DISPLAY_THEMES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn px-5" disabled={busy} onClick={share}>{busy ? c.making : c.shareBtn}</button>
        <a className="btn-ghost px-4 text-sm" href={certificatesHref({ first, second, third })}>{c.certificates}</a>
      </div>
      <p role="status" aria-live="polite" className={`min-h-5 text-xs ${msg?.ok ? "text-emerald-300" : "text-amber-200"}`}>{msg?.text ?? ""}</p>
    </section>
  );
}
