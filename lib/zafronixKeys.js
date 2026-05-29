import "server-only";

/** @type {Map<number, number>} key index → exhausted-until timestamp */
const exhaustedUntil = new Map();

const MAX_EXHAUST_MS = 24 * 60 * 60 * 1000;
const DEFAULT_EXHAUST_MS = 60 * 60 * 1000;

export function getZafronixApiKeys() {
  const keys = [];

  if (process.env.ZAFRONIX_API_KEYS) {
    for (const part of process.env.ZAFRONIX_API_KEYS.split(",")) {
      const trimmed = part.trim();
      if (trimmed) keys.push(trimmed);
    }
  }

  const primary = process.env.ZAFRONIX_API_KEY?.trim();
  if (primary && !keys.includes(primary)) {
    keys.unshift(primary);
  }

  return [...new Set(keys)];
}

function isKeyExhausted(index) {
  const until = exhaustedUntil.get(index);
  if (!until) return false;
  if (Date.now() >= until) {
    exhaustedUntil.delete(index);
    return false;
  }
  return true;
}

export function markZafronixKeyExhausted(index, retryAfterHeader) {
  const parsed = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : NaN;
  const ms = Number.isFinite(parsed)
    ? Math.min(parsed * 1000, MAX_EXHAUST_MS)
    : DEFAULT_EXHAUST_MS;

  exhaustedUntil.set(index, Date.now() + ms);
}

export function getActiveZafronixKeyIndices(keys) {
  return keys.map((_, index) => index).filter((index) => !isKeyExhausted(index));
}
