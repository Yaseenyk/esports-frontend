"use client";

import { useEffect, useMemo, useState } from "react";
import { applyTo, createListing, fetchListing, fetchMine, fetchMyTeamPages, reportListing } from "@/features/lft/services/lft.api";
import { checkApplicationMessage, checkContact, createBody, hintFor, validateCreate, type CreateForm, type FormErrors } from "@/features/lft/validators";
import { explainFailure } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";

/** Apply to one listing. Hints come from the client rules; whatever the server refuses is shown in plain words. */
export function useApply(listingId: string) {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [extra, setExtra] = useState({ instagram: "", ign: "" }); // more contacts to share after an accept (team matching on)
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const hints = useMemo(() => ({ message: hintFor("application", checkApplicationMessage(message)), contact: contact ? hintFor("contact", checkContact(contact)) : touched ? hintFor("contact", checkContact(contact)) : "" }), [message, contact, touched]);
  const extraBad = Object.values(extra).filter((x) => x.trim()).map((x) => hintFor("contact", checkContact(x))).find(Boolean) ?? "";
  const valid = !hintFor("application", checkApplicationMessage(message)) && !hintFor("contact", checkContact(contact)) && !extraBad;
  const submit = async () => {
    setTouched(true);
    if (!valid || busy) return;
    setBusy(true); setError("");
    const more = Object.fromEntries(Object.entries(extra).filter(([, v]) => v.trim()).map(([k, v]) => [k, v.trim()]));
    const r = await applyTo(listingId, message.trim(), contact.trim(), Object.keys(more).length ? { discord: contact.trim(), ...more } : undefined);
    setBusy(false);
    if (r.ok) setSent(true); else setError(explainFailure(r.failure));
  };
  return { message, setMessage, contact, setContact, extra, setExtra, extraBad, hints, submit, busy, error, sent };
}

export function useReport(listingId: string) {
  const [reason, setReason] = useState("spam");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const submit = async () => {
    setBusy(true); setError("");
    const r = await reportListing(listingId, reason, note);
    setBusy(false);
    if (r.ok) setDone(true); else setError(explainFailure(r.failure));
  };
  return { reason, setReason, note, setNote, submit, busy, error, done };
}

export const BLANK_CREATE: CreateForm = { kind: "looking_for_team", game: "", roles: [], rankMin: "", rankMax: "", state: "", city: "", onlineOk: true, message: "", contact: "", expiresInDays: "14", teamProfileId: "", languages: [], playHours: [], contacts: { discord: "", instagram: "", ign: "" } };

export function useCreateListing() {
  const [form, setForm] = useState<CreateForm>(BLANK_CREATE);
  const [shown, setShown] = useState(false); // errors appear after the first submit, not while typing the first word
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const errors: FormErrors = useMemo(() => validateCreate(form), [form]);
  const set = <K extends keyof CreateForm>(k: K, v: CreateForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggleIn = (k: "languages" | "playHours", v: string) => setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : f[k].length < 5 ? [...f[k], v] : f[k] }));
  const setContact = (k: keyof CreateForm["contacts"], v: string) => setForm((f) => ({ ...f, contacts: { ...f.contacts, [k]: v } }));
  const toggleRole = (r: string) => setForm((f) => ({ ...f, roles: f.roles.includes(r) ? f.roles.filter((x) => x !== r) : f.roles.length < 4 ? [...f.roles, r] : f.roles }));

  useEffect(() => {
    if (form.kind !== "looking_for_player" || teams.length) return;
    let live = true;
    fetchMyTeamPages().then((r) => { if (live && r.ok) setTeams(r.data); });
    return () => { live = false; };
  }, [form.kind, teams.length]);

  const submit = async () => {
    setShown(true);
    if (Object.keys(errors).length || busy) return;
    setBusy(true); setServerError("");
    const r = await createListing(createBody(form));
    setBusy(false);
    if (r.ok) setCreatedId(r.data?.id ?? "done"); else setServerError(explainFailure(r.failure));
  };
  return { form, set, toggleRole, toggleIn, setContact, errors: shown ? errors : ({} as FormErrors), submit, busy, serverError, createdId, teams };
}

/** One listing from its id (`null` while the id is not known yet, which resolves to "no listing"). */
export function useListing(id: string | null) {
  return useResource(() => (id ? fetchListing(id) : Promise.resolve({ ok: true as const, data: null })), [id]);
}

/** True when the listing is one of the signed-in person's own (read in parallel with the listing itself, never cached). `null` while unknown. */
export function useIsOwnListing(id: string | null, signedIn: boolean): boolean | null {
  const mine = useResource(() => (signedIn ? fetchMine() : Promise.resolve({ ok: true as const, data: [] })), [signedIn]);
  if (!id || mine.phase === "loading") return null;
  return mine.phase === "ready" ? mine.data.some((m) => m.id === id) : false; // if the check failed the server still refuses the application
}
