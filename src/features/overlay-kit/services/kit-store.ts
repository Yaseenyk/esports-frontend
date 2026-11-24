import { KIT_SOURCES, sanitizeFeed, sanitizePlayers, type KitFeed, type KitPlayers, type KitSource } from "@/features/overlay-kit/domain";

/**
 * The data layer of the overlay kit: this browser's localStorage and a BroadcastChannel. Nothing goes over the network.
 * A tool page writes its standings here; the overlay page (an OBS browser source, or a second tab) reads them. Both pages must run in the
 * same browser: OBS's built-in browser does not share storage with Chrome or Edge (the guide explains the OBS dock and the snapshot link).
 * Every read is checked by the domain's sanitizers, so a hand-edited value can only ever be shown as plain text.
 */
export const KIT_CHANNEL = "eh-overlay-kit";
const FEED_KEY = (s: KitSource) => `eh-overlay-kit:feed:${s}`;
const PLAYERS_KEY = "eh-overlay-kit:players";
const ON_KEY = "eh-overlay-kit:on";

type Msg = { kind: "feed"; feed: unknown } | { kind: "players"; players: unknown } | { kind: "hello" };

const store = (): Storage | null => { try { return typeof localStorage === "undefined" ? null : localStorage; } catch { return null; } };
const readJson = (k: string): unknown => { try { const s = store()?.getItem(k); return s ? JSON.parse(s) : null; } catch { return null; } };
const writeJson = (k: string, v: unknown): boolean => { try { const s = store(); if (!s) return false; s.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
const channel = (): BroadcastChannel | null => (typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(KIT_CHANNEL));

let sender: BroadcastChannel | null = null;
const post = (m: Msg) => { try { sender ??= channel(); sender?.postMessage(m); } catch { /* channel closed or unsupported */ } };

/** Every source's last feed saved in this browser. */
export function readFeeds(): KitFeed[] {
  return KIT_SOURCES.map((s) => sanitizeFeed(readJson(FEED_KEY(s)))).filter((f): f is KitFeed => f !== null);
}
export const readPlayers = (): KitPlayers | null => sanitizePlayers(readJson(PLAYERS_KEY));

/** Saves a tool's standings and tells any open overlay at once. Returns false when this browser blocks storage (the live message still goes). */
export function publishFeed(feed: KitFeed): boolean {
  const ok = writeJson(FEED_KEY(feed.source), feed);
  post({ kind: "feed", feed });
  return ok;
}
export function publishPlayers(players: KitPlayers): boolean {
  const ok = writeJson(PLAYERS_KEY, players);
  post({ kind: "players", players });
  return ok;
}
export function clearPlayers(): void { try { store()?.removeItem(PLAYERS_KEY); } catch { /* blocked */ } post({ kind: "players", players: { v: 1, players: [], at: Date.now() } }); }

/** Whether this browser's tools send to the overlay. Off until the organiser switches it on. */
export const readSending = (): boolean => { try { return store()?.getItem(ON_KEY) === "1"; } catch { return false; } };
export const writeSending = (on: boolean): void => { try { const s = store(); if (on) s?.setItem(ON_KEY, "1"); else s?.removeItem(ON_KEY); } catch { /* blocked */ } };

/**
 * Follows the kit data live: messages on the channel (instant), the storage event (other tabs), and a slow re-read every 2 seconds as a
 * fallback for browsers without BroadcastChannel. Calls back with every valid feed or player list. Returns the stop function.
 */
export function subscribe(on: { feed: (f: KitFeed) => void; players: (p: KitPlayers) => void }): () => void {
  const ch = channel();
  if (ch) ch.onmessage = (e: MessageEvent<Msg>) => {
    const m = e.data;
    if (m?.kind === "feed") { const f = sanitizeFeed(m.feed); if (f) on.feed(f); }
    else if (m?.kind === "players") { const p = sanitizePlayers(m.players); if (p) on.players(p); }
  };
  const reread = () => { readFeeds().forEach(on.feed); const p = readPlayers(); if (p) on.players(p); };
  const onStorage = (e: StorageEvent) => { if (!e.key || e.key.startsWith("eh-overlay-kit:")) reread(); };
  window.addEventListener("storage", onStorage);
  const id = window.setInterval(reread, 2000);
  return () => { try { ch?.close(); } catch { /* closed */ } window.removeEventListener("storage", onStorage); window.clearInterval(id); };
}
