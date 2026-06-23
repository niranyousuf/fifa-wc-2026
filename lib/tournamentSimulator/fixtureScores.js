import { isFinished } from "@/lib/utils";

/** Group-stage fixture with a final score from the API. */
export function isFixtureFinished(fixture) {
  return isFinished(fixture?.fixture?.status?.short);
}

export function getFixtureResult(fixture) {
  if (!isFixtureFinished(fixture)) return null;

  const home = fixture.goals?.home;
  const away = fixture.goals?.away;

  if (
    Number.isInteger(home) &&
    Number.isInteger(away) &&
    home >= 0 &&
    away >= 0
  ) {
    return { home, away };
  }

  return null;
}

/** Real result when played; otherwise the user's simulator pick. */
export function getEffectiveGroupPick(fixture, groupPredictions = {}) {
  const apiResult = getFixtureResult(fixture);
  if (apiResult) return apiResult;

  const id = fixture?.fixture?.id;
  if (!id) return {};
  return groupPredictions[id] ?? {};
}

/** Merge API final scores into group predictions for standings / progress. */
export function mergeGroupPredictions(groupFixtures, groupPredictions = {}) {
  const merged = { ...groupPredictions };

  for (const fixture of groupFixtures) {
    const result = getFixtureResult(fixture);
    if (result && fixture?.fixture?.id) {
      merged[fixture.fixture.id] = result;
    }
  }

  return merged;
}
