import type { Game } from "@/lib/data";

/** Our own badge: the game's short name on a gradient. Publishers' logos and artwork are not used. */
export default function GameBadge({ game, size = "md" }: { game: Game; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-16 w-16 text-lg" : size === "sm" ? "h-9 w-9 text-[10px]" : "h-12 w-12 text-xs";
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-xl bg-gradient-to-br ${game.hue} font-black tracking-tight text-white shadow-lg shadow-black/40 ${dim}`}>
      {game.short.slice(0, 4)}
    </span>
  );
}
