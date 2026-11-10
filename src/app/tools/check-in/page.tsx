import type { Metadata } from "next";
import CheckIn from "./CheckIn";

export const metadata: Metadata = { title: "Gate check-in" };

export default function Page() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Event day</p>
      <h1 className="mt-1 text-3xl font-bold text-white sm:text-5xl">Gate check-in</h1>
      <p className="mt-3 max-w-2xl text-zinc-400">Load the check-in pack from the ID card tool, enter the event passphrase, and scan cards with the phone camera. Genuine passes show the person&apos;s photo, role and zones. Copied or edited cards are rejected. Everything stays on this device and works without internet once the page has loaded.</p>
      <CheckIn />
    </div>
  );
}
