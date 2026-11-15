import { v3Enabled, type V3Section } from "@/features/shared/flags";

/** The first part of the delete-account confirmation (unchanged wording from before the v3 features). */
export const DELETE_BASE = "Delete your account and everything saved online? Events that have a co-organiser are handed over to them; your other events, rosters, photos and check-ins are deleted. This cannot be undone. Your copies in this browser stay.";

/**
 * The native confirm text for "Delete my account". The extra sentences say exactly what the server removes for the v3 features
 * (esports-backend `src/v3/services/account-service.ts`): resume, games, listings, applications and captain links are deleted; a dispute you raised stays
 * for the other team and the organiser but loses your name and your text and every screenshot you uploaded; feedback reports linked to the account are deleted.
 * A sentence about a section appears only while that section is switched on.
 */
export function deleteConfirmText(on: (s: V3Section) => boolean = v3Enabled): string {
  const gone = [...(on("resume") ? ["your esports resume"] : []), ...(on("lft") ? ["your team-finder posts and applications"] : []), "any feedback you linked to your account"];
  const list = gone.length > 1 ? `${gone.slice(0, -1).join(", ")} and ${gone[gone.length - 1]}` : gone[0];
  const disputes = on("disputes") ? " Disputes you raised stay for the other team and the organiser, but your name and the text you wrote in them are removed and the screenshots you uploaded are deleted." : "";
  return `${DELETE_BASE} Also deleted: ${list}.${disputes}`;
}
