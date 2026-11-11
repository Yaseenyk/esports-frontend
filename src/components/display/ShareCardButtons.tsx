"use client";

import { useState } from "react";
import type { Extras, Payload } from "@/lib/display";
import { cardFontVars } from "@/components/idcard/fonts";
import { renderShareCard, shareFileName, shareText, whatsappLink, type ShareFormat } from "@/lib/share-cards";
import { shareOrDownload } from "./shareFile";

/** Turns what a tool shows into a picture (a post or a story) or a message for WhatsApp. The look is the same design as the screen. */
export default function ShareCardButtons({ payload, what, theme, extras }: { payload: Payload | null; what: string; theme: string; extras?: Extras }) {
  const [format, setFormat] = useState<ShareFormat>("square");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const text = () => (payload ? shareText(payload, { extras }) : "");

  const share = async () => {
    if (!payload || busy) return;
    setBusy(true); setMsg(null);
    try {
      const blob = await renderShareCard(payload, { format, theme, extras, fontClass: cardFontVars });
      const r = await shareOrDownload(blob, shareFileName(payload.d.title || what, format), payload.d.title || what);
      setMsg(r === "cancelled" ? null : { ok: true, text: r === "shared" ? "Shared." : `Saved the picture (${format === "square" ? "square post" : "story"}). Open WhatsApp or Instagram and choose it from your gallery.` });
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "The picture could not be made. Try again." }); }
    setBusy(false);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(text()); setMsg({ ok: true, text: "Text copied. Paste it into WhatsApp or anywhere else." }); }
    catch { setMsg({ ok: false, text: "Could not copy here. Use the WhatsApp button instead, or select the text yourself." }); }
  };

  return (
    <div role="group" aria-label="Share a picture or message" className="space-y-3 rounded-xl border border-white/10 bg-[#0a0b0d] p-4">
      <div>
        <p className="text-sm font-semibold text-white">Share the {what} as a picture or message</p>
        <p className="mt-1 text-xs leading-5 text-zinc-300">Makes an image in the design you chose below. On a phone it opens the share sheet; on a computer it saves the file.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Picture shape">
        <span className="text-sm text-zinc-200">Shape:</span>
        <button type="button" className="chip" aria-pressed={format === "square"} onClick={() => setFormat("square")}>Square post</button>
        <button type="button" className="chip" aria-pressed={format === "story"} onClick={() => setFormat("story")}>Story</button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn px-5" disabled={!payload || busy} onClick={share}>{busy ? "Making the picture…" : "Share on WhatsApp or Instagram"}</button>
        <button type="button" className="btn-ghost px-4 text-sm" disabled={!payload} onClick={copy}>Copy a text version</button>
        {payload ? <a className="btn-ghost px-4 text-sm" href={whatsappLink(text())} target="_blank" rel="noopener noreferrer">Send the text on WhatsApp</a> : <span className="btn-ghost px-4 text-sm opacity-50" aria-disabled="true">Send the text on WhatsApp</span>}
      </div>
      <p role="status" aria-live="polite" className={`min-h-5 text-xs ${msg?.ok ? "text-emerald-300" : "text-amber-200"}`}>{msg?.text ?? ""}</p>
    </div>
  );
}
