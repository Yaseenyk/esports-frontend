import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import SearchBox from "@/components/SearchBox";

export const metadata: Metadata = {
  title: { default: "Esports Hub (interface prototype)", template: "%s · Esports Hub" },
  description: "One place for esports communities that run several games: find games and events, and use organiser tools such as player ID cards.",
  robots: { index: false, follow: false }, // sample data only: not indexed until it carries real content
};
export const viewport: Viewport = { themeColor: "#05070A", width: "device-width", initialScale: 1 };

const NAV = [
  { href: "/games/", label: "Games" },
  { href: "/events/", label: "Events" },
  { href: "/communities/", label: "Communities" },
  { href: "/tools/", label: "Tools" },
  { href: "/guides/", label: "Guides" },
  { href: "/manage/", label: "Manage" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <div className="no-print border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-200">
          Interface prototype. Every name, event and community here is made-up sample data.
        </div>
        <header className="no-print sticky top-0 z-40 border-b border-zinc-800 bg-ink/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <Link href="/" className="flex shrink-0 items-center gap-2 font-bold tracking-tight text-zinc-50">
              <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan to-purple text-sm font-black text-ink">E</span>
              <span>Esports Hub</span>
            </Link>
            <nav aria-label="Main" className="ms-4 hidden gap-1 md:flex">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50">{n.label}</Link>
              ))}
            </nav>
            <div className="ms-auto hidden w-72 lg:block"><SearchBox /></div>
            <details className="relative ms-auto md:hidden">
              <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg border border-zinc-700 text-zinc-200" aria-label="Menu">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              </summary>
              <div className="absolute end-0 top-full mt-2 w-64 rounded-xl border border-zinc-700 bg-zinc-950 p-2 shadow-2xl">
                {NAV.map((n) => (
                  <Link key={n.href} href={n.href} className="flex h-11 items-center rounded-lg px-3 text-zinc-200 hover:bg-zinc-900">{n.label}</Link>
                ))}
              </div>
            </details>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">{children}</main>
        <footer className="no-print mt-16 border-t border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
          Esports Hub is an independent project. Game names belong to their publishers; we use our own badges, never their logos.
        </footer>
      </body>
    </html>
  );
}
