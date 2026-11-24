// TEST FIXTURE SERVER, never shipped. Answers the community endpoints with BOTH flags on, plus one fixture tournament, so a build can be tried
// with the calendar and the trust score switched on:
//   node scripts/mock-community-api.mjs [port]            then:   rm -rf .next && NEXT_PUBLIC_API_URL=http://localhost:8799 npm run build
//   MOCK_CAL_UPCOMING=3 node scripts/mock-community-api.mjs   only 3 upcoming entries: the calendar must build noindex and stay out of the sitemap.
//   MOCK_COMMUNITY=off node scripts/mock-community-api.mjs    both flags off (status 404): no community page may be emitted.
// Everything here is invented test data. It exists only in this file and in the local build you run against it.
import http from "node:http";

const port = Number(process.argv[2] || process.env.PORT || 8799);
const off = process.env.MOCK_COMMUNITY === "off";
const upcoming = Number(process.env.MOCK_CAL_UPCOMING ?? 6);
const long = (s, n) => (s + " ").repeat(Math.ceil(n / (s.length + 1))).trim();
const day = (n) => new Date(Date.now() + 330 * 60_000 + n * 86_400_000).toISOString().slice(0, 10);
const org = { name: "Fixture Institute of Technology", slug: "fixture-institute", verified: true };
const GAMES = ["valorant", "bgmi", "free_fire", "cod_mobile", "cs2", "bgmi", "valorant", "bgmi"];
const CITIES = ["Pune", "Nagpur", "Pune", "Mumbai", "Bengaluru", "Pune", "Hyderabad", "Delhi"];

const entries = [
  ...Array.from({ length: upcoming }, (_, i) => ({
    id: `fx${i}`.padEnd(32, "0"), title: `Fixture Fest Cup ${i + 1}`, game: GAMES[i % GAMES.length], city: CITIES[i % CITIES.length], online: i === 4,
    startsOn: day(3 + i * 9), endsOn: day(4 + i * 9), status: "listed", registrationUrl: i === 0 ? null : `https://forms.example.org/fixture-${i + 1}`,
    tournamentSlug: i === 0 ? "fixture-community-cup" : null, organiser: org,
  })),
  { id: "fxcancel".padEnd(32, "0"), title: "Fixture Cancelled Cup", game: "bgmi", city: "Pune", online: false, startsOn: day(5), endsOn: day(5), status: "cancelled", registrationUrl: null, tournamentSlug: null, organiser: org },
];

const T = {
  slug: "fixture-community-cup", title: "Fixture Community Cup", status: "completed", game: "valorant", format: "single_elimination", venue: "offline", city: "Pune", state: "Maharashtra",
  startsAt: "2030-11-20T04:30:00.000Z", endsAt: "2030-11-20T12:00:00.000Z", publishedAt: "2030-11-01T10:00:00.000Z", maxTeams: 16, seoReady: false,
  summary: long("Test tournament used only to check the community build.", 120),
};
const detail = {
  tournament: { ...T, description: null, rules: "Squads of five." },
  registration: { open: false, registered: 8, approved: 8, spotsLeft: 0 },
  teams: [], schedule: [], results: { matches: [], battleRoyale: [] }, hasResults: false,
};

http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  const send = (code, body) => { res.writeHead(code, { "content-type": "application/json", "access-control-allow-origin": "*" }); res.end(JSON.stringify(body)); };
  if (req.method === "OPTIONS") { res.writeHead(204, { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }); return res.end(); }
  if (off) return send(404, { error: "Not found" });
  if (u.pathname === "/public/community/status") return send(200, { calendar: true, trust: true });
  if (u.pathname === "/public/calendar") return send(200, { items: entries, upcomingVerified: upcoming, minimumForIndex: 5, today: day(0) });
  if (u.pathname === "/public/tournaments") return send(200, { items: [T] });
  if (u.pathname === `/public/tournaments/${T.slug}`) return send(200, detail);
  send(404, { error: "Not found" });
}).listen(port, () => console.log(`mock community API on ${port}${off ? " (flags off)" : ` (${upcoming} upcoming)`}`));
