/** Games and roles shared by the LFT board and the Esports Resume (the values the API accepts). */
export const GAMES: { value: string; label: string }[] = [
  { value: "bgmi", label: "BGMI" }, { value: "free_fire", label: "Free Fire" }, { value: "valorant", label: "Valorant" }, { value: "cod_mobile", label: "COD Mobile" }, { value: "cs2", label: "CS2" }, { value: "other", label: "Other game" },
];
export const ROLES = ["igl", "assaulter", "support", "sniper", "scout", "entry", "flex", "controller", "duelist", "initiator", "sentinel", "coach", "manager", "substitute"] as const;
export const ROLE_LABELS: Record<string, string> = { igl: "IGL", assaulter: "Assaulter", support: "Support", sniper: "Sniper", scout: "Scout", entry: "Entry", flex: "Flex", controller: "Controller", duelist: "Duelist", initiator: "Initiator", sentinel: "Sentinel", coach: "Coach", manager: "Manager", substitute: "Substitute" };
export const gameLabel = (g: string): string => GAMES.find((x) => x.value === g)?.label ?? g;
