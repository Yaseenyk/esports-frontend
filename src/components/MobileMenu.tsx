"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import NavLinks from "./NavLinks";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative ms-auto md:hidden">
      <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-200">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
          <motion.path animate={{ d: open ? "M6 6l12 12" : "M4 7h16" }} /><motion.path animate={{ opacity: open ? 0 : 1 }} d="M4 12h16" /><motion.path animate={{ d: open ? "M6 18L18 6" : "M4 17h16" }} />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.18 }} className="absolute end-0 top-full mt-2 w-64 rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur">
            <NavLinks mobile onNavigate={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
