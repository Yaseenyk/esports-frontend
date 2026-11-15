/** The dispute domain: plain types and labels, no imports. */
export interface DisputeListItem {
  id: string; tournament: { slug: string; title: string }; type: string; status: string; summary: string; raisedByTeam: string | null; againstTeam: string | null;
  evidenceCount: number; dueAt: string | null; overdue: boolean; createdAt: string;
}
export interface DisputeEvent { id: string; actorRole: string; action: string; fromStatus: string | null; toStatus: string | null; note: string | null; createdAt: string }
export interface EvidenceItem { id: string; mimeType: string; sizeBytes: number; caption: string | null; createdAt: string; purged: boolean; purgeAfter: string | null }
export interface Correction { matchRef: string; oldValue: Record<string, number | string>; newValue: Record<string, number | string> }
export interface Permissions { canComment: boolean; canUploadEvidence: boolean; canWithdraw: boolean; transitions: string[]; canResolve: boolean; role: string }
export interface DisputeDetail extends DisputeListItem {
  matchId: string | null; matchNo: number | null; outcome: string | null; resolutionNote: string | null; resolvedAt: string | null; updatedAt: string;
  events: DisputeEvent[]; evidence: EvidenceItem[]; corrections: Correction[]; permissions: Permissions;
}

export const TYPES: { value: string; label: string }[] = [
  { value: "wrong_score", label: "Wrong score" }, { value: "tie_breaker", label: "Tie breaker" }, { value: "no_show", label: "No-show" },
  { value: "roster_violation", label: "Roster violation" }, { value: "cheating_claim", label: "Cheating claim" }, { value: "other", label: "Something else" },
];
export const typeLabel = (t: string): string => TYPES.find((x) => x.value === t)?.label ?? t;

export const STATUS_LABELS: Record<string, string> = {
  open: "Open", evidence_requested: "Evidence requested", under_review: "Under review", escalated: "Escalated to a moderator", resolved: "Resolved", rejected: "Rejected", withdrawn: "Withdrawn",
};
export const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral" | "accent"> = {
  open: "accent", evidence_requested: "warning", under_review: "accent", escalated: "warning", resolved: "success", rejected: "danger", withdrawn: "neutral",
};
export const statusLabel = (s: string): string => STATUS_LABELS[s] ?? s;
export const FINAL_STATUSES = ["resolved", "rejected", "withdrawn"];
export const ACTOR_LABELS: Record<string, string> = { team: "a team captain", raiser: "the person who raised it", organiser: "the organiser", moderator: "a moderator" };
export const OUTCOMES: Record<string, { value: string; label: string }[]> = {
  resolved: [{ value: "upheld", label: "Upheld" }, { value: "partially_upheld", label: "Partly upheld" }, { value: "no_action", label: "No action needed" }],
  rejected: [{ value: "rejected", label: "Rejected" }, { value: "no_action", label: "No action needed" }],
};
export const OUTCOME_LABELS: Record<string, string> = { upheld: "Upheld", partially_upheld: "Partly upheld", no_action: "No action needed", rejected: "Rejected" };

export function eventText(e: DisputeEvent): string {
  if (e.action === "raised") return "Dispute raised";
  if (e.action === "comment") return "Comment";
  if (e.action === "evidence_added") return "Evidence added";
  if (e.action.startsWith("status_")) return `Status changed to ${statusLabel(e.action.slice(7))}`;
  return e.action;
}
