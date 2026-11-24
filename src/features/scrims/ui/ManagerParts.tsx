"use client";

import Link from "next/link";
import { useState } from "react";
import { GAMES, gameLabel } from "@/features/shared/games";
import { explainFailure } from "@/features/shared/failure";
import { Field, SelectInput, TextInput } from "@/features/shared/ui/Fields";
import Modal from "@/features/shared/ui/Modal";
import { ErrorState, SkeletonRows, StatusBadge } from "@/features/shared/ui/States";
import { box, btnDanger, btnPrimary, btnSecondary, h2, h3, helper, input, link, section } from "@/features/shared/ui/styles";
import { REGIONS, regionLabel, type Slot } from "@/features/scrims/domain";
import { useJoinWaitlist, useMyWaitlist, useNotices, useRoster, useSchedules } from "@/features/scrims/hooks/useManager";
import { slotTimeText } from "@/features/scrims/time";

const Status = ({ busy, error, notice }: { busy?: string; error: string; notice: string }) => (
  <div aria-live="polite">
    {notice && !busy && <p role="status" className="text-success"><span aria-hidden="true">+ </span>{notice}</p>}
    {error && <p role="alert" className="text-danger"><span aria-hidden="true">! </span>{error}</p>}
  </div>
);
const clock = (iso: string | null): string => {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? new Date(t).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) + " IST" : "";
};
const dayText = (day: string) => { const t = Date.parse(`${day}T12:00:00+05:30`); return Number.isFinite(t) ? new Date(t).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" }) : day; };

/** Who is in which slot. The poster can remove a confirmed team (its seat goes to the waitlist) and change teams needed or the note. */
export function RosterPanel({ slotId, onChange }: { slotId: string; onChange?: () => void }) {
  const r = useRoster(slotId, onChange);
  const [slots, setSlots] = useState("");
  if (r.res.phase === "loading") return <SkeletonRows n={1} label="Loading the roster" />;
  if (r.res.phase === "error") return <ErrorState message={explainFailure(r.res.failure)} onRetry={r.res.reload} />;
  if (r.res.phase !== "ready") return null;
  const ro = r.res.data;
  return (
    <div className="space-y-3">
      <Status busy={r.busy} error={r.error} notice={r.notice} />
      <h4 className="font-medium text-zinc-100">Slots</h4>
      <ol className="space-y-2">
        {ro.seats.map((s) => (
          <li key={s.slotNo} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 p-3">
            <span className="text-zinc-100"><span className="font-mono tabular-nums">#{s.slotNo}</span> {s.teamName}{s.you && " (you)"}{s.contact && <span className="block text-sm text-zinc-300">Contact: <span className="font-mono">{s.contact}</span></span>}</span>
            {ro.role === "poster" && s.requestId && <button type="button" onClick={() => void r.remove(s.requestId!)} disabled={r.busy !== ""} className={btnDanger}>Remove</button>}
          </li>
        ))}
        {ro.openSeats.map((n) => <li key={`open-${n}`} className="rounded-lg border border-dashed border-white/10 p-3 text-zinc-400"><span className="font-mono tabular-nums">#{n}</span> Open</li>)}
      </ol>
      <h4 className="font-medium text-zinc-100">Waitlist</h4>
      {ro.waitlist.length === 0 ? <p className="text-sm text-zinc-300">Nobody is waiting.</p> : (
        <ol className="space-y-1 text-sm text-zinc-300">{ro.waitlist.map((w) => <li key={w.position}>{w.position}. {w.teamName}{w.you && " (you)"} · {w.status === "offered" ? `offered a place, answer by ${clock(w.offerExpiresAt)}` : "waiting"}</li>)}</ol>
      )}
      {ro.role === "poster" && (
        <form onSubmit={(e) => { e.preventDefault(); const n = Number(slots); if (Number.isInteger(n) && n > 0) void r.edit({ slots: n }); }} className="flex flex-wrap items-end gap-3">
          <div className="w-40"><TextInput id={`ed-${slotId}`} label="Teams needed" value={slots} onChange={(v) => setSlots(v.replace(/\D/g, "").slice(0, 2))} inputMode="numeric" help={`Now ${ro.slotsTotal}.`} /></div>
          <button type="submit" disabled={r.busy !== "" || !slots} className={btnSecondary}>Change</button>
        </form>
      )}
    </div>
  );
}

/** My places on waitlists; an offer must be accepted before its time runs out. */
export function WaitlistSection() {
  const w = useMyWaitlist();
  if (w.res.phase !== "ready" || w.res.data.length === 0) return null;
  return (
    <section aria-labelledby="mw-h" className={`${section} space-y-4`}>
      <h2 id="mw-h" className={h2}>Waitlists</h2>
      <Status busy={w.busy} error={w.error} notice={w.notice} />
      <ul className="space-y-3">
        {w.res.data.map((e) => (
          <li key={e.id} className={box}>
            <p className="text-zinc-100">{e.teamName} · {gameLabel(e.game)} · {slotTimeText(e.startsAt)} {e.status === "offered" ? <StatusBadge label="A place is yours if you accept" tone="success" /> : <StatusBadge label={e.status === "waiting" ? `Number ${e.position} in line` : e.status} />}</p>
            {e.status === "offered" && <p className="mt-1 text-sm text-warning">Accept by {clock(e.offerExpiresAt)} or it passes to the next team.</p>}
            <div className="mt-3 flex flex-wrap gap-3">
              {e.status === "offered" && <button type="button" onClick={() => void w.answer(e.id, "accept")} disabled={w.busy !== ""} className={btnPrimary}>Accept the place</button>}
              {e.status === "offered" && <button type="button" onClick={() => void w.answer(e.id, "decline")} disabled={w.busy !== ""} className={btnSecondary}>Decline</button>}
              {e.status === "waiting" && <button type="button" onClick={() => void w.answer(e.id, "leave")} disabled={w.busy !== ""} className={btnSecondary}>Leave the waitlist</button>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const NOTICE_WORDS: Record<string, string> = { waitlist_offer: "A place opened for you", offer_expired: "Your offer ran out and passed to the next team", removed_from_scrim: "The poster removed your team" };
/** Unread notices from the scrim finder (in the platform only: no email, no push). */
export function NoticesBanner() {
  const n = useNotices();
  if (n.res.phase !== "ready" || n.res.data.unread === 0) return null;
  return (
    <section role="status" aria-labelledby="sn-h" className={`${box} space-y-2`}>
      <h2 id="sn-h" className={h3}>New on your scrims</h2>
      <ul className="space-y-1 text-sm text-zinc-100">{n.res.data.items.filter((x) => !x.read).map((x) => <li key={x.id}>{NOTICE_WORDS[x.kind] ?? x.kind}{x.teamName ? `: ${x.teamName}` : ""}{x.startsAt ? `, ${slotTimeText(x.startsAt)}` : ""}</li>)}</ul>
      <button type="button" onClick={() => void n.markRead()} className={btnSecondary}>Mark as read</button>
    </section>
  );
}

/** Recurring daily scrims: one slot per India day at the same time, a few days ahead. Each day can be skipped (or edited like any scrim). */
export function SchedulesSection() {
  const s = useSchedules();
  const { form, set } = s;
  return (
    <section aria-labelledby="rs-h" className={`${section} space-y-4`}>
      <h2 id="rs-h" className={h2}>Recurring scrims</h2>
      <p className="text-zinc-300">For example every day at 9 pm IST. New days appear on the board up to 7 days ahead; skip any day you cannot host.</p>
      <Status busy={s.busy} error={s.error} notice={s.notice} />
      {s.res.phase === "ready" && s.res.data.map((sc) => (
        <div key={sc.id} className={`${box} space-y-3`}>
          <p className="text-zinc-100">{sc.teamName} · {gameLabel(sc.game)} · every day {sc.timeOfDay} IST · {sc.slots} teams · {regionLabel(sc.region)} <StatusBadge label={sc.active ? "Active" : "Paused"} tone={sc.active ? "success" : "neutral"} /></p>
          <ul className="space-y-2">
            {sc.days.map((d) => (
              <li key={d.day} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 p-2">
                <span className="text-sm text-zinc-100">{dayText(d.day)} · {d.skipped ? "skipped" : d.status === "cancelled" ? "cancelled" : d.slotId ? `${d.confirmed ?? 0} of ${d.slots ?? sc.slots} confirmed` : "not made yet"}</span>
                {!d.skipped && <button type="button" onClick={() => void s.skip(sc.id, d.day)} disabled={s.busy !== ""} className={btnSecondary}>Skip this day</button>}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => void s.toggle(sc.id, !sc.active)} disabled={s.busy !== ""} className={btnSecondary}>{sc.active ? "Pause" : "Resume"}</button>
            <button type="button" onClick={() => void s.stop(sc.id)} disabled={s.busy !== ""} className={btnDanger}>Stop</button>
          </div>
        </div>
      ))}
      <form onSubmit={(e) => { e.preventDefault(); void s.create(); }} className={`${box} space-y-4`} aria-label="New recurring scrim">
        <h3 className={h3}>New recurring scrim</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput id="rs-team" label="Your team" value={form.teamProfileId} onChange={(v) => set("teamProfileId", v)} blank="Choose your team page" options={s.teams.map((t) => ({ value: t.id, label: t.name }))} />
          <SelectInput id="rs-game" label="Game" value={form.game} onChange={(v) => set("game", v)} options={GAMES} blank="Choose a game" />
          <Field id="rs-time" label="Every day at (India time)"><input id="rs-time" type="time" value={form.timeOfDay} onChange={(e) => set("timeOfDay", e.target.value)} className={input} /></Field>
          <SelectInput id="rs-days" label="Days ahead on the board" value={form.daysAhead} onChange={(v) => set("daysAhead", v)} options={["1", "2", "3", "4", "5", "6", "7"].map((d) => ({ value: d, label: `${d} ${d === "1" ? "day" : "days"}` }))} />
          <SelectInput id="rs-region" label="Region" value={form.region} onChange={(v) => set("region", v)} options={REGIONS} />
          <TextInput id="rs-slots" label="Teams needed" value={form.slots} onChange={(v) => set("slots", v.replace(/\D/g, "").slice(0, 2))} inputMode="numeric" />
          <TextInput id="rs-contact" label="Your contact" value={form.contact} onChange={(v) => set("contact", v)} maxLength={40} help="A game or Discord handle, shown only to teams you accept." />
          <TextInput id="rs-note" label="Skill note (optional)" value={form.skillNote} onChange={(v) => set("skillNote", v)} maxLength={200} />
        </div>
        {s.teams.length === 0 && <p className={helper}>You need a team page first. Create one from one of your events (Team pages).</p>}
        <button type="submit" disabled={s.busy !== ""} className={btnPrimary}>Save recurring scrim</button>
      </form>
    </section>
  );
}

/** From the board: join the waitlist of a full scrim. */
export function WaitlistDialog({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  const j = useJoinWaitlist(slot.id);
  return (
    <Modal open onClose={onClose} title={`Join the waitlist of ${slot.teamName}`}>
      {j.sent ? (
        <div role="status" className="space-y-4"><p className="text-zinc-100">You are on the waitlist. If a team drops you get an offer on <Link href="/app/scrims/" className={link}>My scrims</Link> and must accept it in time.</p><button type="button" onClick={onClose} className={btnPrimary}>Done</button></div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void j.submit(); }} className="space-y-4" noValidate>
          <p className="text-sm text-zinc-300">{slotTimeText(slot.startsAt)} · every slot is taken right now.</p>
          <SelectInput id="wl-team" label="Your team" value={j.teamProfileId} onChange={j.setTeam} blank="Choose your team page" options={j.teams.map((t) => ({ value: t.id, label: t.name }))} />
          <TextInput id="wl-contact" label="Your contact" value={j.contact} onChange={j.setContact} maxLength={40} help="A game or Discord handle. Shown to the poster only once you have a place." />
          {j.error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{j.error}</p>}
          <div className="flex flex-wrap gap-3"><button type="submit" disabled={j.busy} className={btnPrimary}>{j.busy ? "Joining" : "Join the waitlist"}</button><button type="button" onClick={onClose} className={btnSecondary}>Cancel</button></div>
        </form>
      )}
    </Modal>
  );
}
