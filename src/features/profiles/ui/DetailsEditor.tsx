"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SelectInput, TextInput } from "@/features/shared/ui/Fields";
import { box, btnDanger, btnSecondary, h3, helper, link } from "@/features/shared/ui/styles";
import { ACHIEVEMENTS_MAX, HIDEABLE, LINK_KINDS, LINKS_MAX, linkLabel, type Achievement, type HideableField, type LinkKind, type DetailsPatch, type OwnPlayerPage, type PageDetails, type PlayerLink } from "@/features/profiles/domain";

type Save = (key: string, patch: DetailsPatch, done: string) => Promise<boolean>;

/** Same rules as the server (which is the authority): http(s) only, no user:password. Saves a round trip for the obvious mistakes. */
function linkProblem(url: string): string {
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return "Use an address that starts with https://";
    if (u.username || u.password) return "Remove the user name and password from the address.";
    return "";
  } catch { return "That is not a web address. Copy it from your browser's address bar."; }
}

/**
 * The player's free hand: current team, social links, achievements, a show/hide switch for every field, and the search setting.
 * Every part saves on its own button; nothing is saved by typing or ticking alone.
 */
export function PageDetailsEditor({ details, busy, onSave }: { details: PageDetails; busy: string; onSave: Save }) {
  const [team, setTeam] = useState(details.teamName ?? "");
  const [links, setLinks] = useState<PlayerLink[]>(details.links);
  const [kind, setKind] = useState<string>("youtube");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [items, setItems] = useState<Achievement[]>(details.achievements);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [hidden, setHidden] = useState<HideableField[]>(details.hiddenFields);
  const [search, setSearch] = useState(details.searchOptIn);
  useEffect(() => { setTeam(details.teamName ?? ""); setLinks(details.links); setItems(details.achievements); setHidden(details.hiddenFields); setSearch(details.searchOptIn); }, [details]);
  const toggleSearch = (on: boolean) => {
    setSearch(on); // shows the choice at once; put back if the save fails
    void onSave("search", { searchOptIn: on }, on ? "Search is on. Your page can appear in Google once it passes the checks below." : "Search is off. Your page leaves search results at the next site update.").then((ok) => { if (!ok) setSearch(!on); });
  };

  const addLink = () => {
    const p = linkProblem(url);
    if (p) { setUrlError(p); return; }
    if (links.length >= LINKS_MAX) { setUrlError(`At most ${LINKS_MAX} links.`); return; }
    setUrlError("");
    const next = [...links, { kind: kind as LinkKind, url: url.trim() }];
    void onSave("links", { links: next }, "Links saved.").then((ok) => { if (ok) setUrl(""); });
  };
  const removeLink = (u: string) => void onSave("links", { links: links.filter((l) => l.url !== u) }, "Link removed.");
  const addAchievement = () => {
    const y = year.trim() ? Number(year) : null;
    if (!title.trim() || items.length >= ACHIEVEMENTS_MAX) return;
    void onSave("ach", { achievements: [...items, { title: title.trim(), year: y !== null && Number.isInteger(y) ? y : null }] }, "Achievement saved.").then((ok) => { if (ok) { setTitle(""); setYear(""); } });
  };
  const toggle = (f: HideableField) => setHidden((h) => (h.includes(f) ? h.filter((x) => x !== f) : [...h, f]));
  const example = LINK_KINDS.find((k) => k.value === kind)?.example ?? "https://";

  return (
    <div className="space-y-4">
      <h3 className={h3}>What your page shows</h3>
      <form className={`${box} space-y-3`} onSubmit={(e) => { e.preventDefault(); void onSave("team", { teamName: team.trim() || null }, "Team saved."); }}>
        <TextInput id="pd-team" label="Current team (optional)" value={team} onChange={setTeam} maxLength={60} help="Up to 60 characters. No links or phone numbers." />
        <button type="submit" disabled={busy !== ""} className={btnSecondary}>{busy === "team" ? "Saving" : "Save team"}</button>
      </form>

      <div className={`${box} space-y-3`}>
        <p className="font-medium text-zinc-100">Social links</p>
        {links.length === 0 ? <p className="text-sm text-zinc-300">No links yet.</p> : (
          <ul className="space-y-2">{links.map((l) => (
            <li key={l.url} className="flex flex-wrap items-center justify-between gap-2"><span className="break-all text-sm text-zinc-100">{linkLabel(l.kind)}: {l.url}</span><button type="button" onClick={() => removeLink(l.url)} disabled={busy !== ""} className={btnDanger}>Remove</button></li>
          ))}</ul>
        )}
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); addLink(); }} noValidate>
          <SelectInput id="pd-kind" label="Where" value={kind} onChange={setKind} options={LINK_KINDS.map((k) => ({ value: k.value, label: k.label }))} />
          <TextInput id="pd-url" label="Address" value={url} onChange={(v) => { setUrl(v); setUrlError(""); }} maxLength={200} error={urlError} help={`For example ${example}. Social links must be on that network's own site. Phone and WhatsApp links are not allowed.`} />
          <button type="submit" disabled={busy !== "" || !url.trim()} className={btnSecondary}>{busy === "links" ? "Saving" : "Add link"}</button>
        </form>
      </div>

      <div className={`${box} space-y-3`}>
        <p className="font-medium text-zinc-100">Achievements</p>
        <p className="text-sm text-zinc-300">Your page labels these as added by you. Results organisers recorded show separately as Verified.</p>
        {items.length > 0 && <ul className="space-y-2">{items.map((a, i) => (
          <li key={`${a.title}-${i}`} className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm text-zinc-100">{a.title}{a.year !== null && ` · ${a.year}`}</span><button type="button" onClick={() => void onSave("ach", { achievements: items.filter((_, j) => j !== i) }, "Achievement removed.")} disabled={busy !== ""} className={btnDanger}>Remove</button></li>
        ))}</ul>}
        {items.length < ACHIEVEMENTS_MAX && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); addAchievement(); }}>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2"><TextInput id="pd-ach" label="Achievement" value={title} onChange={setTitle} maxLength={80} help="For example: Runner-up, Pune College LAN" /></div>
              <TextInput id="pd-year" label="Year (optional)" value={year} onChange={(v) => setYear(v.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" />
            </div>
            <button type="submit" disabled={busy !== "" || title.trim().length < 2} className={btnSecondary}>{busy === "ach" ? "Saving" : "Add achievement"}</button>
          </form>
        )}
      </div>

      <form className={`${box} space-y-3`} onSubmit={(e) => { e.preventDefault(); void onSave("fields", { hiddenFields: hidden }, "Your choices are saved."); }}>
        <fieldset>
          <legend className="mb-1 font-medium text-zinc-100">Show on my page</legend>
          <p className="mb-2 text-sm text-zinc-300">Untick anything you want to keep off your shared page. Hidden fields never leave our server.</p>
          <div className="grid gap-2 sm:grid-cols-2">{HIDEABLE.map((f) => (
            <label key={f.value} className="flex min-h-11 items-center gap-3 rounded-lg border border-white/10 px-3 text-sm text-zinc-100"><input type="checkbox" checked={!hidden.includes(f.value)} onChange={() => toggle(f.value)} className="h-5 w-5 accent-cyan-400" />{f.label}</label>
          ))}</div>
        </fieldset>
        <button type="submit" disabled={busy !== ""} className={btnSecondary}>{busy === "fields" ? "Saving" : "Save what shows"}</button>
      </form>

      <div className={`${box} space-y-2`}>
        <label className="flex min-h-11 items-start gap-3 text-zinc-100">
          <input type="checkbox" checked={search} disabled={busy !== ""} onChange={(e) => toggleSearch(e.target.checked)} className="mt-1 h-5 w-5 accent-cyan-400" />
          <span>Show my profile in Google search<span className="block text-sm text-zinc-400">Off by default. Needs a Public profile with real content: a bio of at least 80 characters and a game, or a verified result. Turning it off removes your page from search at the next daily site update.</span></span>
        </label>
      </div>
    </div>
  );
}

/** The card link: what the QR on a player card holds, and the Reset button that makes every printed card with the old QR stop working. */
export function CardLinkBox({ page, busy, onEnsure, onReset }: { page: OwnPlayerPage; busy: string; onEnsure: () => Promise<boolean>; onReset: () => Promise<boolean> }) {
  const [confirm, setConfirm] = useState(false);
  const shared = page.visibility !== "private";
  return (
    <div className={`${box} space-y-3`}>
      <h3 className={h3}>Player card QR</h3>
      <p className="text-sm text-zinc-300">Your player card can carry a QR code that opens your page. The code holds a random link, not your name, email or account.</p>
      {!shared && <p className="text-sm text-zinc-300">Share your profile first (Link only or Public, above). Nothing is shared until you choose.</p>}
      {shared && !page.cardPath && <button type="button" onClick={() => void onEnsure()} disabled={busy !== ""} className={btnSecondary}>{busy === "card" ? "Making" : "Make my card link"}</button>}
      {page.cardPath && <p className="text-sm text-zinc-100">Your card link is ready.{page.visibility === "private" && " It opens nothing while your profile is private."}</p>}
      <p className="text-sm"><Link href="/app/player-card/" className={link}>Design and download my player card</Link></p>
      {page.cardPath && (confirm ? (
        <div className="space-y-2">
          <p className="text-sm text-warning"><span aria-hidden="true">! </span>Cards you already printed or shared will stop opening your page.</p>
          <div className="flex flex-wrap gap-3"><button type="button" onClick={() => { setConfirm(false); void onReset(); }} className={btnDanger}>Yes, reset the QR link</button><button type="button" onClick={() => setConfirm(false)} className={btnSecondary}>Keep it</button></div>
        </div>
      ) : <button type="button" onClick={() => setConfirm(true)} disabled={busy !== ""} className={btnDanger}>{busy === "card-reset" ? "Resetting" : "Reset QR link"}</button>)}
      <p className={helper}>Lost a card, or gave one to the wrong person? Reset the link, then print a new card.</p>
    </div>
  );
}

