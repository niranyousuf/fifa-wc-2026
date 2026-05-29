"use client";

import { cn } from "@/lib/utils";

export function ScoreInputs({
  home,
  away,
  onHomeChange,
  onAwayChange,
  disabled = false,
  className,
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ScoreBox
        label="Home"
        value={home}
        onChange={onHomeChange}
        disabled={disabled}
      />
      <span className="text-sm text-[hsl(var(--muted-foreground))]">–</span>
      <ScoreBox
        label="Away"
        value={away}
        onChange={onAwayChange}
        disabled={disabled}
      />
    </div>
  );
}

function ScoreBox({ label, value, onChange, disabled }) {
  return (
    <label className="flex flex-col items-center gap-1">
      <span className="sr-only">{label} goals</span>
      <input
        type="number"
        min={0}
        max={99}
        inputMode="numeric"
        disabled={disabled}
        value={value ?? ""}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? null : Number.parseInt(raw, 10));
        }}
        className="h-10 w-12 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-center text-sm font-semibold tabular-nums outline-none ring-[hsl(var(--ring))] focus:ring-2 disabled:opacity-50"
      />
    </label>
  );
}
