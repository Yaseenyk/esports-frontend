import type { Metadata } from "next";
import GamesBrowser from "./GamesBrowser";

export const metadata: Metadata = { title: "Games" };

export default function Games() {
  return (
    <div>
      <h1 className="text-3xl font-black text-zinc-50 sm:text-4xl">Games</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">Esports titles, sandbox worlds, party games and more. Pick a game to see its events and the communities that play it.</p>
      <GamesBrowser />
    </div>
  );
}
