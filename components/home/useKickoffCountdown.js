"use client";

import { useEffect, useState } from "react";
import {
  formatCountdown,
  getCountdownParts,
  getMsUntilKickoff,
} from "@/lib/utils";

/** Stable parts for SSR / pre-hydration — avoids Date.now() mismatch. */
export const COUNTDOWN_PLACEHOLDER_PARTS = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

export function useKickoffCountdown(kickoff) {
  const [tick, setTick] = useState(null);

  useEffect(() => {
    setTick(Date.now());
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (tick === null) {
    return {
      label: "—",
      live: false,
      parts: null,
      ready: false,
    };
  }

  const ms = getMsUntilKickoff(kickoff, tick);

  if (ms === null) {
    return { label: "TBD", live: false, parts: null, ready: true };
  }

  if (ms <= 0) {
    return { label: "Kickoff", live: true, parts: null, ready: true };
  }

  return {
    label: formatCountdown(ms),
    live: false,
    parts: getCountdownParts(ms),
    ready: true,
  };
}
