"use client";

import { useEffect, useMemo, useState } from "react";
import { EXAMPLE_SCALE, standings } from "@/lib/points";
import { encode, type Payload } from "@/lib/display";
import { leagueView, pointsView, scheduleView } from "@/lib/display-views";
import { singleElimView } from "@/lib/display-views";
import { seedOrder } from "@/lib/seeding";
import { buildSchedule } from "@/lib/schedule";
import { BYE, fixtures, table } from "@/lib/roundrobin";

type Kind = "standings" | "league" | "schedule" | "countdown" | "bracket";
const KINDS: { id: Kind; label: string }[] = [{ id: "standings", label: "Battle royale standings" }, { id: "league", label: "League table" }, { id: "schedule", label: "Run-sheet" }, { id: "countdown", label: "Countdown" }, { id: "bracket", label: "Knockout bracket" }];

function sample(kind: Kind): Payload {
  if (kind === "standings") {
    const teams = [
      { name: "Konkan Kings", matches: [{ placement: 1, kills: 7 }, { placement: 3, kills: 4 }, { placement: 2, kills: 6 }] },
      { name: "Pune Phantoms", matches: [{ placement: 2, kills: 5 }, { placement: 1, kills: 8 }, { placement: 6, kills: 2 }] },
      { name: "Mumbai Mavericks", matches: [{ placement: 4, kills: 3 }, { placement: 2, kills: 5 }, { placement: 1, kills: 6 }] },
      { name: "Nashik Ninjas", matches: [{ placement: 3, kills: 2 }, { placement: 5, kills: 3 }, { placement: 3, kills: 4 }] },
      { name: "Goa Gamers", matches: [{ placement: 5, kills: 1 }, { placement: 4, kills: 2 }, { placement: 4, kills: 3 }] },
    ];
    return pointsView(standings(teams, EXAMPLE_SCALE), 3, "Spring Cup standings");
  }
  if (kind === "league") {
    const teams = ["Konkan Kings", "Pune Phantoms", "Mumbai Mavericks", "Nashik Ninjas"];
    const rounds = fixtures(teams);
    const scores = rounds.map((rd, ri) => rd.map((f, fi) => (f.a === BYE || f.b === BYE ? { a: null, b: null } : { a: (ri + fi + 2) % 4, b: (ri * 2 + fi) % 3 })));
    return leagueView(table(teams, rounds, scores), "Spring Cup league");
  }
  if (kind === "schedule") {
    const now = new Date(); now.setMinutes(Math.floor(now.getMinutes() / 5) * 5 - 10, 0, 0); // starts ten minutes ago, so a round is "on now"
    const start = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return scheduleView(buildSchedule({ start, matches: 9, duration: 25, gap: 5, lobbies: 2, breakEvery: 3, breakLength: 15 }) ?? [], "Spring Cup run-sheet");
  }
  if (kind === "bracket") {
    const teams = ["Konkan Kings", "Pune Phantoms", "Mumbai Mavericks", "Nashik Ninjas", "Goa Gamers", "Thane Titans", "Nagpur Nova", "Kolhapur Knights"];
    const first = seedOrder(8).map((n) => teams[n - 1]!);
    const r2 = [first[0]!, first[3]!, first[4]!, first[7]!], r3 = [r2[0]!, r2[3]!];
    return singleElimView([first, r2, r3, [r3[0]!]], { "0-0": 0, "0-1": 0, "0-2": 0, "0-3": 1, "1-0": 0 }, ["Quarter-finals", "Semi-finals", "Final"], "Spring Cup bracket");
  }
  return { v: "countdown", d: { title: "Spring Cup", subtitle: "Doors open soon", at: new Date(Date.now() + 2 * 3600_000 + 5 * 60_000).toISOString() } };
}

/** A working preview of each screen, with a button to open it full size. */
export default function DisplayDemo() {
  const [kind, setKind] = useState<Kind>("standings");
  const [theme, setTheme] = useState<"dark" | "neon" | "light">("neon");
  const payload = useMemo(() => sample(kind), [kind]);
  const [hash, setHash] = useState("");
  useEffect(() => { let on = true; void encode(payload).then((h) => { if (on) setHash(h); }); return () => { on = false; }; }, [payload]);
  const url = hash ? `/display/${theme === "dark" ? "" : `?theme=${theme}`}#d=${hash}` : "";
  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Screen type">{KINDS.map((k) => <button key={k.id} type="button" aria-pressed={kind === k.id} className={`chip ${kind === k.id ? "!border-cyan !text-cyan" : ""}`} onClick={() => setKind(k.id)}>{k.label}</button>)}</div>
        <label className="text-sm text-zinc-200">Style<select className="field mt-1" value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)}><option value="neon">Neon</option><option value="dark">Dark</option><option value="light">Light</option></select></label>
        <a href={url || undefined} rel="noopener" target="eh-screen" className={`btn px-4 text-sm ${url ? "" : "pointer-events-none opacity-50"}`} aria-disabled={!url}>Open full screen</a>
      </div>
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/[0.14] bg-black">
        {url ? <iframe key={url} title={`Preview of the ${KINDS.find((k) => k.id === kind)!.label} screen`} src={url} className="h-full w-full" loading="lazy" /> : <div className="grid h-full place-items-center text-sm text-zinc-400">Loading the preview…</div>}
      </div>
      <p className="text-xs text-zinc-400">This is example data. In your own tools, the Open the screen button shows your real standings, table or schedule.</p>
    </div>
  );
}
