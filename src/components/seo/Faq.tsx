export interface FaqItem { q: string; a: string }

/**
 * Questions and answers, readable as a real section: numbered, with a clear open state, and the first few already open.
 * It is plain HTML (details and summary, no script), so every answer is in the page for readers and for search engines whether or not it is open.
 * Answers may hold several paragraphs: a blank line starts a new one.
 */
export default function Faq({ items, open = 3 }: { items: FaqItem[]; open?: number }) {
  return (
    <ol className="space-y-3">
      {items.map((f, i) => (
        <li key={f.q}>
          <details open={i < open} className="group rounded-2xl border border-white/[0.14] bg-[#0a0b0d] transition-colors open:border-cyan/40">
            <summary className="flex cursor-pointer list-none items-start gap-3 rounded-2xl p-4 outline-none focus-visible:ring-2 focus-visible:ring-cyan sm:gap-4 sm:p-5 [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true" className="mt-0.5 shrink-0 font-mono text-xs font-bold tracking-wider text-cyan">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 font-display text-base font-semibold leading-snug text-white sm:text-lg">{f.q}</span>
              <span aria-hidden="true" className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/20 text-cyan transition-transform group-open:rotate-45">
                <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-current" strokeWidth="1.6" strokeLinecap="round"><path d="M6 1v10M1 6h10" /></svg>
              </span>
            </summary>
            <div className="space-y-3 border-t border-white/10 px-4 pb-5 pt-4 text-[0.95rem] leading-7 text-zinc-200 sm:px-5 sm:pl-[3.25rem]">
              {f.a.split(/\n\s*\n/).map((p) => <p key={p} className="max-w-[68ch]">{p}</p>)}
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
