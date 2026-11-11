import { COMPARE_PATH } from "./compare";
import { GAME_PAGES } from "./game-pages";

/** Indexable pages that are not tools or guides: the game points table pages and the comparison. One list, used by the sitemap and the tests. */
export const GROWTH_PAGES: { path: string; priority: number }[] = [
  ...Object.values(GAME_PAGES).map((g) => ({ path: g.path, priority: 0.8 })),
  { path: COMPARE_PATH, priority: 0.7 },
];
