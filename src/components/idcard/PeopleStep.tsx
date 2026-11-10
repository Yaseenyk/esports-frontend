"use client";

import { useMemo, useState } from "react";
import Select from "@/components/Select";
import { maskAadhaar } from "@/lib/idcard/aadhaar";
import { ROLES, type Person, type Role, type Team } from "@/lib/idcard/types";
import RosterPanel from "./RosterPanel";

export interface Job { key: number; file: string; state: "queued" | "reading" | "done" | "error"; pct: number; note?: string }

const DEMO_CARDS = [
  { file: "aarav-mehta", label: "Aarav Mehta" },
  { file: "diya-kulkarni", label: "Diya Kulkarni" },
  { file: "rohan-deshmukh", label: "Rohan Deshmukh" },
];

interface Props {
  people: Person[]; teams: Team[]; teamOpts: { value: string; label: string }[]; valid: (id: string) => string;
  scanTeam: string; setScanTeam: (v: string) => void; consent: boolean; setConsent: (v: boolean) => void;
  jobs: Job[]; scan: (files: FileList | File[] | null, password?: string) => void; trySample: (file: string) => void;
  pdfAsk: { file: File; wrong: boolean } | null; pdfPass: string; setPdfPass: (v: string) => void;
  setPeople: (f: (p: Person[]) => Person[]) => void; setTeams: (t: Team[]) => void; setPerson: (id: string, patch: Partial<Person>) => void; addPerson: (teamId?: string) => void;
  minorOf: (p: Person) => boolean; duplicates: Map<string, string[]>;
  photo: (id: string, f?: File) => void; cutOutExisting: (p: Person) => void; bgBusy: string | null; bgNote: string | null; autoBg: boolean; setAutoBg: (v: boolean) => void;
}

const Pill = ({ tone, children, title }: { tone: "red" | "amber" | "green" | "grey"; children: React.ReactNode; title?: string }) => (
  <span title={title} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone === "red" ? "border-red-500/40 bg-red-500/10 text-red-200" : tone === "amber" ? "border-amber-500/40 bg-amber-500/10 text-amber-200" : tone === "green" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-white/10 text-zinc-400"}`}>{children}</span>
);

function Avatar({ p }: { p: Person }) {
  const initials = p.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-800 text-sm font-bold text-zinc-400 ring-1 ring-white/10">
      {p.photo
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={p.photo} alt="" className={`h-full w-full ${p.cutout ? "object-contain object-bottom" : "object-cover object-top"}`} />
        : initials}
    </span>
  );
}

export default function PeopleStep(p: Props) {
  const [tab, setTab] = useState<"scan" | "sheet" | "hand">("scan");
  const [q, setQ] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const shown = useMemo(() => p.people.filter((x) => (teamFilter === "all" || x.teamId === teamFilter) && (!q.trim() || `${x.name} ${x.id}`.toLowerCase().includes(q.trim().toLowerCase()))), [p.people, q, teamFilter]);
  const needReview = p.people.filter((x) => x.review).length;
  const minors = p.people.filter((x) => p.minorOf(x)).length;

  return (
    <div className="no-print space-y-4">
      {/* ------------------------------------------------------------ add people */}
      <section className="card !p-0" aria-label="Add people">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
          <h2 className="font-display text-lg font-bold text-white">Add people</h2>
          <div className="flex gap-1 rounded-xl bg-white/5 p-1" role="tablist" aria-label="How to add people">
            {([["scan", "Scan Aadhaar cards", "Scan"], ["sheet", "Import a sheet", "Import"], ["hand", "Add one by hand", "By hand"]] as const).map(([k, l, short]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`min-h-9 rounded-lg px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${tab === k ? "bg-cyan text-ink" : "text-zinc-300 hover:bg-white/5"}`}><span className="sm:hidden">{short}</span><span className="hidden sm:inline">{l}</span></button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {tab === "scan" && (
            <div className="space-y-3">
              <label className="flex items-start gap-2.5 text-sm text-zinc-200">
                <input type="checkbox" checked={p.consent} onChange={(e) => p.setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-cyan" />
                <span>I have the card holder&apos;s permission to read their Aadhaar card for this event.<span className="block text-xs text-zinc-500">Cards are read inside your browser. The picture is never uploaded or saved, and only the last 4 digits of the number are kept.</span></span>
              </label>
              <div className="grid gap-3 sm:grid-cols-[14rem_1fr] sm:items-end">
                <Select label="Add them to" value={p.valid(p.scanTeam)} onChange={p.setScanTeam} options={p.teamOpts} searchable={false} />
                <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (p.consent) p.scan(e.dataTransfer.files); }} className={`flex min-h-12 items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 text-center text-sm transition-colors ${p.consent ? "cursor-pointer border-cyan/50 text-white hover:bg-cyan/5" : "cursor-not-allowed border-white/10 text-zinc-500"}`}>
                  <span className="font-semibold">{p.consent ? "Drop card photos or PDFs here, or click to choose" : "Tick the permission box first"}</span>
                  <input type="file" accept="image/*,application/pdf" multiple disabled={!p.consent} className="sr-only" onChange={(e) => { p.scan(e.target.files); e.target.value = ""; }} />
                </label>
              </div>
              <p className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                <span>No card handy? Try a dummy one:</span>
                {DEMO_CARDS.map((c) => (<button key={c.file} type="button" disabled={!p.consent} className="chip disabled:cursor-not-allowed disabled:opacity-40" onClick={() => p.trySample(c.file)}>{c.label}</button>))}
              </p>
              {p.jobs.length > 0 && (
                <ul className="space-y-1.5" aria-live="polite">
                  {p.jobs.slice(-4).map((j) => (
                    <li key={j.key} className="rounded-lg border border-white/10 px-3 py-2 text-sm">
                      <div className="flex items-center justify-between gap-3"><span className="truncate text-zinc-300">{j.file}</span><span className={j.state === "error" ? "text-red-300" : j.state === "done" ? "text-emerald-300" : "text-zinc-400"}>{j.state === "reading" ? `Reading ${j.pct}%` : j.state === "queued" ? "Waiting" : j.state === "done" ? "Added" : "Needs attention"}</span></div>
                      {j.state === "reading" && <div className="mt-1.5 h-1 overflow-hidden rounded bg-white/10"><div className="h-full bg-gradient-to-r from-cyan to-purple transition-[width]" style={{ width: `${j.pct}%` }} /></div>}
                      {j.note && <p className="mt-0.5 text-xs text-zinc-500">{j.note}</p>}
                    </li>
                  ))}
                </ul>
              )}
              {p.pdfAsk && (
                <form className="flex flex-wrap items-end gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3" onSubmit={(e) => { e.preventDefault(); if (p.pdfPass) p.scan([p.pdfAsk!.file], p.pdfPass); }}>
                  <label className="block flex-1 text-sm text-amber-100">Password for {p.pdfAsk.file.name}<input type="password" autoComplete="off" className="field mt-1 min-w-48" value={p.pdfPass} onChange={(e) => p.setPdfPass(e.target.value)} placeholder="For example RAVI1998" /></label>
                  <button type="submit" className="btn !min-h-11 text-sm" disabled={!p.pdfPass}>Open PDF</button>
                  <p className="w-full text-xs text-amber-100/80">An e-Aadhaar PDF is usually locked with the first 4 letters of the name in capitals plus the year of birth. The password is only used on this device.</p>
                </form>
              )}
            </div>
          )}
          {tab === "sheet" && <RosterPanel bare teams={p.teams} people={p.people} setTeams={p.setTeams} setPeople={(l) => p.setPeople(() => l)} minorOf={p.minorOf} />}
          {tab === "hand" && (
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-56"><Select label="Add to team" value={p.valid(p.scanTeam)} onChange={p.setScanTeam} options={p.teamOpts} searchable={false} /></div>
              <button type="button" className="btn" onClick={() => { p.addPerson(p.valid(p.scanTeam)); setTab("hand"); setOpen(null); }}>+ Add a person</button>
              <p className="text-sm text-zinc-500">A blank person is added at the bottom of the list below. Open it to fill in the details.</p>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ the list */}
      <section className="card !p-0" aria-label="People">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3">
          <h2 className="font-display text-lg font-bold text-white">People <span className="text-sm font-normal text-zinc-500">· {p.people.length}</span></h2>
          {needReview > 0 && <Pill tone="amber" title="Read by OCR. Open the row, check the details, then confirm.">{needReview} to check</Pill>}
          {minors > 0 && <Pill tone="red" title="Under 18 on the event date">{minors} under 18</Pill>}
          <div className="ms-auto flex flex-wrap items-center gap-2">
            <input type="search" className="field !min-h-10 w-44" placeholder="Search…" aria-label="Search people" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="w-44"><Select ariaLabel="Filter by team" value={teamFilter} onChange={setTeamFilter} options={[{ value: "all", label: "All teams" }, ...p.teamOpts]} searchable={false} /></div>
          </div>
        </div>
        {p.bgNote && <p className="border-b border-white/10 px-4 py-2 text-xs text-zinc-400" role="status">{p.bgNote}{p.bgBusy ? " (the first time downloads a small model, then it works offline)" : ""}</p>}

        <ul className="divide-y divide-white/10">
          {shown.length === 0 && <li className="px-4 py-6 text-center text-sm text-zinc-500">{p.people.length === 0 ? "No one yet. Scan a card, import a sheet or add someone by hand above." : "No one matches this search."}</li>}
          {shown.map((x) => {
            const isOpen = open === x.id;
            const minor = p.minorOf(x), dup = p.duplicates.get(x.id);
            return (
              <li key={x.id} className={x.review ? "bg-amber-500/[0.04]" : ""}>
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2 md:grid-cols-[auto_minmax(10rem,1fr)_13rem_10.5rem_minmax(0,auto)_auto]">
                  <Avatar p={x} />
                  <input className="field !min-h-10" aria-label="Full name" placeholder="Full name" value={x.name} onChange={(e) => p.setPerson(x.id, { name: e.target.value })} />
                  <div className="hidden md:block"><Select ariaLabel="Team" value={p.valid(x.teamId)} onChange={(v) => p.setPerson(x.id, { teamId: v })} options={p.teamOpts} searchable={false} /></div>
                  <div className="hidden md:block"><Select ariaLabel="Role" value={x.role} onChange={(v) => p.setPerson(x.id, { role: v as Role })} options={ROLES.map((r) => ({ value: r, label: r }))} searchable={false} /></div>
                  <div className="hidden flex-wrap items-center justify-end gap-1.5 md:flex">
                    {x.review && <button type="button" className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-ink hover:bg-amber-300" title="This card was read from printed text, which can misread a letter. Check the details, then confirm." onClick={() => p.setPerson(x.id, { review: false })}>Confirm</button>}
                    {minor && <Pill tone={x.guardian ? "green" : "red"} title={x.guardian ? "Under 18, guardian consent received" : "Under 18 on the event date. Open the row to record guardian consent."}>{x.guardian ? "Under 18 ✓" : "Under 18"}</Pill>}
                    {dup && <Pill tone="amber" title={`Looks like ${dup.map((id) => p.people.find((y) => y.id === id)?.name || id).join(", ")}`}>Duplicate?</Pill>}
                    {!x.photo && <Pill tone="grey" title="No photo yet. Open the row to add one.">No photo</Pill>}
                  </div>
                  <button type="button" aria-expanded={isOpen} aria-label={isOpen ? `Close details for ${x.name || "person"}` : `Open details for ${x.name || "person"}`} title="Birth date, ID, zones, photo and more" onClick={() => setOpen(isOpen ? null : x.id)} className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-zinc-300 transition-colors hover:border-white/30">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-4 w-4 fill-none stroke-current transition-transform ${isOpen ? "rotate-180" : ""}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                </div>

                {isOpen && (
                  <div className="grid gap-3 border-t border-white/10 bg-black/20 px-3 py-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="md:hidden sm:col-span-2 lg:col-span-4 grid gap-3 sm:grid-cols-2">
                      <Select label="Team" value={p.valid(x.teamId)} onChange={(v) => p.setPerson(x.id, { teamId: v })} options={p.teamOpts} searchable={false} />
                      <Select label="Role" value={x.role} onChange={(v) => p.setPerson(x.id, { role: v as Role })} options={ROLES.map((r) => ({ value: r, label: r }))} searchable={false} />
                    </div>
                    <label className="block text-sm text-zinc-400">Date of birth<input className="field mt-1 !min-h-10" placeholder="dd/mm/yyyy" value={x.dob ?? ""} onChange={(e) => p.setPerson(x.id, { dob: e.target.value })} /></label>
                    <Select label="Gender" value={x.gender ?? ""} onChange={(v) => p.setPerson(x.id, { gender: v || undefined })} options={[{ value: "", label: "Not set" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Transgender", label: "Transgender" }]} searchable={false} />
                    <label className="block text-sm text-zinc-400">ID on the card<input className="field mt-1 !min-h-10" value={x.id} onChange={(e) => { const v = e.target.value; p.setPeople((l) => l.map((y) => (y === x ? { ...y, id: v } : y))); }} /></label>
                    <div className="text-sm text-zinc-400">Aadhaar (last 4 only)<span className="mt-1 flex min-h-10 items-center justify-between gap-2 rounded-lg border border-white/10 px-3 font-mono text-sm text-zinc-300">{x.last4 ? maskAadhaar(x.last4) : "Not added"}{x.source && <Pill tone={x.source === "qr" ? "green" : "amber"} title={x.source === "qr" ? "Read from the card's QR code: exact" : "Read from printed text: please check"}>{x.source === "qr" ? "QR" : "OCR"}</Pill>}</span></div>
                    <label className="block text-sm text-zinc-400 sm:col-span-2">Access zones<input className="field mt-1 !min-h-10" placeholder="For example: Main hall; Backstage" value={x.zones ?? ""} onChange={(e) => p.setPerson(x.id, { zones: e.target.value })} /></label>
                    <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:pt-6">
                      <label className="btn-ghost !min-h-10 cursor-pointer px-3 text-sm">{x.photo ? (x.cutout ? "Change photo (cut-out)" : "Change photo") : "Add photo"}<input type="file" accept="image/*" className="sr-only" onChange={(e) => p.photo(x.id, e.target.files?.[0])} /></label>
                      {x.photo && !x.cutout && <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" disabled={p.bgBusy === x.id} title="Cut the person out of the photo's background, on this device" onClick={() => p.cutOutExisting(x)}>{p.bgBusy === x.id ? "Cutting out…" : "Remove background"}</button>}
                    </div>
                    {minor && (
                      <label className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm sm:col-span-2 ${x.guardian ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100" : "border-red-500/40 bg-red-500/10 text-red-100"}`}>
                        <input type="checkbox" checked={!!x.guardian} onChange={(e) => p.setPerson(x.id, { guardian: e.target.checked })} className="h-5 w-5 accent-cyan" />Under 18 on the event date: a parent or guardian has agreed
                      </label>
                    )}
                    <div className="flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-4">
                      {x.review && <button type="button" className="btn !min-h-10 px-3 text-sm" onClick={() => p.setPerson(x.id, { review: false })}>Details are correct</button>}
                      <button type="button" className="btn-ghost !min-h-10 px-3 text-sm text-red-300" onClick={() => { p.setPeople((l) => l.filter((y) => y !== x)); setOpen(null); }}>Remove person</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-2.5 text-xs text-zinc-500">
          <span>{shown.length === p.people.length ? `${p.people.length} people` : `Showing ${shown.length} of ${p.people.length}`}</span>
          <label className="flex items-center gap-2" title="When you add a photo, the person is cut out of its background automatically. The first time downloads a small model.">
            <input type="checkbox" checked={p.autoBg} onChange={(e) => p.setAutoBg(e.target.checked)} className="h-4 w-4 accent-cyan" />Cut people out of new photos automatically
          </label>
        </div>
      </section>
    </div>
  );
}
