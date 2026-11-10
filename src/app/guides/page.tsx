import type { Metadata } from "next";
import { POSTS } from "@/lib/data";

export const metadata: Metadata = { title: "Guides" };

export default function Guides() {
  return (
    <div>
      <h1 className="text-3xl font-black text-zinc-50 sm:text-4xl">Guides</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">Practical articles for organisers, managers and streamers. These are titles and summaries only: the articles are not written yet.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {POSTS.map((p) => (
          <article key={p.slug} className="card">
            <div className="flex items-center justify-between"><span className="tag">{p.tag}</span><span className="text-xs text-zinc-500">{p.minutes} min</span></div>
            <h2 className="mt-3 font-bold text-zinc-50">{p.title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{p.blurb}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
