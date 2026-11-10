import type { Metadata } from "next";
import EventsPage from "@/components/app/EventsPage";

export const metadata: Metadata = { title: "Events" };

export default function Page() {
  return <EventsPage />;
}
