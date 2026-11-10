"use client";

import { AnimatePresence, m as motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useXp } from "@/components/XpProvider";

const BEST = "eh-arcade-best-v1";
function readBest(): { aim: number; react: number } {
  try { const b = JSON.parse(localStorage.getItem(BEST) || "{}"); return { aim: +b.aim || 0, react: +b.react || 0 }; } catch { return { aim: 0, react: 0 }; }
}
function writeBest(b: { aim: number; react: number }) { try { localStorage.setItem(BEST, JSON.stringify(b)); } catch {} }

const ROUND = 30;

function AimTrainer({ onBest, best }: { onBest: (n: number) => void; best: number }) {
  const { addXp, award } = useXp();
  const [state, setState] = useState<"idle" | "run" | "done">("idle");
  const [left, setLeft] = useState(ROUND);
  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [t, setT] = useState<{ x: number; y: number; k: number } | null>(null);
  const timers = useRef<{ tick?: ReturnType<typeof setInterval>; life?: ReturnType<typeof setTimeout> }>({});
  const stats = useRef({ hits: 0, miss: 0 });
  const spawn = useCallback(() => {
    setT({ x: 8 + Math.random() * 84, y: 12 + Math.random() * 76, k: Math.random() });
    clearTimeout(timers.current.life);
    timers.current.life = setTimeout(() => { stats.current.miss++; setMiss(stats.current.miss); spawn(); }, 1300);
  }, []);
  const stop = useCallback(() => { clearInterval(timers.current.tick); clearTimeout(timers.current.life); setT(null); }, []);
  const finish = useCallback(() => {
    stop(); setState("done");
    const h = stats.current.hits;
    if (h > best) onBest(h);
    addXp(Math.min(40, h * 2), `Aim round: ${h} hits`);
    if (h >= 25) award("sharpshooter", 25, "Sharpshooter: 25 hits in one round");
  }, [stop, best, onBest, addXp, award]);
  const start = () => {
    stats.current = { hits: 0, miss: 0 }; setHits(0); setMiss(0); setLeft(ROUND); setState("run"); spawn();
    timers.current.tick = setInterval(() => setLeft((l) => l - 1), 1000);
  };
  useEffect(() => { if (state === "run" && left <= 0) finish(); }, [left, state, finish]);
  useEffect(() => stop, [stop]);
  const acc = hits + miss ? Math.round((hits / (hits + miss)) * 100) : 0;

  return (
    <section className="card !p-4 sm:!p-6" aria-labelledby="aim">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 id="aim" className="text-2xl font-bold text-white">Aim trainer</h2><p className="text-sm text-zinc-400">Hit as many targets as you can in {ROUND} seconds. Targets vanish fast.</p></div>
        <dl className="flex gap-5 text-center">
          {[["Time", state === "idle" ? ROUND : Math.max(0, left)], ["Hits", hits], ["Accuracy", `${acc}%`], ["Best", best]].map(([k, v]) => (<div key={k as string}><dd className="font-display text-2xl font-bold text-white">{v}</dd><dt className="text-[11px] uppercase tracking-wider text-zinc-500">{k}</dt></div>))}
        </dl>
      </div>
      <div className="relative mt-4 aspect-[16/10] w-full touch-none select-none overflow-hidden rounded-2xl border border-white/10 bg-ink/70 sm:aspect-video"
        onPointerDown={() => { if (state === "run") { stats.current.miss++; setMiss(stats.current.miss); } }}>
        {state !== "run" && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-ink/60 backdrop-blur-sm">
            <div className="text-center">
              {state === "done" && <p className="mb-3 font-display text-3xl font-bold text-white">{hits} hits <span className="text-zinc-500">· {acc}% accuracy</span></p>}
              <button type="button" className="btn" onClick={start}>{state === "done" ? "Play again" : "Start"}</button>
            </div>
          </div>
        )}
        <AnimatePresence>
          {state === "run" && t && (
            <motion.button key={`${t.x}-${t.y}`} type="button" aria-label="Target"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, pointerEvents: "none" }} transition={{ type: "spring", stiffness: 500, damping: 22 }}
              onPointerDown={(e) => { e.stopPropagation(); stats.current.hits++; setHits(stats.current.hits); spawn(); }}
              className="absolute -ml-7 -mt-7 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-cyan to-purple shadow-[0_0_30px_rgba(34,211,238,.6)] outline-none"
              style={{ left: `${t.x}%`, top: `${t.y}%` }}>
              <span className="h-8 w-8 rounded-full border-4 border-ink/80" /><span className="absolute h-2 w-2 rounded-full bg-ink" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Reaction({ onBest, best }: { onBest: (n: number) => void; best: number }) {
  const { addXp, award } = useXp();
  const [s, setS] = useState<"idle" | "wait" | "go" | "early" | "result">("idle");
  const [ms, setMs] = useState(0);
  const t0 = useRef(0);
  const to = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(to.current), []);
  const press = () => {
    if (s === "idle" || s === "early" || s === "result") {
      setS("wait");
      to.current = setTimeout(() => { t0.current = performance.now(); setS("go"); }, 1500 + Math.random() * 2800);
    } else if (s === "wait") {
      clearTimeout(to.current); setS("early");
    } else if (s === "go") {
      const r = Math.round(performance.now() - t0.current);
      setMs(r); setS("result");
      if (!best || r < best) onBest(r);
      addXp(r < 300 ? 15 : 8, `Reaction: ${r} ms`);
      if (r < 250) award("quick-draw", 25, "Quick draw: under 250 ms");
    }
  };
  const view = {
    idle: { bg: "bg-white/5", big: "Tap to start", sub: "When the panel turns green, tap as fast as you can." },
    wait: { bg: "bg-rose-600/40", big: "Wait for green…", sub: "Don't tap yet." },
    go: { bg: "bg-emerald-500/70", big: "TAP!", sub: "" },
    early: { bg: "bg-amber-500/30", big: "Too early", sub: "Tap to try again." },
    result: { bg: "bg-cyan/20", big: `${ms} ms`, sub: "Tap to go again." },
  }[s];
  return (
    <section className="card !p-4 sm:!p-6" aria-labelledby="rt">
      <div className="flex items-center justify-between gap-3">
        <div><h2 id="rt" className="text-2xl font-bold text-white">Reaction test</h2><p className="text-sm text-zinc-400">How fast are your reflexes?</p></div>
        <dl className="text-center"><dd className="font-display text-2xl font-bold text-white">{best ? `${best} ms` : "—"}</dd><dt className="text-[11px] uppercase tracking-wider text-zinc-500">Best</dt></dl>
      </div>
      <button type="button" onPointerDown={press} onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); press(); } }}
        className={`mt-4 flex h-56 w-full select-none flex-col items-center justify-center rounded-2xl border border-white/10 outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-cyan ${view.bg}`}>
        <span className="font-display text-4xl font-bold text-white sm:text-5xl">{view.big}</span>
        {view.sub && <span className="mt-2 text-sm text-zinc-300">{view.sub}</span>}
      </button>
    </section>
  );
}

export default function Arcade() {
  const [best, setBest] = useState({ aim: 0, react: 0 });
  useEffect(() => setBest(readBest()), []);
  const upd = (k: "aim" | "react") => (n: number) => setBest((b) => { const nb = { ...b, [k]: n }; writeBest(nb); return nb; });
  return (
    <div className="mt-8 grid gap-6">
      <AimTrainer best={best.aim} onBest={upd("aim")} />
      <Reaction best={best.react} onBest={upd("react")} />
    </div>
  );
}
