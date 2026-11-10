"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameBadge from "@/components/GameBadge";
import Select from "@/components/Select";
import { useXp } from "@/components/XpProvider";
import { maskAadhaar } from "@/lib/idcard/aadhaar";
import { scanAadhaar, stopOcr } from "@/lib/idcard/ocr";
import { posterFmt, suggest, themeById, THEMES, VIBES, type ThemeEntry } from "@/lib/idcard/themes";
import { FORMATS, ROLES, fmtOf, type Fmt, type Person, type Role, type Team, type Template } from "@/lib/idcard/types";
import { GAMES } from "@/lib/data";
import CardView, { type Ctx } from "./CardView";
import Editor from "./Editor";

const STORE = "eh-idstudio-v2"; // designs and team names only; people and photos are never saved
const STEPS = ["Event & teams", "People", "Design", "Print"];
const SAMPLE_TEAMS: Team[] = [{ id: "t1", name: "Konkan Kings" }, { id: "t2", name: "Deadly Duos" }, { id: "t3", name: "Pune Phantoms" }];
/** Demo roster: invented names, dates and card numbers. */
const SAMPLE_PEOPLE: Person[] = [
  { id: "KON-001", name: "Aarav Mehta", teamId: "t1", role: "Player", dob: "12/05/2003", gender: "Male", last4: "4471", photo: "/samples/people/aarav-mehta.webp", cutout: true },
  { id: "KON-002", name: "Diya Kulkarni", teamId: "t1", role: "Player", dob: "23/09/2004", gender: "Female", last4: "8802", photo: "/samples/people/diya-kulkarni.webp", cutout: true },
  { id: "KON-003", name: "Rohan Deshmukh", teamId: "t1", role: "Player", dob: "02/11/2002", gender: "Male", last4: "1936", photo: "/samples/people/rohan-deshmukh.webp", cutout: true },
  { id: "KON-004", name: "Sneha Iyer", teamId: "t1", role: "Substitute", dob: "14/01/2005", gender: "Female", last4: "5520", photo: "/samples/people/sneha-iyer.webp", cutout: true },
  { id: "KON-005", name: "Kabir Sheikh", teamId: "t1", role: "Coach", dob: "30/07/1995", gender: "Male", last4: "7714", photo: "/samples/people/kabir-sheikh.webp", cutout: true },
  { id: "DEA-001", name: "Vihaan Patil", teamId: "t2", role: "Player", dob: "08/03/2003", gender: "Male", last4: "3068", photo: "/samples/people/vihaan-patil.webp", cutout: true },
  { id: "DEA-002", name: "Ananya Nair", teamId: "t2", role: "Player", dob: "19/12/2003", gender: "Female", last4: "9245", photo: "/samples/people/ananya-nair.webp", cutout: true },
  { id: "DEA-003", name: "Ishita Joshi", teamId: "t2", role: "Substitute", dob: "27/06/2004", gender: "Female", last4: "6183", photo: "/samples/people/ishita-joshi.webp", cutout: true },
  { id: "DEA-004", name: "Arjun Reddy", teamId: "t2", role: "Manager", dob: "11/10/1992", gender: "Male", last4: "2857", photo: "/samples/people/arjun-reddy.webp", cutout: true },
  { id: "PUN-001", name: "Meera Pawar", teamId: "t3", role: "Player", dob: "05/04/2002", gender: "Female", last4: "4096", photo: "/samples/people/meera-pawar.webp", cutout: true },
  { id: "PUN-002", name: "Zoya Khan", teamId: "t3", role: "Player", dob: "21/08/2003", gender: "Female", last4: "7731", photo: "/samples/people/zoya-khan.webp", cutout: true },
  { id: "PUN-003", name: "Aditya Chavan", teamId: "t3", role: "Coach", dob: "16/02/1994", gender: "Male", last4: "1259", photo: "/samples/people/aditya-chavan.webp", cutout: true },
];
const DEMO_CARDS = [
  { file: "aarav-mehta", label: "Aarav Mehta" },
  { file: "diya-kulkarni", label: "Diya Kulkarni" },
  { file: "rohan-deshmukh", label: "Rohan Deshmukh" },
];
const uidT = () => `t${Date.now().toString(36)}${Math.floor(Math.random() * 1e3).toString(36)}`;
const prefix = (name: string) => (name.replace(/[^A-Za-z0-9]/g, "").slice(0, 3) || "ID").toUpperCase();

/** Photos are shrunk to a sensible size so a full roster stays light in memory and prints sharply. */
async function shrink(file: File, max = 800): Promise<{ url: string; cutout: boolean }> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const cv = document.createElement("canvas"); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bmp, 0, 0, cv.width, cv.height); bmp.close();
  // A cut-out has a transparent background. Keep it as a PNG; everything else becomes a smaller JPEG.
  const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
  let seen = 0, clear = 0;
  for (let i = 3; i < d.length; i += 4 * 37) { seen++; if (d[i] < 200) clear++; }
  const cutout = seen > 0 && clear / seen > 0.06;
  return { url: cutout ? cv.toDataURL("image/png") : cv.toDataURL("image/jpeg", 0.88), cutout };
}

interface Job { key: number; file: string; state: "queued" | "reading" | "done" | "error"; pct: number; note?: string }

export default function IdCardStudio() {
  const { award, addXp } = useXp();
  const [step, setStep] = useState(0);
  const [event, setEvent] = useState("Monsoon Clash Season 2");
  const [game, setGame] = useState("BGMI");
  const [organiser, setOrganiser] = useState("Konkan Gamers Guild");
  const [fmt, setFmt] = useState<Fmt>("wallet");
  const [teams, setTeams] = useState<Team[]>(SAMPLE_TEAMS);
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [people, setPeople] = useState<Person[]>(SAMPLE_PEOPLE);
  const [designTeam, setDesignTeam] = useState("t1");
  const [printTeam, setPrintTeam] = useState("all");
  const [vibe, setVibe] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string>("");
  const [consent, setConsent] = useState(false);
  const [scanTeam, setScanTeam] = useState("t1");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ready, setReady] = useState(false);
  const jobKey = useRef(0);
  const peopleRef = useRef(people); peopleRef.current = people;
  // A saved or removed team can leave a stale id behind; fall back to the first team so no dropdown is ever empty.
  const valid = (id: string) => (teams.some((t) => t.id === id) ? id : teams[0].id);

  // Restore saved designs. Only non-personal things are stored.
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) || "null");
      if (s) { if (s.fmt in FORMATS) setFmt(s.fmt); setEvent(s.event ?? event); setGame(s.game ?? game); setOrganiser(s.organiser ?? organiser); if (Array.isArray(s.teams) && s.teams.length) { setTeams(s.teams); setDesignTeam(s.teams[0].id); setScanTeam(s.teams[0].id); } if (s.templates) setTemplates(s.templates); }
    } catch {}
    setReady(true);
    return () => { stopOcr(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(STORE, JSON.stringify({ event, game, organiser, fmt, teams, templates })); } catch {} }, [ready, event, game, organiser, fmt, teams, templates]);

  // Every team always has a design: new teams get a theme chosen from their name.
  const tplFor = useCallback((t: Team): Template => templates[t.id] ?? { ...themeById(suggest(null, t.name, fmt))!.make(fmt), id: t.id }, [templates, fmt]);
  const teamById = (id: string) => teams.find((t) => t.id === id) ?? teams[0];
  const gameObj = GAMES.find((g) => g.short === game);

  const ctxFor = (p: Person): Ctx => ({ event, game, teamName: teamById(p.teamId)?.name ?? "", person: p });
  const nextId = (teamId: string, extra = 0) => `${prefix(teamById(teamId)?.name ?? "")}-${String(peopleRef.current.filter((p) => p.teamId === teamId).length + 1 + extra).padStart(3, "0")}`;
  const setPerson = (id: string, patch: Partial<Person>) => setPeople((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const addPerson = (teamId = teams[0].id, o: Partial<Person> = {}) => setPeople((l) => [...l, { id: nextId(teamId), name: "", teamId, role: "Player", ...o }]);

  // Aadhaar scanning: strictly one at a time, in the browser.
  const scan = async (files: FileList | File[] | null) => {
    if (!files || !consent) return;
    const target = valid(scanTeam);
    const list = Array.from(files as ArrayLike<File>).map((f) => ({ f, key: ++jobKey.current }));
    setJobs((j) => [...j, ...list.map(({ f, key }) => ({ key, file: f.name, state: "queued" as const, pct: 0 }))]);
    for (const { f, key } of list) {
      const upd = (p: Partial<Job>) => setJobs((j) => j.map((x) => (x.key === key ? { ...x, ...p } : x)));
      upd({ state: "reading" });
      try {
        const r = await scanAadhaar(f, (pct) => upd({ pct: Math.round(pct * 100) }));
        if (!r.name && !r.dob && !r.last4) { upd({ state: "error", note: "Could not read this card. Try a sharper, straight-on photo." }); continue; }
        setPeople((l) => [...l, { id: nextId(target, l.filter((p) => p.teamId === target).length - peopleRef.current.filter((p) => p.teamId === target).length), name: r.name ?? "", teamId: target, role: "Player", dob: r.dob ?? (r.yob ? `Year ${r.yob}` : undefined), gender: r.gender, last4: r.last4, source: r.source, review: r.source !== "qr" }]);
        upd({ state: "done", pct: 100, note: r.source === "qr" ? "Read from the QR code: exact." : "Read by OCR: please check the details." });
        addXp(5, r.source === "qr" ? "Card read from QR" : "Card read");
      } catch (e) { upd({ state: "error", note: "Reading failed. Check your connection for the first scan, then try again." }); }
    }
  };
  const trySample = async (file: string) => { const r = await fetch(`/samples/sample-card-${file}.png`); const b = await r.blob(); await scan([new File([b], `sample-card-${file}.png`, { type: "image/png" })]); };
  const photo = async (id: string, f?: File) => { if (!f) return; const r = await shrink(f); setPerson(id, { photo: r.url, cutout: r.cutout }); };

  const printable = useMemo(() => people.filter((p) => printTeam === "all" || p.teamId === printTeam), [people, printTeam]);
  const teamOpts = teams.map((t) => ({ value: t.id, label: t.name || "Untitled team" }));
  const dTeam = teamById(valid(designTeam));
  const teamPeople = people.filter((p) => p.teamId === dTeam?.id);
  const sample: Person = teamPeople.find((p) => p.id === previewId) ?? teamPeople[0] ?? { id: "ID-001", name: "Player Name", teamId: dTeam?.id ?? "", role: "Player" };
  const needReview = people.filter((p) => p.review).length;

  const applyTheme = (themeId: string, teamIds: string[]) => setTemplates((t) => { const n = { ...t }; for (const id of teamIds) { const cur = n[id] ?? tplFor(teamById(id)); n[id] = { ...themeById(themeId)!.make(fmtOf(cur)), id }; } return n; });

  const themeGrid = (list: ThemeEntry[], title: string) => {
    if (!dTeam) return null;
    const f = fmtOf(tplFor(dTeam));
    return (
      <div>
        <h3 className="mb-3 font-display text-lg font-bold text-white">{title} <span className="text-sm font-normal text-zinc-500">· {list.length}</span></h3>
        <ul className={`grid gap-3 ${f === "strip" ? "grid-cols-1 sm:grid-cols-2" : FORMATS[f].w < FORMATS[f].h ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"}`}>
          {list.map((th) => (
            <li key={th.id} className={vibe && !th.tags.includes(vibe) ? "opacity-35" : ""}>
              <button type="button" onClick={() => applyTheme(th.id, [dTeam.id])} className={`group w-full rounded-xl border p-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${tplFor(dTeam).theme === th.id ? "border-cyan" : "border-white/10 hover:border-white/30"}`} aria-label={`Use the ${th.name} theme`}>
                <CardView tpl={th.make(f)} ctx={{ event, game, teamName: dTeam.name, person: sample }} />
                <span className="mt-2 block text-center text-xs font-semibold text-zinc-300">{th.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

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
                <div>
                  <p className="mb-2 text-sm text-zinc-400">Card type <span className="text-zinc-500">(you can change it per team later)</span></p>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Card type">
                    {(Object.keys(FORMATS) as Fmt[]).map((k) => {
                      const f = FORMATS[k]; const r = f.w / f.h; const on = fmt === k;
                      return (
                        <button key={k} type="button" role="radio" aria-checked={on} onClick={() => { setFmt(k); setTemplates({}); }} className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${on ? "border-cyan bg-cyan/10" : "border-white/10 hover:border-white/30"}`}>
                          <span aria-hidden="true" className="relative grid place-items-center rounded-md border border-white/40 bg-white/5" style={{ width: r >= 1 ? Math.min(64, 22 * Math.min(r, 3)) : 40 * r + 6, height: r >= 1 ? Math.max(14, (r > 3 ? 14 : 22 * Math.min(r, 3)) / r) : 46 }}>{f.slot && <span className="absolute top-1 h-1 w-3 rounded-full border border-dashed border-white/70" />}</span>
                          <span className="text-sm font-semibold text-white">{f.label}</span>
                          <span className="text-[11px] leading-snug text-zinc-500">{f.note}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
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
                  <Select label="Add scanned people to" value={valid(scanTeam)} onChange={setScanTeam} options={teamOpts} searchable={false} />
                  <label className={`flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-4 text-center transition-colors ${consent ? "border-cyan/50 hover:bg-cyan/5" : "cursor-not-allowed border-white/10 opacity-50"}`}>
                    <span className="font-semibold text-white">{consent ? "Choose card images (you can pick many)" : "Tick the permission box first"}</span>
                    <span className="text-xs text-zinc-500">JPG, PNG or a phone photo. Front side with the name and date of birth.</span>
                    <input type="file" accept="image/*" multiple disabled={!consent} className="sr-only" onChange={(e) => { scan(e.target.files); e.target.value = ""; }} />
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-zinc-400">No card handy? Try a dummy sample card:</span>
                  {DEMO_CARDS.map((c) => (<button key={c.file} type="button" disabled={!consent} className="chip disabled:cursor-not-allowed disabled:opacity-40" onClick={() => trySample(c.file)}>{c.label}</button>))}
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
                <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-xl font-bold text-white">People ({people.length})</h2><button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => addPerson(valid(scanTeam))}>+ Add manually</button></div>
                {needReview > 0 && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{needReview} {needReview === 1 ? "person was" : "people were"} read from printed text (OCR). Check the details, then tap <strong>Looks right</strong>. Cards read from their QR code are exact and need no check.</p>}
                <ul className="space-y-3">
                  {people.map((p) => (
                    <li key={p.id} className={`grid gap-2 rounded-xl border p-3 sm:grid-cols-6 ${p.review ? "border-amber-500/40" : "border-white/10"}`}>
                      <input className="field sm:col-span-2" aria-label="Full name" placeholder="Full name" value={p.name} onChange={(e) => setPerson(p.id, { name: e.target.value })} />
                      <Select ariaLabel="Team" value={valid(p.teamId)} onChange={(v) => setPerson(p.id, { teamId: v })} options={teamOpts} searchable={false} className="sm:col-span-2" />
                      <Select ariaLabel="Role" value={p.role} onChange={(v) => setPerson(p.id, { role: v as Role })} options={ROLES.map((r) => ({ value: r, label: r }))} searchable={false} />
                      <button type="button" className="btn-ghost text-sm text-red-300" onClick={() => setPeople((l) => l.filter((x) => x.id !== p.id))} aria-label={`Remove ${p.name || "person"}`}>Remove</button>
                      <input className="field" aria-label="Date of birth" placeholder="Date of birth" value={p.dob ?? ""} onChange={(e) => setPerson(p.id, { dob: e.target.value })} />
                      <Select ariaLabel="Gender" value={p.gender ?? ""} onChange={(v) => setPerson(p.id, { gender: v || undefined })} options={[{ value: "", label: "Gender" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Transgender", label: "Transgender" }]} searchable={false} />
                      <input className="field" aria-label="ID number" placeholder="ID" value={p.id} onChange={(e) => { const v = e.target.value; setPeople((l) => l.map((x) => (x === p ? { ...x, id: v } : x))); }} />
                      <span className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-white/10 px-3 font-mono text-sm text-zinc-400" title="Only the last 4 digits are kept">{p.last4 ? maskAadhaar(p.last4) : "No Aadhaar"}{p.source && <span className={`rounded px-1.5 font-sans text-[10px] font-bold ${p.source === "qr" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-200"}`}>{p.source === "qr" ? "QR" : "OCR"}</span>}</span>
                      <label className="field flex cursor-pointer items-center text-sm text-zinc-400">{p.photo ? (p.cutout ? "Cut-out ✓ (change)" : "Photo ✓ (change)") : "Add photo"}<input type="file" accept="image/*" className="sr-only" onChange={(e) => photo(p.id, e.target.files?.[0])} /></label>
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
                  <div className="grid gap-3">
                    <Select label="Designing for team" value={dTeam.id} onChange={setDesignTeam} options={teamOpts} searchable={false} />
                    <Select label="Card type for this team" value={fmtOf(tplFor(dTeam))} onChange={(v) => setTemplates((t) => { const cur = tplFor(dTeam); return { ...t, [dTeam.id]: { ...(themeById(cur.theme ?? "") ?? themeById(suggest(null, dTeam.name, v as Fmt))!).make(v as Fmt), id: dTeam.id } }; })} options={(Object.keys(FORMATS) as Fmt[]).map((k) => ({ value: k, label: FORMATS[k].label, hint: `${FORMATS[k].w} x ${FORMATS[k].h} mm` }))} searchable={false} />
                    {fmtOf(tplFor(dTeam)) !== fmt && <p className="text-xs text-zinc-500">Changing the card type rebuilds this team&apos;s card from its theme. Your own edits to the layout are replaced.</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-zinc-400">Style assistant:</span>
                    {VIBES.map((v) => (<button key={v} type="button" className="chip capitalize" aria-pressed={vibe === v} onClick={() => setVibe(vibe === v ? null : v)}>{v}</button>))}
                    <button type="button" className="btn !min-h-9 px-3 text-sm" onClick={() => { applyTheme(suggest(vibe, dTeam.name, fmtOf(tplFor(dTeam))), [dTeam.id]); }}>Suggest for this team</button>
                    <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => setTemplates((t) => { const n = { ...t }; teams.forEach((x, i) => { const id = suggest(vibe, x.name + i, fmtOf(tplFor(x))); n[x.id] = { ...themeById(id)!.make(fmtOf(tplFor(x))), id: x.id }; }); return n; })}>Different theme for every team</button>
                  </div>
                </div>
                {posterFmt(fmtOf(tplFor(dTeam))) && themeGrid(THEMES.filter((t) => t.group === "poster" && !!t.fmts?.includes(fmtOf(tplFor(dTeam)))), "Themes drawn for this card type")}
                {!posterFmt(fmtOf(tplFor(dTeam))) && themeGrid(THEMES.filter((t) => t.group === "classic"), "Classic themes")}
                {!posterFmt(fmtOf(tplFor(dTeam))) && <p className="text-sm text-zinc-500">Want the poster-style cards (cut-out portraits, big type, ribbons)? Change the card type above to Poster card, Story card or Digital pass.</p>}
                <button type="button" className="btn-ghost text-sm" onClick={() => { const cur = tplFor(dTeam); setTemplates((t) => { const n = { ...t }; teams.forEach((x) => { n[x.id] = { ...cur, id: x.id, els: cur.els.map((e) => ({ ...e })) }; }); return n; }); }}>Copy this team&apos;s design to all teams</button>
              </section>
              <section className="card !p-4 sm:!p-6">
                <h3 className="mb-4 font-display text-lg font-bold text-white">Customise <span className="text-cyan">{dTeam.name}</span>&apos;s card</h3>
                <div className="mb-4 grid gap-3 sm:grid-cols-[18rem_1fr] sm:items-end">
                  <Select label="Preview with" value={sample.id} onChange={setPreviewId} options={teamPeople.map((p) => ({ value: p.id, label: p.name || p.id, hint: p.photo ? (p.cutout ? "cut-out" : "photo") : "no photo" }))} searchable={false} />
                  <p className="text-sm text-zinc-500">Uploaded photos appear on the card exactly as they will print. Add one here with &ldquo;Add photo&rdquo; in the toolbar, or in the People step. Transparent PNGs give the full cut-out look. The demo pictures are AI-generated cartoon avatars of invented people.</p>
                </div>
                <Editor tpl={tplFor(dTeam)} onChange={(t) => { setTemplates((s) => ({ ...s, [dTeam.id]: { ...t, id: dTeam.id } })); }} ctx={{ event, game, teamName: dTeam.name, person: sample }} onPhotoFile={(f) => photo(sample.id, f)} />
              </section>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="no-print mb-6 grid gap-3 sm:grid-cols-[16rem_auto_1fr] sm:items-end">
                <Select label="Print" value={printTeam === "all" ? "all" : valid(printTeam)} onChange={setPrintTeam} options={[{ value: "all", label: "All teams" }, ...teamOpts]} searchable={false} />
                <button type="button" className="btn" onClick={() => { award("card-shark", 20, "Card shark: printed your first ID cards"); window.print(); }}>Print {printable.length} {printable.length === 1 ? "card" : "cards"}</button>
                <p className="text-sm text-zinc-500">In the print window choose “Save as PDF” to keep a copy. Set margins to default and turn on background graphics if your browser asks.</p>
              </div>
              {needReview > 0 && <p className="no-print mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{needReview} scanned {needReview === 1 ? "person has" : "people have"} not been checked yet. Go back to People and tap Looks right.</p>}
              {(Object.keys(FORMATS) as Fmt[]).map((k) => {
                const group = printable.filter((p) => fmtOf(tplFor(teamById(p.teamId))) === k);
                if (!group.length) return null;
                const F = FORMATS[k];
                return (
                  <section key={k} className="mb-8" aria-label={F.label}>
                    <h2 className="no-print mb-3 font-display text-lg font-bold text-white">{F.label} <span className="text-sm font-normal text-zinc-500">· {F.w} x {F.h} mm · {group.length} {group.length === 1 ? "card" : "cards"}</span></h2>
                    {F.slot && <p className="no-print mb-3 text-sm text-zinc-500">Punch or cut inside the dashed slot at the top, then thread a lanyard or fit a clip. Print on thick card (250 gsm or more) or put the printout in a badge holder.</p>}
                    <div className="print-sheet grid gap-4" style={{ ["--w" as string]: `${F.w}mm`, ["--cols" as string]: F.cols, gridTemplateColumns: `repeat(auto-fill, minmax(${k === "strip" ? 260 : k === "wallet" ? 280 : 200}px, 1fr))` }}>
                      {group.map((p) => (
                        <div key={p.id + p.teamId} className="idcard-wrap w-full"><CardView tpl={tplFor(teamById(p.teamId))} ctx={ctxFor(p)} className="shadow-xl shadow-black/50" /></div>
                      ))}
                    </div>
                  </section>
                );
              })}
              {printable.length === 0 && <p className="card text-zinc-400">No people yet. Add some in the People step.</p>}
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
