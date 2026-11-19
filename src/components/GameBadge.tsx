import { LOGOS, type Game } from "@/lib/data";

/**
 * Our own text badge for a game (publishers' icons are not used). An image is used only for slugs in LOGOS.
 * Game names are trademarks of their owners and are used only to identify the game.
 */
export default function GameBadge({ game, size = "md" }: { game: Game; size?: "sm" | "md" | "lg" | "xl" }) {
  const dim = size === "xl" ? "h-24 w-24 text-2xl rounded-3xl" : size === "lg" ? "h-16 w-16 text-lg rounded-2xl" : size === "sm" ? "h-9 w-9 text-[10px] rounded-lg" : "h-12 w-12 text-xs rounded-xl";
  if (LOGOS.has(game.slug)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/games/${game.slug}.webp`} alt="" width={96} height={96} loading="lazy" className={`shrink-0 object-cover ring-1 ring-white/10 ${dim}`} />;
  }
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center bg-gradient-to-br ${game.hue} font-display font-bold tracking-tight text-white ring-1 ring-white/10 ${dim}`}>
      {game.short.slice(0, 4)}
    </span>
  );
}
