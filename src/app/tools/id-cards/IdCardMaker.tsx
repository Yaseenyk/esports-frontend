"use client";

import { useState } from "react";
import GameBadge from "@/components/GameBadge";
import Select from "@/components/Select";
import { useXp } from "@/components/XpProvider";
import { GAMES } from "@/lib/data";

type Role = "Player" | "Substitute" | "Coach" | "Staff" | "Guest" | "Caster";
interface Person { id: string; name: string; team: string; role: Role; photo?: string }

const ROLES: Role[] = ["Player", "Substitute", "Coach", "Staff", "Guest", "Caster"];
const ROLE_COLOR: Record<Role, string> = { Player: "#22D3EE", Substitute: "#38bdf8", Coach: "#A855F7", Staff: "#f472b6", Guest: "#a1a1aa", Caster: "#34d399" };

const SAMPLE: Person[] = [
  { id: "P-001", name: "Sample Player One", team: "Sample Squad A", role: "Player" },
  { id: "P-002", name: "Sample Player Two", team: "Sample Squad A", role: "Player" },
  { id: "S-001", name: "Sample Coach", team: "Sample Squad A", role: "Coach" },
  { id: "G-001", name: "Sample Guest", team: "", role: "Guest" },
];

function initials(n: string) { return n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?"; }

function Card({ p, event, game, organiser }: { p: Person; event: string; game: string; organiser: string }) {
  const c = ROLE_COLOR[p.role];
  return (
    <div className="idcard relative overflow-hidden rounded-xl bg-zinc-950 text-zinc-100 shadow-xl ring-1 ring-zinc-700" style={{ colorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
      <div className="flex items-center justify-between px-3 py-2" style={{ background: c, color: "#05070A" }}>
        <span className="truncate text-[11px] font-black uppercase tracking-wider">{event || "Event name"}</span>
        <span className="shrink-0 text-[10px] font-bold">{game}</span>
      </div>
      <div className="flex gap-3 p-3">
        <div className="grid h-[26mm] w-[22mm] shrink-0 place-items-center overflow-hidden rounded-md bg-zinc-800 text-xl font-black text-zinc-400">
          {p.photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.photo} alt="" className="h-full w-full object-cover" /> : initials(p.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-extrabold leading-tight">{p.name || "Full name"}</p>
          <p className="mt-0.5 truncate text-xs text-zinc-400">{p.team || "—"}</p>
          <span className="mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider" style={{ background: c, color: "#05070A" }}>{p.role}</span>
          <p className="mt-2 font-mono text-xs text-zinc-300">{p.id}</p>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-zinc-800 px-3 py-1 text-[9px] text-zinc-500">
        <span className="truncate">{organiser || "Organiser"}</span><span>Carry this card at all times</span>
      </div>
    </div>
  );
}

export default function IdCardMaker() {
  const { award } = useXp();
  const [event, setEvent] = useState("Sample Campus Cup");
  const [game, setGame] = useState("BGMI");
  const [organiser, setOrganiser] = useState("Sample College Esports Club");
  const [people, setPeople] = useState<Person[]>(SAMPLE);
  const [bulk, setBulk] = useState("");

  const update = (i: number, patch: Partial<Person>) => setPeople((l) => l.map((p, n) => (n === i ? { ...p, ...patch } : p)));
  const add = () => setPeople((l) => [...l, { id: `P-${String(l.length + 1).padStart(3, "0")}`, name: "", team: l[l.length - 1]?.team ?? "", role: "Player" }]);
  const remove = (i: number) => setPeople((l) => l.filter((_, n) => n !== i));
  const photo = (i: number, f?: File) => { if (!f) return; const r = new FileReader(); r.onload = () => update(i, { photo: String(r.result) }); r.readAsDataURL(f); };
  const importBulk = () => {
    const rows = bulk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l, n): Person => {
      const [name, team = "", role = "Player"] = l.split(/[,\t]/).map((s) => s.trim());
      const r = ROLES.find((x) => x.toLowerCase() === role.toLowerCase()) ?? "Player";
      return { id: `P-${String(people.length + n + 1).padStart(3, "0")}`, name, team, role: r };
    });
    setPeople((l) => [...l, ...rows]);
    setBulk("");
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <div className="no-print space-y-6">
        <section className="card space-y-3">
          <h2 className="font-bold text-zinc-50">Event</h2>
          <label className="block text-sm text-zinc-400">Event name<input className="field mt-1" value={event} onChange={(e) => setEvent(e.target.value)} /></label>
          <Select label="Game" value={game} onChange={setGame} options={[...GAMES.map((g) => ({ value: g.short, label: g.name, icon: <GameBadge game={g} size="sm" /> })), { value: "Multi-game", label: "Several games" }]} />
          <label className="block text-sm text-zinc-400">Organiser<input className="field mt-1" value={organiser} onChange={(e) => setOrganiser(e.target.value)} /></label>
        </section>
        <section className="card space-y-3">
          <h2 className="font-bold text-zinc-50">Paste a list</h2>
          <p className="text-xs text-zinc-500">One person per line: name, team, role (for example <span className="font-mono">Asha K, Squad A, Player</span>).</p>
          <textarea className="field min-h-24 py-2 font-mono" value={bulk} onChange={(e) => setBulk(e.target.value)} aria-label="List of people" />
          <button type="button" className="btn-ghost w-full" onClick={importBulk} disabled={!bulk.trim()}>Add these people</button>
        </section>
      </div>

      <div className="space-y-6">
        <section className="no-print card space-y-3">
          <div className="flex items-center justify-between"><h2 className="font-bold text-zinc-50">People ({people.length})</h2>
            <div className="flex gap-2"><button type="button" className="btn-ghost !min-h-9 text-sm" onClick={add}>Add person</button><button type="button" className="btn !min-h-9 text-sm" onClick={() => { award("card-shark", 20, "Card shark: printed your first ID cards"); window.print(); }}>Print cards</button></div></div>
          <ul className="space-y-3">
            {people.map((p, i) => (
              <li key={i} className="grid gap-2 rounded-xl border border-zinc-800 p-3 sm:grid-cols-[1fr_1fr_8rem_auto]">
                <input className="field" aria-label="Name" placeholder="Full name" value={p.name} onChange={(e) => update(i, { name: e.target.value })} />
                <input className="field" aria-label="Team" placeholder="Team" value={p.team} onChange={(e) => update(i, { team: e.target.value })} />
                <Select ariaLabel="Role" value={p.role} onChange={(v) => update(i, { role: v as Role })} options={ROLES.map((r) => ({ value: r, label: r }))} />
                <button type="button" className="btn-ghost !min-h-11 text-sm text-red-300" onClick={() => remove(i)} aria-label={`Remove ${p.name || "person"}`}>Remove</button>
                <input className="field" aria-label="ID number" placeholder="ID" value={p.id} onChange={(e) => update(i, { id: e.target.value })} />
                <label className="field flex cursor-pointer items-center text-sm text-zinc-400 sm:col-span-3">{p.photo ? "Photo added (tap to change)" : "Add photo (optional)"}<input type="file" accept="image/*" className="sr-only" onChange={(e) => photo(i, e.target.files?.[0])} /></label>
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="Card preview">
          <h2 className="no-print mb-3 font-bold text-zinc-50">Preview</h2>
          <div className="print-sheet flex flex-wrap gap-4">
            {people.map((p, i) => (<Card key={i} p={p} event={event} game={game} organiser={organiser} />))}
          </div>
        </section>
      </div>
    </div>
  );
}
