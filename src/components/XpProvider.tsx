"use client";

import { AnimatePresence, m as motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * Player progress, kept only in this browser (localStorage). No account, no server.
 * XP comes from exploring the hub, using tools and playing the arcade; achievements pop a toast once.
 */
const KEY = "eh-progress-v1";
const SECTIONS = ["games", "events", "communities", "tools", "arcade", "guides", "manage"];
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

interface Progress { xp: number; done: string[]; overdrive: boolean }
interface Toast { id: number; title: string; sub: string }
interface Api {
  xp: number; level: number; into: number; span: number; overdrive: boolean;
  /** One-time achievement: gives XP and a toast the first time only. */
  award: (id: string, xp: number, title?: string) => void;
  /** Repeatable XP, for example after a game round. */
  addXp: (xp: number, why?: string) => void;
}

export const levelOf = (xp: number) => Math.floor(Math.sqrt(xp / 25)) + 1;
const Ctx = createContext<Api | null>(null);
export const useXp = () => useContext(Ctx) ?? { xp: 0, level: 1, into: 0, span: 25, overdrive: false, award() {}, addXp() {} };

function load(): Progress {
  try { const p = JSON.parse(localStorage.getItem(KEY) || "null"); if (p && typeof p.xp === "number" && Number.isFinite(p.xp)) return { xp: Math.max(0, Math.floor(p.xp)), done: Array.isArray(p.done) ? p.done.filter((x: unknown) => typeof x === "string") : [], overdrive: !!p.overdrive }; } catch {}
  return { xp: 0, done: [], overdrive: false };
}

export default function XpProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const path = usePathname() ?? "/";
  const [p, setP] = useState<Progress>({ xp: 0, done: [], overdrive: false });
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const ref = useRef(p);
  const seq = useRef(0);

  const commit = useCallback((n: Progress) => { ref.current = n; setP(n); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {} }, []);
  const toast = useCallback((title: string, sub: string) => {
    if (typeof location !== "undefined" && /^\/(live|display)\//.test(location.pathname)) return; // visitors of a live page and TV screens are not playing the hub game
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-2), { id, title, sub }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const addXp = useCallback((xp: number, why?: string) => {
    if (xp <= 0) return;
    const before = levelOf(ref.current.xp);
    const n = { ...ref.current, xp: ref.current.xp + xp };
    commit(n);
    const after = levelOf(n.xp);
    if (after > before) toast(`Level ${after}`, "You levelled up");
    else if (why) toast(`+${xp} XP`, why);
  }, [commit, toast]);

  const award = useCallback((id: string, xp: number, title?: string) => {
    if (ref.current.done.includes(id)) return;
    const before = levelOf(ref.current.xp);
    const n = { ...ref.current, xp: ref.current.xp + xp, done: [...ref.current.done, id] };
    commit(n);
    const after = levelOf(n.xp);
    if (title) toast(title, after > before ? `+${xp} XP · Level ${after}!` : `+${xp} XP`);
    else if (after > before) toast(`Level ${after}`, "You levelled up");
  }, [commit, toast]);

  useEffect(() => { const l = load(); ref.current = l; setP(l); setReady(true); }, []);
  // Progress made in another tab of this browser arrives here, so two open tabs never overwrite each other with stale numbers.
  useEffect(() => {
    const sync = (e: StorageEvent) => { if (e.key === KEY) { const l = load(); ref.current = l; setP(l); } };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => { document.documentElement.toggleAttribute("data-overdrive", p.overdrive); }, [p.overdrive]);

  // Exploring is rewarded: each section once, and a bonus for seeing them all.
  useEffect(() => {
    if (!ready) return;
    award("first-visit", 10, "Player one has entered the hub");
    const seg = path.split("/")[1];
    if (SECTIONS.includes(seg)) {
      award(`visit:${seg}`, 5);
      if (SECTIONS.every((s) => ref.current.done.includes(`visit:${s}`))) award("cartographer", 40, "Cartographer: visited every section");
    }
  }, [path, ready, award]);

  // Konami code: ↑ ↑ ↓ ↓ ← → ← → B A flips the hub into overdrive colours.
  useEffect(() => {
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === KONAMI[i] ? i + 1 : k === KONAMI[0] ? 1 : 0;
      if (i === KONAMI.length) {
        i = 0;
        const on = !ref.current.overdrive;
        commit({ ...ref.current, overdrive: on });
        toast(on ? "Overdrive unlocked" : "Overdrive off", on ? "You found the Konami code" : "Back to normal colours");
        award("konami", 30);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [commit, toast, award]);

  const level = levelOf(p.xp);
  const floor = 25 * (level - 1) ** 2;
  const api = useMemo<Api>(() => ({ xp: p.xp, level, into: p.xp - floor, span: 25 * level ** 2 - floor, overdrive: p.overdrive, award, addXp }), [p, level, floor, award, addXp]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="xp-toasts no-print pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col-reverse items-center gap-2 px-3 sm:bottom-auto sm:top-24 sm:flex-col sm:items-end sm:pr-5" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} layout initial={reduce ? false : { opacity: 0, x: 40, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 40, scale: 0.9 }} transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/[0.14] bg-[#0a0b0d] px-4 py-3">
              <span aria-hidden="true" className="grid h-9 w-9 place-items-center bg-gradient-to-br from-cyan to-purple text-sm font-black text-ink" style={{ clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)" }}>★</span>
              <span><span className="block font-display text-sm font-bold text-white">{t.title}</span><span className="block text-xs text-zinc-400">{t.sub}</span></span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
