/**
 * Tamper-proof pass QR codes without a server. The organiser picks a passphrase; each person's QR holds
 *     EH1.<event>.<id>.<signature>
 * where the signature is an HMAC-SHA256 of the event, the id and the role, keyed by the passphrase. The gate device is given the same
 * passphrase and can tell a genuine pass from a copied or edited one, offline. The passphrase is never put in a QR or in the check-in pack.
 * (A shared secret means anyone who knows the passphrase can make passes, so keep it among the organisers.)
 */
const enc = new TextEncoder();

function b64url(buf: ArrayBuffer): string {
  let s = ""; new Uint8Array(buf).forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(passphrase: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(passphrase), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
}

/** A short, URL-safe id for an event, so passes for one event cannot be used at another. */
export const eventKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "event";

export async function signPass(passphrase: string, event: string, id: string, role: string): Promise<string> {
  const sig = (await hmac(passphrase, `${event}|${id}|${role}`)).slice(0, 16);
  return `EH1.${event}.${id}.${sig}`;
}

export interface PassCheck { ok: boolean; reason?: "format" | "wrong-event" | "bad-signature"; event?: string; id?: string }

/** The id is everything between the event and the signature, so ids containing dots still work. */
export function parsePass(code: string): { event: string; id: string; sig: string } | null {
  const m = code.trim().match(/^EH1\.([a-z0-9-]+)\.(.+)\.([A-Za-z0-9_-]{16})$/);
  return m ? { event: m[1], id: m[2], sig: m[3] } : null;
}

export async function verifyPass(passphrase: string, event: string, role: string, code: string): Promise<PassCheck> {
  const p = parsePass(code);
  if (!p) return { ok: false, reason: "format" };
  if (p.event !== event) return { ok: false, reason: "wrong-event", event: p.event, id: p.id };
  const want = (await hmac(passphrase, `${p.event}|${p.id}|${role}`)).slice(0, 16);
  return want === p.sig ? { ok: true, event: p.event, id: p.id } : { ok: false, reason: "bad-signature", event: p.event, id: p.id };
}
