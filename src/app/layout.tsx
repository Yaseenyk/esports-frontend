import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import HexField from "@/components/HexField";
import HubNav from "@/components/HubNav";
import MotionProvider from "@/components/MotionProvider";
import XpProvider from "@/components/XpProvider";

// Fonts are files in src/fonts (see scripts/fetch-fonts.py), so a build never needs Google.
const body = localFont({ src: [{ path: "../fonts/inter-100-900-normal.woff2", weight: "100 900", style: "normal" }], variable: "--font-body", display: "swap" });
const display = localFont({ src: [{ path: "../fonts/space-grotesk-300-700-normal.woff2", weight: "300 700", style: "normal" }], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Esports Hub (interface prototype)", template: "%s · Esports Hub" },
  description: "One place for gaming and esports communities that run several games: find games and events, and use organiser tools such as player ID cards.",
  robots: { index: false, follow: false }, // sample data only: not indexed until it carries real content
};
export const viewport: Viewport = { themeColor: "#05070A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans">
        <MotionProvider>
        <XpProvider>
        <HexField />
        <div aria-hidden="true" className="aurora no-print" />
        <div className="no-print border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-200">
          <span className="sm:hidden">Prototype: all data is made up.</span><span className="hidden sm:inline">Interface prototype. Every name, event and community here is made-up sample data.</span>
        </div>
        <HubNav />
        <main className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:py-12">{children}</main>
        <footer className="no-print mt-16 border-t border-white/10 px-4 py-8 text-center text-sm text-zinc-400">
          Esports Hub is an independent project and is not affiliated with any game publisher. Game names and logos are trademarks of their owners and are used only to identify the games.
        </footer>
        </XpProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
