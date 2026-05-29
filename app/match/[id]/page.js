import { notFound } from "next/navigation";
import { getMatch } from "@/lib/api";
import { MatchDetailClient } from "@/components/MatchDetailClient";

export const revalidate = 60;

export default async function MatchPage({ params }) {
  const { id } = await params;

  let data;
  try {
    data = await getMatch(id);
  } catch {
    notFound();
  }

  if (!data.fixture) notFound();

  return <MatchDetailClient data={data} />;
}
