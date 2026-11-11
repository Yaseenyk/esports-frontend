export interface FaqItem { q: string; a: string }

/**
 * Questions and answers as a calm list: a numbered question, a chevron that turns when it opens, and the answer directly beneath it.
 * The first answer is open. It is plain HTML (details and summary, no script), so every answer is in
 * the page for readers and for search engines whether or not it is open. A blank line inside an answer starts a new paragraph.
 */
export default function Faq({ items, open = 1, className = "max-w-3xl" }: { items: FaqItem[]; open?: number; className?: string }) {
  return (
    <ol className={`space-y-2.5 ${className}`}>
      {items.map((f, i) => (
        <li key={f.q}>
          <details open={i < open} className="group overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0a0b0d] transition-colors open:border-cyan/35 hover:border-white/25 open:hover:border-cyan/50">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan sm:gap-4 sm:px-5 [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true" className="w-6 shrink-0 font-mono text-xs font-bold tracking-wider text-cyan/80">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 font-display text-[0.95rem] font-semibold leading-snug text-white sm:text-base">{f.q}</span>
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 fill-none stroke-current text-zinc-400 transition-transform duration-200 group-open:rotate-180 group-open:text-cyan" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5" /></svg>
            </summary>
            <div className="space-y-3 px-4 pb-5 text-[0.92rem] leading-7 text-zinc-300 sm:pl-[3.75rem] sm:pr-8">
              {f.a.split(/\n\s*\n/).map((p) => <p key={p}>{p}</p>)}
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
