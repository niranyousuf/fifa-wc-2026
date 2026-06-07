import { TeamSearchBar } from "@/components/TeamSearchBar";
import { TeamsRankedList } from "@/components/TeamsRankedList";
import { getRankingsMeta, getTeamsRanked } from "@/lib/teamsRanked";

export const revalidate = 86400;

export const metadata = {
  title: "Teams | FIFA World Cup 2026",
  description:
    "All FIFA World Cup 2026 teams sorted by FIFA men's world ranking.",
};

export default async function TeamsPage() {
  let teams = [];

  try {
    teams = await getTeamsRanked();
  } catch {
    teams = [];
  }

  const { updated } = getRankingsMeta();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-wc-accent">Teams</p>
        <h1 className="font-display text-3xl tracking-wide sm:text-4xl">
          World Cup 2026 squads
        </h1>
        <p className="max-w-2xl text-[hsl(var(--muted-foreground))]">
          Every nation at the tournament, ordered by FIFA men&apos;s world ranking. Tap a
          team for squad and details.
        </p>
      </section>

      <TeamSearchBar className="mt-4 mb-2" />

      {teams.length ? (
        <TeamsRankedList teams={teams} rankingsUpdated={updated} />
      ) : (
        <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-[hsl(var(--muted-foreground))]">
          Team list is not available right now.
        </p>
      )}
    </div>
  );
}
