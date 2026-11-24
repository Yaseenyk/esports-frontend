"use client";

import { useId } from "react";
import type { Payload } from "@/lib/display";
import { DISPLAY_THEMES } from "@/lib/display-themes";
import type { UiLang } from "@/lib/pt-br";
import { toolCopy } from "@/lib/tool-copy";
import { useShareResult } from "@/features/share-result/hooks/useShareResult";
import { btnPrimary, btnSecondary } from "@/features/shared/ui/styles";

/**
 * The one share block that sits directly under a tool's result (a points table, a bracket, a league table): the picture (shape and
 * design), a text version to copy and the same text for WhatsApp. The picture and the message end with the address of `path`, the tool
 * page the result came from. Changing words sit in their own elements, so a page translated by the browser cannot detach them from React.
 * The button is secondary by default: the tool pages already have their own main action (one primary per view, DESIGN_SYSTEM.md).
 */
export default function ShareResult({ payload, what, path, lang = "en", label, primary = false }: {
  payload: Payload | null; what: string; path: string; lang?: UiLang;
  /** The group's name for screen readers when a tool has two results (the group tables and the knockout). */
  label?: string;
  /** Only for a screen where sharing is the one main action. */
  primary?: boolean;
}) {
  const T = toolCopy(lang), c = T.quick;
  const s = useShareResult(payload, what, path, lang);
  const hint = useId();
  const design = useId();
  const small = `${btnSecondary} text-sm`;
  return (
    <div role="group" aria-label={label ?? c.group} data-testid="share-result" className="space-y-3 border-t border-white/10 pt-4 print:hidden">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={`${primary ? btnPrimary : btnSecondary} px-5 font-semibold`} disabled={!payload || s.busy} onClick={s.share} aria-describedby={hint}>
          <span key={s.busy ? "busy" : "idle"}>{s.busy ? c.making : c.button}</span>
        </button>
        <div role="group" aria-label={c.shapeGroup} className="flex flex-wrap items-center gap-2">
          <button type="button" className="chip" aria-pressed={s.format === "portrait"} onClick={() => s.setFormat("portrait")}>{c.portrait}</button>
          <button type="button" className="chip" aria-pressed={s.format === "story"} onClick={() => s.setFormat("story")}>{c.story}</button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={design} className="text-sm text-zinc-300">{c.design}</label>
        <select id={design} className="min-h-11 rounded-lg border border-white/10 bg-surface px-3 text-sm text-zinc-100" value={s.theme} onChange={(e) => s.setTheme(e.target.value)}>
          {DISPLAY_THEMES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button type="button" className={small} disabled={!s.whatsapp} onClick={s.copyText}>{T.share.copyText}</button>
        {s.whatsapp ? <a className={small} href={s.whatsapp} target="_blank" rel="noopener noreferrer">{T.share.sendText}</a> : <span className={`${small} opacity-50`} aria-disabled="true">{T.share.sendText}</span>}
      </div>
      <p id={hint} className="text-xs leading-5 text-zinc-400">{c.hint}</p>
      <p role="status" aria-live="polite" className={`min-h-5 text-xs ${s.msg?.ok === false ? "text-warning" : "text-success"}`}>{s.msg && <span key={s.msg.text}>{s.msg.text}</span>}</p>
    </div>
  );
}
