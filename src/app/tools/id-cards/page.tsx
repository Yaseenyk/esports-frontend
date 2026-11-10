import type { Metadata } from "next";
import IdCardStudio from "@/components/idcard/IdCardStudio";

export const metadata: Metadata = { title: "ID card maker" };

export default function Page() {
  return (
    <div>
      <div className="no-print">
        <h1 className="text-3xl font-black text-zinc-50 sm:text-4xl">ID cards and passes</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">Read Aadhaar cards automatically, give every team its own themed card, redesign it like a mini Canva, then print. Everything runs in your browser.</p>
      </div>
      <IdCardStudio />
    </div>
  );
}
