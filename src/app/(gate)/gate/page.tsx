import type { Metadata } from "next";
import GateScreen from "@/components/gate/GateScreen";

// For door staff: no account needed, only a gate key (live) or an event pack (offline). Not for search engines.
export const metadata: Metadata = { title: "Gate scanner", robots: { index: false, follow: false } };

export default function Page() {
  return <GateScreen />;
}
