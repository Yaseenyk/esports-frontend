"use client";

import { useState } from "react";
import { type Lookup as Found, admin } from "@/lib/admin/client";
import { targetLabel } from "@/lib/admin/labels";
import { Empty, H1, say } from "./ui";

/** Metadata only. This screen cannot show a roster, a photo, a registration or an email: the client copies only the fields listed below. */
export default function Lookup() {
  const [by, setBy] = useState<"id" | "email">("id");
  const [value, setValue] = useState("");
  const [state, setState] = useState<{ s: "idle" | "busy" | "none" | "error" | "found"; msg?: string; hit?: Found }>({ s: "idle" });

  async function go(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) { setState({ s: "error", msg: by === "id" ? "Enter an id." : "Enter an email address." }); return; }
    setState({ s: "busy" });
    try { const hit = await admin.lookup(by, v); setState(hit ? { s: "found", hit } : { s: "none" }); } catch (x) { setState({ s: "error", msg: say(x) }); }
    if (by === "email") setValue(""); // an email is sent once and not kept on screen
  }

  const h = state.hit;
  const rows: [string, string][] = h ? [
    ["Kind", targetLabel(h.kind)], ["Id", h.id], ["Status", h.status],
    ...(h.createdAt ? [["Created", new Date(h.createdAt).toLocaleDateString("en-IN")] as [string, string]] : []),
    ...(h.emailVerified !== null ? [["Email checked", h.emailVerified ? "Yes" : "No"] as [string, string]] : []),
    ...h.counts.map((c) => [c.label, String(c.value)] as [string, string]),
  ] : [];

  return (
    <>
      <H1 sub="Find one account, organisation or event by its exact id or email. You see its status only: never people, photos or registrations.">Lookup</H1>
      <form onSubmit={go} className="space-y-3" noValidate>
        <fieldset>
          <legend className="text-sm font-medium text-zinc-100">Look up by</legend>
          <div className="mt-1 flex gap-2">{(["id", "email"] as const).map((k) => <button key={k} type="button" className="chip" aria-pressed={by === k} onClick={() => { setBy(k); setValue(""); setState({ s: "idle" }); }}>{k === "id" ? "Id" : "Email"}</button>)}</div>
        </fieldset>
        <div><label htmlFor="l-v" className="block text-sm font-medium text-zinc-100">{by === "id" ? "Exact id" : "Exact email address"}</label><input id="l-v" type={by === "email" ? "email" : "text"} className="field mt-1" autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} /></div>
        <button type="submit" className="btn" disabled={state.s === "busy"}>{state.s === "busy" ? "Looking..." : "Look up"}</button>
      </form>
      <div className="mt-5" aria-live="polite">
        {state.s === "error" && <p role="alert" className="text-sm text-red-300">{state.msg}</p>}
        {state.s === "none" && <Empty>Nothing matches. Lookups are exact: check every character.</Empty>}
        {state.s === "found" && (
          <dl className="card grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {rows.map(([k, v]) => <div key={k} className="contents"><dt className="text-zinc-400">{k}</dt><dd className="min-w-0 break-words text-zinc-100">{v}</dd></div>)}
          </dl>
        )}
      </div>
    </>
  );
}
