import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to the Esports Hub web app to run ID cards, passes and gate check-in for your events.", alternates: { canonical: "/login/" } };

export default function Page() {
  return <AuthPage mode="login" />;
}
