"use client";

import { useEffect, useState } from "react";
import { type OrgRow, type OrgTab, admin } from "@/lib/admin/client";
import { ago } from "@/lib/admin/labels";
import { ConfirmPanel, Empty, Failed, H1, Loading, Success, say, useLoad } from "./ui";

const TABS: [OrgTab, string][] = [["pending", "To approve"], ["verified", "Verified"], ["all", "All clubs and colleges"]];

type Ask = "verify" | "unverify" | "suspend" | "restore";

function OrgCard({ o, onDone }: { o: OrgRow; onDone: (m: string) => void }) {
  const [ask, setAsk] = useState<Ask | null>(null);
  const [slug, setSlug] = useState("");
  const verified = o.verifiedAt !== null;
  const suspended = o.status === "suspended";
  async function run(a: Ask, reason: string) {
    if (a === "verify") { const r = await admin.verifyOrg(o.id, reason, slug.trim() || undefined); setAsk(null); onDone(`${o.name} is verified${r.slug ? `. Its address is /colleges/${r.slug}/` : ""}.`); return; }
    if (a === "unverify") await admin.unverifyOrg(o.id, reason);
    if (a === "suspend") await admin.suspendOrg(o.id, reason);
    if (a === "restore") await admin.restoreOrg(o.id, reason);
    setAsk(null);
    onDone(a === "unverify" ? `Verification removed from ${o.name}.` : a === "suspend" ? `${o.name} is suspended.` : `${o.name} is active again.`);
  }
  return (
    <li className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-white">{o.name}</h2>
          <p className="mt-0.5 text-sm text-zinc-300">
            {o.kind === "team" ? "Club or college" : o.kind}
            {o.slug ? <> · <span className="font-mono">/{o.slug}/</span></> : " · no address yet"}
            {o.createdAt ? ` · created ${ago(o.createdAt)}` : ""}
          </p>
          <p className="mt-0.5 text-sm text-zinc-300">{o.members} {o.members === 1 ? "member" : "members"} · {o.events} {o.events === 1 ? "event" : "events"} · owner {o.owner ? <span className="font-mono">{o.owner.email}</span> : "unknown"}</p>
        </div>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className={`tag ${verified ? "!text-emerald-200" : ""}`}>{verified ? "Verified" : "Not verified"}</span>
          {suspended && <span className="tag !text-amber-200">Suspended</span>}
        </span>
      </div>
      {ask ? (
        <ConfirmPanel
          title={ask === "verify" ? `Verify ${o.name}?` : ask === "unverify" ? `Remove verification from ${o.name}?` : ask === "suspend" ? `Suspend ${o.name}?` : `Restore ${o.name}?`}
          confirmLabel={ask === "verify" ? "Verify" : ask === "unverify" ? "Remove verification" : ask === "suspend" ? "Suspend" : "Restore"}
          danger={ask === "suspend" || ask === "unverify"}
          needsCode={(ask === "suspend" || ask === "restore") && admin.needsStepUp()}
          onCancel={() => setAsk(null)} onConfirm={(r) => run(ask, r)}>
          {ask === "verify" && (
            <>
              <p>It can then list events on the college calendar, get a public college page once it has a real tournament, and shows as verified next to its trust score. Nothing else changes: it already works.</p>
              {!o.slug && (
                <div className="mt-3">
                  <label htmlFor={`slug-${o.id}`} className="block text-sm font-medium text-zinc-100">Public address (optional)</label>
                  <input id={`slug-${o.id}`} className="field mt-1 font-mono" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} placeholder="made from the name if empty" autoComplete="off" spellCheck={false} />
                  <p className="mt-1 text-xs text-zinc-400">Lower-case letters, numbers and single hyphens. It cannot be changed here later.</p>
                </div>
              )}
            </>
          )}
          {ask === "unverify" && <p>It keeps working, but drops off the college calendar and its college page. Its address is kept for it.</p>}
          {ask === "suspend" && <p>Its pages stop being shown and its members cannot change it until you restore it.</p>}
          {ask === "restore" && <p>It becomes active again from the next request.</p>}
        </ConfirmPanel>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {!verified && !suspended && o.kind === "team" && <button type="button" className="btn" onClick={() => setAsk("verify")}>Verify</button>}
          {verified && <button type="button" className="btn-ghost" onClick={() => setAsk("unverify")}>Remove verification</button>}
          {suspended ? <button type="button" className="btn-ghost" onClick={() => setAsk("restore")}>Restore</button> : <button type="button" className="btn-ghost" onClick={() => setAsk("suspend")}>Suspend</button>}
        </div>
      )}
    </li>
  );
}

/** Organisation approvals. New clubs work at once, unverified; staff verify them here later (owner decision, 25 Nov 2026). */
export default function Orgs() {
  const [tab, setTab] = useState<OrgTab>("pending");
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [done, setDone] = useState("");
  const [more, setMore] = useState<OrgRow[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [moreErr, setMoreErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { const s = new URLSearchParams(location.search).get("status"); if (s === "verified" || s === "all") setTab(s); }, []);
  const r = useLoad(async () => { const p = await admin.orgs(tab, applied || undefined); setMore([]); setNext(p.next); return p; }, [tab, applied]);
  async function loadMore() {
    if (!next) return;
    setBusy(true); setMoreErr("");
    try { const p = await admin.orgs(tab, applied || undefined, next); setMore((m) => [...m, ...p.items]); setNext(p.next); } catch (e) { setMoreErr(say(e)); }
    setBusy(false);
  }
  const rows = [...(r.data?.items ?? []), ...more];
  return (
    <>
      <H1 sub="New clubs and colleges can run events straight away. Verify the real ones here: only the college calendar and college pages need it.">Organisations</H1>
      <div role="group" aria-label="Which organisations" className="mb-3 flex flex-wrap gap-2">
        {TABS.map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={tab === k} onClick={() => { setTab(k); setDone(""); }}>{l}</button>)}
      </div>
      <form className="mb-4 flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); setApplied(query.trim()); }}>
        <div className="min-w-0 flex-1"><label htmlFor="o-q" className="block text-sm font-medium text-zinc-100">Search by name</label><input id="o-q" className="field mt-1" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" /></div>
        <button type="submit" className="btn-ghost">Search</button>
        {applied && <button type="button" className="btn-ghost" onClick={() => { setQuery(""); setApplied(""); }}>Clear</button>}
      </form>
      {done && <div className="mb-4"><Success>{done}</Success></div>}
      {r.status === "loading" && <Loading what="organisations" />}
      {r.status === "error" && <Failed error={r.error} onRetry={r.reload} />}
      {r.status === "ready" && (rows.length === 0 ? <Empty>{tab === "pending" ? "No organisation is waiting for approval." : "No organisations here."}</Empty> : (
        <>
          <ul className="space-y-3">{rows.map((o) => <OrgCard key={o.id} o={o} onDone={(m) => { setDone(m); r.reload(); }} />)}</ul>
          {moreErr && <p role="alert" className="mt-3 text-sm text-red-300">{moreErr}</p>}
          {next && <button type="button" disabled={busy} className="btn-ghost mt-4" onClick={loadMore}>{busy ? "Loading..." : "Show more"}</button>}
        </>
      ))}
    </>
  );
}
