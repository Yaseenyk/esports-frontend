"use client";

import { useEffect, useState } from "react";
import { explain, pub } from "@/lib/api/cloud";
import { fitPhoto } from "@/lib/cloud/sync";
import { Waiting } from "@/components/skeleton/Scenes";
import { Sk, SkLines } from "@/components/skeleton/Sk";

const ROLES = ["Player", "Substitute", "Coach", "Manager", "Staff"];
const toDataUrl = (b: Blob) => new Promise<string>((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.readAsDataURL(b); });

/** The page a player opens from an invite link: name, role and a photo, nothing else. */
export default function JoinPage() {
  const [token, setToken] = useState("");
  const [info, setInfo] = useState<{ event: { name: string; date: string }; team: { name: string } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(""), [done, setDone] = useState(false), [busy, setBusy] = useState(false);
  const [name, setName] = useState(""), [role, setRole] = useState("Player"), [minor, setMinor] = useState(false), [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(location.search).get("t") ?? "";
    setToken(t);
    if (!t) { setErr("This invite link is incomplete. Ask your team captain to send it again."); setLoading(false); return; }
    pub.invite(t).then(setInfo).catch((e) => setErr((e as { status?: number }).status === 404 ? "This invite is no longer active. It may have expired or been used up. Ask the organiser for a new one." : explain(e))).finally(() => setLoading(false));
  }, []);
  useEffect(() => { if (!file) { setPreview(""); return; } const u = URL.createObjectURL(file); setPreview(u); return () => URL.revokeObjectURL(u); }, [file]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      let photo: string | undefined;
      if (file) { const blob = await fitPhoto(await toDataUrl(file), 300_000); if (!blob) { setErr("That photo is too large. Try a smaller one."); setBusy(false); return; } photo = await toDataUrl(blob); }
      await pub.submit(token, { name: name.trim(), role, minor, photo });
      setDone(true);
    } catch (x) { setErr((x as { status?: number }).status === 404 ? "This invite is no longer active." : explain(x)); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md">
      <Waiting loading={loading} apiKey="/public/invite" label="Loading the invite"><div className="space-y-3"><Sk className="!h-8" w="70%" /><SkLines n={2} /><Sk className="!h-11" /><Sk className="!h-11" i={1} /></div></Waiting>
      {err && !done && <p role="alert" className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-red-100">{err}</p>}
      {done ? (
        <div role="status" className="sk-pop space-y-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-5 text-center"><p className="font-display text-xl font-bold text-white">Sent. Thank you.</p><p className="text-sm text-emerald-100">The organiser will check your details and add you to {info?.team.name}. You do not need to do anything else.</p></div>
      ) : info && (
        <form onSubmit={send} className="sk-pop space-y-4">
          <div><h1 className="font-display text-2xl font-bold text-white">Join {info.team.name}</h1><p className="text-sm text-zinc-300">{info.event.name}{info.event.date ? ` · ${info.event.date}` : ""}</p></div>
          <label className="block text-sm text-zinc-200">Your name, as it should print on the card<input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required autoComplete="name" /></label>
          <label className="block text-sm text-zinc-200">Your role<select className="field mt-1" value={role} onChange={(e) => setRole(e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></label>
          <label className="flex items-start gap-2.5 text-sm text-zinc-200"><input type="checkbox" className="mt-0.5 h-5 w-5 accent-cyan" checked={minor} onChange={(e) => setMinor(e.target.checked)} /><span>I am under 18<span className="block text-xs text-zinc-400">The organiser will need a parent or guardian&apos;s consent before your card is printed.</span></span></label>
          <div className="space-y-2">
            <span className="text-sm text-zinc-200">A clear photo of your face (optional)</span>
            <div className="flex items-center gap-3">{preview ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={preview} alt="Your photo" className="h-20 w-16 rounded-lg border border-white/20 object-cover" /> : <span aria-hidden="true" className="grid h-20 w-16 place-items-center rounded-lg border border-dashed border-white/20 text-zinc-500">+</span>}
              <label className="btn-ghost cursor-pointer px-4 text-sm">{file ? "Change photo" : "Choose or take a photo"}<input type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label></div>
          </div>
          <p className="text-xs text-zinc-400">Only your name, role and photo are sent. We do not ask for any ID number or date of birth here.</p>
          <button className="btn w-full" disabled={busy || !name.trim()}>{busy ? "Sending…" : "Send to the organiser"}</button>
        </form>
      )}
    </div>
  );
}
