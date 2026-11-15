"use client";

import Link from "next/link";
import { useState } from "react";
import { useResumeEditor, usePublicResume } from "@/features/resume/hooks/useResume";
import { COPY, COPY_IS_DRAFT } from "@/features/resume/copy";
import { canChoose } from "@/features/resume/validators";
import { GAMES, ROLES, ROLE_LABELS, gameLabel } from "@/features/shared/games";
import type { GameRow, PublicProfile } from "@/features/resume/domain";
import { explainFailure } from "@/features/shared/failure";
import { SelectInput, TextArea, TextInput } from "@/features/shared/ui/Fields";
import { EmptyState, ErrorState, NotAvailable, SkeletonRows, StatusBadge } from "@/features/shared/ui/States";
import { box, btnDanger, btnPrimary, btnSecondary, h1, h2, h3, section } from "@/features/shared/ui/styles";

const when = (iso: string | null) => { const t = iso ? Date.parse(iso) : NaN; return Number.isFinite(t) ? new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""; };

function GameRowView({ g }: { g: GameRow }) {
  return <span className="block text-zinc-100"><span className="font-medium">{gameLabel(g.game)}</span> · {g.inGameName} · {g.rankCode.replace(/_/g, " ") || "unranked"} (rank step <span className="font-mono tabular-nums">{g.rankOrdinal}</span>){g.roles.length > 0 && <span className="text-zinc-300"> · {g.roles.map((r) => ROLE_LABELS[r] ?? r).join(", ")}</span>}</span>;
}

export function ResumeEditorScreen() {
  const e = useResumeEditor();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [agree, setAgree] = useState(false);
  const header = <h1 className={h1}>My esports resume</h1>;
  if (e.res.phase === "unavailable") return <div className="mx-auto max-w-3xl space-y-6">{header}<NotAvailable what="The esports resume" /></div>;
  if (e.res.phase === "loading") return <div className="mx-auto max-w-3xl space-y-6">{header}{e.res.showSkeleton ? <SkeletonRows label="Loading your resume" /> : <p className="sr-only">Loading your resume</p>}</div>;
  if (e.res.phase === "error") return <div className="mx-auto max-w-3xl space-y-6">{header}<ErrorState message={explainFailure(e.res.failure)} onRetry={e.res.reload} /></div>;
  if (e.res.phase !== "ready") return null;
  const vis = e.profile?.visibility ?? "private";
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {header}
      <div aria-live="polite">
        {e.notice && <p role="status" className="text-success"><span aria-hidden="true">+ </span>{e.notice}</p>}
        {e.error && <p role="alert" className="text-danger"><span aria-hidden="true">! </span>{e.error}</p>}
      </div>

      {!e.adult && (
        <section className={box} aria-labelledby="adult-h">
          <h2 id="adult-h" className={h3}>{COPY.adultTitle}</h2>
          <p className="mt-2 text-zinc-300">{COPY.adultBody}</p>
          <button type="button" onClick={e.confirmAdult} disabled={e.busy === "adult"} className={`${btnPrimary} mt-4`}>{COPY.adultButton}</button>
        </section>
      )}

      <section aria-labelledby="profile-h" className="space-y-4">
        <h2 id="profile-h" className={h2}>Profile</h2>
        <form onSubmit={(ev) => { ev.preventDefault(); void e.saveProfile(); }} noValidate className={`${box} space-y-4`}>
          <TextInput id="p-slug" label="Profile address" value={e.form.slug} onChange={(v) => e.setForm("slug", v)} error={e.profileErrors.slug} maxLength={60} help="Your resume lives at /players/view/?s=this-address. 3 to 60 letters, digits and hyphens. Cannot be changed to one that is taken." />
          <TextInput id="p-handle" label="Handle" value={e.form.handle} onChange={(v) => e.setForm("handle", v)} error={e.profileErrors.handle} maxLength={40} help="The name shown at the top. 2 to 40 characters." />
          <TextArea id="p-bio" label="Bio (optional)" value={e.form.bio} onChange={(v) => e.setForm("bio", v)} rows={4} max={400} error={e.profileErrors.bio} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput id="p-city" label="City (optional)" value={e.form.city} onChange={(v) => e.setForm("city", v)} error={e.profileErrors.city} maxLength={60} />
            <TextInput id="p-state" label="State (optional)" value={e.form.state} onChange={(v) => e.setForm("state", v)} error={e.profileErrors.state} maxLength={60} />
          </div>
          <TextInput id="p-lang" label="Languages (optional)" value={e.form.languages} onChange={(v) => e.setForm("languages", v)} error={e.profileErrors.languages} help="Separate with commas, up to 6. For example: Hindi, English" />
          <button type="submit" disabled={e.busy === "profile"} className={btnPrimary}>{e.profile ? "Save profile" : "Create profile"}</button>
        </form>
      </section>

      {e.profile && (
        <section aria-labelledby="games-h" className={`${section} space-y-4`}>
          <h2 id="games-h" className={h2}>Games</h2>
          {e.profile.games.length === 0 ? <p className="text-zinc-300">No games yet. Add the games you play and your rank.</p> : (
            <ul className="space-y-2">{e.profile.games.map((g) => (
              <li key={g.game} className={`${box} flex flex-wrap items-center justify-between gap-3`}>
                <GameRowView g={g} />
                <span className="flex gap-2"><button type="button" onClick={() => e.editGame(g)} className={btnSecondary}>Edit</button><button type="button" onClick={() => e.removeGame(g.game)} disabled={e.busy === `del-${g.game}`} className={btnDanger}>Remove</button></span>
              </li>))}</ul>
          )}
          <form onSubmit={(ev) => { ev.preventDefault(); void e.saveGame(); }} noValidate className={`${box} space-y-4`}>
            <h3 className={h3}>Add or update a game</h3>
            <SelectInput id="g-game" label="Game" value={e.game.game} onChange={(v) => e.setGameField("game", v)} options={GAMES} blank="Choose a game" error={e.gameErrors.game} help="Saving a game you already added replaces it." />
            <TextInput id="g-name" label="In-game name" value={e.game.inGameName} onChange={(v) => e.setGameField("inGameName", v)} error={e.gameErrors.inGameName} maxLength={40} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput id="g-rank" label="Rank" value={e.game.rankName} onChange={(v) => e.setGameField("rankName", v)} error={e.gameErrors.rankName} maxLength={24} help="As the game shows it, for example Diamond 3." />
              <TextInput id="g-ord" label="Rank step (0 to 100)" value={e.game.rankOrdinal} onChange={(v) => e.setGameField("rankOrdinal", v.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" error={e.gameErrors.rankOrdinal} help="0 is the lowest rung of that game's ladder, 100 the highest." />
            </div>
            <fieldset>
              <legend className="mb-1 text-sm font-medium text-zinc-100">Roles (up to 4)</legend>
              <div className="flex flex-wrap gap-2">{ROLES.map((r) => <label key={r} className="flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-zinc-100"><input type="checkbox" checked={e.game.roles.includes(r)} onChange={() => e.toggleRole(r)} className="h-4 w-4 accent-cyan-400" />{ROLE_LABELS[r]}</label>)}</div>
              {e.gameErrors.roles && <p role="alert" className="mt-1 text-sm text-danger"><span aria-hidden="true">! </span>{e.gameErrors.roles}</p>}
            </fieldset>
            <button type="submit" disabled={e.busy === "game"} className={btnPrimary}>Save game</button>
          </form>
        </section>
      )}

      <section aria-labelledby="consent-h" className={`${section} space-y-4`}>
        <h2 id="consent-h" className={h2}>{COPY.consentTitle}</h2>
        {COPY_IS_DRAFT && <p className="text-sm text-warning"><StatusBadge label="Draft wording" tone="warning" /> <span className="text-zinc-300">{COPY.draftNotice}</span></p>}
        <div className={`${box} space-y-3`}>
          <p className="text-zinc-100">If you set your resume to Public, this becomes public:</p>
          <ul className="list-disc space-y-1 pl-5 text-zinc-300">{COPY.consentWhatBecomesPublic.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="text-zinc-300">{COPY.consentNeverPublic}</p>
          <p className="text-zinc-300">{COPY.consentBody}</p>
          <p className="text-zinc-100">{COPY.consentWithdraw}</p>
          {e.consent ? (
            <div className="space-y-3"><p className="text-success"><span aria-hidden="true">+ </span>{COPY.consentGivenAt} {when(e.data?.resumeConsentAt ?? null)}.</p><button type="button" onClick={e.withdrawConsent} disabled={e.busy === "consent"} className={btnDanger}>{COPY.consentWithdrawButton}</button></div>
          ) : (
            <div className="space-y-3">
              <p className="text-zinc-300">{COPY.consentNone}</p>
              <label className="flex items-start gap-3 text-zinc-100"><input type="checkbox" checked={agree} onChange={(ev) => setAgree(ev.target.checked)} className="mt-1 h-5 w-5 accent-cyan-400" disabled={!e.adult} /><span>{COPY.consentCheckbox}{!e.adult && <span className="block text-sm text-zinc-400">Confirm you are 18 or older above first.</span>}</span></label>
              <button type="button" onClick={e.giveConsent} disabled={!agree || !e.adult || e.busy === "consent"} className={btnPrimary}>{COPY.consentGive}</button>
            </div>
          )}
        </div>
      </section>

      {e.profile && (
        <section aria-labelledby="vis-h" className={`${section} space-y-4`}>
          <h2 id="vis-h" className={h2}>{COPY.visibilityTitle}</h2>
          <fieldset className={`${box} space-y-3`}>
            <legend className="sr-only">{COPY.visibilityTitle}</legend>
            {([["private", COPY.visibilityPrivate], ["unlisted", COPY.visibilityUnlisted], ["public", COPY.visibilityPublic]] as const).map(([v, text]) => {
              const ok = v !== "unlisted" && canChoose(v, e.adult, e.consent);
              return (
                <label key={v} className={`flex min-h-11 items-center gap-3 ${ok || v === vis ? "text-zinc-100" : "text-zinc-400"}`}>
                  <input type="radio" name="visibility" value={v} checked={vis === v} disabled={!ok && vis !== v} onChange={() => e.setVisibility(v)} className="h-5 w-5 accent-cyan-400" />{text}
                </label>
              );
            })}
            {!(e.adult && e.consent) && <p className="text-sm text-zinc-400">{COPY.visibilityPublicNeedsConsent}</p>}
            {vis === "public" && e.profile && <p className="text-sm"><Link href={`/players/view/?s=${encodeURIComponent(e.profile.slug)}`} className="text-cyan-400 underline underline-offset-2">See your public resume</Link></p>}
          </fieldset>
        </section>
      )}

      {e.profile && (
        <section aria-labelledby="del-h" className={`${section} space-y-3`}>
          <h2 id="del-h" className={h2}>{COPY.deleteTitle}</h2>
          <p className="text-zinc-300">{COPY.deleteBody}</p>
          {confirmDelete ? (
            <div className="flex flex-wrap gap-3"><button type="button" onClick={() => { setConfirmDelete(false); void e.deleteResume(); }} className={btnDanger}>Yes, delete my resume</button><button type="button" onClick={() => setConfirmDelete(false)} className={btnSecondary}>Keep it</button></div>
          ) : <button type="button" onClick={() => setConfirmDelete(true)} className={btnDanger}>{COPY.deleteTitle}</button>}
        </section>
      )}
    </div>
  );
}

export function PublicResumeView({ p }: { p: PublicProfile }) {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className={h1}>{p.handle}</h1>
        <p className="text-zinc-300">{[p.city, p.state].filter(Boolean).join(", ")}{p.languages.length > 0 && ` · ${p.languages.join(", ")}`}</p>
        {p.bio && <p className="max-w-3xl whitespace-pre-line text-zinc-100">{p.bio}</p>}
      </header>
      <section className={section} aria-labelledby="pg-h">
        <h2 id="pg-h" className={h2}>Games</h2>
        {p.games.length === 0 ? <p className="mt-3 text-zinc-300">No games added yet.</p> : <ul className="mt-4 space-y-2">{p.games.map((g) => <li key={g.game} className={box}><GameRowView g={g} /></li>)}</ul>}
      </section>
      {p.updatedAt && <p className="text-xs text-zinc-400">Last updated {when(p.updatedAt)}. This resume is public because its owner chose to make it so.</p>}
    </article>
  );
}

export function PublicResumeScreen() {
  const { slug, res } = usePublicResume();
  if (slug === null || res.phase === "loading") return <div className="mx-auto max-w-3xl">{res.phase === "loading" && res.showSkeleton ? <SkeletonRows n={2} label="Loading the resume" /> : <p className="sr-only">Loading the resume</p>}</div>;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {res.phase === "unavailable" && <EmptyState title="No public resume here" body="This address has no public resume. The owner may have made it private, or it never existed." action={<Link href="/" className={btnSecondary}>Back to the home page</Link>} />}
      {res.phase === "error" && <ErrorState message={explainFailure(res.failure)} onRetry={res.reload} />}
      {res.phase === "ready" && !res.data && <EmptyState title="No public resume here" body="This address has no public resume. The owner may have made it private, or it never existed." action={<Link href="/" className={btnSecondary}>Back to the home page</Link>} />}
      {res.phase === "ready" && res.data && <PublicResumeView p={res.data} />}
    </div>
  );
}

