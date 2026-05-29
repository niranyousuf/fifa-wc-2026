"use client";

import { TeamLabel } from "@/components/TeamLabel";

export function TeamPageHero({ team, country }) {
  return (
    <section className="flex flex-col items-start gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:flex-row md:items-center">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-wc-accent">Team</p>
        <TeamLabel
          team={team}
          size="lg"
          className="flex-col items-start gap-3 sm:flex-row sm:items-center"
        />
        {country && (
          <p className="text-[hsl(var(--muted-foreground))]">{country}</p>
        )}
      </div>
    </section>
  );
}
