import { COMPARE_PATH } from "./compare";
import { FF_COMPARE_PATH } from "./compare-ff";
import { ESPORTS_PAGE, ESPORTS_PATH } from "./esports-id-page";
import { ALL_GAME_PAGES } from "./game-pages";
import { STUDENT_PAGE, STUDENT_PATH } from "./student-page";

/** Indexable pages that are not tools or guides: the game points table pages, the student ID card page and the comparison. One list, used by the sitemap and the tests. */
export const GROWTH_PAGES: { path: string; priority: number; updated?: string }[] = [
  ...ALL_GAME_PAGES.map((g) => ({ path: g.path, priority: 0.8, updated: g.updated })),
  { path: STUDENT_PATH, priority: 0.8, updated: STUDENT_PAGE.updated },
  { path: ESPORTS_PATH, priority: 0.8, updated: ESPORTS_PAGE.updated },
  { path: COMPARE_PATH, priority: 0.7 },
  { path: FF_COMPARE_PATH, priority: 0.7, updated: "2026-11-25" },
];
