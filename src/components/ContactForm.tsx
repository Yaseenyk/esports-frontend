"use client";

import { useState } from "react";
import { API_BASE, hasBackend } from "@/lib/api";

/** A plain contact form. The message is stored by the Esports Hub backend for the owner to read; the hidden field catches simple bots. */
export default function ContactForm() {
  const [name, setName] = useState(""), [email, setEmail] = useState(""), [message, setMessage] = useState(""), [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setState("sending"); setErr("");
    try {
      const res = await fetch(`${API_BASE}/public/contact`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, email, message, website }) });
      if (res.status === 429) { setErr("Too many messages from this connection. Please try again in an hour."); setState("error"); return; }
      if (!res.ok) { setErr(res.status === 400 ? "Please write a little more (at least 10 characters), and check the email address if you gave one." : "The message could not be sent. Please try again later."); setState("error"); return; }
      setState("sent");
    } catch { setErr("Could not reach the server. Check your connection and try again."); setState("error"); }
  };

  if (!hasBackend) return <p>The contact form is not available in this build.</p>;
  if (state === "sent") return <p role="status" className="rounded-xl border border-emerald-400/40 bg-[#0a0b0d] p-4 text-emerald-200">Thank you. Your message was sent.</p>;
  return (
    <form onSubmit={send} className="space-y-4 !text-zinc-200">
      <label className="block text-sm">Your name (optional)<input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" /></label>
      <label className="block text-sm">Your email (optional, needed for a reply)<input className="field mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} autoComplete="email" /></label>
      <label className="block text-sm">Message<textarea className="field mt-1 min-h-32 py-2" value={message} onChange={(e) => setMessage(e.target.value)} minLength={10} maxLength={2000} required aria-describedby="cf-msg-help" /></label>
      <p id="cf-msg-help" className="-mt-2 text-xs text-zinc-400">Say what you were doing and what went wrong or what you need. {message.trim().length < 10 ? `The Send button turns on after ${10 - message.trim().length} more character${10 - message.trim().length === 1 ? "" : "s"}.` : "Ready to send."}</p>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Leave this empty<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label></div>
      {state === "error" && <p role="alert" className="text-sm text-red-300">{err}</p>}
      <button className="btn" disabled={state === "sending" || message.trim().length < 10}>{state === "sending" ? "Sending…" : "Send message"}</button>
    </form>
  );
}
