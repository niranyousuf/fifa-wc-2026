"use client";

import Image from "next/image";
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

/** Mobile: one row per side (flag, name, score). Desktop: team | scores | team. */
export function MatchScorePicker({
  homeSide,
  awaySide,
  home,
  away,
  onHomeChange,
  onAwayChange,
  disabled = false,
  homeLabel = "Home",
  awayLabel = "Away",
}) {
  const homeTeam = toTeamDisplay(homeSide);
  const awayTeam = toTeamDisplay(awaySide);

  return (
    <>
      <div className="flex flex-col gap-2.5 sm:hidden">
        <TeamScoreRow
          team={homeTeam}
          label={homeLabel}
          value={home}
          onChange={onHomeChange}
          disabled={disabled}
        />
        <TeamScoreRow
          team={awayTeam}
          label={awayLabel}
          value={away}
          onChange={onAwayChange}
          disabled={disabled}
        />
      </div>
      <div className="hidden items-center justify-center gap-6 sm:flex">
        <TeamLine team={homeTeam} />
        <ScoreInputs
          home={home}
          away={away}
          onHomeChange={onHomeChange}
          onAwayChange={onAwayChange}
          disabled={disabled}
        />
        <TeamLine team={awayTeam} align="right" />
      </div>
    </>
  );
}

/** @deprecated Use MatchScorePicker — kept for existing imports */
export function GroupMatchScorePicker({
  homeTeam,
  awayTeam,
  home,
  away,
  onHomeChange,
  onAwayChange,
  disabled = false,
}) {
  return (
    <MatchScorePicker
      homeSide={homeTeam}
      awaySide={awayTeam}
      home={home}
      away={away}
      onHomeChange={onHomeChange}
      onAwayChange={onAwayChange}
      disabled={disabled}
    />
  );
}

function toTeamDisplay(side) {
  if (!side) return { name: "", logo: null };
  return {
    name: side.name ?? "",
    logo: side.logo ?? null,
  };
}

function TeamScoreRow({ team, label, value, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <TeamLine team={team} className="min-w-0 flex-1" />
      <ScoreBox
        label={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function TeamLine({ team, align = "left", className }) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        align === "right" && "flex-row-reverse text-right",
        className,
      )}
    >
      {team.logo ? (
        <span className="relative h-5 w-7 shrink-0">
          <Image
            src={team.logo}
            alt=""
            fill
            className="object-contain"
            sizes="28px"
          />
        </span>
      ) : null}
      <span className="truncate text-sm font-medium">{team.name}</span>
    </div>
  );
}

function ScoreBox({ label, value, onChange, disabled }) {
  return (
    <label className="flex shrink-0 flex-col items-center gap-1">
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
