import { filterKnockoutFixtures } from "@/lib/utils";
import { KNOCKOUT_ROUNDS } from "@/lib/wcConstants";
import {
  matchNoToRoundAndIndex,
  matchNumbersForRound,
  ROUND_MATCH_COUNTS,
} from "@/lib/wcBracketTree";
import {
  getFixtureResult,
  isFixtureFinished,
} from "@/lib/tournamentSimulator/fixtureScores";
import { createKnockoutMatchId } from "@/lib/tournamentSimulator/knockout";

const FEEDER_REF_PATTERN = /^[WL]\d+$/i;

function isPlaceholderTeamName(name) {
  return !name || name === "TBD" || FEEDER_REF_PATTERN.test(name.trim());
}

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
      !isPlaceholderTeamName(home) &&
      !isPlaceholderTeamName(away),
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

export function apiFixtureToKnockoutMatch(fixture, round) {
  const matchNo = fixture._raw?.matchNo;
  const position = matchNo ? matchNoToRoundAndIndex(matchNo) : null;
  const index = position?.index ?? 0;

  return {
    id: createKnockoutMatchId(round, index),
    round,
    matchNumber: matchNo,
    home: fixture.teams.home,
    away: fixture.teams.away,
    homeLabel: fixture.teams.home.name,
    awayLabel: fixture.teams.away.name,
    apiFixture: fixture,
  };
}

export function buildApiKnockoutRound(fixtures, roundName) {
  const byMatchNo = new Map();

  for (const fixture of groupKnockoutFixturesByRound(fixtures)[roundName] ?? []) {
    const matchNo = fixture._raw?.matchNo;
    if (matchNo) byMatchNo.set(matchNo, fixture);
  }

  return matchNumbersForRound(roundName)
    .map((matchNo) => {
      const fixture = byMatchNo.get(matchNo);
      if (!fixture || !hasAssignedTeams(fixture)) return null;
      return apiFixtureToKnockoutMatch(fixture, roundName);
    })
    .filter(Boolean);
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

    for (const fixture of roundFixtures) {
      const matchNo = fixture._raw?.matchNo;
      const position = matchNo ? matchNoToRoundAndIndex(matchNo) : null;
      if (!position || position.round !== round) continue;

      const pick = getKnockoutPickFromFixture(fixture);
      if (pick) {
        merged[createKnockoutMatchId(round, position.index)] = pick;
      }
    }
  }

  return merged;
}

/** Replace predicted pairings with official API fixtures when teams are known. */
export function overlayApiKnockoutMatches(bracket, fixtures) {
  if (!bracket) return null;

  const matches = { ...bracket.matches };

  for (const round of KNOCKOUT_ROUNDS) {
    const apiMatches = buildApiKnockoutRound(fixtures, round);
    if (!apiMatches.length) continue;

    const slotCount = ROUND_MATCH_COUNTS[KNOCKOUT_ROUNDS.indexOf(round)];
    const merged = new Array(slotCount).fill(null);

    for (const apiMatch of apiMatches) {
      const position = matchNoToRoundAndIndex(apiMatch.matchNumber);
      if (position) merged[position.index] = apiMatch;
    }

    const existing = matches[round] ?? [];
    for (let index = 0; index < slotCount; index += 1) {
      if (!merged[index] && existing[index]) {
        merged[index] = existing[index];
      }
    }

    matches[round] = merged;
  }

  return { ...bracket, matches };
}

export function countFinishedKnockoutFixtures(fixtures) {
  return filterKnockoutFixtures(Array.isArray(fixtures) ? fixtures : []).filter(
    isFixtureFinished,
  ).length;
}
