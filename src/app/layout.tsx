import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Logo from "@/components/Logo";
import MobileMenu from "@/components/MobileMenu";
import NavLinks from "@/components/NavLinks";
import SearchBox from "@/components/SearchBox";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Esports Hub (interface prototype)", template: "%s · Esports Hub" },
  description: "One place for esports communities that run several games: find games and events, and use organiser tools such as player ID cards.",
  robots: { index: false, follow: false }, // sample data only: not indexed until it carries real content
};
export const viewport: Viewport = { themeColor: "#05070A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans">
        <div aria-hidden="true" className="aurora no-print" />
        <div className="no-print border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-200">
          Interface prototype. Every name, event and community here is made-up sample data.
        </div>
        <header className="no-print sticky top-0 z-40 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <Link href="/" className="shrink-0" aria-label="Esports Hub home"><Logo /></Link>
            <nav aria-label="Main" className="ms-4 hidden items-center gap-1 md:flex"><NavLinks /></nav>
            <div className="ms-auto hidden w-72 lg:block"><SearchBox /></div>
            <MobileMenu />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">{children}</main>
        <footer className="no-print mt-16 border-t border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
          Esports Hub is an independent project and is not affiliated with any game publisher. Game names and logos are trademarks of their owners and are used only to identify the games.
        </footer>
      </body>
    </html>
  );
}
