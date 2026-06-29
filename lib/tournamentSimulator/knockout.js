import { KNOCKOUT_ROUNDS, THIRD_PLACE_ROUND } from "@/lib/wcConstants";
import { hasCompleteScore } from "@/lib/tournamentSimulator/standings";
import {
  createKnockoutMatchId,
  getAdvancementRounds,
  getDownstreamKnockoutIds,
  matchNoToRoundAndIndex,
  ROUND_MATCH_COUNTS,
  r32IndexToMatchNo,
  WC_2026_KNOCKOUT_ADVANCEMENT,
  WC_2026_THIRD_PLACE_FEEDERS,
  WC_2026_THIRD_PLACE_MATCH_NO,
} from "@/lib/wcBracketTree";

export { createKnockoutMatchId, THIRD_PLACE_ROUND };

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
      matchNumber: r32IndexToMatchNo(index),
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
  const semiA = semis.find((match) => match.matchNumber === WC_2026_THIRD_PLACE_FEEDERS.home);
  const semiB = semis.find((match) => match.matchNumber === WC_2026_THIRD_PLACE_FEEDERS.away);

  if (!semiA || !semiB) {
    matches[THIRD_PLACE_ROUND] = [];
    return;
  }

  const home = getMatchLoser(semiA, predictions);
  const away = getMatchLoser(semiB, predictions);

  if (!home || !away) {
    matches[THIRD_PLACE_ROUND] = [];
    return;
  }

  matches[THIRD_PLACE_ROUND] = [
    {
      id: createKnockoutMatchId(THIRD_PLACE_ROUND, 0),
      round: THIRD_PLACE_ROUND,
      matchNumber: WC_2026_THIRD_PLACE_MATCH_NO,
      home,
      away,
      homeLabel: home.name,
      awayLabel: away.name,
    },
  ];
}

/** Next-round fixtures follow the official WC 2026 bracket (not sequential 0–1, 2–3 pairing). */
export function advanceKnockoutBracket(bracket, predictions) {
  const matches = { ...bracket.matches };
  const rounds = bracket.rounds ?? KNOCKOUT_ROUNDS;
  const winnerByMatchNo = new Map();

  for (const match of matches["Round of 32"] ?? []) {
    const winner = getMatchWinner(match, predictions);
    if (winner && match.matchNumber) {
      winnerByMatchNo.set(match.matchNumber, winner);
    }
  }

  for (const round of getAdvancementRounds()) {
    const roundIndex = KNOCKOUT_ROUNDS.indexOf(round);
    matches[round] = new Array(ROUND_MATCH_COUNTS[roundIndex]).fill(null);
  }

  for (const rule of WC_2026_KNOCKOUT_ADVANCEMENT) {
    const position = matchNoToRoundAndIndex(rule.matchNo);
    if (!position || position.round === "Round of 32") continue;

    const homeTeam = winnerByMatchNo.get(rule.home);
    const awayTeam = winnerByMatchNo.get(rule.away);
    if (!homeTeam || !awayTeam) continue;

    const match = {
      id: createKnockoutMatchId(position.round, position.index),
      round: position.round,
      matchNumber: rule.matchNo,
      home: homeTeam,
      away: awayTeam,
      homeLabel: homeTeam.name,
      awayLabel: awayTeam.name,
    };

    matches[position.round][position.index] = match;

    const winner = getMatchWinner(match, predictions);
    if (winner) {
      winnerByMatchNo.set(rule.matchNo, winner);
    }
  }

  buildThirdPlacePlayoff(matches, predictions);

  return { rounds, matches };
}

export function isKnockoutRoundAvailable(bracket, roundName) {
  if (!bracket) return false;
  return (bracket.matches[roundName] ?? []).length > 0;
}

export function countKnockoutRoundMatches(bracket, roundName) {
  return (bracket?.matches?.[roundName] ?? []).filter(Boolean).length;
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
export function getDownstreamMatchIds(roundName, matchIndex) {
  if (roundName === THIRD_PLACE_ROUND) return [];

  const matchNo =
    roundName === "Round of 32"
      ? r32IndexToMatchNo(matchIndex)
      : lookupMatchNo(roundName, matchIndex);

  if (!matchNo) return [];
  return getDownstreamKnockoutIds(matchNo);
}

function lookupMatchNo(roundName, matchIndex) {
  for (const rule of WC_2026_KNOCKOUT_ADVANCEMENT) {
    const position = matchNoToRoundAndIndex(rule.matchNo);
    if (position?.round === roundName && position.index === matchIndex) {
      return rule.matchNo;
    }
  }

  if (roundName === THIRD_PLACE_ROUND && matchIndex === 0) {
    return WC_2026_THIRD_PLACE_MATCH_NO;
  }

  return null;
}

/** Prefer matchNumber when the bracket match object is available. */
export function getDownstreamMatchIdsForMatch(match) {
  if (match?.matchNumber) {
    return getDownstreamKnockoutIds(match.matchNumber);
  }

  if (match?.round != null && match?.id) {
    const parsed = parseKnockoutMatchId(match.id);
    if (parsed) {
      return getDownstreamMatchIds(parsed.round, parsed.index);
    }
  }

  return [];
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
