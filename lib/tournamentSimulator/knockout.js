import { KNOCKOUT_ROUNDS } from "@/lib/wcConstants";
import { hasCompleteScore } from "@/lib/tournamentSimulator/standings";

export const THIRD_PLACE_ROUND = "Third-place play-off";

export function createKnockoutMatchId(round, index) {
  return `${round.replace(/\s+/g, "-").toLowerCase()}-${index}`;
}

/** Entertainment bracket: seed 32 teams into R32 pairings, then advance winners. */
export function buildInitialKnockoutBracket(qualifiedTeams) {
  if (qualifiedTeams.length < 32) return { rounds: [], matches: {} };

  const seeds = [...qualifiedTeams];
  const r32Matches = [];

  for (let index = 0; index < 16; index += 1) {
    const home = seeds[index];
    const away = seeds[31 - index];
    const id = createKnockoutMatchId("Round of 32", index);

    r32Matches.push({
      id,
      round: "Round of 32",
      matchNumber: index + 1,
      home: home.team,
      away: away.team,
      homeLabel: `${home.team.name} (${home.group}${home.position})`,
      awayLabel: `${away.team.name} (${away.group}${away.position})`,
    });
  }

  return {
    rounds: KNOCKOUT_ROUNDS,
    matches: { "Round of 32": r32Matches },
  };
}

export function resolveKnockoutWinner(pick) {
  if (!hasCompleteScore(pick)) return null;

  const home = pick.home;
  const away = pick.away;

  if (home > away) return "home";
  if (away > home) return "away";

  if (!pick.usePenalties) return null;

  const penHome = pick.penHome;
  const penAway = pick.penAway;

  if (
    !Number.isInteger(penHome) ||
    !Number.isInteger(penAway) ||
    penHome < 0 ||
    penAway < 0 ||
    penHome === penAway
  ) {
    return null;
  }

  return penHome > penAway ? "home" : "away";
}

function getMatchWinner(match, predictions) {
  const side = resolveKnockoutWinner(predictions[match.id]);
  if (!side) return null;
  return side === "home" ? match.home : match.away;
}

function getMatchLoser(match, predictions) {
  const side = resolveKnockoutWinner(predictions[match.id]);
  if (!side) return null;
  return side === "home" ? match.away : match.home;
}

function buildThirdPlacePlayoff(matches, predictions) {
  const semis = matches["Semi-finals"] ?? [];

  if (semis.length < 2) {
    matches[THIRD_PLACE_ROUND] = [];
    return;
  }

  const home = getMatchLoser(semis[0], predictions);
  const away = getMatchLoser(semis[1], predictions);

  if (!home || !away) {
    matches[THIRD_PLACE_ROUND] = [];
    return;
  }

  matches[THIRD_PLACE_ROUND] = [
    {
      id: createKnockoutMatchId(THIRD_PLACE_ROUND, 0),
      round: THIRD_PLACE_ROUND,
      matchNumber: 1,
      home,
      away,
      homeLabel: home.name,
      awayLabel: away.name,
    },
  ];
}

/** Next-round fixtures appear as soon as both feeder matches have a winner. */
export function advanceKnockoutBracket(bracket, predictions) {
  const matches = { ...bracket.matches };
  const rounds = bracket.rounds ?? KNOCKOUT_ROUNDS;

  for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex += 1) {
    const roundName = rounds[roundIndex];
    const nextRound = rounds[roundIndex + 1];
    const current = matches[roundName] ?? [];
    const nextMatches = [];

    for (let matchIndex = 0; matchIndex < Math.floor(current.length / 2); matchIndex += 1) {
      const feederA = current[matchIndex * 2];
      const feederB = current[matchIndex * 2 + 1];
      const home = getMatchWinner(feederA, predictions);
      const away = getMatchWinner(feederB, predictions);

      if (!home || !away) continue;

      nextMatches.push({
        id: createKnockoutMatchId(nextRound, matchIndex),
        round: nextRound,
        matchNumber: matchIndex + 1,
        home,
        away,
        homeLabel: home.name,
        awayLabel: away.name,
      });
    }

    matches[nextRound] = nextMatches;
  }

  buildThirdPlacePlayoff(matches, predictions);

  return { rounds, matches };
}

export function isKnockoutRoundAvailable(bracket, roundName) {
  if (!bracket) return false;
  return (bracket.matches[roundName] ?? []).length > 0;
}

export function countKnockoutRoundMatches(bracket, roundName) {
  return bracket?.matches?.[roundName]?.length ?? 0;
}

export function getKnockoutRoundsFrom(roundName, rounds = KNOCKOUT_ROUNDS) {
  const index = rounds.indexOf(roundName);
  if (index < 0) return [];
  return rounds.slice(index);
}

/** Final has its own reset; every other knockout reset also clears 3rd place. */
export function knockoutResetIncludesThirdPlace(fromRound) {
  return fromRound !== "Final";
}

export function roundNameToMatchIdPrefix(roundName) {
  return `${roundName.replace(/\s+/g, "-").toLowerCase()}-`;
}

export function parseKnockoutMatchId(matchId, rounds = KNOCKOUT_ROUNDS) {
  const thirdPrefix = roundNameToMatchIdPrefix(THIRD_PLACE_ROUND);
  if (matchId.startsWith(thirdPrefix)) {
    const index = Number.parseInt(matchId.slice(thirdPrefix.length), 10);
    if (!Number.isNaN(index)) {
      return { round: THIRD_PLACE_ROUND, index };
    }
  }

  for (const round of rounds) {
    const prefix = roundNameToMatchIdPrefix(round);
    if (matchId.startsWith(prefix)) {
      const index = Number.parseInt(matchId.slice(prefix.length), 10);
      if (!Number.isNaN(index)) {
        return { round, index };
      }
    }
  }

  return null;
}

/** Bracket paths fed by this fixture — used when a result changes. */
export function getDownstreamMatchIds(
  roundName,
  matchIndex,
  rounds = KNOCKOUT_ROUNDS,
) {
  if (roundName === THIRD_PLACE_ROUND) return [];

  const startIndex = rounds.indexOf(roundName);
  if (startIndex < 0) return [];

  const ids = [];
  let index = matchIndex;

  for (let i = startIndex + 1; i < rounds.length; i += 1) {
    index = Math.floor(index / 2);
    ids.push(createKnockoutMatchId(rounds[i], index));
  }

  const semiIndex = rounds.indexOf("Semi-finals");
  if (semiIndex >= 0 && startIndex <= semiIndex) {
    ids.push(createKnockoutMatchId(THIRD_PLACE_ROUND, 0));
  }

  return ids;
}

export function findKnockoutMatchById(bracket, matchId) {
  if (!bracket?.matches) return null;

  for (const matches of Object.values(bracket.matches)) {
    const found = matches.find((match) => match.id === matchId);
    if (found) return found;
  }

  return null;
}

export function getKnockoutMatchWinnerId(match, pick) {
  if (!match) return null;
  const side = resolveKnockoutWinner(pick);
  if (!side) return null;
  const team = side === "home" ? match.home : match.away;
  return team?.id ?? null;
}

export function knockoutWinnerChanged(match, previousPick, nextPick) {
  const prevId = getKnockoutMatchWinnerId(match, previousPick);
  const nextId = getKnockoutMatchWinnerId(match, nextPick);
  return prevId !== nextId;
}

/**
 * Keys to remove when resetting a round — includes that round and all later
 * rounds (e.g. R16 → R16, QF, SF, Final). Uses stored prediction ids so
 * nothing is left behind if the bracket shrinks after scores are cleared.
 */
export function getKnockoutPredictionKeysToClear(
  knockoutPredictions,
  fromRound,
  { thirdPlaceOnly = false, rounds = KNOCKOUT_ROUNDS } = {},
) {
  const keys = Object.keys(knockoutPredictions ?? {});
  if (!keys.length) return [];

  if (thirdPlaceOnly) {
    const prefix = roundNameToMatchIdPrefix(THIRD_PLACE_ROUND);
    return keys.filter((key) => key.startsWith(prefix));
  }

  const prefixes = getKnockoutRoundsFrom(fromRound, rounds).map(
    roundNameToMatchIdPrefix,
  );

  if (knockoutResetIncludesThirdPlace(fromRound)) {
    prefixes.push(roundNameToMatchIdPrefix(THIRD_PLACE_ROUND));
  }

  return keys.filter((key) => prefixes.some((prefix) => key.startsWith(prefix)));
}

export function collectKnockoutMatchIds(
  bracket,
  roundNames,
  { includeThirdPlace = false } = {},
) {
  if (!bracket) return [];

  const ids = new Set();

  for (const round of roundNames) {
    for (const match of bracket.matches[round] ?? []) {
      ids.add(match.id);
    }
  }

  if (includeThirdPlace) {
    for (const match of bracket.matches[THIRD_PLACE_ROUND] ?? []) {
      ids.add(match.id);
    }
  }

  return [...ids];
}
