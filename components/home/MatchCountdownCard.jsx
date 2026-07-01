"use client";

import Link from "next/link";
import { HighVoltageBadge } from "@/components/HighVoltageBadge";
import { TeamLabel } from "@/components/TeamLabel";
import { useKickoffCountdown } from "@/components/home/useKickoffCountdown";
import { getHighVoltageInfo } from "@/lib/highVoltage";
import { matchDetailPath } from "@/lib/matchPaths";
import {
  LocalKickoffDate,
  LocalKickoffTime,
} from "@/components/LocalKickoffDateTime";
import { cn, getScoreDisplay, isFinished } from "@/lib/utils";

export function MatchCountdownCard({ fixture, className }) {
  const home = fixture.teams.home;
  const away = fixture.teams.away;
  const kickoff = fixture.fixture.date;
  const highVoltage = getHighVoltageInfo(fixture);
  const finished = isFinished(fixture.fixture?.status?.short);
  const score = finished ? getScoreDisplay(fixture) : null;
  const countdown = useKickoffCountdown(kickoff);

  return (
    <Link
      href={matchDetailPath(fixture.fixture.id)}
      className={cn(
        "group block rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-all duration-200 hover:shadow-fixture-hover",
        highVoltage.highVoltage && "border-[hsl(var(--accent))]",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <span className="min-w-0 flex-1 truncate pr-2 leading-snug">
          {fixture.league.round}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {highVoltage.highVoltage && (
            <HighVoltageBadge label={highVoltage.label} />
          )}
          <LocalKickoffTime date={kickoff} className="whitespace-nowrap" />
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
        <TeamLabel team={home} align="left" size="md" />
        <div className="text-center">
          {finished ? (
            <div className="font-sans text-xl font-semibold tabular-nums tracking-wide text-wc-accent whitespace-nowrap">
              {score ? (
                <>
                  <span>{score.home}</span>
                  {score.homePenalty != null ? (
                    <span className="ml-0.5 text-sm opacity-70">({score.homePenalty})</span>
                  ) : null}
                  <span className="mx-0.5 text-[hsl(var(--muted-foreground))]">-</span>
                  <span>{score.away}</span>
                  {score.awayPenalty != null ? (
                    <span className="ml-0.5 text-sm opacity-70">({score.awayPenalty})</span>
                  ) : null}
                </>
              ) : (
                "FT"
              )}
            </div>
          ) : (
            <>
              <div className="font-sans text-lg text-[hsl(var(--foreground))]">VS</div>
              <div
                className={cn(
                  "mt-1 min-h-[1.25rem] font-sans text-sm tabular-nums tracking-wide",
                  countdown.ready && countdown.live
                    ? "text-[hsl(var(--accent))]"
                    : "text-wc-accent",
                  !countdown.ready && "opacity-0",
                )}
                aria-live="polite"
                aria-hidden={!countdown.ready}
              >
                {countdown.ready ? countdown.label : "00d 00h 00m 00s"}
              </div>
            </>
          )}
        </div>
        <TeamLabel team={away} align="right" size="md" />
      </div>

      <p className="mt-3 text-center text-xs text-[hsl(var(--muted-foreground))]">
        <LocalKickoffDate date={kickoff} />
      </p>
    </Link>
  );
}
