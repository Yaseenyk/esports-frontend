import type { Metadata } from "next";
import InviteScreen from "@/components/org/InviteScreen";

export const metadata: Metadata = { title: "Invite someone", robots: { index: false, follow: false } };

export default function Page() {
  return <InviteScreen />;
}
