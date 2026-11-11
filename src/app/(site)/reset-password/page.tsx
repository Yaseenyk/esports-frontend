import type { Metadata } from "next";
import ResetPassword from "@/components/auth/ResetPassword";

// The address carries a one-time token: never index it and never send it on as a referrer.
export const metadata: Metadata = { title: "Choose a new password", description: "Choose a new Esports Hub password.", alternates: { canonical: "/reset-password/" }, robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function Page() {
  return <ResetPassword />;
}
