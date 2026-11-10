import type { Metadata } from "next";
import Dashboard from "@/components/app/Dashboard";

export const metadata: Metadata = { title: "Home" };

export default function Page() {
  return <Dashboard />;
}
