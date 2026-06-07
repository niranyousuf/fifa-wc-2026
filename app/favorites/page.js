import { FavoritesPageClient } from "@/components/favorites/FavoritesPageClient";
import { getHubDataSafe } from "@/lib/api";
import { getTeamsRanked } from "@/lib/teamsRanked";

export const revalidate = 86400;

export const metadata = {
  title: "Favorites | FIFA World Cup 2026",
  description: "Your starred nations — upcoming matches, results, and kickoff countdowns.",
};

export default async function FavoritesPage() {
  const [{ fixtures }, teams] = await Promise.all([
    getHubDataSafe(),
    getTeamsRanked().catch(() => []),
  ]);

  return <FavoritesPageClient fixtures={fixtures} teams={teams} />;
}
