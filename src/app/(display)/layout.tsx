import type { Metadata } from "next";

// Display screens are for TVs and streams, opened from a tool. Not for search engines.
export const metadata: Metadata = { title: "Display screen", robots: { index: false, follow: false } };

export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
