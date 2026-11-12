"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { auth, events, explain, type CloudEvent } from "@/lib/api/cloud";
import { hasBackend } from "@/lib/api";
import { loadFromCloud, readLink, saveToCloud, writeLink, type Loaded, type Snapshot } from "@/lib/cloud/sync";
import { ROLES, type Person } from "@/lib/idcard/types";
import AccountPanel from "./AccountPanel";
import AuthForm from "@/components/auth/AuthForm";
import InvitesPanel from "./InvitesPanel";
import LivePanel from "./LivePanel";
import { useSession } from "./useSession";
import OrgPicker, { chosenOrgId, useOrgChoices } from "@/components/org/OrgPicker";

export interface CloudProps {
  snapshot: Snapshot;
  minorOf: (p: Person) => boolean;
  onCodes: (codes: Record<string, string>) => void;
  onLoaded: (l: Loaded) => void;
  onPeople: (add: Person[]) => void;
  onClose: () => void;
  /** Open this saved event as soon as the list has loaded (used by the dashboard's "Open cards" link). */
  autoOpenId?: string | null;
  /** Which tab to land on (for example "Player invites" from the People step). */
  initialTab?: string;
}

const TABS = ["Save & sync", "Live check-in", "Player invites", "Account"] as const;

export default function CloudPanel(p: CloudProps) {
  const session = useSession();
  const [tab, setTab] = useState<(typeof TABS)[number]>((TABS as readonly string[]).includes(p.initialTab ?? "") ? (p.initialTab as (typeof TABS)[number]) : "Save & sync");
  const [link, setLink] = useState<{ id: string; key: string } | null>(null);
  const [list, setList] = useState<CloudEvent[] | null>(null);
  const [orgPick, setOrgPick] = useState(""); // "" = the server's default; a club id only when the person chose one
  const orgOptions = useOrgChoices("Just me (not shared)");
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(""), [err, setErr] = useState("");

  const box = useRef<HTMLDivElement>(null);
  useEffect(() => setLink(readLink()), []);
  const { onClose } = p;
  // A dialog keeps focus inside itself, closes on Escape, stops the page behind from scrolling, and gives focus back to what opened it.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !box.current) return;
      const f = Array.from(box.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0]!, last = f[f.length - 1]!;
      if (e.shiftKey && (document.activeElement === first || !box.current.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !box.current.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", k);
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; opener?.focus?.(); };
  }, [onClose]);
  const refresh = useCallback(() => { events.list().then(setList).catch((e) => setErr(explain(e))); }, []);
  useEffect(() => { if (session) refresh(); }, [session, refresh]);
  const autoDone = useState({ v: false })[0];
  useEffect(() => { if (p.autoOpenId && list && !autoDone.v) { const ev = list.find((x) => x.id === p.autoOpenId); autoDone.v = true; if (ev) void open(ev, false); } }, [list]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setBusy(true); setErr(""); setMsg("");
    try {
      const r = await saveToCloud(p.snapshot, link?.id ?? null, p.minorOf, setMsg, (id, key) => { const l = { id, key }; writeLink(l); setLink(l); }, link ? undefined : chosenOrgId(orgPick, orgOptions));
      const l = { id: r.id, key: r.key || link?.key || "" }; writeLink(l); setLink(l); p.onCodes(r.codes); refresh();
      setMsg(`Saved. ${r.sentRoster ? `${p.snapshot.people.length} people sent` : "People were already up to date"}, ${r.photosSent} photo${r.photosSent === 1 ? "" : "s"} uploaded.${r.photosSkipped.length ? ` Too large even after shrinking: ${r.photosSkipped.join(", ")}.` : ""} Cards now carry the server-signed passes.`);
    } catch (e) { setErr(explain(e)); setMsg(""); } finally { setBusy(false); }
  };
  const open = async (ev: CloudEvent, ask = true) => {
    // Birth dates and card digits never go online, so opening a saved event here would drop the ones typed or scanned on this screen.
    if (ask && p.snapshot.people.some((x) => x.dob || x.last4) && !confirm("Opening this event replaces the people on this screen. Birth dates and card digits are kept only in this browser, so they will be lost unless you saved a project file. Open it anyway?")) return;
    setBusy(true); setErr(""); setMsg("");
    try { const l = await loadFromCloud(ev, setMsg); const lk = { id: ev.id, key: ev.key }; writeLink(lk); setLink(lk); p.onLoaded(l); const codes: Record<string, string> = {}; for (const x of await events.passes(ev.id)) codes[x.personId] = x.code; p.onCodes(codes); setMsg(`Opened ${ev.name}.`); } catch (e) { setErr(explain(e)); setMsg(""); } finally { setBusy(false); }
  };
  const del = async (ev: CloudEvent) => {
    if (!confirm(`Delete "${ev.name}" from the server? Its roster, photos, check-ins and links are removed. Your copy in this browser stays.`)) return;
    setBusy(true); setErr(""); setMsg("");
    try { await events.remove(ev.id); if (link?.id === ev.id) { writeLink(null); setLink(null); } setMsg(`Deleted ${ev.name}.`); refresh(); } catch (e) { setErr(explain(e)); } finally { setBusy(false); }
  };
  const signOut = () => { if (confirm("Sign out? Anything on this screen that you have not saved as a project file or online will be lost.")) auth.logout(); };

  return (
    <div role="dialog" aria-modal="true" aria-label="Cloud" className="no-print fixed inset-0 z-50 overflow-y-auto bg-ink/85 p-3 backdrop-blur-xl sm:p-8">
      <div ref={box} className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-zinc-950 p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div><h2 className="font-display text-xl font-bold text-white">Online events</h2><p className="text-sm text-zinc-400">{session ? <>Signed in as <strong className="text-zinc-200">{session.user.name}</strong> ({session.user.email})</> : "Optional: sign in to save and run an event online."}</p></div>
          <div className="flex gap-2">{session && <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={signOut}>Sign out</button>}<button type="button" autoFocus className="btn-ghost !min-h-9 px-3 text-sm" onClick={p.onClose}>Close</button></div>
        </div>

        {!hasBackend ? <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">The online service is not connected in this build. Everything else works in your browser.</p>
          : !session ? <AuthForm /> : (
          <>
            <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Online features">
              {TABS.map((t) => <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`chip ${tab === t ? "!border-cyan !text-cyan" : ""}`}>{t}</button>)}
            </div>
            {tab === "Save & sync" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 p-3 text-sm text-zinc-300">
                  <p>{link ? <>This event is saved online as <strong className="text-white">{p.snapshot.event}</strong>.</> : <>Not saved online yet. Press the button below to save it; then you can invite players and check guests in from several phones.</>} Only names, teams, roles, areas they can enter, under-18 flags and photos are sent. <strong className="text-zinc-100">Birth dates and Aadhaar digits stay in your browser.</strong></p>
                  <div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" className="btn !min-h-10 px-4 text-sm" disabled={busy} onClick={save}>{busy ? "Working…" : link ? "Save changes online" : "Save this event online"}</button>{link && <button type="button" className="chip" onClick={() => { writeLink(null); setLink(null); }}>Save as a new event instead</button>}</div>
                </div>
                {!link && <OrgPicker value={orgPick} onChange={setOrgPick} defaultLabel="Just me (not shared)" hint="Everyone in the club can see the event. Choose Just me to keep it to yourself." disabled={busy} />}
                <div>
                  <h3 className="mb-2 font-display font-bold text-white">Your online events</h3>
                  {list === null ? <p className="text-sm text-zinc-400">Loading…</p> : list.length === 0 ? <p className="text-sm text-zinc-400">None yet. Press &ldquo;Save this event online&rdquo; above to add this one.</p> : (
                    <ul className="space-y-2">{list.map((ev) => (
                      <li key={ev.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm"><span className="min-w-0"><span className="block truncate font-semibold text-white">{ev.name}</span><span className="text-xs text-zinc-400">{ev.game || "No game"} · {ev.date || "No date"}{link?.id === ev.id ? " · linked" : ""}</span></span><span className="flex gap-2"><button type="button" className="btn-ghost !min-h-9 px-3 text-sm" disabled={busy} onClick={() => open(ev)}>Open here</button><button type="button" className="chip !min-h-9" disabled={busy} onClick={() => del(ev)}>Delete</button></span></li>
                    ))}</ul>
                  )}
                </div>
              </div>
            )}
            {tab === "Live check-in" && (link ? <LivePanel eventId={link.id} /> : <p className="text-sm text-zinc-300">Save the event online first: open the Save &amp; sync tab and press the Save button. Then come back here.</p>)}
            {tab === "Player invites" && (link ? <InvitesPanel eventId={link.id} teams={p.snapshot.teams} people={p.snapshot.people} onApproved={async () => { const r = await events.roster(link.id); const have = new Set(p.snapshot.people.map((x) => x.id)); const add = r.people.filter((x) => !have.has(x.id)).map((x) => ({ id: x.id, name: x.name, teamId: x.teamId, role: (ROLES as readonly string[]).includes(x.role) ? (x.role as Person["role"]) : "Player" })); if (add.length) p.onPeople(add); }} /> : <p className="text-sm text-zinc-300">Save the event online first: open the Save &amp; sync tab and press the Save button. Then come back here.</p>)}
            {tab === "Account" && <AccountPanel onDone={p.onClose} />}
            <div aria-live="polite" className="mt-4 space-y-1">{msg && <p className="text-sm text-emerald-300">{msg}</p>}{err && <p role="alert" className="text-sm text-red-300">{err}</p>}</div>
          </>
        )}
      </div>
    </div>
  );
}
