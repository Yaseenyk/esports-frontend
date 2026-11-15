"use client";

import { useEffect, useState } from "react";
import { deleteGame, deleteProfile, fetchOwnResume, fetchPublicPlayer, giveConsent, saveGame, saveProfile, withdrawConsent } from "@/features/resume/services/resume.api";
import { confirmAdult } from "@/features/shared/services/account.api";
import { explainFailure, type V3Result } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import type { GameForm, ProfileForm, Visibility } from "@/features/resume/domain";
import { canChoose, gameBody, profileBody, validateGame, validateProfile, type GameErrors, type ProfileErrors } from "@/features/resume/validators";

export const BLANK_PROFILE: ProfileForm = { slug: "", handle: "", bio: "", city: "", state: "", languages: "" };
export const BLANK_GAME: GameForm = { game: "", inGameName: "", rankName: "", rankOrdinal: "", roles: [] };

/** The resume editor: one place for the form state, the rules and every write. After each write the resume is read again. */
export function useResumeEditor() {
  const res = useResource(fetchOwnResume, []);
  const [form, setForm] = useState<ProfileForm>(BLANK_PROFILE);
  const [game, setGame] = useState<GameForm>(BLANK_GAME);
  const [showProfileErrors, setShowProfileErrors] = useState(false);
  const [showGameErrors, setShowGameErrors] = useState(false);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [choice, setChoice] = useState<Visibility | null>(null); // the radio picked but not yet applied: selecting never saves
  const [visDone, setVisDone] = useState<"public" | "private" | "withdrawn" | null>(null); // the success line next to the visibility control
  const [focus, setFocus] = useState<{ seq: number; where: "top" | "vis" }>({ seq: 0, where: "top" }); // the screen moves focus to the status line when seq changes

  const data = res.phase === "ready" ? res.data : null;
  const profile = data?.profile ?? null;
  const adult = !!data?.adultConfirmedAt, consent = !!data?.resumeConsentAt;

  useEffect(() => {
    if (!profile) return;
    setForm({ slug: profile.slug, handle: profile.handle, bio: profile.bio ?? "", city: profile.city ?? "", state: profile.state ?? "", languages: profile.languages.join(", ") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.slug, profile?.handle, profile?.updatedAt]);

  const profileErrors: ProfileErrors = showProfileErrors ? validateProfile(form, !profile) : {};
  const gameErrors: GameErrors = showGameErrors ? validateGame(game) : {};

  const run = async (key: string, okText: string, call: () => Promise<V3Result<unknown>>, where: "top" | "vis" = "top", done: "public" | "private" | "withdrawn" | null = null) => {
    setBusy(key); setError(""); setNotice(""); setVisDone(null);
    const r = await call();
    setBusy("");
    if (r.ok) {
      if (where === "vis") setVisDone(done); else setNotice(okText);
      setChoice(null); setFocus((f) => ({ seq: f.seq + 1, where })); res.reload();
    } else { setError(explainFailure(r.failure)); setFocus((f) => ({ seq: f.seq + 1, where: "top" })); }
    return r.ok;
  };

  return {
    res, data, profile, adult, consent, busy, notice, error, visDone, focus, choice, chooseVisibility: setChoice,
    form, setForm: (k: keyof ProfileForm, v: string) => setForm((f) => ({ ...f, [k]: v })), profileErrors,
    game, setGameField: (k: keyof GameForm, v: string) => setGame((g) => ({ ...g, [k]: v })), gameErrors,
    toggleRole: (r: string) => setGame((g) => ({ ...g, roles: g.roles.includes(r) ? g.roles.filter((x) => x !== r) : g.roles.length < 4 ? [...g.roles, r] : g.roles })),
    editGame: (g: { game: string; inGameName: string; rankCode: string; rankOrdinal: number; roles: string[] }) => { setGame({ game: g.game, inGameName: g.inGameName, rankName: g.rankCode.replace(/_/g, " "), rankOrdinal: String(g.rankOrdinal), roles: g.roles }); setShowGameErrors(false); },
    confirmAdult: () => run("adult", "Thanks. Your 18+ confirmation is saved.", () => confirmAdult()),
    saveProfile: async () => {
      setShowProfileErrors(true);
      if (Object.keys(validateProfile(form, !profile)).length) return;
      await run("profile", "Profile saved.", () => saveProfile(profileBody(form, !profile)));
    },
    saveGame: async () => {
      setShowGameErrors(true);
      if (Object.keys(validateGame(game)).length) return;
      if (await run("game", "Game saved.", () => saveGame(game.game, gameBody(game)))) { setGame(BLANK_GAME); setShowGameErrors(false); }
    },
    removeGame: (g: string) => run(`del-${g}`, "Game removed.", () => deleteGame(g)),
    giveConsent: () => run("consent", "Consent saved. You can now choose Public.", () => giveConsent()),
    withdrawConsent: () => run("consent", "Consent withdrawn. Your resume is private again.", () => withdrawConsent(), profile ? "vis" : "top", "withdrawn"),
    /** Applies the picked visibility. Only called from an explicit button, never from the radio itself. */
    applyVisibility: (v: Visibility) => canChoose(v, adult, consent) ? run("visibility", "", () => saveProfile({ visibility: v }), "vis", v === "public" ? "public" : "private") : Promise.resolve(false),
    deleteResume: () => run("delete", "Your resume was deleted.", () => deleteProfile()),
  };
}

/** The public resume page: the slug comes from the query string (`?s=`). */
export function usePublicResume() {
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => { setSlug((new URLSearchParams(window.location.search).get("s") ?? "").trim().toLowerCase().slice(0, 60)); }, []);
  const res = useResource(() => (slug ? fetchPublicPlayer(slug) : Promise.resolve({ ok: true as const, data: null })), [slug]);
  return { slug, res };
}
