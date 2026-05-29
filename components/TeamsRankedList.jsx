"use client";

import { TeamLabel } from "@/components/TeamLabel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TeamsRankedList({ teams, rankingsUpdated }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[hsl(var(--border))] px-4 py-3 sm:px-5">
        <CardTitle className="text-base sm:text-lg">All teams by FIFA rank</CardTitle>
        {rankingsUpdated && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Rankings snapshot: {rankingsUpdated}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-left text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                <th className="w-12 px-2 py-3 text-center sm:px-3">#</th>
                <th className="px-3 py-3 sm:px-4">Team</th>
                <th className="w-24 px-3 py-3 text-right sm:px-4">FIFA</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr
                  key={team.id}
                  className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/40"
                >
                  <td className="px-2 py-3 text-center tabular-nums text-[hsl(var(--muted-foreground))] sm:px-3">
                    {team.listPosition}
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <TeamLabel
                      team={team}
                      href={`/team/${team.id}`}
                      size="md"
                      starPosition="before-flag"
                    />
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold sm:px-4">
                    {team.fifaRank ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
