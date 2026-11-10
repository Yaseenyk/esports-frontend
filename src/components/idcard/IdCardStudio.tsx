"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, m as motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useXp } from "@/components/XpProvider";
import { maskAadhaar, type AadhaarRead } from "@/lib/idcard/aadhaar";
import { buildBack } from "@/lib/idcard/back";
import { downloadBlob } from "@/lib/idcard/download";
import { buildProject, designToJson, parseDesign, parseProject } from "@/lib/idcard/project";
import { dominantColour, recolour } from "@/lib/idcard/recolor";
import { findDuplicates, isMinor } from "@/lib/idcard/roster";
import { eventKey, signPass } from "@/lib/idcard/sign";
import { suggest, themeById } from "@/lib/idcard/themes";
import { DEFAULT_INFO, FORMATS, ROLES, fmtOf, prettyDate, randomPassphrase, uid, type EventInfo, type Fmt, type Person, type Role, type Team, type Template } from "@/lib/idcard/types";
import { type Ctx } from "./CardView";
import type { Job } from "./PeopleStep";
import SetupStep from "./SetupStep";
import { StepSkeleton } from "@/components/skeleton/Scenes";

// Only the first step ships with the page. The others download when a step is opened (or when the browser is idle / the button is touched), each behind a skeleton shaped like the step.
const loadPeople = () => import("./PeopleStep");
const loadDesign = () => import("./DesignStep");
const loadPrint = () => import("./PrintPanel");
const PeopleStep = dynamic(loadPeople, { loading: () => <StepSkeleton kind="people" /> });
const DesignStep = dynamic(loadDesign, { loading: () => <StepSkeleton kind="design" /> });
const PrintPanel = dynamic(loadPrint, { loading: () => <StepSkeleton kind="print" /> });
const CloudPanel = dynamic(() => import("@/components/cloud/CloudPanel"), { loading: () => <div className="fixed inset-0 z-50 grid place-items-center bg-ink/85 p-6"><StepSkeleton kind="people" /></div> });
const PRELOAD = [() => undefined, loadPeople, loadDesign, loadPrint];

const STORE = "eh-idstudio-v3"; // designs and team names only; people and photos are never saved
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

export default function IdCardStudio() {
  const { award, addXp } = useXp();
  const [step, setStep] = useState(0);
  // Quietly fetch the next step while the person is still filling in this one, but never on a slow or data-saving connection.
  useEffect(() => {
    const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (c?.saveData || /^(slow-2g|2g)$/.test(c?.effectiveType ?? "")) return;
    const next = PRELOAD[step + 1]; if (!next) return;
    const id = window.setTimeout(() => void next(), 1200);
    return () => window.clearTimeout(id);
  }, [step]);
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
  const [info, setInfo] = useState<EventInfo>(DEFAULT_INFO);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  // Passes signed by the server once the event is saved online. A code is only trusted while the person still has the role it was signed for.
  const [cloudCodes, setCloudCodes] = useState<Record<string, { code: string; role: Role }>>({});
  const [cloudOpen, setCloudOpen] = useState(false);
  const [side, setSide] = useState<"front" | "back">("front");
  const [pdfAsk, setPdfAsk] = useState<{ file: File; wrong: boolean } | null>(null);
  const [pdfPass, setPdfPass] = useState("");
  const [bgBusy, setBgBusy] = useState<string | null>(null);
  const [bgNote, setBgNote] = useState<string | null>(null);
  const [autoBg, setAutoBg] = useState(false);
  const [ocrLang, setOcrLang] = useState("auto");
  const [projectMsg, setProjectMsg] = useState<string | null>(null);
  const jobKey = useRef(0);
  const peopleRef = useRef(people); peopleRef.current = people;
  // A saved or removed team can leave a stale id behind; fall back to the first team so no dropdown is ever empty.
  const valid = (id: string) => (teams.some((t) => t.id === id) ? id : teams[0].id);

  // Restore saved designs. Only non-personal things are stored.
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) || "null");
      if (s) { if (s.fmt in FORMATS) setFmt(s.fmt); setEvent(s.event ?? event); setGame(s.game ?? game); setOrganiser(s.organiser ?? organiser); if (Array.isArray(s.teams) && s.teams.length) { setTeams(s.teams); setDesignTeam(s.teams[0].id); setScanTeam(s.teams[0].id); } if (s.templates) setTemplates(s.templates); if (s.info) setInfo({ ...DEFAULT_INFO, ...s.info }); }
    } catch {}
    setReady(true);
    return () => { void import("@/lib/idcard/ocr").then((m) => m.stopOcr()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(STORE, JSON.stringify({ event, game, organiser, fmt, teams, templates, info })); } catch {} }, [ready, event, game, organiser, fmt, teams, templates, info]);
  // Signed passes need a passphrase; make one the first time.
  useEffect(() => { if (ready && info.sign && !info.passphrase) setInfo((i) => ({ ...i, passphrase: randomPassphrase() })); }, [ready, info.sign, info.passphrase]);

  // Every team always has a design: new teams get a theme chosen from their name.
  const withBack = (t: Template): Template => (t.back || fmtOf(t) === "strip" ? t : { ...t, back: buildBack(t) });
  const tplFor = useCallback((t: Team): Template => templates[t.id] ?? withBack({ ...themeById(suggest(null, t.name, fmt))!.make(fmt), id: t.id }), [templates, fmt]); // eslint-disable-line react-hooks/exhaustive-deps
  const teamById = (id: string) => teams.find((t) => t.id === id) ?? teams[0];

  const eventDay = useMemo(() => { const d = new Date(info.date + "T00:00:00"); return Number.isNaN(d.getTime()) ? new Date() : d; }, [info.date]);
  const minorOf = useCallback((p: Person) => isMinor(p.dob, eventDay), [eventDay]);
  const duplicates = useMemo(() => findDuplicates(people), [people]);
  const ctxFor = (p: Person): Ctx => ({ event, game, teamName: teamById(p.teamId)?.name ?? "", person: p, info: { organiser, date: prettyDate(info.date), venue: info.venue, emergency: info.emergency, rules: info.rules }, teamLogo: teamById(p.teamId)?.logo, sponsorLogo: info.sponsorLogo, qr: (cloudCodes[p.id]?.role === p.role ? cloudCodes[p.id]!.code : undefined) ?? qrMap[p.id], minor: minorOf(p) });
  useEffect(() => {
    let off = false;
    (async () => {
      if (!info.sign || !info.passphrase) { setQrMap({}); return; }
      const ek = eventKey(event), m: Record<string, string> = {};
      for (const p of people) m[p.id] = await signPass(info.passphrase, ek, p.id, p.role);
      if (!off) setQrMap(m);
    })();
    return () => { off = true; };
  }, [people, event, info.sign, info.passphrase]);
  const nextId = (teamId: string, extra = 0) => `${prefix(teamById(teamId)?.name ?? "")}-${String(peopleRef.current.filter((p) => p.teamId === teamId).length + 1 + extra).padStart(3, "0")}`;
  const setPerson = (id: string, patch: Partial<Person>) => setPeople((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const addPerson = (teamId = teams[0].id, o: Partial<Person> = {}) => setPeople((l) => [...l, { id: nextId(teamId), name: "", teamId, role: "Player", ...o }]);

  // Aadhaar scanning: strictly one at a time, in the browser. A PDF is drawn to pictures first.
  const readFile = async (f: File, upd: (p: Partial<Job>) => void, password?: string): Promise<AadhaarRead> => {
    const { scanAadhaar } = await import("@/lib/idcard/ocr"); // OCR, QR and PDF readers load only when someone scans
    if (!(f.type === "application/pdf" || /\.pdf$/i.test(f.name))) return scanAadhaar(f, (pct) => upd({ pct: Math.round(pct * 100) }), ocrLang);
    const { pdfToImages } = await import("@/lib/idcard/pdf");
    const res = await pdfToImages(f, password);
    if ("needPassword" in res) throw Object.assign(new Error("password"), { needPassword: true, wrong: res.wrong });
    let best: AadhaarRead = {};
    for (const [i, img] of res.images.entries()) {
      const r = await scanAadhaar(new File([img], `${f.name}-page${i + 1}.png`, { type: "image/png" }), (pct) => upd({ pct: Math.round(pct * 100) }), ocrLang);
      if (r.name) return r;
      if (!best.name && (r.dob || r.last4)) best = r;
    }
    return best;
  };
  const scan = async (files: FileList | File[] | null, password?: string) => {
    if (!files || !consent) return;
    const target = valid(scanTeam);
    const list = Array.from(files as ArrayLike<File>).map((f) => ({ f, key: ++jobKey.current }));
    setJobs((j) => [...j, ...list.map(({ f, key }) => ({ key, file: f.name, state: "queued" as const, pct: 0 }))]);
    for (const { f, key } of list) {
      const upd = (p: Partial<Job>) => setJobs((j) => j.map((x) => (x.key === key ? { ...x, ...p } : x)));
      upd({ state: "reading" });
      try {
        const r = await readFile(f, upd, password);
        if (!r.name && !r.dob && !r.last4) { upd({ state: "error", note: "Could not read this card. Try a sharper, straight-on photo." }); continue; }
        setPeople((l) => [...l, { id: nextId(target, l.filter((p) => p.teamId === target).length - peopleRef.current.filter((p) => p.teamId === target).length), name: r.name ?? "", teamId: target, role: "Player", dob: r.dob ?? (r.yob ? `Year ${r.yob}` : undefined), gender: r.gender, last4: r.last4, source: r.source, verified: r.verified, review: r.source !== "qr" || r.verified === "invalid" }]);
        upd({ state: "done", pct: 100, note: r.source === "qr" ? (r.verified === "valid" ? "Read from the QR code. UIDAI signature verified." : r.verified === "invalid" ? "Read from the QR code, but the UIDAI signature did NOT match. The QR may have been edited: check this person." : "Read from the QR code: exact. (UIDAI signature not checked: no certificate installed.)") : "Read by OCR: please check the details." });
        setPdfAsk(null); setPdfPass("");
        addXp(5, r.source === "qr" ? "Card read from QR" : "Card read");
      } catch (e) {
        const err = e as { needPassword?: boolean; wrong?: boolean };
        if (err?.needPassword) { upd({ state: "error", note: err.wrong ? "That password did not open the PDF." : "This PDF is protected. Enter its password below." }); setPdfAsk({ file: f, wrong: !!err.wrong }); }
        else upd({ state: "error", note: "Reading failed. Check your connection for the first scan, then try again." });
      }
    }
  };
  const trySample = async (file: string) => { const r = await fetch(`/samples/sample-card-${file}.png`); const b = await r.blob(); await scan([new File([b], `sample-card-${file}.png`, { type: "image/png" })]); };
  const cutOut = async (id: string, blob: Blob) => {
    setBgBusy(id); setBgNote("Starting…");
    try {
      const { removeBackground } = await import("@/lib/idcard/bgremove");
      const out = await removeBackground(blob, setBgNote);
      const r = await shrink(new File([out], "cutout.png", { type: "image/png" }), 900);
      setPerson(id, { photo: r.url, cutout: true });
      setBgNote("Background removed.");
    } catch { setBgNote("Could not remove the background here. Upload a transparent PNG instead."); }
    finally { setBgBusy(null); }
  };
  const photo = async (id: string, f?: File) => {
    if (!f) return;
    const r = await shrink(f); setPerson(id, { photo: r.url, cutout: r.cutout });
    if (autoBg && !r.cutout) await cutOut(id, f);
  };
  const cutOutExisting = async (p: Person) => { if (!p.photo) return; const blob = await (await fetch(p.photo)).blob(); await cutOut(p.id, blob); };

  const printable = useMemo(() => people.filter((p) => printTeam === "all" || p.teamId === printTeam), [people, printTeam]);
  const teamOpts = teams.map((t) => ({ value: t.id, label: t.name || "Untitled team" }));
  const dTeam = teamById(valid(designTeam));
  useEffect(() => { setSide("front"); }, [designTeam]);
  const teamPeople = people.filter((p) => p.teamId === dTeam?.id);
  const sample: Person = teamPeople.find((p) => p.id === previewId) ?? teamPeople[0] ?? { id: "ID-001", name: "Player Name", teamId: dTeam?.id ?? "", role: "Player" };
  const needReview = people.filter((p) => p.review).length;

  const applyTheme = (themeId: string, teamIds: string[]) => setTemplates((t) => { const n = { ...t }; for (const id of teamIds) { const cur = n[id] ?? tplFor(teamById(id)); n[id] = withBack({ ...themeById(themeId)!.make(fmtOf(cur)), id }); } return n; });

  const curTpl = dTeam ? tplFor(dTeam) : (undefined as unknown as Template);
  const editView: Template = side === "back" && curTpl?.back ? { ...curTpl, id: `${curTpl.id}:back`, bg: curTpl.back.bg, els: curTpl.back.els, back: undefined } : curTpl;
  const onEdit = (t: Template) => setTemplates((s) => {
    const base = s[dTeam.id] ?? tplFor(dTeam);
    return { ...s, [dTeam.id]: side === "back" && base.back ? { ...base, back: { bg: t.bg, els: t.els } } : { ...t, id: dTeam.id, back: base.back } };
  });
  const toggleRoleBar = () => setTemplates((s) => {
    const base = s[dTeam.id] ?? tplFor(dTeam);
    const has = base.els.some((e) => e.id.startsWith("rolebar"));
    const els = has ? base.els.filter((e) => !e.id.startsWith("rolebar")) : [...base.els, { id: `rolebar${uid()}`, kind: "rect" as const, x: 0, y: fmtOf(base) === "strip" ? 86 : 97.6, w: 100, h: fmtOf(base) === "strip" ? 14 : 2.4, rot: 0, opacity: 1, fill: "#22d3ee", roleColor: true }];
    return { ...s, [dTeam.id]: { ...base, els } };
  });
  const recolourFromLogo = async () => {
    if (!dTeam.logo) return;
    const c = await dominantColour(dTeam.logo);
    if (!c) return;
    setTemplates((s) => { const base = s[dTeam.id] ?? tplFor(dTeam); const next = recolour(base, c); return { ...s, [dTeam.id]: next.back ? { ...next, back: buildBack(next) } : next }; });
  };

  // ---- project and design files
  const saveProject = () => {
    const withPass = info.sign && !!info.passphrase && window.confirm("Include the signing passphrase in the file?\n\nAnyone who has the file could then make valid passes. Choose Cancel to leave it out (you will need to enter it again after opening the file).");
    downloadBlob(new Blob([JSON.stringify(buildProject({ event, game, organiser, fmt, info, teams, templates, people }, withPass))], { type: "application/json" }), `${eventKey(event)}-project.json`);
    setProjectMsg(`Saved. The file holds ${people.length} ${people.length === 1 ? "person" : "people"} with their birth dates and photos, so keep it private.`);
  };
  const openProject = async (f?: File) => {
    if (!f) return;
    const r = parseProject(await f.text());
    if ("error" in r) { setProjectMsg(r.error); return; }
    if (people.length > 0 && !window.confirm("Opening a project replaces everything you have here. Continue?")) return;
    const pj = r.project;
    setEvent(pj.event.name); setGame(pj.event.game); setOrganiser(pj.event.organiser); setFmt(pj.event.fmt);
    setTeams(pj.teams); setTemplates(pj.templates); setPeople(pj.people);
    setInfo((cur) => ({ ...DEFAULT_INFO, ...pj.info, passphrase: pj.info.passphrase || cur.passphrase || randomPassphrase() }));
    setDesignTeam(pj.teams[0].id); setScanTeam(pj.teams[0].id); setPrintTeam("all"); setPreviewId(""); setStep(0);
    setProjectMsg(`Opened “${pj.event.name}”: ${pj.people.length} people in ${pj.teams.length} teams.${pj.info.passphrase ? "" : " The signing passphrase was not in the file; a new one was made. Enter your old one in More options if you need it."}`);
  };
  const saveDesign = () => downloadBlob(new Blob([designToJson(curTpl)], { type: "application/json" }), `${(dTeam.name || "team").replace(/[^A-Za-z0-9]+/g, "-").toLowerCase()}-design.json`);
  const loadDesign = async (f: File) => {
    const r = parseDesign(await f.text());
    if ("error" in r) { setProjectMsg(r.error); return; }
    setTemplates((t) => ({ ...t, [dTeam.id]: withBack({ ...r.design, id: dTeam.id }) }));
    setProjectMsg(`Design loaded for ${dTeam.name}.`);
  };

  // ---- design step helpers
  const changeFormat = (v: Fmt) => setTemplates((t) => { const cur = tplFor(dTeam); return { ...t, [dTeam.id]: withBack({ ...(themeById(cur.theme ?? "") ?? themeById(suggest(null, dTeam.name, v))!).make(v), id: dTeam.id }) }; });
  const sameForAll = () => setTemplates((t) => { const n = { ...t }; teams.forEach((x) => { n[x.id] = { ...curTpl, id: x.id, els: curTpl.els.map((e) => ({ ...e })), back: curTpl.back ? { bg: curTpl.back.bg, els: curTpl.back.els.map((e) => ({ ...e })) } : undefined }; }); return n; });
  const differentPerTeam = () => setTemplates((t) => { const n = { ...t }; teams.forEach((x, i) => { const id = suggest(vibe, x.name + i, fmtOf(tplFor(x))); n[x.id] = withBack({ ...themeById(id)!.make(fmtOf(tplFor(x))), id: x.id }); }); return n; });

  const stepMeta = [`${teams.length} ${teams.length === 1 ? "team" : "teams"}`, `${people.length} ${people.length === 1 ? "person" : "people"}`, FORMATS[fmt].label, `${printable.length} ${printable.length === 1 ? "card" : "cards"}`];
  const hint = ["Next you will add the people on each team.", needReview > 0 ? `${needReview} ${needReview === 1 ? "person needs" : "people need"} a quick check.` : `${people.length} people ready.`, "Last step: print or download the cards.", ""][step];

  return (
    <div className="studio">
      <header className="no-print mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">ID cards <span className="text-cyan">&amp;</span> passes</h1>
        <p className="text-sm text-zinc-400"><span className="sm:hidden">Teams, people, design, print. Runs in your browser; demo data is loaded.</span><span className="hidden sm:inline">Set up your teams, add people (scan Aadhaar cards or import a sheet), design a card for each team, then print or download. Everything stays in your browser. Demo data is loaded so you can try it.</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => setCloudOpen(true)} title="Save this event online, check guests in live, invite players">Online</button>
          <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={saveProject} title="Download this event (details, teams, people, photos and designs) as one file">Save project</button>
          <label className="btn-ghost !min-h-9 cursor-pointer px-3 text-sm" title="Open a project file you saved before">Open project<input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => { openProject(e.target.files?.[0]); e.target.value = ""; }} /></label>
        </div>
      </header>
      {projectMsg && <p className="no-print mb-3 flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200" role="status"><span>{projectMsg}</span><button type="button" aria-label="Dismiss" className="shrink-0 text-zinc-400 hover:text-white" onClick={() => setProjectMsg(null)}>×</button></p>}

      <ol className="no-print mb-5 grid grid-cols-4 gap-1.5 sm:gap-2" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => setStep(i)} onPointerEnter={() => void PRELOAD[i]()} onFocus={() => void PRELOAD[i]()} onTouchStart={() => void PRELOAD[i]()} aria-current={step === i ? "step" : undefined} aria-label={`${s}, ${stepMeta[i]}`} className={`flex w-full flex-col items-center gap-1 rounded-xl border px-1.5 py-2 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan sm:flex-row sm:gap-3 sm:px-3 sm:text-left ${step === i ? "border-cyan/60 bg-[#0c1d27]" : "border-white/10 bg-[#0b0f15] hover:border-white/25"}`}>
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold sm:h-7 sm:w-7 ${step === i ? "bg-cyan text-ink" : i < step ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-zinc-300"}`}>{i < step ? "✓" : i + 1}</span>
              <span className="min-w-0"><span className={`block truncate text-xs font-semibold sm:text-sm ${step === i ? "text-white" : "text-zinc-200"}`}><span className="sm:hidden">{s.split(" ")[0]}</span><span className="hidden sm:inline">{s}</span></span><span className="hidden truncate text-[11px] text-zinc-400 sm:block">{stepMeta[i]}</span></span>
            </button>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
          {step === 0 && <SetupStep event={event} setEvent={setEvent} game={game} setGame={setGame} organiser={organiser} setOrganiser={setOrganiser} fmt={fmt} onFmt={(f) => { setFmt(f); setTemplates({}); }} teams={teams} setTeams={setTeams} setPeople={setPeople} info={info} setInfo={setInfo} />}
          {step === 1 && <PeopleStep ocrLang={ocrLang} setOcrLang={setOcrLang} people={people} teams={teams} teamOpts={teamOpts} valid={valid} scanTeam={scanTeam} setScanTeam={setScanTeam} consent={consent} setConsent={setConsent} jobs={jobs} scan={scan} trySample={trySample} pdfAsk={pdfAsk} pdfPass={pdfPass} setPdfPass={setPdfPass} setPeople={setPeople} setTeams={setTeams} setPerson={setPerson} addPerson={addPerson} minorOf={minorOf} duplicates={duplicates} photo={photo} cutOutExisting={cutOutExisting} bgBusy={bgBusy} bgNote={bgNote} autoBg={autoBg} setAutoBg={setAutoBg} />}
          {step === 2 && dTeam && <DesignStep teamOpts={teamOpts} dTeam={dTeam} setDesignTeam={setDesignTeam} curTpl={curTpl} editView={editView} onEdit={onEdit} ctxFor={ctxFor} sample={sample} teamPeople={teamPeople} setPreviewId={setPreviewId} side={side} setSide={setSide} vibe={vibe} setVibe={setVibe} onFormat={changeFormat} applyTheme={(id) => applyTheme(id, [dTeam.id])} surprise={() => applyTheme(suggest(vibe, dTeam.name, fmtOf(curTpl)), [dTeam.id])} sameForAll={sameForAll} differentPerTeam={differentPerTeam} addBack={() => setTemplates((t) => ({ ...t, [dTeam.id]: withBack(curTpl) }))} rebuildBack={() => setTemplates((t) => ({ ...t, [dTeam.id]: { ...curTpl, back: buildBack(curTpl) } }))} toggleRoleBar={toggleRoleBar} roleBarOn={curTpl.els.some((e) => e.id.startsWith("rolebar"))} recolourFromLogo={recolourFromLogo} setTeamLogo={(logo) => setTeams((l) => l.map((x) => (x.id === dTeam.id ? { ...x, logo } : x)))} photoForSample={(f) => photo(sample.id, f)} onSaveDesign={saveDesign} onLoadDesign={loadDesign} />}
          {step === 3 && (
            <PrintPanel people={printable} allPeople={people} teams={teams} teamOpts={teamOpts} printTeam={printTeam === "all" ? "all" : valid(printTeam)} setPrintTeam={setPrintTeam} tplFor={tplFor} teamById={teamById} ctxFor={ctxFor} event={event} info={info} minorOf={minorOf} duplicates={duplicates} needReview={needReview} onPrinted={() => award("card-shark", 20, "Card shark: printed your first ID cards")} />
          )}
        </motion.div>
      </AnimatePresence>

      <nav aria-label="Step navigation" className="no-print sticky bottom-3 z-30 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#070a0f] px-3 py-2.5 shadow-[0_8px_24px_-8px_rgba(0,0,0,.9)] sm:bottom-3">
        <button type="button" className="btn-ghost !min-h-10 px-4 text-sm" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>← Back</button>
        <p className="hidden min-w-0 truncate text-sm text-zinc-400 sm:block">{hint}</p>
        {step < 3 ? <button type="button" className="btn !min-h-10 px-5 text-sm" onClick={() => setStep((s) => s + 1)}>Next: {STEPS[step + 1]} →</button> : <span />}
      </nav>
      {cloudOpen && (
        <CloudPanel
          snapshot={{ event, game, organiser, info, teams, people }}
          minorOf={minorOf}
          onClose={() => setCloudOpen(false)}
          onCodes={(codes) => setCloudCodes(Object.fromEntries(Object.entries(codes).map(([id, code]) => [id, { code, role: peopleRef.current.find((p) => p.id === id)?.role ?? "Player" }])))}
          onPeople={(add) => setPeople((l) => [...l, ...add.filter((a) => !l.some((x) => x.id === a.id))])}
          onLoaded={(l) => { setEvent(l.details.name); setGame(l.details.game || game); setOrganiser(l.details.organiser || organiser); setInfo((i) => ({ ...i, date: l.details.date || i.date, venue: l.details.venue || i.venue, emergency: l.details.emergency || i.emergency, rules: l.details.rules || i.rules })); setTeams(l.teams.length ? l.teams : teams); setPeople(l.people); setTemplates({}); setStep(0); }}
        />
      )}
    </div>
  );
}
