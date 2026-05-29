"use client";

import Link from "next/link";
import { DragScrollArea } from "@/components/DragScrollArea";
import { TeamLabel } from "@/components/TeamLabel";
import { getScore } from "@/lib/utils";
import { KNOCKOUT_ROUNDS } from "@/lib/wcConstants";

export function KnockoutBracket({ fixtures }) {
  const expectedMatchCount = [16, 8, 4, 2, 1];
  const rounds = KNOCKOUT_ROUNDS.map((roundName, index) => ({
    name: roundName,
    matches: fixtures
      .filter((fixture) => fixture.league?.round?.includes(roundName))
      .slice(0, expectedMatchCount[index]),
    expectedCount: expectedMatchCount[index],
  }));

  const preparedRounds = rounds.map((round) => ({
    ...round,
    matches: padWithPlaceholders(round.matches, round.expectedCount),
  }));

  const geometry = buildBracketGeometry(preparedRounds[0].matches.length);
  const CARD_W = 220;
  const CARD_H = 60;
  const COL_GAP = 74;
  const LEFT_PAD = 8;
  const RIGHT_PAD = 14;
  const TOP_PAD = 8;
  const colX = (roundIndex) => LEFT_PAD + roundIndex * (CARD_W + COL_GAP);
  const contentWidth =
    LEFT_PAD +
    preparedRounds.length * CARD_W +
    (preparedRounds.length - 1) * COL_GAP +
    RIGHT_PAD;
  const maxY = Math.max(
    ...geometry.flatMap((roundY) => roundY.map((y) => y + CARD_H)),
    0,
  );
  const contentHeight = TOP_PAD + maxY + 14;

  return (
    <DragScrollArea ariaLabel="Knockout bracket — drag horizontally to explore">
      <div
        className="relative min-w-[1380px]"
        style={{ width: contentWidth, height: contentHeight }}
      >
        {preparedRounds.map((round, roundIndex) => (
          <h3
            key={`${round.name}-title`}
            className="absolute text-center font-display text-sm tracking-wide text-[hsl(var(--muted-foreground))]"
            style={{ left: colX(roundIndex), top: 0, width: CARD_W }}
          >
            {round.name}
          </h3>
        ))}

        {preparedRounds.map((round, roundIndex) =>
          round.matches.map((fixture, matchIndex) => (
            <div
              key={`${round.name}-${fixture?.fixture?.id ?? `placeholder-${matchIndex}`}`}
              style={{
                position: "absolute",
                left: colX(roundIndex),
                top: TOP_PAD + 24 + (geometry[roundIndex]?.[matchIndex] ?? 0),
                width: CARD_W,
              }}
            >
              <BracketMatch fixture={fixture} />
            </div>
          )),
        )}

        {preparedRounds.map((_, roundIndex) => {
          if (roundIndex >= preparedRounds.length - 1) return null;
          const centers = (geometry[roundIndex] ?? []).map((y) => y + CARD_H / 2);
          const xStart = colX(roundIndex) + CARD_W;
          const xJoint = xStart + 18;
          const xToNext = xStart + COL_GAP - 8;

          return (
            <div key={`connectors-${roundIndex}`}>
              {centers.map((centerY, idx) => (
                <span
                  key={`lead-${roundIndex}-${idx}`}
                  className="pointer-events-none absolute h-px bg-[hsl(var(--border))]"
                  style={{
                    left: xStart,
                    top: TOP_PAD + 24 + centerY,
                    width: 18,
                  }}
                />
              ))}

              {pairCenters(centers).map((pair, pairIdx) => (
                <div key={`pair-${roundIndex}-${pairIdx}`}>
                  <span
                    className="pointer-events-none absolute w-px bg-[hsl(var(--border))]"
                    style={{
                      left: xJoint,
                      top: TOP_PAD + 24 + pair.top,
                      height: pair.bottom - pair.top,
                    }}
                  />
                  <span
                    className="pointer-events-none absolute h-px bg-[hsl(var(--border))]"
                    style={{
                      left: xJoint,
                      top: TOP_PAD + 24 + pair.mid,
                      width: xToNext - xJoint,
                    }}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </DragScrollArea>
  );
}

function BracketMatch({ fixture }) {
  const isPlaceholder = !fixture?.fixture;
  const score = getScore(fixture);
  const home = fixture?.teams?.home ?? { name: "TBD", logo: null };
  const away = fixture?.teams?.away ?? { name: "TBD", logo: null };

  const content = (
    <div className="relative block rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2">
      <TeamLine team={home} score={score?.home} />
      <TeamLine team={away} score={score?.away} />
    </div>
  );

  if (isPlaceholder) {
    return content;
  }

  return (
    <Link
      href={`/match/${fixture.fixture.id}`}
      className="block transition-colors hover:[&>div]:border-wc-accent/50"
    >
      {content}
    </Link>
  );
}

function TeamLine({ team, score }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <TeamLabel team={team} size="sm" className="min-w-0 flex-1" />
      <span className="shrink-0 text-sm font-semibold tabular-nums">
        {score !== null && score !== undefined ? score : "-"}
      </span>
    </div>
  );
}

function padWithPlaceholders(matches, targetCount) {
  const padded = [...matches];
  while (padded.length < targetCount) {
    padded.push(null);
  }
  return padded;
}

function buildBracketGeometry(firstRoundMatchCount) {
  const CARD_H = 60;
  const GAP_START = 12;
  const rounds = [[...Array(firstRoundMatchCount)].map((_, i) => i * (CARD_H + GAP_START))];

  while (rounds[rounds.length - 1].length > 1) {
    const prev = rounds[rounds.length - 1];
    const next = [];
    for (let i = 0; i < prev.length; i += 2) {
      const a = prev[i];
      const b = prev[i + 1] ?? prev[i] + CARD_H + GAP_START;
      const mid = (a + b) / 2;
      next.push(mid);
    }
    rounds.push(next);
  }

  return rounds;
}

function pairCenters(centers) {
  const pairs = [];
  for (let i = 0; i < centers.length; i += 2) {
    const top = centers[i];
    const bottom = centers[i + 1];
    if (top === undefined || bottom === undefined) continue;
    pairs.push({
      top,
      bottom,
      mid: (top + bottom) / 2,
    });
  }
  return pairs;
}
