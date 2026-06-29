"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SimulatorGroupTable } from "@/components/simulator/SimulatorGroupTable";
import { SimulatorThirdPlaceTable } from "@/components/simulator/SimulatorThirdPlaceTable";
import { SimulatorKnockoutRound } from "@/components/simulator/SimulatorKnockoutRound";
import { MatchScorePicker, FinishedMatchResult } from "@/components/simulator/ScoreInputs";
import { groupFixturesByLetter } from "@/lib/tournamentSimulator/groupFixtures";
import {
  isFixtureFinished,
  mergeGroupPredictions,
} from "@/lib/tournamentSimulator/fixtureScores";
import {
  countFinishedKnockoutFixtures,
  mergeKnockoutPredictions,
  overlayApiKnockoutMatches,
} from "@/lib/tournamentSimulator/knockoutFixtures";
import {
  advanceKnockoutBracket,
  buildInitialKnockoutBracket,
  countKnockoutRoundMatches,
  findKnockoutMatchById,
  getDownstreamMatchIdsForMatch,
  getKnockoutPredictionKeysToClear,
  isKnockoutRoundAvailable,
  knockoutWinnerChanged,
  parseKnockoutMatchId,
  resolveKnockoutWinner,
  THIRD_PLACE_ROUND,
} from "@/lib/tournamentSimulator/knockout";
import { KNOCKOUT_ROUNDS } from "@/lib/wcConstants";
import {
  buildGroupStandings,
  buildThirdPlaceStandings,
  groupResultChanged,
  hasCompleteScore,
  pickQualifiedTeams,
} from "@/lib/tournamentSimulator/standings";
import {
  clearSimulatorState,
  loadSimulatorState,
  saveSimulatorState,
} from "@/lib/tournamentSimulator/storage";
import { HomeTournamentFormatSection } from "@/components/home/HomeTournamentFormatSection";
import { LocalKickoffDateTime } from "@/components/LocalKickoffDateTime";
import { cn } from "@/lib/utils";

export function SimulatorPageClient({ fixtures: fixturesProp = [] }) {
  const fixtures = Array.isArray(fixturesProp) ? fixturesProp : [];

  const { groups, letters } = useMemo(
    () => groupFixturesByLetter(fixtures),
    [fixtures],
  );

  const [activeGroup, setActiveGroup] = useState(letters[0] ?? "A");
  const [view, setView] = useState("group");
  const [activeKnockoutRound, setActiveKnockoutRound] = useState(
    KNOCKOUT_ROUNDS[0],
  );
  const [predictions, setPredictions] = useState({
    group: {},
    knockout: {},
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPredictions(loadSimulatorState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSimulatorState(predictions);
  }, [predictions, hydrated]);

  useEffect(() => {
    if (letters.length && !letters.includes(activeGroup)) {
      setActiveGroup(letters[0]);
    }
  }, [letters, activeGroup]);

  const allGroupFixtures = useMemo(
    () => letters.flatMap((letter) => groups[letter] ?? []),
    [groups, letters],
  );

  const effectiveGroupPredictions = useMemo(
    () => mergeGroupPredictions(allGroupFixtures, predictions.group),
    [allGroupFixtures, predictions.group],
  );

  const effectiveKnockoutPredictions = useMemo(
    () => mergeKnockoutPredictions(fixtures, predictions.knockout),
    [fixtures, predictions.knockout],
  );

  const finishedGroupCount = useMemo(
    () => allGroupFixtures.filter(isFixtureFinished).length,
    [allGroupFixtures],
  );

  const finishedKnockoutCount = useMemo(
    () => countFinishedKnockoutFixtures(fixtures),
    [fixtures],
  );

  const groupProgress = useMemo(() => {
    const total = allGroupFixtures.length;
    const done = allGroupFixtures.filter((fixture) =>
      hasCompleteScore(effectiveGroupPredictions[fixture.fixture.id]),
    ).length;
    return { total, done };
  }, [allGroupFixtures, effectiveGroupPredictions]);

  const standingsByGroup = useMemo(() => {
    const result = {};
    for (const letter of letters) {
      result[letter] = buildGroupStandings(
        groups[letter] ?? [],
        effectiveGroupPredictions,
      );
    }
    return result;
  }, [groups, letters, effectiveGroupPredictions]);

  const thirdPlaceStandings = useMemo(
    () => buildThirdPlaceStandings(standingsByGroup),
    [standingsByGroup],
  );

  const groupStageComplete =
    groupProgress.total > 0 && groupProgress.done === groupProgress.total;

  const qualifiedTeams = useMemo(() => {
    if (!groupStageComplete) return [];
    return pickQualifiedTeams(standingsByGroup);
  }, [groupStageComplete, standingsByGroup]);

  const baseBracket = useMemo(() => {
    if (!qualifiedTeams.length) return null;
    return buildInitialKnockoutBracket(qualifiedTeams);
  }, [qualifiedTeams]);

  const knockoutBracket = useMemo(() => {
    if (!baseBracket) return null;
    const withApi = overlayApiKnockoutMatches(baseBracket, fixtures);
    return advanceKnockoutBracket(withApi, effectiveKnockoutPredictions);
  }, [baseBracket, effectiveKnockoutPredictions, fixtures]);

  const knockoutRounds = knockoutBracket?.rounds ?? KNOCKOUT_ROUNDS;

  useEffect(() => {
    if (!knockoutBracket) return;

    const currentMatches = knockoutBracket.matches[activeKnockoutRound] ?? [];
    if (currentMatches.length > 0) return;

    const fallback = [...knockoutRounds]
      .reverse()
      .find((round) => (knockoutBracket.matches[round] ?? []).length > 0);

    if (fallback && fallback !== activeKnockoutRound) {
      setActiveKnockoutRound(fallback);
    }
  }, [knockoutBracket, activeKnockoutRound, knockoutRounds]);

  const champion = useMemo(() => {
    const finalMatches = knockoutBracket?.matches?.Final ?? [];
    const match = finalMatches[0];
    if (!match) return null;

    const pick = effectiveKnockoutPredictions[match.id];
    if (!pick) return null;

    const side = resolveKnockoutWinner(pick);
    if (!side) return null;
    return side === "home" ? match.home : match.away;
  }, [knockoutBracket, effectiveKnockoutPredictions]);

  const thirdPlaceFinisher = useMemo(() => {
    const playoff = knockoutBracket?.matches?.[THIRD_PLACE_ROUND] ?? [];
    const match = playoff[0];
    if (!match) return null;

    const pick = effectiveKnockoutPredictions[match.id];
    if (!pick) return null;

    const side = resolveKnockoutWinner(pick);
    if (!side) return null;
    return side === "home" ? match.home : match.away;
  }, [knockoutBracket, effectiveKnockoutPredictions]);

  function setGroupPick(fixtureId, patch) {
    const fixture = allGroupFixtures.find((entry) => entry.fixture.id === fixtureId);
    if (fixture && isFixtureFinished(fixture)) return;

    setPredictions((current) => {
      const previous = current.group[fixtureId] ?? {};
      const nextPick = { ...previous, ...patch };
      const clearKnockout = groupResultChanged(previous, nextPick);

      return {
        ...current,
        group: {
          ...current.group,
          [fixtureId]: nextPick,
        },
        knockout: clearKnockout ? {} : current.knockout,
      };
    });
  }

  function setKnockoutPick(matchId, patch) {
    const match = findKnockoutMatchById(knockoutBracket, matchId);
    if (match?.apiFixture && isFixtureFinished(match.apiFixture)) return;

    setPredictions((current) => {
      const previous = current.knockout[matchId] ?? {};
      const nextPick = { ...previous, ...patch };
      const knockout = { ...current.knockout, [matchId]: nextPick };

      if (knockoutBracket) {
        const parsed = parseKnockoutMatchId(matchId, knockoutRounds);
        const match = findKnockoutMatchById(knockoutBracket, matchId);

        if (
          parsed &&
          match &&
          parsed.round !== THIRD_PLACE_ROUND &&
          knockoutWinnerChanged(match, previous, nextPick)
        ) {
          for (const downstreamId of getDownstreamMatchIdsForMatch(match)) {
            delete knockout[downstreamId];
          }
        }
      }

      return { ...current, knockout };
    });
  }

  function handleReset() {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Clear all predicted scores and start over?")
    ) {
      return;
    }
    clearSimulatorState();
    setPredictions({ group: {}, knockout: {} });
    setView("group");
  }

  function handleResetGroup(letter) {
    const fixtures = groups[letter] ?? [];
    const hasScores = fixtures.some(
      (fixture) =>
        !isFixtureFinished(fixture) &&
        hasCompleteScore(predictions.group[fixture.fixture.id]),
    );

    if (!hasScores) return;

    if (
      typeof window !== "undefined" &&
      !window.confirm(`Clear all scores for Group ${letter}?`)
    ) {
      return;
    }

    setPredictions((current) => {
      const group = { ...current.group };
      for (const fixture of fixtures) {
        if (isFixtureFinished(fixture)) continue;
        delete group[fixture.fixture.id];
      }
      return { ...current, group };
    });
  }

  function handleResetKnockoutRound(roundName, { thirdPlaceOnly = false } = {}) {
    if (!knockoutBracket) return;

    const matchIds = getKnockoutPredictionKeysToClear(
      predictions.knockout,
      roundName,
      { thirdPlaceOnly, rounds: knockoutRounds },
    ).filter((id) => {
      const match = findKnockoutMatchById(knockoutBracket, id);
      return !(match?.apiFixture && isFixtureFinished(match.apiFixture));
    });

    const hasScores = matchIds.some((id) => predictions.knockout[id]);
    if (!hasScores) return;

    const label = thirdPlaceOnly
      ? "3rd place play-off"
      : `${roundName} and later rounds`;

    if (
      typeof window !== "undefined" &&
      !window.confirm(`Clear scores for ${label}?`)
    ) {
      return;
    }

    setPredictions((current) => {
      const knockout = { ...current.knockout };
      for (const id of matchIds) {
        delete knockout[id];
      }
      return { ...current, knockout };
    });
  }

  if (!letters.length) {
    return (
      <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-[hsl(var(--muted-foreground))]">
        Group-stage schedule is not available right now. Try again later.
      </p>
    );
  }

  const activeFixtures = groups[activeGroup] ?? [];

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-wc-accent">
          Entertainment only
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-wide sm:text-4xl">
              Tournament prediction simulator
            </h1>
            <p className="mt-2 max-w-2xl text-[hsl(var(--muted-foreground))]">
              Enter scores for upcoming matches. Finished games show real results
              from the API and cannot be changed. Knockout pairings follow the
              official bracket when known; ties level after 90 minutes can go
              to penalties. Your predictions are saved in this browser for 60
              days.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="shrink-0 rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]/40"
          >
            Reset all
          </button>
        </div>

        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Group stage: {groupProgress.done}/{groupProgress.total} matches scored
          {finishedGroupCount > 0
            ? ` (${finishedGroupCount} final from real results)`
            : ""}
          {groupStageComplete ? " · Knockout unlocked" : ""}
          {finishedKnockoutCount > 0
            ? ` · ${finishedKnockoutCount} knockout final from API`
            : ""}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <ViewTab active={view === "group"} onClick={() => setView("group")}>
          Group stage
        </ViewTab>
        <ViewTab
          active={view === "knockout"}
          onClick={() => setView("knockout")}
          disabled={!groupStageComplete}
        >
          Knockout
        </ViewTab>
      </div>

      {view === "group" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {letters.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => setActiveGroup(letter)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                  activeGroup === letter
                    ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))]"
                    : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/40",
                )}
              >
                Group {letter}
              </button>
            ))}
          </div>

          <section className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl tracking-wide">
                  Group {activeGroup} matches
                </h2>
                <RoundResetButton
                  label={`Reset Group ${activeGroup}`}
                  onClick={() => handleResetGroup(activeGroup)}
                  disabled={
                    !activeFixtures.some(
                      (fixture) =>
                        !isFixtureFinished(fixture) &&
                        predictions.group[fixture.fixture.id],
                    )
                  }
                />
              </div>
              <ul className="divide-y divide-[hsl(var(--border))] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                {activeFixtures.map((fixture) => {
                  const finished = isFixtureFinished(fixture);
                  const pick =
                    effectiveGroupPredictions[fixture.fixture.id] ?? {};

                  return (
                    <li
                      key={fixture.fixture.id}
                      className="space-y-3 px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                        <LocalKickoffDateTime
                          date={fixture.fixture.date}
                          dateVariant="short"
                        />
                        {finished ? (
                          <span className="rounded-full bg-[hsl(var(--muted))]/50 px-2 py-0.5 font-medium uppercase tracking-wide text-[hsl(var(--foreground))]">
                            Final
                          </span>
                        ) : null}
                      </div>
                      {finished ? (
                        <FinishedMatchResult
                          homeSide={fixture.teams.home}
                          awaySide={fixture.teams.away}
                          home={pick.home}
                          away={pick.away}
                        />
                      ) : (
                        <MatchScorePicker
                          homeSide={fixture.teams.home}
                          awaySide={fixture.teams.away}
                          home={pick.home}
                          away={pick.away}
                          onHomeChange={(value) =>
                            setGroupPick(fixture.fixture.id, { home: value })
                          }
                          onAwayChange={(value) =>
                            setGroupPick(fixture.fixture.id, { away: value })
                          }
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-2xl tracking-wide">
                Predicted Group {activeGroup}
              </h2>
              <SimulatorGroupTable standings={standingsByGroup[activeGroup]} />
            </div>
          </section>

          <section className="space-y-4 border-t border-[hsl(var(--border))] pt-8">
            <div>
              <h2 className="font-display text-2xl tracking-wide">
                Third-place teams
              </h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                All 12 group runners-up in 3rd place, ranked together. Top 8
                advance to the Round of 32 (highlighted like 1st and 2nd in
                group tables).
              </p>
            </div>
            <SimulatorThirdPlaceTable rows={thirdPlaceStandings} />
          </section>
        </div>
      )}

      {view === "knockout" && knockoutBracket && (
        <div className="space-y-6">
          {(champion || thirdPlaceFinisher) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {champion && (
                <div className="rounded-xl border border-[hsl(var(--accent))]/40 bg-[hsl(var(--accent))]/10 p-5 text-center">
                  <p className="text-sm uppercase tracking-wide text-wc-accent">
                    Your predicted champion
                  </p>
                  <p className="mt-2 font-display text-3xl tracking-wide">
                    {champion.name}
                  </p>
                </div>
              )}
              {thirdPlaceFinisher && (
                <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-5 text-center">
                  <p className="text-sm uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Your predicted 3rd place
                  </p>
                  <p className="mt-2 font-display text-2xl tracking-wide">
                    {thirdPlaceFinisher.name}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {knockoutRounds.map((roundName) => {
              const matchCount = countKnockoutRoundMatches(
                knockoutBracket,
                roundName,
              );
              const available = isKnockoutRoundAvailable(
                knockoutBracket,
                roundName,
              );

              return (
                <button
                  key={roundName}
                  type="button"
                  onClick={() => setActiveKnockoutRound(roundName)}
                  disabled={!available}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                    activeKnockoutRound === roundName
                      ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))]"
                      : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/40",
                    !available && "cursor-not-allowed opacity-40",
                  )}
                >
                  {roundName}
                  {matchCount > 0 ? ` (${matchCount})` : ""}
                </button>
              );
            })}
          </div>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl tracking-wide">
                {activeKnockoutRound}
              </h2>
              <RoundResetButton
                label={`Reset ${activeKnockoutRound}`}
                onClick={() => handleResetKnockoutRound(activeKnockoutRound)}
                disabled={
                  !getKnockoutPredictionKeysToClear(
                    predictions.knockout,
                    activeKnockoutRound,
                    { rounds: knockoutRounds },
                  )
                    .filter((id) => {
                      const match = findKnockoutMatchById(knockoutBracket, id);
                      return !(
                        match?.apiFixture && isFixtureFinished(match.apiFixture)
                      );
                    })
                    .some((id) => predictions.knockout[id])
                }
              />
            </div>
            <SimulatorKnockoutRound
              roundName={activeKnockoutRound}
              matches={knockoutMatchesForRound(
                knockoutBracket,
                activeKnockoutRound,
              )}
              predictions={effectiveKnockoutPredictions}
              onPickChange={setKnockoutPick}
            />

            {activeKnockoutRound === "Final" && (
              <div className="space-y-4 border-t border-[hsl(var(--border))] pt-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl tracking-wide">
                    3rd place play-off
                  </h3>
                  <RoundResetButton
                    label="Reset 3rd place"
                    onClick={() =>
                      handleResetKnockoutRound(activeKnockoutRound, {
                        thirdPlaceOnly: true,
                      })
                    }
                    disabled={
                      !getKnockoutPredictionKeysToClear(
                        predictions.knockout,
                        activeKnockoutRound,
                        { thirdPlaceOnly: true, rounds: knockoutRounds },
                      )
                        .filter((id) => {
                          const match = findKnockoutMatchById(
                            knockoutBracket,
                            id,
                          );
                          return !(
                            match?.apiFixture &&
                            isFixtureFinished(match.apiFixture)
                          );
                        })
                        .some((id) => predictions.knockout[id])
                    }
                  />
                </div>
                <SimulatorKnockoutRound
                  roundName={THIRD_PLACE_ROUND}
                  matches={knockoutMatchesForRound(
                    knockoutBracket,
                    THIRD_PLACE_ROUND,
                  )}
                  predictions={effectiveKnockoutPredictions}
                  onPickChange={setKnockoutPick}
                />
              </div>
            )}
          </section>
        </div>
      )}

      {view === "knockout" && !groupStageComplete && (
        <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-[hsl(var(--muted-foreground))]">
          Score every group match to unlock the knockout rounds.
        </p>
      )}

      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        <Link href="/" className="font-medium text-[hsl(var(--accent))] hover:underline">
          ← Back to the main site
        </Link>
        {" "}
        (real fixtures and results)
      </p>

      <HomeTournamentFormatSection />
    </div>
  );
}

function knockoutMatchesForRound(bracket, roundName) {
  return (bracket?.matches?.[roundName] ?? []).filter(Boolean);
}

function RoundResetButton({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "shrink-0 rounded-md border border-[hsl(var(--border))] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]/40",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {label}
    </button>
  );
}

function ViewTab({ active, onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
          : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/40",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {children}
    </button>
  );
}
