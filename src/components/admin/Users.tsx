"use client";

import { useState } from "react";
import { type UserRow, admin } from "@/lib/admin/client";
import { ago } from "@/lib/admin/labels";
import { ConfirmPanel, Empty, Failed, H1, Loading, Success, say, useLoad } from "./ui";

type Ask = "reveal" | "suspend" | "restore";

function UserCard({ u, onDone }: { u: UserRow; onDone: (m: string) => void }) {
  const [ask, setAsk] = useState<Ask | null>(null);
  const [shown, setShown] = useState<string | null>(null);
  const suspended = u.status === "suspended";
  async function run(a: Ask, reason: string) {
    if (a === "reveal") { setShown(await admin.revealEmail(u.id, reason)); setAsk(null); return; }
    if (a === "suspend") await admin.suspendUser(u.id, reason); else await admin.restoreUser(u.id, reason);
    setAsk(null);
    onDone(a === "suspend" ? "Account suspended. It is signed out everywhere until you restore it." : "Account restored. It can sign in again.");
  }
  return (
    <li className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-all font-mono text-sm text-white">{shown ?? u.email}</p>
          <p className="mt-0.5 text-sm text-zinc-300">
            Joined {u.createdAt ? ago(u.createdAt) : "at an unknown date"} · {u.emailVerifiedAt ? `email checked ${ago(u.emailVerifiedAt)}` : "email not checked"}
          </p>
          {u.orgs.length > 0 && (
            <p className="mt-0.5 text-sm text-zinc-300">
              {u.orgs.map((o) => `${o.kind === "personal" ? "Own workspace" : o.name}${o.kind === "team" ? ` (${o.role}${o.verified ? ", verified" : ""})` : ""}`).join(" · ")}
            </p>
          )}
          <p className="mt-0.5 text-xs text-zinc-400">Id <span className="font-mono">{u.id}</span></p>
        </div>
        <span className="flex shrink-0 flex-col items-end gap-1">
          {u.staff && <span className="tag">Staff</span>}
          <span className={`tag ${suspended ? "!text-amber-200" : ""}`}>{suspended ? "Suspended" : u.status === "active" ? "Active" : u.status.replace(/_/g, " ")}</span>
        </span>
      </div>
      {shown && <p className="mt-2 text-xs text-zinc-400">Shown once for this visit. The reveal is in the activity log.</p>}
      {ask ? (
        <ConfirmPanel
          title={ask === "reveal" ? "Show the full email address?" : ask === "suspend" ? "Suspend this account?" : "Restore this account?"}
          confirmLabel={ask === "reveal" ? "Show email" : ask === "suspend" ? "Suspend" : "Restore"}
          danger={ask === "suspend"}
          needsCode={ask !== "reveal" && admin.needsStepUp()}
          onCancel={() => setAsk(null)} onConfirm={(r) => run(ask, r)}>
          {ask === "reveal" && <p>The activity log records that you looked, when, and the reason you choose.</p>}
          {ask === "suspend" && <p>The person is signed out on every device and cannot sign in, and their public pages stop being shown, until you restore the account.</p>}
          {ask === "restore" && <p>They can sign in again from the next request.</p>}
        </ConfirmPanel>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {!shown && <button type="button" className="btn-ghost" onClick={() => setAsk("reveal")}>Show email</button>}
          {!u.staff && (suspended
            ? <button type="button" className="btn-ghost" onClick={() => setAsk("restore")}>Restore</button>
            : u.status === "active" && <button type="button" className="btn-ghost" onClick={() => setAsk("suspend")}>Suspend</button>)}
        </div>
      )}
    </li>
  );
}

/** Accounts, newest first or by part of an email. Emails are masked; a full address is shown only after a logged reveal. */
export default function Users() {
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const [more, setMore] = useState<UserRow[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [moreErr, setMoreErr] = useState("");
  const [busy, setBusy] = useState(false);
  const r = useLoad(async () => { const p = await admin.users(applied || undefined); setMore([]); setNext(p.next); return p; }, [applied]);
  async function loadMore() {
    if (!next) return;
    setBusy(true); setMoreErr("");
    try { const p = await admin.users(applied || undefined, next); setMore((m) => [...m, ...p.items]); setNext(p.next); } catch (e) { setMoreErr(say(e)); }
    setBusy(false);
  }
  const rows = [...(r.data?.items ?? []), ...more];
  return (
    <>
      <H1 sub="Emails are hidden by default. Searching and showing an email are both written to the activity log.">Users</H1>
      <form className="mb-4 flex flex-wrap items-end gap-2" noValidate onSubmit={(e) => { e.preventDefault(); const v = query.trim(); if (v && v.length < 2) { setErr("Type at least 2 characters."); return; } setErr(""); setDone(""); setApplied(v); }}>
        <div className="min-w-0 flex-1">
          <label htmlFor="u-q" className="block text-sm font-medium text-zinc-100">Search by email (any part)</label>
          <input id="u-q" type="search" className="field mt-1" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" spellCheck={false} aria-invalid={err ? true : undefined} aria-describedby={err ? "u-q-e" : undefined} />
        </div>
        <button type="submit" className="btn-ghost">Search</button>
        {applied && <button type="button" className="btn-ghost" onClick={() => { setQuery(""); setApplied(""); }}>Show newest</button>}
      </form>
      {err && <p id="u-q-e" role="alert" className="-mt-2 mb-3 text-sm text-red-300">{err}</p>}
      {done && <div className="mb-4"><Success>{done}</Success></div>}
      {r.status === "loading" && <Loading what="accounts" />}
      {r.status === "error" && <Failed error={r.error} onRetry={r.reload} />}
      {r.status === "ready" && (rows.length === 0 ? <Empty>{applied ? "No account matches." : "No accounts yet."}</Empty> : (
        <>
          <ul className="space-y-3">{rows.map((u) => <UserCard key={u.id} u={u} onDone={(m) => { setDone(m); r.reload(); }} />)}</ul>
          {moreErr && <p role="alert" className="mt-3 text-sm text-red-300">{moreErr}</p>}
          {next && <button type="button" disabled={busy} className="btn-ghost mt-4" onClick={loadMore}>{busy ? "Loading..." : "Show more"}</button>}
        </>
      ))}
      <p className="mt-6 text-xs text-zinc-400">Signing out one device is not available: a suspension signs the account out everywhere, and a restore lets it sign in again.</p>
    </>
  );
}
