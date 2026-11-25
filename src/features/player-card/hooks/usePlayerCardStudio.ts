"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMyPlayerPage } from "@/features/profiles/hooks/useProfiles";
import { fetchOwnResume } from "@/features/resume/services/resume.api";
import { useResource } from "@/features/shared/hooks/useResource";
import { gameLabel, ROLE_LABELS } from "@/features/shared/games";
import { cardToPng, downloadBlob } from "@/lib/idcard/export";
import { themeById } from "@/lib/idcard/themes";
import type { Person, Role } from "@/lib/idcard/types";
import { SITE_URL } from "@/lib/site";
import { CARD_THEMES, photoProblem, qrValue, withQr, type CardForm } from "@/features/player-card/domain";

/** A data: URL to a Blob, without a network call. */
function dataUrlBlob(u: string): Blob {
  const [head, b64 = ""] = u.split(",");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: /data:([^;]+)/.exec(head ?? "")?.[1] ?? "image/png" });
}

/** Redraws a photo on a canvas (max 640 px): the result is a fresh JPEG, so no SVG, script or file metadata can ride along. Stays in this browser. */
function redraw(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 640 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
    img.src = url;
  });
}

/**
 * The player card studio: the signed-in player's own card. Name, team, game and role start from their resume and player page; the photo is picked
 * here and never uploaded. The QR holds the player's card link only when they choose "My player page" AND their profile is already shared:
 * this screen never shares anything by itself (the server refuses with share_first, and the screen sends them to that one step).
 */
export function usePlayerCardStudio() {
  const resume = useResource(fetchOwnResume, []);
  const m = useMyPlayerPage();
  const profile = resume.phase === "ready" ? resume.data.profile : null;
  const page = m.page;
  const [form, setForm] = useState<CardForm>({ name: "", team: "", game: "", role: "", photo: null, theme: CARD_THEMES[0], fmt: "portrait", qr: "page" });
  const [photoError, setPhotoError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const filled = useRef(false);

  useEffect(() => {
    if (filled.current || !profile) return;
    filled.current = true;
    const g = profile.games[0];
    setForm((f) => ({ ...f, name: profile.handle, game: g?.game ?? "", role: g?.roles[0] ?? "", team: page?.details.teamName ?? "" }));
  }, [profile, page]);
  useEffect(() => { if (page?.details.teamName) setForm((f) => (f.team ? f : { ...f, team: page.details.teamName ?? "" })); }, [page?.details.teamName]);

  const shared = !!page && page.visibility !== "private";
  const qr = form.qr === "page" ? qrValue(SITE_URL, page?.cardPath ?? null) : null;
  const inGame = profile?.games.find((g) => g.game === form.game)?.inGameName ?? "";

  const tpl = useMemo(() => {
    const t = (themeById(form.theme) ?? themeById(CARD_THEMES[0])!).make(form.fmt);
    return withQr(t, qr !== null, form.fmt);
  }, [form.theme, form.fmt, qr]);
  const person: Person = { id: inGame || "PLAYER", name: form.name || "Your name", teamId: "t", role: (ROLE_LABELS[form.role] ?? (form.role || "Player")) as Role, ...(form.photo ? { photo: form.photo } : {}) };
  const ctx = { event: "Player card", game: form.game ? gameLabel(form.game) : "", teamName: form.team, person, ...(qr ? { qr } : {}) };

  const setField = <K extends keyof CardForm>(k: K, v: CardForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const pickPhoto = async (file: File | null) => {
    if (!file) return;
    const p = photoProblem(file);
    if (p) { setPhotoError(p); return; }
    try { setPhotoError(""); setField("photo", await redraw(file)); } catch { setPhotoError("That file could not be read as a photo."); }
  };
  const download = async (node: HTMLElement | null) => {
    if (!node) return;
    setDownloading(true);
    try {
      const png = await cardToPng(node, 1100);
      downloadBlob(dataUrlBlob(png), `player-card-${(form.name || "player").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}.png`);
    } finally { setDownloading(false); }
  };

  return { resume, m, profile, page, shared, form, setField, pickPhoto, photoError, tpl, ctx, qr, download, downloading };
}
