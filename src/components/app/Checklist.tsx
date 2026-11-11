import Link from "next/link";

export interface CheckStep { n: number; title: string; hint: string; done: boolean; href?: string; cta?: string }

/** The five jobs of an event day, in order. Done steps get a tick; the first one not done is "Next" and gets the one primary button. */
export default function Checklist({ steps, heading = "Start here", intro }: { steps: CheckStep[]; heading?: string; intro?: string }) {
  const next = steps.find((s) => !s.done);
  const doneCount = steps.filter((s) => s.done).length;
  return (
    <section aria-label="Getting started checklist" className="card space-y-3 !p-4 sm:!p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-white">{heading}</h2>
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-zinc-200">{doneCount} of {steps.length} done</span>
      </div>
      {intro && <p className="text-sm text-zinc-300">{intro}</p>}
      <ol className="space-y-2">
        {steps.map((s) => {
          const isNext = next === s;
          return (
            <li key={s.n} data-done={s.done ? "true" : "false"} className={`flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5 ${isNext ? "border-cyan/60 bg-[#0c1d27]" : "border-white/10"}`}>
              <span aria-hidden="true" className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-extrabold ${s.done ? "bg-emerald-400 text-ink" : isNext ? "bg-cyan text-ink" : "bg-white/10 text-zinc-300"}`}>{s.done ? "✓" : s.n}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">{s.title}<span className="sr-only">{s.done ? " (done)" : isNext ? " (next)" : " (to do)"}</span></span>
                <span className="block text-xs text-zinc-400">{s.hint}</span>
              </span>
              {isNext && s.href && <Link href={s.href} className="btn !min-h-11 px-4 text-sm">{s.cta ?? "Do this"}</Link>}
              {!isNext && !s.done && s.href && <Link href={s.href} className="text-sm text-cyan underline">{s.cta ?? "Open"}</Link>}
            </li>
          );
        })}
      </ol>
      {!next && <p role="status" className="text-sm text-emerald-300">Everything is done. You are ready for the day.</p>}
    </section>
  );
}
