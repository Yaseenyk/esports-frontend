import type { Metadata } from "next";
import TiltLink from "@/components/TiltLink";
import { TOOLS } from "@/lib/data";

export const metadata: Metadata = { title: "Organiser tools" };

export default function Tools() {
  return (
    <div>
      <h1 className="text-3xl font-black text-zinc-50 sm:text-4xl">Organiser tools</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">What an event team needs on the day, built to work for any game.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => {
          const live = !!t.href;
          const body = (
            <>
              <span className={`tag ${live ? "!bg-cyan/15 !text-cyan" : ""}`}>{t.status}</span>
              <h2 className="mt-3 font-bold text-zinc-50">{t.name}</h2>
              <p className="mt-1 text-sm text-zinc-400">{t.blurb}</p>
            </>
          );
          return live ? <TiltLink key={t.slug} href={t.href!}>{body}</TiltLink> : <div key={t.slug} className="card opacity-85">{body}</div>;
        })}
      </div>
    </div>
  );
}
