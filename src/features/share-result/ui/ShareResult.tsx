"use client";

import { useId } from "react";
import type { Payload } from "@/lib/display";
import type { UiLang } from "@/lib/pt-br";
import { toolCopy } from "@/lib/tool-copy";
import { useShareResult } from "@/features/share-result/hooks/useShareResult";
import { btnPrimary } from "@/features/shared/ui/styles";

/**
 * The "Share result" button that sits directly under a tool's result (a points table, a bracket, a league table). The picture and the
 * message end with the address of `path`, the tool page the result came from. Changing words sit in their own elements, so a page
 * translated by the browser cannot detach them from React.
 */
export default function ShareResult({ payload, what, path, lang = "en", label }: {
  payload: Payload | null; what: string; path: string; lang?: UiLang;
  /** The group's name for screen readers when a tool has two results (the group tables and the knockout). */
  label?: string;
}) {
  const c = toolCopy(lang).quick;
  const s = useShareResult(payload, what, path, lang);
  const hint = useId();
  return (
    <div role="group" aria-label={label ?? c.group} data-testid="share-result" className="space-y-2 border-t border-white/10 pt-4 print:hidden">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={`${btnPrimary} px-5`} disabled={!payload || s.busy} onClick={s.share} aria-describedby={hint}>
          <span key={s.busy ? "busy" : "idle"}>{s.busy ? c.making : c.button}</span>
        </button>
        <div role="group" aria-label={c.shapeGroup} className="flex flex-wrap items-center gap-2">
          <button type="button" className="chip" aria-pressed={s.format === "square"} onClick={() => s.setFormat("square")}>{c.square}</button>
          <button type="button" className="chip" aria-pressed={s.format === "story"} onClick={() => s.setFormat("story")}>{c.story}</button>
        </div>
      </div>
      <p id={hint} className="text-xs leading-5 text-zinc-400">{c.hint}</p>
      <p role="status" aria-live="polite" className={`min-h-5 text-xs ${s.msg?.ok === false ? "text-warning" : "text-success"}`}>{s.msg && <span key={s.msg.text}>{s.msg.text}</span>}</p>
    </div>
  );
}
