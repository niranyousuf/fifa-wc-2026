import { filterGroupStageFixtures } from "@/lib/utils";

export function parseGroupLetter(fixture) {
  const round = fixture?.league?.round ?? "";
  const match = round.match(/Group Stage\s*-\s*([A-L])/i);
  return match ? match[1].toUpperCase() : null;
}

export function groupFixturesByLetter(fixtures) {
  const list = Array.isArray(fixtures) ? fixtures : [];
  const groupFixtures = filterGroupStageFixtures(list).filter(
    (fixture) =>
      fixture.teams?.home?.name &&
      fixture.teams?.away?.name &&
      fixture.teams.home.name !== "TBD" &&
      fixture.teams.away.name !== "TBD",
  );

  const groups = {};

  for (const fixture of groupFixtures) {
    const letter = parseGroupLetter(fixture);
    if (!letter) continue;

    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(fixture);
  }

  for (const letter of Object.keys(groups)) {
    groups[letter].sort(
      (a, b) =>
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime(),
    );
  }

  const letters = Object.keys(groups).sort();
  return { groups, letters };
}
