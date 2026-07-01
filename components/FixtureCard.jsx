"use client";

import Link from "next/link";
import { HighVoltageBadge } from "@/components/HighVoltageBadge";
import { TeamLabel } from "@/components/TeamLabel";
import { cn, getScoreDisplay } from "@/lib/utils";
import {
  LocalKickoffDate,
  LocalKickoffTime,
} from "@/components/LocalKickoffDateTime";
import { getScore, isFinished } from "@/lib/utils";
import { getHighVoltageInfo } from "@/lib/highVoltage";
import { matchDetailPath } from "@/lib/matchPaths";
import {
  feederRefsForMatchNo,
  resolveBracketTeamDisplay,
} from "@/lib/wcBracketTree";

export function FixtureCard({ fixture, className }) {
  const matchNo = fixture._raw?.matchNo;
  const feeders = feederRefsForMatchNo(matchNo, fixture._raw);
  const home = resolveBracketTeamDisplay(fixture.teams.home, feeders.home);
  const away = resolveBracketTeamDisplay(fixture.teams.away, feeders.away);
  const score = getScoreDisplay(fixture);
  const finished = isFinished(fixture.fixture.status.short);
  const kickoff = fixture.fixture.date;
  const highVoltage = getHighVoltageInfo(fixture);
  const roundLabel = formatRoundLabel(fixture);

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
          {roundLabel}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {highVoltage.highVoltage && (
            <HighVoltageBadge label={highVoltage.label} />
          )}
          <span className="whitespace-nowrap">
            {finished ? (
              fixture.fixture.status.long
            ) : (
              <LocalKickoffTime date={kickoff} />
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
        <TeamSide team={home} align="left" isRef={home.isRef} />
        <ScoreBlock score={score} kickoff={kickoff} finished={finished} />
        <TeamSide team={away} align="right" isRef={away.isRef} />
      </div>

      {!finished && (
        <p className="mt-3 text-center text-xs text-[hsl(var(--muted-foreground))]">
          <LocalKickoffDate date={kickoff} />
        </p>
      )}
    </Link>
  );
}

function formatRoundLabel(fixture) {
  const round = fixture.league?.round ?? "";
  const matchNo = fixture._raw?.matchNo;

  if (matchNo) {
    return `${round} · Match ${matchNo}`;
  }

  return round;
}

function TeamSide({ team, align, isRef = false }) {
  return (
    <TeamLabel
      team={team}
      align={align}
      size="md"
      nameClassName={isRef ? "text-[hsl(var(--muted-foreground))]" : undefined}
    />
  );
}

function ScoreBlock({ score, kickoff, finished }) {
  if (score) {
    return (
      <div className="font-sans text-2xl tracking-wider text-wc-accent whitespace-nowrap">
        <span>{score.home}</span>
        {score.homePenalty != null ? (
          <span className="ml-0.5 text-sm opacity-70">({score.homePenalty})</span>
        ) : null}
        <span className="mx-0.5 text-[hsl(var(--muted-foreground))]">-</span>
        <span>{score.away}</span>
        {score.awayPenalty != null ? (
          <span className="ml-0.5 text-sm opacity-70">({score.awayPenalty})</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="text-center text-xs text-[hsl(var(--muted-foreground))]">
      <div className="font-sans text-lg text-[hsl(var(--foreground))]">VS</div>
      <div>
        <LocalKickoffTime date={kickoff} />
      </div>
    </div>
  );
}
