"use client";

import AccountPanel from "@/components/cloud/AccountPanel";
import { LangSwitch } from "@/components/useLang";
import { useSession } from "@/components/cloud/useSession";

export default function AccountPage() {
  const session = useSession();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Account</h1>
        <p className="mt-1 text-sm text-zinc-300">{session ? <>Signed in as <strong className="text-white">{session.user.name}</strong> ({session.user.email})</> : null}</p>
      </div>
      <section className="card space-y-2"><h2 className="font-display font-bold text-white">Language</h2><LangSwitch /></section>
      <AccountPanel onDone={() => undefined /* the app shell sends a deleted account to the home page */} />
    </div>
  );
}
