"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/cloud/useSession";
import { explainFailure } from "@/features/shared/failure";
import { gameLabel, ROLE_LABELS } from "@/features/shared/games";
import { SelectInput, TextArea } from "@/features/shared/ui/Fields";
import Modal from "@/features/shared/ui/Modal";
import { EmptyState, FindNext, ErrorState, NotAvailable, SignInPrompt, SkeletonRows, StatusBadge } from "@/features/shared/ui/States";
import { box, btnPrimary, btnSecondary, h1, h2, h3, helper, link, section } from "@/features/shared/ui/styles";
import { BLOCKER_TEXT, REPORT_REASONS, visibilityLabel, type Entry, type OwnPage } from "@/features/profiles/domain";
import { useCardToken, useMyPlayerPage, useMyTeamPages, usePlayerByCard, usePlayerPage, useReportPage, useSlugParam, useTeamPage, useTeamPageEditor } from "@/features/profiles/hooks/useProfiles";
import { PlayerView } from "@/features/profiles/ui/PlayerView";
import { CardLinkBox, PageDetailsEditor } from "@/features/profiles/ui/DetailsEditor";
import { CertificateCard, CertificateList, ResultsSection, TeamsSection, VisibilityPicker, dayText } from "@/features/profiles/ui/ProfileParts";

const GONE = "This address has no shared page. The owner may have made it private, or it never existed.";

function ReportBox({ kind, slug }: { kind: "players" | "teams" | "cards"; slug: string }) {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const r = useReportPage(kind, slug);
  return (
    <section className={section} aria-labelledby="report-h">
      <h2 id="report-h" className={h3}>Something wrong with this page?</h2>
      <p className="mt-2 text-sm text-zinc-300">Tell a moderator. Pages with several reports, or a report that someone under 18 is shown, are hidden while we review them.</p>
      {session ? <button type="button" onClick={() => setOpen(true)} className={`${btnSecondary} mt-3`}>Report this page</button> : <p className="mt-3 text-sm"><Link href="/login/" className={link}>Sign in to report this page</Link></p>}
      <Modal open={open} onClose={() => setOpen(false)} title="Report this page">
        {r.done ? (
          <div role="status" className="space-y-4"><p className="text-zinc-100">Thank you. A moderator will look at it.</p><button type="button" onClick={() => setOpen(false)} className={btnPrimary}>Done</button></div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); void r.submit(); }} className="space-y-4">
            <SelectInput id="pr-reason" label="What is wrong?" value={r.reason} onChange={r.setReason} options={REPORT_REASONS} />
            <TextArea id="pr-note" label="Anything we should know? (optional)" value={r.note} onChange={r.setNote} rows={3} max={200} />
            {r.error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{r.error}</p>}
            <div className="flex flex-wrap gap-3"><button type="submit" disabled={r.busy} className={btnPrimary}>{r.busy ? "Sending" : "Send report"}</button><button type="button" onClick={() => setOpen(false)} className={btnSecondary}>Cancel</button></div>
          </form>
        )}
      </Modal>
    </section>
  );
}

const Loading = ({ label }: { label: string }) => <SkeletonRows n={2} label={label} />;
const linkOnlyNote = <p className="text-sm text-zinc-400">Link only: shared by its owner with people who have this link. It is not listed anywhere.</p>;

/**
 * /players/view/?s=<slug>. With v3.profiles off the API answers 404 and the page shows `fallback` (the earlier resume view), so nothing changes
 * for anyone until the flag is switched on. The route is always noindex (players/layout.tsx). Only Public profiles open here; Link only ones open
 * through their card link (/p/).
 */
export function PlayerProfileScreen({ fallback }: { fallback: React.ReactNode }) {
  const slug = useSlugParam();
  const res = usePlayerPage(slug);
  if (slug === null || res.phase === "loading") return <div className="mx-auto max-w-3xl">{res.phase === "loading" && res.showSkeleton ? <Loading label="Loading the profile" /> : <p className="sr-only">Loading the profile</p>}</div>;
  if (res.phase === "unavailable" || (res.phase === "ready" && !res.data)) return <>{fallback}</>;
  if (res.phase === "error") return <div className="mx-auto max-w-3xl"><ErrorState message={explainFailure(res.failure)} onRetry={res.reload} /></div>;
  if (res.phase !== "ready" || !res.data) return null;
  const p = res.data;
  return <PlayerView p={p} footer={p.slug ? <ReportBox kind="players" slug={p.slug} /> : null} />;
}

const CARD_GONE = "This player card does not open a page any more. The player may have made their profile private or reset the QR on their card, or the page is under review.";

/**
 * /p/?k=<token>: the page a player card's QR opens. Always noindex and no-referrer (p/layout.tsx); the token leaves the address bar at once.
 * Every refusal (bad, reset, private, hidden, removed) looks the same: the API gives one 404 for all of them, and so does this screen.
 */
export function CardProfileScreen() {
  const token = useCardToken();
  const res = usePlayerByCard(token);
  const gone = <div className="mx-auto max-w-3xl"><EmptyState asPage title="This player page is not available" body={CARD_GONE} action={<FindNext />} /></div>;
  if (token === null || (token !== "" && res.phase === "loading")) return <div className="mx-auto max-w-3xl">{res.phase === "loading" && res.showSkeleton ? <Loading label="Loading the player page" /> : <p className="sr-only">Loading the player page</p>}</div>;
  if (token === "" || res.phase === "unavailable" || (res.phase === "ready" && !res.data)) return gone;
  if (res.phase === "error") return <div className="mx-auto max-w-3xl"><ErrorState message={explainFailure(res.failure)} onRetry={res.reload} /></div>;
  if (res.phase !== "ready" || !res.data) return null;
  return <PlayerView p={res.data} kicker="Player card" footer={<ReportBox kind="cards" slug={token} />} />;
}

/** /teams/view/?s=<slug>: a team page its owner shared (Link only or Public). Always noindex (teams/layout.tsx). */
export function TeamProfileScreen() {
  const slug = useSlugParam();
  const res = useTeamPage(slug);
  if (slug === null || res.phase === "loading") return <div className="mx-auto max-w-3xl">{res.phase === "loading" && res.showSkeleton ? <Loading label="Loading the team page" /> : <p className="sr-only">Loading the team page</p>}</div>;
  if (res.phase === "error") return <div className="mx-auto max-w-3xl"><ErrorState message={explainFailure(res.failure)} onRetry={res.reload} /></div>;
  if (res.phase === "unavailable" || (res.phase === "ready" && !res.data)) return <div className="mx-auto max-w-3xl"><EmptyState asPage title="No shared team page here" body={GONE} action={<FindNext />} /></div>;
  if (res.phase !== "ready" || !res.data) return null;
  const t = res.data;
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-zinc-400">Team page</p>
        <h1 className={h1}>{t.name}</h1>
        {t.blurb && <p className="max-w-3xl text-zinc-100">{t.blurb}</p>}
        {t.links.length > 0 && <ul className="flex flex-wrap gap-3 text-sm">{t.links.map((l) => <li key={l}><a href={l} rel="nofollow noopener noreferrer ugc" target="_blank" className={link}>{new URL(l).hostname.replace(/^www\./, "")}</a></li>)}</ul>}
        {t.visibility === "unlisted" && linkOnlyNote}
      </header>
      <section className={section} aria-labelledby="tt-h">
        <h2 id="tt-h" className={h2}>Tournaments</h2>
        {t.tournaments.length === 0 ? <p className="mt-3 text-zinc-300">No tournaments on this page yet.</p> : (
          <ul className="mt-4 space-y-2">{t.tournaments.map((x) => <li key={`${x.tournament.slug}-${x.team}`} className={box}><Link href={`/tournaments/${encodeURIComponent(x.tournament.slug)}/`} className={link}>{x.tournament.title}</Link><span className="block text-sm text-zinc-300">{gameLabel(x.tournament.game)} · as {x.team}{x.tournament.startsAt && ` · ${dayText(x.tournament.startsAt)}`}</span></li>)}</ul>
        )}
      </section>
      <CertificateList items={t.certificates} empty="No certificates yet. A certificate appears when a tournament on this page is completed with verified results." />
      <ResultsSection matches={t.matches} battleRoyale={t.battleRoyale} />
      <ReportBox kind="teams" slug={t.slug} />
    </article>
  );
}

function Blockers({ page }: { page: Pick<OwnPage, "indexable" | "indexBlockers"> }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-zinc-100">Search engines: {page.indexable ? <StatusBadge label="May index it" tone="success" /> : <StatusBadge label="Asked not to index it" />}</p>
      {!page.indexable && page.indexBlockers.length > 0 && <ul className="list-disc pl-5 text-sm text-zinc-300">{page.indexBlockers.map((b) => <li key={b}>{BLOCKER_TEXT[b] ?? b}</li>)}</ul>}
      <p className={helper}>Even when search engines may index it, the shared page itself is fetched fresh, so making it private takes effect at once.</p>
    </div>
  );
}

function EntryList({ entries, busy, onToggle }: { entries: Entry[]; busy: string; onToggle: (e: Entry) => void }) {
  if (entries.length === 0) return <p className="text-sm text-zinc-300">No tournaments yet. They appear here once you captain an approved team in a public tournament (claim it with the captain link).</p>;
  return (
    <ul className="space-y-2">
      {entries.map((e) => (
        <li key={e.itemKey} className={`${box} flex flex-wrap items-center justify-between gap-3`}>
          <span><span className="text-zinc-100">{e.tournament.title}</span><span className="block text-sm text-zinc-300">{gameLabel(e.tournament.game)} · {e.team}{e.hidden && " · hidden"}</span></span>
          <button type="button" onClick={() => onToggle(e)} disabled={busy !== ""} className={btnSecondary}>{busy === `hide-${e.itemKey}` ? "Saving" : e.hidden ? "Show on page" : "Hide from page"}</button>
        </li>
      ))}
    </ul>
  );
}

/**
 * The "Profile page" panel inside the resume editor. Renders NOTHING while v3.profiles is off (the API answers 404), so the editor looks exactly as before.
 * `consentGiven` and `adult` come from the resume editor (they decide whether Link only and Public can be chosen).
 */
export function PlayerPagePanel({ adult, consentGiven, onChanged, onAvailable }: { adult: boolean; consentGiven: boolean; onChanged?: () => void; onAvailable?: (on: boolean) => void }) {
  const m = useMyPlayerPage();
  const on = m.res.phase === "ready" && m.page !== null;
  useEffect(() => { onAvailable?.(on); }, [on, onAvailable]);
  if (m.res.phase === "unavailable" || m.res.phase === "signin") return null;
  if (m.res.phase === "loading") return null;
  if (m.res.phase === "error") return <ErrorState message={explainFailure(m.res.failure)} onRetry={m.res.reload} />;
  const page = m.page;
  if (!page) return null;
  const reason = !adult ? "Confirm you are 18 or older to share your profile." : !consentGiven ? "Give your consent above to share your profile by link or publicly." : undefined;
  return (
    <section aria-labelledby="pp-h" className={`${section} space-y-4`}>
      <h2 id="pp-h" className={h2}>Profile page</h2>
      <p className="max-w-3xl text-zinc-300">Your profile page shows your teams, verified matches and certificates. Only results organisers recorded on Esports Hub appear, never numbers you type.</p>
      <div aria-live="polite">
        {m.notice && <p role="status" className="text-success"><span aria-hidden="true">+ </span>{m.notice}</p>}
        {m.error && <p role="alert" className="text-danger"><span aria-hidden="true">! </span>{m.error}</p>}
      </div>
      {page.hiddenByModeration && <p role="status" className="text-warning"><span aria-hidden="true">! </span>A moderator is reviewing reports about your page, so it is hidden for now.</p>}
      <div className={`${box} space-y-4`}>
        <VisibilityPicker name="pp-vis" value={page.visibility} busy={m.busy} onPick={(v) => { void m.setVisibility(v).then((ok) => ok && onChanged?.()); }} disabledReason={reason} />
        <p className="text-sm text-zinc-300">Now: <span className="text-zinc-100">{visibilityLabel(page.visibility)}</span>{page.path && <> · <Link href={page.path} className={link}>Open your page</Link></>}</p>
        <Blockers page={page} />
      </div>
      <PageDetailsEditor details={page.details} busy={m.busy} onSave={m.setDetails} />
      <CardLinkBox page={page} busy={m.busy} onEnsure={m.ensureCard} onReset={m.resetCard} />
      <h3 className={h3}>Tournaments on your page</h3>
      <EntryList entries={page.entries} busy={m.busy} onToggle={(e) => void m.setHidden(e.itemKey, !e.hidden)} />
      {page.certificates.filter((c) => !c.hidden).length > 0 && <><h3 className={h3}>Your certificates</h3><ul className="grid gap-4 sm:grid-cols-2">{page.certificates.filter((c) => !c.hidden).map((c) => <CertificateCard key={c.id} c={c} />)}</ul></>}
    </section>
  );
}

function TeamPageEditor({ id, onChanged }: { id: string; onChanged: () => void }) {
  const t = useTeamPageEditor(id, onChanged);
  const [pick, setPick] = useState("");
  if (t.res.phase === "loading") return <SkeletonRows n={1} label="Loading the team page" />;
  if (t.res.phase === "error") return <ErrorState message={explainFailure(t.res.failure)} onRetry={t.res.reload} />;
  const page = t.page;
  if (!page) return null;
  const needsTick = !t.consent ? "Tick the captain's permission below before you share this page." : undefined;
  return (
    <div className="space-y-4">
      <div aria-live="polite">
        {t.notice && <p role="status" className="text-success"><span aria-hidden="true">+ </span>{t.notice}</p>}
        {t.error && <p role="alert" className="text-danger"><span aria-hidden="true">! </span>{t.error}</p>}
      </div>
      {page.hiddenByModeration && <p role="status" className="text-warning"><span aria-hidden="true">! </span>A moderator is reviewing reports about this page, so it is hidden for now.</p>}
      <label className="flex min-h-11 items-start gap-3 text-zinc-100"><input type="checkbox" checked={t.consent} onChange={(e) => t.setConsent(e.target.checked)} className="mt-1 h-5 w-5 accent-cyan-400" /><span>I have the team captain&apos;s permission to publish this page<span className="block text-sm text-zinc-400">Asked every time the page is shared. Stored with the time; cleared when the page goes private.</span></span></label>
      <VisibilityPicker name={`tv-${page.id}`} value={page.visibility} busy={t.busy} onPick={(v) => void t.setVisibility(v)} disabledReason={needsTick} />
      <p className="text-sm text-zinc-300">Now: <span className="text-zinc-100">{visibilityLabel(page.visibility)}</span>{page.visibility !== "private" && <> · <Link href={page.path} className={link}>Open the team page</Link></>}</p>
      <Blockers page={page} />
      <h4 className="font-medium text-zinc-100">Tournaments on this page</h4>
      <EntryList entries={page.entries} busy={t.busy} onToggle={(e) => void t.setHidden(e.itemKey, !e.hidden)} />
      {page.claimable.length > 0 && (
        <form onSubmit={(e) => { e.preventDefault(); const c = page.claimable[Number(pick)]; if (c) void t.addClaim(c.tournament.slug, c.team); }} className="space-y-3">
          <SelectInput id={`claim-${page.id}`} label="Add a tournament you captained" value={pick} onChange={setPick} blank="Choose a tournament" options={page.claimable.map((c, i) => ({ value: String(i), label: `${c.tournament.title} (as ${c.team})` }))} />
          <button type="submit" disabled={pick === "" || t.busy !== ""} className={btnSecondary}>Add to the team page</button>
        </form>
      )}
    </div>
  );
}

/** /app/teams/: the caller's team pages with privacy controls. "Not available yet" while v3.profiles is off. */
export function MyTeamPagesScreen() {
  const session = useSession();
  const list = useMyTeamPages();
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className={h1}>My team pages</h1>
      <p className="max-w-3xl text-zinc-300">Each team page is private until you share it. Link only lets anyone with the link open it; Public also lets search engines index it once it shows verified results.</p>
      {list.phase === "unavailable" && <NotAvailable what="Team pages" />}
      {list.phase === "signin" && !session && <SignInPrompt what="Sign in to manage your team pages." next="/app/teams/" />}
      {list.phase === "loading" && (list.showSkeleton ? <SkeletonRows label="Loading your team pages" /> : <p className="sr-only">Loading your team pages</p>)}
      {list.phase === "error" && <ErrorState message={explainFailure(list.failure)} onRetry={list.reload} />}
      {list.phase === "ready" && list.data.items.length === 0 && <EmptyState title="No team pages yet" body="Team pages are created from an event: open the event in My events, then Team pages. Come back here to choose who can see each one." action={<Link href="/app/events/" className={btnSecondary}>My events</Link>} />}
      {list.phase === "ready" && list.data.items.length > 0 && (
        <ul className="space-y-4">
          {list.data.items.map((p) => (
            <li key={p.id} className={`${box} space-y-3`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span><span className="font-display text-lg text-zinc-100">{p.name}</span><span className="block text-sm text-zinc-300">{visibilityLabel(p.visibility)} · {p.tournaments} {p.tournaments === 1 ? "tournament" : "tournaments"} · {p.certificates} {p.certificates === 1 ? "certificate" : "certificates"}</span></span>
                <button type="button" aria-expanded={openId === p.id} onClick={() => setOpenId(openId === p.id ? null : p.id)} className={btnSecondary}>{openId === p.id ? "Close" : "Manage"}</button>
              </div>
              {openId === p.id && <TeamPageEditor id={p.id} onChanged={list.reload} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The report box for a Public player page (used by the pre-rendered /players/<slug>/ page). */
export function PlayerReportBox({ slug }: { slug: string }) { return <ReportBox kind="players" slug={slug} />; }
