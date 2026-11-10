import type { Metadata } from "next";
import GateScreen from "@/components/gate/GateScreen";

export const metadata: Metadata = { title: "Gate check-in" };

export default function Page() {
  return <GateScreen />;
}
