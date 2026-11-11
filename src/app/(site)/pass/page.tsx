import type { Metadata } from "next";
import PassPage from "@/components/cloud/PassPage";

export const metadata: Metadata = { title: "Your pass", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Your event pass</h1>
      <PassPage />
    </>
  );
}
