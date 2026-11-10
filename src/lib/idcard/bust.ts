/**
 * A stylised head-and-shoulders figure with a transparent background. It stands in for a real cut-out photo so poster-style cards
 * look right before anyone has uploaded a picture. Skin, hair and style come from the name, so each person looks a little different.
 */
const SKIN = ["#f1c8a5", "#e0ad85", "#b97d54", "#7a4b2d"];
const HAIR = ["#17181b", "#3a281d", "#6b4423", "#26303b", "#5b2a2a"];
const cache = new Map<string, string>();

function hash(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

export function bustDataUri(name: string, shirt = "#334155"): string {
  const key = `${name}|${shirt}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const h = hash(name || "player");
  const skin = SKIN[h % SKIN.length], hair = HAIR[(h >> 3) % HAIR.length], style = (h >> 6) % 4, glasses = (h >> 9) % 3 === 0;
  const shade = "rgba(0,0,0,.12)";
  const back = style === 2 ? `<path d="M52 112 Q48 40 100 36 Q152 40 148 112 L162 232 L38 232Z" fill="${hair}"/>` : "";
  const top = [
    `<path d="M55 102 Q50 46 100 44 Q150 46 145 102 Q130 70 100 72 Q70 70 55 102Z" fill="${hair}"/>`,
    `<g fill="${hair}"><circle cx="62" cy="72" r="20"/><circle cx="84" cy="56" r="22"/><circle cx="112" cy="54" r="22"/><circle cx="136" cy="70" r="20"/><circle cx="100" cy="74" r="20"/></g>`,
    `<path d="M55 104 Q50 46 100 42 Q150 46 145 104 Q128 66 100 70 Q72 66 55 104Z" fill="${hair}"/>`,
    `<g fill="${hair}"><circle cx="100" cy="34" r="19"/><path d="M55 100 Q52 50 100 48 Q148 50 145 100 Q128 72 100 74 Q72 72 55 100Z"/></g>`,
  ][style];
  const gl = glasses ? `<g fill="none" stroke="#1b1b1f" stroke-width="3"><circle cx="84" cy="110" r="12"/><circle cx="116" cy="110" r="12"/><path d="M96 110 H104"/></g>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">${back}<path d="M6 260 C6 206 44 184 100 184 C156 184 194 206 194 260Z" fill="${shirt}"/><rect x="86" y="148" width="28" height="48" rx="12" fill="${skin}"/><rect x="86" y="170" width="28" height="12" fill="${shade}"/><ellipse cx="100" cy="106" rx="44" ry="54" fill="${skin}"/>${top}<ellipse cx="56" cy="112" rx="7" ry="11" fill="${skin}"/><ellipse cx="144" cy="112" rx="7" ry="11" fill="${skin}"/><circle cx="84" cy="110" r="3.6" fill="#1b1b1f"/><circle cx="116" cy="110" r="3.6" fill="#1b1b1f"/>${gl}<path d="M86 132 Q100 144 114 132" stroke="#7a3b2e" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>`;
  const uri = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  cache.set(key, uri);
  return uri;
}
