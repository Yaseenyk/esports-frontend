import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import HexField from "@/components/HexField";
import MotionProvider from "@/components/MotionProvider";
import PwaRegister from "@/components/PwaRegister";
import { INDEXABLE, SITE_URL } from "@/lib/site";
import XpProvider from "@/components/XpProvider";

// Fonts are files in src/fonts (see scripts/fetch-fonts.py), so a build never needs Google.
const body = localFont({ src: [{ path: "../fonts/inter-100-900-normal.woff2", weight: "100 900", style: "normal" }], variable: "--font-body", display: "swap" });
const display = localFont({ src: [{ path: "../fonts/space-grotesk-300-700-normal.woff2", weight: "300 700", style: "normal" }], variable: "--font-display", display: "swap" });

// The public website is open to search engines (set NEXT_PUBLIC_INDEXABLE=0 to close it). Pages with demo data, and the web app, set their own noindex.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Esports Hub: run gaming events, ID cards and gate check-in", template: "%s · Esports Hub" },
  description: "Free ID card maker, bracket maker, points table calculator and gate check-in scanner, plus practical guides for running college and community esports events.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
  appleWebApp: { capable: true, title: "Esports Hub", statusBarStyle: "black-translucent" },
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: "website", siteName: "Esports Hub", url: SITE_URL, locale: "en_IN", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Esports Hub: free tools and guides for running esports events" }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};
export const viewport: Viewport = { themeColor: "#05070A", width: "device-width", initialScale: 1, viewportFit: "cover", colorScheme: "dark" }; // cover + safe-area padding keeps iPhone's home bar clear; colorScheme stops Samsung Internet and Chrome from re-darkening the page

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-[100svh] font-sans">
        <MotionProvider>
        <PwaRegister />
        <XpProvider>
        <HexField />
        <div aria-hidden="true" className="aurora no-print" />
        {children}
        </XpProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
