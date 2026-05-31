"use client";

import {
  COUNTDOWN_PLACEHOLDER_PARTS,
  useKickoffCountdown,
} from "@/components/home/useKickoffCountdown";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hrs" },
  { key: "minutes", label: "Min" },
  { key: "seconds", label: "Sec" },
];

export function HeroKickoffCountdown({ kickoff, className }) {
  const { label, live, parts, ready } = useKickoffCountdown(kickoff);

  if (!ready) {
    return (
      <div
        className={cn(
          "mt-4 flex items-start justify-center gap-1 opacity-0 sm:mt-6 sm:gap-4",
          className,
        )}
        aria-hidden
      >
        {SEGMENTS.map((segment, index) => (
          <div key={segment.key} className="flex items-start">
            {index > 0 && (
              <span className="mr-1 font-sans text-xl font-bold leading-none sm:mr-4 sm:text-4xl md:text-5xl">
                :
              </span>
            )}
            <CountdownUnit
              value={COUNTDOWN_PLACEHOLDER_PARTS[segment.key]}
              label={segment.label}
            />
          </div>
        ))}
      </div>
    );
  }

  if (live) {
    return (
      <p
        className={cn(
          "mt-6 font-sans text-4xl font-bold uppercase tracking-wide text-[hsl(var(--accent))] sm:text-5xl",
          className,
        )}
        aria-live="polite"
      >
        Kickoff
      </p>
    );
  }

  if (!parts) {
    return (
      <p
        className={cn(
          "mt-6 font-sans text-3xl font-bold tabular-nums tracking-wide text-wc-accent sm:text-4xl",
          className,
        )}
        aria-live="polite"
      >
        {label}
      </p>
    );
  }

  return (
    <div
      className={cn("mt-4 flex items-start justify-center gap-1 sm:mt-6 sm:gap-4", className)}
      role="timer"
      aria-live="polite"
      aria-label={`Kickoff in ${label}`}
    >
      {SEGMENTS.map((segment, index) => (
        <div key={segment.key} className="flex items-start">
          {index > 0 && (
            <span
              className="mr-1 select-none font-sans text-xl font-bold leading-none text-wc-accent/70 sm:mr-4 sm:text-4xl md:text-5xl"
              aria-hidden
            >
              :
            </span>
          )}
          <CountdownUnit
            value={parts[segment.key]}
            label={segment.label}
          />
        </div>
      ))}
    </div>
  );
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex min-w-[2.5rem] flex-col items-center sm:min-w-[4.25rem] md:min-w-[5rem]">
      <span className="font-sans text-2xl font-bold tabular-nums leading-none tracking-wide text-wc-accent sm:text-5xl md:text-6xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/55 sm:mt-2 sm:text-xs sm:tracking-[0.18em]">
        {label}
      </span>
    </div>
  );
}
