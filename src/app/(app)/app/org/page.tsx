import type { Metadata } from "next";
import OrgHome from "@/components/org/OrgHome";

export const metadata: Metadata = { title: "Your club", robots: { index: false, follow: false } };

export default function Page() {
  return <OrgHome />;
}
