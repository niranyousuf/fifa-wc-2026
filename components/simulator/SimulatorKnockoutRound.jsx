"use client";

import Image from "next/image";
import { ScoreInputs } from "@/components/simulator/ScoreInputs";
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
        const isDraw =
          hasCompleteScore(pick) && pick.home === pick.away;
        const winner = resolveKnockoutWinner(pick);

        return (
          <article
            key={match.id}
            className={cn(
              "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4",
              winner && "border-[hsl(var(--accent))]/40",
            )}
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              {roundName === "Final"
                ? "Final"
                : roundName === THIRD_PLACE_ROUND
                  ? "3rd place play-off"
                  : `Match ${match.matchNumber} · ${roundName}`}
            </p>

            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <TeamSide name={match.homeLabel} logo={match.home.logo} align="left" />
              <ScoreInputs
                home={pick.home}
                away={pick.away}
                onHomeChange={(value) =>
                  onPickChange(match.id, { ...pick, home: value })
                }
                onAwayChange={(value) =>
                  onPickChange(match.id, { ...pick, away: value })
                }
              />
              <TeamSide
                name={match.awayLabel}
                logo={match.away.logo}
                align="right"
              />
            </div>

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
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      Penalties
                    </span>
                    <ScoreInputs
                      home={pick.penHome}
                      away={pick.penAway}
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

function TeamSide({ name, logo, align }) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        align === "right" && "md:flex-row-reverse md:text-right",
      )}
    >
      {logo ? (
        <span className="relative h-6 w-8 shrink-0">
          <Image src={logo} alt="" fill className="object-contain" sizes="32px" />
        </span>
      ) : null}
      <span className="truncate text-sm font-medium">{name}</span>
    </div>
  );
}
