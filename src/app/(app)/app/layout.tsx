import type { Metadata } from "next";
import AppShell from "@/components/app/AppShell";

// The web app is private: never indexed, whatever the website's setting is.
export const metadata: Metadata = { title: { default: "App", template: "%s · Esports Hub app" }, robots: { index: false, follow: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
