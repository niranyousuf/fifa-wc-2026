import rankings from "@/data/fifa-rankings.json";
import { resolveCanonicalTeamName } from "@/lib/teamNames";
import { isKnockoutFixture } from "@/lib/utils";

const TOP_TIER_MAX = rankings.topTierMaxRank ?? 20;

export function getFifaRank(teamName) {
  if (!teamName || teamName === "TBD") return null;
  const canonical = resolveCanonicalTeamName(teamName);
  const rank = rankings.teams[canonical];
  return typeof rank === "number" ? rank : null;
}

export function isTopTierTeam(teamName) {
  const rank = getFifaRank(teamName);
  return rank !== null && rank <= TOP_TIER_MAX;
}

function isRoundOf32(fixture) {
  return (fixture?.league?.round ?? "").includes("Round of 32");
}

function topTierClashInfo(homeName, awayName) {
  const homeRank = getFifaRank(homeName);
  const awayRank = getFifaRank(awayName);

  if (isTopTierTeam(homeName) && isTopTierTeam(awayName)) {
    return {
      highVoltage: true,
      reason: "top-tier",
      label: "Top-tier clash",
      homeRank,
      awayRank,
    };
  }

  return { highVoltage: false };
}

/**
 * High-voltage: group games and R32 when both sides are FIFA top-tier;
 * R16 through Final are always high-voltage knockout ties.
 */
export function getHighVoltageInfo(fixture) {
  if (!fixture?.teams) {
    return { highVoltage: false };
  }

  const homeName = fixture.teams.home?.name;
  const awayName = fixture.teams.away?.name;

  if (isRoundOf32(fixture)) {
    return topTierClashInfo(homeName, awayName);
  }

  if (isKnockoutFixture(fixture)) {
    return {
      highVoltage: true,
      reason: "knockout",
      label: "Knockout",
    };
  }

  return topTierClashInfo(homeName, awayName);
}

export function isHighVoltageFixture(fixture) {
  return getHighVoltageInfo(fixture).highVoltage;
}
