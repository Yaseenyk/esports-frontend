/**
 * The tournament state machine as the organiser sees it (API.md section 2). Pure.
 * The API gives no "allowed next states" list on a read; it enforces the machine on every move and answers 409 `bad_transition` with
 * `allowed` when a move is not possible. This mirrors `esports-backend/src/v3/lib/state-machines.ts` so the screen offers only the legal
 * moves and says why a legal move is blocked right now. The server stays the authority: a 409 is shown in plain words too.
 */
import type { TournamentStatus } from "@/features/tournaments/organiser/domain";

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", published: "Published", registration_open: "Registration open", registration_closed: "Registration closed", live: "Live", completed: "Completed", cancelled: "Cancelled",
};
export const statusLabel = (s: string): string => STATUS_LABELS[s] ?? s;
export const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral" | "accent"> = {
  draft: "neutral", published: "accent", registration_open: "success", registration_closed: "warning", live: "success", completed: "neutral", cancelled: "danger",
};

export const MOVES: Readonly<Record<TournamentStatus, readonly TournamentStatus[]>> = {
  draft: ["published", "cancelled"],
  published: ["registration_open", "cancelled"],
  registration_open: ["registration_closed", "cancelled"],
  registration_closed: ["live", "cancelled"],
  live: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

/** Disputes that still need a decision. `completed` is blocked while any exist (API.md). */
export const UNDECIDED_DISPUTES: readonly string[] = ["open", "evidence_requested", "under_review", "escalated"];
export const countUndecided = (statuses: readonly string[]): number => statuses.filter((s) => UNDECIDED_DISPUTES.includes(s)).length;

export interface TransitionContext {
  description: string | null; startsAt: string | null;
  /** How many disputes are undecided, or null when it has not been checked (the server checks again anyway). */
  openDisputes: number | null;
  /** Unsaved edits in the form: the server only sees what is saved. */
  dirty: boolean;
}

export interface TransitionOption {
  to: TournamentStatus; label: string; /** What it does, in a sentence. */ help: string; destructive: boolean;
  blocked: boolean; /** Why it is blocked right now; empty when it is not. */ reason: string;
}

const ACTIONS: Record<TournamentStatus, { label: string; help: string }> = {
  draft: { label: "Back to draft", help: "" },
  published: { label: "Publish the page", help: "Makes the page public so you can share the link. Registration is not open yet. The address can no longer be changed." },
  registration_open: { label: "Open registration", help: "Teams can register. Needs a description and a start date." },
  registration_closed: { label: "Close registration", help: "No new registrations. Disputes can be raised from here on." },
  live: { label: "Start the tournament", help: "Marks the tournament as live." },
  completed: { label: "Mark as completed", help: "Final. The page cannot be edited afterwards. Blocked while a dispute is undecided." },
  cancelled: { label: "Cancel the tournament", help: "Final. The page stops being public and cannot be edited afterwards." },
};

export function blockedReason(to: TournamentStatus, c: TransitionContext): string {
  if (c.dirty) return "Save your changes first: a move uses what is saved, not what is on screen.";
  if (to === "registration_open") {
    const missing = [!c.description?.trim() && "a description", !c.startsAt && "a start date"].filter(Boolean);
    if (missing.length) return `Registration can only open with ${missing.join(" and ")}. Add ${missing.length === 2 ? "them" : "it"} above and save.`;
  }
  if (to === "completed" && c.openDisputes !== null && c.openDisputes > 0) {
    return `${c.openDisputes} dispute${c.openDisputes === 1 ? " is" : "s are"} still undecided. Decide ${c.openDisputes === 1 ? "it" : "them"} in the disputes queue first.`;
  }
  return "";
}

/** The moves offered from `status`: only the legal ones, each with a reason when it is blocked right now. Cancel is listed last. */
export function transitionOptions(status: string, c: TransitionContext): TransitionOption[] {
  const next = MOVES[status as TournamentStatus] ?? [];
  const ordered = [...next.filter((t) => t !== "cancelled"), ...next.filter((t) => t === "cancelled")];
  return ordered.map((to) => {
    const reason = blockedReason(to, c);
    return { to, label: ACTIONS[to].label, help: ACTIONS[to].help, destructive: to === "cancelled", blocked: reason !== "", reason };
  });
}

/** The server's refusal, in plain words (the codes are in API.md). `to` is the move that was tried. */
export function explainTransitionError(code: string | undefined, to: string): string {
  switch (code) {
    case "needs_description_and_start": return "Registration can only open with a description and a start date. Add them, save, and try again.";
    case "disputes_open": return "A tournament cannot be completed while a dispute is undecided. Decide every open dispute in the disputes queue first.";
    case "bad_transition": return `The tournament cannot move to "${statusLabel(to)}" from where it is now. The page was out of date; it has been reloaded.`;
    case "tournament_final": return "A finished tournament cannot be changed.";
    default: return "";
  }
}

/** Plain next-step line for the status card. */
export function nextStepText(status: string): string {
  switch (status) {
    case "draft": return "Only you can see this page. Fill in the details, then publish it.";
    case "published": return "The page is public and can be shared. Open registration when you are ready for teams to sign up.";
    case "registration_open": return "Teams can register. Close registration when you have enough teams.";
    case "registration_closed": return "Registration is closed. Start the tournament when you are ready.";
    case "live": return "The tournament is live. When it ends and every dispute is decided, mark it completed.";
    case "completed": return "This tournament is finished and cannot be edited.";
    case "cancelled": return "This tournament was cancelled and cannot be edited.";
    default: return "";
  }
}
