"use client";

import { TeamLabel } from "@/components/TeamLabel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function GroupTable({ group, standings }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-0 border-b border-[hsl(var(--border))] px-5 py-3">
        <CardTitle className="leading-none">{group}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] table-fixed text-sm">
          <colgroup>
            <col className="w-12" />
            <col className="w-64" />
            <col className="w-12" />
            <col className="w-12" />
            <col className="w-12" />
            <col className="w-12" />
            <col className="w-14" />
            <col className="w-14" />
            <col className="w-14" />
            <col className="w-14" />
          </colgroup>
          <thead>
            <tr className="border-b border-[hsl(var(--border))] text-left text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              <th className="px-2 py-3 text-center">#</th>
              <th className="px-3 py-3">Team</th>
              <th className="px-2 py-3 text-center">P</th>
              <th className="px-2 py-3 text-center">W</th>
              <th className="px-2 py-3 text-center">D</th>
              <th className="px-2 py-3 text-center">L</th>
              <th className="px-2 py-3 text-center">GF</th>
              <th className="px-2 py-3 text-center">GA</th>
              <th className="px-2 py-3 text-center">GD</th>
              <th className="px-2 py-3 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr
                key={row.team.id}
                className={cn(
                  "border-b border-[hsl(var(--border))]/60 transition-colors duration-150 last:border-0",
                  row.rank <= 2 &&
                    "bg-emerald-500/10 hover:bg-emerald-500/20",
                  row.rank === 3 &&
                    "bg-amber-500/10 hover:bg-amber-500/20",
                  row.rank > 3 && "hover:bg-[hsl(var(--muted))]/40",
                )}
              >
                <td className="px-2 py-3 text-center font-medium tabular-nums">{row.rank}</td>
                <td className="px-3 py-3">
                  <TeamLabel
                    team={row.team}
                    href={`/team/${row.team.id}`}
                    size="sm"
                    starPosition="before-flag"
                  />
                </td>
                <td className="px-2 py-3 text-center tabular-nums">{row.all.played}</td>
                <td className="px-2 py-3 text-center tabular-nums">{row.all.win}</td>
                <td className="px-2 py-3 text-center tabular-nums">{row.all.draw}</td>
                <td className="px-2 py-3 text-center tabular-nums">{row.all.lose}</td>
                <td className="px-2 py-3 text-center tabular-nums">{row.all.goals.for}</td>
                <td className="px-2 py-3 text-center tabular-nums">{row.all.goals.against}</td>
                <td className="px-2 py-3 text-center tabular-nums">{row.goalsDiff}</td>
                <td className="px-2 py-3 text-center font-semibold tabular-nums">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
