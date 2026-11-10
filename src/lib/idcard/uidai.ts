/**
 * Checks the digital signature inside a Secure QR code against a UIDAI certificate.
 *
 * The payload is gzip data. Once unpacked, its last 256 bytes are an RSA signature (SHA-256, PKCS#1 v1.5) over every byte before them.
 * A matching signature proves the QR was produced by UIDAI and has not been edited since. Without the certificate the check cannot run,
 * so the result is "unchecked" rather than a guess. The certificate is a public file that UIDAI publishes on its developer downloads page.
 */
export type Verdict = "valid" | "invalid" | "unchecked";

type Node = { tag: number; start: number; end: number; off: number };
function node(b: Uint8Array, off: number): Node {
  const tag = b[off]; let len = b[off + 1], hdr = 2;
  if (len & 0x80) { const n = len & 0x7f; len = 0; for (let i = 0; i < n; i++) len = len * 256 + b[off + 2 + i]; hdr = 2 + n; }
  return { tag, off, start: off + hdr, end: off + hdr + len };
}

/** Pulls the public key (SubjectPublicKeyInfo) out of an X.509 certificate in DER form, which is what WebCrypto can import. */
export function spkiFromCert(der: Uint8Array): Uint8Array {
  const cert = node(der, 0); if (cert.tag !== 0x30) throw new Error("not a certificate");
  const tbs = node(der, cert.start); if (tbs.tag !== 0x30) throw new Error("not a certificate");
  let off = tbs.start;
  const kids: Node[] = [];
  while (off < tbs.end) { const n = node(der, off); kids.push(n); off = n.end; }
  const i0 = kids[0].tag === 0xa0 ? 1 : 0; // skip the optional version field
  const spki = kids[i0 + 5]; // serial, signature algorithm, issuer, validity, subject, then the public key
  if (!spki || spki.tag !== 0x30) throw new Error("no public key in the certificate");
  return der.subarray(spki.off, spki.end);
}

/** Verifies the signature at the end of already-unpacked Secure QR bytes. Returns false for any mismatch. */
export async function verifyUnpacked(unpacked: Uint8Array, certDer: ArrayBuffer | Uint8Array): Promise<boolean> {
  if (unpacked.length <= 256) return false;
  try {
    const der = certDer instanceof Uint8Array ? certDer : new Uint8Array(certDer);
    const key = await crypto.subtle.importKey("spki", spkiFromCert(der) as unknown as BufferSource, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, unpacked.subarray(unpacked.length - 256) as unknown as BufferSource, unpacked.subarray(0, unpacked.length - 256) as unknown as BufferSource);
  } catch { return false; }
}

/** The UIDAI certificates this site has been given (public/vendor/uidai-secure-qr*.cer). Fetched once; missing files are simply skipped. */
let certsP: Promise<Uint8Array[]> | null = null;
export function loadUidaiCerts(): Promise<Uint8Array[]> {
  certsP ??= (async () => {
    const base = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/vendor/`;
    const out: Uint8Array[] = [];
    for (const name of ["uidai-secure-qr.cer", "uidai-secure-qr-2.cer", "uidai-secure-qr-3.cer"]) {
      try {
        const r = await fetch(base + name);
        const type = r.headers.get("content-type") ?? "";
        if (r.ok && !type.includes("text/html")) out.push(new Uint8Array(await r.arrayBuffer()));
      } catch { /* not installed */ }
    }
    return out;
  })();
  return certsP;
}

export async function verdictFor(unpacked: Uint8Array, certs: Uint8Array[]): Promise<Verdict> {
  if (!certs.length) return "unchecked";
  for (const c of certs) if (await verifyUnpacked(unpacked, c)) return "valid";
  return "invalid";
}
