import Image from "next/image";
import { cn } from "@/lib/utils";

export function SimulatorThirdPlaceTable({ rows }) {
  if (!rows?.length) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        Enter group scores to rank third-place teams.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-left text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Grp</th>
            <th className="px-3 py-2">Team</th>
            <th className="px-2 py-2 text-center">P</th>
            <th className="px-2 py-2 text-center">W</th>
            <th className="px-2 py-2 text-center">D</th>
            <th className="px-2 py-2 text-center">L</th>
            <th className="px-2 py-2 text-center">GD</th>
            <th className="px-3 py-2 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.group}-${row.team.id}`}
              className={cn(
                "border-b border-[hsl(var(--border))] last:border-0",
                row.qualifies && "bg-[hsl(var(--accent))]/5",
              )}
            >
              <td className="px-3 py-2 font-medium tabular-nums">
                {row.rankAmongThirds}
              </td>
              <td className="px-3 py-2 font-medium tabular-nums">{row.group}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  {row.team.logo ? (
                    <span className="relative h-4 w-6 shrink-0">
                      <Image
                        src={row.team.logo}
                        alt=""
                        fill
                        className="object-contain"
                        sizes="24px"
                      />
                    </span>
                  ) : null}
                  <span className="truncate font-medium">{row.team.name}</span>
                </div>
              </td>
              <td className="px-2 py-2 text-center tabular-nums">{row.played}</td>
              <td className="px-2 py-2 text-center tabular-nums">{row.win}</td>
              <td className="px-2 py-2 text-center tabular-nums">{row.draw}</td>
              <td className="px-2 py-2 text-center tabular-nums">{row.lose}</td>
              <td className="px-2 py-2 text-center tabular-nums">
                {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
              </td>
              <td className="px-3 py-2 text-center font-semibold tabular-nums">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
