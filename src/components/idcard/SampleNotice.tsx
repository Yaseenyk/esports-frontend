"use client";

/** Shown on the People and Print steps while demo names or demo event details are still in the event. */
export default function SampleNotice({ left, hasPeople, hasSamplePeople, hasSampleEvent, onRemoveSamples, onEmptyList, onClearEvent }: {
  left: string[]; hasPeople: boolean; hasSamplePeople: boolean; hasSampleEvent: boolean;
  onRemoveSamples: () => void; onEmptyList: () => void; onClearEvent: () => void;
}) {
  if (left.length === 0) return null;
  return (
    <div role="status" className="no-print mb-4 space-y-2 rounded-xl border border-amber-500/40 bg-surface px-3 py-3 text-sm text-amber-100">
      <p><strong>These are SAMPLE names and details. Replace or remove them before you print.</strong> Still here: {left.join(", ")}.</p>
      <div className="flex flex-wrap gap-2">
        {hasSamplePeople && <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" onClick={onRemoveSamples}>Remove all sample people</button>}
        {hasPeople && <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" onClick={onEmptyList}>Start with an empty list</button>}
        {hasSampleEvent && <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" onClick={onClearEvent}>Clear the sample event details</button>}
      </div>
    </div>
  );
}
