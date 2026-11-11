"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gateClient, offlineScanQueue, type CheckResult } from "@/lib/api/cloud";
import { createPoller } from "@/lib/api/poller";
import { findQr } from "@/lib/idcard/qr";
import { ROLE_COLOURS, type Role } from "@/lib/idcard/types";
import { Waiting } from "@/components/skeleton/Scenes";
import { Sk } from "@/components/skeleton/Sk";
import { useQrCamera } from "./useQrCamera";
import { useLang } from "@/components/useLang";

type GP = { id: string; name: string; team: string | null; role: string; zones: unknown; minor: boolean; guardian: boolean; photoUrl: string | null; checkedInAt: string | null };
interface Shown { kind: "ok" | "again" | "bad" | "queued"; title: string; sub: string; person?: GP | CheckResult["person"]; photo?: string | null }
const KEY = "eh-gate-key";
const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const zonesText = (z: unknown) => (Array.isArray(z) ? z.join(", ") : typeof z === "string" ? z : "");
const roleColour = (r: string) => ROLE_COLOURS[r as Role] ?? "#22d3ee";

/** Gate check-in against the server: every phone on every door shares one list, so nobody gets in twice. Scans made without signal are kept and sent together once it returns. */
export default function LiveGate() {
  const { t } = useLang();
  const [key, setKey] = useState(""), [typed, setTyped] = useState("");
  const [event, setEvent] = useState<{ name: string; date: string; venue: string } | null>(null);
  const [people, setPeople] = useState<GP[]>([]);
  const [loading, setLoading] = useState(false), [err, setErr] = useState("");
  const [shown, setShown] = useState<Shown | null>(null);
  const [pending, setPending] = useState(0), [manual, setManual] = useState("");
  const photos = useRef(new Map<string, string>());
  const queue = useRef<ReturnType<typeof offlineScanQueue> | null>(null);
  const peopleRef = useRef<GP[]>([]); peopleRef.current = people;

  const connect = useCallback((k: string) => {
    setLoading(true); setErr("");
    gateClient(k).roster().then((r) => { setEvent(r.event); setPeople(r.people); setKey(k); try { sessionStorage.setItem(KEY, k); } catch { /* ignore */ } })
      .catch((e) => {
        const st = (e as { status?: number }).status;
        if (st === 401 || st === 403 || st === 404) { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } setErr("That key is not valid. It may have expired or been revoked. Ask the organiser for a new one."); }
        else setErr("Could not reach the server. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { try { const k = sessionStorage.getItem(KEY); if (k) connect(k); } catch { /* ignore */ } }, [connect]);

  // The shared list refreshes every 20 s (slowing to 2 min when nothing changes, stopping while the tab is hidden), so a scan at another door shows up here.
  useEffect(() => {
    if (!key) return;
    const g = gateClient(key);
    const poller = createPoller({ fetch: () => g.roster(), same: (a, b) => a.people.filter((p) => p.checkedInAt).length === b.people.filter((p) => p.checkedInAt).length, onData: (r) => setPeople(r.people), minMs: 20000, maxMs: 120000 });
    const wake = () => poller.resume();
    document.addEventListener("visibilitychange", wake); window.addEventListener("online", wake);
    queue.current = offlineScanQueue(key, localStorage, (results) => {
      const at = new Map(results.filter((r) => r.person && r.at).map((r) => [r.person!.id, r.at!]));
      setPeople((l) => l.map((p) => (at.has(p.id) && !p.checkedInAt ? { ...p, checkedInAt: at.get(p.id)! } : p)));
      setTimeout(() => setPending(queue.current?.size ?? 0), 0); // after the queue has dropped what it just sent
    });
    setPending(queue.current.size);
    const detach = queue.current.attach(document, window);
    poller.start();
    return () => { poller.stop(); detach(); document.removeEventListener("visibilitychange", wake); window.removeEventListener("online", wake); };
  }, [key]);

  const check = useCallback(async (code: string) => {
    if (!key) return;
    try {
      const r = await gateClient(key).checkin(code);
      if (r.status === "bad" || !r.person) { setShown({ kind: "bad", title: t("gate_bad"), sub: r.reason ?? "Check the code and try again." }); try { navigator.vibrate?.([60, 40, 60]); } catch { /* ignore */ } return; }
      const p = r.person;
      setPeople((l) => l.map((x) => (x.id === p.id && !x.checkedInAt ? { ...x, checkedInAt: r.at ?? new Date().toISOString() } : x)));
      const known = peopleRef.current.find((x) => x.id === p.id);
      let photo: string | null | undefined = photos.current.get(p.id);
      setShown({ kind: r.status === "ok" ? "ok" : "again", title: r.status === "ok" ? t("gate_ok") : t("gate_again"), sub: r.status === "ok" ? `Checked in at ${time(r.at ?? new Date().toISOString())}` : `First checked in at ${time(r.at ?? new Date().toISOString())}`, person: p, photo });
      try { navigator.vibrate?.(r.status === "ok" ? 40 : 80); } catch { /* ignore */ }
      if (!photo && known?.photoUrl) { photo = await gateClient(key).photo(known.photoUrl); if (photo) { photos.current.set(p.id, photo); setShown((s) => (s?.person && "id" in s.person && s.person.id === p.id ? { ...s, photo } : s)); } }
    } catch (e) {
      const st = (e as { status?: number }).status;
      if (st === 401 || st === 403) { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } setErr("This gate key is no longer valid. Ask the organiser for a new one."); setKey(""); return; }
      // The server answered and refused this code: that is a rejected pass, not a lost connection, so it is not kept for later.
      if (st && st >= 400 && st < 500 && st !== 408 && st !== 429) { setShown({ kind: "bad", title: t("gate_bad"), sub: "The server did not accept that code. Check it and try again." }); return; }
      // No signal: keep the scan, tell the guard plainly that it has NOT been verified.
      queue.current?.add(code); setPending(queue.current?.size ?? 0);
      const id = code.split(".").slice(2, -1).join(".");
      const p = peopleRef.current.find((x) => x.id === id);
      setShown({ kind: "queued", title: t("gate_queued"), sub: p ? `Saved. It will be checked and counted when the connection returns. Match ${p.name} against the card by sight.` : "Saved. It will be checked when the connection returns.", person: p });
    }
  }, [key, t]);

  const cam = useQrCamera(check);
  const scanPhoto = async (f?: File) => {
    if (!f) return;
    let c: string | null = null;
    try { c = await findQr(f); } catch { /* an unreadable file is the same as no code */ }
    if (c) void check(c); else setShown({ kind: "bad", title: "No QR code found", sub: "Try a sharper, closer photo." });
  };
  const leave = () => {
    if (pending > 0 && !confirm(`${pending} scan${pending === 1 ? " is" : "s are"} still waiting for signal and will not be sent until you use this key again. Switch anyway?`)) return;
    try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } setKey(""); setPeople([]); setShown(null); setErr("");
  };
  const done = people.filter((p) => p.checkedInAt).length;
  const tone = { ok: "border-emerald-400/60 bg-emerald-500/15", again: "border-amber-400/60 bg-amber-500/15", queued: "border-sky-400/60 bg-sky-500/15", bad: "border-red-400/60 bg-red-500/15" };

  if (!key) {
    return (
      <form className="card mt-8 max-w-md space-y-3" onSubmit={(e) => { e.preventDefault(); if (typed.trim()) connect(typed.trim()); }}>
        <h2 className="font-display text-lg font-bold text-white">Gate key</h2>
        <p className="text-sm text-zinc-300">The organiser makes a key for each door in the ID card maker (Online, then Live check-in). Paste it here. It only lets this phone check guests in.</p>
        <input className="field font-mono text-sm" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="gk_…" aria-label="Gate key" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
        <button className="btn w-full" disabled={loading || !typed.trim()}>{loading ? "Connecting…" : "Connect"}</button>
        <Waiting loading={loading} apiKey="/gate/roster" label="Connecting"><div className="space-y-2"><Sk className="sk-line" w="60%" /><Sk className="sk-line" w="40%" i={1} /></div></Waiting>
        {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
      </form>
    );
  }
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[22rem_1fr]">
      <div className="space-y-4">
        <section className="card space-y-2">
          <h2 className="font-display text-lg font-bold text-white">{event?.name}</h2>
          <p className="text-sm text-zinc-300">{[event?.date, event?.venue].filter(Boolean).join(" · ")}</p>
          <p className="text-sm text-emerald-300">{t("gate_connected")}. {done} of {people.length} checked in across all doors.</p>
          {pending > 0 && <p role="status" className="text-sm text-sky-300">{pending} scan{pending === 1 ? "" : "s"} waiting for signal</p>}
          <button type="button" className="chip" onClick={leave}>Use a different key</button>
        </section>
        <section className="card space-y-3">
          <h2 className="font-display text-lg font-bold text-white">Scan</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn !min-h-10 px-4 text-sm" onClick={() => cam.setState(cam.state === "on" ? "off" : "on")}>{cam.state === "on" ? "Stop camera" : "Start camera"}</button>
            <label className="btn-ghost !min-h-10 cursor-pointer px-4 text-sm">Scan a photo<input type="file" accept="image/*" className="sr-only" onChange={(e) => { scanPhoto(e.target.files?.[0]); e.target.value = ""; }} /></label>
          </div>
          {cam.state === "error" && <p className="text-sm text-red-300">The camera could not start. Allow camera access, or use Scan a photo.</p>}
          {cam.state === "on" && <video ref={cam.video} playsInline muted className="aspect-square w-full rounded-xl border border-white/10 bg-black object-cover" />}
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (manual.trim()) { void check(manual.trim()); setManual(""); } }}>
            <input className="field font-mono text-sm" value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Or paste the code" aria-label="Pass code" />
            <button type="submit" className="btn-ghost px-3 text-sm" disabled={!manual.trim()}>Check</button>
          </form>
        </section>
      </div>
      <div className="space-y-4">
        <div aria-live="assertive">
          {shown ? (
            <section className={`rounded-3xl border-2 p-5 sm:p-7 ${tone[shown.kind]}`}>
              <p className="font-display text-2xl font-bold text-white sm:text-4xl">{shown.kind === "ok" ? "✓ " : shown.kind === "again" ? "↻ " : shown.kind === "queued" ? "… " : "✕ "}{shown.title}</p>
              <p className="mt-1 text-zinc-200">{shown.sub}</p>
              {shown.person && (
                <div className="mt-5 flex items-center gap-4">
                  {shown.photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={shown.photo} alt="" className="h-28 w-24 rounded-xl border border-white/20 object-cover" /> : <span aria-hidden="true" className="grid h-28 w-24 place-items-center rounded-xl border border-white/20 bg-white/5 text-3xl font-bold text-white">{shown.person.name.slice(0, 1)}</span>}
                  <div className="min-w-0">
                    <p className="truncate font-display text-2xl font-bold text-white">{shown.person.name}</p>
                    <p className="text-zinc-200">{shown.person.team ?? ""}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-2"><span className="rounded-full px-3 py-1 text-sm font-bold text-ink" style={{ background: roleColour(shown.person.role) }}>{shown.person.role}</span>{shown.person.minor && <span className="rounded-full bg-amber-300 px-3 py-1 text-sm font-bold text-ink">MINOR{shown.person.guardian ? " · CONSENT" : " · NO CONSENT"}</span>}</p>
                    {zonesText(shown.person.zones) && <p className="mt-1 text-sm text-zinc-200">Zones: {zonesText(shown.person.zones)}</p>}
                  </div>
                </div>
              )}
            </section>
          ) : <section className="card text-zinc-400">Scan a card and the result shows here.</section>}
        </div>
        <section className="card">
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-cyan to-purple transition-[width]" style={{ width: `${people.length ? (done / people.length) * 100 : 0}%` }} /></div>
          <ul className="grid gap-1.5 sm:grid-cols-2" aria-label="Guest list">{people.map((p) => <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm"><span className="flex min-w-0 items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: roleColour(p.role) }} /><span className="truncate text-zinc-200">{p.name}</span></span><span className={p.checkedInAt ? "text-emerald-300" : "text-zinc-400"}>{p.checkedInAt ? time(p.checkedInAt) : "—"}</span></li>)}</ul>
        </section>
      </div>
    </div>
  );
}
