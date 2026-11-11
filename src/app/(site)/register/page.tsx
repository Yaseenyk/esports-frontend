import type { Metadata } from "next";
import RegisterPage from "@/components/cloud/RegisterPage";

// A private link from an organiser: not for search engines.
export const metadata: Metadata = { title: "Team registration", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function Page() {
  return <RegisterPage />;
}
