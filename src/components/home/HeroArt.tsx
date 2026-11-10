"use client";

import { useRef } from "react";
import CardView from "@/components/idcard/CardView";
import { cardFontVars } from "@/components/idcard/fonts";
import GameBadge from "@/components/GameBadge";
import { themeById } from "@/lib/idcard/themes";
import { GAMES, gameBySlug } from "@/lib/data";

const people = {
  aarav: { id: "KON-001", name: "Aarav Mehta", teamId: "t1", role: "Player" as const, photo: "/samples/people/aarav-mehta.webp", cutout: true },
  diya: { id: "KON-002", name: "Diya Kulkarni", teamId: "t1", role: "Coach" as const, photo: "/samples/people/diya-kulkarni.webp", cutout: true },
};
const base = { event: "Spring Cup 2026", game: "", teamName: "Konkan Kings", info: { organiser: "Esports Hub", date: "12 Dec 2026", venue: "Pune", emergency: "", rules: "" } };

/**
 * The animated hero picture: two real ID cards and four game icons that float and lean toward the pointer.
 * It is purely decorative (hidden from screen readers and carrying no text a search engine needs) and it loads after the page has settled,
 * so the headline and the copy are never waiting for it.
 */
export default function HeroArt() {
  const box = useRef<HTMLDivElement>(null);
  const poster = themeById("poster-blue")!.make("poster");
  const wallet = themeById("neon-grid")!.make("wallet");
  const icons = ["bgmi", "valorant", "free-fire-max", "minecraft"].map((s) => gameBySlug(s) ?? GAMES[0]!);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !box.current) return;
    const b = box.current.getBoundingClientRect();
    box.current.style.setProperty("--px", String(((e.clientX - b.left) / b.width - 0.5) * 2));
    box.current.style.setProperty("--py", String(((e.clientY - b.top) / b.height - 0.5) * 2));
  };
  const leave = () => { box.current?.style.setProperty("--px", "0"); box.current?.style.setProperty("--py", "0"); };

  return (
    <div ref={box} aria-hidden="true" onPointerMove={move} onPointerLeave={leave} className={`hero-art relative mx-auto h-[26rem] w-full max-w-md ${cardFontVars}`}>
      <div className="absolute inset-8 rounded-[2.5rem] border border-white/[0.14] bg-[#0a0b0d]" />
      <div className="hero-layer absolute left-[4%] top-[6%] w-[42%] animate-float" style={{ ["--depth" as string]: 14, animationDelay: "-1.2s" }}>
        <div className="origin-center -rotate-6 overflow-hidden rounded-xl ring-1 ring-white/10"><CardView tpl={poster} ctx={{ ...base, person: people.aarav, qr: "EH1.demo.KON-001.aaaaaaaaaaaaaaaa" }} /></div>
      </div>
      <div className="hero-layer absolute bottom-[10%] right-[2%] w-[62%] animate-float" style={{ ["--depth" as string]: 22, animationDelay: "-3.4s" }}>
        <div className="origin-center rotate-3 overflow-hidden rounded-xl ring-1 ring-white/10"><CardView tpl={wallet} ctx={{ ...base, person: people.diya, qr: "EH1.demo.KON-002.bbbbbbbbbbbbbbbb" }} /></div>
      </div>
      {icons.map((g, i) => (
        <div key={g.slug} className="hero-layer absolute animate-float" style={{ top: ["1%", "12%", "76%", "40%"][i], left: ["60%", "82%", "4%", "84%"][i], animationDelay: `${i * -1.4}s`, ["--depth" as string]: 30 + i * 6 }}>
          <div className="rounded-2xl border border-white/[0.14] bg-[#0a0b0d] p-1.5"><GameBadge game={g} size="lg" /></div>
        </div>
      ))}
    </div>
  );
}
