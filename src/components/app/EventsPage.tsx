"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { events, explain, type CloudEvent, type CloudRoster, type Live } from "@/lib/api/cloud";
import { useQuery } from "@/lib/api/useQuery";
import { Waiting } from "@/components/skeleton/Scenes";
import { Sk } from "@/components/skeleton/Sk";
import Checklist from "@/components/app/Checklist";
import MembersPanel from "@/components/cloud/MembersPanel";
import RegistrationPanel from "@/components/cloud/RegistrationPanel";
import EventToolbox from "@/components/app/EventToolbox";
import DuplicateEventButton from "@/components/features/duplicate/DuplicateEventButton";

/** Saved events: a list, and for one event its numbers (people, teams, minors, checked in) with shortcuts to the tools. */
export default function EventsPage() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => setId(new URLSearchParams(location.search).get("id")), []);
  const list = useQuery<CloudEvent[]>("/events", { ttl: 0 });
  const chosen = id ? list.data?.find((e) => e.id === id) : undefined;

  const select = (next: string | null) => { setId(next); history.replaceState(null, "", next ? `/app/events/?id=${encodeURIComponent(next)}` : "/app/events/"); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Events</h1><p className="mt-1 text-sm text-zinc-300">Pick an event to see who is signed up, share links and get ready for the gate. Events appear here after you save them online from the ID card maker.</p></div>
        <Link href="/app/id-cards/" className="btn !min-h-11 px-4 text-sm">New event</Link>
      </div>

      <Waiting loading={list.loading} apiKey="/events" label="Loading your events" onRetry={list.refetch}><div className="space-y-2">{Array.from({ length: 3 }, (_, i) => <Sk key={i} i={i} className="!h-16 !rounded-xl" />)}</div></Waiting>
      {list.error && <p role="alert" className="text-sm text-red-300">{explain(list.error)}</p>}
      {!list.loading && !list.error && (list.data ?? []).length === 0 && <div className="card space-y-3"><p className="text-zinc-200">No events saved online yet.</p><p className="text-sm text-zinc-400">Make your cards in the ID card maker, then press <strong className="text-zinc-200">Save, open or share</strong>, then <strong className="text-zinc-200">Online</strong>, to save the event here.</p><Link href="/app/id-cards/" className="btn !min-h-11 px-4 text-sm">Create your first event</Link></div>}

      {id && !chosen && !list.loading && !list.error && list.data && <p role="status" className="rounded-xl border border-amber-500/30 bg-[#0a0b0d] p-3 text-sm text-amber-100">That event was not found. It may have been deleted, or it belongs to another account.</p>}
      {chosen ? <Detail key={chosen.id} ev={chosen} onBack={() => select(null)} onDeleted={() => { select(null); list.refetch(); }} /> : (
        (list.data ?? []).length > 0 && (
          <ul className="grid gap-3 md:grid-cols-2">
            {(list.data ?? []).map((ev) => (
              <li key={ev.id}><button type="button" onClick={() => select(ev.id)} className="card block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan"><span className="block truncate font-display text-lg font-bold text-white">{ev.name}</span><span className="mt-1 block text-sm text-zinc-300">{[ev.game, ev.date, ev.venue].filter(Boolean).join(" · ") || "No details yet"}</span><span className="mt-2 flex items-center gap-2 text-sm font-semibold text-cyan">Open →{ev.role && ev.role !== "owner" && <span className="tag !text-zinc-200">Shared with you · {ev.role === "editor" ? "editor" : "view only"}</span>}</span></button></li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

/** Opens a live "guests checked in" screen for the venue TV or the stream. It makes a gate key just for that screen (the screen only reads the guest count). */
function ScreenLauncher({ ev }: { ev: CloudEvent }) {
  const [names, setNames] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const open = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    // The window is opened now, while the click still counts, and pointed at the screen once the key exists. Browsers block a window opened after waiting.
    const w = window.open("about:blank", "eh-screen");
    try {
      const k = await events.newGateKey(ev.id, "Check-in screen", 12);
      const url = `/display/?v=checkin&k=${encodeURIComponent(k.key)}&title=${encodeURIComponent(ev.name)}${names ? "&names=1" : ""}`;
      if (w) w.location.href = url; else setErr("Your browser blocked the new window. Allow pop-ups for this site and try again.");
    } catch (x) { w?.close(); setErr(explain(x)); } finally { setBusy(false); }
  };
  if (ev.role === "viewer") return null;
  return (
    <section aria-label="Check-in screen" className="card space-y-2 !p-4">
      <h3 className="font-display text-lg font-bold text-white">Check-in screen</h3>
      <p className="text-sm text-zinc-300">Show how many guests have arrived on the venue TV or your stream. It opens a new window to put on that screen. It uses a temporary code that stops working after 12 hours and can only show the count. Names stay hidden unless you tick the box.</p>
      <div className="flex flex-wrap items-center gap-3"><button type="button" className="btn !min-h-11 px-4 text-sm" disabled={busy} onClick={open}>{busy ? "Opening…" : "Open the check-in screen"}</button><label className="flex items-center gap-2 text-sm text-zinc-200"><input type="checkbox" className="h-5 w-5 accent-cyan" checked={names} onChange={(e) => setNames(e.target.checked)} />Show names of recent arrivals</label></div>
      {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
    </section>
  );
}

/** Owner only. Asks first, and says what goes with it. */
function DeleteEvent({ ev, onDeleted }: { ev: CloudEvent; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const go = async () => {
    if (busy) return;
    if (!confirm(`Delete "${ev.name}" from the server? Its people, photos, check-ins, registration form and every link are removed for everyone with access. This cannot be undone. Cards saved in your browser stay.`)) return;
    setBusy(true); setErr("");
    try { await events.remove(ev.id); onDeleted(); } catch (x) { setErr(explain(x)); setBusy(false); }
  };
  return (
    <section aria-label="Delete event" className="space-y-2 rounded-2xl border border-red-400/30 bg-[#0a0b0d] p-4">
      <h3 className="font-display text-lg font-bold text-white">Delete this event</h3>
      <p className="text-sm text-zinc-300">Permanent. Removes it from the server for you and for any organisers you added. You will be asked to confirm. Your own copy in the ID card maker stays.</p>
      <button type="button" className="btn-ghost !min-h-11 px-4 text-sm !border-red-400/50 text-red-200" disabled={busy} onClick={go}>{busy ? "Deleting…" : "Delete event"}</button>
      {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
    </section>
  );
}

function Detail({ ev, onBack, onDeleted }: { ev: CloudEvent; onBack: () => void; onDeleted: () => void }) {
  const roster = useQuery<CloudRoster>(`/events/${ev.id}/roster`, { ttl: 20_000 });
  const live = useQuery<Live>(`/events/${ev.id}/checkins`, { pollMs: 30_000, maxPollMs: 120_000 });
  const people = roster.data?.people ?? [], teams = roster.data?.teams ?? [];
  const minors = people.filter((p) => p.minor).length, noConsent = people.filter((p) => p.minor && !p.guardian).length, noPhoto = people.filter((p) => !p.photoUrl).length;
  const [designed, setDesigned] = useState(false), [printed, setPrinted] = useState(false);
  useEffect(() => { try { const st = JSON.parse(localStorage.getItem("eh-idstudio-v3") || "null"); setDesigned(!!st && Object.keys(st.templates ?? {}).length > 0); setPrinted(localStorage.getItem("eh-idcards-printed") === "1"); } catch {} }, []);
  const canEdit = ev.role !== "viewer";
  const stat = (label: string, value: string | number, note?: string) => (
    <div className="card !p-4"><p className="text-xs uppercase tracking-wider text-zinc-400">{label}</p><p className="mt-1 font-display text-3xl font-bold text-white">{value}</p>{note && <p className="mt-1 text-xs text-zinc-400">{note}</p>}</div>
  );
  return (
    <section aria-label={ev.name} className="space-y-5">
      <div><button type="button" onClick={onBack} className="text-sm text-cyan hover:underline">← All events</button><div className="mt-2 flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl font-bold text-white">{ev.name}</h2>{canEdit && <DuplicateEventButton eventId={ev.id} eventName={ev.name} />}</div><p className="text-sm text-zinc-300">{[ev.game, ev.organiser, ev.date, ev.venue].filter(Boolean).join(" · ")}</p></div>
      {canEdit && roster.data && (
        <Checklist
          heading="Your next steps"
          intro="Do these in order. A step ticks itself off when it is done."
          steps={[
            { n: 1, title: "Add teams", hint: "Each team gets its own card design.", done: teams.length > 0, href: `/app/id-cards/?open=${encodeURIComponent(ev.id)}`, cta: "Add teams" },
            { n: 2, title: "Add people", hint: "Type them, import a sheet, or share the sign-up links below.", done: people.length > 0, href: `/app/id-cards/?open=${encodeURIComponent(ev.id)}`, cta: "Add people" },
            { n: 3, title: "Design the cards", hint: "Pick a look for each team (this browser remembers it).", done: designed, href: `/app/id-cards/?open=${encodeURIComponent(ev.id)}`, cta: "Design cards" },
            { n: 4, title: "Print or share passes", hint: "Download a PDF, or send each person a pass link.", done: printed, href: `/app/id-cards/?open=${encodeURIComponent(ev.id)}`, cta: "Print or share" },
            { n: 5, title: "Check people in at the gate", hint: "Scan each pass as guests arrive.", done: !!live.data && live.data.checkedIn > 0, href: "/app/check-in/", cta: "Open the gate" },
          ]}
        />
      )}
      <Waiting loading={roster.loading} apiKey="/events/roster" label="Loading the people"><div className="grid gap-3 sm:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Sk key={i} i={i} className="!h-24 !rounded-xl" />)}</div></Waiting>
      {roster.error && <p role="alert" className="text-sm text-red-300">{explain(roster.error)}</p>}
      {roster.data && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Event numbers">
          {stat("People", people.length)}
          {stat("Teams", teams.length)}
          {stat("Checked in", live.data ? `${live.data.checkedIn} of ${live.data.total}` : "…", "Updates every 30 seconds while this page is open")}
          {stat("Under 18", minors, noConsent ? `${noConsent} without a guardian's consent` : minors ? "All have consent" : undefined)}
        </div>
      )}
      {roster.data && (noConsent > 0 || noPhoto > 0) && (
        <ul className="space-y-1.5 rounded-xl border border-amber-500/30 bg-[#0a0b0d] p-3 text-sm text-amber-100" aria-label="Things to check">
          {noConsent > 0 && <li><strong>{noConsent}</strong> {noConsent === 1 ? "person is" : "people are"} under 18 without a guardian&apos;s consent recorded. Do not print their card until it is.</li>}
          {noPhoto > 0 && <li><strong>{noPhoto}</strong> {noPhoto === 1 ? "person has" : "people have"} no photo.</li>}
        </ul>
      )}
      {roster.data && teams.length > 0 && (
        <div className="card !p-4"><h3 className="font-display font-bold text-white">Teams</h3><ul className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">{teams.map((t) => <li key={t.id} className="flex justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"><span className="truncate text-zinc-200">{t.name}</span><span className="text-zinc-400">{people.filter((p) => p.teamId === t.id).length} people</span></li>)}</ul></div>
      )}
      {ev.role === "viewer" && <p role="note" className="rounded-xl border border-amber-500/30 bg-[#0a0b0d] p-3 text-sm text-amber-100">You have view-only access to this event. You can look, but not change anything.</p>}
      {ev.role !== "viewer" && <RegistrationPanel eventId={ev.id} onApproved={() => { roster.refetch(); }} />}
      <EventToolbox eventId={ev.id} eventName={ev.name} role={ev.role ?? "owner"} />
      {(ev.role === undefined || ev.role === "owner") && <MembersPanel eventId={ev.id} />}
      {(
        <details className="group rounded-2xl border border-white/10 bg-zinc-900/40">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-cyan"><span><span className="font-display text-base font-bold text-white">More options</span><span className="ml-2 text-sm text-zinc-400">venue screen, points table, certificates{ev.role === undefined || ev.role === "owner" ? ", delete this event" : ""}</span></span><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current transition-transform group-open:rotate-180" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg></summary>
          <div className="space-y-4 border-t border-white/10 p-4">
            <ScreenLauncher ev={ev} />
            <div className="space-y-2"><p className="text-sm text-zinc-300">Other tools for after the games:</p><div className="flex flex-wrap gap-2"><Link href="/tools/points-table/" className="btn-ghost !min-h-11 px-4 text-sm">Points table</Link><Link href="/tools/certificates/" className="btn-ghost !min-h-11 px-4 text-sm">Certificates</Link></div></div>
            {(ev.role === undefined || ev.role === "owner") && <DeleteEvent ev={ev} onDeleted={onDeleted} />}
          </div>
        </details>
      )}
      <div className="flex flex-wrap gap-2"><Link href={`/app/id-cards/?open=${encodeURIComponent(ev.id)}`} className="btn !min-h-11 px-4 text-sm">Open the cards</Link><Link href="/app/check-in/" className="btn-ghost !min-h-11 px-4 text-sm">Gate check-in</Link></div>
    </section>
  );
}
