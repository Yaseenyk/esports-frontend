"use client";

import { useEffect, useMemo, useState } from "react";
import { applyTo, createListing, fetchListing, fetchMyTeamPages, reportListing } from "@/features/lft/services/lft.api";
import { checkApplicationMessage, checkContact, createBody, hintFor, validateCreate, type CreateForm, type FormErrors } from "@/features/lft/validators";
import { explainFailure } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";

/** Apply to one listing. Hints come from the client rules; whatever the server refuses is shown in plain words. */
export function useApply(listingId: string) {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const hints = useMemo(() => ({ message: hintFor("application", checkApplicationMessage(message)), contact: contact ? hintFor("contact", checkContact(contact)) : touched ? hintFor("contact", checkContact(contact)) : "" }), [message, contact, touched]);
  const valid = !hintFor("application", checkApplicationMessage(message)) && !hintFor("contact", checkContact(contact));
  const submit = async () => {
    setTouched(true);
    if (!valid || busy) return;
    setBusy(true); setError("");
    const r = await applyTo(listingId, message.trim(), contact.trim());
    setBusy(false);
    if (r.ok) setSent(true); else setError(explainFailure(r.failure));
  };
  return { message, setMessage, contact, setContact, hints, submit, busy, error, sent };
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

export const BLANK_CREATE: CreateForm = { kind: "looking_for_team", game: "", roles: [], rankMin: "", rankMax: "", state: "", city: "", onlineOk: true, message: "", contact: "", expiresInDays: "14", teamProfileId: "" };

export function useCreateListing() {
  const [form, setForm] = useState<CreateForm>(BLANK_CREATE);
  const [shown, setShown] = useState(false); // errors appear after the first submit, not while typing the first word
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const errors: FormErrors = useMemo(() => validateCreate(form), [form]);
  const set = <K extends keyof CreateForm>(k: K, v: CreateForm[K]) => setForm((f) => ({ ...f, [k]: v }));
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
  return { form, set, toggleRole, errors: shown ? errors : ({} as FormErrors), submit, busy, serverError, createdId, teams };
}

/** One listing from its id (`null` while the id is not known yet, which resolves to "no listing"). */
export function useListing(id: string | null) {
  return useResource(() => (id ? fetchListing(id) : Promise.resolve({ ok: true as const, data: null })), [id]);
}
