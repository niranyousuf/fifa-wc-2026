import { KNOCKOUT_ROUNDS, THIRD_PLACE_ROUND } from "@/lib/wcConstants";

const FEEDER_REF_PATTERN = /^[WL]\d+$/i;

/** Official WC 2026 knockout tree — feeder pairs by FIFA match number. */
export const WC_2026_KNOCKOUT_ADVANCEMENT = [
  { matchNo: 89, home: 74, away: 77 },
  { matchNo: 90, home: 73, away: 75 },
  { matchNo: 91, home: 76, away: 78 },
  { matchNo: 92, home: 79, away: 80 },
  { matchNo: 93, home: 83, away: 84 },
  { matchNo: 94, home: 81, away: 82 },
  { matchNo: 95, home: 86, away: 88 },
  { matchNo: 96, home: 85, away: 87 },
  { matchNo: 97, home: 89, away: 90 },
  { matchNo: 98, home: 93, away: 94 },
  { matchNo: 99, home: 91, away: 92 },
  { matchNo: 100, home: 95, away: 96 },
  { matchNo: 101, home: 97, away: 98 },
  { matchNo: 102, home: 99, away: 100 },
  { matchNo: 104, home: 101, away: 102 },
];

export const WC_2026_THIRD_PLACE_MATCH_NO = 103;
export const WC_2026_THIRD_PLACE_FEEDERS = { home: 101, away: 102 };

export const BRACKET_CARD_H = 62;
export const BRACKET_MIN_SLOT_GAP = 7;

export const ROUND_FIRST_MATCH_NO = [73, 89, 97, 101, 104];
export const ROUND_MATCH_COUNTS = [16, 8, 4, 2, 1];

/**
 * FIFA hub bracket display order (top → bottom per column).
 * R32 pairs are adjacent so sequential connectors match official feeders.
 */
export const FIFA_BRACKET_VISUAL_ORDER = [
  [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87],
  [89, 90, 93, 94, 91, 92, 95, 96],
  [97, 98, 99, 100],
  [101, 102],
  [104],
];

const ROUND_BY_MATCH_NO = [
  { round: "Round of 32", min: 73, max: 88 },
  { round: "Round of 16", min: 89, max: 96 },
  { round: "Quarter-finals", min: 97, max: 100 },
  { round: "Semi-finals", min: 101, max: 102 },
  { round: "Final", min: 104, max: 104 },
  { round: THIRD_PLACE_ROUND, min: 103, max: 103 },
];

export function createKnockoutMatchId(round, index) {
  return `${round.replace(/\s+/g, "-").toLowerCase()}-${index}`;
}

/** @param {number} matchNo */
export function matchNoToRoundAndIndex(matchNo) {
  for (const entry of ROUND_BY_MATCH_NO) {
    if (matchNo >= entry.min && matchNo <= entry.max) {
      return { round: entry.round, index: matchNo - entry.min };
    }
  }
  return null;
}

/** @param {number} matchNo */
export function matchNoToKnockoutId(matchNo) {
  const position = matchNoToRoundAndIndex(matchNo);
  if (!position) return null;
  return createKnockoutMatchId(position.round, position.index);
}

/** @param {number} index R32 array index (0–15) → FIFA match 73–88 */
export function r32IndexToMatchNo(index) {
  return 73 + index;
}

/** All FIFA match numbers for a knockout round column. */
export function matchNumbersForRound(roundName) {
  const roundIndex = KNOCKOUT_ROUNDS.indexOf(roundName);
  if (roundIndex < 0) return [];

  const first = ROUND_FIRST_MATCH_NO[roundIndex];
  const count = ROUND_MATCH_COUNTS[roundIndex];
  return Array.from({ length: count }, (_, index) => first + index);
}

/** Match numbers in FIFA bracket-tree order for a round column. */
export function matchNumbersInVisualOrder(roundName) {
  const roundIndex = KNOCKOUT_ROUNDS.indexOf(roundName);
  if (roundIndex < 0) return [];
  return FIFA_BRACKET_VISUAL_ORDER[roundIndex] ?? matchNumbersForRound(roundName);
}

/** Feeder refs for display (e.g. "W73 vs W75"). */
export function feederLabelForMatchNo(matchNo) {
  const rule = WC_2026_KNOCKOUT_ADVANCEMENT.find((entry) => entry.matchNo === matchNo);
  if (!rule) return null;
  return `W${rule.home} vs W${rule.away}`;
}

/** Normalize W/L feeder codes (e.g. w101 → W101). */
export function formatBracketRef(ref) {
  const winnerOrLoser = ref.match(/^([WL])(\d+)$/i);
  if (winnerOrLoser) {
    return `${winnerOrLoser[1].toUpperCase()}${winnerOrLoser[2]}`;
  }

  return ref;
}

/** Home/away feeder refs for a FIFA match number. */
export function feederRefsForMatchNo(matchNo, raw) {
  const home = raw?.homeRef ?? null;
  const away = raw?.awayRef ?? null;

  if (home && away) {
    return { home, away };
  }

  if (matchNo === WC_2026_THIRD_PLACE_MATCH_NO) {
    return {
      home: home ?? `L${WC_2026_THIRD_PLACE_FEEDERS.home}`,
      away: away ?? `L${WC_2026_THIRD_PLACE_FEEDERS.away}`,
    };
  }

  const rule = WC_2026_KNOCKOUT_ADVANCEMENT.find((entry) => entry.matchNo === matchNo);
  if (!rule) return { home, away };

  return {
    home: home ?? `W${rule.home}`,
    away: away ?? `W${rule.away}`,
  };
}

/** Use feeder ref when team is still TBD. */
export function resolveBracketTeamDisplay(team, ref) {
  if (team?.name && !isPlaceholderTeamName(team.name)) {
    return { ...team, isRef: false };
  }

  if (ref) {
    return { name: formatBracketRef(ref), logo: null, isRef: true };
  }

  return { name: "TBD", logo: null, isRef: false };
}

function isPlaceholderTeamName(name) {
  return !name || name === "TBD" || FEEDER_REF_PATTERN.test(name.trim());
}

/**
 * FIFA bracket Y positions keyed by match number.
 * R32 uses official visual order; later rounds use feeder midpoints.
 */
export function computeYByMatchNo(cardH, gap) {
  const step = cardH + gap;
  /** @type {Map<number, number>} */
  const yByMatchNo = new Map();

  for (const [index, matchNo] of FIFA_BRACKET_VISUAL_ORDER[0].entries()) {
    yByMatchNo.set(matchNo, index * step);
  }

  for (const rule of WC_2026_KNOCKOUT_ADVANCEMENT) {
    const feederHomeY = yByMatchNo.get(rule.home);
    const feederAwayY = yByMatchNo.get(rule.away);
    if (feederHomeY === undefined || feederAwayY === undefined) continue;
    yByMatchNo.set(rule.matchNo, (feederHomeY + feederAwayY) / 2);
  }

  return yByMatchNo;
}

function roundHasOverlaps(yByMatchNo, roundIndex, cardH, minGap) {
  const first = ROUND_FIRST_MATCH_NO[roundIndex];
  const count = ROUND_MATCH_COUNTS[roundIndex];
  const tops = [];

  for (let slot = 0; slot < count; slot += 1) {
    const top = yByMatchNo.get(first + slot);
    if (top !== undefined) tops.push(top);
  }

  tops.sort((a, b) => a - b);

  for (let i = 1; i < tops.length; i += 1) {
    if (tops[i] - tops[i - 1] < cardH + minGap) {
      return true;
    }
  }

  return false;
}

function hasAnyColumnOverlaps(yByMatchNo, cardH, minGap) {
  for (let roundIndex = 0; roundIndex < KNOCKOUT_ROUNDS.length; roundIndex += 1) {
    if (roundHasOverlaps(yByMatchNo, roundIndex, cardH, minGap)) {
      return true;
    }
  }
  return false;
}

/** Smallest R32 gap that keeps FIFA midpoints without card overlap. */
export function findMinimumR32Gap(
  cardH = BRACKET_CARD_H,
  minGap = BRACKET_MIN_SLOT_GAP,
) {
  for (let gap = minGap; gap <= 128; gap += 4) {
    const yByMatchNo = computeYByMatchNo(cardH, gap);
    if (!hasAnyColumnOverlaps(yByMatchNo, cardH, minGap)) {
      return gap;
    }
  }

  return 48;
}

/**
 * Full hub bracket layout from FIFA match numbers only.
 * @returns {{ yByMatchNo: Map<number, number>, gap: number, cardH: number, connectorsByRound: object[] }}
 */
export function buildBracketLayout(cardH = BRACKET_CARD_H) {
  const gap = findMinimumR32Gap(cardH, BRACKET_MIN_SLOT_GAP);
  const yByMatchNo = computeYByMatchNo(cardH, gap);
  const connectorsByRound = buildConnectorsByMatchNo(yByMatchNo, cardH);

  return { yByMatchNo, gap, cardH, connectorsByRound };
}

/**
 * Connector segments grouped by source round index (0 = from R32, etc.).
 * Uses FIFA visual order so adjacent pairs feed the next column cleanly.
 */
export function buildConnectorsByMatchNo(yByMatchNo, cardH = BRACKET_CARD_H) {
  const grouped = Array.from({ length: KNOCKOUT_ROUNDS.length - 1 }, () => []);

  for (let roundIndex = 0; roundIndex < KNOCKOUT_ROUNDS.length - 1; roundIndex += 1) {
    const sourceOrder = FIFA_BRACKET_VISUAL_ORDER[roundIndex];
    const targetOrder = FIFA_BRACKET_VISUAL_ORDER[roundIndex + 1];
    const links = [];

    for (let slot = 0; slot < targetOrder.length; slot += 1) {
      const feederHome = sourceOrder[slot * 2];
      const feederAway = sourceOrder[slot * 2 + 1];
      const matchNo = targetOrder[slot];
      const yHome = yByMatchNo.get(feederHome);
      const yAway = yByMatchNo.get(feederAway);
      const yTarget = yByMatchNo.get(matchNo);

      if (yHome === undefined || yAway === undefined || yTarget === undefined) {
        continue;
      }

      links.push({
        matchNo,
        feederHome,
        feederAway,
        yA: yHome + cardH / 2,
        yB: yAway + cardH / 2,
        yTarget: yTarget + cardH / 2,
        yJoint: (yHome + yAway + cardH) / 2,
      });
    }

    grouped[roundIndex] = links;
  }

  return grouped;
}

/** @deprecated Use buildBracketLayout — kept for callers expecting geometry arrays */
export function buildOfficialBracketGeometry(
  firstRoundCount = 16,
  cardH = BRACKET_CARD_H,
) {
  const { yByMatchNo } = buildBracketLayout(cardH);
  return KNOCKOUT_ROUNDS.map((roundName) =>
    matchNumbersInVisualOrder(roundName).map(
      (matchNo) => yByMatchNo.get(matchNo) ?? 0,
    ),
  );
}

/** @deprecated Use buildBracketLayout */
export function buildOfficialBracketConnectors(geometry, cardH = BRACKET_CARD_H) {
  const yByMatchNo = new Map();
  KNOCKOUT_ROUNDS.forEach((roundName, roundIndex) => {
    matchNumbersForRound(roundName).forEach((matchNo, slot) => {
      yByMatchNo.set(matchNo, geometry[roundIndex]?.[slot] ?? 0);
    });
  });
  return buildConnectorsByMatchNo(yByMatchNo, cardH);
}

function buildWinnerFeedMap() {
  /** @type {Map<number, number[]>} */
  const map = new Map();

  for (const rule of WC_2026_KNOCKOUT_ADVANCEMENT) {
    for (const feeder of [rule.home, rule.away]) {
      if (!map.has(feeder)) map.set(feeder, []);
      map.get(feeder).push(rule.matchNo);
    }
  }

  return map;
}

const WINNER_FEED_MAP = buildWinnerFeedMap();

export function getTransitiveWinnerDownstream(matchNo) {
  const downstream = new Set();
  const queue = [...(WINNER_FEED_MAP.get(matchNo) ?? [])];

  while (queue.length) {
    const next = queue.pop();
    if (downstream.has(next)) continue;
    downstream.add(next);
    queue.push(...(WINNER_FEED_MAP.get(next) ?? []));
  }

  if (
    matchNo === WC_2026_THIRD_PLACE_FEEDERS.home ||
    matchNo === WC_2026_THIRD_PLACE_FEEDERS.away
  ) {
    downstream.add(WC_2026_THIRD_PLACE_MATCH_NO);
  }

  return [...downstream];
}

export function getDownstreamKnockoutIds(matchNo) {
  const ids = getTransitiveWinnerDownstream(matchNo)
    .map((no) => matchNoToKnockoutId(no))
    .filter(Boolean);

  if (
    matchNo === WC_2026_THIRD_PLACE_FEEDERS.home ||
    matchNo === WC_2026_THIRD_PLACE_FEEDERS.away
  ) {
    ids.push(createKnockoutMatchId(THIRD_PLACE_ROUND, 0));
  }

  return ids;
}

export function getAdvancementRounds() {
  return KNOCKOUT_ROUNDS.filter((round) => round !== "Round of 32");
}
