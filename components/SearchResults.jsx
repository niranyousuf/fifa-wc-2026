"use client";

import { TeamLabel } from "@/components/TeamLabel";

export function SearchResults({ results, onSelect }) {
  if (!results.length) {
    return (
      <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm text-[hsl(var(--muted-foreground))] shadow-lg">
        No teams found.
      </div>
    );
  }

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg">
      <ul>
        {results.map((item) => {
          const team = item.team ?? item;
          return (
            <li key={team.id}>
              <div className="px-4 py-3 transition-colors hover:bg-[hsl(var(--muted))]">
                <TeamLabel
                  team={team}
                  href={`/team/${team.id}`}
                  size="sm"
                  linkOnClick={onSelect}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
