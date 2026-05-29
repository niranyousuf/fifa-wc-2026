"use client";

import { useState } from "react";
import { clearAllSiteBrowserData } from "@/lib/siteBrowserStorage";

export function ClearBrowserDataButton() {
  const [message, setMessage] = useState(null);

  function handleClear() {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Remove all data this site stored in this browser (favorites, simulator scores, theme, and session flags)?",
      )
    ) {
      return;
    }

    const removed = clearAllSiteBrowserData();
    setMessage(
      `Removed ${removed.local} localStorage item(s) and ${removed.session} sessionStorage item(s). Reloading…`,
    );
    window.setTimeout(() => {
      window.location.href = "/";
    }, 800);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClear}
        className="rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition-opacity hover:opacity-90"
      >
        Clear my data on this site
      </button>
      {message ? (
        <p className="text-sm text-[hsl(var(--foreground))]" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
