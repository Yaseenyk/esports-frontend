import type { Metadata } from "next";
import AlertTokenPage from "@/features/alerts/ui/AlertTokenPage";

// The address carries a personal token after #: never index it and never send it on as a referrer.
export const metadata: Metadata = { title: "Tournament alerts", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function Page() { return <AlertTokenPage action="unsubscribe" />; }
