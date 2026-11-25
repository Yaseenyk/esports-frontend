"use client";

import Link from "next/link";
import { useState } from "react";
import { GAMES, gameLabel } from "@/features/shared/games";
import { explainFailure } from "@/features/shared/failure";
import { useAdult } from "@/features/shared/hooks/useAdult";
import { Field, SelectInput, TextArea, TextInput } from "@/features/shared/ui/Fields";
import Modal from "@/features/shared/ui/Modal";
import { AdultGate, EmptyState, ErrorState, NotAvailable, SignInPrompt, SkeletonRows, StatusBadge } from "@/features/shared/ui/States";
import { box, btnDanger, btnPrimary, btnSecondary, h1, h2, h3, helper, input, link, section } from "@/features/shared/ui/styles";
import { REGIONS, REQUEST_WORDS, regionLabel, type BoardFilters, type MySlot, type Slot } from "@/features/scrims/domain";
import { useIncoming, useMyScrims, useNewScrim, useRequestSlot, useScrimBoard, useSlotActions } from "@/features/scrims/hooks/useScrims";
import { slotTimeText, type Zone } from "@/features/scrims/time";
import { NoticesBanner, RosterPanel, SchedulesSection, WaitlistDialog, WaitlistSection } from "@/features/scrims/ui/ManagerParts";

const REASONS = [
  { value: "spam", label: "Spam" }, { value: "scam", label: "Scam" }, { value: "minor_exposed", label: "Involves someone under 18" }, { value: "contact_details", label: "Shares contact details" },
  { value: "offensive", label: "Offensive" }, { value: "wrong_info", label: "Wrong information" }, { value: "other", label: "Something else" },
];
const RULES = "Contact details stay hidden until the poster accepts. Then each side sees the other's handle on Esports Hub, never a phone number or email.";

function ZoneSwitch({ zone, onChange }: { zone: Zone; onChange: (z: Zone) => void }) {
  return (
    <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-100">
      <legend className="sr-only">Show times in</legend>
      <span className="text-zinc-300">Times in:</span>
      {([["ist", "India time (IST)"], ["device", "My device time"]] as const).map(([v, l]) => (
        <label key={v} className="flex min-h-11 min-w-0 items-center gap-2"><input type="radio" name="zone" checked={zone === v} onChange={() => onChange(v)} className="h-5 w-5 accent-cyan-400" />{l}</label>
      ))}
    </fieldset>
  );
}

function BoardFiltersForm({ value, onChange, onClear, filtered, minDay }: { value: BoardFilters; onChange: (f: BoardFilters) => void; onClear: () => void; filtered: boolean; minDay: string }) {
  const set = <K extends keyof BoardFilters>(k: K, v: BoardFilters[K]) => onChange({ ...value, [k]: v });
  return (
    <form role="search" aria-label="Filter scrims" onSubmit={(e) => e.preventDefault()} className={`${box} space-y-4`}>
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectInput id="sf-game" label="Game" value={value.game} onChange={(v) => set("game", v)} options={GAMES} blank="Any game" />
        <Field id="sf-day" label="Date (India time)">
          <input id="sf-day" type="date" min={minDay} value={value.day} onChange={(e) => set("day", e.target.value)} className={input} />
        </Field>
        <SelectInput id="sf-region" label="Region" value={value.region} onChange={(v) => set("region", v)} options={REGIONS} blank="Any region" />
      </div>
      {filtered && <button type="button" onClick={onClear} className={btnSecondary}>Clear all filters</button>}
    </form>
  );
}

function SlotCard({ s, zone, signedIn, onAsk, onWait, onMore }: { s: Slot; zone: Zone; signedIn: boolean; onAsk: () => void; onWait: () => void; onMore: () => void }) {
  return (
    <li className={`${box} flex flex-col gap-3`}>
      <div className="flex flex-wrap items-center gap-2"><StatusBadge label={gameLabel(s.game)} tone="accent" />{s.mine && <StatusBadge label="Your scrim" />}{s.myRequest && <StatusBadge label={REQUEST_WORDS[s.myRequest] ?? s.myRequest} tone={s.myRequest === "accepted" ? "success" : "neutral"} />}</div>
      <h3 className={h3}>{s.teamName}</h3>
      <p className="text-zinc-100">{slotTimeText(s.startsAt, zone)}</p>
      <p className="text-sm text-zinc-300">{regionLabel(s.region)}{s.server ? ` · ${s.server}` : ""} · {s.slotsLeft === 0 ? <>Full · waitlist open</> : <><span className="font-mono tabular-nums">{s.slotsLeft}</span> of <span className="font-mono tabular-nums">{s.slotsTotal}</span> {s.slotsTotal === 1 ? "slot" : "slots"} open</>}</p>
      {s.skillNote && <p className="whitespace-pre-line text-sm text-zinc-300">{s.skillNote}</p>}
      {!s.mine && (
        <div className="mt-auto flex flex-wrap gap-3">
          {signedIn ? (s.myRequest ? <Link href="/app/scrims/" className={btnSecondary}>See your request</Link> : s.slotsLeft === 0 ? <button type="button" onClick={onWait} className={btnPrimary}>Join the waitlist</button> : <button type="button" onClick={onAsk} className={btnPrimary}>Ask to join</button>) : <Link href="/login/?next=%2Fscrims%2F" className={btnPrimary}>Sign in to join</Link>}
          {signedIn && <button type="button" onClick={onMore} className={btnSecondary}>Report or block</button>}
        </div>
      )}
    </li>
  );
}

function AskDialog({ slot, zone, onClose }: { slot: Slot; zone: Zone; onClose: () => void }) {
  const a = useRequestSlot(slot.id);
  return (
    <Modal open onClose={onClose} title={`Ask to join ${slot.teamName}`}>
      {a.sent ? (
        <div role="status" className="space-y-4"><p className="text-zinc-100">Request sent. You will see their contact on <Link href="/app/scrims/" className={link}>My scrims</Link> if they accept.</p><button type="button" onClick={onClose} className={btnPrimary}>Done</button></div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void a.submit(); }} className="space-y-4" noValidate>
          <p className="text-sm text-zinc-300">{slotTimeText(slot.startsAt, zone)} · {gameLabel(slot.game)}</p>
          {a.teams.length === 0 ? <p className="text-sm text-zinc-300">You need a team page to ask. Create one from one of your events (Team pages), then come back.</p> : (
            <SelectInput id="ak-team" label="Your team" value={a.teamProfileId} onChange={a.setTeam} blank="Choose your team page" options={a.teams.map((t) => ({ value: t.id, label: t.name }))} />
          )}
          <TextArea id="ak-msg" label="Message (optional)" value={a.message} onChange={a.setMessage} rows={3} max={300} help="Only the poster sees it. No links or phone numbers." />
          <TextInput id="ak-contact" label="Your contact" value={a.contact} onChange={a.setContact} maxLength={40} help="A game or Discord handle. Shown to the poster only if they accept. Not a phone number or email." />
          {a.error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{a.error}</p>}
          <div className="flex flex-wrap gap-3"><button type="submit" disabled={a.busy || a.teams.length === 0} className={btnPrimary}>{a.busy ? "Sending" : "Send request"}</button><button type="button" onClick={onClose} className={btnSecondary}>Cancel</button></div>
        </form>
      )}
    </Modal>
  );
}

function MoreDialog({ slot, onClose, onBlocked }: { slot: Slot; onClose: () => void; onBlocked: () => void }) {
  const m = useSlotActions(slot.id, () => { onBlocked(); onClose(); });
  return (
    <Modal open onClose={onClose} title={`Report or block ${slot.teamName}`}>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className={h3}>Block this team</h3>
          <p className="text-sm text-zinc-300">You will stop seeing their scrims and they cannot ask to join yours. They are not told. You can unblock on My scrims.</p>
          <button type="button" onClick={() => void m.block()} disabled={m.busy !== ""} className={btnDanger}>{m.busy === "block" ? "Blocking" : "Block"}</button>
        </section>
        <section className="space-y-3 border-t border-white/10 pt-4">
          <h3 className={h3}>Report this scrim</h3>
          {m.reported ? <p role="status" className="text-zinc-100">Thank you. A moderator will look at it.</p> : (
            <form onSubmit={(e) => { e.preventDefault(); void m.report(); }} className="space-y-3">
              <SelectInput id="rp-reason" label="What is wrong?" value={m.reason} onChange={m.setReason} options={REASONS} />
              <TextArea id="rp-note" label="Anything we should know? (optional)" value={m.note} onChange={m.setNote} rows={3} max={200} />
              <button type="submit" disabled={m.busy !== ""} className={btnPrimary}>{m.busy === "report" ? "Sending" : "Send report"}</button>
            </form>
          )}
        </section>
        {m.error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{m.error}</p>}
        <button type="button" onClick={onClose} className={btnSecondary}>Close</button>
      </div>
    </Modal>
  );
}

/** /scrims/: open scrim slots, soonest first. "Not available yet" while v3.scrims is off. Always noindex (scrims/layout.tsx). */
export function ScrimBoardScreen() {
  const b = useScrimBoard();
  const [ask, setAsk] = useState<Slot | null>(null);
  const [more, setMore] = useState<Slot | null>(null);
  const [wait, setWait] = useState<Slot | null>(null);
  // An empty board with no filters shows one way forward (the empty state's own "Post a scrim"), not a second button and filters over nothing.
  const bare = b.phase === "ready" && b.items.length === 0 && !b.filtered;
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className={h1}>Scrim finder</h1>
        <p className="max-w-3xl text-zinc-300">Captains post open practice slots; other captains ask to join. You must be 18 or older and have a team page. {RULES}</p>
        {!bare && b.phase !== "unavailable" && <p><Link href="/scrims/new/" className={btnPrimary}>Post a scrim</Link></p>}
        {!bare && <p className="text-sm text-zinc-400">Not sure when your squad is free? Ask them with the <Link href="/tools/scrim-time-planner/" className="text-cyan-400 underline underline-offset-2">scrim time planner</Link> first.</p>}
      </header>
      {b.phase === "unavailable" ? <NotAvailable what="The scrim finder" /> : (
        <>
          {!bare && <BoardFiltersForm value={b.filters} onChange={b.setFilters} onClear={b.clear} filtered={b.filtered} minDay={b.today} />}
          {!bare && <ZoneSwitch zone={b.zone} onChange={b.setZone} />}
          <div aria-live="polite">
            {b.phase === "loading" && (b.skeleton ? <SkeletonRows label="Loading scrims" /> : <p className="sr-only">Loading scrims</p>)}
            {b.phase === "error" && <ErrorState message={b.failure ? explainFailure(b.failure) : "The scrims did not load."} onRetry={b.retry} />}
            {b.phase === "ready" && b.items.length === 0 && (
              <EmptyState title={b.filtered ? "Nothing matches these filters" : "No open scrims yet"} body={b.filtered ? "Try another day or clear the filters." : "Post the first one: pick a time and how many teams you need."}
                action={b.filtered ? <button type="button" onClick={b.clear} className={btnSecondary}>Clear all filters</button> : <Link href="/scrims/new/" className={btnPrimary}>Post a scrim</Link>} />
            )}
            {b.phase === "ready" && b.items.length > 0 && (
              <>
                <ul className="grid gap-4 sm:grid-cols-2">{b.items.map((s) => <SlotCard key={s.id} s={s} zone={b.zone} signedIn={b.signedIn} onAsk={() => setAsk(s)} onWait={() => setWait(s)} onMore={() => setMore(s)} />)}</ul>
                {b.hasMore && <p className="mt-6 text-center"><button type="button" onClick={b.loadMore} disabled={b.loadingMore} className={btnSecondary}>{b.loadingMore ? "Loading" : "Show more"}</button></p>}
              </>
            )}
          </div>
        </>
      )}
      {ask && <AskDialog slot={ask} zone={b.zone} onClose={() => { setAsk(null); b.retry(); }} />}
      {more && <MoreDialog slot={more} onClose={() => setMore(null)} onBlocked={b.retry} />}
      {wait && <WaitlistDialog slot={wait} onClose={() => { setWait(null); b.retry(); }} />}
    </div>
  );
}

/** /scrims/new/: post a slot. Time is typed in India time by default (stored in UTC). */
export function NewScrimScreen() {
  const f = useNewScrim();
  const adult = useAdult(!!f.session);
  const { form, set, errors } = f;
  if (f.createdId) {
    return (
      <div className="mx-auto max-w-3xl space-y-4"><h1 className={h1}>Scrim posted</h1>
        <p role="status" className="text-zinc-100">Your scrim is on the board. Answer requests from <Link href="/app/scrims/" className={link}>My scrims</Link>.</p>
        <p><Link href="/scrims/" className={btnPrimary}>See the board</Link></p></div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className={h1}>Post a scrim</h1>
      {adult.unavailable ? <NotAvailable what="The scrim finder" /> : !f.session ? <SignInPrompt what="Sign in to post a scrim. You also need to confirm you are 18 or older." next="/scrims/new/" /> : adult.known && !adult.adult ? <AdultGate busy={adult.busy} error={adult.error} onConfirm={adult.confirm} /> : (
        <form onSubmit={(e) => { e.preventDefault(); void f.submit(); }} className={`${box} space-y-5`} noValidate>
          {f.teams.length === 0 && <p className="text-sm text-zinc-300">You need a team page to post. Create one from one of your events (Team pages) first.</p>}
          <SelectInput id="ns-team" label="Your team" value={form.teamProfileId} onChange={(v) => set("teamProfileId", v)} blank="Choose your team page" options={f.teams.map((t) => ({ value: t.id, label: t.name }))} error={errors.teamProfileId} help="Only its name is shown on the board." />
          <SelectInput id="ns-game" label="Game" value={form.game} onChange={(v) => set("game", v)} options={GAMES} blank="Choose a game" error={errors.game} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="ns-day" label="Date" error={errors.day}>
              <input id="ns-day" type="date" min={f.minDay} value={form.day} onChange={(e) => set("day", e.target.value)} aria-invalid={errors.day ? true : undefined} className={input} />
            </Field>
            <Field id="ns-time" label="Start time">
              <input id="ns-time" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className={input} />
            </Field>
            <SelectInput id="ns-zone" label="Time zone" value={form.zone} onChange={(v) => set("zone", v === "device" ? "device" : "ist")} options={[{ value: "ist", label: "India time (IST)" }, { value: "device", label: "My device time" }]} />
          </div>
          <p className={helper}>At least 15 minutes from now and at most 30 days ahead. Everyone sees it in India time unless they switch to their own.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectInput id="ns-region" label="Region" value={form.region} onChange={(v) => set("region", v)} options={REGIONS} />
            <TextInput id="ns-server" label="Server (optional)" value={form.server} onChange={(v) => set("server", v)} maxLength={40} help="For example Mumbai or Asia." />
            <TextInput id="ns-slots" label="Teams needed" value={form.slots} onChange={(v) => set("slots", v.replace(/\D/g, "").slice(0, 2))} inputMode="numeric" error={errors.slots} help="1 to 24." />
          </div>
          <TextArea id="ns-note" label="Skill note (optional)" value={form.skillNote} onChange={(v) => set("skillNote", v)} rows={3} max={200} error={errors.skillNote} help="For example: tier 2 squads, T3 welcome. Public: no links, phone numbers, @handles or DM-me lines." />
          <TextInput id="ns-contact" label="Your contact" value={form.contact} onChange={(v) => set("contact", v)} maxLength={40} error={errors.contact} help="A game or Discord handle. Never on the board: shown only to captains you accept." />
          {f.serverError && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{f.serverError}</p>}
          <button type="submit" disabled={f.busy} className={btnPrimary}>{f.busy ? "Posting" : "Post scrim"}</button>
        </form>
      )}
    </div>
  );
}

function IncomingList({ slot, onChange }: { slot: MySlot; onChange: () => void }) {
  const i = useIncoming(slot.id, onChange);
  if (i.res.phase === "loading") return <SkeletonRows n={1} label="Loading requests" />;
  if (i.res.phase === "error") return <ErrorState message={explainFailure(i.res.failure)} onRetry={i.res.reload} />;
  if (i.res.phase !== "ready") return null;
  if (i.res.data.length === 0) return <p className="text-sm text-zinc-300">No requests yet.</p>;
  return (
    <div className="space-y-3">
      {i.error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{i.error}</p>}
      <ul className="space-y-3">
        {i.res.data.map((q) => (
          <li key={q.id} className="rounded-lg border border-white/10 p-3">
            <p className="text-zinc-100">{q.teamName} <StatusBadge label={REQUEST_WORDS[q.status] ?? q.status} tone={q.status === "accepted" ? "success" : "neutral"} /></p>
            {q.message && <p className="mt-1 whitespace-pre-line text-sm text-zinc-300">{q.message}</p>}
            {q.contact && <p className="mt-2 text-sm text-zinc-100">Contact: <span className="font-mono">{q.contact}</span></p>}
            {q.status === "sent" && (
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" onClick={() => void i.accept(q.id)} disabled={i.busy !== "" || slot.expired} className={btnPrimary}>Accept</button>
                <button type="button" onClick={() => void i.decline(q.id)} disabled={i.busy !== ""} className={btnSecondary}>Decline</button>
                <button type="button" onClick={() => void i.block(q.id)} disabled={i.busy !== ""} className={btnDanger}>Block</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const slotStatus = (s: MySlot): string => (s.hidden ? "Hidden while a moderator reviews it" : s.expired ? "Started" : s.status === "full" ? "Full" : s.status === "cancelled" ? "Cancelled" : s.status === "removed" ? "Removed" : "Open");

/** /app/scrims/: my slots and their requests, the requests I sent (contact after accept), and who I blocked. */
export function MyScrimsScreen() {
  const m = useMyScrims();
  const [openId, setOpenId] = useState<string | null>(null);
  const [rosterId, setRosterId] = useState<string | null>(null);
  const off = m.slots.phase === "unavailable";
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className={h1}>My scrims</h1>
      {off ? <NotAvailable what="The scrim finder" /> : m.slots.phase === "signin" ? <SignInPrompt what="Sign in to see your scrims." next="/app/scrims/" /> : (
        <>
          <NoticesBanner />
          <p className="text-zinc-300">{RULES} <Link href="/scrims/" className={link}>Open the board</Link></p>
          <div aria-live="polite">
            {m.notice && <p role="status" className="text-success"><span aria-hidden="true">+ </span>{m.notice}</p>}
            {m.error && <p role="alert" className="text-danger"><span aria-hidden="true">! </span>{m.error}</p>}
          </div>
          <section aria-labelledby="ms-h" className="space-y-4">
            <h2 id="ms-h" className={h2}>Scrims I posted</h2>
            {m.slots.phase === "loading" && <SkeletonRows n={2} label="Loading your scrims" />}
            {m.slots.phase === "error" && <ErrorState message={explainFailure(m.slots.failure)} onRetry={m.slots.reload} />}
            {m.slots.phase === "ready" && m.slots.data.length === 0 && <EmptyState title="No scrims posted" body="Post one and other captains can ask to join." action={<Link href="/scrims/new/" className={btnPrimary}>Post a scrim</Link>} />}
            {m.slots.phase === "ready" && m.slots.data.length > 0 && (
              <ul className="space-y-4">
                {m.slots.data.map((s) => (
                  <li key={s.id} className={`${box} space-y-3`}>
                    <p className="text-zinc-100">{gameLabel(s.game)} · {slotTimeText(s.startsAt)} <StatusBadge label={slotStatus(s)} /></p>
                    <p className="text-sm text-zinc-300">{s.teamName} · {regionLabel(s.region)} · <span className="font-mono tabular-nums">{s.slotsTotal - s.slotsLeft}</span> of <span className="font-mono tabular-nums">{s.slotsTotal}</span> taken · {s.requests.pending} waiting · your contact: <span className="font-mono">{s.contact}</span></p>
                    <div className="flex flex-wrap gap-3">
                      <button type="button" aria-expanded={openId === s.id} onClick={() => setOpenId(openId === s.id ? null : s.id)} className={btnSecondary}>{openId === s.id ? "Hide requests" : "Requests"}</button>
                      <button type="button" aria-expanded={rosterId === s.id} onClick={() => setRosterId(rosterId === s.id ? null : s.id)} className={btnSecondary}>{rosterId === s.id ? "Hide slots" : "Slots and waitlist"}</button>
                      {!s.expired && (s.status === "open" || s.status === "full") && <button type="button" onClick={() => void m.cancel(s.id)} disabled={m.busy !== ""} className={btnDanger}>Cancel scrim</button>}
                    </div>
                    {openId === s.id && <IncomingList slot={s} onChange={m.afterRequestChange} />}
                    {rosterId === s.id && <RosterPanel slotId={s.id} onChange={m.afterRequestChange} />}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="mr-h" className={`${section} space-y-4`}>
            <h2 id="mr-h" className={h2}>Requests I sent</h2>
            {m.sent.phase === "ready" && m.sent.data.length === 0 && <p className="text-zinc-300">None yet.</p>}
            {m.sent.phase === "error" && <ErrorState message={explainFailure(m.sent.failure)} onRetry={m.sent.reload} />}
            {m.sent.phase === "ready" && m.sent.data.length > 0 && (
              <ul className="space-y-3">
                {m.sent.data.map((q) => (
                  <li key={q.id} className={box}>
                    <p className="text-zinc-100">{q.teamName} · {gameLabel(q.game)} · {slotTimeText(q.startsAt)} <StatusBadge label={REQUEST_WORDS[q.status] ?? q.status} tone={q.status === "accepted" ? "success" : "neutral"} /></p>
                    <p className="text-sm text-zinc-300">As {q.myTeamName}{q.slotStatus === "cancelled" ? " · the poster cancelled this scrim" : ""}</p>
                    {q.contact && <p className="mt-2 text-sm text-zinc-100">Their contact: <span className="font-mono">{q.contact}</span></p>}
                    {(q.status === "sent" || q.status === "accepted") && <button type="button" onClick={() => void m.withdraw(q.id)} disabled={m.busy !== ""} className={`${btnSecondary} mt-3`}>Withdraw</button>}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <WaitlistSection />
          <section aria-labelledby="mb-h" className={`${section} space-y-4`}>
            <h2 id="mb-h" className={h2}>Blocked teams</h2>
            {m.blocks.phase === "ready" && m.blocks.data.length === 0 && <p className="text-zinc-300">You have not blocked anyone.</p>}
            {m.blocks.phase === "ready" && m.blocks.data.length > 0 && (
              <ul className="space-y-2">{m.blocks.data.map((b) => <li key={b.id} className={`${box} flex flex-wrap items-center justify-between gap-3`}><span className="text-zinc-100">{b.label}</span><button type="button" onClick={() => void m.unblock(b.id)} disabled={m.busy !== ""} className={btnSecondary}>Unblock</button></li>)}</ul>
            )}
          </section>
          <SchedulesSection />
        </>
      )}
    </div>
  );
}
