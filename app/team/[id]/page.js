import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTeam } from "@/lib/api";
import { TeamPageHero } from "@/components/TeamPageHero";
import { TeamSquad } from "@/components/TeamSquad";

export const revalidate = 3600;

export default async function TeamPage({ params }) {
  const { id } = await params;
  const data = await getTeam(id);
  const team = data.team?.team;

  if (!team) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/teams"
        className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to teams
      </Link>

      <TeamPageHero team={team} country={team.country} />

      {data.rosterUnavailable && (
        <p className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
          Squad data is temporarily unavailable. Refresh in a moment if the API
          rate limit has cleared.
        </p>
      )}

      <TeamSquad team={team} players={data.squad} />
    </div>
  );
}
