"use client";

import { admin } from "@/lib/admin/client";
import { fmtBytes } from "@/lib/admin/labels";
import { Empty, Failed, H1, Loading, useLoad } from "./ui";

const SOURCE: Record<string, string> = { estimate: "Estimate (one in 20 requests sampled)", sampled: "Estimate (one in 20 requests sampled)", exact: "Exact count", provider: "From Cloudflare, once a day" };

export default function Usage() {
  const r = useLoad(() => admin.usage());
  if (r.status === "loading") return <><H1>Usage</H1><Loading what="usage" /></>;
  if (r.status === "error" || !r.data) return <><H1>Usage</H1><Failed error={r.error} onRetry={r.reload} /></>;
  const { items, note } = r.data;
  return (
    <>
      <H1 sub="How close the free plan is to its daily limits. Each number says where it comes from.">Usage</H1>
      {items.length === 0 ? <Empty>No usage numbers yet.</Empty> : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((i) => {
            const bytes = i.unit === "bytes";
            const value = i.value === null ? "Not available yet" : bytes ? fmtBytes(i.value) : i.value.toLocaleString("en-IN");
            const pct = i.value !== null && i.limit ? Math.min(100, Math.round((i.value / i.limit) * 100)) : null;
            return (
              <li key={i.key} className="card">
                <p className="text-sm text-zinc-300">{i.label}</p>
                <p className="mt-1 font-display text-3xl font-bold text-white">{value}</p>
                {pct !== null && i.limit && (
                  <>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800" role="img" aria-label={`${pct} percent of the limit`}><div className={`h-full ${pct >= 80 ? "bg-amber-400" : "bg-cyan"}`} style={{ width: `${pct}%` }} /></div>
                    <p className="mt-1 text-xs text-zinc-400">{pct}% of {bytes ? fmtBytes(i.limit) : i.limit.toLocaleString("en-IN")}</p>
                  </>
                )}
                <p className="mt-2 text-xs text-zinc-400">Source: {SOURCE[i.source] ?? i.source}</p>
                {i.note && <p className="mt-1 text-xs text-zinc-400">{i.note}</p>}
              </li>
            );
          })}
        </ul>
      )}
      {note && <p className="mt-4 text-sm text-zinc-300">{note}</p>}
    </>
  );
}
