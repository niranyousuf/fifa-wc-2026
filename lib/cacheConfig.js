import { WC_YEAR } from "@/lib/wcConstants";

/** Must match page `export const revalidate` (Next.js requires a static literal there). */
export const CACHE_REVALIDATE_SECONDS = 24 * 60 * 60;

/** Disk fallback when API fails (e.g. 429), even if older than fresh window. */
export const CACHE_MAX_STALE_MS = 7 * 24 * 60 * 60 * 1000;

/** Core tournament endpoints stored under data/api-cache/{folder}/. */
export const CORE_API_CACHE_PATHS = [
  `/teams?tournament=${WC_YEAR}`,
  `/standings?year=${WC_YEAR}`,
  `/matches?year=${WC_YEAR}`,
];
