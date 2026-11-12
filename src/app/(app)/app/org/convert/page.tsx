import type { Metadata } from "next";
import ConvertScreen from "@/components/org/ConvertScreen";

export const metadata: Metadata = { title: "Make it a club", robots: { index: false, follow: false } };

export default function Page() {
  return <ConvertScreen />;
}
