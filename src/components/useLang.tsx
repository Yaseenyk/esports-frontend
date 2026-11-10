"use client";

import { useCallback, useSyncExternalStore } from "react";
import { isLang, LANGS, translate, type Key, type Lang } from "@/lib/i18n";

const KEY = "eh-lang";
const listeners = new Set<() => void>();
let current: Lang = "en";
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = localStorage.getItem(KEY);
    if (isLang(saved)) current = saved;
    else { const nav = navigator.language?.slice(0, 2); if (isLang(nav)) current = nav; } // first visit: follow the phone's language
  } catch { /* private mode */ }
  document.documentElement.lang = current;
}

const subscribe = (l: () => void) => { load(); listeners.add(l); return () => { listeners.delete(l); }; };
const snapshot = () => { load(); return current; };

/** The chosen language (English until the page has loaded, so the first paint matches the server HTML) and a `t()` for it. */
export function useLang() {
  const lang = useSyncExternalStore(subscribe, snapshot, () => "en" as Lang);
  const setLang = useCallback((l: Lang) => {
    current = l; document.documentElement.lang = l;
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
    listeners.forEach((f) => f());
  }, []);
  const t = useCallback((key: Key, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);
  return { lang, setLang, t };
}

/** A small language chooser. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  return (
    <div className={`flex items-center gap-1.5 ${className}`} role="group" aria-label={t("language")}>
      {LANGS.map((l) => <button key={l.code} type="button" lang={l.code} aria-pressed={lang === l.code} onClick={() => setLang(l.code)} className={`chip !min-h-8 !px-3 text-xs ${lang === l.code ? "!border-cyan !text-cyan" : ""}`}>{l.label}</button>)}
    </div>
  );
}
