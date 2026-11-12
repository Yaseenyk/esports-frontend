"use client";

import { useState } from "react";
import { type Flag, admin } from "@/lib/admin/client";
import { killCopy } from "@/lib/admin/labels";
import { ConfirmPanel, Empty, Failed, H1, Loading, Success, useLoad } from "./ui";

const ENFORCE = "takedown.enforce";

/** The rollout switch for takedowns: while it is off, hidden pages stay public (reports and takedowns are still recorded). No step-up code. */
function EnforceRow({ f, onDone }: { f: Flag; onDone: (m: string) => void }) {
  const [asking, setAsking] = useState(false);
  async function flip(reason: string) { await admin.setFlag(ENFORCE, !f.value, reason); setAsking(false); onDone(f.value ? "Takedowns are no longer enforced." : "Takedowns are now enforced."); }
  return (
    <li className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-white">Hide taken-down pages from the public</h2>
          <p className={`mt-0.5 text-sm font-medium ${f.value ? "text-emerald-300" : "text-amber-300"}`}>{f.value ? "On: hidden pages are not shown" : "Off: hidden pages are still shown"}</p>
        </div>
        {!asking && <button type="button" className={f.value ? "btn-ghost" : "btn"} onClick={() => setAsking(true)} aria-label={`${f.value ? "Turn off" : "Turn on"}: hide taken-down pages`}>{f.value ? "Turn off" : "Turn on"}</button>}
      </div>
      {asking && (
        <ConfirmPanel title={f.value ? "Stop hiding taken-down pages?" : "Start hiding taken-down pages?"} confirmLabel={f.value ? "Turn off" : "Turn on"} danger={f.value} onCancel={() => setAsking(false)} onConfirm={flip}>
          <p>{f.value ? "Pages you took down become visible again until you turn this back on." : "Every page you took down, and every page of a suspended organisation, stops being shown from the next request."}</p>
        </ConfirmPanel>
      )}
    </li>
  );
}

function Row({ f, onDone }: { f: Flag; onDone: (m: string) => void }) {
  const [asking, setAsking] = useState(false);
  const c = killCopy(f.key);
  async function flip(reason: string) { await admin.setFlag(f.key, !f.value, reason); setAsking(false); onDone(f.value ? `${c.title} is running again.` : `${c.title} is stopped.`); }
  return (
    <li className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-white">{c.title}</h2>
          <p className={`mt-0.5 text-sm font-medium ${f.value ? "text-amber-300" : "text-emerald-300"}`}>{f.value ? "Stopped" : "Running"}</p>
        </div>
        {!asking && <button type="button" className={f.value ? "btn" : "btn-ghost"} onClick={() => setAsking(true)} aria-label={`${f.value ? "Turn back on" : "Stop"}: ${c.title}`}>{f.value ? "Turn back on" : "Stop this"}</button>}
      </div>
      {asking && (
        f.value ? (
          <ConfirmPanel title={`Turn ${c.title.toLowerCase()} back on?`} confirmLabel="Turn back on" needsCode={admin.needsStepUp()} onCancel={() => setAsking(false)} onConfirm={flip}>
            <p>People can use this again from the next request.</p>
          </ConfirmPanel>
        ) : (
          <ConfirmPanel title={`Stop ${c.title.toLowerCase()}?`} confirmLabel="Yes, stop it" danger needsCode={admin.needsStepUp()} onCancel={() => setAsking(false)} onConfirm={flip}>
            <p><strong>{c.stops}</strong> {c.warn}</p>
            <p className="mt-1">It takes effect on the very next request. You can turn it back on here.</p>
          </ConfirmPanel>
        )
      )}
    </li>
  );
}

export default function Switches() {
  const r = useLoad(() => admin.flags());
  const [done, setDone] = useState("");
  if (r.status === "loading") return <><H1>Switches</H1><Loading what="switches" /></>;
  if (r.status === "error" || !r.data) return <><H1>Switches</H1><Failed error={r.error} onRetry={r.reload} /></>;
  const kills = r.data.filter((f) => f.key.startsWith("kill.")).sort((a, b) => a.key.localeCompare(b.key));
  const enforce = r.data.find((f) => f.key === ENFORCE && f.settable);
  return (
    <>
      <H1 sub="Emergency stops for parts of the site. Use them when something is going wrong. Each change asks for a reason and is written to the activity log.">Switches</H1>
      {done && <div className="mb-4"><Success>{done}</Success></div>}
      {kills.length === 0 ? <Empty>No switches were sent by the server.</Empty> : <ul className="space-y-3">{kills.map((f) => <Row key={f.key} f={f} onDone={(m) => { setDone(m); r.reload(); }} />)}{enforce && <EnforceRow f={enforce} onDone={(m) => { setDone(m); r.reload(); }} />}</ul>}
    </>
  );
}
