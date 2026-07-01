"use client";

import Image from "next/image";
import Link from "next/link";
import { Zap } from "lucide-react";
import { useMemo } from "react";
import { LocalKickoffDate } from "@/components/LocalKickoffDateTime";
import { useFavoriteTeams } from "@/components/FavoriteTeamsProvider";
import { TeamFavoriteStar, canFavoriteTeam } from "@/components/TeamFavoriteStar";
import { getHighVoltageInfo } from "@/lib/highVoltage";
import { matchDetailPath } from "@/lib/matchPaths";
import {
  cn,
  getFinishedFixtures,
  getScoreDisplay,
} from "@/lib/utils";

const LIST_LIMIT = 12;

export function HomeRecentResults({ fixtures = [] }) {
  const { favoriteIds, hydrated } = useFavoriteTeams();

  const results = useMemo(
    () => getFinishedFixtures(fixtures, LIST_LIMIT),
    [fixtures],
  );

  return (
    <section className="space-y-4" aria-labelledby="home-results-heading">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2
            id="home-results-heading"
            className="font-display text-2xl tracking-wide sm:text-3xl"
          >
            Results
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Latest finished matches
          </p>
        </div>
        <Link
          href="/hub"
          className="shrink-0 text-sm font-medium text-[hsl(var(--accent))] hover:underline"
        >
          View all
        </Link>
      </div>

      {results.length ? (
        <ul className="divide-y divide-[hsl(var(--border))] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {results.map((fixture) => (
            <ResultMatchRow
              key={fixture.fixture.id}
              fixture={fixture}
              favoriteIds={favoriteIds}
              hydrated={hydrated}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          No results yet.
        </p>
      )}
    </section>
  );
}

function ResultMatchRow({ fixture, favoriteIds, hydrated }) {
  const home = fixture.teams.home;
  const away = fixture.teams.away;
  const kickoff = fixture.fixture.date;
  const score = getScoreDisplay(fixture);
  const highVoltage = getHighVoltageInfo(fixture);
  const involvesFavorite =
    hydrated &&
    (favoriteIds.includes(home.id) || favoriteIds.includes(away.id));

  const isHomeLoser = score
    ? score.home < score.away ||
      (score.home === score.away && score.hasPenalties && score.homePenalty < score.awayPenalty)
    : false;
  const isAwayLoser = score
    ? score.away < score.home ||
      (score.home === score.away && score.hasPenalties && score.awayPenalty < score.homePenalty)
    : false;

  return (
    <li>
      <Link
        href={matchDetailPath(fixture.fixture.id)}
        className={cn(
          "grid grid-cols-[4.25rem_minmax(0,1fr)_auto_2.5rem] items-center gap-3 px-3 py-3 transition-colors hover:bg-[hsl(var(--muted))]/40 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto_2.75rem] sm:gap-4 sm:px-4",
          involvesFavorite && "bg-[hsl(var(--accent))]/5",
          highVoltage.highVoltage && "border-l-2 border-l-[hsl(var(--accent))]",
        )}
      >
        <div className="text-xs leading-snug text-[hsl(var(--muted-foreground))]">
          <LocalKickoffDate
            date={kickoff}
            variant="short"
            className="font-medium text-[hsl(var(--foreground))]"
          />
          <p className="mt-0.5 font-semibold uppercase tracking-wide text-[hsl(var(--foreground))]">
            FT
          </p>
        </div>

        <div className="min-w-0 space-y-2">
          <TeamLine team={home} isLoser={isHomeLoser} />
          <TeamLine team={away} isLoser={isAwayLoser} />
        </div>

        <div className="text-center font-sans text-lg tabular-nums tracking-wide text-wc-accent whitespace-nowrap">
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
            "–"
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-1 border-l border-[hsl(var(--border))] pl-2">
          {highVoltage.highVoltage && (
            <span title="High voltage">
              <Zap
                className="h-3.5 w-3.5 text-[hsl(var(--accent))]"
                aria-hidden
              />
            </span>
          )}
          {canFavoriteTeam(home) && (
            <TeamFavoriteStar teamId={home.id} teamName={home.name} size="sm" />
          )}
          {canFavoriteTeam(away) && (
            <TeamFavoriteStar teamId={away.id} teamName={away.name} size="sm" />
          )}
        </div>
      </Link>
    </li>
  );
}

function TeamLine({ team, isLoser }) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        isLoser && "opacity-50",
      )}
    >
      {team.logo ? (
        <div className="relative h-5 w-7 shrink-0">
          <Image
            src={team.logo}
            alt=""
            fill
            className="object-contain"
            sizes="28px"
          />
        </div>
      ) : (
        <span
          className="inline-block h-5 w-7 shrink-0 border border-[hsl(var(--border))] bg-[hsl(var(--muted))]"
          aria-hidden
        />
      )}
      <span className="truncate text-sm font-medium">{team.name}</span>
    </div>
  );
}
