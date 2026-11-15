import Link from "next/link";
import type { Block } from "@/content/guides";
import ScrollTable from "@/components/seo/ScrollTable";

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
          case "table": return <ScrollTable key={i} variant="prose" label={`Table: ${b.head.slice(0, 3).join(", ")}`} head={b.head} rows={b.rows} />;
        }
      })}
    </>
  );
}
