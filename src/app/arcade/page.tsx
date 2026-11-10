import type { Metadata } from "next";
import Arcade from "./Arcade";

export const metadata: Metadata = { title: "Arcade" };

export default function Page() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">Warm up</p>
      <h1 className="mt-1 text-3xl font-bold text-white sm:text-5xl">Arcade</h1>
      <p className="mt-3 max-w-2xl text-zinc-400">Two quick games to sharpen up before your next match. Every round earns XP, and your bests are saved in this browser only.</p>
      <Arcade />
    </div>
  );
}
