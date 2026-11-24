"use client";

import Link from "next/link";
import { useState } from "react";
import { explainFailure } from "@/features/shared/failure";
import { Field, SelectInput, TextInput } from "@/features/shared/ui/Fields";
import { EmptyState, ErrorState, NotAvailable, SignInPrompt, SkeletonRows, StatusBadge } from "@/features/shared/ui/States";
import { box, btnDanger, btnPrimary, btnSecondary, h1, h2, h3, helper, input, link, section } from "@/features/shared/ui/styles";
import { CRED_MAX, PHASE_TEXT, REVEAL_CHOICES, matchText, revealText, whenText, type CaptainRoom, type OrganiserRoom, type RevealedRoom, type RoomPhase } from "@/features/match-rooms/domain";
import { useCaptainRooms, useOrganiserRooms, type Msg } from "@/features/match-rooms/hooks/useRooms";

const WHAT = "Match room sharing";
const TONE: Record<RoomPhase, "neutral" | "success" | "warning"> = { waiting: "neutral", revealed: "success", expired: "warning" };
const revealOptions = [{ value: "0", label: "At the start" }, ...REVEAL_CHOICES.map((m) => ({ value: String(m), label: revealText(m).replace(/^./, (c) => c.toUpperCase()) }))];

/** Changing words sit in their own keyed element, so a page translated by the browser cannot detach them from React. */
function Status({ msg }: { msg: Msg | null }) {
  return <p role="status" aria-live="polite" className={`min-h-5 text-sm ${msg?.ok === false ? "text-danger" : "text-success"}`}>{msg && <span key={msg.text}>{msg.text}</span>}</p>;
}

// ---------------------------------------------------------------- organiser
export function OrganiserRoomsScreen() {
  const v = useOrganiserRooms();
  const { res } = v;
  const name = res.phase === "ready" ? res.data.event.name : "";
  return (
    <div className="mx-auto max-w-4xl space-y-8" data-testid="rooms-organiser">
      <header className="space-y-2">
        <h1 className={h1}>Match rooms</h1>
        {name && <p className="text-zinc-300"><span key={name}>{name}</span></p>}
        <p className="max-w-3xl text-zinc-300">Type the custom-room ID and password once. Only the captains of confirmed teams in that match can see them, and only from the time you choose. Every look is logged.</p>
      </header>
      {v.eventId === "" && <EmptyState title="Open this from an event" body="Match rooms belong to one event. Open the event first, then choose Match rooms." action={<Link href="/app/events/" className={btnSecondary}>My events</Link>} />}
      {v.eventId !== "" && res.phase === "unavailable" && <NotAvailable what={WHAT} />}
      {res.phase === "signin" && <SignInPrompt what="Sign in to manage match rooms." next="/app/events/" />}
      {res.phase === "loading" && (res.showSkeleton ? <SkeletonRows n={2} label="Loading rooms" /> : <p className="sr-only">Loading rooms</p>)}
      {res.phase === "error" && <ErrorState message={explainFailure(res.failure)} onRetry={res.reload} />}
      {res.phase === "ready" && (
        <>
          <p className="text-sm text-zinc-300">Tell captains to open <Link href="/app/rooms/" className={link}>My match rooms</Link> (esports.streamerosai.com/app/rooms/) and add their team once with its captain link. A team must be approved before its captain can see anything.</p>
          {res.data.canEdit ? <AddRoom v={v} /> : <p role="note" className={box}>You have view-only access to this event. You can see the rooms, not change them.</p>}
          <Status msg={v.msg} />
          <section aria-labelledby="rooms-h" className={`${section} space-y-4`}>
            <h2 id="rooms-h" className={h2}>Rooms</h2>
            {res.data.rooms.length === 0 ? <p className="text-zinc-300">No rooms yet.</p> : (
              <ul className="space-y-4">{res.data.rooms.map((r) => <RoomCard key={r.id} r={r} v={v} canEdit={res.data.canEdit} />)}</ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function AddRoom({ v }: { v: ReturnType<typeof useOrganiserRooms> }) {
  const matches = v.res.phase === "ready" ? v.res.data.matches : [];
  const { form, errors, set } = v;
  return (
    <section aria-labelledby="add-h" className={`${box} space-y-4`}>
      <h2 id="add-h" className={h3}>Add a room</h2>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void v.add(); }} noValidate>
        <TextInput id="room-label" label="Room name" value={form.label} onChange={(x) => set("label", x)} maxLength={80} error={errors.label} help="For example Match 3 lobby or Semi-final 1." />
        <SelectInput id="room-match" label="Who it is for" value={form.matchId} onChange={(x) => set("matchId", x)} blank="Every confirmed team (one lobby)" options={matches.map((m) => ({ value: m.id, label: `${m.teamA || "?"} vs ${m.teamB || "?"} (round ${m.round})` }))} help="Pick a match to show it to those two teams only." />
        <Field id="room-start" label="Match starts at" error={errors.startsAt}>
          <input id="room-start" type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} aria-invalid={errors.startsAt ? true : undefined} className={input} />
        </Field>
        <SelectInput id="room-reveal" label="Captains can see it" value={form.revealMinutesBefore} onChange={(x) => set("revealMinutesBefore", x)} options={revealOptions} error={errors.revealMinutesBefore} />
        <div data-clarity-mask="true" translate="no" className="contents">
          <TextInput id="room-id" label="Room ID" value={form.roomId} onChange={(x) => set("roomId", x)} maxLength={CRED_MAX} autoComplete="off" error={errors.roomId} />
          <TextInput id="room-pass" label="Room password" value={form.password} onChange={(x) => set("password", x)} maxLength={CRED_MAX} autoComplete="off" error={errors.password} />
        </div>
        <p className={`${helper} sm:col-span-2`}>The ID and password are encrypted on our server and you will not see them here again. To change them later, use New password. They are deleted 24 hours after the start.</p>
        <div className="sm:col-span-2"><button type="submit" className={btnPrimary} disabled={v.busy}>Save room</button></div>
      </form>
    </section>
  );
}

function RoomCard({ r, v, canEdit }: { r: OrganiserRoom; v: ReturnType<typeof useOrganiserRooms>; canEdit: boolean }) {
  const [rotating, setRotating] = useState(false);
  const [pw, setPw] = useState("");
  const [rid, setRid] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reveal, setReveal] = useState(String(r.revealMinutesBefore));
  const views = v.views?.roomId === r.id ? v.views.list : null;
  return (
    <li className={`${box} space-y-3`} data-testid="room-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className={h3}><span key={r.label}>{r.label}</span></h3>
          <p className="text-sm text-zinc-300"><span key={matchText(r.match)}>{matchText(r.match)}</span></p>
        </div>
        <StatusBadge label={PHASE_TEXT[r.phase]} tone={TONE[r.phase]} />
      </div>
      <dl className="grid gap-1 text-sm text-zinc-300 sm:grid-cols-2">
        <div><dt className="inline text-zinc-400">Starts: </dt><dd className="inline"><span key={r.startsAt}>{whenText(r.startsAt)}</span></dd></div>
        <div><dt className="inline text-zinc-400">Captains see it: </dt><dd className="inline"><span key={r.revealAt}>{revealText(r.revealMinutesBefore)}</span></dd></div>
        <div><dt className="inline text-zinc-400">Password version: </dt><dd className="inline"><span key={r.version}>{r.version}</span></dd></div>
        <div><dt className="inline text-zinc-400">Teams that saw this password: </dt><dd className="inline"><span key={r.teamsSeenCurrent}>{r.teamsSeenCurrent}</span></dd></div>
      </dl>
      {!r.hasCredentials && <p className="text-sm text-warning">The details were deleted after the match.</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnSecondary} aria-expanded={!!views} onClick={() => void v.showViews(r.id)}>Who has seen it</button>
        {canEdit && <button type="button" className={btnSecondary} aria-expanded={rotating} onClick={() => setRotating((x) => !x)}>New password</button>}
        {canEdit && (confirmDelete
          ? <button type="button" className={btnDanger} disabled={v.busy} onClick={() => void v.remove(r.id)}>Press again to delete</button>
          : <button type="button" className={btnDanger} onClick={() => setConfirmDelete(true)}>Delete</button>)}
      </div>
      {canEdit && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-48"><SelectInput id={`reveal-${r.id}`} label="Change when captains see it" value={reveal} onChange={setReveal} options={revealOptions} /></div>
          <button type="button" className={btnSecondary} disabled={v.busy || reveal === String(r.revealMinutesBefore)} onClick={() => void v.retime(r.id, Number(reveal))}>Save time</button>
        </div>
      )}
      {rotating && (
        <form className="grid gap-3 sm:grid-cols-2" data-clarity-mask="true" translate="no" onSubmit={async (e) => { e.preventDefault(); if (await v.rotate(r.id, pw, rid)) { setPw(""); setRid(""); setRotating(false); } }}>
          <TextInput id={`pw-${r.id}`} label="New password" value={pw} onChange={setPw} maxLength={CRED_MAX} autoComplete="off" />
          <TextInput id={`rid-${r.id}`} label="New room ID (leave empty to keep it)" value={rid} onChange={setRid} maxLength={CRED_MAX} autoComplete="off" />
          <div className="sm:col-span-2"><button type="submit" className={btnPrimary} disabled={v.busy}>Save new password</button></div>
        </form>
      )}
      {views && (
        <div className="space-y-2" aria-label={`Who has seen ${r.label}`} role="region">
          {views.length === 0 ? <p className="text-sm text-zinc-300">Nobody has looked yet.</p> : (
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-400"><tr><th scope="col" className="py-1 pr-3 font-medium">Team captain</th><th scope="col" className="py-1 pr-3 font-medium">When</th><th scope="col" className="py-1 font-medium">Password version</th></tr></thead>
              <tbody>{views.map((x, i) => <tr key={`${x.viewedAt}-${i}`} className="border-t border-white/10 text-zinc-200"><td className="py-1 pr-3">{x.team}</td><td className="py-1 pr-3">{whenText(x.viewedAt)}</td><td className="py-1">{x.version}</td></tr>)}</tbody>
            </table>
          )}
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------- captain
export function CaptainRoomsScreen() {
  const v = useCaptainRooms();
  const { res } = v;
  return (
    <div className="mx-auto max-w-3xl space-y-8" data-testid="rooms-captain">
      <header className="space-y-2">
        <h1 className={h1}>My match rooms</h1>
        <p className="text-zinc-300">Room IDs and passwords from organisers, for teams you captain. They appear at the time the organiser chose.</p>
      </header>
      {res.phase === "unavailable" && <NotAvailable what={WHAT} />}
      {res.phase === "signin" && <SignInPrompt what="Sign in to see your match rooms." next="/app/rooms/" />}
      {res.phase === "loading" && (res.showSkeleton ? <SkeletonRows n={2} label="Loading rooms" /> : <p className="sr-only">Loading rooms</p>)}
      {res.phase === "error" && <ErrorState message={explainFailure(res.failure)} onRetry={res.reload} />}
      {res.phase === "ready" && (
        <>
          <section aria-labelledby="claim-h" className={`${box} space-y-3`}>
            <h2 id="claim-h" className={h3}>Add a team you captain</h2>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); void v.claim(); }}>
              <TextInput id="captain-link" label="Your team's captain link" value={v.link} onChange={v.setLink} autoComplete="off" help="The organiser sent it to you. It is checked once and not saved." />
              {v.needsAdult && (
                <label className="flex min-h-11 items-center gap-3 text-zinc-100"><input type="checkbox" checked={v.adult} onChange={(e) => v.setAdult(e.target.checked)} className="h-5 w-5" /> I am 18 or older</label>
              )}
              <button type="submit" className={btnPrimary} disabled={v.busy}>Add team</button>
            </form>
            <Status msg={v.msg} />
          </section>
          <section aria-labelledby="mine-h" className={`${section} space-y-4`}>
            <h2 id="mine-h" className={h2}>Rooms</h2>
            {res.data.length === 0 ? <p className="text-zinc-300">No rooms for your teams yet. Rooms show here once your team is confirmed and the organiser adds one.</p> : (
              <ul className="space-y-4">{res.data.map((r) => <CaptainCard key={r.id} r={r} shown={v.shown[r.id] ?? null} err={v.roomMsg[r.id] ?? ""} onReveal={() => void v.reveal(r)} onHide={() => v.hide(r.id)} />)}</ul>
            )}
          </section>
          <p className="text-sm text-zinc-400">Keep the details inside your team. Each look is recorded for the organiser. <Link href="/privacy/" className={link}>Privacy</Link></p>
        </>
      )}
    </div>
  );
}

function CaptainCard({ r, shown, err, onReveal, onHide }: { r: CaptainRoom; shown: RevealedRoom | null; err: string; onReveal: () => void; onHide: () => void }) {
  return (
    <li className={`${box} space-y-3`} data-testid="captain-room">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className={h3}><span key={r.label}>{r.label}</span></h3>
          <p className="text-sm text-zinc-300"><span key={r.event.name + r.team}>{r.event.name} · {r.team}</span></p>
        </div>
        <StatusBadge label={PHASE_TEXT[r.phase]} tone={TONE[r.phase]} />
      </div>
      <p className="text-sm text-zinc-300">Starts <span key={r.startsAt}>{whenText(r.startsAt)}</span>. Shown from <span key={r.revealAt}>{whenText(r.revealAt)}</span>.</p>
      {shown ? (
        <div className="space-y-3" data-clarity-mask="true" translate="no">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div><dt className="text-sm text-zinc-400">Room ID</dt><dd className="font-mono text-2xl text-zinc-100" data-testid="room-id"><span key={shown.roomId}>{shown.roomId}</span></dd></div>
            <div><dt className="text-sm text-zinc-400">Password</dt><dd className="font-mono text-2xl text-zinc-100" data-testid="room-password"><span key={shown.password}>{shown.password}</span></dd></div>
          </dl>
          <button type="button" className={btnSecondary} onClick={onHide}>Hide</button>
        </div>
      ) : (
        <button type="button" className={btnPrimary} disabled={r.phase !== "revealed"} onClick={onReveal}>{r.phase === "revealed" ? "Show room ID and password" : "Not shown yet"}</button>
      )}
      {err && <p role="alert" className="text-sm text-danger"><span key={err}>{err}</span></p>}
    </li>
  );
}
