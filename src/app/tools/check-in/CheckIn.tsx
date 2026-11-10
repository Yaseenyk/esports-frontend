"use client";

import jsQR from "jsqr";
import { AnimatePresence, m as motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useXp } from "@/components/XpProvider";
import { downloadBlob } from "@/lib/idcard/download";
import { findQr } from "@/lib/idcard/qr";
import { parsePass, verifyPass } from "@/lib/idcard/sign";
import { ROLE_COLOURS } from "@/lib/idcard/types";

interface PackPerson { id: string; name: string; team: string; role: keyof typeof ROLE_COLOURS; zones: string; minor: boolean; guardian: boolean; thumb?: string }
interface Pack { v: number; eventKey: string; event: string; date: string; signed: boolean; people: PackPerson[] }
interface Result { kind: "ok" | "bad" | "again"; title: string; sub: string; person?: PackPerson; at?: string }
type Log = Record<string, string>; // person id -> ISO time

const PACK = "eh-checkin-pack-v1";
const LOGKEY = (k: string) => `eh-checkin-log-${k}`;
const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function CheckIn() {
  const { award } = useXp();
  const [pack, setPack] = useState<Pack | null>(null);
  const [pass, setPass] = useState("");
  const [log, setLog] = useState<Log>({});
  const [res, setRes] = useState<Result | null>(null);
  const [camera, setCamera] = useState<"off" | "on" | "error">("off");
  const [manual, setManual] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const last = useRef({ code: "", at: 0 });
  const state = useRef({ pack, pass, log });
  state.current = { pack, pass, log };

  useEffect(() => {
    try { const p = JSON.parse(localStorage.getItem(PACK) || "null"); if (p?.people) setPack(p); setPass(sessionStorage.getItem("eh-checkin-pass") || ""); } catch {}
  }, []);
  useEffect(() => { if (pack) try { setLog(JSON.parse(localStorage.getItem(LOGKEY(pack.eventKey)) || "{}")); } catch { setLog({}); } }, [pack]);
  useEffect(() => { try { sessionStorage.setItem("eh-checkin-pass", pass); } catch {} }, [pass]);

  const check = useCallback(async (code: string) => {
    const { pack: pk, pass: pw, log: lg } = state.current;
    if (!pk) return;
    const parsed = parsePass(code);
    if (!parsed) { setRes({ kind: "bad", title: "Not a pass from this tool", sub: "The code is not in the pass format." }); return; }
    const person = pk.people.find((p) => p.id === parsed.id);
    if (!person) { setRes({ kind: "bad", title: "Unknown person", sub: `${parsed.id} is not in this event's pack.` }); return; }
    if (pk.signed) {
      if (!pw) { setRes({ kind: "bad", title: "Enter the passphrase first", sub: "Signed passes can only be checked with the event passphrase.", person }); return; }
      const v = await verifyPass(pw, pk.eventKey, person.role, code);
      if (!v.ok) { setRes({ kind: "bad", title: v.reason === "wrong-event" ? "Pass is for another event" : "Fake or edited pass", sub: v.reason === "bad-signature" ? "The signature does not match. Either the passphrase is wrong or the card was copied or changed." : "This card belongs to a different event.", person }); try { navigator.vibrate?.([120, 60, 120]); } catch {} return; }
    }
    const prior = lg[person.id];
    if (prior) { setRes({ kind: "again", title: "Already checked in", sub: `Checked in at ${time(prior)}`, person, at: prior }); try { navigator.vibrate?.(80); } catch {} return; }
    const now = new Date().toISOString();
    const next = { ...lg, [person.id]: now };
    setLog(next);
    try { localStorage.setItem(LOGKEY(pk.eventKey), JSON.stringify(next)); } catch {}
    setRes({ kind: "ok", title: "Genuine pass", sub: `Checked in at ${time(now)}`, person, at: now });
    try { navigator.vibrate?.(40); } catch {}
    award("gatekeeper", 15, "Gatekeeper: checked in your first guest");
  }, [award]);

  // Camera scanning: look for a QR a few times a second.
  useEffect(() => {
    if (camera !== "on") return;
    let off = false, timer: ReturnType<typeof setInterval>;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (off) { s.getTracks().forEach((t) => t.stop()); return; }
        stream.current = s;
        const v = video.current!; v.srcObject = s; await v.play();
        const cv = document.createElement("canvas"); const ctx = cv.getContext("2d", { willReadFrequently: true })!;
        timer = setInterval(() => {
          if (!v.videoWidth) return;
          cv.width = v.videoWidth; cv.height = v.videoHeight; ctx.drawImage(v, 0, 0);
          const d = ctx.getImageData(0, 0, cv.width, cv.height);
          const r = jsQR(d.data, d.width, d.height, { inversionAttempts: "dontInvert" });
          if (r?.data && (r.data !== last.current.code || Date.now() - last.current.at > 4000)) { last.current = { code: r.data, at: Date.now() }; check(r.data); }
        }, 250);
      } catch { setCamera("error"); }
    })();
    return () => { off = true; clearInterval(timer); stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; };
  }, [camera, check]);

  const loadPack = async (f?: File) => {
    if (!f) return;
    try {
      const p = JSON.parse(await f.text()) as Pack;
      if (!p.people || !p.eventKey) throw new Error("bad");
      setPack(p); setRes(null);
      try { localStorage.setItem(PACK, JSON.stringify(p)); } catch {}
    } catch { setRes({ kind: "bad", title: "That is not a check-in pack", sub: "Make one in the ID card tool, on the Print step." }); }
  };
  const scanPhoto = async (f?: File) => {
    if (!f) return;
    const code = await findQr(f);
    if (!code) { setRes({ kind: "bad", title: "No QR code found", sub: "Try a sharper, closer photo of the card's QR code." }); return; }
    check(code);
  };
  const exportLog = () => {
    if (!pack) return;
    const rows = pack.people.map((p) => [p.id, p.name, p.team, p.role, p.zones, log[p.id] ? new Date(log[p.id]).toLocaleString("en-GB") : ""].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    downloadBlob(new Blob([["id,name,team,role,zones,checked_in", ...rows].join("\r\n")], { type: "text/csv" }), `${pack.eventKey}-attendance.csv`);
  };

  const done = pack ? pack.people.filter((p) => log[p.id]).length : 0;
  const tone = res?.kind === "ok" ? "border-emerald-400/60 bg-emerald-500/15" : res?.kind === "again" ? "border-amber-400/60 bg-amber-500/15" : "border-red-400/60 bg-red-500/15";

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[22rem_1fr]">
      <div className="space-y-4">
        <section className="card space-y-3">
          <h2 className="font-display text-lg font-bold text-white">1. Event pack</h2>
          {pack ? <p className="text-sm text-zinc-300"><strong className="text-white">{pack.event}</strong><br />{pack.people.length} people · {pack.signed ? "signed passes" : "unsigned passes"}</p> : <p className="text-sm text-zinc-400">Load the check-in pack file made on the Print step of the ID card tool.</p>}
          <label className="btn-ghost !min-h-10 cursor-pointer px-4 text-sm">{pack ? "Load a different pack" : "Load check-in pack"}<input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => { loadPack(e.target.files?.[0]); e.target.value = ""; }} /></label>
        </section>
        <section className="card space-y-3">
          <h2 className="font-display text-lg font-bold text-white">2. Passphrase</h2>
          <input type="password" autoComplete="off" className="field font-mono" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Event passphrase" aria-label="Event passphrase" />
          <p className="text-xs text-zinc-500">Kept on this device for this session only.</p>
        </section>
        <section className="card space-y-3">
          <h2 className="font-display text-lg font-bold text-white">3. Scan</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn !min-h-10 px-4 text-sm" disabled={!pack} onClick={() => setCamera(camera === "on" ? "off" : "on")}>{camera === "on" ? "Stop camera" : "Start camera"}</button>
            <label className={`btn-ghost !min-h-10 px-4 text-sm ${pack ? "cursor-pointer" : "pointer-events-none opacity-40"}`}>Scan a photo<input type="file" accept="image/*" className="sr-only" onChange={(e) => { scanPhoto(e.target.files?.[0]); e.target.value = ""; }} /></label>
          </div>
          {camera === "error" && <p className="text-sm text-red-300">The camera could not start. Allow camera access, or use Scan a photo.</p>}
          {camera === "on" && <video ref={video} playsInline muted className="aspect-square w-full rounded-xl border border-white/10 bg-black object-cover" />}
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (manual.trim()) { check(manual.trim()); setManual(""); } }}>
            <input className="field font-mono text-sm" value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Or paste the code" aria-label="Pass code" disabled={!pack} />
            <button type="submit" className="btn-ghost px-3 text-sm" disabled={!pack || !manual.trim()}>Check</button>
          </form>
        </section>
      </div>

      <div className="space-y-4">
        <div aria-live="assertive">
          <AnimatePresence mode="wait">
            {res ? (
              <motion.section key={res.title + (res.at ?? "") + (res.person?.id ?? "")} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`rounded-3xl border-2 p-5 sm:p-7 ${tone}`}>
                <p className="font-display text-2xl font-bold text-white sm:text-4xl">{res.kind === "ok" ? "✓ " : res.kind === "again" ? "↻ " : "✕ "}{res.title}</p>
                <p className="mt-1 text-zinc-200">{res.sub}</p>
                {res.person && (
                  <div className="mt-5 flex items-center gap-4">
                    {res.person.thumb ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={res.person.thumb} alt="" className="h-28 w-24 rounded-xl border border-white/20 object-cover" /> : <span className="grid h-28 w-24 place-items-center rounded-xl border border-white/20 bg-white/5 text-3xl font-bold text-white/60">{res.person.name.slice(0, 1)}</span>}
                    <div className="min-w-0">
                      <p className="truncate font-display text-2xl font-bold text-white">{res.person.name}</p>
                      <p className="text-zinc-200">{res.person.team}</p>
                      <p className="mt-2 flex flex-wrap items-center gap-2"><span className="rounded-full px-3 py-1 text-sm font-bold text-ink" style={{ background: ROLE_COLOURS[res.person.role] }}>{res.person.role}</span>{res.person.zones && <span className="rounded-full border border-white/30 px-3 py-1 text-sm text-white">{res.person.zones}</span>}{res.person.minor && <span className="rounded-full border border-red-400/60 bg-red-500/20 px-3 py-1 text-sm text-red-100">Minor{res.person.guardian ? " · consent on file" : ""}</span>}</p>
                    </div>
                  </div>
                )}
              </motion.section>
            ) : <section className="card text-zinc-400">Scan a card and the result shows here.</section>}
          </AnimatePresence>
        </div>

        {pack && (
          <section className="card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-white">Checked in: {done} of {pack.people.length}</h2>
              <div className="flex gap-2"><button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={exportLog}>Download attendance (CSV)</button><button type="button" className="chip !min-h-9" onClick={() => { if (confirm("Clear all check-ins on this device?")) { setLog({}); try { localStorage.removeItem(LOGKEY(pack.eventKey)); } catch {} } }}>Clear</button></div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-cyan to-purple transition-[width]" style={{ width: `${pack.people.length ? (done / pack.people.length) * 100 : 0}%` }} /></div>
            <ul className="grid gap-1.5 sm:grid-cols-2" aria-label="Guest list">
              {pack.people.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ROLE_COLOURS[p.role] }} /><span className="truncate text-zinc-200">{p.name}</span></span>
                  <span className={log[p.id] ? "text-emerald-300" : "text-zinc-500"}>{log[p.id] ? time(log[p.id]) : "—"}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
