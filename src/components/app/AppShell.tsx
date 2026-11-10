"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/api/cloud";
import { LangSwitch } from "@/components/useLang";
import { useSession } from "@/components/cloud/useSession";
import { Sk } from "@/components/skeleton/Sk";

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
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  useEffect(() => { if (ready && !session) router.replace(`/login/?next=${encodeURIComponent(path)}`); }, [ready, session, path, router]);

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
            <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => { auth.logout(); router.replace("/"); }}>Sign out</button>
          </div>
        </div>
        <nav aria-label="App" className="mx-auto flex max-w-[1500px] gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} aria-current={active(t.href) ? "page" : undefined} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${active(t.href) ? "border-cyan bg-[#0c1d27] text-cyan" : "border-transparent text-zinc-300 hover:border-white/20 hover:text-white"}`}>{t.label}</Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[1500px] px-4 pb-16 pt-6">{children}</main>
    </div>
  );
}
