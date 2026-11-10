"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { explain, pub, type PassData } from "@/lib/api/cloud";
import { themeById } from "@/lib/idcard/themes";
import { ROLES, type Role } from "@/lib/idcard/types";
import { Sk } from "@/components/skeleton/Sk";
import { Waiting } from "@/components/skeleton/Scenes";
import { cardFontVars } from "@/components/idcard/fonts";
import CardView from "@/components/idcard/CardView";
import { LangSwitch, useLang } from "@/components/useLang";

const asRole = (r: string): Role => ((ROLES as readonly string[]).includes(r) ? (r as Role) : "Player");

/** One person's own pass, opened from a private link. No account needed. */
export default function PassPage() {
  const { t } = useLang();
  const [data, setData] = useState<PassData | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [again, setAgain] = useState(0);

  useEffect(() => {
    const tok = new URLSearchParams(location.search).get("t");
    if (!tok) { setErr(t("link_incomplete")); setLoading(false); return; }
    setLoading(true); setErr("");
    pub.pass(tok).then((d) => setData(d)).catch((e) => setErr((e as { status?: number }).status === 404 ? t("pass_inactive") : explain(e))).finally(() => setLoading(false));
  }, [again]);

  const tpl = themeById("pass-light")!.make("pass");
  return (
    <div className={`mx-auto max-w-sm ${cardFontVars}`}>
      <LangSwitch className="mb-4 justify-end" />
      <Waiting loading={loading} apiKey="/public/pass" label="Loading your pass" onRetry={() => setAgain((n) => n + 1)}>
        <div className="space-y-3"><Sk className="mx-auto !h-6" w="60%" /><div className="sk-card" style={{ aspectRatio: "54 / 112.4" }}><span className="sk-laser" /></div></div>
      </Waiting>
      {err && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-center text-red-100">{err}</p>}
      {data && (
        <div className="sk-pop space-y-4 text-center">
          <h1 className="font-display text-xl font-bold text-white">{data.event.name}</h1>
          <p className="text-sm text-zinc-300">{[data.event.date, data.event.venue].filter(Boolean).join(" · ")}</p>
          <CardView tpl={tpl} ctx={{ event: data.event.name, game: "", teamName: data.person.team ?? "", person: { id: data.code.split(".")[2] ?? "", name: data.person.name, teamId: "", role: asRole(data.person.role), photo: data.photoUrl ? API_BASE + data.photoUrl : undefined, zones: Array.isArray(data.person.zones) ? (data.person.zones as string[]).join("; ") : String(data.person.zones ?? "") }, info: { organiser: "", date: data.event.date, venue: data.event.venue, emergency: "", rules: "" }, qr: data.code }} />
          <p className="text-xs text-zinc-400">{t("pass_note")}</p>
        </div>
      )}
    </div>
  );
}
