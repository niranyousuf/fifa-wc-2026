import "server-only";

import { cache } from "react";
import { flagUrlForTeam } from "@/lib/flags";
import { resolveCanonicalTeamName } from "@/lib/teamNames";
import { WC_YEAR } from "@/lib/wcConstants";
import {
  readDiskCacheIfFresh,
  readDiskCacheStale,
  writeDiskCache,
} from "@/lib/wcDiskCache";
import {
  getActiveZafronixKeyIndices,
  getZafronixApiKeys,
  markZafronixKeyExhausted,
} from "@/lib/zafronixKeys";

export { KNOCKOUT_ROUNDS, WC_YEAR } from "@/lib/wcConstants";

export const API_BASE = "https://api.zafronix.com/fifa/worldcup/v1";

const STAGE_ROUND_LABELS = {
  round_of_32: "Round of 32",
  round_of_16: "Round of 16",
  quarter_final: "Quarter-finals",
  semi_final: "Semi-finals",
  third_place: "Third Place",
  final: "Final",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-finals",
  sf: "Semi-finals",
  thirdPlace: "Third Place",
};

export function teamIdFromName(name) {
  return encodeURIComponent(name);
}

export function teamNameFromId(id) {
  return decodeURIComponent(id);
}

/** @type {Map<string, { data: unknown, freshUntil: number, staleUntil: number }>} */
const wcResponseCache = new Map();

const STALE_MULTIPLIER = 6;

function resolveStale(cacheKey, cached, now) {
  const diskStale = readDiskCacheStale(cacheKey);
  if (diskStale) return diskStale;
  if (cached && now < cached.staleUntil) {
    return cached.data;
  }
  return null;
}

async function wcFetch(path, { revalidate = 300 } = {}) {
  const apiKeys = getZafronixApiKeys();

  if (!apiKeys.length) {
    throw new Error(
      "No Zafronix API keys configured (set ZAFRONIX_API_KEY or ZAFRONIX_API_KEYS)",
    );
  }

  const cacheKey = path;
  const now = Date.now();
  const cached = wcResponseCache.get(cacheKey);
  const maxAgeMs = revalidate * 1000;

  if (cached && now < cached.freshUntil) {
    return cached.data;
  }

  const diskFresh = readDiskCacheIfFresh(cacheKey, maxAgeMs);
  if (diskFresh) {
    wcResponseCache.set(cacheKey, {
      data: diskFresh,
      freshUntil: now + maxAgeMs,
      staleUntil: now + maxAgeMs * STALE_MULTIPLIER,
    });
    return diskFresh;
  }

  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const keyIndices = getActiveZafronixKeyIndices(apiKeys);

  if (!keyIndices.length) {
    const stale = resolveStale(cacheKey, cached, now);
    if (stale) return stale;
    throw new Error("Zafronix API request failed: 429 (all keys rate-limited)");
  }

  let lastStatus = 0;

  for (const keyIndex of keyIndices) {
    const apiKey = apiKeys[keyIndex];

    let response;
    try {
      response = await fetch(url, {
        headers: {
          "X-API-Key": apiKey,
        },
        next: { revalidate },
      });
    } catch (error) {
      const stale = resolveStale(cacheKey, cached, now);
      if (stale) return stale;
      throw error;
    }

    if (response.ok) {
      const data = await response.json();
      wcResponseCache.set(cacheKey, {
        data,
        freshUntil: now + maxAgeMs,
        staleUntil: now + maxAgeMs * STALE_MULTIPLIER,
      });
      writeDiskCache(cacheKey, data);
      return data;
    }

    lastStatus = response.status;

    if (response.status === 429) {
      markZafronixKeyExhausted(keyIndex, response.headers.get("retry-after"));
      continue;
    }

    if (response.status === 401 || response.status === 403) {
      continue;
    }

    break;
  }

  const stale = resolveStale(cacheKey, cached, now);
  if (stale) return stale;

  throw new Error(`Zafronix API request failed: ${lastStatus || "unknown"}`);
}

function buildFlagMap(teams) {
  const map = {};

  for (const team of teams) {
    map[team.name] = flagUrlForTeam(team);
  }

  return map;
}

export const getTeamsList = cache(async function getTeamsList() {
  const teams = await wcFetch(`/teams?tournament=${WC_YEAR}`, { revalidate: 3600 });
  return Array.isArray(teams) ? teams : [];
});

async function getFlagMap() {
  const teams = await getTeamsList();
  return buildFlagMap(teams);
}

function stageToRoundLabel(stage) {
  if (!stage) return "World Cup";

  if (stage.startsWith("group_")) {
    const letter = stage.replace("group_", "").toUpperCase();
    return `Group Stage - ${letter}`;
  }

  return STAGE_ROUND_LABELS[stage] ?? stage;
}

function isKnockoutStage(stage) {
  if (!stage) return false;
  return !stage.startsWith("group_");
}

export function normalizeMatch(match, flags = {}, teams = []) {
  const finished =
    match.homeScore !== null &&
    match.homeScore !== undefined &&
    match.awayScore !== null &&
    match.awayScore !== undefined;

  const homeName = resolveCanonicalTeamName(
    match.homeTeam ?? match.home ?? "TBD",
    teams,
  );
  const awayName = resolveCanonicalTeamName(
    match.awayTeam ?? match.away ?? "TBD",
    teams,
  );

  const matchId = match.id ?? match.matchId;

  return {
    fixture: {
      id: matchId != null ? String(matchId) : null,
      date: match.kickoffUtc ?? `${match.date}T12:00:00.000Z`,
      status: {
        short: finished ? "FT" : "NS",
        long: finished ? "Match Finished" : "Not Started",
      },
      venue: {
        name: match.stadium,
        city: match.city,
      },
    },
    league: {
      round: stageToRoundLabel(match.stageNormalized ?? match.stage),
    },
    teams: {
      home: {
        id: teamIdFromName(homeName),
        name: homeName,
        logo: flags[homeName] ?? null,
      },
      away: {
        id: teamIdFromName(awayName),
        name: awayName,
        logo: flags[awayName] ?? null,
      },
    },
    goals: finished
      ? { home: match.homeScore, away: match.awayScore }
      : { home: null, away: null },
    _raw: match,
  };
}

export function normalizeStandings(standingsResponse, flags = {}, teams = []) {
  const groups = standingsResponse?.groups ?? {};
  const letters = Object.keys(groups).sort();

  return letters.map((letter) => ({
    group: `Group ${letter}`,
    standings: groups[letter].map((row, index) => {
      const teamName = resolveCanonicalTeamName(row.team, teams);

      return {
        rank: row.position ?? index + 1,
        team: {
          id: teamIdFromName(teamName),
          name: teamName,
          logo: flags[teamName] ?? flags[row.team] ?? null,
        },
        points: row.points,
        goalsDiff: row.goalDifference,
        all: {
          played: row.played,
          win: row.won,
          draw: row.drawn,
          lose: row.lost,
          goals: {
            for: row.goalsFor,
            against: row.goalsAgainst,
          },
        },
      };
    }),
  }));
}

export function extractMatchesList(matchesResponse) {
  if (!matchesResponse) return [];
  if (Array.isArray(matchesResponse)) return matchesResponse;

  const layer = matchesResponse.data;
  if (Array.isArray(layer)) return layer;
  if (layer && Array.isArray(layer.data)) return layer.data;

  return [];
}

function normalizeFixtures(matchesResponse, flags, teams, { status } = {}) {
  const matches = extractMatchesList(matchesResponse);
  let fixtures = matches.map((match) => normalizeMatch(match, flags, teams));

  if (status === "FT") {
    fixtures = fixtures.filter((f) => f.fixture.status.short === "FT");
  } else if (status === "NS") {
    fixtures = fixtures.filter((f) => f.fixture.status.short === "NS");
  }

  return fixtures.sort(
    (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime(),
  );
}

export function loadHubFromDiskOnly() {
  const teams = readDiskCacheStale(`/teams?tournament=${WC_YEAR}`);
  if (!Array.isArray(teams) || !teams.length) return null;

  const flags = buildFlagMap(teams);
  const standingsResponse = readDiskCacheStale(`/standings?year=${WC_YEAR}`);
  const matchesResponse = readDiskCacheStale(`/matches?year=${WC_YEAR}`);

  return {
    standings: standingsResponse
      ? normalizeStandings(standingsResponse, flags, teams)
      : [],
    fixtures: matchesResponse
      ? normalizeFixtures(matchesResponse, flags, teams)
      : [],
    fromDiskCache: true,
  };
}

/** One standings + matches + teams fetch for hub (avoids duplicate API calls). */
export async function getHubBundle() {
  try {
    const [standingsResponse, matchesResponse, teams] = await Promise.all([
      wcFetch(`/standings?year=${WC_YEAR}`, { revalidate: 300 }),
      wcFetch(`/matches?year=${WC_YEAR}`, { revalidate: 300 }),
      getTeamsList(),
    ]);

    const flags = buildFlagMap(teams);

    return {
      standings: normalizeStandings(standingsResponse, flags, teams),
      fixtures: normalizeFixtures(matchesResponse, flags, teams),
      fromDiskCache: false,
    };
  } catch (error) {
    const disk = loadHubFromDiskOnly();
    if (disk) return disk;
    throw error;
  }
}

export async function getHubDataSafe() {
  try {
    const bundle = await getHubBundle();
    return { ...bundle, apiRateLimited: false };
  } catch (error) {
    const disk = loadHubFromDiskOnly();
    if (disk) {
      return { ...disk, apiRateLimited: false };
    }

    return {
      standings: [],
      fixtures: [],
      fromDiskCache: false,
      apiRateLimited: String(error?.message ?? "").includes("429"),
    };
  }
}

export const getStandings = cache(async function getStandings() {
  const [standingsResponse, teams] = await Promise.all([
    wcFetch(`/standings?year=${WC_YEAR}`, { revalidate: 300 }),
    getTeamsList(),
  ]);

  return normalizeStandings(standingsResponse, buildFlagMap(teams), teams);
});

export const getFixtures = cache(async function getFixtures({ status } = {}) {
  const [matchesResponse, teams] = await Promise.all([
    wcFetch(`/matches?year=${WC_YEAR}`, { revalidate: 300 }),
    getTeamsList(),
  ]);

  return normalizeFixtures(matchesResponse, buildFlagMap(teams), teams, { status });
});

export async function getKnockoutFixtures() {
  const fixtures = await getFixtures();
  return fixtures.filter((fixture) => {
    const stage = fixture._raw?.stageNormalized ?? fixture._raw?.stage;
    return isKnockoutStage(stage);
  });
}

function mapSquadPlayers(players) {
  return players.map((player) => {
    const playerName = player.name ?? player.playerName ?? "";
    const isCaptain = Boolean(
      player.captain ??
        player.isCaptain ??
        player.is_captain ??
        /\(captain\)/i.test(playerName),
    );

    return {
      id: playerName,
      name: playerName,
      number: player.jersey ?? player.number,
      position: player.position,
      age: player.ageAtTournament ?? player.age,
      club: player.club?.name ?? player.club,
      captain: isCaptain,
    };
  });
}

export const getTeam = cache(async function getTeam(encodedId) {
  const name = teamNameFromId(encodedId);
  const teams = await getTeamsList();
  const canonicalName = resolveCanonicalTeamName(name, teams);
  const team = teams.find((entry) => entry.name === canonicalName);

  if (!team) {
    return { team: null, squad: [], rosterUnavailable: false };
  }

  const flags = buildFlagMap(teams);
  let roster = [];
  let rosterUnavailable = false;

  try {
    const rosterResponse = await wcFetch(
      `/teams/${encodeURIComponent(canonicalName)}/roster?year=${WC_YEAR}`,
      { revalidate: 3600 },
    );
    roster = Array.isArray(rosterResponse) ? rosterResponse : team.squad ?? [];
  } catch {
    roster = team.squad ?? [];
    rosterUnavailable = true;
  }

  const players = roster.length ? roster : team.squad ?? [];

  return {
    team: {
      team: {
        id: teamIdFromName(canonicalName),
        name: team.name,
        logo: flags[team.name] ?? flagUrlForTeam(team),
        country: team.confederation,
        code: team.code,
      },
    },
    squad: mapSquadPlayers(players),
    rosterUnavailable,
  };
});

function goalsToEvents(match) {
  const goals = match.goals ?? [];
  const cards = match.cards ?? [];

  const goalEvents = goals.map((goal) => ({
    time: { elapsed: goal.minute ?? "?" },
    type: "Goal",
    player: { name: goal.scorer },
    team: { name: goal.team },
    detail: goal.type ?? "Normal Goal",
    assist: goal.assist ? { name: goal.assist } : null,
  }));

  const cardEvents = cards.map((card) => ({
    time: { elapsed: card.minute ?? "?" },
    type: "Card",
    player: { name: card.player },
    team: { name: card.team },
    detail: card.type ?? "Card",
    assist: null,
  }));

  return [...goalEvents, ...cardEvents].sort(
    (a, b) => Number(a.time.elapsed) - Number(b.time.elapsed),
  );
}

async function resolveMatchRaw(matchId) {
  const normalizedId = decodeURIComponent(String(matchId ?? "")).trim();
  if (!normalizedId) return null;

  try {
    const direct = await wcFetch(
      `/matches/${encodeURIComponent(normalizedId)}`,
      { revalidate: 60 },
    );
    if (direct && (direct.id || direct.homeTeam || direct.home)) {
      return direct;
    }
  } catch {
    // Fall back to the year list (bundled disk cache or list endpoint).
  }

  const listResponse =
    readDiskCacheStale(`/matches?year=${WC_YEAR}`) ??
    (await wcFetch(`/matches?year=${WC_YEAR}`, { revalidate: 300 }).catch(
      () => null,
    ));

  const matches = extractMatchesList(listResponse);
  return (
    matches.find(
      (entry) => String(entry.id ?? entry.matchId ?? "") === normalizedId,
    ) ?? null
  );
}

export async function getMatch(id) {
  const [flags, teams] = await Promise.all([getFlagMap(), getTeamsList()]);
  const match = await resolveMatchRaw(id);

  if (!match) {
    throw new Error(`Match not found: ${id}`);
  }

  const fixture = normalizeMatch(match, flags, teams);

  return {
    fixture,
    statistics: [],
    events: goalsToEvents(match),
    raw: match,
  };
}

export async function searchTeams(query) {
  const teams = await getTeamsList();
  const flags = await getFlagMap();
  const needle = query.toLowerCase();

  return teams
    .filter((team) => team.name.toLowerCase().includes(needle))
    .slice(0, 10)
    .map((team) => ({
      team: {
        id: teamIdFromName(team.name),
        name: team.name,
        logo: flags[team.name] ?? flagUrlForTeam(team),
      },
    }));
}
