"use client";

import { useEffect, useRef } from "react";

/** A modal built on the native <dialog>: focus is trapped, Escape closes it, and the page behind is inert. */
export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }} aria-labelledby="modal-title" className="w-full max-w-lg rounded-xl border border-white/10 bg-surface p-0 text-zinc-100 backdrop:bg-ink/80">
      {open && (
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="modal-title" className="font-display text-2xl text-zinc-100">{title}</h2>
            <button type="button" onClick={onClose} className="min-h-11 min-w-11 rounded-lg border border-white/10 text-zinc-100 hover:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400" aria-label="Close">
              <span aria-hidden="true">x</span>
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      )}
    </dialog>
  );
}
