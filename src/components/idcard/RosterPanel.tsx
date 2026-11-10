"use client";

import { useState } from "react";
import { csvTemplate, parseRoster, toCsv } from "@/lib/idcard/roster";
import { downloadBlob } from "@/lib/idcard/export";
import type { Person, Team } from "@/lib/idcard/types";

const uidT = () => `t${Date.now().toString(36)}${Math.floor(Math.random() * 1e3).toString(36)}`;
const prefix = (name: string) => (name.replace(/[^A-Za-z0-9]/g, "").slice(0, 3) || "ID").toUpperCase();

/** Bring a whole roster in from a sheet, and take it back out. People who are not on a team yet get one made for them. */
export default function RosterPanel({ teams, people, setTeams, setPeople, minorOf }: {
  teams: Team[]; people: Person[]; setTeams: (t: Team[]) => void; setPeople: (p: Person[]) => void; minorOf: (p: Person) => boolean;
}) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const run = (raw: string) => {
    const { rows, skipped, trimmedAadhaar } = parseRoster(raw);
    if (!rows.length) { setMsg("No people found. The first row can be a header: name, team, role, dob, gender, zones."); return; }
    const nextTeams = [...teams];
    const find = (n: string) => nextTeams.find((t) => t.name.trim().toLowerCase() === n.trim().toLowerCase());
    let made = 0;
    const out: Person[] = [...people];
    for (const r of rows) {
      let t = r.team ? find(r.team) : nextTeams[0];
      if (!t) { t = { id: uidT(), name: r.team }; nextTeams.push(t); made++; }
      const n = out.filter((p) => p.teamId === t!.id).length + 1;
      out.push({ id: r.id || `${prefix(t.name)}-${String(n).padStart(3, "0")}`, name: r.name, teamId: t.id, role: r.role ?? "Player", dob: r.dob, gender: r.gender, last4: r.last4, zones: r.zones });
    }
    setTeams(nextTeams); setPeople(out);
    setMsg(`Added ${rows.length} ${rows.length === 1 ? "person" : "people"}${made ? ` and ${made} new ${made === 1 ? "team" : "teams"}` : ""}.${skipped ? ` ${skipped} row${skipped === 1 ? "" : "s"} had no name and were skipped.` : ""}${trimmedAadhaar ? ` ${trimmedAadhaar} full Aadhaar number${trimmedAadhaar === 1 ? " was" : "s were"} cut down to the last 4 digits.` : ""}`);
    setText("");
  };

  return (
    <section className="card space-y-3">
      <div>
        <h2 className="font-display text-xl font-bold text-white">Import or export the whole roster</h2>
        <p className="mt-1 text-sm text-zinc-400">Paste rows copied from Excel or Google Sheets, or upload a CSV. Columns: name, team, role, dob, gender, zones (a header row is optional). New teams are created for you.</p>
      </div>
      <textarea className="field min-h-24 py-2 font-mono text-sm" aria-label="Roster rows" placeholder={"name\tteam\trole\tdob\tgender\nAarav Mehta\tKonkan Kings\tPlayer\t12/05/2003\tMale"} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn !min-h-10 text-sm" disabled={!text.trim()} onClick={() => run(text)}>Add these people</button>
        <label className="btn-ghost !min-h-10 cursor-pointer px-4 text-sm">Upload a CSV<input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) run(await f.text()); e.target.value = ""; }} /></label>
        <button type="button" className="btn-ghost !min-h-10 text-sm" onClick={() => downloadBlob(new Blob([toCsv(people, teams, minorOf)], { type: "text/csv" }), "roster.csv")}>Download roster (CSV)</button>
        <button type="button" className="chip" onClick={() => downloadBlob(new Blob([csvTemplate()], { type: "text/csv" }), "roster-template.csv")}>Blank template</button>
      </div>
      {msg && <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200" role="status">{msg}</p>}
      <p className="text-xs text-zinc-500">A full Aadhaar number in a sheet is cut down to its last 4 digits on the way in. The exported roster holds names and birth dates, so keep the file safe.</p>
    </section>
  );
}
