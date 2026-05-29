"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useMemo } from "react";
import { useFavoriteTeams } from "@/components/FavoriteTeamsProvider";
import { FavoriteTeamChips } from "@/components/favorites/FavoriteTeamChips";
import { HomeUpcomingMatches } from "@/components/home/HomeUpcomingMatches";
import { MatchCountdownSection } from "@/components/matches/MatchCountdownSection";
import {
  filterFixturesForFavoriteTeams,
  listFinishedMatches,
  listUpcomingMatches,
} from "@/lib/utils";

export function FavoritesPageClient({ fixtures = [], teams = [] }) {
  const { hydrated, favoriteIds } = useFavoriteTeams();

  const favoriteTeams = useMemo(() => {
    if (!favoriteIds.length) return [];
    const set = new Set(favoriteIds);
    return teams.filter((team) => set.has(team.id));
  }, [teams, favoriteIds]);

  const favoriteUpcoming = useMemo(() => {
    if (!favoriteIds.length) return [];
    return filterFixturesForFavoriteTeams(
      listUpcomingMatches(fixtures),
      favoriteIds,
    );
  }, [fixtures, favoriteIds]);

  const favoriteResults = useMemo(() => {
    if (!favoriteIds.length) return [];
    return filterFixturesForFavoriteTeams(
      listFinishedMatches(fixtures),
      favoriteIds,
    );
  }, [fixtures, favoriteIds]);

  if (!hydrated) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading your teams…</p>
    );
  }

  if (!favoriteIds.length) {
    return (
      <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-10 text-center">
        <Star
          className="mx-auto h-10 w-10 text-[hsl(var(--muted-foreground))]"
          aria-hidden
        />
        <h2 className="mt-4 font-display text-2xl tracking-wide">No teams starred yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[hsl(var(--muted-foreground))]">
          Star nations on the teams page to build your personal World Cup feed here.
        </p>
        <Link
          href="/teams"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition-opacity hover:opacity-90"
        >
          Browse teams
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-wc-accent">Favorites</p>
          <h1 className="font-display text-3xl tracking-wide sm:text-4xl">
            Your teams
          </h1>
          <p className="mt-2 max-w-2xl text-[hsl(var(--muted-foreground))]">
            Upcoming kickoffs, results, and countdowns for the nations you follow.
          </p>
        </div>
        <FavoriteTeamChips teams={favoriteTeams} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-8">
          <HomeUpcomingMatches fixtures={fixtures} favoriteTeamsOnly />
        </div>

        <div className="space-y-8">
          <MatchCountdownSection
            id="favorites-countdown"
            title="Kickoff countdown"
            description="Every upcoming match with your starred nations"
            fixtures={favoriteUpcoming}
            emptyMessage="No upcoming matches for your teams."
          />

          <MatchCountdownSection
            id="favorites-results-countdown"
            title="Recent results"
            description="Latest finished matches involving your teams"
            fixtures={favoriteResults.slice(0, 8)}
            emptyMessage="No results yet for your teams."
          />
        </div>
      </div>
    </div>
  );
}
