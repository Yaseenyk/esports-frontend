"use client";

import { AnimatePresence, m as motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mark } from "./Logo";
import { useSession } from "@/components/cloud/useSession";
import { useXp } from "./XpProvider";
import SearchBox from "./SearchBox";

export interface Section { href: string; label: string; blurb: string; icon: string }
const SECTIONS: Section[] = [
  { href: "/tools/", label: "Tools", blurb: "All free tools", icon: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM8 11a2 2 0 100-4 2 2 0 000 4zM5.5 16a3 3 0 015 0M14 9h4M14 13h4" },
  { href: "/tools/id-cards/", label: "ID cards", blurb: "Passes & badges", icon: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM8 11a2 2 0 100-4 2 2 0 000 4zM5.5 16a3 3 0 015 0M14 9h4M14 13h4" },
  { href: "/tools/brackets/", label: "Brackets", blurb: "Seeded bracket", icon: "M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3" },
  { href: "/tools/points-table/", label: "Points table", blurb: "Battle royale", icon: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" },
  { href: "/guides/", label: "Guides", blurb: "How to run it", icon: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19a2 2 0 012-2h13M9 7h6" },
  { href: "/gate/", label: "Gate scanner", blurb: "Event-day check-in", icon: "M12 3l2.4 5 5.6.8-4 3.9.9 5.5L12 15.6 7.1 18.2 8 12.7 4 8.8 9.6 8z" },
  { href: "/about/", label: "About", blurb: "Who and why", icon: "M16 20v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M10 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM20 20v-1a3.5 3.5 0 00-2.5-3.4M16 4.2a3.5 3.5 0 010 6.6" },
];
/** The same pill and honeycomb menu is used by the public site (defaults) and by the signed-in app (AppShell passes its own sections and actions). */
export interface HubNavProps {
  sections?: Section[];
  home?: string; // where the wordmark goes
  homeAria?: string;
  homeText?: string; // what the pill says when no section matches
  navLabel?: string; // when set, the honeycomb links are wrapped in a navigation landmark with this name
  combDesktop?: number[];
  combMobile?: number[];
  actions?: React.ReactNode; // right end of the pill on wide screens (replaces Open app / Log in / Sign up)
  overlayExtra?: React.ReactNode; // always shown under the honeycomb (for example the language switch)
  overlayActions?: React.ReactNode; // shown under the honeycomb on phones (replaces Open the app / Log in / Sign up)
}
const HEX = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";
const EASE = [0.22, 1, 0.36, 1] as const;

function Icon({ d, className = "h-7 w-7" }: { d: string; className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}

function Comb({ sections, pattern, className, current, reduce }: { sections: Section[]; pattern: number[]; className: string; current?: string; reduce: boolean }) {
  const rows: Section[][] = [];
  let at = 0;
  for (const n of pattern) { rows.push(sections.slice(at, at + n)); at += n; }
  return (
    <ul className={`flex flex-col ${className}`}>
      {rows.map((row, r) => (
        <li key={r} className={`flex justify-center ${r > 0 ? "-mt-[calc(var(--h)*0.25)]" : ""}`}>
          <ul className="flex">
            {row.map((s, c) => {
              const i = pattern.slice(0, r).reduce((a, b) => a + b, 0) + c;
              const on = current === s.href;
              return (
                <motion.li key={s.href} className="w-[--h]"
                  initial={reduce ? false : { opacity: 0, scale: 0.4, rotate: -25 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 + i * 0.06 }}>
                  <Link href={s.href} aria-current={on ? "page" : undefined} className="group relative block aspect-[1/1.1547] w-full outline-none">
                    <span aria-hidden="true" className={`absolute inset-0 transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105 ${on ? "bg-gradient-to-br from-cyan to-purple" : "bg-white/15 group-hover:bg-gradient-to-br group-hover:from-cyan group-hover:to-purple group-focus-visible:bg-gradient-to-br group-focus-visible:from-cyan group-focus-visible:to-purple"}`} style={{ clipPath: HEX }} />
                    <span aria-hidden="true" className="absolute inset-[2px] bg-zinc-950 transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105" style={{ clipPath: HEX }} />
                    <span aria-hidden="true" className="absolute inset-[2px] bg-gradient-to-b from-cyan/0 to-cyan/0 opacity-0 transition-opacity duration-300 group-hover:from-cyan/15 group-hover:to-purple/20 group-hover:opacity-100 group-focus-visible:opacity-100" style={{ clipPath: HEX }} />
                    <span className="relative flex h-full flex-col items-center justify-center gap-1 text-center">
                      <span className={`transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110 ${on ? "text-cyan" : "text-zinc-300 group-hover:text-cyan"}`}><Icon d={s.icon} className="h-6 w-6 sm:h-7 sm:w-7" /></span>
                      <span className="font-display text-[12.5px] font-bold text-white sm:text-base">{s.label}</span>
                      <span className="hidden px-4 text-[11px] leading-tight text-zinc-400 sm:block">{s.blurb}</span>
                      <kbd className="absolute bottom-[14%] hidden rounded border border-white/10 px-1.5 text-[10px] text-zinc-400 sm:block">{i + 1}</kbd>
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export default function HubNav({ sections = SECTIONS, home = "/", homeAria = "Esports Hub home", homeText = "Home", navLabel, combDesktop = [3, 4], combMobile = [2, 3, 2], actions, overlayExtra, overlayActions }: HubNavProps = {}) {
  const signedIn = !!useSession();
  const path = usePathname() ?? "/";
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const xp = useXp();
  const opener = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const current = [...sections].sort((x, y) => y.href.length - x.href.length).find((s) => path.startsWith(s.href.slice(0, -1)));

  const show = useCallback((from?: HTMLElement | null) => { opener.current = from ?? (document.activeElement as HTMLElement); setOpen(true); }, []);
  const hide = useCallback(() => { setOpen(false); opener.current?.focus?.(); }, []);

  // Close on navigation.
  useEffect(() => { setOpen(false); }, [path]);

  // Keyboard: M opens, Esc closes, 1-6 jump while open. Body scroll is locked while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName);
      if (!open && !typing && (e.key === "m" || e.key === "M") && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); show(); return; }
      if (!open) return;
      if (e.key === "Escape") { e.preventDefault(); hide(); return; }
      if (!typing && /^[1-9]$/.test(e.key) && sections[Number(e.key) - 1]) { const to = sections[Number(e.key) - 1]!.href; if (to === path || to === path + "/") hide(); else router.push(to); }
      if (e.key === "Tab" && panel.current) {
        const f = Array.from(panel.current.querySelectorAll<HTMLElement>("a[href],button,input"));
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, show, hide, router, path, sections]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("a[href]")?.focus(), 80);
    return () => { document.body.style.overflow = prev; clearTimeout(t); };
  }, [open]);

  return (
    <>
      {/* The pill: hex button, wordmark, where you are, and a one-tap shortcut. */}
      <div className="no-print sticky top-3 z-40 flex justify-center px-3 pt-3">
        <motion.nav aria-label="Main" initial={false} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: EASE }}
          className="flex w-full max-w-xl items-center gap-1 rounded-full bg-[#0a0b0d] p-1.5 sm:max-w-3xl">
          <button type="button" onClick={(e) => show(e.currentTarget)} aria-label="Open the hub menu" aria-expanded={open} aria-haspopup="dialog"
            className="group relative grid h-11 w-11 shrink-0 place-items-center rounded-full outline-none ring-cyan/60 focus-visible:ring-2">
            <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/5 transition-colors group-hover:bg-white/10" />
            <motion.span whileHover={reduce ? undefined : { rotate: 60 }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className="relative"><Mark className="h-8 w-8" /></motion.span>
          </button>
          <Link href={home} className="shrink-0 rounded-full px-2 font-display text-[15px] font-bold tracking-tight text-white outline-none focus-visible:bg-white/10" aria-label={homeAria}>
            Esports<span className="bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">Hub</span>
          </Link>
          <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-white/10 sm:block" />
          <div className="relative hidden h-9 min-w-[5.5rem] flex-1 items-center overflow-hidden sm:flex" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={current?.label ?? "Home"} initial={reduce ? false : { y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduce ? undefined : { y: -16, opacity: 0 }} transition={{ duration: 0.22 }} className="flex items-center gap-2 truncate text-sm text-zinc-300">
                {current ? <><Icon d={current.icon} className="h-4 w-4 text-cyan" />{current.label}</> : <span className="text-zinc-400">{homeText}</span>}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="ms-auto sm:ms-0" />
          <button type="button" onClick={(e) => show(e.currentTarget)} className="hidden h-11 items-center gap-2 rounded-full bg-white/5 px-4 text-sm font-medium text-zinc-200 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan/60 sm:flex">
            Menu <kbd className="rounded border border-white/15 px-1.5 text-[11px] text-zinc-400">M</kbd>
          </button>
          <Link href="/arcade/" aria-label={`Level ${xp.level}, ${xp.into} of ${xp.span} XP. Open the arcade`} className="group relative mx-1 flex h-11 min-w-11 items-center gap-2 rounded-full bg-white/5 px-3 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan/60">
            <span className="font-display text-xs font-bold text-white">LV {xp.level}</span>
            <span aria-hidden="true" className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-white/10 min-[420px]:block"><span className="block h-full rounded-full bg-gradient-to-r from-cyan to-purple transition-[width] duration-700" style={{ width: `${Math.min(100, (xp.into / xp.span) * 100)}%` }} /></span>
          </Link>
          <button type="button" onClick={(e) => show(e.currentTarget)} aria-haspopup="dialog" className="flex h-11 items-center gap-2 rounded-full bg-cyan px-4 text-sm font-semibold text-ink outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/70 sm:hidden">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2.4" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>Menu
          </button>
          {actions ?? (signedIn
              ? <Link href="/app/" className="hidden h-11 items-center rounded-full bg-cyan px-4 text-sm font-semibold text-ink outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/70 sm:inline-flex">Open app</Link>
              : <><Link href="/login/" className="hidden h-11 items-center rounded-full px-3 text-sm font-medium text-zinc-200 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-cyan sm:inline-flex">Log in</Link><Link href="/signup/" className="hidden h-11 items-center rounded-full bg-cyan px-4 text-sm font-semibold text-ink outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/70 sm:inline-flex">Sign up</Link></>
          )}
        </motion.nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div key="hub" role="dialog" aria-modal="true" aria-label="Hub menu" ref={panel}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="no-print fixed inset-0 z-50 overflow-y-auto bg-ink/85 backdrop-blur-2xl" onClick={(e) => { if (e.target === e.currentTarget) hide(); }}>
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan/15 to-purple/15 blur-3xl" />
            </div>
            <div className="relative mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-4 pb-10 pt-20 sm:pt-6" onClick={(e) => { if (e.target === e.currentTarget) hide(); }}>
              <button type="button" onClick={hide} aria-label="Close menu" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-zinc-200 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan/60">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
              <motion.div initial={reduce ? false : { y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08, duration: 0.4 }} className="mt-12 w-full max-w-md sm:mt-0">
                <SearchBox placeholder="Search anything…" />
              </motion.div>

              {/* Honeycomb: rows alternate left and right by a quarter hex so the rows nest. 2 per row on phones, 3 on larger screens. */}
              {(() => {
                const comb = (
                  <div className="mt-8 w-full [--h:7.3rem] sm:mt-10 sm:[--h:10.4rem]">
                    <Comb sections={sections} pattern={combMobile} className="sm:hidden" current={current?.href} reduce={!!reduce} />
                    <Comb sections={sections} pattern={combDesktop} className="hidden sm:block" current={current?.href} reduce={!!reduce} />
                  </div>
                );
                return navLabel ? <nav aria-label={navLabel} className="w-full">{comb}</nav> : comb;
              })()}
              {overlayExtra && <div className="mt-6 flex justify-center">{overlayExtra}</div>}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:hidden">
                {overlayActions ?? (signedIn
                  ? <Link href="/app/" onClick={hide} className="btn !min-h-11 px-6">Open the app</Link>
                  : <><Link href="/login/" onClick={hide} className="btn-ghost !min-h-11 px-6">Log in</Link><Link href="/signup/" onClick={hide} className="btn !min-h-11 px-6">Sign up</Link></>)}
              </div>
              <p className="mt-6 hidden text-center text-xs text-zinc-400 sm:block">Press <kbd className="rounded border border-white/15 px-1.5">1</kbd>–<kbd className="rounded border border-white/15 px-1.5">{Math.min(9, sections.length)}</kbd> to jump, <kbd className="rounded border border-white/15 px-1.5">Esc</kbd> to close</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
