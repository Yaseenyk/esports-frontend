"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, sessionStore } from "@/lib/api/cloud";
import { LangSwitch } from "@/components/useLang";
import { useSession } from "@/components/cloud/useSession";
import { Sk } from "@/components/skeleton/Sk";
import { useOrg } from "@/components/org/OrgContext";
import { orgNav } from "@/lib/org";

const TABS = [
  { href: "/app/", label: "Home" },
  { href: "/app/events/", label: "Events" },
  { href: "/app/id-cards/", label: "ID cards" },
  { href: "/app/check-in/", label: "Gate check-in" },
  { href: "/app/brackets/", label: "Brackets" },
  { href: "/app/account/", label: "Account" },
];

/**
 * The web app's frame. Everything under /app needs a signed-in account: someone who is not signed in is sent to the sign-in page
 * and brought back here afterwards. The check happens in the browser (the app is a static page that talks to the API), and the
 * API enforces it again on every request, so hiding a screen is a convenience, never the protection.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const path = usePathname() ?? "/app/";
  const router = useRouter();
  const clubTab = orgNav(useOrg().ctx); // null until /me/context says clubs are on: the tabs are then exactly today's
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  // One place decides where a signed-out person goes, so the Sign out button and an expired sign-in cannot race each other:
  // deleted account -> home page; chose to sign out -> plain sign-in page; sign-in ran out -> sign-in page that brings them back here.
  useEffect(() => {
    if (!ready || session) return;
    const why = sessionStore.endedBy();
    router.replace(why === "deleted" ? "/" : why === "signed-out" ? "/login/" : `/login/?next=${encodeURIComponent(path)}${why === "expired" ? "&expired=1" : ""}`);
  }, [ready, session, path, router]);

  if (!ready || !session) {
    return (
      <div role="status" aria-busy="true" className="mx-auto max-w-5xl space-y-4 px-4 py-10">
        <span className="sr-only">Checking your sign-in</span>
        <Sk className="!h-12" /><Sk className="!h-9" w="60%" i={1} /><Sk className="!h-40" i={2} />
      </div>
    );
  }

  const active = (href: string) => (href === "/app/" ? path === "/app/" || path === "/app" : path.startsWith(href.slice(0, -1)));
  return (
    <div className="min-h-[100svh]">
      <header className="no-print sticky top-0 z-40 border-b border-white/[0.14] bg-[#070a0f]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-2.5">
          <Link href="/app/" className="flex items-center gap-2 rounded-lg font-display text-[15px] font-bold tracking-tight text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan">
            Esports<span className="bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">Hub</span><span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">App</span>
          </Link>
          <div className="flex items-center gap-3">
            <LangSwitch className="hidden sm:flex" />
            <span className="hidden max-w-[10rem] truncate text-sm text-zinc-300 md:block">{session.user.name}</span>
            <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => { if (path.startsWith("/app/id-cards") && !window.confirm("Sign out? The people and designs on this screen are not saved in this browser, so they will be lost unless you saved a project file or saved the event online.")) return; auth.logout(); }}>Sign out</button>
          </div>
        </div>
        <nav aria-label="App" className="mx-auto flex max-w-[1500px] gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
          {(clubTab ? [...TABS.slice(0, -1), clubTab, ...TABS.slice(-1)] : TABS).map((t) => (
            <Link key={t.href} href={t.href} aria-current={active(t.href) ? "page" : undefined} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${active(t.href) ? "border-cyan bg-[#0c1d27] text-cyan" : "border-transparent text-zinc-300 hover:border-white/20 hover:text-white"}`}>{t.label}</Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[1500px] px-4 pb-16 pt-6">{children}</main>
    </div>
  );
}
