import type { Metadata } from "next";
import EventsBrowser from "./EventsBrowser";

export const metadata: Metadata = { title: "Events" };

export default function Events() {
  return (
    <div>
      <h1 className="text-3xl font-black text-zinc-50 sm:text-4xl">Events</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">Tournaments, leagues and fests across every game. Filter by game, mode and level.</p>
      <EventsBrowser />
    </div>
  );
}
