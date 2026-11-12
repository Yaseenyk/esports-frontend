"use client";

import { useEffect, useRef, useState } from "react";

/** The public OAuth client id (not a secret). Same value as GOOGLE_CLIENT_ID in the Worker's wrangler.toml. */
export const GOOGLE_CLIENT_ID = "799281032291-pc0pqmu29g0c4d5fddrmrqi0nrt3kff7.apps.googleusercontent.com";

/** The origins registered for the OAuth client in Google Cloud. */
const GOOGLE_ORIGINS = ["https://esports.streamerosai.com", "http://localhost:3000"];

interface Gsi { accounts: { id: { initialize(o: { client_id: string; callback: (r: { credential?: string }) => void; use_fedcm_for_prompt?: boolean }): void; renderButton(el: HTMLElement, o: Record<string, unknown>): void } } }
declare global { interface Window { google?: Gsi } }

let loading: Promise<Gsi | null> | null = null;
/** Loads Google's sign-in script once, only on the sign-in and sign-up forms. Resolves null when it cannot load (offline, blocked). */
function loadGsi(): Promise<Gsi | null> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!GOOGLE_ORIGINS.includes(window.location.origin)) return Promise.resolve(null); // Google only accepts the origins registered for the client; elsewhere (previews, tests) the button stays away
  loading ??= new Promise((done) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => done(window.google ?? null);
    s.onerror = () => { loading = null; done(null); };
    document.head.appendChild(s);
  });
  return loading;
}

/**
 * "Continue with Google". Google draws its own button; when it hands back an ID token, onCredential sends it to our server,
 * which checks it. If the script cannot load, nothing is shown and email and password still work.
 */
export default function GoogleButton({ onCredential, disabled, onReady }: { onCredential: (credential: string) => void; disabled?: boolean; onReady?: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let gone = false;
    void loadGsi().then((g) => {
      if (gone || !g || !box.current) return;
      g.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: (r) => { if (r.credential) cb.current(r.credential); } });
      g.accounts.id.renderButton(box.current, { type: "standard", theme: "filled_black", size: "large", text: "continue_with", shape: "pill", width: 320 });
      setReady(true);
      onReadyRef.current?.();
    });
    return () => { gone = true; };
  }, []);

  return (
    <div className={`flex justify-center ${ready ? "" : "hidden"} ${disabled ? "pointer-events-none opacity-50" : ""}`} aria-disabled={disabled || undefined} data-testid="google-button">
      <div ref={box} style={{ colorScheme: "light" }} />
    </div>
  );
}
