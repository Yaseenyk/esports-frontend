import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";

export const metadata: Metadata = { title: "Create an account", description: "Create a free Esports Hub account to make player ID cards, signed passes and run live gate check-in.", alternates: { canonical: "/signup/" }, robots: { index: false, follow: true } };

export default function Page() {
  return <AuthPage mode="register" />;
}
