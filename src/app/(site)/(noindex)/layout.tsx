import type { Metadata } from "next";

// Pages in this group show demo or sample data (made-up games, events and communities, or small games). They stay out of search results
// until they carry real, checked content. Every page below inherits this.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function NoindexLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
