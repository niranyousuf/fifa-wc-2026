import rankings from "@/data/fifa-rankings.json";
import { getTeamsList, teamIdFromName } from "@/lib/api";
import { flagUrlForTeam } from "@/lib/flags";
import { getFifaRank } from "@/lib/highVoltage";

export function getRankingsMeta() {
  return {
    updated: rankings.updated,
    source: rankings.source,
  };
}

export async function getTeamsRanked() {
  const teams = await getTeamsList();

  const ranked = teams.map((team) => {
    const fifaRank = getFifaRank(team.name);

    return {
      name: team.name,
      id: teamIdFromName(team.name),
      logo: flagUrlForTeam(team),
      fifaRank,
      sortRank: fifaRank ?? 9999,
    };
  });

  ranked.sort((a, b) => {
    if (a.sortRank !== b.sortRank) return a.sortRank - b.sortRank;
    return a.name.localeCompare(b.name);
  });

  return ranked.map((team, index) => ({
    ...team,
    listPosition: index + 1,
  }));
}
