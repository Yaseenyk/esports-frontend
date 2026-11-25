"use client";

import Link from "next/link";
import { link } from "@/features/shared/ui/styles";
import { useJournalAvailable } from "@/features/journal/hooks/useJournal";

/** A link to the private match journal, shown only when the journal is open for this account (nothing while its flag is off). */
export function JournalLink() {
  const j = useJournalAvailable();
  if (!j.on) return null;
  return <p className="text-sm text-zinc-300">Keep a private log of your own matches in your <Link href="/app/journal/" className={link}>match journal</Link>. It is self-logged and never shows on this page.</p>;
}
