import type { Metadata } from "next";
import UnsubscribePage from "@/components/features/reminders/UnsubscribePage";

// The address carries a personal unsubscribe token: never index it and never send it on as a referrer.
export const metadata: Metadata = { title: "Unsubscribe from event emails", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function Page() {
  return <UnsubscribePage />;
}
