"use client";

import { useState } from "react";
import { TeamSearchBar } from "@/components/TeamSearchBar";
import { ViewToggle } from "@/components/ViewToggle";
import { GroupTable } from "@/components/GroupTable";
import { CalendarView } from "@/components/CalendarView";
import { FinishedResultsView } from "@/components/FinishedResultsView";
import { KnockoutBracket } from "@/components/KnockoutBracket";
import { filterKnockoutFixtures, isFinished } from "@/lib/utils";

export function HomeClient({
  standings,
  fixtures,
  apiRateLimited = false,
  fromDiskCache = false,
}) {
  const [activeView, setActiveView] = useState("calendar");
  const upcomingFixtures = fixtures.filter(
    (fixture) => !isFinished(fixture.fixture?.status?.short),
  );
  const finishedFixtures = fixtures.filter((fixture) =>
    isFinished(fixture.fixture?.status?.short),
  );
  const knockoutFixtures = filterKnockoutFixtures(fixtures);

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-wc-accent">FIFA World Cup</p>
          <h1 className="font-display text-4xl tracking-wide md:text-5xl">
            World Cup 2026 Hub
          </h1>
          <p className="mt-2 max-w-2xl text-[hsl(var(--muted-foreground))]">
            Browse group standings, upcoming fixtures, results, and the knockout bracket.
          </p>
        </div>
        <TeamSearchBar className="mt-2" />
        <ViewToggle activeView={activeView} onChange={setActiveView} />
      </section>

      {apiRateLimited && (
        <ApiNotice variant="rate-limit" />
      )}

      {!apiRateLimited && fromDiskCache && (
        <ApiNotice variant="cached" />
      )}

      {activeView === "groups" && (
        <section className="space-y-4">
          {standings.length ? (
            standings.map((group) => (
              <GroupTable
                key={group.group}
                group={group.group}
                standings={group.standings}
              />
            ))
          ) : (
            <EmptyState message="Group standings are not available yet." />
          )}
        </section>
      )}

      {activeView === "calendar" && <CalendarView fixtures={upcomingFixtures} />}

      {activeView === "results" && (
        <FinishedResultsView fixtures={finishedFixtures} />
      )}

      {activeView === "bracket" && (
        knockoutFixtures.length ? (
          <KnockoutBracket fixtures={knockoutFixtures} />
        ) : (
          <EmptyState message="Knockout bracket fixtures are not available yet." />
        )
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-[hsl(var(--muted-foreground))]">
      {message}
    </p>
  );
}

function ApiNotice({ variant }) {
  if (variant === "rate-limit") {
    return (
      <p className="rounded-lg border border-wc-accent/40 bg-wc-accent/10 px-4 py-3 text-sm text-[hsl(var(--foreground))]">
        Zafronix API quota is exhausted (429). Standings and fixtures are
        hidden until the limit resets — usually within a day. When the API works
        again, run{" "}
        <code className="rounded bg-black/20 px-1 py-0.5 text-xs">npm run cache:warm</code>{" "}
        once, then restart the dev server. You can also request a fresh key at{" "}
        <a
          href="https://api.zafronix.com/signup"
          className="font-medium text-wc-accent underline-offset-2 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          api.zafronix.com/signup
        </a>
        .
      </p>
    );
  }

  return (
    <p className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
      Showing saved tournament data from disk while the live API is unavailable.
    </p>
  );
}
