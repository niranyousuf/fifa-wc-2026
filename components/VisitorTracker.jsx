"use client";

import { useEffect } from "react";
import { VISITOR_SESSION_KEY } from "@/lib/visitorSession";

/** Invisible: increments server count once per tab session on first page load. */
export function VisitorTracker() {
  useEffect(() => {
    let active = true;

    async function trackVisit() {
      try {
        if (sessionStorage.getItem(VISITOR_SESSION_KEY)) return;

        sessionStorage.setItem(VISITOR_SESSION_KEY, "1");

        const response = await fetch("/api/visitor", { method: "POST" });
        if (!response.ok) {
          sessionStorage.removeItem(VISITOR_SESSION_KEY);
        }
      } catch {
        if (active) {
          sessionStorage.removeItem(VISITOR_SESSION_KEY);
        }
      }
    }

    trackVisit();

    return () => {
      active = false;
    };
  }, []);

  return null;
}
