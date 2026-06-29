import { filterKnockoutFixtures } from "@/lib/utils";
import { KNOCKOUT_ROUNDS } from "@/lib/wcConstants";
import {
  getFixtureResult,
  isFixtureFinished,
} from "@/lib/tournamentSimulator/fixtureScores";
import { createKnockoutMatchId } from "@/lib/tournamentSimulator/knockout";

function sortKnockoutFixtures(a, b) {
  const noA = a._raw?.matchNo ?? 0;
  const noB = b._raw?.matchNo ?? 0;
  if (noA !== noB) return noA - noB;
  return new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
}

export function hasAssignedTeams(fixture) {
  const home = fixture?.teams?.home?.name;
  const away = fixture?.teams?.away?.name;
  return Boolean(
    home &&
      away &&
      home !== "TBD" &&
      away !== "TBD",
  );
}

/** API knockout fixtures grouped by round label (Round of 32, etc.). */
export function groupKnockoutFixturesByRound(fixtures) {
  const knockout = filterKnockoutFixtures(Array.isArray(fixtures) ? fixtures : []);
  const byRound = {};

  for (const round of KNOCKOUT_ROUNDS) {
    byRound[round] = knockout
      .filter((fixture) => (fixture.league?.round ?? "").includes(round))
      .sort(sortKnockoutFixtures);
  }

  return byRound;
}

export function apiFixtureToKnockoutMatch(fixture, round, index) {
  return {
    id: createKnockoutMatchId(round, index),
    round,
    matchNumber: fixture._raw?.matchNo ?? index + 1,
    home: fixture.teams.home,
    away: fixture.teams.away,
    homeLabel: fixture.teams.home.name,
    awayLabel: fixture.teams.away.name,
    apiFixture: fixture,
  };
}

export function buildApiKnockoutRound(fixtures, roundName) {
  const roundFixtures = groupKnockoutFixturesByRound(fixtures)[roundName] ?? [];
  return roundFixtures
    .filter(hasAssignedTeams)
    .map((fixture, index) => apiFixtureToKnockoutMatch(fixture, roundName, index));
}

/** Finished API score (and penalties when present) as a simulator knockout pick. */
export function getKnockoutPickFromFixture(fixture) {
  const result = getFixtureResult(fixture);
  if (!result) return null;

  const pick = { home: result.home, away: result.away };
  const penalties = fixture?._raw?.penalties;

  if (
    result.home === result.away &&
    penalties &&
    Number.isInteger(penalties.home) &&
    Number.isInteger(penalties.away) &&
    penalties.home !== penalties.away
  ) {
    pick.usePenalties = true;
    pick.penHome = penalties.home;
    pick.penAway = penalties.away;
  }

  return pick;
}

/** Merge real knockout results into stored simulator picks. */
export function mergeKnockoutPredictions(fixtures, knockoutPredictions = {}) {
  const merged = { ...knockoutPredictions };
  const byRound = groupKnockoutFixturesByRound(fixtures);

  for (const round of KNOCKOUT_ROUNDS) {
    const roundFixtures = (byRound[round] ?? []).filter(hasAssignedTeams);

    roundFixtures.forEach((fixture, index) => {
      const pick = getKnockoutPickFromFixture(fixture);
      if (pick) {
        merged[createKnockoutMatchId(round, index)] = pick;
      }
    });
  }

  return merged;
}

/** Replace predicted pairings with official API fixtures when teams are known. */
export function overlayApiKnockoutMatches(bracket, fixtures) {
  if (!bracket) return null;

  const matches = { ...bracket.matches };

  for (const round of KNOCKOUT_ROUNDS) {
    const apiMatches = buildApiKnockoutRound(fixtures, round);
    if (apiMatches.length > 0) {
      matches[round] = apiMatches;
    }
  }

  return { ...bracket, matches };
}

export function countFinishedKnockoutFixtures(fixtures) {
  return filterKnockoutFixtures(Array.isArray(fixtures) ? fixtures : []).filter(
    isFixtureFinished,
  ).length;
}
