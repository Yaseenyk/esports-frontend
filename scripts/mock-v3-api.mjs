// TEST FIXTURE SERVER, never shipped. Answers the PUBLIC v3 endpoints (API.md section 2) so the build can be tried with the backend flags "on":
//   node scripts/mock-v3-api.mjs [port]        then:   NEXT_PUBLIC_API_URL=http://localhost:8799 npm run build
//   MOCK_MANY=12 node scripts/mock-v3-api.mjs   12 ready tournaments published in one week, to see the weekly cap hold two back.
// Everything here is invented test data. It exists only in this file and in the local build you run against it.
import http from "node:http";

const port = Number(process.argv[2] || process.env.PORT || 8799);
const long = (s, n) => (s + " ").repeat(Math.ceil(n / (s.length + 1))).trim();
const base = { format: "battle_royale_points", game: "bgmi", venue: "offline", city: "Pune", state: "Maharashtra", endsAt: "2030-12-21T12:00:00.000Z", maxTeams: 16 };

const mk = (n, over = {}) => ({
  slug: `fixture-cup-${n}`, title: `Fixture Cup Number ${n}`, status: "registration_open", startsAt: "2030-12-20T04:30:00.000Z", publishedAt: `2030-11-0${(n % 7) + 1}T10:00:00.000Z`,
  summary: long(`Test tournament ${n} used only to check the build.`, 120), seoReady: true, ...base, ...over,
});
const many = Number(process.env.MOCK_MANY || 0);
const LIST = many
  ? Array.from({ length: many }, (_, i) => mk(i + 1, { publishedAt: `2030-11-0${(i % 6) + 1}T${String(10 + i).padStart(2, "0")}:00:00.000Z` }))
  : [
    mk(1),
    mk(2, { slug: "fixture-thin", title: "Fixture Thin Cup", summary: "Too short.", seoReady: false, status: "published" }),
    mk(3, { game: "valorant", format: "single_elimination", venue: "online", city: null, state: null, status: "completed", slug: "fixture-results-cup", title: "Fixture Results Cup" }),
  ];

const detail = (t) => ({
  tournament: { ...t, description: t.seoReady ? long(`Description of ${t.title}, written for the build check.`, 260) : null, rules: "Squads of four. Standard points. Room details are shared on the day." },
  registration: { open: t.status === "registration_open", registered: 9, approved: 6, spotsLeft: 7 },
  teams: [{ name: "Alpha Wolves", teamSlug: "alpha-wolves" }],
  schedule: [{ stage: "main", round: 1, slot: 1, teamA: "Alpha Wolves", teamB: "Unlisted team", startsAt: "2030-12-20T05:00:00.000Z", status: "scheduled" }],
  results: t.status === "completed"
    ? { matches: [{ stage: "main", round: 1, slot: 1, teamA: "Alpha Wolves", teamB: "Unlisted team", status: "finished", scoreA: 13, scoreB: 9, winner: "a", corrected: false }], battleRoyale: [{ matchNo: 1, team: "Alpha Wolves", placement: 1, kills: 11, corrected: true, original: { placement: 2, kills: 11 } }] }
    : { matches: [], battleRoyale: [] },
  hasResults: t.status === "completed",
});

http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  const send = (code, body) => { res.writeHead(code, { "content-type": "application/json", "access-control-allow-origin": "*" }); res.end(JSON.stringify(body)); };
  if (req.method === "OPTIONS") { res.writeHead(204, { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }); return res.end(); }
  if (u.pathname === "/public/tournaments") return send(200, { items: LIST.slice(0, Number(u.searchParams.get("limit") || 24)) });
  const m = u.pathname.match(/^\/public\/tournaments\/([a-z0-9-]+)(\/live)?$/);
  const t = m && LIST.find((x) => x.slug === m[1]);
  if (t && m[2]) return send(200, { slug: t.slug, status: t.status, registered: 11, spotsLeft: 5, open: t.status === "registration_open" });
  if (t) return send(200, detail(t));
  send(404, { error: "Not found" });
}).listen(port, () => console.log(`mock v3 API on ${port}${many ? ` (${many} tournaments)` : ""}`));
