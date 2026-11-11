"use client";

import { useEffect, useRef } from "react";

export interface SheetAsk { title: string; detail?: string; confirmLabel: string; run: () => void }

/** A bottom sheet that asks "are you sure?" in one plain sentence. Nothing is sent until the big button is pressed. Escape or "Go back" closes it. */
export default function ConfirmSheet({ ask, onClose }: { ask: SheetAsk; onClose: () => void }) {
  const ok = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ok.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="sc-sheet-t" className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-600 bg-zinc-950 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 id="sc-sheet-t" className="font-display text-2xl font-bold leading-tight text-white">{ask.title}</h2>
        {ask.detail && <p className="text-base leading-6 text-zinc-300">{ask.detail}</p>}
        <div className="grid gap-2">
          <button ref={ok} type="button" className="btn !min-h-14 text-lg" onClick={() => { ask.run(); onClose(); }}>{ask.confirmLabel}</button>
          <button type="button" className="btn-ghost !min-h-12 text-base" onClick={onClose}>Go back</button>
        </div>
      </div>
    </div>
  );
}
