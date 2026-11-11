/** The team sign-up form text. Shared by the registration tool and the tournament planner, so both always ask the same questions. Pure. */
export const REG_PRESETS = [
  { id: "squad", label: "Squad game (for example Free Fire or BGMI)", size: 4, subs: 1 },
  { id: "five", label: "5 v 5 game (for example Valorant)", size: 5, subs: 1 },
  { id: "duo", label: "Duo", size: 2, subs: 0 },
  { id: "solo", label: "Solo player", size: 1, subs: 0 },
] as const;
export type RegPresetId = (typeof REG_PRESETS)[number]["id"];

export function regPreset(id: RegPresetId) { return REG_PRESETS.find((x) => x.id === id) ?? REG_PRESETS[0]; }

export function registrationText(id: RegPresetId, event: string): string {
  const p = regPreset(id);
  const lines = [`${event || "Your event"}: team registration`, "", "About the team", "1. Team name", "2. College, club or city"];
  lines.push("", "Captain", `${lines.filter((l) => /^\d+\./.test(l)).length + 1}. Captain's full name`, `${lines.filter((l) => /^\d+\./.test(l)).length + 2}. Captain's phone number or email`);
  let n = lines.filter((l) => /^\d+\./.test(l)).length;
  lines.push("", `Players (${p.size}${p.subs ? ` and up to ${p.subs} substitute${p.subs === 1 ? "" : "s"}` : ""})`);
  for (let i = 1; i <= p.size + p.subs; i++) lines.push(`${++n}. ${i <= p.size ? `Player ${i}` : `Substitute ${i - p.size}`}: full name, in-game name or ID, and whether under 18`);
  lines.push("", "Before you submit", `${++n}. Anything the organiser should know (optional)`, `${++n}. I have read the rules and I agree to follow them (yes or no)`, `${++n}. Players under 18 have a parent or guardian's consent (yes, no or not applicable)`);
  return lines.join("\n");
}
