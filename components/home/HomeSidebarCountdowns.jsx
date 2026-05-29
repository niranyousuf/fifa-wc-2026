"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFavoriteTeams } from "@/components/FavoriteTeamsProvider";
import { MatchCountdownSection } from "@/components/matches/MatchCountdownSection";
import { isHighVoltageFixture } from "@/lib/highVoltage";
import {
  filterFixturesForFavoriteTeams,
  listUpcomingMatches,
} from "@/lib/utils";

const FAVORITE_MATCH_LIMIT = 5;
const HIGH_VOLTAGE_LIMIT_DEFAULT = 5;
const HIGH_VOLTAGE_LIMIT_WITH_FAVORITES = 2;

export function HomeSidebarCountdowns({ fixtures = [] }) {
  const { hydrated, favoriteIds } = useFavoriteTeams();
  const hasFavorites = hydrated && favoriteIds.length > 0;

  const favoriteMatches = useMemo(() => {
    if (!hasFavorites) return [];

    return filterFixturesForFavoriteTeams(
      listUpcomingMatches(fixtures),
      favoriteIds,
    ).slice(0, FAVORITE_MATCH_LIMIT);
  }, [fixtures, favoriteIds, hasFavorites]);

  const highVoltageMatches = useMemo(() => {
    const limit = hasFavorites
      ? HIGH_VOLTAGE_LIMIT_WITH_FAVORITES
      : HIGH_VOLTAGE_LIMIT_DEFAULT;
    const favoriteSet = new Set(favoriteIds);

    return listUpcomingMatches(fixtures)
      .filter(isHighVoltageFixture)
      .filter((fixture) => {
        if (!hasFavorites) return true;

        return (
          !favoriteSet.has(fixture.teams.home.id) &&
          !favoriteSet.has(fixture.teams.away.id)
        );
      })
      .slice(0, limit);
  }, [fixtures, favoriteIds, hasFavorites]);

  return (
    <div className="space-y-8">
      {hasFavorites && (
        <MatchCountdownSection
          id="home-favorite-countdown"
          title="Your teams"
          description="Countdown to matches with your starred nations"
          fixtures={favoriteMatches}
          emptyMessage="No upcoming matches for your teams."
          headerAction={
            <Link
              href="/favorites"
              className="shrink-0 text-sm font-medium text-[hsl(var(--accent))] hover:underline"
            >
              View all
            </Link>
          }
        />
      )}

      <MatchCountdownSection
        id="home-hv-countdown"
        title="High voltage"
        description="Top clashes — kickoff countdown"
        fixtures={highVoltageMatches}
        emptyMessage="No upcoming high-voltage matches."
      />
    </div>
  );
}
