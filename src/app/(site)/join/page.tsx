import type { Metadata } from "next";
import JoinPage from "@/components/cloud/JoinPage";

export const metadata: Metadata = { title: "Join a team", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function Page() {
  return <JoinPage />;
}
