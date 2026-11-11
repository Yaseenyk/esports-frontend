import type { ReactNode } from "react";

/**
 * One numbered step of a tool. Every tool is a short list of these, in order, so a first-time visitor always knows where they are
 * and what to do next: a number, a plain title, one sentence of instruction, then the controls.
 * `status` is a small note on the right (for example "8 teams" or "3 of 7 decided"); `done` turns the number into a tick.
 */
export default function ToolStep({ n, title, hint, status, done = false, actions, children, id, printHeader = false, className = "" }: {
  n: number; title: string; hint?: ReactNode; status?: ReactNode; done?: boolean; actions?: ReactNode; children?: ReactNode; id?: string;
  /** Keep the numbered header when the page is printed. Off by default: a printout should hold the result, not the instructions. */
  printHeader?: boolean; className?: string;
}) {
  const hid = id ? `${id}-h` : undefined;
  return (
    <section id={id} aria-labelledby={hid} className={`card space-y-4 ${className}`}>
      <header className={`flex flex-wrap items-start gap-3 ${printHeader ? "" : "print:hidden"}`}>
        <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${done ? "bg-emerald-400 text-ink" : "bg-cyan text-ink"}`}>{done ? "✓" : n}</span>
        <div className="min-w-0 flex-1 basis-56">
          <h3 id={hid} className="font-display text-lg font-bold leading-tight text-white"><span className="sr-only">Step {n}: </span>{title}</h3>
          {hint && <p className="mt-1 text-sm leading-6 text-zinc-300">{hint}</p>}
        </div>
        {(status || actions) && <div className="flex flex-wrap items-center gap-2">{status && <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-zinc-200">{status}</span>}{actions}</div>}
      </header>
      {children}
    </section>
  );
}
