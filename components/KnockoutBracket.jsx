"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { DragScrollArea } from "@/components/DragScrollArea";
import { matchDetailPath } from "@/lib/matchPaths";
import { getScore, cn } from "@/lib/utils";
import {
  BRACKET_CARD_H,
  WC_2026_KNOCKOUT_ADVANCEMENT,
  buildBracketLayout,
  matchNumbersInVisualOrder,
} from "@/lib/wcBracketTree";
import { KNOCKOUT_ROUNDS } from "@/lib/wcConstants";

const HEADER_OFFSET = 24;
const CONNECTOR_LEAD = 18;

export function KnockoutBracket({ fixtures }) {
  const fixturesByMatchNo = useMemo(() => {
    const map = new Map();
    for (const fixture of fixtures) {
      const matchNo = fixture?._raw?.matchNo;
      if (matchNo) map.set(matchNo, fixture);
    }
    return map;
  }, [fixtures]);

  const { yByMatchNo, connectorsByRound } = useMemo(
    () => buildBracketLayout(BRACKET_CARD_H),
    [],
  );

  const rounds = KNOCKOUT_ROUNDS.map((roundName, roundIndex) => ({
    name: roundName,
    roundIndex,
    slots: matchNumbersInVisualOrder(roundName).map((matchNo) => ({
      matchNo,
      fixture: fixturesByMatchNo.get(matchNo) ?? null,
      y: yByMatchNo.get(matchNo) ?? 0,
    })),
  }));

  const CARD_W = 220;
  const COL_GAP = 74;
  const LEFT_PAD = 8;
  const RIGHT_PAD = 14;
  const TOP_PAD = 8;
  const colX = (roundIndex) => LEFT_PAD + roundIndex * (CARD_W + COL_GAP);
  const contentWidth =
    LEFT_PAD +
    rounds.length * CARD_W +
    (rounds.length - 1) * COL_GAP +
    RIGHT_PAD;
  const maxY = Math.max(
    ...[...yByMatchNo.values()].map((y) => y + BRACKET_CARD_H),
    0,
  );
  const contentHeight = TOP_PAD + HEADER_OFFSET + maxY + 24;

  return (
    <DragScrollArea ariaLabel="Knockout bracket — drag horizontally to explore">
      <div
        className="relative min-w-[1380px]"
        style={{ width: contentWidth, height: contentHeight }}
      >
        {rounds.map((round) => (
          <h3
            key={`${round.name}-title`}
            className="absolute text-center font-display text-sm tracking-wide text-[hsl(var(--muted-foreground))]"
            style={{ left: colX(round.roundIndex), top: 0, width: CARD_W }}
          >
            {round.name}
          </h3>
        ))}

        {rounds.map((round) =>
          round.slots.map((slot) => (
            <div
              key={`${round.name}-${slot.matchNo}`}
              style={{
                position: "absolute",
                left: colX(round.roundIndex),
                top: TOP_PAD + HEADER_OFFSET + slot.y,
                width: CARD_W,
                height: BRACKET_CARD_H,
              }}
            >
              <BracketMatch fixture={slot.fixture} matchNo={slot.matchNo} />
            </div>
          )),
        )}

        {connectorsByRound.map((links, roundIndex) => {
          if (!links.length) return null;

          const xStart = colX(roundIndex) + CARD_W;
          const xJoint = xStart + CONNECTOR_LEAD;
          const xEnd = colX(roundIndex + 1) - 8;
          const topBase = TOP_PAD + HEADER_OFFSET;

          return (
            <div key={`connectors-${roundIndex}`}>
              {links.map((link) => {
                const needsElbow = Math.abs(link.yJoint - link.yTarget) > 1;

                return (
                  <div key={`link-${link.matchNo}`}>
                    <span
                      className="pointer-events-none absolute h-px bg-[hsl(var(--border))]"
                      style={{
                        left: xStart,
                        top: topBase + link.yA,
                        width: CONNECTOR_LEAD,
                      }}
                    />
                    <span
                      className="pointer-events-none absolute h-px bg-[hsl(var(--border))]"
                      style={{
                        left: xStart,
                        top: topBase + link.yB,
                        width: CONNECTOR_LEAD,
                      }}
                    />
                    <span
                      className="pointer-events-none absolute w-px bg-[hsl(var(--border))]"
                      style={{
                        left: xJoint,
                        top: topBase + Math.min(link.yA, link.yB),
                        height: Math.abs(link.yB - link.yA),
                      }}
                    />
                    <span
                      className="pointer-events-none absolute h-px bg-[hsl(var(--border))]"
                      style={{
                        left: xJoint,
                        top: topBase + link.yJoint,
                        width: xEnd - xJoint,
                      }}
                    />
                    {needsElbow ? (
                      <span
                        className="pointer-events-none absolute w-px bg-[hsl(var(--border))]"
                        style={{
                          left: xEnd,
                          top: topBase + Math.min(link.yJoint, link.yTarget),
                          height: Math.abs(link.yJoint - link.yTarget),
                        }}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </DragScrollArea>
  );
}

function BracketMatch({ fixture, matchNo }) {
  const isPlaceholder = !fixture?.fixture;
  const score = getScore(fixture);
  const feeders = feederRefsForMatch(matchNo, fixture?._raw);
  const home = resolveBracketTeam(fixture?.teams?.home, feeders.home);
  const away = resolveBracketTeam(fixture?.teams?.away, feeders.away);

  const content = (
    <div className="flex h-full flex-col rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3">
      <BracketTeamRow team={home} score={score?.home} isRef={home.isRef} />
      <BracketTeamRow team={away} score={score?.away} isRef={away.isRef} />
    </div>
  );

  if (isPlaceholder) {
    return content;
  }

  return (
    <Link
      href={matchDetailPath(fixture.fixture.id)}
      className="block h-full transition-colors hover:[&>div]:border-wc-accent/50"
    >
      {content}
    </Link>
  );
}

function feederRefsForMatch(matchNo, raw) {
  const home = raw?.homeRef ?? null;
  const away = raw?.awayRef ?? null;

  if (home && away) {
    return { home, away };
  }

  const rule = WC_2026_KNOCKOUT_ADVANCEMENT.find((entry) => entry.matchNo === matchNo);
  if (!rule) return { home, away };

  return {
    home: home ?? `W${rule.home}`,
    away: away ?? `W${rule.away}`,
  };
}

function resolveBracketTeam(team, ref) {
  if (team?.name && team.name !== "TBD") {
    return team;
  }

  if (ref) {
    return { name: formatBracketRef(ref), logo: null, isRef: true };
  }

  return { name: "TBD", logo: null };
}

function formatBracketRef(ref) {
  const winnerOrLoser = ref.match(/^([WL])(\d+)$/i);
  if (winnerOrLoser) {
    return `${winnerOrLoser[1].toUpperCase()}${winnerOrLoser[2]}`;
  }

  return ref;
}

function BracketTeamRow({ team, score, isRef = false }) {
  return (
    <div className="flex min-h-0 flex-1 items-center gap-1.5">
      <span className="flex h-5 w-6 shrink-0 items-center justify-center">
        {team.logo ? (
          <Image
            src={team.logo}
            alt=""
            width={24}
            height={20}
            className="h-5 w-6 object-contain"
          />
        ) : (
          <span
            className="block h-[13.5px] w-6 border border-[hsl(var(--border))] bg-[hsl(var(--muted))]"
            aria-hidden
          />
        )}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm font-medium leading-none",
          isRef && "text-[hsl(var(--muted-foreground))]",
        )}
      >
        {team.name}
      </span>
      <span
        className={cn(
          "w-4 shrink-0 text-right text-sm font-semibold tabular-nums leading-none",
          isRef && "text-[hsl(var(--muted-foreground))]",
        )}
      >
        {score !== null && score !== undefined ? score : "-"}
      </span>
    </div>
  );
}
