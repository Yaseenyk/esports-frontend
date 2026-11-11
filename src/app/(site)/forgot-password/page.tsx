import type { Metadata } from "next";
import ForgotPassword from "@/components/auth/ForgotPassword";

export const metadata: Metadata = { title: "Forgot password", description: "Get an email link to choose a new Esports Hub password.", alternates: { canonical: "/forgot-password/" }, robots: { index: false, follow: false } };

export default function Page() {
  return <ForgotPassword />;
}
