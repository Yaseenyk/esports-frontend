"use client";

import { useEffect, useRef, useState } from "react";
import { explain, pub } from "@/lib/api/cloud";
import { fitPhoto } from "@/lib/cloud/sync";
import type { Key } from "@/lib/i18n";
import { Waiting } from "@/components/skeleton/Scenes";
import { Sk, SkLines } from "@/components/skeleton/Sk";
import { LangSwitch, useLang } from "@/components/useLang";
import { takeTokenSearch } from "@/lib/tokenHygiene";
import JoinOrgFallback from "@/components/org/JoinOrgFallback";

const ROLES = ["Player", "Substitute", "Coach", "Manager", "Staff"];
const toDataUrl = (b: Blob) => new Promise<string>((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.readAsDataURL(b); });

/** The page a player opens from an invite link: name, role and a photo, nothing else. */
export default function JoinPage() {
  const { t } = useLang();
  const [token, setToken] = useState("");
  const [info, setInfo] = useState<{ event: { name: string; date: string }; team: { name: string } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notPlayer, setNotPlayer] = useState(false), [orgHandled, setOrgHandled] = useState(false); // the token is not a player invite: it may be a club or event invitation
  const [err, setErr] = useState(""), [done, setDone] = useState(false), [busy, setBusy] = useState(false);
  const [name, setName] = useState(""), [role, setRole] = useState("Player"), [minor, setMinor] = useState(false), [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const tok = new URLSearchParams(takeTokenSearch()).get("t") ?? "";
    setToken(tok);
    if (!tok) { setErr(t("link_incomplete")); setLoading(false); return; }
    pub.invite(tok).then(setInfo).catch((e) => { const dead = (e as { status?: number }).status === 404; setNotPlayer(dead); setErr(dead ? t("invite_inactive") : explain(e)); }).finally(() => setLoading(false));
  }, []);
  useEffect(() => { if (!file) { setPreview(""); return; } const u = URL.createObjectURL(file); setPreview(u); return () => URL.revokeObjectURL(u); }, [file]);

  const errBox = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (err && !loading) { errBox.current?.scrollIntoView({ block: "center", behavior: "smooth" }); errBox.current?.focus({ preventScroll: true }); } }, [err, loading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr("");
    try {
      let photo: string | undefined;
      if (file) { const blob = await fitPhoto(await toDataUrl(file), 300_000); if (!blob) { setErr("That photo could not be used. Try a JPG or PNG, or a smaller picture."); setBusy(false); return; } photo = await toDataUrl(blob); }
      await pub.submit(token, { name: name.trim(), role, minor, photo });
      setDone(true);
    } catch (x) { setErr((x as { status?: number }).status === 404 ? "This invite is no longer active." : explain(x)); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md">
      <LangSwitch className="mb-4 justify-end" />
      <Waiting loading={loading} apiKey="/public/invite" label="Loading the invite"><div className="space-y-3"><Sk className="!h-8" w="70%" /><SkLines n={2} /><Sk className="!h-11" /><Sk className="!h-11" i={1} /></div></Waiting>
      {err && !done && !orgHandled && <p ref={errBox} tabIndex={-1} role="alert" className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-red-100">{err}</p>}
      {notPlayer && !done && token && <JoinOrgFallback token={token} onHandled={setOrgHandled} />}
      {done ? (
        <div role="status" className="sk-pop space-y-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-5 text-center"><p className="font-display text-xl font-bold text-white">{t("sent_title")}</p><p className="text-sm text-emerald-100">{t("sent_body", { team: info?.team.name ?? "" })}</p></div>
      ) : info && (
        <form onSubmit={send} className="sk-pop space-y-4">
          <div><h1 className="font-display text-2xl font-bold text-white">{t("join_title", { team: info.team.name })}</h1><p className="text-sm text-zinc-300">{info.event.name}{info.event.date ? ` · ${info.event.date}` : ""}</p><p className="mt-3 rounded-xl border border-white/[0.14] bg-[#0a0b0d] p-3 text-sm text-zinc-200">{t("join_intro")}</p></div>
          <label className="block text-sm text-zinc-200">{t("your_name")}<input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required autoComplete="name" /></label>
          <label className="block text-sm text-zinc-200">{t("your_role")}<select className="field mt-1" value={role} onChange={(e) => setRole(e.target.value)}>{ROLES.map((r) => <option key={r} value={r}>{t(`role_${r}` as Key)}</option>)}</select></label>
          <label className="flex items-start gap-2.5 text-sm text-zinc-200"><input type="checkbox" className="mt-0.5 h-5 w-5 accent-cyan" checked={minor} onChange={(e) => setMinor(e.target.checked)} /><span>{t("under18")}<span className="block text-xs text-zinc-400">{t("under18_hint")}</span></span></label>
          <div className="space-y-2">
            <span className="text-sm text-zinc-200">{t("photo_label")}</span>
            <div className="flex items-center gap-3">{preview ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={preview} alt="Your photo" className="h-20 w-16 rounded-lg border border-white/20 object-cover" /> : <span aria-hidden="true" className="grid h-20 w-16 place-items-center rounded-lg border border-dashed border-white/20 text-zinc-500">+</span>}
              <label className="btn-ghost cursor-pointer px-4 text-sm">{file ? t("change_photo") : t("choose_photo")}<input type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label></div>
          </div>
          <p className="text-xs text-zinc-400">{t("privacy")}</p>
          <button className="btn w-full" disabled={busy || !name.trim()}>{busy ? t("sending") : t("send")}</button>
        </form>
      )}
    </div>
  );
}
