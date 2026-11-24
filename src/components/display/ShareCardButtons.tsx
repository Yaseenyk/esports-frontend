"use client";

import { useState } from "react";
import type { Extras, Payload } from "@/lib/display";
import { cardFontVars } from "@/components/idcard/fonts";
import { footerLine, renderShareCard, shareFileName, shareText, whatsappLink, type ShareFormat } from "@/lib/share-cards";
import { shareOrDownload } from "./shareFile";
import { toolCopy } from "@/lib/tool-copy";
import type { UiLang } from "@/lib/pt-br";

/** Turns what a tool shows into a picture (a post or a story) or a message for WhatsApp. The look is the same design as the screen. */
export default function ShareCardButtons({ payload, what, theme, extras, lang = "en", path }: { payload: Payload | null; what: string; theme: string; extras?: Extras; lang?: UiLang; /** The tool page the result came from; its address goes on the picture and in the message. */ path?: string }) {
  const c = toolCopy(lang).share;
  const [format, setFormat] = useState<ShareFormat>("portrait");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const footer = footerLine(path, lang);
  const text = () => (payload ? shareText(payload, { extras, footer }) : "");

  const share = async () => {
    if (!payload || busy) return;
    setBusy(true); setMsg(null);
    try {
      const blob = await renderShareCard(payload, { format, theme, extras, fontClass: cardFontVars, footer });
      const r = await shareOrDownload(blob, shareFileName(payload.d.title || what, format), payload.d.title || what);
      setMsg(r === "cancelled" ? null : { ok: true, text: r === "shared" ? c.shared : c.saved(format === "portrait") });
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : c.failed }); }
    setBusy(false);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(text()); setMsg({ ok: true, text: c.textCopied }); }
    catch { setMsg({ ok: false, text: c.textFail }); }
  };

  return (
    <div role="group" aria-label={c.group} className="space-y-3 rounded-xl border border-white/10 bg-[#0a0b0d] p-4">
      <div>
        <p className="text-sm font-semibold text-white">{c.title(what)}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-300">{c.body}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={c.shapeGroup}>
        <span className="text-sm text-zinc-200">{c.shape}</span>
        <button type="button" className="chip" aria-pressed={format === "portrait"} onClick={() => setFormat("portrait")}>{c.portrait}</button>
        <button type="button" className="chip" aria-pressed={format === "story"} onClick={() => setFormat("story")}>{c.story}</button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn px-5" disabled={!payload || busy} onClick={share}>{busy ? c.making : c.shareBtn}</button>
        <button type="button" className="btn-ghost px-4 text-sm" disabled={!payload} onClick={copy}>{c.copyText}</button>
        {payload ? <a className="btn-ghost px-4 text-sm" href={whatsappLink(text())} target="_blank" rel="noopener noreferrer">{c.sendText}</a> : <span className="btn-ghost px-4 text-sm opacity-50" aria-disabled="true">{c.sendText}</span>}
      </div>
      <p role="status" aria-live="polite" className={`min-h-5 text-xs ${msg?.ok ? "text-emerald-300" : "text-amber-200"}`}>{msg?.text ?? ""}</p>
    </div>
  );
}
