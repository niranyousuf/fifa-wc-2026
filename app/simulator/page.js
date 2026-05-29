import { SimulatorPageClient } from "@/components/simulator/SimulatorPageClient";
import { getHubDataSafe } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tournament Prediction Simulator | FIFA World Cup 2026",
  description:
    "Entertainment-only what-if tournament — predict group scores and play through knockouts with optional penalties.",
};

export default async function SimulatorPage() {
  const { fixtures } = await getHubDataSafe();

  return <SimulatorPageClient fixtures={fixtures} />;
}
