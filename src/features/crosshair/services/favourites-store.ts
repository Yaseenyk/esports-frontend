import { parseFavourites, type Favourite } from "@/features/crosshair/domain";

/** Favourite crosshair codes live in this browser's localStorage only. Nothing is sent. */
const KEY = "eh_crosshair_favs_v1";

export function loadFavourites(): Favourite[] {
  try { return parseFavourites(localStorage.getItem(KEY)); } catch { return []; }
}
export function saveFavourites(list: Favourite[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage blocked: favourites last until the page closes */ }
}
