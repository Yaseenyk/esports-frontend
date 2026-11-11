"use client";

import { useEffect, useRef, useState } from "react";
import { explain, pub, type PublicReg, type RegPlayer } from "@/lib/api/cloud";
import { submitRegistration } from "@/lib/api/f-reminders";
import { CONSENT_TEXT, isEmail } from "@/lib/reminders";
import { Waiting } from "@/components/skeleton/Scenes";
import { Sk, SkLines } from "@/components/skeleton/Sk";
import { LangSwitch, useLang } from "@/components/useLang";
import { takeTokenSearch } from "@/lib/tokenHygiene";

const blank = (n: number): RegPlayer[] => Array.from({ length: n }, () => ({ name: "", ign: "", minor: false }));

/** The page a team captain opens from a registration link. Asks only for what the organiser needs. Available in English, Hindi and Marathi. */
export default function RegisterPage() {
  const { t } = useLang();
  const [token, setToken] = useState("");
  const [info, setInfo] = useState<PublicReg | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<{ key: Parameters<typeof t>[0]; vars?: Record<string, string | number> } | { raw: string } | null>(null);
  const [done, setDone] = useState(false), [busy, setBusy] = useState(false);
  const [email, setEmail] = useState(""), [agree, setAgree] = useState(false);
  const [team, setTeam] = useState(""), [captain, setCaptain] = useState(""), [contact, setContact] = useState(""), [notes, setNotes] = useState("");
  const [players, setPlayers] = useState<RegPlayer[]>([]);

  useEffect(() => {
    const tok = new URLSearchParams(takeTokenSearch()).get("t") ?? "";
    setToken(tok);
    if (!tok) { setErr({ key: "reg_incomplete" }); setLoading(false); return; }
    pub.registration(tok).then((r) => { setInfo(r); setPlayers(blank(r.form.teamSize + r.form.subs)); }).catch((e) => setErr((e as { status?: number }).status === 404 ? { key: "reg_inactive" } : { raw: explain(e) })).finally(() => setLoading(false));
  }, []);

  const filled = players.filter((p) => p.name.trim());
  const need = info?.form.teamSize ?? 0;
  const setP = (i: number, patch: Partial<RegPlayer>) => setPlayers((l) => l.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const errText = err ? ("raw" in err ? err.raw : t(err.key, err.vars)) : "";
  // The message sits above a long form: bring it into view so a failed send on a phone is never silent.
  const errBox = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (errText && !loading) { errBox.current?.scrollIntoView({ block: "center", behavior: "smooth" }); errBox.current?.focus({ preventScroll: true }); } }, [errText, loading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (email.trim() && !isEmail(email)) { setErr({ raw: "That email address does not look right. Check it, or leave it empty." }); return; }
    if (email.trim() && !agree) { setErr({ raw: "Tick the box to agree to emails, or leave the email empty." }); return; }
    setBusy(true); setErr(null);
    try { await submitRegistration(token, { teamName: team.trim(), captainName: captain.trim(), captainContact: contact.trim(), players: filled.map((p) => ({ name: p.name.trim(), ign: p.ign.trim(), minor: p.minor })), notes: notes.trim(), ...(email.trim() ? { captainEmail: email.trim(), emailConsent: true, emailConsentText: CONSENT_TEXT } : {}) }); setDone(true); }
    catch (x) { const s = (x as { status?: number }).status; setErr(s === 409 ? { key: "reg_conflict" } : s === 429 ? { key: "reg_toomany" } : s === 400 ? { key: "reg_count", vars: { size: need } } : { raw: explain(x) }); }
    finally { setBusy(false); }
  };

  const f = info?.form;
  return (
    <div className="mx-auto max-w-xl">
      <LangSwitch className="mb-4 justify-end" />
      <Waiting loading={loading} apiKey="/public/registration" label="Loading the registration form"><div className="space-y-3"><Sk className="!h-8" w="70%" /><SkLines n={2} /><Sk className="!h-11" /><Sk className="!h-11" i={1} /></div></Waiting>
      {errText && !done && <p ref={errBox} tabIndex={-1} role="alert" className="mb-4 rounded-xl border border-red-400/40 bg-[#0a0b0d] p-4 text-red-100">{errText}</p>}
      {done ? (
        <div role="status" className="space-y-2 rounded-2xl border border-emerald-400/40 bg-[#0a0b0d] p-5 text-center"><p className="font-display text-xl font-bold text-white">{t("reg_done_title")}</p><p className="text-sm text-emerald-100">{t("reg_done_body")}</p></div>
      ) : info && f && (
        <form onSubmit={send} className="space-y-4">
          <div><h1 className="font-display text-2xl font-bold text-white">{f.title || t("reg_default_title", { event: info.event.name })}</h1><p className="text-sm text-zinc-300">{[info.event.name, info.event.date, info.event.venue].filter(Boolean).join(" · ")}</p></div>
          <p className="rounded-xl border border-white/[0.14] bg-[#0a0b0d] p-3 text-sm text-zinc-200">{t("reg_intro")}</p>
          {f.intro && <p className="rounded-xl border border-white/[0.14] bg-[#0a0b0d] p-3 text-sm text-zinc-200">{f.intro}</p>}
          {f.status !== "open" ? (
            <p role="status" className="rounded-xl border border-amber-500/30 bg-[#0a0b0d] p-4 text-amber-100">{f.status === "full" ? t("reg_full") : t("reg_closed")}</p>
          ) : (
            <>
              {(f.spotsLeft !== null || f.closesAt) && <p className="text-sm text-zinc-300">{[f.spotsLeft !== null ? t("reg_places", { n: f.spotsLeft }) : "", f.closesAt ? t("reg_closes", { when: new Date(f.closesAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) }) : ""].filter(Boolean).join(". ")}</p>}
              <label className="block text-sm text-zinc-200">{t("reg_team")}<input className="field mt-1" value={team} onChange={(e) => setTeam(e.target.value)} minLength={2} maxLength={60} required /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-zinc-200">{t("reg_cap_name")}<input className="field mt-1" value={captain} onChange={(e) => setCaptain(e.target.value)} maxLength={80} required autoComplete="name" /></label>
                <label className="block text-sm text-zinc-200">{t("reg_cap_contact")}<input className="field mt-1" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={120} required autoComplete="tel" /></label>
              </div>
              <fieldset className="space-y-3"><legend className="font-display font-bold text-white">{f.subs ? t("reg_legend_subs", { size: f.teamSize, subs: f.subs }) : t("reg_legend", { size: f.teamSize })}</legend>
                {players.map((p, i) => (
                  <div key={i} className="grid gap-2 rounded-xl border border-white/[0.14] bg-[#0f1013] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <label className="block text-xs text-zinc-300">{i < f.teamSize ? t("reg_player_n", { n: i + 1 }) : t("reg_sub_n", { n: i - f.teamSize + 1 })}<input className="field mt-1 !min-h-10" value={p.name} onChange={(e) => setP(i, { name: e.target.value })} maxLength={80} required={i < f.teamSize} /></label>
                    <label className="block text-xs text-zinc-300">{t("reg_ign")}<input className="field mt-1 !min-h-10" value={p.ign} onChange={(e) => setP(i, { ign: e.target.value })} maxLength={40} /></label>
                    <label className="flex items-center gap-2 pb-2 text-xs text-zinc-300"><input type="checkbox" className="h-5 w-5 accent-cyan" checked={p.minor} onChange={(e) => setP(i, { minor: e.target.checked })} />{t("reg_minor")}</label>
                  </div>
                ))}
              </fieldset>
              <fieldset className="space-y-2 rounded-xl border border-white/[0.14] bg-[#0f1013] p-3"><legend className="px-1 text-sm font-semibold text-white">Email updates (optional)</legend>
                <label className="block text-sm text-zinc-200">Email me updates about this event<input type="email" className="field mt-1" value={email} onChange={(e) => { setEmail(e.target.value); if (!e.target.value.trim()) setAgree(false); }} maxLength={120} autoComplete="email" /></label>
                <label className="flex items-start gap-2 text-xs text-zinc-300"><input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-cyan" checked={agree} onChange={(e) => setAgree(e.target.checked)} disabled={!email.trim()} />{CONSENT_TEXT}</label>
              </fieldset>
              <label className="block text-sm text-zinc-200">{t("reg_notes")}<textarea className="field mt-1 min-h-20 py-2" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} /></label>
              <p className="text-xs text-zinc-400">{t("reg_privacy")}</p>
              {filled.length < need && filled.length > 0 && <p className="text-xs text-amber-200">{t("reg_count", { size: need })}</p>}
              <button className="btn w-full" disabled={busy || filled.length < need}>{busy ? t("sending") : t("reg_submit")}</button>
            </>
          )}
        </form>
      )}
    </div>
  );
}
