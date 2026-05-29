"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFavoriteTeams } from "@/components/FavoriteTeamsProvider";
import {
  LocalKickoffDate,
  LocalKickoffTime,
} from "@/components/LocalKickoffDateTime";
import { TeamFavoriteStar, canFavoriteTeam } from "@/components/TeamFavoriteStar";
import { getHighVoltageInfo } from "@/lib/highVoltage";
import {
  buildMatchStageFilterOptions,
  cn,
  filterFixturesByStage,
  filterFixturesForFavoriteTeams,
  getFixturesPageCount,
  getScore,
  listFinishedMatches,
  listUpcomingMatches,
  paginateFixtures,
} from "@/lib/utils";

const PAGE_SIZE = 12;

export function HomeUpcomingMatches({
  fixtures = [],
  favoriteTeamsOnly = false,
}) {
  const [view, setView] = useState("upcoming");
  const [page, setPage] = useState(0);
  const [stageFilter, setStageFilter] = useState("all");
  const { favoriteIds, hydrated } = useFavoriteTeams();

  const isUpcoming = view === "upcoming";

  const basePool = useMemo(() => {
    const pool = isUpcoming
      ? listUpcomingMatches(fixtures)
      : listFinishedMatches(fixtures);

    if (!favoriteTeamsOnly) return pool;
    if (!hydrated || !favoriteIds.length) return [];

    return filterFixturesForFavoriteTeams(pool, favoriteIds);
  }, [fixtures, isUpcoming, favoriteTeamsOnly, favoriteIds, hydrated]);

  const stageOptions = useMemo(
    () => buildMatchStageFilterOptions(basePool),
    [basePool],
  );

  const filteredPool = useMemo(
    () => filterFixturesByStage(basePool, stageFilter),
    [basePool, stageFilter],
  );

  const pageCount = getFixturesPageCount(filteredPool, PAGE_SIZE);

  const list = useMemo(
    () => paginateFixtures(filteredPool, page, PAGE_SIZE),
    [filteredPool, page],
  );

  const headingId = favoriteTeamsOnly
    ? "favorites-matches-heading"
    : "home-matches-heading";

  const allResultsPool = useMemo(() => {
    const pool = listFinishedMatches(fixtures);
    if (!favoriteTeamsOnly) return pool;
    if (!hydrated || !favoriteIds.length) return [];
    return filterFixturesForFavoriteTeams(pool, favoriteIds);
  }, [fixtures, favoriteTeamsOnly, favoriteIds, hydrated]);

  const hasResults = allResultsPool.length > 0;

  useEffect(() => {
    setPage(0);
  }, [view, stageFilter]);

  useEffect(() => {
    if (stageFilter === "all") return;
    if (stageFilter === "group" && !stageOptions.hasGroup) {
      setStageFilter("all");
      return;
    }
    if (stageFilter === "knockout" && !stageOptions.hasKnockout) {
      setStageFilter("all");
      return;
    }
    if (
      stageFilter !== "group" &&
      stageFilter !== "knockout" &&
      !stageOptions.groupRounds.includes(stageFilter) &&
      !stageOptions.knockoutRounds.includes(stageFilter)
    ) {
      setStageFilter("all");
    }
  }, [stageFilter, stageOptions]);

  function goToResults() {
    setView("results");
    setPage(0);
  }

  function goToUpcoming() {
    setView("upcoming");
    setPage(0);
  }

  function handleLeft() {
    if (isUpcoming) {
      if (page > 0) {
        setPage((current) => current - 1);
        return;
      }
      if (hasResults) goToResults();
      return;
    }

    if (page < pageCount - 1) {
      setPage((current) => current + 1);
    }
  }

  function handleRight() {
    if (isUpcoming) {
      if (page < pageCount - 1) {
        setPage((current) => current + 1);
      }
      return;
    }

    if (page > 0) {
      setPage((current) => current - 1);
      return;
    }
    goToUpcoming();
  }

  const canGoLeft = isUpcoming ? page > 0 || hasResults : page < pageCount - 1;
  const canGoRight = isUpcoming ? page < pageCount - 1 : true;

  const leftLabel = isUpcoming
    ? page > 0
      ? "Earlier upcoming matches"
      : "Finished matches with results"
    : "Older results";

  const rightLabel = isUpcoming
    ? "More upcoming matches"
    : page > 0
      ? "More recent results"
      : "Upcoming matches";

  return (
    <section className="space-y-4" aria-labelledby={headingId}>
      <div className="text-center">
        <h2
          id={headingId}
          className="font-display text-2xl tracking-wide sm:text-3xl"
        >
          {favoriteTeamsOnly
            ? isUpcoming
              ? "Your upcoming matches"
              : "Your results"
            : isUpcoming
              ? "Upcoming matches"
              : "Results"}
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {favoriteTeamsOnly
            ? isUpcoming
              ? "Matches with your starred nations"
              : "Finished matches with your teams"
            : isUpcoming
              ? "Next kickoff at the top"
              : "Latest finished matches"}
          {pageCount > 1 && (
            <span className="tabular-nums">
              {" "}
              · {page + 1}/{pageCount}
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <MatchFeedNavButton
          direction="left"
          label={leftLabel}
          disabled={!canGoLeft}
          onClick={handleLeft}
        />

        <MatchStageSelect
          value={stageFilter}
          onChange={setStageFilter}
          options={stageOptions}
        />

        <MatchFeedNavButton
          direction="right"
          label={rightLabel}
          disabled={!canGoRight}
          onClick={handleRight}
        />
      </div>

      {list.length ? (
        <ul className="divide-y divide-[hsl(var(--border))] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {list.map((fixture) =>
            isUpcoming ? (
              <UpcomingMatchRow
                key={fixture.fixture.id}
                fixture={fixture}
                favoriteIds={favoriteIds}
                hydrated={hydrated}
              />
            ) : (
              <ResultMatchRow
                key={fixture.fixture.id}
                fixture={fixture}
                favoriteIds={favoriteIds}
                hydrated={hydrated}
              />
            ),
          )}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          {stageFilter !== "all"
            ? "No matches for this stage."
            : favoriteTeamsOnly
              ? "No matches for your teams in this view."
              : isUpcoming
                ? "No upcoming fixtures right now."
                : "No results yet."}
        </p>
      )}
    </section>
  );
}

function MatchStageSelect({ value, onChange, options }) {
  return (
    <div className="relative min-w-0 flex-1">
      <label htmlFor="home-match-stage-filter" className="sr-only">
        Filter by tournament stage
      </label>
      <select
        id="home-match-stage-filter"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-3 pr-9 text-sm font-medium text-[hsl(var(--foreground))] outline-none ring-[hsl(var(--ring))] transition-colors focus:ring-2"
      >
        <option value="all">All stages</option>
        {options.hasGroup && (
          <optgroup label="Group stage">
            <option value="group">All group matches</option>
            {options.groupRounds.map((round) => (
              <option key={round} value={round}>
                {round}
              </option>
            ))}
          </optgroup>
        )}
        {options.hasKnockout && (
          <optgroup label="Knockout stage">
            <option value="knockout">All knockout matches</option>
            {options.knockoutRounds.map((round) => (
              <option key={round} value={round}>
                {round}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
        aria-hidden
      />
    </div>
  );
}

function MatchFeedNavButton({ direction, label, disabled, onClick }) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]/50 hover:border-[hsl(var(--accent))]/40",
        disabled && "pointer-events-none opacity-35",
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </button>
  );
}

function UpcomingMatchRow({ fixture, favoriteIds, hydrated }) {
  const home = fixture.teams.home;
  const away = fixture.teams.away;
  const kickoff = fixture.fixture.date;
  const highVoltage = getHighVoltageInfo(fixture);
  const involvesFavorite =
    hydrated &&
    (favoriteIds.includes(home.id) || favoriteIds.includes(away.id));

  return (
    <li>
      <Link
        href={`/match/${fixture.fixture.id}`}
        className={cn(
          "grid grid-cols-[4.25rem_minmax(0,1fr)_2.75rem_2.5rem] items-center gap-3 px-3 py-3 transition-colors hover:bg-[hsl(var(--muted))]/40 sm:grid-cols-[4.5rem_minmax(0,1fr)_3rem_2.75rem] sm:gap-4 sm:px-4",
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
          <p className="mt-0.5">
            <LocalKickoffTime date={kickoff} />
          </p>
        </div>

        <div className="min-w-0 space-y-2">
          <TeamLine team={home} />
          <TeamLine team={away} />
        </div>

        <div className="text-center font-sans text-sm tracking-wide text-[hsl(var(--muted-foreground))]">
          VS
        </div>

        <MatchRowActions home={home} away={away} highVoltage={highVoltage} />
      </Link>
    </li>
  );
}

function ResultMatchRow({ fixture, favoriteIds, hydrated }) {
  const home = fixture.teams.home;
  const away = fixture.teams.away;
  const kickoff = fixture.fixture.date;
  const score = getScore(fixture);
  const highVoltage = getHighVoltageInfo(fixture);
  const involvesFavorite =
    hydrated &&
    (favoriteIds.includes(home.id) || favoriteIds.includes(away.id));

  return (
    <li>
      <Link
        href={`/match/${fixture.fixture.id}`}
        className={cn(
          "grid grid-cols-[4.25rem_minmax(0,1fr)_2.75rem_2.5rem] items-center gap-3 px-3 py-3 transition-colors hover:bg-[hsl(var(--muted))]/40 sm:grid-cols-[4.5rem_minmax(0,1fr)_3rem_2.75rem] sm:gap-4 sm:px-4",
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
          <TeamLine team={home} />
          <TeamLine team={away} />
        </div>

        <div className="text-center font-sans text-lg font-semibold tabular-nums tracking-wide text-wc-accent">
          {score ? (
            <>
              {score.home}
              <span className="mx-0.5 text-[hsl(var(--muted-foreground))]">-</span>
              {score.away}
            </>
          ) : (
            "–"
          )}
        </div>

        <MatchRowActions home={home} away={away} highVoltage={highVoltage} />
      </Link>
    </li>
  );
}

function MatchRowActions({ home, away, highVoltage }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 border-l border-[hsl(var(--border))] pl-2">
      {highVoltage.highVoltage && (
        <span title="High voltage">
          <Zap className="h-3.5 w-3.5 text-[hsl(var(--accent))]" aria-hidden />
        </span>
      )}
      {canFavoriteTeam(home) && (
        <TeamFavoriteStar teamId={home.id} teamName={home.name} size="sm" />
      )}
      {canFavoriteTeam(away) && (
        <TeamFavoriteStar teamId={away.id} teamName={away.name} size="sm" />
      )}
    </div>
  );
}

function TeamLine({ team }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
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
