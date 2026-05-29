"use client";

import { useEffect, useState } from "react";
import {
  cn,
  formatDate,
  formatShortDate,
  formatTime,
} from "@/lib/utils";

/**
 * Renders kickoff date/time in the visitor's locale and timezone (browser).
 * Defers formatting to the client so SSR does not use the server clock/zone.
 */
export function LocalKickoffTime({ date, className }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(formatTime(date));
  }, [date]);

  return (
    <span className={cn("tabular-nums", className)} suppressHydrationWarning>
      {label || "—"}
    </span>
  );
}

export function LocalKickoffDate({ date, className, variant = "long" }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(variant === "short" ? formatShortDate(date) : formatDate(date));
  }, [date, variant]);

  return (
    <span className={cn(className)} suppressHydrationWarning>
      {label || "…"}
    </span>
  );
}

export function LocalKickoffDateTime({
  date,
  className,
  dateVariant = "long",
  separator = " · ",
}) {
  const [line, setLine] = useState("");

  useEffect(() => {
    const formattedDate =
      dateVariant === "short" ? formatShortDate(date) : formatDate(date);
    const formattedTime = formatTime(date);
    setLine(
      formattedDate && formattedTime
        ? `${formattedDate}${separator}${formattedTime}`
        : formattedDate || formattedTime,
    );
  }, [date, dateVariant, separator]);

  return (
    <span className={cn("tabular-nums", className)} suppressHydrationWarning>
      {line || "…"}
    </span>
  );
}
