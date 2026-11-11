import type { Metadata } from "next";
import TournamentsPage from "@/components/features/directory/TournamentsPage";

// Organisers opt events in, so the list is user-supplied: kept out of search results.
export const metadata: Metadata = { title: "Find a tournament", robots: { index: false, follow: false } };

export default function Page() {
  return <TournamentsPage />;
}
