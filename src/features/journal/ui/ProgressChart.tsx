import type { Bucket } from "@/features/journal/domain";

/**
 * One measure over time, one axis, one series (the title names it, so there is no legend box). Bars for counts, a 2 px line with 8 px markers for
 * averages; periods with no matches leave a gap in the line. Each mark has a native tooltip (<title>), and the screen offers the same numbers as a table.
 * Presentation only. Colours: the cyan accent for the mark, zinc text tokens for labels, white at 10% for the grid.
 */
const W = 360, H = 200, L = 32, R = 8, T = 12, B = 28;

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

export function ProgressChart({ id, title, buckets, value, kind, unit }: { id: string; title: string; buckets: Bucket[]; value: (b: Bucket) => number | null; kind: "bar" | "line"; unit: string }) {
  const vals = buckets.map(value);
  const max = niceMax(Math.max(0, ...vals.map((v) => v ?? 0)));
  const iw = W - L - R, ih = H - T - B;
  const step = iw / Math.max(1, buckets.length);
  const x = (i: number) => L + step * i + step / 2;
  const y = (v: number) => T + ih - (v / max) * ih;
  const every = Math.max(1, Math.ceil(buckets.length / 6));
  const ticks = [0, max / 2, max];
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
  // line segments: consecutive periods that both have a value
  const segs: string[] = [];
  vals.forEach((v, i) => { if (v !== null && i > 0 && vals[i - 1] !== null) segs.push(`M${x(i - 1)},${y(vals[i - 1]!)}L${x(i)},${y(v)}`); });
  const summary = buckets.map((b, i) => `${b.label}: ${vals[i] === null ? "no matches" : `${fmt(vals[i]!)} ${unit}`}`).join("; ");
  return (
    <figure className="space-y-2">
      <figcaption id={`${id}-t`} className="font-medium text-zinc-100">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-labelledby={`${id}-t ${id}-d`}>
        <desc id={`${id}-d`}>{summary}</desc>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="stroke-white/10" strokeWidth={1} />
            <text x={L - 6} y={y(t) + 4} textAnchor="end" className="fill-zinc-400" fontSize={11}>{fmt(t)}</text>
          </g>
        ))}
        {buckets.map((b, i) => (i % every === 0 || i === buckets.length - 1) && (
          <text key={b.key} x={x(i)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={11}>{b.label}</text>
        ))}
        {kind === "bar" && vals.map((v, i) => v !== null && v > 0 && (
          <rect key={buckets[i]!.key} x={x(i) - Math.min(18, step * 0.6) / 2} y={y(v)} width={Math.min(18, step * 0.6)} height={T + ih - y(v)} rx={4} className="fill-cyan-400">
            <title>{`${buckets[i]!.label}: ${fmt(v)} ${unit}`}</title>
          </rect>
        ))}
        {kind === "line" && <path d={segs.join("")} className="stroke-cyan-400" strokeWidth={2} fill="none" />}
        {kind === "line" && vals.map((v, i) => v !== null && (
          <circle key={buckets[i]!.key} cx={x(i)} cy={y(v)} r={4} className="fill-cyan-400 stroke-surface" strokeWidth={2}>
            <title>{`${buckets[i]!.label}: ${fmt(v)} ${unit}`}</title>
          </circle>
        ))}
      </svg>
    </figure>
  );
}
