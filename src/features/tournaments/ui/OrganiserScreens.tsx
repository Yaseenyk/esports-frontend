"use client";

import Link from "next/link";
import { useMyTournaments, publicUrl, useTournamentEditor, type SlugHint } from "@/features/tournaments/hooks/useOrganiser";
import { explainFailure } from "@/features/shared/failure";
import { SelectInput, TextArea, TextInput } from "@/features/shared/ui/Fields";
import { EmptyState, ErrorState, NotAvailable, SkeletonRows } from "@/features/shared/ui/States";
import { box, btnPrimary, btnSecondary, h1, h2, link, section } from "@/features/shared/ui/styles";
import { FORMAT_OPTIONS, GAME_OPTIONS, VENUE_OPTIONS } from "@/features/tournaments/organiser/form";
import { DescriptionPreview, OwnedEventCard, PageChecklist, ShareBlock, TournamentStatusBadge, TransitionPanel } from "@/features/tournaments/ui/OrganiserParts";

const Loading = ({ show, label }: { show: boolean; label: string }) => (show ? <SkeletonRows n={2} label={label} /> : <p className="sr-only">{label}</p>);
const WHAT = "The tournament page tool";

export function MyTournamentsScreen() {
  const res = useMyTournaments();
  const rows = res.phase === "ready" ? res.data : [];
  const wrapped = rows.filter((r) => r.tournament), open = rows.filter((r) => !r.tournament);
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-2">
        <h1 className={h1}>My tournaments</h1>
        <p className="max-w-3xl text-zinc-300">A tournament page puts one of your saved events on a public link you can share. Teams, registrations and results stay in the event you already run.</p>
      </header>
      {res.phase === "unavailable" && <NotAvailable what={WHAT} />}
      {res.phase === "loading" && <Loading show={res.showSkeleton} label="Loading your events" />}
      {res.phase === "error" && <ErrorState message={explainFailure(res.failure)} onRetry={res.reload} />}
      {res.phase === "ready" && rows.length === 0 && <EmptyState title="No events yet" body="A tournament page is built on an event saved online. Make your cards in the ID card maker and save the event online first." action={<Link href="/app/id-cards/" className={btnSecondary}>Open the ID card maker</Link>} />}
      {res.phase === "ready" && wrapped.length > 0 && (
        <section aria-labelledby="mine-h" className="space-y-4"><h2 id="mine-h" className={h2}>Your tournament pages</h2><ul className="grid gap-4 sm:grid-cols-2">{wrapped.map((r) => <OwnedEventCard key={r.id} row={r} />)}</ul></section>
      )}
      {res.phase === "ready" && open.length > 0 && (
        <section aria-labelledby="open-h" className={`${wrapped.length ? section : ""} space-y-4`}><h2 id="open-h" className={h2}>Events without a tournament page</h2><ul className="grid gap-4 sm:grid-cols-2">{open.map((r) => <OwnedEventCard key={r.id} row={r} />)}</ul></section>
      )}
      <p className="text-sm text-zinc-400"><Link href="/app/events/" className={link}>All my events</Link> · <Link href="/app/disputes/" className={link}>Disputes I am part of</Link></p>
    </div>
  );
}

const HINTS: Record<SlugHint, string> = {
  idle: "", checking: "Checking the address.", invalid: "", taken: "Not available: a published tournament already uses this address. Try another.",
  maybe_free: "No published tournament uses this address. The final check happens when you save.", current: "This is the current address.",
};

export function TournamentEditorScreen() {
  const v = useTournamentEditor();
  const { saved, form, errors, event } = v;
  const eventId = v.eventId ?? "";
  const ev = encodeURIComponent(eventId);
  const title = v.creating ? "Create tournament" : saved ? saved.title : "Tournament";
  const slugText = v.slugHint === "invalid" ? v.slugNote : HINTS[v.slugHint];
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href="/app/tournaments/" className="hover:text-zinc-100">My tournaments</Link> / {saved ? "Manage" : "Create"}</nav>
      <h1 className={h1}>{title}</h1>
      {v.res.phase === "unavailable" && <NotAvailable what={WHAT} />}
      {(v.eventId === null || v.res.phase === "loading") && <Loading show={v.res.phase === "loading" && v.res.showSkeleton} label="Loading the tournament" />}
      {v.res.phase === "error" && <ErrorState message={explainFailure(v.res.failure)} onRetry={v.res.reload} />}
      {v.res.phase === "ready" && !event && <EmptyState title="Event not found" body={v.eventId ? "It does not exist, or it belongs to another account. Open this page from your tournaments list." : "Open this page from your tournaments list: it needs the event in the link."} action={<Link href="/app/tournaments/" className={btnSecondary}>My tournaments</Link>} />}
      {v.res.phase === "ready" && event && event.role === "viewer" && !saved && <EmptyState title="View only" body="You can see this event but not change it, so you cannot create its tournament page. Ask the owner." action={<Link href="/app/tournaments/" className={btnSecondary}>My tournaments</Link>} />}
      {v.ready && event && !(event.role === "viewer" && !saved) && (
        <>
          <p className="text-zinc-300">{v.creating ? "A tournament page for the event " : "Event: "}<span className="text-zinc-100">{event.name}</span>.{v.creating ? " It starts as a draft: only you can see it until you publish." : ""}</p>
          {saved && <p className="flex flex-wrap items-center gap-2 text-sm text-zinc-300"><TournamentStatusBadge status={saved.status} /> <span>/tournaments/{saved.slug}/</span></p>}
          <div aria-live="polite">
            {v.notice && <p role="status" className="text-success"><span aria-hidden="true">+ </span>{v.notice}</p>}
            {v.error && <p role="alert" className="text-danger"><span aria-hidden="true">! </span>{v.error}</p>}
          </div>

          {saved && <TransitionPanel saved={saved} options={v.options} busy={v.busy} onMove={v.move} />}

          <form onSubmit={(e) => { e.preventDefault(); void v.save(); }} noValidate className={`${box} space-y-5`} aria-label={v.creating ? "New tournament" : "Tournament details"}>
            <TextInput id="t-title" label="Title" value={form.title} onChange={(x) => v.set("title", x)} error={errors.title} help="At least 8 characters, and different from other tournaments, if you want the page indexed." />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput id="t-game" label="Game" value={form.game} onChange={(x) => v.set("game", x)} options={GAME_OPTIONS} blank="Choose a game" error={errors.game} />
              <SelectInput id="t-format" label="Format" value={form.format} onChange={(x) => v.set("format", x)} options={FORMAT_OPTIONS} blank="Choose a format" error={errors.format} />
              <SelectInput id="t-venue" label="Venue" value={form.venue} onChange={(x) => v.set("venue", x)} options={VENUE_OPTIONS} error={errors.venue} />
              <TextInput id="t-teams" label="Maximum teams (optional)" value={form.maxTeams} onChange={(x) => v.set("maxTeams", x.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" error={errors.maxTeams} help="2 to 1024." />
              <TextInput id="t-city" label="City" value={form.city} onChange={(x) => v.set("city", x)} error={errors.city} help="Needed for an in-person or hybrid event." />
              <TextInput id="t-state" label="State" value={form.state} onChange={(x) => v.set("state", x)} error={errors.state} />
              <TextInput id="t-starts" label="Starts (your local time)" type="datetime-local" value={form.startsAt} onChange={(x) => v.set("startsAt", x)} error={errors.startsAt} />
              <TextInput id="t-ends" label="Ends (your local time, optional)" type="datetime-local" value={form.endsAt} onChange={(x) => v.set("endsAt", x)} error={errors.endsAt} />
            </div>
            <TextArea id="t-summary" label="Summary" value={form.summary} onChange={(x) => v.set("summary", x)} rows={3} max={300} error={errors.summary} help="One or two sentences for the link preview. 80 or more characters if you want the page indexed." />
            <TextArea id="t-desc" label="Description (simple Markdown)" value={form.description} onChange={(x) => v.set("description", x)} rows={8} max={8000} error={errors.description} help="Write it yourself: format, schedule, who can join. 200 or more characters if you want the page indexed. Registration cannot open without one." />
            <DescriptionPreview markdown={form.description} />
            <TextArea id="t-rules" label="Rules (optional)" value={form.rules} onChange={(x) => v.set("rules", x)} rows={6} max={8000} error={errors.rules} />
            <div>
              <TextInput id="t-slug" label="Page address" value={form.slug} onChange={(x) => v.set("slug", x.toLowerCase().replace(/\s+/g, "-").slice(0, 60))} maxLength={60} disabled={v.slugLocked} error={errors.slug}
                help={v.slugLocked ? "Locked: this page has been published, so its address cannot change and your shared links keep working." : "The public link is /tournaments/<address>/. Leave it empty to derive one from the title. It locks for good once you publish."} />
              {!v.slugLocked && slugText && <p role="status" className={`mt-1 text-xs ${v.slugHint === "taken" ? "text-danger" : "text-zinc-400"}`}>{v.slugHint === "taken" && <span aria-hidden="true">! </span>}{slugText}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={v.busy === "save"} className={btnPrimary}>{v.busy === "save" ? "Saving" : v.creating ? "Create tournament" : "Save changes"}</button>
              {v.dirty && <span className="text-sm text-warning"><span aria-hidden="true">! </span>You have unsaved changes.</span>}
            </div>
          </form>

          <PageChecklist items={v.checklist} />
          {saved && <ShareBlock url={publicUrl(saved.slug)} isPublic={!["draft", "cancelled"].includes(saved.status)} copied={v.copied} onCopy={v.copy} />}

          <section aria-labelledby="more-h" className={`${section} space-y-3`}>
            <h2 id="more-h" className={h2}>Registrations and disputes</h2>
            <p className="max-w-3xl text-zinc-300">Team size, the registration form, its closing date and the approvals queue live in the event&apos;s registration panel. Open it to set them and to approve teams.</p>
            <p className="flex flex-wrap gap-3">
              <Link href={`/app/events/?id=${ev}`} className={btnSecondary}>Registrations queue</Link>
              {saved && <Link href={`/app/tournaments/disputes/?id=${ev}`} className={btnSecondary}>Disputes queue{v.openDisputes ? ` (${v.openDisputes} undecided)` : ""}</Link>}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
