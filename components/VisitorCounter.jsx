"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function VisitorCounter({ floating = false }) {
  const [count, setCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCount() {
      try {
        const response = await fetch("/api/visitor");
        if (!response.ok) return;
        const data = await response.json();
        if (active) setCount(data.count ?? 0);
      } catch {
        if (active) setCount(0);
      }
    }

    loadCount();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (displayCount === count) return undefined;

    const step = Math.max(1, Math.ceil((count - displayCount) / 20));
    const timer = setTimeout(() => {
      setDisplayCount((current) => {
        const next = current + step;
        return next >= count ? count : next;
      });
    }, 20);

    return () => clearTimeout(timer);
  }, [count, displayCount]);

  return (
    <div
      className={[
        "flex items-center gap-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm",
        floating
          ? "fixed bottom-4 right-4 z-50 rounded-full px-4 py-2 shadow-lg"
          : "w-fit rounded-lg px-3 py-2",
      ].join(" ")}
    >
      <Eye className="h-4 w-4 text-wc-accent" />
      <span>{formatNumber(displayCount)} site visits</span>
    </div>
  );
}
