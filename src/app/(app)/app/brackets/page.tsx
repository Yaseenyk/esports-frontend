import type { Metadata } from "next";
import BracketMaker from "./BracketMaker";

export const metadata: Metadata = { title: "Bracket maker" };

export default function Page() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white sm:text-5xl">Bracket maker</h1>
      <p className="mt-3 max-w-2xl text-zinc-400">Paste your teams, one per line, in seed order. Click a team to move it to the next round. Byes are added for you when the number is not a power of two. Nothing is uploaded.</p>
      <BracketMaker />
    </div>
  );
}
