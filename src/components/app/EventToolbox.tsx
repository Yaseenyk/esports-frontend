"use client";

import { Component, Suspense, lazy, useEffect, useState, type ComponentType, type ReactNode } from "react";
import { GROUPS, panelsFor, type PanelDef, type PanelProps, type Role } from "@/components/app/panels";

const lazyCache = new Map<string, ComponentType<PanelProps>>();
/** One lazy component per panel id, so reopening never loads it twice. */
function lazyPanel(p: PanelDef): ComponentType<PanelProps> {
  let c = lazyCache.get(p.id);
  if (!c) { c = lazy(p.load); lazyCache.set(p.id, c); }
  return c;
}

const storeKey = (eventId: string) => `eh-toolbox-v1-${eventId}`;
function readOpen(eventId: string): string[] { try { const v = JSON.parse(sessionStorage.getItem(storeKey(eventId)) || "[]"); return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []; } catch { return []; } }
function writeOpen(eventId: string, ids: string[]) { try { sessionStorage.setItem(storeKey(eventId), JSON.stringify(ids)); } catch { /* private mode */ } }

function Skeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-busy="true" className="space-y-2 p-1">
      <span className="sr-only">Loading {label}</span>
      <div className="sk h-5 w-1/2 rounded-lg" /><div className="sk h-4 w-5/6 rounded-lg" /><div className="sk h-24 w-full rounded-xl" />
    </div>
  );
}

/** A panel that fails to load (for example a lost connection while fetching its code) says so and offers another try, without breaking the page. */
class Boundary extends Component<{ children: ReactNode; label: string }, { failed: number }> {
  state = { failed: 0 };
  static getDerivedStateFromError() { return { failed: 1 }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="space-y-2 rounded-xl border border-red-400/30 p-3 text-sm text-red-200">
        <p>{this.props.label} could not be loaded. Check your connection and try again.</p>
        <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => { lazyCache.clear(); this.setState({ failed: 0 }); }}>Try again</button>
      </div>
    );
  }
}

const chevron = (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current transition-transform group-open:rotate-180" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
);

/**
 * The event page's toolbox: every panel in the registry the viewer's role may see, in three closed groups. A panel's code loads only
 * when it is first opened and stays mounted after that (so typing is not lost when it is closed). What is open is remembered for the tab, per event.
 */
export default function EventToolbox({ eventId, eventName, role }: PanelProps) {
  const [open, setOpen] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [everOpened, setEverOpened] = useState<string[]>([]);
  useEffect(() => { const o = readOpen(eventId); setOpen(o); setEverOpened(o); setReady(true); }, [eventId]);

  const toggle = (key: string, isOpen: boolean) => {
    setOpen((cur) => { const next = isOpen ? (cur.includes(key) ? cur : [...cur, key]) : cur.filter((k) => k !== key); writeOpen(eventId, next); return next; });
    if (isOpen) setEverOpened((cur) => (cur.includes(key) ? cur : [...cur, key]));
  };

  return (
    <section aria-label="Event tools" className="space-y-3">
      {GROUPS.map((g) => {
        const list = panelsFor(role as Role, g.id);
        if (!list.length) return null;
        const gKey = `group:${g.id}`;
        return (
          <details key={g.id} open={ready && open.includes(gKey)} onToggle={(e) => { if (ready) toggle(gKey, e.currentTarget.open); }} className="group rounded-2xl border border-white/10 bg-zinc-900/40" data-group={g.id}>
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-cyan">
              <span className="min-w-0"><span className="block font-display text-lg font-bold text-white">{g.title}</span><span className="block text-sm text-zinc-300">{g.blurb}</span></span>
              {chevron}
            </summary>
            <div className="space-y-2 border-t border-white/10 p-3">
              {list.map((p) => {
                const Panel = everOpened.includes(p.id) ? lazyPanel(p) : null;
                return (
                  <details key={p.id} open={ready && open.includes(p.id)} onToggle={(e) => { if (ready) toggle(p.id, e.currentTarget.open); }} className="group rounded-xl border border-white/10 bg-[#0a0b0d]" data-panel={p.id}>
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-cyan">
                      <span className="min-w-0"><span className="block text-base font-semibold text-white">{p.title}</span><span className="block text-sm text-zinc-300">{p.blurb}</span></span>
                      {chevron}
                    </summary>
                    <div className="border-t border-white/10 p-3">
                      {Panel && <Boundary label={p.title}><Suspense fallback={<Skeleton label={p.title} />}><Panel eventId={eventId} eventName={eventName} role={role} /></Suspense></Boundary>}
                    </div>
                  </details>
                );
              })}
            </div>
          </details>
        );
      })}
    </section>
  );
}
