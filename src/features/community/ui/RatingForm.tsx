"use client";

import { useState } from "react";
import type { RatingBody } from "@/features/community/domain";
import { SelectInput, TextArea, TextInput } from "@/features/shared/ui/Fields";
import { box, btnPrimary, focus, h2 } from "@/features/shared/ui/styles";

const STAR_OPTIONS = [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} of 5` }));

/** Validates the form before sending (the server checks everything again). Pure, exported for tests. */
export function ratingProblem(f: { link: string; stars: string; onTime: string; fair: string; communication: string; displayName: string; review: string }): string | null {
  if (!f.link.trim()) return "Paste the link you were given for this event.";
  if (![f.stars, f.onTime, f.fair, f.communication].every((v) => /^[1-5]$/.test(v))) return "Answer all four questions.";
  const name = f.displayName.trim();
  if (name.length < 2 || name.length > 40) return "Your name must be 2 to 40 characters.";
  const review = f.review.trim();
  if (review && (Array.from(review).length < 10 || Array.from(review).length > 1000)) return "A written review must be 10 to 1000 characters, or left empty.";
  if (/[<>]/.test(review) || /[<>]/.test(name)) return "Plain text only: please remove the < and > characters.";
  return null;
}

/** The rating form. Proof first (the pass or captain link from this event), then four questions, the name shown, and an optional review. */
export function RatingForm({ suggestedName, busy, onSubmit }: { suggestedName: string | null; busy: boolean; onSubmit: (b: RatingBody) => Promise<boolean> }) {
  const [kind, setKind] = useState<"pass" | "captain">("pass");
  const [f, setF] = useState({ link: "", stars: "", onTime: "", fair: "", communication: "", displayName: suggestedName ?? "", review: "" });
  const [problem, setProblem] = useState("");
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  const radio = (v: "pass" | "captain", text: string) => (
    <label className="flex min-h-11 items-center gap-3 text-zinc-100"><input type="radio" name="proof-kind" checked={kind === v} onChange={() => setKind(v)} className={`h-5 w-5 ${focus}`} />{text}</label>
  );
  return (
    <form className={`${box} space-y-4`} aria-labelledby="rate-h" onSubmit={async (e) => {
      e.preventDefault();
      const p = ratingProblem(f);
      setProblem(p ?? "");
      if (p) return;
      await onSubmit({ stars: Number(f.stars), onTime: Number(f.onTime), fair: Number(f.fair), communication: Number(f.communication), displayName: f.displayName.trim(), ...(f.review.trim() ? { review: f.review.trim() } : {}), proof: { kind, link: f.link.trim() } });
    }}>
      <h2 id="rate-h" className={h2}>Rate this organiser</h2>
      <fieldset className="space-y-1">
        <legend className="mb-1 text-sm font-medium text-zinc-100">How did you take part?</legend>
        {radio("pass", "I was checked in with my pass")}
        {radio("captain", "I captained a team that played")}
      </fieldset>
      <TextInput id="rate-link" label={kind === "pass" ? "The link to your pass" : "Your captain link"} value={f.link} onChange={set("link")}
        help="This proves you were at this event. It is checked once and never stored or shown." />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput id="rate-stars" label="Overall" value={f.stars} onChange={set("stars")} options={STAR_OPTIONS} blank="Choose" />
        <SelectInput id="rate-ontime" label="Kept to the schedule" value={f.onTime} onChange={set("onTime")} options={STAR_OPTIONS} blank="Choose" />
        <SelectInput id="rate-fair" label="Fair rules and results" value={f.fair} onChange={set("fair")} options={STAR_OPTIONS} blank="Choose" />
        <SelectInput id="rate-comm" label="Clear communication" value={f.communication} onChange={set("communication")} options={STAR_OPTIONS} blank="Choose" />
      </div>
      <TextInput id="rate-name" label="Name shown with your rating" value={f.displayName} onChange={set("displayName")} maxLength={40} help="Reviews are never anonymous: this name is shown, and the rating is tied to your account." />
      <TextArea id="rate-review" label="Written review (optional)" value={f.review} onChange={set("review")} rows={4} max={1000} help="Stick to what happened at the event. No phone numbers or other people's details." />
      {problem && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{problem}</p>}
      <button type="submit" disabled={busy} className={btnPrimary}>Publish my rating</button>
    </form>
  );
}
