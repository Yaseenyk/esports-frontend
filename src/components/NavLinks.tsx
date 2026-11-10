"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV = [
  { href: "/games/", label: "Games" },
  { href: "/events/", label: "Events" },
  { href: "/communities/", label: "Communities" },
  { href: "/tools/", label: "Tools" },
  { href: "/guides/", label: "Guides" },
  { href: "/manage/", label: "Manage" },
];

export default function NavLinks({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const path = usePathname() ?? "";
  return (
    <>
      {NAV.map((n) => {
        const on = path.startsWith(n.href.slice(0, -1));
        return mobile ? (
          <Link key={n.href} href={n.href} onClick={onNavigate} aria-current={on ? "page" : undefined} className={`flex h-12 items-center rounded-lg px-4 font-medium ${on ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5"}`}>{n.label}</Link>
        ) : (
          <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined} className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${on ? "text-white" : "text-zinc-400 hover:text-white"}`}>
            {on && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-lg bg-white/10 ring-1 ring-white/10" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            {n.label}
          </Link>
        );
      })}
    </>
  );
}
