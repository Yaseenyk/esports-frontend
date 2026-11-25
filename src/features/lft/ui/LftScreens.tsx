"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/cloud/useSession";
import { useLftBoard } from "@/features/lft/hooks/useLftBoard";
import { useApply, useCreateListing, useIsOwnListing, useListing, useReport } from "@/features/lft/hooks/useLftForms";
import { useAdult } from "@/features/shared/hooks/useAdult";
import { KINDS, GAMES, LANGUAGES, PLAY_HOURS, REPORT_REASONS, ROLES, ROLE_LABELS, type Listing, type MatchWants } from "@/features/lft/domain";
import { v3Enabled } from "@/features/shared/flags";
import { MESSAGE_HELP } from "@/features/lft/validators";
import { LftCard, LftFilters, ListingDetail } from "@/features/lft/ui/LftParts";
import { Field, SelectInput, TextArea, TextInput } from "@/features/shared/ui/Fields";
import Modal from "@/features/shared/ui/Modal";
import { AdultGate, EmptyState, ErrorState, NotAvailable, SignInPrompt, SkeletonRows } from "@/features/shared/ui/States";
import { box, btnPrimary, btnSecondary, h1, link } from "@/features/shared/ui/styles";
import { explainFailure } from "@/features/shared/failure";

/** "What I look for": three groups of chips, kept in this browser only, used to rank the board. */
function WantsPanel({ value, onChange }: { value: MatchWants; onChange: (w: MatchWants) => void }) {
  const toggle = (k: keyof MatchWants, v: string, max: number) => onChange({ ...value, [k]: value[k].includes(v) ? value[k].filter((x) => x !== v) : value[k].length < max ? [...value[k], v] : value[k] });
  const group = (k: keyof MatchWants, legend: string, items: { value: string; label: string }[], max: number) => (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-zinc-100">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => <label key={i.value} className="flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-zinc-100"><input type="checkbox" checked={value[k].includes(i.value)} onChange={() => toggle(k, i.value, max)} className="h-4 w-4 accent-cyan-400" />{i.label}</label>)}
      </div>
    </fieldset>
  );
  return (
    <section className={`${box} space-y-4`} aria-labelledby="wants-h">
      <h2 id="wants-h" className="font-display text-lg font-semibold text-zinc-100">What you look for</h2>
      <p className="text-sm text-zinc-400">Used only to sort the board for you. Saved in this browser, never on your account.</p>
      {group("roles", "Roles (up to 4)", ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] ?? r })), 4)}
      {group("languages", "Languages (up to 5)", LANGUAGES, 5)}
      {group("hours", "When you play (India time)", PLAY_HOURS, 5)}
    </section>
  );
}

export function BoardScreen() {
  const b = useLftBoard();
  const match = v3Enabled("lftmatch");
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className={h1}>Looking for team or player</h1>
        <p className="max-w-3xl text-zinc-300">Short posts from players and teams who want to play together. You must be 18 or older to post or apply. Contact details stay hidden until the poster accepts you.</p>
        <p><Link href="/lft/new/" className={btnPrimary}>Post a listing</Link></p>
      </header>
      {b.phase === "unavailable" ? <NotAvailable what="The board" /> : (
        <>
          <LftFilters value={b.filters} onChange={b.setFilters} onClear={b.clear} match={match} />
          {match && (
            <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Sort the board">
              <button type="button" aria-pressed={b.filters.sort !== "match"} onClick={() => b.setFilters({ ...b.filters, sort: "" })} className={b.filters.sort !== "match" ? btnPrimary : btnSecondary}>Newest first</button>
              <button type="button" aria-pressed={b.filters.sort === "match"} onClick={() => b.setFilters({ ...b.filters, sort: "match" })} className={b.filters.sort === "match" ? btnPrimary : btnSecondary}>Best match for me</button>
            </div>
          )}
          {match && b.filters.sort === "match" && <WantsPanel value={b.wants} onChange={b.setWants} />}
          <div aria-live="polite">
            {b.phase === "loading" && (b.skeleton ? <SkeletonRows label="Loading listings" /> : <p className="sr-only">Loading listings</p>)}
            {b.phase === "error" && <ErrorState message={b.failure ? explainFailure(b.failure) : "The board did not load."} onRetry={b.retry} />}
            {b.phase === "ready" && b.items.length === 0 && (
              <EmptyState title={b.filtered ? "Nothing matches these filters" : "No listings yet"} body={b.filtered ? "Try fewer filters, or clear them to see everything." : "Be the first: post what you are looking for."}
                action={b.filtered ? <button type="button" onClick={b.clear} className={btnSecondary}>Clear all filters</button> : <Link href="/lft/new/" className={btnPrimary}>Post a listing</Link>} />
            )}
            {b.phase === "ready" && b.items.length > 0 && (
              <>
                <ul className="grid gap-4 sm:grid-cols-2">{b.items.map((l) => <LftCard key={l.id} l={l} />)}</ul>
                {b.hasMore && <p className="mt-6 text-center"><button type="button" onClick={b.loadMore} disabled={b.loadingMore} className={btnSecondary}>{b.loadingMore ? "Loading" : "Show more"}</button></p>}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ApplyDialog({ listing, open, onClose }: { listing: Listing; open: boolean; onClose: () => void }) {
  const a = useApply(listing.id);
  return (
    <Modal open={open} onClose={onClose} title={listing.kind === "looking_for_player" ? "Request to join" : "Apply to this listing"}>
      {a.sent ? (
        <div role="status" className="space-y-4">
          <p className="text-zinc-100">Application sent. The poster will see your message. Your contact is shared only if they accept you.</p>
          <button type="button" onClick={onClose} className={btnPrimary}>Done</button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void a.submit(); }} className="space-y-4" noValidate>
          <TextArea id="ap-msg" label="Message (optional)" value={a.message} onChange={a.setMessage} rows={4} max={400} error={a.hints.message} help="Plain text. No links, phone numbers, @handles or &quot;DM me&quot; lines." />
          <TextInput id="ap-contact" label={v3Enabled("lftmatch") ? "Discord (or your main contact)" : "Your contact"} value={a.contact} onChange={a.setContact} maxLength={40} error={a.hints.contact} help="For example your Discord name. Shown to the poster only after they accept." />
          {v3Enabled("lftmatch") && (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput id="ap-insta" label="Instagram (optional)" value={a.extra.instagram} onChange={(v) => a.setExtra({ ...a.extra, instagram: v })} maxLength={40} />
              <TextInput id="ap-ign" label="In-game name (optional)" value={a.extra.ign} onChange={(v) => a.setExtra({ ...a.extra, ign: v })} maxLength={40} error={a.extraBad} />
              <p className="text-xs text-zinc-400 sm:col-span-2">Only what you fill in is shared, and only if they accept your request.</p>
            </div>
          )}
          {a.error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{a.error}</p>}
          <div className="flex flex-wrap gap-3"><button type="submit" disabled={a.busy} className={btnPrimary}>{a.busy ? "Sending" : "Send application"}</button><button type="button" onClick={onClose} className={btnSecondary}>Cancel</button></div>
        </form>
      )}
    </Modal>
  );
}

function ReportDialog({ listing, open, onClose }: { listing: Listing; open: boolean; onClose: () => void }) {
  const r = useReport(listing.id);
  return (
    <Modal open={open} onClose={onClose} title="Report this listing">
      {r.done ? (
        <div role="status" className="space-y-4"><p className="text-zinc-100">Thank you. A moderator will look at it.</p><button type="button" onClick={onClose} className={btnPrimary}>Done</button></div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void r.submit(); }} className="space-y-4">
          <SelectInput id="rp-reason" label="What is wrong?" value={r.reason} onChange={r.setReason} options={REPORT_REASONS} />
          <TextArea id="rp-note" label="Anything we should know? (optional)" value={r.note} onChange={r.setNote} rows={3} />
          {r.error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{r.error}</p>}
          <div className="flex flex-wrap gap-3"><button type="submit" disabled={r.busy} className={btnPrimary}>{r.busy ? "Sending" : "Send report"}</button><button type="button" onClick={onClose} className={btnSecondary}>Cancel</button></div>
        </form>
      )}
    </Modal>
  );
}

export function ListingScreen() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => { setId(new URLSearchParams(window.location.search).get("id") ?? ""); }, []);
  const session = useSession();
  const res = useListing(id);
  const own = useIsOwnListing(id, !!session);
  const adult = useAdult(!!session); // starts with the listing, not after it
  const [dialog, setDialog] = useState<"" | "apply" | "report">("");
  const l = res.phase === "ready" ? res.data : null;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href="/lft/" className="hover:text-zinc-100">Looking for team or player</Link> / Listing</nav>
      <h1 className={h1}>Listing</h1>
      {id === null || res.phase === "loading" ? (res.phase === "loading" && res.showSkeleton ? <SkeletonRows n={1} label="Loading the listing" /> : <p className="sr-only">Loading the listing</p>) : null}
      {res.phase === "unavailable" && <NotAvailable what="The board" />}
      {res.phase === "error" && <ErrorState message={explainFailure(res.failure)} onRetry={res.reload} />}
      {id !== null && res.phase === "ready" && !l && <EmptyState title="This listing is gone" body="It may have expired, been filled, or been removed." action={<Link href="/lft/" className={btnPrimary}>See the board</Link>} />}
      {l && (
        <>
          <ListingDetail l={l} />
          {own ? <p role="status" className="text-zinc-300">That is your own listing. You can bump, close or read its applications on your <Link href="/app/lft/" className={link}>listings page</Link>.</p> : !session ? <SignInPrompt what="Sign in and confirm you are 18 or older to apply." next="/app/lft/" /> : adult.known && !adult.adult ? <AdultGate busy={adult.busy} error={adult.error} onConfirm={adult.confirm} /> : (
            <div className="flex flex-wrap gap-3"><button type="button" onClick={() => setDialog("apply")} className={btnPrimary}>{l.kind === "looking_for_player" ? "Request to join" : "Apply"}</button><button type="button" onClick={() => setDialog("report")} className={btnSecondary}>Report this listing</button></div>
          )}
          <p className="text-sm text-zinc-400">Found your squad? Find a time everyone can play with the <Link href="/tools/scrim-time-planner/" className={link}>scrim time planner</Link>.</p>
          <ApplyDialog listing={l} open={dialog === "apply"} onClose={() => setDialog("")} />
          <ReportDialog listing={l} open={dialog === "report"} onClose={() => setDialog("")} />
        </>
      )}
    </div>
  );
}

export function NewListingScreen() {
  const session = useSession();
  const f = useCreateListing();
  const adult = useAdult(!!session);
  const { form, set, errors } = f;
  if (f.createdId) {
    return (
      <div className="mx-auto max-w-3xl space-y-4"><h1 className={h1}>Listing posted</h1>
        <p role="status" className="text-zinc-100">Your listing is on the board. You can bump, close or answer applications from your <Link href="/app/lft/" className={link}>listings page</Link>.</p>
        <p><Link href="/lft/" className={btnPrimary}>See the board</Link></p></div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className={h1}>Post a listing</h1>
      {adult.unavailable ? <NotAvailable what="The board" /> : !session ? <SignInPrompt what="Sign in to post. You also need to confirm you are 18 or older." next="/app/lft/" /> : adult.known && !adult.adult ? <AdultGate busy={adult.busy} error={adult.error} onConfirm={adult.confirm} /> : (
        <form onSubmit={(e) => { e.preventDefault(); void f.submit(); }} className={`${box} space-y-5`} noValidate>
          <SelectInput id="n-kind" label="I am posting as" value={form.kind} onChange={(v) => set("kind", v)} options={KINDS} error={errors.kind} />
          <SelectInput id="n-game" label="Game" value={form.game} onChange={(v) => set("game", v)} options={GAMES} blank="Choose a game" error={errors.game} />
          {form.kind === "looking_for_player" && (
            <SelectInput id="n-team" label="Team page" value={form.teamProfileId} onChange={(v) => set("teamProfileId", v)} options={f.teams.map((t) => ({ value: t.id, label: t.name }))} blank="Choose your team page" error={errors.teamProfileId} help="You can only recruit for a team page you own. Create one in the app first." />
          )}
          <fieldset>
            <legend className="mb-1 text-sm font-medium text-zinc-100">Roles (up to 4)</legend>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => <label key={r} className="flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-zinc-100"><input type="checkbox" checked={form.roles.includes(r)} onChange={() => f.toggleRole(r)} className="h-4 w-4 accent-cyan-400" />{ROLE_LABELS[r]}</label>)}
            </div>
            {errors.roles && <p role="alert" className="mt-1 text-sm text-danger"><span aria-hidden="true">! </span>{errors.roles}</p>}
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput id="n-rmin" label="Skill level from (optional)" value={form.rankMin} onChange={(v) => set("rankMin", v.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" error={errors.rankMin} help="0 is the lowest level of the game's ladder, 100 the highest." />
            <TextInput id="n-rmax" label="Skill level up to (optional)" value={form.rankMax} onChange={(v) => set("rankMax", v.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" error={errors.rankMax} />
            <TextInput id="n-state" label="State (optional)" value={form.state} onChange={(v) => set("state", v)} maxLength={60} />
            <TextInput id="n-city" label="City (optional)" value={form.city} onChange={(v) => set("city", v)} maxLength={60} />
          </div>
          <label className="flex min-h-11 items-center gap-2 text-zinc-100"><input type="checkbox" checked={form.onlineOk} onChange={(e) => set("onlineOk", e.target.checked)} className="h-5 w-5 accent-cyan-400" />Online play is fine</label>
          <TextArea id="n-msg" label="Message" value={form.message} onChange={(v) => set("message", v)} max={600} error={errors.message} help={MESSAGE_HELP} />
          {v3Enabled("lftmatch") ? (
            <>
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-zinc-100">Languages you speak in game (optional, up to 5)</legend>
                <div className="flex flex-wrap gap-2">{LANGUAGES.map((x) => <label key={x.value} className="flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-zinc-100"><input type="checkbox" checked={form.languages.includes(x.value)} onChange={() => f.toggleIn("languages", x.value)} className="h-4 w-4 accent-cyan-400" />{x.label}</label>)}</div>
              </fieldset>
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-zinc-100">When you play, India time (optional)</legend>
                <div className="flex flex-wrap gap-2">{PLAY_HOURS.map((x) => <label key={x.value} className="flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-zinc-100"><input type="checkbox" checked={form.playHours.includes(x.value)} onChange={() => f.toggleIn("playHours", x.value)} className="h-4 w-4 accent-cyan-400" />{x.label}</label>)}</div>
              </fieldset>
              <fieldset className="space-y-3" data-clarity-mask="true">
                <legend className="mb-1 text-sm font-medium text-zinc-100">Contacts to share after you accept someone</legend>
                <p className="text-xs text-zinc-400">Never shown on the board. Fill in at least one; only what you fill in is shared, and only with people you accept.</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextInput id="n-c-discord" label="Discord" value={form.contacts.discord} onChange={(v) => f.setContact("discord", v)} maxLength={40} />
                  <TextInput id="n-c-insta" label="Instagram" value={form.contacts.instagram} onChange={(v) => f.setContact("instagram", v)} maxLength={40} />
                  <TextInput id="n-c-ign" label="In-game name" value={form.contacts.ign} onChange={(v) => f.setContact("ign", v)} maxLength={40} />
                </div>
                {(errors.contacts || errors.contact) && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{errors.contacts || "Add at least one contact, for example your Discord name."}</p>}
              </fieldset>
            </>
          ) : (
            <TextInput id="n-contact" label="Your contact" value={form.contact} onChange={(v) => set("contact", v)} maxLength={40} error={errors.contact} help="For example your Discord name. Never shown on the board: only to someone you accept." />
          )}
          <Field id="n-days" label="Keep it open for" error={errors.expiresInDays}>
            <select id="n-days" value={form.expiresInDays} onChange={(e) => set("expiresInDays", e.target.value)} className="min-h-11 w-full rounded-lg border border-white/10 bg-surface px-3 text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
              {["7", "14", "21", "30"].map((d) => <option key={d} value={d}>{d} days</option>)}
            </select>
          </Field>
          {f.serverError && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{f.serverError}</p>}
          <button type="submit" disabled={f.busy} className={btnPrimary}>{f.busy ? "Posting" : "Post listing"}</button>
        </form>
      )}
    </div>
  );
}
