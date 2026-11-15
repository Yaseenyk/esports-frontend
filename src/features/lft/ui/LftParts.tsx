import Link from "next/link";
import { gameLabel, kindLabel, ROLE_LABELS, GAMES, KINDS, ROLES, type BoardFilters, type Listing } from "@/features/lft/domain";
import { hasAnyFilter } from "@/features/lft/filters";
import { SelectInput, TextInput } from "@/features/shared/ui/Fields";
import { StatusBadge } from "@/features/shared/ui/States";
import { box, btnSecondary } from "@/features/shared/ui/styles";

const day = (iso: string) => { const t = Date.parse(iso); return Number.isFinite(t) ? new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""; };

export function rankText(min: number | null, max: number | null): string {
  if (min === null && max === null) return "Any rank";
  if (min !== null && max !== null) return min === max ? `Skill level ${min}` : `Skill level ${min} to ${max}`;
  return min !== null ? `Skill level ${min} and up` : `Up to skill level ${max}`;
}
export const placeText = (l: Pick<Listing, "city" | "state" | "onlineOk">): string => [[l.city, l.state].filter(Boolean).join(", ") || null, l.onlineOk ? "Online OK" : null].filter(Boolean).join(" · ") || "Anywhere";

export function LftFilters({ value, onChange, onClear }: { value: BoardFilters; onChange: (f: BoardFilters) => void; onClear: () => void }) {
  const set = <K extends keyof BoardFilters>(k: K, v: BoardFilters[K]) => onChange({ ...value, [k]: v });
  return (
    <form role="search" aria-label="Filter the board" onSubmit={(e) => e.preventDefault()} className={`${box} space-y-4`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput id="f-game" label="Game" value={value.game} onChange={(v) => set("game", v)} options={GAMES} blank="Any game" />
        <SelectInput id="f-kind" label="Posted by" value={value.kind} onChange={(v) => set("kind", v)} options={KINDS} blank="Players and teams" />
      </div>
      <details open={!!(value.role || value.online || value.rankMin || value.rankMax || value.state || value.city)} className="group">
        <summary className="flex min-h-11 cursor-pointer items-center text-cyan-400">More filters: role, place, skill level</summary>
        <div className="grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
          <SelectInput id="f-role" label="Role" value={value.role} onChange={(v) => set("role", v)} options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))} blank="Any role" />
          <div className="flex items-end"><label className="flex min-h-11 items-center gap-2 text-zinc-100"><input type="checkbox" checked={value.online} onChange={(e) => set("online", e.target.checked)} className="h-5 w-5 accent-cyan-400" />Online players OK</label></div>
          <TextInput id="f-state" label="State" value={value.state} onChange={(v) => set("state", v)} maxLength={60} />
          <TextInput id="f-city" label="City" value={value.city} onChange={(v) => set("city", v)} maxLength={60} />
          <TextInput id="f-rmin" label="Skill level from" value={value.rankMin} onChange={(v) => set("rankMin", v.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" help="A number from 0 (just started) to 100 (top rank in that game)." />
          <TextInput id="f-rmax" label="Skill level up to" value={value.rankMax} onChange={(v) => set("rankMax", v.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" />
        </div>
      </details>
      {hasAnyFilter(value) && <div><button type="button" onClick={onClear} className={btnSecondary}>Clear all filters</button></div>}
    </form>
  );
}

export function LftCard({ l }: { l: Listing }) {
  return (
    <li>
      <Link href={`/lft/listing/?id=${encodeURIComponent(l.id)}`} className={`block ${box} transition-colors hover:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400`}>
        <span className="flex flex-wrap items-center gap-2"><StatusBadge label={kindLabel(l.kind)} tone="accent" /><span className="text-sm text-zinc-300">{gameLabel(l.game)}</span></span>
        {l.teamName && <span className="mt-2 block font-display text-lg text-zinc-100">{l.teamName}</span>}
        <span className="mt-2 block text-zinc-100">{l.message.length > 220 ? `${l.message.slice(0, 219)}…` : l.message}</span>
        <span className="mt-3 block text-sm text-zinc-300">{l.roles.map((r) => ROLE_LABELS[r] ?? r).join(", ") || "Any role"} · {rankText(l.rankMin, l.rankMax)}</span>
        <span className="mt-1 block text-xs text-zinc-400">{placeText(l)} · bumped {day(l.lastBumpedAt)}</span>
      </Link>
    </li>
  );
}

export function ListingDetail({ l }: { l: Listing }) {
  return (
    <article className={box}>
      <p className="flex flex-wrap items-center gap-2"><StatusBadge label={kindLabel(l.kind)} tone="accent" /><span className="text-sm text-zinc-300">{gameLabel(l.game)}</span></p>
      {l.teamName && <h2 className="mt-2 font-display text-lg text-zinc-100">{l.teamName}</h2>}
      <p className="mt-3 whitespace-pre-line text-zinc-100">{l.message}</p>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="text-zinc-400">Roles</dt><dd className="text-zinc-100">{l.roles.map((r) => ROLE_LABELS[r] ?? r).join(", ") || "Any role"}</dd></div>
        <div><dt className="text-zinc-400">Rank</dt><dd className="text-zinc-100">{rankText(l.rankMin, l.rankMax)}</dd></div>
        <div><dt className="text-zinc-400">Where</dt><dd className="text-zinc-100">{placeText(l)}</dd></div>
        <div><dt className="text-zinc-400">Open until</dt><dd className="text-zinc-100">{day(l.expiresAt)}</dd></div>
      </dl>
    </article>
  );
}
