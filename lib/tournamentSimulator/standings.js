const POINTS_WIN = 3;
const POINTS_DRAW = 1;

function emptyRow(team) {
  return {
    team,
    played: 0,
    win: 0,
    draw: 0,
    lose: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalsDiff: 0,
    points: 0,
  };
}

function compareRows(a, b) {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalsDiff !== a.goalsDiff) return b.goalsDiff - a.goalsDiff;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.team.name.localeCompare(b.team.name);
}

function headToHeadStats(teamIds, fixtures, predictions) {
  const stats = new Map(
    [...teamIds].map((id) => [id, { points: 0, gd: 0, gf: 0 }]),
  );

  for (const fixture of fixtures) {
    const homeId = fixture.teams.home.id;
    const awayId = fixture.teams.away.id;

    if (!teamIds.has(homeId) || !teamIds.has(awayId)) continue;

    const pick = predictions[fixture.fixture.id];
    if (!hasCompleteScore(pick)) continue;

    const homeGoals = pick.home;
    const awayGoals = pick.away;

    applyMiniResult(stats.get(homeId), homeGoals, awayGoals);
    applyMiniResult(stats.get(awayId), awayGoals, homeGoals);
  }

  return stats;
}

function applyMiniResult(row, goalsFor, goalsAgainst) {
  row.gf += goalsFor;
  row.gd += goalsFor - goalsAgainst;
  if (goalsFor > goalsAgainst) row.points += POINTS_WIN;
  else if (goalsFor === goalsAgainst) row.points += POINTS_DRAW;
}

export function hasCompleteScore(pick) {
  if (!pick) return false;
  const home = pick.home;
  const away = pick.away;
  return (
    Number.isInteger(home) &&
    Number.isInteger(away) &&
    home >= 0 &&
    away >= 0
  );
}

/** Stable key for whether a group score affects standings / qualification. */
export function groupResultSignature(pick) {
  if (!hasCompleteScore(pick)) return "incomplete";
  return `${pick.home}:${pick.away}`;
}

export function groupResultChanged(previousPick, nextPick) {
  return (
    groupResultSignature(previousPick ?? {}) !==
    groupResultSignature(nextPick ?? {})
  );
}

export function buildGroupStandings(groupFixtures, predictions) {
  const teams = new Map();

  for (const fixture of groupFixtures) {
    teams.set(fixture.teams.home.id, fixture.teams.home);
    teams.set(fixture.teams.away.id, fixture.teams.away);
  }

  const rows = [...teams.values()].map((team) => emptyRow(team));

  for (const fixture of groupFixtures) {
    const pick = predictions[fixture.fixture.id];
    if (!hasCompleteScore(pick)) continue;

    const homeRow = rows.find((row) => row.team.id === fixture.teams.home.id);
    const awayRow = rows.find((row) => row.team.id === fixture.teams.away.id);
    const homeGoals = pick.home;
    const awayGoals = pick.away;

    homeRow.played += 1;
    awayRow.played += 1;
    homeRow.goalsFor += homeGoals;
    homeRow.goalsAgainst += awayGoals;
    awayRow.goalsFor += awayGoals;
    awayRow.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      homeRow.win += 1;
      awayRow.lose += 1;
      homeRow.points += POINTS_WIN;
    } else if (homeGoals < awayGoals) {
      awayRow.win += 1;
      homeRow.lose += 1;
      awayRow.points += POINTS_WIN;
    } else {
      homeRow.draw += 1;
      awayRow.draw += 1;
      homeRow.points += POINTS_DRAW;
      awayRow.points += POINTS_DRAW;
    }
  }

  for (const row of rows) {
    row.goalsDiff = row.goalsFor - row.goalsAgainst;
  }

  return rankGroupRows(rows, groupFixtures, predictions);
}

function rankGroupRows(rows, groupFixtures, predictions) {
  const sorted = [...rows].sort(compareRows);

  let index = 0;
  while (index < sorted.length) {
    let end = index + 1;
    while (end < sorted.length && isTiedOnCore(sorted[index], sorted[end])) {
      end += 1;
    }

    if (end - index > 1) {
      const tiedIds = new Set(
        sorted.slice(index, end).map((row) => row.team.id),
      );
      const h2h = headToHeadStats(tiedIds, groupFixtures, predictions);

      const slice = sorted.slice(index, end).sort((a, b) => {
        const ah = h2h.get(a.team.id);
        const bh = h2h.get(b.team.id);
        if (bh.points !== ah.points) return bh.points - ah.points;
        if (bh.gd !== ah.gd) return bh.gd - ah.gd;
        if (bh.gf !== ah.gf) return bh.gf - ah.gf;
        return a.team.name.localeCompare(b.team.name);
      });

      sorted.splice(index, end - index, ...slice);
    }

    index = end;
  }

  return sorted.map((row, rankIndex) => ({
    ...row,
    rank: rankIndex + 1,
  }));
}

function isTiedOnCore(a, b) {
  return (
    a.points === b.points &&
    a.goalsDiff === b.goalsDiff &&
    a.goalsFor === b.goalsFor
  );
}

export function buildThirdPlaceStandings(allGroupStandings) {
  const thirds = [];

  for (const letter of Object.keys(allGroupStandings).sort()) {
    const table = allGroupStandings[letter];
    if (table.length >= 3) {
      thirds.push({ ...table[2], group: letter, position: 3 });
    }
  }

  const sorted = thirds.sort((a, b) =>
    compareRows(
      {
        points: a.points,
        goalsDiff: a.goalsDiff,
        goalsFor: a.goalsFor,
        team: a.team,
      },
      {
        points: b.points,
        goalsDiff: b.goalsDiff,
        goalsFor: b.goalsFor,
        team: b.team,
      },
    ),
  );

  const qualifyingIds = new Set(sorted.slice(0, 8).map((row) => row.team.id));

  return sorted.map((row, index) => ({
    ...row,
    rankAmongThirds: index + 1,
    qualifies: qualifyingIds.has(row.team.id),
  }));
}

export function pickQualifiedTeams(allGroupStandings) {
  const direct = [];

  for (const letter of Object.keys(allGroupStandings).sort()) {
    const table = allGroupStandings[letter];
    if (table.length >= 1) direct.push({ ...table[0], group: letter, position: 1 });
    if (table.length >= 2) direct.push({ ...table[1], group: letter, position: 2 });
  }

  const bestThirds = buildThirdPlaceStandings(allGroupStandings)
    .filter((row) => row.qualifies)
    .map((row) => ({
      ...row,
      position: 3,
      bestThird: true,
    }));

  return [...direct, ...bestThirds];
}
