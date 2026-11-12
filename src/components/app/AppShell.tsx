"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, sessionStore } from "@/lib/api/cloud";
import { LangSwitch } from "@/components/useLang";
import { useSession } from "@/components/cloud/useSession";
import { Sk } from "@/components/skeleton/Sk";
import HubNav, { type Section } from "@/components/HubNav";
import VerifyScreen from "@/components/auth/VerifyScreen";
import { useOrg } from "@/components/org/OrgContext";
import { orgNav } from "@/lib/org";

// The app uses the same floating pill and honeycomb menu as the public home page (HubNav); only the entries differ.
const TABS: Section[] = [
  { href: "/app/", label: "Home", blurb: "Your workspace", icon: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  { href: "/app/events/", label: "Events", blurb: "Saved online", icon: "M4 6a2 2 0 012-2h12a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2zM4 10h16M8 3v4M16 3v4" },
  { href: "/app/id-cards/", label: "ID cards", blurb: "Passes & badges", icon: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM8 11a2 2 0 100-4 2 2 0 000 4zM5.5 16a3 3 0 015 0M14 9h4M14 13h4" },
  { href: "/app/check-in/", label: "Gate check-in", blurb: "Scan at the door", icon: "M4 7V5a1 1 0 011-1h2M17 4h2a1 1 0 011 1v2M20 17v2a1 1 0 01-1 1h-2M7 20H5a1 1 0 01-1-1v-2M7 12h10" },
  { href: "/app/brackets/", label: "Brackets", blurb: "Seeded bracket", icon: "M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3" },
  { href: "/app/insights/", label: "Insights", blurb: "Usage & numbers", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { href: "/app/account/", label: "Account", blurb: "Profile & security", icon: "M20 21v-1a5 5 0 00-5-5H9a5 5 0 00-5 5v1M12 11a4 4 0 100-8 4 4 0 000 8z" },
];
const CLUB_ICON = "M16 20v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M10 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM20 20v-1a3.5 3.5 0 00-2.5-3.4M16 4.2a3.5 3.5 0 010 6.6";

/**
 * The web app's frame. Everything under /app needs a signed-in account: someone who is not signed in is sent to the sign-in page
 * and brought back here afterwards. The check happens in the browser (the app is a static page that talks to the API), and the
 * API enforces it again on every request, so hiding a screen is a convenience, never the protection.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const path = usePathname() ?? "/app/";
  const router = useRouter();
  const org = useOrg();
  const clubTab = orgNav(org.ctx); // null until /me/context says clubs are on: the tabs are then exactly today's
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

  const sections: Section[] = clubTab ? [...TABS.slice(0, -1), { href: clubTab.href, label: clubTab.label, blurb: "Team workspace", icon: CLUB_ICON }, ...TABS.slice(-1)] : TABS;
  const signOut = () => { if (path.startsWith("/app/id-cards") && !window.confirm("Sign out? The people and designs on this screen are not saved in this browser, so they will be lost unless you saved a project file or saved the event online.")) return; auth.logout(); };
  const initial = session.user.name.trim().charAt(0) || "?";
  return (
    <div className="min-h-[100svh]">
      <HubNav
        sections={sections}
        home="/app/"
        homeAria="Esports Hub app home"
        navLabel="App"
        combDesktop={sections.length > 7 ? [4, 4] : [3, 4]}
        combMobile={sections.length > 7 ? [3, 3, 2] : [2, 3, 2]}
        actions={<>
          <span aria-hidden="true" title={session.user.email} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan/25 to-purple/25 text-sm font-semibold uppercase text-white max-sm:hidden">{initial}</span>
          <button type="button" onClick={signOut} className="hidden h-11 items-center rounded-full bg-white/5 px-4 text-sm font-medium text-zinc-200 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan/60 sm:inline-flex">Sign out</button>
        </>}
        overlayExtra={<LangSwitch />}
        overlayActions={<>
          <span className="max-w-[10rem] truncate text-sm text-zinc-300">{session.user.name}</span>
          <button type="button" onClick={signOut} className="btn-ghost !min-h-11 px-6">Sign out</button>
        </>}
      />
      <main className="mx-auto max-w-[1500px] px-4 pb-16 pt-8">{org.ctx?.user.verifyRequired ? <VerifyScreen email={org.ctx.user.email} refresh={org.refresh} /> : children}</main>
    </div>
  );
}
