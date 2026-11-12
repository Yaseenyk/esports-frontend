"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { admin } from "@/lib/admin/client";
import NotFoundView from "./NotFoundView";
import SignIn from "./SignIn";

const TABS = [
  { href: "/admin/", label: "Home" },
  { href: "/admin/reports/", label: "Reports" },
  { href: "/admin/lookup/", label: "Lookup" },
  { href: "/admin/switches/", label: "Switches" },
  { href: "/admin/usage/", label: "Usage" },
  { href: "/admin/activity/", label: "Activity" },
];

/**
 * The frame for every /admin page. Anyone without a staff session sees an ordinary "page not found": there is no sign-in link,
 * no hint, nothing to say this area exists. Staff open /admin/?in. The API enforces staff access again on every call.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const authed = useSyncExternalStore(admin.subscribe, admin.hasSession, () => false);
  const path = usePathname() ?? "/admin/";
  const [ready, setReady] = useState(false);
  const [wantsIn, setWantsIn] = useState(false);
  const [ended, setEnded] = useState(false);
  const was = useRef(false);
  useEffect(() => { setReady(true); setWantsIn(new URLSearchParams(location.search).has("in")); }, []);
  useEffect(() => {
    if (was.current && !authed) { setEnded(true); setWantsIn(true); }
    was.current = authed;
  }, [authed]);
  useEffect(() => { if (authed) document.title = "Staff · Esports Hub"; }, [authed, path]);
  // Move focus to the page heading after each navigation so a keyboard or screen-reader user starts at the top.
  useEffect(() => { if (authed) document.getElementById("admin-h1")?.focus({ preventScroll: true }); }, [path, authed]);

  if (!authed) {
    if (ready && wantsIn) return <SignIn ended={ended} onNotStaff={() => { setWantsIn(false); setEnded(false); history.replaceState(null, "", "/admin/"); }} />;
    return <NotFoundView />;
  }

  const active = (href: string) => (href === "/admin/" ? path === "/admin/" || path === "/admin" : path.startsWith(href.slice(0, -1)));
  return (
    <div className="min-h-[100svh]">
      <header className="sticky top-0 z-40 border-b border-white/[0.14] bg-[#070a0f]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
          <span className="font-display text-[15px] font-bold tracking-tight text-white">Staff</span>
          <button type="button" className="btn-ghost !min-h-11 px-3 text-sm" onClick={() => admin.signOut()}>Sign out</button>
        </div>
        <nav aria-label="Staff" className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} aria-current={active(t.href) ? "page" : undefined} className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${active(t.href) ? "border-cyan bg-[#0c1d27] text-cyan" : "border-transparent text-zinc-300 hover:border-white/20 hover:text-white"}`}>{t.label}</Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">{children}</main>
    </div>
  );
}
