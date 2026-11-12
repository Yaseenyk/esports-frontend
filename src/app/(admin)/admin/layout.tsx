import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

// Never indexed, never in the sitemap. The title is the one a missing page would have, so the tab says nothing either.
export const metadata: Metadata = { title: { absolute: "Page not found" }, robots: { index: false, follow: false, nocache: true } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
