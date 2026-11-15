"use client";

import Link from "next/link";
import { v3Enabled } from "@/features/shared/flags";
import { box, h3, link } from "@/features/shared/ui/styles";

/** The signed-in dashboard card for players. Each link shows only while its section is switched on; with none on, nothing is rendered. */
export const playerLinks = (on: (s: "lft" | "resume") => boolean = v3Enabled): { href: string; label: string; hint: string }[] => [
  ...(on("resume") ? [{ href: "/app/resume/", label: "My esports resume", hint: "Your handle, games and ranks. Private until you choose otherwise." }] : []),
  ...(on("lft") ? [{ href: "/lft/", label: "Team finder", hint: "Find a team, or players for yours." }, { href: "/app/lft/", label: "My listings", hint: "Your posts and the applications you got." }] : []),
];

export function ForPlayersCard() {
  const links = playerLinks();
  if (links.length === 0) return null;
  return (
    <section aria-labelledby="for-players-h" className={box}>
      <h2 id="for-players-h" className={h3}>For players</h2>
      <p className="mt-1 text-sm text-zinc-300">Playing, not organising? These are for you.</p>
      <ul className="mt-3 space-y-3">
        {links.map((l) => <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link><span className="block text-sm text-zinc-400">{l.hint}</span></li>)}
      </ul>
    </section>
  );
}
