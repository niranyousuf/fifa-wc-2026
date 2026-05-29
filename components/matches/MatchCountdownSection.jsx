"use client";

import { MatchCountdownCard } from "@/components/home/MatchCountdownCard";
import { LocalKickoffDate } from "@/components/LocalKickoffDateTime";
import { groupFixturesByDate } from "@/lib/utils";

export function MatchCountdownSection({
  id,
  title,
  description,
  fixtures,
  emptyMessage,
  headerAction,
}) {
  const grouped = groupFixturesByDate(fixtures);
  const dates = Object.keys(grouped).sort();

  return (
    <section className="space-y-4" aria-labelledby={id}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id={id} className="font-display text-2xl tracking-wide sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        </div>
        {headerAction}
      </div>

      {dates.length ? (
        <div className="space-y-6">
          {dates.map((date) => (
            <div key={date} className="space-y-3">
              <h3 className="font-display text-xl tracking-wide text-wc-accent">
                <LocalKickoffDate date={date} />
              </h3>
              <div className="space-y-3">
                {grouped[date].map((fixture) => (
                  <MatchCountdownCard key={fixture.fixture.id} fixture={fixture} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}
