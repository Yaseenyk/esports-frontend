import type { Metadata } from "next";
import VerifyEmailPage from "@/components/auth/VerifyEmailPage";

// The address carries a one-time verification token: never index it and never send it on as a referrer.
export const metadata: Metadata = { title: "Confirm your email", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function Page() {
  return <VerifyEmailPage />;
}
