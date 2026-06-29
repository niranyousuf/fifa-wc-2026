/** Client-safe World Cup constants (no Node.js APIs). */

export const WC_YEAR = Number(process.env.WC_YEAR) || 2026;

export const KNOCKOUT_ROUNDS = [
  "Round of 32",
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "Final",
];

export const THIRD_PLACE_ROUND = "Third-place play-off";
