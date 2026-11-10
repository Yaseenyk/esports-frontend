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
  const [next, setNext] = useState("/app/");
  useEffect(() => setNext(safeNext(new URLSearchParams(location.search).get("next"))), []);
  useEffect(() => { if (session) router.replace(next); }, [session, next, router]);

  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      <div className="text-center">
        <h1 className="font-display text-3xl font-black text-white">{mode === "login" ? "Sign in" : "Create your account"}</h1>
        <p className="mt-2 text-sm text-zinc-300">{mode === "login" ? "Welcome back. Sign in to open the Esports Hub app." : "Free to start. Make player ID cards, signed passes and run live gate check-in."}</p>
      </div>
      <div className="card">
        {hasBackend ? <AuthForm key={mode} initialMode={mode} /> : <p className="text-sm text-amber-100">Accounts are not connected in this build.</p>}
      </div>
      <p className="text-center text-sm text-zinc-300">{mode === "login" ? <>New here? <Link className="text-cyan underline" href="/signup/">Create an account</Link></> : <>Already have an account? <Link className="text-cyan underline" href="/login/">Sign in</Link></>}</p>
    </div>
  );
}
