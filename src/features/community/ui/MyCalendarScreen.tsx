"use client";

import Link from "next/link";
import { useState } from "react";
import { dateRange, type OwnEntry } from "@/features/community/domain";
import { EMPTY_FORM, toForm, useMyCalendar, type EntryForm } from "@/features/community/hooks/useMyCalendar";
import { explainFailure } from "@/features/shared/failure";
import { gameLabel, GAMES } from "@/features/shared/games";
import { SelectInput, TextInput } from "@/features/shared/ui/Fields";
import { EmptyState, ErrorState, NotAvailable, SignInPrompt, SkeletonRows, StatusBadge } from "@/features/shared/ui/States";
import { box, btnDanger, btnPrimary, btnSecondary, focus, h1, h2, link } from "@/features/shared/ui/styles";

function EntryFormView({ orgs, initial, editing, busy, onSave, onCancelEdit }: { orgs: { id: string; name: string }[]; initial: EntryForm; editing: boolean; busy: boolean; onSave: (f: EntryForm) => void; onCancelEdit: () => void }) {
  const [f, setF] = useState<EntryForm>({ ...initial, orgId: initial.orgId || orgs[0]?.id || "" });
  const set = <K extends keyof EntryForm>(k: K, v: EntryForm[K]) => setF((x) => ({ ...x, [k]: v }));
  return (
    <form className={`${box} space-y-4`} onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
      <h2 className={h2}>{editing ? "Edit event" : "List an event"}</h2>
      {!editing && orgs.length > 1 && <SelectInput id="cal-org" label="Organisation" value={f.orgId} onChange={(v) => set("orgId", v)} options={orgs.map((o) => ({ value: o.id, label: o.name }))} />}
      <TextInput id="cal-title" label="Event name" value={f.title} onChange={(v) => set("title", v)} maxLength={100} help="For example: Techfest 2026 Valorant Cup." />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput id="cal-game-f" label="Game" value={f.game} onChange={(v) => set("game", v)} options={GAMES} />
        <TextInput id="cal-city-f" label="City" value={f.city} onChange={(v) => set("city", v)} maxLength={60} />
      </div>
      <label className="flex min-h-11 items-center gap-3 text-zinc-100">
        <input type="checkbox" checked={f.online} onChange={(e) => set("online", e.target.checked)} className={`h-5 w-5 ${focus}`} /> Played online
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput id="cal-start" type="date" label="First day" value={f.startsOn} onChange={(v) => set("startsOn", v)} />
        <TextInput id="cal-end" type="date" label="Last day" value={f.endsOn} onChange={(v) => set("endsOn", v)} help="Leave empty for a one-day event." />
      </div>
      <TextInput id="cal-url" type="url" label="Registration link" value={f.registrationUrl} onChange={(v) => set("registrationUrl", v)} help="https only. Anything after a ? is removed, because that part of a link can hold private tokens. Payment pages are not allowed." />
      <TextInput id="cal-tslug" label="Your tournament page address (optional)" value={f.tournamentSlug} onChange={(v) => set("tournamentSlug", v)} help="The part after /tournaments/ of one of your public tournament pages, for example techfest-valorant-cup." />
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className={btnPrimary}>{editing ? "Save changes" : "List the event"}</button>
        {editing && <button type="button" onClick={onCancelEdit} className={btnSecondary}>Stop editing</button>}
      </div>
    </form>
  );
}

function EntryRow({ e, busy, onEdit, onCancel, onDelete }: { e: OwnEntry; busy: boolean; onEdit: () => void; onCancel: () => void; onDelete: () => void }) {
  return (
    <li className="border-t border-white/10 py-4">
      <p className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm tabular-nums text-zinc-300">{dateRange(e.startsOn, e.endsOn)}</span>
        <StatusBadge label={gameLabel(e.game)} tone="accent" />
        {e.status === "cancelled" && <StatusBadge label="Cancelled" tone="danger" />}
        {e.hidden && <StatusBadge label="Hidden by a moderator" tone="danger" />}
      </p>
      <p className="mt-1 text-zinc-100">{e.title} <span className="text-zinc-400">· {e.online ? "Online" : e.city} · {e.organiser.name}</span></p>
      {e.hidden && <p className="mt-1 text-sm text-zinc-300">Reason given: {e.hiddenReason ?? "not stated"}. Write to us from the contact page if you think this is a mistake.</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={onEdit} className={btnSecondary}>Edit</button>
        {e.status === "listed" && <button type="button" disabled={busy} onClick={onCancel} className={btnSecondary}>Mark cancelled</button>}
        <button type="button" disabled={busy} onClick={onDelete} className={btnDanger}>Delete</button>
      </div>
    </li>
  );
}

/** /app/calendar/: verified organisations list their events on the public college esports calendar. */
export default function MyCalendarScreen() {
  const { res, busy, error, notice, save, cancel, remove } = useMyCalendar();
  const [editing, setEditing] = useState<OwnEntry | null>(null);
  const [formKey, setFormKey] = useState(0);
  const header = <header className="space-y-2"><h1 className={h1}>College calendar</h1><p className="max-w-3xl text-zinc-300">List your college or fest esports events on the public <Link href="/calendar/" className={link}>college esports calendar</Link>.</p></header>;
  if (res.phase === "unavailable") return <div className="space-y-6">{header}<NotAvailable what="The college calendar" /></div>;
  if (res.phase === "signin") return <div className="space-y-6">{header}<SignInPrompt what="Sign in to list your organisation's events." next="/app/calendar/" /></div>;
  if (res.phase === "loading") return <div className="space-y-6">{header}{res.showSkeleton && <SkeletonRows n={2} />}</div>;
  if (res.phase === "error") return <div className="space-y-6">{header}<ErrorState message={explainFailure(res.failure)} onRetry={res.reload} /></div>;
  const { orgs, items } = res.data;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {header}
      {orgs.length === 0 ? (
        <EmptyState title="Your organisation is not verified yet" body="Only colleges and fest organising teams that Esports Hub staff have verified can list events. Ask for verification from the contact page; it is free." action={<Link href="/contact/" className={btnSecondary}>Contact us</Link>} />
      ) : (
        <>
          {error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{error}</p>}
          {notice && <p role="status" className="text-sm text-success">{notice}</p>}
          <EntryFormView key={formKey} orgs={orgs} initial={editing ? toForm(editing) : EMPTY_FORM} editing={editing !== null} busy={busy}
            onSave={async (f) => { if (await save(f, editing?.id ?? null)) { setEditing(null); setFormKey((k) => k + 1); } }}
            onCancelEdit={() => { setEditing(null); setFormKey((k) => k + 1); }} />
          <section aria-labelledby="mine-h">
            <h2 id="mine-h" className={h2}>Your events</h2>
            {items.length === 0 ? <p className="mt-2 text-zinc-300">Nothing listed yet. Use the form above to add your first event.</p> : (
              <ul className="mt-2">{items.map((e) => <EntryRow key={e.id} e={e} busy={busy} onEdit={() => { setEditing(e); setFormKey((k) => k + 1); }} onCancel={() => void cancel(e)} onDelete={() => void remove(e)} />)}</ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
