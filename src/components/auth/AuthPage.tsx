"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthForm from "./AuthForm";
import { hasBackend } from "@/lib/api";
import { useSession } from "@/components/cloud/useSession";
import { safeNext } from "@/lib/safe-next";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const session = useSession();
  const router = useRouter();
  // Read from the address after load (the page is static). Until then nothing redirects, so a saved sign-in cannot beat the return address.
  const [next, setNext] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setNext(safeNext(q.get("next")));
    setExpired(q.get("expired") === "1");
  }, []);
  useEffect(() => { if (session && next) router.replace(next); }, [session, next, router]);

  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      <div className="text-center">
        <h1 className="font-display text-3xl font-black text-white">{mode === "login" ? "Sign in" : "Create your account"}</h1>
        <p className="mt-2 text-sm text-zinc-300">{mode === "login" ? "Welcome back. Enter your email and password; you will go straight to your events." : "Free to start. Fill in your name, email and a password. You go straight into the app, where a short checklist shows what to do first."}</p>
      </div>
      {expired && !session && <p role="status" className="rounded-xl border border-amber-500/30 bg-[#0a0b0d] p-3 text-center text-sm text-amber-100">Your sign-in ran out, so you were signed out. Sign in again to carry on where you were.</p>}
      <div className="card">
        {hasBackend ? <AuthForm key={mode} initialMode={mode} showTabs={false} /> : <p className="text-sm text-amber-100">Accounts are not connected in this build.</p>}
      </div>
      <p className="text-center text-sm text-zinc-300">{mode === "login" ? <>New here? <Link className="text-cyan underline" href="/signup/">Create an account</Link></> : <>Already have an account? <Link className="text-cyan underline" href="/login/">Sign in</Link></>}</p>
    </div>
  );
}
