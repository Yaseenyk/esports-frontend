"use client";

import { useEffect } from "react";

/** Sets <html lang> while this page is open and puts the previous value back when the visitor moves on (the root layout says "en"). */
export default function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const el = document.documentElement, before = el.lang;
    el.lang = lang;
    return () => { el.lang = before && before !== lang ? before : "en"; };
  }, [lang]);
  return null;
}
