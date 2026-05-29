import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function isValidPlayerPhotoUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

/** Parse API kickoff (ISO UTC) or YYYY-MM-DD group keys in the visitor's calendar. */
export function parseFixtureDate(dateString) {
  if (!dateString) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(dateString);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Local calendar day for grouping fixtures (not UTC slice). */
export function getLocalDateKey(dateString) {
  const date = parseFixtureDate(dateString);
  if (!date) return "unknown";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateTimeFormatLocale() {
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }
  return undefined;
}

export function formatDate(dateString) {
  if (!dateString) return "TBD";

  const date = parseFixtureDate(dateString);
  if (!date) return "TBD";

  return new Intl.DateTimeFormat(getDateTimeFormatLocale(), {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTime(dateString) {
  if (!dateString) return "";

  const date = parseFixtureDate(dateString);
  if (!date) return "";

  return new Intl.DateTimeFormat(getDateTimeFormatLocale(), {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Compact date for fixture rows, e.g. 08/04/26 in the visitor's locale */
export function formatShortDate(dateString) {
  if (!dateString) return "TBD";

  const date = parseFixtureDate(dateString);
  if (!date) return "TBD";

  return new Intl.DateTimeFormat(getDateTimeFormatLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}

function filterUpcoming(fixtures) {
  return fixtures
    .filter((fixture) => !isFinished(fixture.fixture?.status?.short))
    .filter(
      (fixture) =>
        fixture.teams?.home?.name &&
        fixture.teams?.away?.name &&
        fixture.teams.home.name !== "TBD" &&
        fixture.teams.away.name !== "TBD",
    )
    .sort(
      (a, b) =>
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime(),
    );
}

function filterFinished(fixtures) {
  return fixtures
    .filter((fixture) => isFinished(fixture.fixture?.status?.short))
    .filter(
      (fixture) =>
        fixture.teams?.home?.name &&
        fixture.teams?.away?.name &&
        fixture.teams.home.name !== "TBD" &&
        fixture.teams.away.name !== "TBD",
    )
    .sort(
      (a, b) =>
        new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime(),
    );
}

export function getUpcomingFixtures(fixtures, limit = 12) {
  return filterUpcoming(fixtures).slice(0, limit);
}

export function getUpcomingFixturesPage(fixtures, page = 0, pageSize = 12) {
  const start = page * pageSize;
  return filterUpcoming(fixtures).slice(start, start + pageSize);
}

export function getUpcomingFixturesPageCount(fixtures, pageSize = 12) {
  const total = filterUpcoming(fixtures).length;
  if (total === 0) return 0;
  return Math.ceil(total / pageSize);
}

export function getFinishedFixtures(fixtures, limit = 12) {
  return filterFinished(fixtures).slice(0, limit);
}

export function getFinishedFixturesPage(fixtures, page = 0, pageSize = 12) {
  const start = page * pageSize;
  return filterFinished(fixtures).slice(start, start + pageSize);
}

export function getFinishedFixturesPageCount(fixtures, pageSize = 12) {
  const total = filterFinished(fixtures).length;
  if (total === 0) return 0;
  return Math.ceil(total / pageSize);
}

export function getMsUntilKickoff(dateString, now = Date.now()) {
  if (!dateString) return null;
  const kickoff = parseFixtureDate(dateString);
  if (!kickoff) return null;
  return kickoff.getTime() - now;
}

export function getCountdownParts(ms) {
  if (ms === null || ms <= 0) return null;

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export function formatCountdown(ms) {
  const parts = getCountdownParts(ms);
  if (!parts) return null;

  const pad = (value) => String(value).padStart(2, "0");

  if (parts.days > 0) {
    return `${parts.days}d ${pad(parts.hours)}h ${pad(parts.minutes)}m ${pad(parts.seconds)}s`;
  }

  return `${pad(parts.hours)}h ${pad(parts.minutes)}m ${pad(parts.seconds)}s`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

export function getScore(fixture) {
  const goals = fixture?.goals;
  if (!goals) return null;

  if (goals.home === null || goals.away === null) return null;

  return {
    home: goals.home,
    away: goals.away,
  };
}

export function isFinished(status) {
  return ["FT", "AET", "PEN"].includes(status);
}

export function groupFixturesByDate(fixtures) {
  return fixtures.reduce((groups, fixture) => {
    const date = getLocalDateKey(fixture.fixture?.date) || "unknown";
    if (!groups[date]) groups[date] = [];
    groups[date].push(fixture);
    return groups;
  }, {});
}

export const KNOCKOUT_ROUND_LABELS = [
  "Round of 32",
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "Third Place",
  "Final",
];

export function isKnockoutFixture(fixture) {
  const round = fixture?.league?.round ?? "";
  return KNOCKOUT_ROUND_LABELS.some((label) => round.includes(label));
}

export function filterKnockoutFixtures(fixtures) {
  return fixtures.filter(isKnockoutFixture);
}

export function filterFixturesForFavoriteTeams(fixtures, favoriteIds = []) {
  if (!favoriteIds?.length) return [];

  const favoriteSet = new Set(favoriteIds);

  return fixtures.filter(
    (fixture) =>
      favoriteSet.has(fixture.teams?.home?.id) ||
      favoriteSet.has(fixture.teams?.away?.id),
  );
}

export function isGroupStageFixture(fixture) {
  return (fixture?.league?.round ?? "").includes("Group Stage");
}

export function filterGroupStageFixtures(fixtures) {
  return fixtures.filter(isGroupStageFixture);
}

export function listUpcomingMatches(fixtures) {
  return filterUpcoming(fixtures);
}

export function listFinishedMatches(fixtures) {
  return filterFinished(fixtures);
}

export function buildMatchStageFilterOptions(fixtures) {
  const rounds = new Set();

  for (const fixture of fixtures) {
    const round = fixture?.league?.round;
    if (round) rounds.add(round);
  }

  const groupRounds = [...rounds]
    .filter((round) => round.includes("Group Stage"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const knockoutRounds = KNOCKOUT_ROUND_LABELS.filter((label) =>
    [...rounds].some((round) => round.includes(label)),
  );

  return {
    groupRounds,
    knockoutRounds,
    hasGroup: groupRounds.length > 0,
    hasKnockout: knockoutRounds.length > 0,
  };
}

export function filterFixturesByStage(fixtures, stageFilter) {
  if (!stageFilter || stageFilter === "all") {
    return fixtures;
  }

  if (stageFilter === "group") {
    return filterGroupStageFixtures(fixtures);
  }

  if (stageFilter === "knockout") {
    return filterKnockoutFixtures(fixtures);
  }

  return fixtures.filter((fixture) => {
    const round = fixture?.league?.round ?? "";
    return round === stageFilter || round.includes(stageFilter);
  });
}

export function paginateFixtures(fixtures, page = 0, pageSize = 12) {
  const start = page * pageSize;
  return fixtures.slice(start, start + pageSize);
}

export function getFixturesPageCount(fixtures, pageSize = 12) {
  if (!fixtures.length) return 0;
  return Math.ceil(fixtures.length / pageSize);
}
