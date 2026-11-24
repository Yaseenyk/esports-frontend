"use client";

import { useState } from "react";
import { btnSecondary } from "@/features/shared/ui/styles";

/** A line of code in its own box with a Copy button, so nobody has to select text out of a sentence. */
export default function CopyCode({ text, label }: { text: string; label: string }) {
  const [msg, setMsg] = useState("");
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setMsg("Copied."); }
    catch { setMsg("Copying is blocked here: select the line and copy it yourself."); }
  };
  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-start gap-2">
        <pre className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-white/10 bg-surface p-3 font-mono text-sm text-zinc-100" translate="no" aria-label={label}><code>{text}</code></pre>
        <button type="button" className={`${btnSecondary} text-sm`} onClick={copy}>Copy</button>
      </div>
      <p role="status" aria-live="polite" className="min-h-5 text-xs text-zinc-400">{msg}</p>
    </div>
  );
}
