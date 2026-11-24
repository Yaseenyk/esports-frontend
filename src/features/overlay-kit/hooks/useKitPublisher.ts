"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sameFeed, type KitFeed } from "@/features/overlay-kit/domain";
import { publishFeed, readSending, writeSending } from "@/features/overlay-kit/services/kit-store";

/**
 * The tool side of the overlay kit. While sending is on, every change to the tool's standings is saved in this browser and sent to any
 * open overlay at once. Sending is off until the organiser switches it on, and the choice is remembered in this browser.
 */
export function useKitPublisher(feed: KitFeed | null) {
  const [sending, setSendingState] = useState(false);
  const [sentAt, setSentAt] = useState(0);
  const [stored, setStored] = useState(true);
  const last = useRef<KitFeed | null>(null);

  useEffect(() => { setSendingState(readSending()); }, []);
  useEffect(() => {
    if (!sending || !feed || sameFeed(last.current, feed)) return;
    const stamped = { ...feed, at: Date.now() };
    last.current = stamped;
    setStored(publishFeed(stamped));
    setSentAt(stamped.at);
  }, [sending, feed]);

  const setSending = useCallback((on: boolean) => { writeSending(on); last.current = null; setSendingState(on); if (!on) setSentAt(0); }, []);
  return { sending, setSending, sentAt, stored, teams: feed?.teams.length ?? 0 };
}
