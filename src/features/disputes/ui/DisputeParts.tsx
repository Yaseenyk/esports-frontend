"use client";

import Link from "next/link";
import { useEvidenceImage } from "@/features/disputes/hooks/useDisputes";
import { ACTOR_LABELS, eventText, OUTCOME_LABELS, statusLabel, STATUS_TONE, typeLabel, type Correction, type DisputeDetail, type DisputeEvent, type DisputeListItem, type EvidenceItem } from "@/features/disputes/domain";
import { refLabel, valueText } from "@/features/disputes/corrections";
import { ACCEPTED_TYPES, kb, MAX_BYTES, MAX_FILES } from "@/features/disputes/evidence";
import { StatusBadge } from "@/features/shared/ui/States";
import { box, btnSecondary, h2, section } from "@/features/shared/ui/styles";

export const when = (iso: string | null): string => { const t = iso ? Date.parse(iso) : NaN; return Number.isFinite(t) ? new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : ""; };

export const DisputeStatusBadge = ({ status }: { status: string }) => <StatusBadge label={statusLabel(status)} tone={STATUS_TONE[status] ?? "neutral"} />;
/** Overdue is a word, never only a colour. */
export const OverdueBadge = ({ overdue }: { overdue: boolean }) => (overdue ? <StatusBadge label="Overdue" tone="danger" /> : null);

export function DisputeCard({ d, href }: { d: DisputeListItem; href: string }) {
  return (
    <li>
      <Link href={href} className={`block ${box} transition-colors hover:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400`}>
        <span className="flex flex-wrap items-center gap-2"><DisputeStatusBadge status={d.status} /><OverdueBadge overdue={d.overdue} /><span className="text-sm text-zinc-300">{typeLabel(d.type)}</span></span>
        <span className="mt-2 block font-display text-lg text-zinc-100">{d.tournament.title}</span>
        <span className="mt-1 block text-zinc-300">{d.summary.length > 160 ? `${d.summary.slice(0, 159)}…` : d.summary}</span>
        <span className="mt-2 block text-xs text-zinc-400">{[d.raisedByTeam, d.againstTeam ? `against ${d.againstTeam}` : null].filter(Boolean).join(" ")} · {d.evidenceCount} {d.evidenceCount === 1 ? "image" : "images"}{d.dueAt ? ` · decision due ${when(d.dueAt)}` : ""}</span>
      </Link>
    </li>
  );
}

export function DisputeTimeline({ events, corrections = [] }: { events: DisputeEvent[]; corrections?: Correction[] }) {
  return (
    <section aria-labelledby="tl-h" className={section}>
      <h2 id="tl-h" className={h2}>Timeline</h2>
      <ol className="mt-4 space-y-4 border-l border-white/10 pl-4">
        {events.map((e) => (
          <li key={e.id}>
            <p className="text-zinc-100">{eventText(e)} <span className="text-sm text-zinc-400">by {ACTOR_LABELS[e.actorRole] ?? e.actorRole}</span></p>
            {e.note && <p className="mt-1 whitespace-pre-line text-zinc-300">{e.note}</p>}
            {e.action === "status_resolved" && corrections.length > 0 && <CorrectionList items={corrections} />}
            <p className="mt-1 text-xs text-zinc-400">{when(e.createdAt)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EvidenceThumb({ disputeId, e }: { disputeId: string; e: EvidenceItem }) {
  const img = useEvidenceImage(disputeId, e.id, e.mimeType, e.purged);
  return (
    <li className={box}>
      {e.purged ? <p className="text-sm text-zinc-300">Deleted after the retention period.</p>
        : img.loading ? <p className="text-sm text-zinc-400">Loading image</p>
        : img.error ? <p className="text-sm text-danger"><span aria-hidden="true">! </span>{img.error}</p>
        // eslint-disable-next-line @next/next/no-img-element
        : <a href={img.url} target="_blank" rel="noopener noreferrer"><img src={img.url} alt={e.caption ?? "Evidence image"} width={320} height={240} className="h-40 w-full rounded-lg object-contain" /></a>}
      <p className="mt-2 text-xs text-zinc-400">{e.caption ? `${e.caption} · ` : ""}{kb(e.sizeBytes)} · {when(e.createdAt)}</p>
    </li>
  );
}

export function EvidenceGrid({ disputeId, evidence }: { disputeId: string; evidence: EvidenceItem[] }) {
  return (
    <section aria-labelledby="ev-h" className={section}>
      <h2 id="ev-h" className={h2}>Evidence</h2>
      {evidence.length === 0 ? <p className="mt-3 text-zinc-300">No images attached.</p> : <ul className="mt-4 grid gap-4 sm:grid-cols-2">{evidence.map((e) => <EvidenceThumb key={e.id} disputeId={disputeId} e={e} />)}</ul>}
      <p className="mt-3 text-xs text-zinc-400">Images are deleted 90 days after the dispute is closed.</p>
    </section>
  );
}

/** Presentation only: the picker state comes in as props. Each file shows its own result. */
export function EvidenceUploader({ items, onPick, onRemove, full, busy }: { items: { key: string; name: string; status: string; size?: number; error?: string }[]; onPick: (files: File[]) => void; onRemove: (key: string) => void; full: boolean; busy?: boolean }) {
  return (
    <div>
      <p className="mb-1 block text-sm font-medium text-zinc-100">Evidence images (optional)</p>
      <label className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-white/10 bg-surface px-4 text-zinc-100 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cyan-400 ${full || busy ? "opacity-60" : ""}`}>
        <span>{items.length ? "Add more images" : "Choose images"}</span>
        <input id="ev-files" type="file" multiple accept={ACCEPTED_TYPES.join(",")} disabled={full || busy} onChange={(e) => { onPick(Array.from(e.target.files ?? [])); e.target.value = ""; }} className="sr-only" aria-describedby="ev-help" />
      </label>
      <p id="ev-help" className="mt-1 text-xs text-zinc-400">PNG, JPEG or WebP, up to {MAX_FILES} images. Each is shrunk to {kb(MAX_BYTES)} on your device before upload, which also removes location and camera data.</p>
      {items.length > 0 && (
        <ul className="mt-3 space-y-2" aria-live="polite">
          {items.map((i) => (
            <li key={i.key} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-zinc-100">{i.name}</span>
              <span className="flex items-center gap-3">
                {i.status === "working" && <span className="text-zinc-400">Shrinking</span>}
                {i.status === "ready" && <span className="text-success"><span aria-hidden="true">+ </span>Ready, {kb(i.size ?? 0)}</span>}
                {i.status === "error" && <span className="text-danger"><span aria-hidden="true">! </span>{i.error}</span>}
                <button type="button" onClick={() => onRemove(i.key)} className={`${btnSecondary} min-h-11`} aria-label={`Remove ${i.name}`}>Remove</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ResolutionBox({ d }: { d: DisputeDetail }) {
  if (!d.outcome && !d.resolutionNote) return null;
  return (
    <section aria-labelledby="res-h" className={section}>
      <h2 id="res-h" className={h2}>Decision</h2>
      <p className="mt-3 text-zinc-100">{d.outcome ? (OUTCOME_LABELS[d.outcome] ?? d.outcome) : statusLabel(d.status)}{d.resolvedAt ? <span className="text-sm text-zinc-400"> · {when(d.resolvedAt)}</span> : null}</p>
      {d.resolutionNote && <p className="mt-2 max-w-3xl whitespace-pre-line text-zinc-300">{d.resolutionNote}</p>}
    </section>
  );
}

/** Result corrections made by the decision, shown in the timeline under it: what changed, the old value and the new one. */
function CorrectionList({ items }: { items: Correction[] }) {
  return (
    <div className="mt-2"><p className="text-sm font-medium text-zinc-100">Result corrections ({items.length})</p>
      <ul className="mt-1 space-y-1 text-sm text-zinc-300">{items.map((c, i) => <li key={i}>{refLabel(c.matchRef)}: <span className="text-zinc-400">was</span> {valueText(c.oldValue)}, <span className="text-zinc-400">now</span> {valueText(c.newValue)}</li>)}</ul></div>
  );
}
