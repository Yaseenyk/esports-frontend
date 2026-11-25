"use client";

import Link from "next/link";
import { useRef } from "react";
import CardView from "@/components/idcard/CardView";
import { useSession } from "@/components/cloud/useSession";
import { explainFailure } from "@/features/shared/failure";
import { gameLabel, ROLE_LABELS } from "@/features/shared/games";
import { SelectInput, TextInput } from "@/features/shared/ui/Fields";
import { EmptyState, ErrorState, NotAvailable, SignInPrompt, SkeletonRows } from "@/features/shared/ui/States";
import { box, btnPrimary, btnSecondary, h1, h2, helper, label, link } from "@/features/shared/ui/styles";
import { themeById } from "@/lib/idcard/themes";
import { CARD_FORMATS, CARD_THEMES, PHOTO_TYPES, QR_MODES, type QrMode } from "@/features/player-card/domain";
import { usePlayerCardStudio } from "@/features/player-card/hooks/usePlayerCardStudio";
import { StatsStoryCard } from "@/features/player-card/ui/StatsStoryCard";

/**
 * /app/player-card/: a signed-in player designs a card of themselves (name, photo, game, role, team) with a QR that opens their player page.
 * The photo never leaves the browser. data-clarity-mask keeps the card out of session tools (the app is outside Pulse and the tag loader anyway).
 */
export function PlayerCardStudio() {
  const session = useSession();
  const s = usePlayerCardStudio();
  const cardRef = useRef<HTMLDivElement>(null);
  const header = (
    <header className="space-y-2">
      <h1 className={h1}>My player card</h1>
      <p className="max-w-3xl text-zinc-300">Make a card of yourself to print or share. Its QR code can open your player page, where people see what you chose to show.</p>
    </header>
  );
  if (s.resume.phase === "unavailable") return <div className="mx-auto max-w-5xl space-y-6">{header}<NotAvailable what="The player card" /></div>;
  if (s.resume.phase === "signin") return <div className="mx-auto max-w-5xl space-y-6">{header}{!session && <SignInPrompt what="Sign in to make your player card." next="/app/player-card/" />}</div>;
  if (s.resume.phase === "loading") return <div className="mx-auto max-w-5xl space-y-6">{header}{s.resume.showSkeleton ? <SkeletonRows label="Loading your profile" /> : <p className="sr-only">Loading your profile</p>}</div>;
  if (s.resume.phase === "error") return <div className="mx-auto max-w-5xl space-y-6">{header}<ErrorState message={explainFailure(s.resume.failure)} onRetry={s.resume.reload} /></div>;
  if (!s.profile) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">{header}
        <EmptyState title="Create your player profile first" body="Your card shows your handle, games and roles from your profile. It takes a minute, and it stays private until you choose to share it." action={<Link href="/app/resume/" className={btnPrimary}>Create my profile</Link>} />
      </div>
    );
  }
  const f = s.form;
  const games = s.profile.games;
  const roles = games.find((g) => g.game === f.game)?.roles ?? [];
  const page = s.page;

  return (
    <div className="mx-auto max-w-5xl space-y-8" data-clarity-mask="true">
      {header}
      <div aria-live="polite">
        {s.m.notice && <p role="status" className="text-success"><span aria-hidden="true">+ </span>{s.m.notice}</p>}
        {s.m.error && <p role="alert" className="text-danger"><span aria-hidden="true">! </span>{s.m.error}</p>}
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label="Card details">
          <TextInput id="pc-name" label="Name or handle" value={f.name} onChange={(v) => s.setField("name", v)} maxLength={40} />
          <TextInput id="pc-team" label="Team (optional)" value={f.team} onChange={(v) => s.setField("team", v)} maxLength={60} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput id="pc-game" label="Game" value={f.game} onChange={(v) => { s.setField("game", v); s.setField("role", games.find((g) => g.game === v)?.roles[0] ?? ""); }} blank="No game" options={games.map((g) => ({ value: g.game, label: gameLabel(g.game) }))} help={games.length ? undefined : "Add games on your profile to pick one here."} />
            <SelectInput id="pc-role" label="Role" value={f.role} onChange={(v) => s.setField("role", v)} blank="No role" options={roles.map((r) => ({ value: r, label: ROLE_LABELS[r] ?? r }))} />
          </div>
          <div>
            <label htmlFor="pc-photo" className={label}>Photo (optional)</label>
            <input id="pc-photo" type="file" accept={PHOTO_TYPES.join(",")} onChange={(e) => void s.pickPhoto(e.target.files?.[0] ?? null)} className="block min-h-11 w-full text-sm text-zinc-300" aria-describedby="pc-photo-help" />
            <p id="pc-photo-help" className={helper}>PNG, JPEG or WebP. It stays on this device: it is never uploaded.</p>
            {s.photoError && <p role="alert" className="mt-1 text-sm text-danger"><span aria-hidden="true">! </span>{s.photoError}</p>}
            {f.photo && <button type="button" onClick={() => s.setField("photo", null)} className={`${btnSecondary} mt-2`}>Remove photo</button>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput id="pc-theme" label="Look" value={f.theme} onChange={(v) => s.setField("theme", v)} options={CARD_THEMES.map((t) => ({ value: t, label: themeById(t)?.name ?? t }))} />
            <SelectInput id="pc-fmt" label="Card type" value={f.fmt} onChange={(v) => s.setField("fmt", v as typeof f.fmt)} options={CARD_FORMATS.map((c) => ({ value: c.value, label: c.label }))} />
          </div>

          <fieldset className={`${box} space-y-3`}>
            <legend className="px-1 text-sm font-medium text-zinc-100">QR code holds</legend>
            {QR_MODES.map((q) => (
              <label key={q.value} className="flex min-h-11 items-start gap-3 text-zinc-100">
                <input type="radio" name="pc-qr" value={q.value} checked={f.qr === q.value} onChange={() => s.setField("qr", q.value as QrMode)} className="mt-1 h-5 w-5 accent-cyan-400" />
                <span><span className="font-medium">{q.label}</span><span className="block text-sm text-zinc-300">{q.help}</span></span>
              </label>
            ))}
            {f.qr === "page" && !s.shared && (
              <div className="space-y-2 border-t border-white/10 pt-3" data-testid="share-first">
                <p className="text-zinc-100">One step first: share your player page.</p>
                <p className="text-sm text-zinc-300">Your profile is private, so a QR would open nothing. Choose Link only (anyone with the card can open it) or Public on your profile. Nothing is shared until you do.</p>
                <Link href="/app/resume/#pp-h" className={btnSecondary}>Choose who can see my page</Link>
              </div>
            )}
            {f.qr === "page" && s.shared && !page?.cardPath && (
              <div className="space-y-2 border-t border-white/10 pt-3">
                <p className="text-sm text-zinc-300">Your page is shared. Make the link the QR will hold (a random code, not your name or email).</p>
                <button type="button" onClick={() => void s.m.ensureCard()} disabled={s.m.busy !== ""} className={btnPrimary}>{s.m.busy === "card" ? "Making" : "Use my player page"}</button>
              </div>
            )}
            {f.qr === "page" && s.qr && (
              <div className="space-y-1 border-t border-white/10 pt-3">
                <p className="text-sm text-zinc-100">The QR opens your player page.</p>
                <p className="break-all font-mono text-xs text-zinc-400" data-testid="qr-value">{s.qr}</p>
                <p className="text-sm"><Link href="/app/resume/#pp-h" className={link}>Reset the QR link or change what shows</Link></p>
              </div>
            )}
          </fieldset>
        </form>

        <section aria-labelledby="pc-prev" className="space-y-4">
          <h2 id="pc-prev" className={h2}>Preview</h2>
          <div className="mx-auto w-full max-w-sm" ref={cardRef} data-testid="player-card"><CardView tpl={s.tpl} ctx={s.ctx} /></div>
          <button type="button" onClick={() => void s.download(cardRef.current?.querySelector(".idcard-box") as HTMLElement | null)} disabled={s.downloading} className={btnPrimary}>{s.downloading ? "Preparing" : "Download as PNG"}</button>
          <p className={helper}>Print it at the real size from the PNG, or share it as an image. Lost a card? Reset the QR link on your profile, then download a new one.</p>
        </section>
      </div>
      <StatsStoryCard page={page} game={f.game} role={f.role} />
    </div>
  );
}
