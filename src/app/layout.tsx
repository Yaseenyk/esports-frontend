import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import HexField from "@/components/HexField";
import MotionProvider from "@/components/MotionProvider";
import PwaRegister from "@/components/PwaRegister";
import GoogleTag from "@/components/GoogleTag";
import { GTM_BOOT } from "@/lib/gtm";
import { TRANSLATE_GUARD } from "@/lib/translate-guard";
import { SITE_DESCRIPTION } from "@/lib/facts";
import { INDEXABLE, SITE_URL } from "@/lib/site";
import XpProvider from "@/components/XpProvider";
import FeedbackLoader from "@/features/feedback/FeedbackLoader";

// Fonts are files in src/fonts (see scripts/fetch-fonts.py), so a build never needs Google.
const body = localFont({ src: [{ path: "../fonts/inter-100-900-normal.woff2", weight: "100 900", style: "normal" }], variable: "--font-body", display: "swap" });
const display = localFont({ src: [{ path: "../fonts/space-grotesk-300-700-normal.woff2", weight: "300 700", style: "normal" }], variable: "--font-display", display: "swap" });

// The public website is open to search engines (set NEXT_PUBLIC_INDEXABLE=0 to close it). Pages with demo data, and the web app, set their own noindex.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: { google: "OG5PRiRPw3I5jB5p-G7nDzf_mlxdiZzrpLaFYCZ0p1M" },
  title: { default: "Free tournament tools for India: bracket, points table, ID cards", template: "%s · Esports Hub" },
  description: SITE_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
  appleWebApp: { capable: true, title: "Esports Hub", statusBarStyle: "black-translucent" },
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: "website", siteName: "Esports Hub", url: SITE_URL, locale: "en_IN", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Esports Hub: free tournament tools, from sign-up to trophy" }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};
export const viewport: Viewport = { themeColor: "#05070A", width: "device-width", initialScale: 1, viewportFit: "cover", colorScheme: "dark" }; // cover + safe-area padding keeps iPhone's home bar clear; colorScheme stops Samsung Internet and Chrome from re-darkening the page

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: TRANSLATE_GUARD }} /><script dangerouslySetInnerHTML={{ __html: GTM_BOOT }} /><script defer src="https://pulse.yaseenyk.workers.dev/p.js" data-site="esports.streamerosai.com" data-exclude="/app,/admin,/gate,/display,/login,/signup,/register,/forgot-password,/reset-password,/verify-email,/unsubscribe,/join,/pass,/players,/team,/lft,/tournaments,/communities,/events,/league,/live,/score,/report,/ready,/run,/overlay,/embed,/manage,/id-card-maker,/tools/id-cards,/tools/certificates,/tools/poster,/tools/print-kits,/tools/registration,/tools/check-in,/tools/brackets,/tools/groups,/tools/schedule,/tools/points-table,/tools/round-robin,/tools/double-elimination,/tools/display-screen,/tools/plan,/arcade" /></head>
      <body className="min-h-[100svh] font-sans">
        <MotionProvider>
        <PwaRegister />
        <GoogleTag />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-dialog focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-lg focus:bg-cyan-400 focus:px-4 focus:font-semibold focus:text-ink">Skip to content</a>
        <XpProvider>
        <HexField />
        <div aria-hidden="true" className="aurora no-print" />
        {children}
        <FeedbackLoader />
        </XpProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
