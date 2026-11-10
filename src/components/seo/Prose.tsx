import Link from "next/link";
import type { Block } from "@/content/guides";

/** Renders [text](/path/) as a link and leaves everything else as plain text. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p);
        if (!m) return <span key={i}>{p}</span>;
        const href = m[2]!;
        return /^https?:/.test(href)
          ? <a key={i} href={href} rel="noopener noreferrer" className="text-cyan underline underline-offset-2 hover:text-white">{m[1]}</a>
          : <Link key={i} href={href} className="text-cyan underline underline-offset-2 hover:text-white">{m[1]}</Link>;
      })}
    </>
  );
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "p": return <p key={i} className="leading-relaxed text-zinc-200"><Inline text={b.x} /></p>;
          case "h3": return <h3 key={i} className="pt-2 font-display text-lg font-bold text-white">{b.x}</h3>;
          case "ul": return <ul key={i} className="list-disc space-y-2 pl-6 text-zinc-200 marker:text-cyan">{b.items.map((x, j) => <li key={j} className="leading-relaxed"><Inline text={x} /></li>)}</ul>;
          case "ol": return <ol key={i} className="list-decimal space-y-2 pl-6 text-zinc-200 marker:font-semibold marker:text-cyan">{b.items.map((x, j) => <li key={j} className="leading-relaxed"><Inline text={x} /></li>)}</ol>;
          case "note": return <p key={i} role="note" className="rounded-xl border border-white/[0.14] bg-[#0a0b0d] p-4 text-sm leading-relaxed text-zinc-300"><Inline text={b.x} /></p>;
          case "table": return (
            <div key={i} role="region" aria-label={`Table: ${b.head.slice(0, 3).join(", ")}`} tabIndex={0} className="overflow-x-auto rounded-xl border border-white/[0.14] outline-none focus-visible:ring-2 focus-visible:ring-cyan">
              <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                <thead><tr className="bg-[#0f1013]">{b.head.map((h) => <th key={h} scope="col" className="border-b border-white/[0.14] px-3 py-2 font-semibold text-white">{h}</th>)}</tr></thead>
                <tbody>{b.rows.map((r, j) => <tr key={j} className="odd:bg-transparent even:bg-[#0c0d10]">{r.map((c, k) => (k === 0 ? <th key={k} scope="row" className="border-b border-white/[0.08] px-3 py-2 font-medium text-zinc-100">{c}</th> : <td key={k} className="border-b border-white/[0.08] px-3 py-2 text-zinc-300">{c}</td>))}</tr>)}</tbody>
              </table>
            </div>
          );
        }
      })}
    </>
  );
}
