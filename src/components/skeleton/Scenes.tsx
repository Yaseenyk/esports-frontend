"use client";

import { Sk, SkLines, CardSk } from "./Sk";
import { useWaiting } from "./useWaiting";
import type { Phase } from "@/lib/loading";

const HINT: Record<Phase, string> = {
  hidden: "",
  skeleton: "Loading…",
  slow: "Still working. This is taking a little longer than usual.",
  stuck: "This is taking too long. Check your connection, then try again.",
};

/** Wraps a loading state: shows nothing for instant loads, a skeleton for normal ones, and an honest note when it drags. */
export function Waiting({ loading, apiKey, children, onRetry, label = "Loading" }: { loading: boolean; apiKey?: string; children: React.ReactNode; onRetry?: () => void; label?: string }) {
  const phase = useWaiting(loading, apiKey);
  if (phase === "hidden") return null;
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="sk-pop">
      <span className="sr-only">{label}. {HINT[phase]}</span>
      {children}
      {(phase === "slow" || phase === "stuck") && (
        <p className="mt-4 flex flex-wrap items-center justify-center gap-3 text-center text-sm text-zinc-400">
          <span>{HINT[phase]}</span>
          {phase === "stuck" && onRetry && <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={onRetry}>Try again</button>}
        </p>
      )}
    </div>
  );
}

const Tabs = ({ n = 3 }: { n?: number }) => <div className="flex gap-2">{Array.from({ length: n }, (_, k) => <Sk key={k} i={k} round className="!h-9" w={k === 0 ? 96 : 84} />)}</div>;

/** The three working steps of the ID card studio, each shaped like the real screen so nothing jumps when it arrives. */
export function StepSkeleton({ kind }: { kind: "people" | "design" | "print" }) {
  const title = { people: "People", design: "Design", print: "Print" }[kind];
  return (
    <div role="status" aria-busy="true" className="sk-pop space-y-4">
      <span className="sr-only">Loading the {title} step</span>
      {kind === "people" && (
        <>
          <Tabs />
          <div className="sk-card grid place-items-center px-4 py-10"><span className="sk-laser" /><div className="w-full max-w-sm space-y-3 text-center"><Sk className="mx-auto !h-12 !w-12" round /><Sk className="sk-line mx-auto" w="70%" i={1} /><Sk className="sk-line mx-auto" w="45%" i={2} /></div></div>
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, k) => (
              <div key={k} className="flex items-center gap-3 rounded-xl border border-white/10 p-3"><Sk round className="!h-10 !w-10 shrink-0" i={k} /><div className="flex-1 space-y-2"><Sk className="sk-line" w="48%" i={k + 1} /><Sk className="sk-line !h-2.5" w="28%" i={k + 2} /></div><Sk className="!h-7 hidden sm:block" w={72} i={k + 3} /></div>
            ))}
          </div>
        </>
      )}
      {kind === "design" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div className="space-y-3"><Tabs n={4} /><div className="mx-auto w-full max-w-xl"><CardSk /></div><div className="flex gap-2 overflow-hidden">{Array.from({ length: 5 }, (_, k) => <CardSk key={k} i={k} className="!w-28 shrink-0" />)}</div></div>
          <div className="space-y-4 rounded-2xl border border-white/10 p-4"><SkLines n={2} /><div className="grid grid-cols-3 gap-2">{Array.from({ length: 6 }, (_, k) => <Sk key={k} i={k} className="!h-14" />)}</div><SkLines n={4} i={3} /></div>
        </div>
      )}
      {kind === "print" && (
        <>
          <div className="flex flex-wrap gap-2"><Sk w={120} className="!h-10" /><Sk w={120} i={1} className="!h-10" /><Sk w={150} i={2} className="!h-10" /></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, k) => <CardSk key={k} i={k} />)}</div>
        </>
      )}
    </div>
  );
}

/** Whole-page placeholder for the studio while its first chunk arrives. */
export function StudioSkeleton() {
  return (
    <div role="status" aria-busy="true" className="sk-pop space-y-5">
      <span className="sr-only">Loading the ID card maker</span>
      <div className="flex items-center justify-between gap-3"><div className="space-y-2"><Sk className="!h-7" w={220} /><Sk className="sk-line" w={320} i={1} /></div><div className="hidden gap-2 sm:flex"><Sk className="!h-10" w={96} i={2} /><Sk className="!h-10" w={96} i={3} /></div></div>
      <div className="grid grid-cols-4 gap-2">{Array.from({ length: 4 }, (_, k) => <Sk key={k} i={k} className="!h-14 !rounded-xl" />)}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-white/10 p-4">{Array.from({ length: 4 }, (_, k) => <div key={k} className="space-y-2"><Sk className="sk-line !h-2.5" w={90} i={k} /><Sk className="!h-11" i={k + 1} /></div>)}</div>
        <div className="grid place-items-center rounded-2xl border border-white/10 p-4"><div className="w-full max-w-md"><CardSk /></div></div>
      </div>
    </div>
  );
}

/** Generic list/grid of cards for the events, games and communities pages. */
export function GridSkeleton({ n = 6, cols = "sm:grid-cols-2 lg:grid-cols-3" }: { n?: number; cols?: string }) {
  return (
    <div role="status" aria-busy="true" className="sk-pop">
      <span className="sr-only">Loading</span>
      <div className="mb-6 space-y-3"><Sk className="!h-9" w="40%" /><Sk className="sk-line" w="60%" i={1} /></div>
      <div className="mb-5 flex gap-2 overflow-hidden"><Tabs n={5} /></div>
      <div className={`grid gap-4 ${cols}`}>
        {Array.from({ length: n }, (_, k) => (
          <div key={k} className="card space-y-3"><div className="flex items-center gap-3"><Sk round className="!h-11 !w-11 shrink-0" i={k} /><div className="flex-1 space-y-2"><Sk className="sk-line" w="70%" i={k + 1} /><Sk className="sk-line !h-2.5" w="40%" i={k + 2} /></div></div><SkLines n={2} i={k + 3} /><div className="flex gap-2"><Sk className="!h-6" w={60} i={k} /><Sk className="!h-6" w={48} i={k + 1} /></div></div>
        ))}
      </div>
    </div>
  );
}
