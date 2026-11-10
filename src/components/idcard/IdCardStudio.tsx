"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameBadge from "@/components/GameBadge";
import Select from "@/components/Select";
import { useXp } from "@/components/XpProvider";
import { maskAadhaar } from "@/lib/idcard/aadhaar";
import { scanAadhaar, stopOcr } from "@/lib/idcard/ocr";
import { suggest, themeById, THEMES, VIBES } from "@/lib/idcard/themes";
import { ROLES, type Person, type Role, type Team, type Template } from "@/lib/idcard/types";
import { GAMES } from "@/lib/data";
import CardView, { type Ctx } from "./CardView";
import Editor from "./Editor";

const STORE = "eh-idstudio-v2"; // designs and team names only; people and photos are never saved
const STEPS = ["Event & teams", "People", "Design", "Print"];
const SAMPLE_TEAMS: Team[] = [{ id: "t1", name: "Sample Squad A" }, { id: "t2", name: "Sample Squad B" }];
const SAMPLE_PEOPLE: Person[] = [
  { id: "SSA-001", name: "Sample Player One", teamId: "t1", role: "Player" },
  { id: "SSA-002", name: "Sample Player Two", teamId: "t1", role: "Player" },
  { id: "SSA-003", name: "Sample Coach", teamId: "t1", role: "Coach" },
  { id: "SSB-001", name: "Sample Player Three", teamId: "t2", role: "Player" },
  { id: "SSB-002", name: "Sample Player Four", teamId: "t2", role: "Substitute" },
];
const uidT = () => `t${Date.now().toString(36)}${Math.floor(Math.random() * 1e3).toString(36)}`;
const prefix = (name: string) => (name.replace(/[^A-Za-z0-9]/g, "").slice(0, 3) || "ID").toUpperCase();

/** Photos are shrunk to a sensible size so a full roster stays light in memory and prints sharply. */
async function shrink(file: File, max = 500): Promise<string> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const cv = document.createElement("canvas"); cv.width = Math.round(bmp.width * s); cv.height = Math.round(bmp.height * s);
  cv.getContext("2d")!.drawImage(bmp, 0, 0, cv.width, cv.height); bmp.close();
  return cv.toDataURL("image/jpeg", 0.85);
}

interface Job { key: number; file: string; state: "queued" | "reading" | "done" | "error"; pct: number; note?: string }

export default function IdCardStudio() {
  const { award, addXp } = useXp();
  const [step, setStep] = useState(0);
  const [event, setEvent] = useState("Sample Campus Cup");
  const [game, setGame] = useState("BGMI");
  const [organiser, setOrganiser] = useState("Sample College Esports Club");
  const [teams, setTeams] = useState<Team[]>(SAMPLE_TEAMS);
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [people, setPeople] = useState<Person[]>(SAMPLE_PEOPLE);
  const [designTeam, setDesignTeam] = useState("t1");
  const [printTeam, setPrintTeam] = useState("all");
  const [vibe, setVibe] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [scanTeam, setScanTeam] = useState("t1");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ready, setReady] = useState(false);
  const jobKey = useRef(0);
  const peopleRef = useRef(people); peopleRef.current = people;

  // Restore saved designs. Only non-personal things are stored.
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) || "null");
      if (s) { setEvent(s.event ?? event); setGame(s.game ?? game); setOrganiser(s.organiser ?? organiser); if (Array.isArray(s.teams) && s.teams.length) { setTeams(s.teams); setDesignTeam(s.teams[0].id); setScanTeam(s.teams[0].id); } if (s.templates) setTemplates(s.templates); }
    } catch {}
    setReady(true);
    return () => { stopOcr(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(STORE, JSON.stringify({ event, game, organiser, teams, templates })); } catch {} }, [ready, event, game, organiser, teams, templates]);

  // Every team always has a design: new teams get a theme chosen from their name.
  const tplFor = useCallback((t: Team): Template => templates[t.id] ?? { ...themeById(suggest(null, t.name))!.make(), id: t.id }, [templates]);
  const teamById = (id: string) => teams.find((t) => t.id === id) ?? teams[0];
  const gameObj = GAMES.find((g) => g.short === game);

  const ctxFor = (p: Person): Ctx => ({ event, game, teamName: teamById(p.teamId)?.name ?? "", person: p });
  const nextId = (teamId: string, extra = 0) => `${prefix(teamById(teamId)?.name ?? "")}-${String(peopleRef.current.filter((p) => p.teamId === teamId).length + 1 + extra).padStart(3, "0")}`;
  const setPerson = (id: string, patch: Partial<Person>) => setPeople((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const addPerson = (teamId = teams[0].id, o: Partial<Person> = {}) => setPeople((l) => [...l, { id: nextId(teamId), name: "", teamId, role: "Player", ...o }]);

  // Aadhaar scanning: strictly one at a time, in the browser.
  const scan = async (files: FileList | null) => {
    if (!files || !consent) return;
    const list = Array.from(files).map((f) => ({ f, key: ++jobKey.current }));
    setJobs((j) => [...j, ...list.map(({ f, key }) => ({ key, file: f.name, state: "queued" as const, pct: 0 }))]);
    for (const { f, key } of list) {
      const upd = (p: Partial<Job>) => setJobs((j) => j.map((x) => (x.key === key ? { ...x, ...p } : x)));
      upd({ state: "reading" });
      try {
        const r = await scanAadhaar(f, (pct) => upd({ pct: Math.round(pct * 100) }));
        if (!r.name && !r.dob && !r.last4) { upd({ state: "error", note: "Could not read this card. Try a sharper, straight-on photo." }); continue; }
        setPeople((l) => [...l, { id: nextId(scanTeam, l.filter((p) => p.teamId === scanTeam).length - peopleRef.current.filter((p) => p.teamId === scanTeam).length), name: r.name ?? "", teamId: scanTeam, role: "Player", dob: r.dob ?? (r.yob ? `Year ${r.yob}` : undefined), gender: r.gender, last4: r.last4, review: true }]);
        upd({ state: "done", pct: 100 });
        addXp(5, "Card read");
      } catch (e) { upd({ state: "error", note: "Reading failed. Check your connection for the first scan, then try again." }); }
    }
  };
  const photo = async (id: string, f?: File) => { if (f) setPerson(id, { photo: await shrink(f) }); };

  const printable = useMemo(() => people.filter((p) => printTeam === "all" || p.teamId === printTeam), [people, printTeam]);
  const teamOpts = teams.map((t) => ({ value: t.id, label: t.name || "Untitled team" }));
  const dTeam = teamById(designTeam);
  const sample: Person = people.find((p) => p.teamId === dTeam?.id) ?? { id: "ID-001", name: "Player Name", teamId: dTeam?.id ?? "", role: "Player" };
  const needReview = people.filter((p) => p.review).length;

  const applyTheme = (themeId: string, teamIds: string[]) => setTemplates((t) => { const n = { ...t }; for (const id of teamIds) n[id] = { ...themeById(themeId)!.make(), id }; return n; });

  return (
    <div className="mt-8">
      {/* Stepper */}
      <ol className="no-print mb-8 grid grid-cols-4 gap-2" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => setStep(i)} aria-current={step === i ? "step" : undefined} className={`relative w-full rounded-xl border px-2 py-2.5 text-center text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan sm:text-sm ${step === i ? "border-cyan/60 bg-cyan/10 text-white" : i < step ? "border-white/10 bg-white/5 text-zinc-300" : "border-white/10 text-zinc-500 hover:text-zinc-300"}`}>
              <span className="mr-1 text-cyan">{i < step ? "✓" : i + 1}</span><span className="hidden sm:inline">{s}</span><span className="sm:hidden">{s.split(" ")[0]}</span>
            </button>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
          {step === 0 && (
            <div className="no-print grid gap-6 md:grid-cols-2">
              <section className="card space-y-4">
                <h2 className="font-display text-xl font-bold text-white">Event</h2>
                <label className="block text-sm text-zinc-400">Event name<input className="field mt-1" value={event} onChange={(e) => setEvent(e.target.value)} /></label>
                <Select label="Game" value={game} onChange={setGame} options={[...GAMES.map((g) => ({ value: g.short, label: g.name, icon: <GameBadge game={g} size="sm" /> })), { value: "Multi-game", label: "Several games" }]} />
                <label className="block text-sm text-zinc-400">Organiser<input className="field mt-1" value={organiser} onChange={(e) => setOrganiser(e.target.value)} /></label>
              </section>
              <section className="card space-y-3">
                <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold text-white">Teams</h2><button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => setTeams((t) => [...t, { id: uidT(), name: `Team ${t.length + 1}` }])}>+ Add team</button></div>
                <p className="text-sm text-zinc-400">Each team gets its own card design. People are assigned to a team from a dropdown in the next step.</p>
                <ul className="space-y-2">
                  {teams.map((t) => (
                    <li key={t.id} className="flex gap-2">
                      <input className="field" aria-label="Team name" value={t.name} onChange={(e) => setTeams((l) => l.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)))} />
                      <button type="button" disabled={teams.length < 2} className="btn-ghost px-3 text-sm text-red-300 disabled:opacity-40" aria-label={`Remove ${t.name}`} onClick={() => { setTeams((l) => l.filter((x) => x.id !== t.id)); setPeople((l) => l.map((p) => (p.teamId === t.id ? { ...p, teamId: teams.find((x) => x.id !== t.id)!.id } : p))); }}>Remove</button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {step === 1 && (
            <div className="no-print space-y-6">
              <section className="card space-y-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Read Aadhaar cards automatically</h2>
                  <p className="mt-1 text-sm text-zinc-400">Upload a photo, scan or photocopy of an Aadhaar card. Name, date of birth and gender are filled in for you. Everything is read <strong className="text-zinc-200">inside your browser</strong>: the picture is not uploaded or saved, and only the <strong className="text-zinc-200">last 4 digits</strong> of the number are kept, shown as XXXX XXXX 1234.</p>
                </div>
                <label className="flex items-start gap-3 rounded-xl border border-white/10 p-3 text-sm text-zinc-300">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 accent-cyan" />
                  <span>I have the card holder&apos;s permission to read their Aadhaar card for this event, and I will not share the card image.</span>
                </label>
                <div className="grid gap-3 sm:grid-cols-[16rem_1fr] sm:items-end">
                  <Select label="Add scanned people to" value={scanTeam} onChange={setScanTeam} options={teamOpts} searchable={false} />
                  <label className={`flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-4 text-center transition-colors ${consent ? "border-cyan/50 hover:bg-cyan/5" : "cursor-not-allowed border-white/10 opacity-50"}`}>
                    <span className="font-semibold text-white">{consent ? "Choose card images (you can pick many)" : "Tick the permission box first"}</span>
                    <span className="text-xs text-zinc-500">JPG, PNG or a phone photo. Front side with the name and date of birth.</span>
                    <input type="file" accept="image/*" multiple disabled={!consent} className="sr-only" onChange={(e) => { scan(e.target.files); e.target.value = ""; }} />
                  </label>
                </div>
                {jobs.length > 0 && (
                  <ul className="space-y-2" aria-live="polite">
                    {jobs.slice(-6).map((j) => (
                      <li key={j.key} className="rounded-lg border border-white/10 px-3 py-2 text-sm">
                        <div className="flex items-center justify-between gap-3"><span className="truncate text-zinc-300">{j.file}</span><span className={j.state === "error" ? "text-red-300" : j.state === "done" ? "text-emerald-300" : "text-zinc-400"}>{j.state === "reading" ? `Reading ${j.pct}%` : j.state === "queued" ? "Waiting" : j.state === "done" ? "Done" : "Failed"}</span></div>
                        {j.state === "reading" && <div className="mt-2 h-1 overflow-hidden rounded bg-white/10"><div className="h-full bg-gradient-to-r from-cyan to-purple transition-[width]" style={{ width: `${j.pct}%` }} /></div>}
                        {j.note && <p className="mt-1 text-xs text-zinc-500">{j.note}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="card space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-xl font-bold text-white">People ({people.length})</h2><button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => addPerson(scanTeam)}>+ Add manually</button></div>
                {needReview > 0 && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{needReview} {needReview === 1 ? "person was" : "people were"} read by scan. Check the details, then tap <strong>Looks right</strong>. Scans of photocopies can misread a letter.</p>}
                <ul className="space-y-3">
                  {people.map((p) => (
                    <li key={p.id} className={`grid gap-2 rounded-xl border p-3 sm:grid-cols-6 ${p.review ? "border-amber-500/40" : "border-white/10"}`}>
                      <input className="field sm:col-span-2" aria-label="Full name" placeholder="Full name" value={p.name} onChange={(e) => setPerson(p.id, { name: e.target.value })} />
                      <Select ariaLabel="Team" value={p.teamId} onChange={(v) => setPerson(p.id, { teamId: v })} options={teamOpts} searchable={false} className="sm:col-span-2" />
                      <Select ariaLabel="Role" value={p.role} onChange={(v) => setPerson(p.id, { role: v as Role })} options={ROLES.map((r) => ({ value: r, label: r }))} searchable={false} />
                      <button type="button" className="btn-ghost text-sm text-red-300" onClick={() => setPeople((l) => l.filter((x) => x.id !== p.id))} aria-label={`Remove ${p.name || "person"}`}>Remove</button>
                      <input className="field" aria-label="Date of birth" placeholder="Date of birth" value={p.dob ?? ""} onChange={(e) => setPerson(p.id, { dob: e.target.value })} />
                      <Select ariaLabel="Gender" value={p.gender ?? ""} onChange={(v) => setPerson(p.id, { gender: v || undefined })} options={[{ value: "", label: "Gender" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Transgender", label: "Transgender" }]} searchable={false} />
                      <input className="field" aria-label="ID number" placeholder="ID" value={p.id} onChange={(e) => { const v = e.target.value; setPeople((l) => l.map((x) => (x === p ? { ...x, id: v } : x))); }} />
                      <span className="flex min-h-11 items-center rounded-lg border border-white/10 px-3 font-mono text-sm text-zinc-400" title="Only the last 4 digits are kept">{p.last4 ? maskAadhaar(p.last4) : "No Aadhaar"}</span>
                      <label className="field flex cursor-pointer items-center text-sm text-zinc-400">{p.photo ? "Photo ✓ (change)" : "Add photo"}<input type="file" accept="image/*" className="sr-only" onChange={(e) => photo(p.id, e.target.files?.[0])} /></label>
                      {p.review ? <button type="button" className="btn !min-h-11 text-sm" onClick={() => setPerson(p.id, { review: false })}>Looks right</button> : <span />}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {step === 2 && dTeam && (
            <div className="no-print space-y-6">
              <section className="card space-y-4">
                <div className="grid gap-3 sm:grid-cols-[16rem_1fr] sm:items-end">
                  <Select label="Designing for team" value={dTeam.id} onChange={setDesignTeam} options={teamOpts} searchable={false} />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-zinc-400">Style assistant:</span>
                    {VIBES.map((v) => (<button key={v} type="button" className="chip capitalize" aria-pressed={vibe === v} onClick={() => setVibe(vibe === v ? null : v)}>{v}</button>))}
                    <button type="button" className="btn !min-h-9 px-3 text-sm" onClick={() => { applyTheme(suggest(vibe, dTeam.name), [dTeam.id]); }}>Suggest for this team</button>
                    <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => setTemplates((t) => { const n = { ...t }; teams.forEach((x, i) => { const id = suggest(vibe, x.name + i); n[x.id] = { ...themeById(id)!.make(), id: x.id }; }); return n; })}>Different theme for every team</button>
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-white">10 ready-made themes</h3>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {THEMES.map((th) => (
                    <li key={th.id} className={vibe && !th.tags.includes(vibe) ? "opacity-35" : ""}>
                      <button type="button" onClick={() => applyTheme(th.id, [dTeam.id])} className={`group w-full rounded-xl border p-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${templates[dTeam.id]?.name === th.name ? "border-cyan" : "border-white/10 hover:border-white/30"}`} aria-label={`Use the ${th.name} theme`}>
                        <CardView tpl={th.make()} ctx={{ event, game, teamName: dTeam.name, person: sample }} />
                        <span className="mt-2 block text-center text-xs font-semibold text-zinc-300">{th.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" className="btn-ghost text-sm" onClick={() => { const cur = tplFor(dTeam); setTemplates((t) => { const n = { ...t }; teams.forEach((x) => { n[x.id] = { ...cur, id: x.id, els: cur.els.map((e) => ({ ...e })) }; }); return n; }); }}>Copy this team&apos;s design to all teams</button>
              </section>
              <section className="card !p-4 sm:!p-6">
                <h3 className="mb-4 font-display text-lg font-bold text-white">Customise <span className="text-cyan">{dTeam.name}</span>&apos;s card</h3>
                <Editor tpl={tplFor(dTeam)} onChange={(t) => { setTemplates((s) => ({ ...s, [dTeam.id]: { ...t, id: dTeam.id } })); }} ctx={{ event, game, teamName: dTeam.name, person: sample }} />
              </section>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="no-print mb-6 grid gap-3 sm:grid-cols-[16rem_auto_1fr] sm:items-end">
                <Select label="Print" value={printTeam} onChange={setPrintTeam} options={[{ value: "all", label: "All teams" }, ...teamOpts]} searchable={false} />
                <button type="button" className="btn" onClick={() => { award("card-shark", 20, "Card shark: printed your first ID cards"); window.print(); }}>Print {printable.length} {printable.length === 1 ? "card" : "cards"}</button>
                <p className="text-sm text-zinc-500">In the print window choose “Save as PDF” to keep a copy. Set margins to default and turn on background graphics if your browser asks.</p>
              </div>
              {needReview > 0 && <p className="no-print mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{needReview} scanned {needReview === 1 ? "person has" : "people have"} not been checked yet. Go back to People and tap Looks right.</p>}
              <div className="print-sheet grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {printable.map((p) => (
                  <div key={p.id + p.teamId} className="idcard-wrap w-full"><CardView tpl={tplFor(teamById(p.teamId))} ctx={ctxFor(p)} className="shadow-xl shadow-black/50" /></div>
                ))}
                {printable.length === 0 && <p className="card text-zinc-400">No people yet. Add some in the People step.</p>}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="no-print mt-8 flex justify-between">
        <button type="button" className="btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>← Back</button>
        {step < 3 && <button type="button" className="btn" onClick={() => setStep((s) => s + 1)}>Next: {STEPS[step + 1]} →</button>}
      </div>
    </div>
  );
}
