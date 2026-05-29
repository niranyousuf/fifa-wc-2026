"use client";

import { FixtureCard } from "@/components/FixtureCard";
import { LocalKickoffDate } from "@/components/LocalKickoffDateTime";
import { groupFixturesByDate } from "@/lib/utils";

export function FinishedResultsView({ fixtures }) {
  const grouped = groupFixturesByDate(fixtures);
  const dates = Object.keys(grouped).sort().reverse();

  if (!dates.length) {
    return (
      <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-[hsl(var(--muted-foreground))]">
        No finished match results yet.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {dates.map((date) => (
        <section key={date}>
          <h2 className="mb-4 font-display text-2xl tracking-wide text-wc-accent">
            <LocalKickoffDate date={date} />
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {grouped[date].map((fixture) => (
              <FixtureCard key={fixture.fixture.id} fixture={fixture} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
