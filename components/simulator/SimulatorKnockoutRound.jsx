"use client";

import {
  FinishedMatchResult,
  MatchScorePicker,
} from "@/components/simulator/ScoreInputs";
import { isFixtureFinished } from "@/lib/tournamentSimulator/fixtureScores";
import {
  resolveKnockoutWinner,
  THIRD_PLACE_ROUND,
} from "@/lib/tournamentSimulator/knockout";
import { hasCompleteScore } from "@/lib/tournamentSimulator/standings";
import { cn } from "@/lib/utils";

export function SimulatorKnockoutRound({
  roundName,
  matches = [],
  predictions,
  onPickChange,
}) {
  if (!matches.length) {
    return (
      <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Score earlier knockout matches to decide who meets in {roundName}.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const pick = predictions[match.id] ?? {};
        const finished = match.apiFixture
          ? isFixtureFinished(match.apiFixture)
          : false;
        const isDraw =
          !finished && hasCompleteScore(pick) && pick.home === pick.away;
        const winner = resolveKnockoutWinner(pick);

        const homeSide = {
          name: match.homeLabel,
          logo: match.home.logo,
        };
        const awaySide = {
          name: match.awayLabel,
          logo: match.away.logo,
        };

        return (
          <article
            key={match.id}
            className={cn(
              "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4",
              winner && "border-[hsl(var(--accent))]/40",
            )}
          >
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              <p>
                {roundName === "Final"
                  ? "Final"
                  : roundName === THIRD_PLACE_ROUND
                    ? "3rd place play-off"
                    : `Match ${match.matchNumber} · ${roundName}`}
              </p>
              {finished ? (
                <span className="rounded-full bg-[hsl(var(--muted))]/50 px-2 py-0.5 normal-case tracking-normal text-[hsl(var(--foreground))]">
                  Final
                </span>
              ) : null}
            </div>

            {finished ? (
              <FinishedMatchResult
                homeSide={homeSide}
                awaySide={awaySide}
                home={pick.home}
                away={pick.away}
              />
            ) : (
              <MatchScorePicker
                homeSide={homeSide}
                awaySide={awaySide}
                home={pick.home}
                away={pick.away}
                onHomeChange={(value) =>
                  onPickChange(match.id, { ...pick, home: value })
                }
                onAwayChange={(value) =>
                  onPickChange(match.id, { ...pick, away: value })
                }
              />
            )}

            {isDraw && (
              <div className="mt-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(pick.usePenalties)}
                    onChange={(event) =>
                      onPickChange(match.id, {
                        ...pick,
                        usePenalties: event.target.checked,
                        penHome: event.target.checked ? pick.penHome : null,
                        penAway: event.target.checked ? pick.penAway : null,
                      })
                    }
                    className="h-4 w-4 rounded border-[hsl(var(--border))]"
                  />
                  Decided on penalties
                </label>

                {pick.usePenalties && (
                  <div className="mt-3 space-y-2">
                    <p className="text-center text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      Penalties
                    </p>
                    <MatchScorePicker
                      homeSide={homeSide}
                      awaySide={awaySide}
                      home={pick.penHome}
                      away={pick.penAway}
                      homeLabel="Home penalties"
                      awayLabel="Away penalties"
                      onHomeChange={(value) =>
                        onPickChange(match.id, { ...pick, penHome: value })
                      }
                      onAwayChange={(value) =>
                        onPickChange(match.id, { ...pick, penAway: value })
                      }
                    />
                  </div>
                )}

                {isDraw && !winner && (
                  <p className="mt-2 text-center text-xs text-[hsl(var(--muted-foreground))]">
                    Enter penalty scores when level after 90 minutes.
                  </p>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
