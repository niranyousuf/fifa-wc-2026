import { HomeClient } from "@/components/HomeClient";
import { getHubDataSafe } from "@/lib/api";

export const revalidate = 86400;

export const metadata = {
  title: "Tournament Hub | FIFA World Cup 2026",
  description: "Group standings, fixtures, results, and knockout bracket for WC 2026.",
};

export default async function HubPage() {
  const { standings, fixtures, apiRateLimited, fromDiskCache } =
    await getHubDataSafe();

  return (
    <HomeClient
      standings={standings}
      fixtures={fixtures}
      apiRateLimited={apiRateLimited}
      fromDiskCache={fromDiskCache}
    />
  );
}
