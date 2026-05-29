"use client";

import Link from "next/link";
import { HighVoltageBadge } from "@/components/HighVoltageBadge";
import { TeamLabel } from "@/components/TeamLabel";
import { cn } from "@/lib/utils";
import {
  LocalKickoffDate,
  LocalKickoffTime,
} from "@/components/LocalKickoffDateTime";
import { getScore, isFinished } from "@/lib/utils";
import { getHighVoltageInfo } from "@/lib/highVoltage";

export function FixtureCard({ fixture, className }) {
  const home = fixture.teams.home;
  const away = fixture.teams.away;
  const score = getScore(fixture);
  const finished = isFinished(fixture.fixture.status.short);
  const kickoff = fixture.fixture.date;
  const highVoltage = getHighVoltageInfo(fixture);

  return (
    <Link
      href={`/match/${fixture.fixture.id}`}
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
        <TeamSide team={home} align="left" />
        <ScoreBlock score={score} kickoff={kickoff} finished={finished} />
        <TeamSide team={away} align="right" />
      </div>

      {!finished && (
        <p className="mt-3 text-center text-xs text-[hsl(var(--muted-foreground))]">
          <LocalKickoffDate date={kickoff} />
        </p>
      )}
    </Link>
  );
}

function TeamSide({ team, align }) {
  return <TeamLabel team={team} align={align} size="md" />;
}

function ScoreBlock({ score, kickoff, finished }) {
  if (score) {
    return (
      <div className="font-sans text-2xl tracking-wider text-wc-accent">
        {score.home} - {score.away}
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
