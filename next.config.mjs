/** @type {import('next').NextConfig} */

// For a PROJECT site (https://<username>.github.io/<repo>), set
// NEXT_PUBLIC_BASE_PATH=/<repo> in the build environment.
// Leave it empty for a USER/ORG site (https://<username>.github.io) or a
// custom domain — see the basePath note in the deploy docs.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * THE v3 NAV SWITCH. Decides which v3 sections get a link in the site footer (src/features/shared/flags.ts reads the result).
 *   V3_NAV unset or "auto": probe the public API at build time; a section is linked only when its public endpoint answers 200
 *                           (tournaments: /public/tournaments, LFT: /public/lft). While the backend flags are off both answer 404, so nothing is linked.
 *   V3_NAV="tournaments,lft,resume,disputes,scrims,profiles" (any subset) or "all": link exactly those, whatever the probe says (resume and disputes have no public probe).
 *   Phases 3-5 (24 Nov 2026): scrims answers 200 on /public/scrims; profiles answers 401 (not 404) on /v3/me/team-pages to a caller without a token once its flag is on.
 *   V3_NAV="off": link nothing.
 */
async function v3Nav() {
  const mode = (process.env.V3_NAV ?? "auto").trim().toLowerCase();
  if (mode === "off" || mode === "none") return "";
  if (mode === "all") return "tournaments,lft,resume,disputes,scrims,profiles";
  if (mode !== "auto" && mode !== "") return mode;
  const api = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (!api) return "";
  const probe = async (path, want = 200) => {
    try { const r = await fetch(api + path, { signal: AbortSignal.timeout(5000) }); return r.status === want; } catch { return false; }
  };
  // calendar: /public/calendar answers 200 only with flag v3.calendar on (the /calendar/ page is emitted under the same condition, see prune-community.mjs)
  const [t, l, s, p, c] = await Promise.all([probe("/public/tournaments?limit=1"), probe("/public/lft?limit=1"), probe("/public/scrims?limit=1"), probe("/v3/me/team-pages", 401), probe("/public/calendar")]);
  return [t && "tournaments", l && "lft", s && "scrims", p && "profiles", c && "calendar"].filter(Boolean).join(",");
}

export default async function config() {
  const nextConfig = {
    output: "export", // static HTML export → ./out
    images: { unoptimized: true }, // GitHub Pages can't run Next image optimization
    trailingSlash: true, // emit /route/index.html for reliable GitHub Pages routing
    env: { NEXT_PUBLIC_V3_NAV: await v3Nav() },
    ...(basePath && { basePath }),
  };
  return nextConfig;
}
