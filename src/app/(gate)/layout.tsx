import Link from "next/link";
import { LangSwitch } from "@/components/useLang";

/** A bare frame for door staff: just the scanner, nothing to get lost in. */
export default function GateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100svh]">
      <header className="no-print flex items-center justify-between gap-3 border-b border-white/[0.14] bg-[#070a0f] px-4 py-2.5">
        <Link href="/" className="font-display text-[15px] font-bold tracking-tight text-white">Esports<span className="bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">Hub</span> <span className="text-xs font-normal text-zinc-400">gate</span></Link>
        <LangSwitch />
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">{children}</main>
    </div>
  );
}
