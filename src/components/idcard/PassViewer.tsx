"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cardToPng, download } from "@/lib/idcard/export";
import { FORMATS, fmtOf, type Template } from "@/lib/idcard/types";
import CardView, { type Ctx } from "./CardView";

/** A card in your hand: it tilts with the pointer, catches a moving shine, and flips to its back. */
export default function PassViewer({ open, onClose, tpl, ctx }: { open: boolean; onClose: () => void; tpl: Template; ctx: Ctx }) {
  const [side, setSide] = useState<"front" | "back">("front");
  const [busy, setBusy] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 30 });

  useEffect(() => { if (open) setSide("front"); }, [open]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [open, onClose]);

  const move = (e: React.PointerEvent) => {
    const r = card.current?.getBoundingClientRect(); if (!r) return;
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    setTilt({ x: (0.5 - y) * 14, y: (x - 0.5) * 18, gx: x * 100, gy: y * 100 });
  };
  const fmt = FORMATS[fmtOf(tpl)];
  const tall = fmt.w < fmt.h;

  const save = async () => {
    const node = card.current?.querySelector<HTMLElement>(".idcard-box"); if (!node) return;
    setBusy(true);
    try { download(await cardToPng(node), `${(ctx.person.name || ctx.person.id).replace(/\s+/g, "-")}-${side}.png`); } finally { setBusy(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-modal="true" aria-label={`Pass for ${ctx.person.name}`} className="no-print fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <div className="flex w-full max-w-md flex-col items-center gap-4 py-6">
            <div style={{ perspective: 900, width: tall ? "min(72vw, 320px)" : "min(92vw, 460px)" }} onPointerMove={move} onPointerLeave={() => setTilt({ x: 0, y: 0, gx: 50, gy: 30 })}>
              <motion.div initial={{ scale: 0.85, opacity: 0, rotateY: -40 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} transition={{ type: "spring", stiffness: 220, damping: 20 }}>
                <div ref={card} className="relative" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: "transform .12s ease-out", transformStyle: "preserve-3d" }}>
                  <CardView tpl={tpl} ctx={ctx} side={side} className="shadow-2xl shadow-black/70" />
                  {/* The shine: a bright patch that follows the pointer, plus a faint rainbow edge. */}
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[3.5%/2.4%]" style={{ background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,.28), transparent 52%), linear-gradient(115deg, rgba(34,211,238,.10), rgba(168,85,247,.10) 45%, rgba(251,191,36,.08))`, mixBlendMode: "screen" }} />
                </div>
              </motion.div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {tpl.back && <button type="button" className="btn-ghost !min-h-10 px-4 text-sm" onClick={() => setSide(side === "front" ? "back" : "front")}>{side === "front" ? "Show the back" : "Show the front"}</button>}
              <button type="button" className="btn !min-h-10 px-4 text-sm" disabled={busy} onClick={save}>{busy ? "Preparing…" : `Download ${side} (PNG)`}</button>
              <button type="button" className="btn-ghost !min-h-10 px-4 text-sm" onClick={onClose}>Close</button>
            </div>
            <p className="text-xs text-zinc-400">{ctx.person.name} · {ctx.person.role}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
